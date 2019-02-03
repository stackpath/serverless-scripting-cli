import cliUx from "cli-ux";

/*
 * Namespace performing all logging tasks.
 */
/**
 * Logs to output when verbose logging enabled.
 * @param {string} log - The string that needs to be logged to the output.
 */
export function logVerbose(log: string) {
  if (process.env.STACKPATH_LOG_LEVEL === LogLevel.VERBOSE) {
    cliUx.log(log);
  }
}

/**
 * Logs error to output and prompts user to continue or not.
 * @param {string} log - The string that needs to be logged to the output.
 */
export async function logError(log: string) {
  cliUx.log(log);
  if (!!!process.env.STACKPATH_FORCE) {
    const continueProcess = await cliUx.prompt(
      `An error has occurred (${log}). Continue? y/n`
    );

    if (continueProcess !== "y") {
      cliUx.log("Exiting...");
      process.exit(1);
    }
  }
}

export enum LogLevel {
  VERBOSE = "verbose",
  INFO = "info"
}
