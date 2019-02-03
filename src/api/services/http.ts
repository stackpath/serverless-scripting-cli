import nodeFetch from "node-fetch";
import { Response as NodeFetchResponse } from "node-fetch";
import * as Auth from "./auth";
import { STACKPATH_HOST } from "../constants";
import * as Log from "./log";

/**
 * Perform a http call to the server.
 * @param {string} method The http method used to perform the call
 * @param {string} resource - The endpoint relative to the hostname, be sure to prefix with a forward slash '/'.
 * @param [body] - The optional payload that will be sent to the server.
 * @param {boolean} throwErrors - If false, handle the error yourself, timeout errors will still be thrown. Defaults to true.
 * @returns {Promise<Response>} - The response of the server.
 */
export async function request(
  method: string,
  resource: string,
  body?: any,
  throwErrors: boolean = true
): Promise<NodeFetchResponse> {
  try {
    const response = await nodeFetch(`${STACKPATH_HOST}${resource}`, {
      method,
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${Auth.getCredentials().access_token}`
      },
      body: body ? JSON.stringify(body) : undefined
    });

    if (throwErrors) {
      await handleResponseError(response, throwErrors);
    }

    return response;
  } catch (error) {
    throw new Error(
      `An error occurred when connecting to StackPath host ${STACKPATH_HOST}.`
    );
  }
}

/**
 * Handles HTTP response and throws CLI error if needed.
 * @param response {Promise<Response>} - The response from node-fetch.
 * @returns {Promise<boolean>}
 */
export async function handleResponseError(
  response: NodeFetchResponse,
  throwErrors: boolean = true
): Promise<boolean> {
  if (response.status !== 200) {
    const error = await response.clone().json();
    const errorMessage = `${error.message}. Original url ${response.url}`;
    await Log.logError(errorMessage);
    if (throwErrors) {
      throw new Error(errorMessage);
    }

    return false;
  }

  return true;
}
