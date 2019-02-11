import { test } from "@oclif/test";

import { Deploy } from "../../src/api/services/deploy";
import * as MockHelper from "../helpers/mock-helper";
import { STACKPATH_HOST } from "../../src/api/constants";

describe("service deploy", () => {
  before(() => {
    MockHelper.mockFileSystem();
  });

  after(() => {
    MockHelper.restoreFileSystem();
  });

  test
    .nock(STACKPATH_HOST, MockHelper.mockDeployPost())
    .nock(STACKPATH_HOST, MockHelper.mockDeployPatch())
    .it("should deploy scripts", async () => {
      const deploy = new Deploy();
      await deploy.deployScripts();
    });
});
