import { expect, test } from "@oclif/test";

import { MockHelper } from "../helpers/mock-helper";
import { STACKPATH_HOST } from "../../src/api/constants";
import { request } from "../../src/api/services/http";

describe("service http", () => {
  test
    .nock(STACKPATH_HOST, MockHelper.mockDeployPost(false))
    .it("should perform a http post call", () => {
      request("POST", `/cdn/v1/stacks/1/sites/2/scripts`);
    });

  test
    .nock(STACKPATH_HOST, MockHelper.mockDeployPatch(false))
    .it("should perform a http patch call", () => {
      request("PATCH", `/cdn/v1/stacks/1/sites/2/scripts/3`);
    });

  test
    .nock(STACKPATH_HOST, MockHelper.mockHttpError(false))
    .it("should throw a http error", async () => {
      try {
        await request("POST", `/error`);
      } catch (e) {
        expect(e).to.exist;
      }
    });

  test
    .nock(STACKPATH_HOST, MockHelper.mockHttpError(false))
    .it("should not throw a http error", async () => {
      try {
        await request("POST", `/error`, {}, false);
      } catch (e) {
        expect(e).to.not.exist;
      }
    });
});
