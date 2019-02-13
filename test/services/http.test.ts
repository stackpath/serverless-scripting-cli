import { expect, test } from "@oclif/test";

import * as fs from "fs";
import * as os from "os";
import * as MockHelper from "../helpers/mock-helper";
import {
  STACKPATH_HOST,
  STACKPATH_CREDENTIALSFILE_PATH
} from "../../src/api/constants";
import { request } from "../../src/api/services/http";
import {
  credentialsFileExists,
  saveCredentials
} from "../../src/api/services/auth";

describe("service http", () => {
  // Use a mock credentials file if one doesn't already exist.
  if (!credentialsFileExists()) {
    beforeEach(() => {
      saveCredentials({
        client_id: "some client id",
        client_secret: "some client secret",
        access_token: "some access token",
        access_token_expiry: 1234
      });
    });

    afterEach(() => {
      fs.unlinkSync(`${os.homedir()}/${STACKPATH_CREDENTIALSFILE_PATH}`);
    });
  }

  test
    .nock(STACKPATH_HOST, MockHelper.mockDeployPost(false))
    .it("should perform an http post call", async () => {
      await request("POST", `/cdn/v1/stacks/1/sites/2/scripts`);
    });

  test
    .nock(STACKPATH_HOST, MockHelper.mockDeployPatch(false))
    .it("should perform an http patch call", async () => {
      await request("PATCH", `/cdn/v1/stacks/1/sites/2/scripts/3`);
    });

  test
    .nock(STACKPATH_HOST, MockHelper.mockHttpError(false))
    .it("should not throw an http error", async () => {
      let error: Error | undefined;
      try {
        await request("POST", `/error`, {});
      } catch (e) {
        error = e;
      }
      expect(error).to.be.undefined;
    });
});
