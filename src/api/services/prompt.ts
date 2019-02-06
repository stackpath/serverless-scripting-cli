import cliUx from "cli-ux";

/**
 * Prompts the user if they want to continue or not after an error.
 * @param {string} log - The string that needs to be logged to the output.
 */
export async function continueOnErrorPrompt(e: any) {
  if (!process.env.STACKPATH_FORCE) {
    const continueProcess = await cliUx.prompt(
      `An error has occurred (${e}). Continue? y/n`
    );

    if (continueProcess !== "y") {
      cliUx.log("Exiting...");
      process.exit(1);
    }
  }
}
