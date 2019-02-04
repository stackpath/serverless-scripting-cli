import { Command, flags } from "@oclif/command";
import * as Parser from "@oclif/parser";
import { CLIError } from "@oclif/errors";
import cliUx from "cli-ux";

import * as AuthService from "../api/services/auth";
import * as Log from "../api/services/log";

const LogLevel = Log.LogLevel;

/**
 * Class performing the auth command '$ edgeengine auth'.
 */
export default class Auth extends Command {
  public static description: string =
    "Configures StackPath's authentication details.";

  public static examples: string[] = [`$ edgeengine auth`];

  public static flags: flags.Input<any> = {
    client_id: flags.string({
      char: "c",
      description: "StackPath Client ID used to authenticate with"
    }),
    client_secret: flags.string({
      char: "s",
      description: "StackPath Client Secret used to authenticate with"
    }),
    force: flags.boolean({
      char: "f",
      description:
        "Set this to always overwrite current credential file, defaults to false.",
      default: false
    }),
    help: flags.help({ char: "h" }),
    verbose: flags.boolean({
      char: "v",
      description: "Turns on verbose logging. Defaults to false",
      default: false
    })
  };

  public static args: Parser.args.IArg[] = [];

  private parsedFlags!: Parser.OutputFlags<{ [x: string]: any }>;

  /**
   * Runs CLI command.
   */
  public async run() {
    this.parsedFlags = this.parse(Auth).flags;

    if (!!this.parsedFlags && this.parsedFlags.verbose) {
      process.env.STACKPATH_LOG_LEVEL = LogLevel.VERBOSE || LogLevel.INFO;
    }

    if (!this.parsedFlags.force) {
      Log.logVerbose(`Checking if credentials file exists`);
    }
    if (AuthService.credentialsFileExists() && !this.parsedFlags.force) {
      const overwriteFile = await cliUx.prompt(
        "It seems a credentials file already exists. Continuing will overwrite its values. Continue? y/n"
      );

      if (overwriteFile !== "y") {
        throw new CLIError("Aborting...");
      }
      Log.logVerbose(`Credentials file will be overwritten. Continuing...`);
    }

    const clientID =
      this.parsedFlags.client_id || (await cliUx.prompt("StackPath Client ID"));
    const clientSecret =
      this.parsedFlags.client_secret ||
      (await cliUx.prompt("StackPath Client Secret", {
        type: "hide"
      }));

    AuthService.createCredentialsPathIfNeeded();

    Log.logVerbose(`Saving credentials to disk.`);
    AuthService.saveCredentials({
      client_id: clientID,
      client_secret: clientSecret
    });

    cliUx.action.start("Getting Access token...");

    await AuthService.getAccessToken();

    cliUx.action.stop("Received Access token.");

    this.log("Your credentials have been configured.");
  }
}
