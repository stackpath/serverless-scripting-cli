import { expect, test } from "@oclif/test";

import * as MockHelper from "../helpers/mock-helper";
import { STACKPATH_HOST } from "../../src/api/constants";
import { request } from "../../src/api/services/http";

describe("service http", () => {
  test
    .nock(STACKPATH_HOST, MockHelper.mockDeployPost(false))
    .it("should perform a http post call", async () => {
      await request("POST", `/cdn/v1/stacks/1/sites/2/scripts`);
    });

  test
    .nock(STACKPATH_HOST, MockHelper.mockDeployPatch(false))
    .it("should perform a http patch call", async () => {
      await request("PATCH", `/cdn/v1/stacks/1/sites/2/scripts/3`);
    });

  test
    .nock(STACKPATH_HOST, MockHelper.mockHttpError(false))
    .it("should not throw a http error", async () => {
      let error = {};
      try {
        await request("POST", `/error`, {});
      } catch (e) {
        error = e;
      }
      expect(error).to.be.a("Error");
    });
});
