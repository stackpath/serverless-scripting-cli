import { Command, flags } from "@oclif/command";
import * as Parser from "@oclif/parser";
import cliUx from "cli-ux";

import { Deploy as DeployService } from "../api/services/deploy";
import * as Auth from "../api/services/auth";
import { STACKPATH_CONFIGFILE_PATH } from "../api/constants";
import * as Log from "../api/services/log";

const LogLevel = Log.LogLevel;

/**
 * Class performing the deployment command '$ sp-serverless deploy'.
 */
export default class Deploy extends Command {
  public static description: string = `Deploys the scripts in the working directory according to its ${STACKPATH_CONFIGFILE_PATH} configuration file.`;

  public static examples: string[] = [`$ sp-serverless deploy`];

  public static flags: flags.Input<any> = {
    help: flags.help({ char: "h" }),
    verbose: flags.boolean({
      char: "v",
      description: "Turns on verbose logging. Defaults to false",
      default: false
    }),
    force: flags.boolean({
      char: "f",
      description:
        "Force recreation of scripts if they do not exist. Defaults to false",
      default: false
    }),
    only: flags.string({
      char: "o",
      description:
        'Only deploy the following script named scripts. Comma separated value of script names. Defaults to ""',
      default: ""
    })
  };

  public static args: Parser.args.IArg[] = [];

  private parsedFlags!: Parser.OutputFlags<{ [x: string]: any }>;

  /**
   * Runs CLI command.
   */
  public async run() {
    this.parsedFlags = this.parse(Deploy).flags;

    if (!!this.parsedFlags && this.parsedFlags.verbose) {
      process.env.STACKPATH_LOG_LEVEL = LogLevel.VERBOSE || LogLevel.INFO;
    }
    if (!!this.parsedFlags && this.parsedFlags.force) {
      process.env.STACKPATH_FORCE = this.parsedFlags.force;
    }
    if (!!this.parsedFlags && this.parsedFlags.only) {
      process.env.STACKPATH_ONLY = this.parsedFlags.only;
    }

    Log.logVerbose(`Checking if access token expired?`);

    try {
      if (await Auth.isAccessTokenExpired()) {
        cliUx.action.start("Refreshing access token...");
        await Auth.getAccessToken();
        cliUx.action.stop("Refreshing access token done.");
      } else {
        Log.logVerbose(`Access token is not expired.`);
      }
    } catch (e) {
      cliUx.error(e.message);
    }

    const deploy = new DeployService();
    try {
      await deploy.deployScripts({
        force: Boolean(process.env.STACKPATH_FORCE),
        only:
          typeof process.env.STACKPATH_ONLY === "string"
            ? process.env.STACKPATH_ONLY.split(",")
            : undefined
      });
    } catch (e) {
      cliUx.log(e.message);
    }
  }
}
