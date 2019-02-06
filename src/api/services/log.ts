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

export enum LogLevel {
  VERBOSE = "verbose",
  INFO = "info"
}
