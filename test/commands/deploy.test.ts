import { expect, test } from "@oclif/test";
import * as sinon from "sinon";

import * as MockHelper from "../helpers/mock-helper";
import { Deploy as DeployService } from "../../src/api/services/deploy";
import { STACKPATH_HOST } from "../../src/api/constants";

describe("command deploy", () => {
  before(() => {
    MockHelper.mockFileSystem();
    sinon.stub(DeployService.prototype, "deployScripts");
  });

  after(() => {
    MockHelper.restoreFileSystem();
    (DeployService.prototype.deployScripts as sinon.SinonStub).restore();
  });

  test
    .nock(STACKPATH_HOST, MockHelper.mockAuth())
    .nock(STACKPATH_HOST, MockHelper.mockDeployPost())
    .nock(STACKPATH_HOST, MockHelper.mockDeployPatch())
    .stdout()
    .command(["deploy", "-f"])
    .it("expects deploy service to be called", _ => {
      expect(
        (DeployService.prototype.deployScripts as any).calledOnce
      ).to.equal(true);
    });
});
