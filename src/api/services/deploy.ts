import * as fs from "fs";
import cliUx from "cli-ux";
import { Response as NodeFetchResponse } from "node-fetch";

import { IConfiguration, IConfigurationScript } from "../interfaces";
import { STACKPATH_CONFIGFILE_PATH } from "../constants";
import * as Validation from "./validation";
import * as Http from "./http";
import * as Log from "./log";

/*
 * Class performing all Deploy tasks.
 */
export class Deploy {
  private configuration!: IConfiguration;
  private force!: boolean;

  /**
   * Deploy all scripts in the configuration file.
   * @param {{ force: boolean }} [options] - The options object.
   */
  public async deployScripts(options?: { force: boolean }) {
    if (options) {
      this.force = options.force || false;
    }

    const workingDirectory = process.cwd();
    const configFile = `${workingDirectory}/${STACKPATH_CONFIGFILE_PATH}`;

    Log.logVerbose(`Checking if ${STACKPATH_CONFIGFILE_PATH} file exists.`);
    if (!fs.existsSync(configFile)) {
      throw new Error(
        `The current directory does not contain the required ${STACKPATH_CONFIGFILE_PATH} file.`
      );
    }
    Log.logVerbose(`${STACKPATH_CONFIGFILE_PATH} file exists!`);

    Log.logVerbose(`Reading ${STACKPATH_CONFIGFILE_PATH} file contents.`);
    const configurationFileContents = fs.readFileSync(configFile, "utf8");

    try {
      Log.logVerbose(`Parsing ${STACKPATH_CONFIGFILE_PATH} file contents.`);
      this.configuration = JSON.parse(configurationFileContents);
    } catch (err) {
      throw new Error("The .edgeengine.json file does not contain valid JSON.");
    }

    // Asserts that the configuration file is valid and can be used.
    Log.logVerbose(`Validating ${STACKPATH_CONFIGFILE_PATH} file contents.`);
    Validation.validateConfiguration(this.configuration);

    cliUx.action.start("Deploying scripts...");

    try {
      await this.configuration.scripts.reduce(
        async (previousPromise, nextScript, index) => {
          await previousPromise;
          return this.handleScriptUpload(nextScript, index);
        },
        Promise.resolve()
      );

      Log.logVerbose(
        `Saving new configuration file to ${STACKPATH_CONFIGFILE_PATH}`
      );
      fs.writeFileSync(
        configFile,
        JSON.stringify(this.configuration, undefined, 4)
      );

      cliUx.action.stop("Deployment completed.");
    } catch (e) {
      cliUx.action.stop(`An error has occurred. ${e}`);
    }
  }

  /**
   * Handles the creation or updating of a script.
   * @param {IConfigurationScript} script - The script that needs to be created or updated.
   * @param {number} index - The index of the script in the scripts array.
   */
  private async handleScriptUpload(
    script: IConfigurationScript,
    index: number
  ) {
    Log.logVerbose(`Reading script ${script.name}.`);
    const scriptContent = fs.readFileSync(
      `${process.cwd()}/${script.file}`,
      "utf8"
    );
    Log.logVerbose(`Converting script ${script.name} contents.`);
    const scriptContentBase64 = Buffer.from(scriptContent).toString("base64");

    const body = {
      name: script.name,
      paths: script.paths,
      code: scriptContentBase64
    };

    const siteId =
      script.hasOwnProperty("site_id") && script.site_id !== ""
        ? script.site_id
        : this.configuration.site_id;
    if (script.hasOwnProperty("id") && script.id !== "") {
      Log.logVerbose(
        `Updating script ${script.name} with id ${script.id} to site ${siteId}.`
      );

      const response = await Http.request(
        "PATCH",
        `/cdn/v1/stacks/${
          this.configuration.stack_id
        }/sites/${siteId}/scripts/${script.id}`,
        body,
        false
      );

      const json = await response.clone().json();

      if (response.status === 404 && json.code === 5) {
        // code 5 means Site script does not exist.
        Log.logVerbose(`Script ${script.name} does not exist (anymore).`);
        let recreateScript = this.force;
        if (!this.force) {
          recreateScript = await cliUx.prompt(
            "It seems your script does not exist (anymore). Recreate? y/n",
            {
              default: "y"
            }
          );
        }
        if (recreateScript) {
          Log.logVerbose(`Will recreate script ${script.name}.`);
          script.id = "";
        } else {
          if (await Http.handleResponseError(response, false)) {
            await this.updateScriptWithResponse(script, response, index);
          } else {
            throw new Error("Operation canceled.");
          }
        }
      } else {
        if (await Http.handleResponseError(response, false)) {
          await this.updateScriptWithResponse(script, response, index);
        } else {
          throw new Error("Operation canceled.");
        }
      }
    }

    if (!script.hasOwnProperty("id") || script.id === "") {
      Log.logVerbose(`Creating script ${script.name} for site ${siteId}.`);

      const response = await Http.request(
        "POST",
        `/cdn/v1/stacks/${this.configuration.stack_id}/sites/${siteId}/scripts`,
        body
      );
      Log.logVerbose(
        `HTTP Response for script ${script.name}: ${response.status}`
      );

      await this.updateScriptWithResponse(script, response, index);
    }
  }

  /**
   * Update the id of the script into the configuration object.
   * @param {IConfigurationScript} script - The script that needs to be updated.
   * @param {Response} response - The response that contains the (new) id.
   * @param {number} index - The index of the script.
   */
  private async updateScriptWithResponse(
    script: IConfigurationScript,
    response: NodeFetchResponse,
    index: number
  ) {
    if (response !== undefined) {
      const json = await response.clone().json();
      if (json) {
        Log.logVerbose(
          `Saving id for created script ${script.name} to ${json.script.id}`
        );
        this.configuration.scripts[index].id = json.script.id;
      }
    }
  }
}
