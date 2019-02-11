import * as fs from "fs";
import * as os from "os";
import cliUx from "cli-ux";
import { ICredentials } from "../interfaces";
import {
  STACKPATH_CREDENTIALSFILE_PATH,
  STACKPATH_CREDENTIALS_HOME
} from "../constants";
import * as Http from "./http";
import * as Log from "./log";

/**
 * Returns configuration from the credentials file.
 * @returns The contents of the credentials file if exists.
 */
export function getCredentials(): ICredentials {
  let credentialsFileContents;

  try {
    credentialsFileContents = fs.readFileSync(
      `${os.homedir()}/${STACKPATH_CREDENTIALSFILE_PATH}`,
      "utf8"
    );
  } catch (err) {
    throw new Error(
      "The StackPath CLI credentials file does not exist yet. Run `edgeengine auth` to create this."
    );
  }

  return JSON.parse(credentialsFileContents);
}

/**
 * Saves the credentials file to disk.
 * @param credentials - The credential object that needs to be saved to disk.
 */
export function saveCredentials(credentials: ICredentials): void {
  fs.writeFileSync(
    `${os.homedir()}/${STACKPATH_CREDENTIALSFILE_PATH}`,
    JSON.stringify(credentials)
  );
  fs.chmodSync(`${os.homedir()}/${STACKPATH_CREDENTIALSFILE_PATH}`, "0600");
}

/**
 * Checks if a credentials file exists.
 * @returns A boolean containing the value if the credentials file exists or not.
 */
export function credentialsFileExists(): boolean {
  return fs.existsSync(`${os.homedir()}/${STACKPATH_CREDENTIALSFILE_PATH}`);
}

/**
 * Creates the path to the credentials file if needed.
 */
export function createCredentialsPathIfNeeded(): void {
  if (!fs.existsSync(`${os.homedir()}/${STACKPATH_CREDENTIALS_HOME}`)) {
    Log.logVerbose(
      `${os.homedir()}/${STACKPATH_CREDENTIALS_HOME} does not exist. Creating directory.`
    );
    fs.mkdirSync(`${os.homedir()}/${STACKPATH_CREDENTIALS_HOME}`);
  }
}

/**
 * Gets an Access token from StackPath and save it to disk and returns it.
 * @returns {Promise<string>} - The access_token that was the result of the oauth2 exchange.
 */
export async function getAccessToken(): Promise<string> {
  const credentials = getCredentials();

  const response = await Http.request("POST", "/identity/v1/oauth2/token", {
    client_id: credentials.client_id,
    client_secret: credentials.client_secret,
    grant_type: "client_credentials"
  });

  const body = await response.json();

  // Exit if cannot retrieve an access token
  if (!response.ok) {
    cliUx.log(
      `An error occurred trying to retrieve an access token: ${body.message}`
    );
    process.exit(1);
  }

  credentials.access_token = body.access_token;
  credentials.access_token_expiry =
    Math.round(new Date().getTime() / 1000) + body.expires_in;

  saveCredentials(credentials);

  return body.access_token;
}

/**
 * Check if current Access token is expired.
 * @returns {Promise<boolean>} If true, the token has expired.
 */
export async function isAccessTokenExpired(): Promise<boolean> {
  const credentials = getCredentials();

  return credentials.access_token && credentials.access_token_expiry
    ? credentials.access_token_expiry < Math.round(new Date().getTime() / 1000)
    : true;
}
