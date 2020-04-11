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
 * @returns {Promise<Response>} - The response of the server.
 */
export async function request(
  method: string,
  resource: string,
  body?: any
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

    Log.logVerbose(
      `HTTP Request ${method} ${STACKPATH_HOST}${resource} ${response.status}`
    );

    return response;
  } catch (error) {
    throw new Error(
      `An error occurred when connecting to StackPath host ${STACKPATH_HOST}.`
    );
  }
}
