import * as fs from "fs";
import cliUx from "cli-ux";
import { IConfiguration, IConfigurationScript } from "../interfaces";
import { STACKPATH_CONFIGFILE_PATH } from "../constants";
import * as Validation from "./validation";
import * as Http from "./http";
import * as Log from "./log";
import { continueOnErrorPrompt } from "./prompt";

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
      for (let i = 0; i < this.configuration.scripts.length; i++) {
        try {
          const script = this.configuration.scripts[i];
          await this.handleScriptUpload(script, i);
        } catch (e) {
          // Check if user wants to try to update subsequent scripts after an error
          await continueOnErrorPrompt(e);
        }
      }

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

    const siteId = script.site_id || this.configuration.site_id;
    const stackId = script.stack_id || this.configuration.stack_id;
    const scriptId = script.id;

    if (scriptId) {
      Log.logVerbose(
        `Updating script ${script.name} with id ${scriptId} to site ${siteId}.`
      );

      const response = await Http.request(
        "PATCH",
        `/cdn/v1/stacks/${stackId}/sites/${siteId}/scripts/${script.id}`,
        body
      );

      const respBody: ScriptResponse = await response.json();

      if (response.ok && respBody.script) {
        cliUx.log(`Successfully updated script ${script.name}`);
      } else if (response.status === 404 && respBody.code === 5) {
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
          await this.createScript({ script, siteId, body, index });
        } else {
          throw new Error("Operation canceled.");
        }
      } else {
        throw new Error(`Update Script Request failed ${respBody.message}`);
      }
    } else {
      await this.createScript({ script, siteId, body, index });
    }
  }

  private async createScript(options: {
    script: IConfigurationScript;
    siteId: string;
    body: object;
    index: number;
  }) {
    const { script, siteId, body, index } = options;
    Log.logVerbose(`Creating script ${script.name} for site ${siteId}.`);

    const response = await Http.request(
      "POST",
      `/cdn/v1/stacks/${this.configuration.stack_id}/sites/${siteId}/scripts`,
      body
    );
    Log.logVerbose(
      `HTTP Response for script ${script.name}: ${response.status}`
    );

    const respBody: ScriptResponse = await response.json();

    if (!response.ok || !respBody.script) {
      throw new Error(`Failed to create script (${respBody.message})`);
    }
    await this.updateScriptIdInConfig(script, respBody.script.id, index);
  }

  /**
   * Update the id of the script into the configuration object.
   * @param {IConfigurationScript} script - The script that needs to be updated.
   * @param {Response} response - The response that contains the (new) id.
   * @param {number} index - The index of the script.
   */
  private async updateScriptIdInConfig(
    script: IConfigurationScript,
    scriptId: string,
    index: number
  ) {
    Log.logVerbose(
      `Saving id for created script ${script.name} to ${scriptId}`
    );
    this.configuration.scripts[index].id = scriptId;
  }
}

interface ScriptResponse {
  script?: { id: string };
  code?: number;
  message?: string;
}
