import { expect, test } from "@oclif/test";
import cliUx from "cli-ux";
import * as sinon from "sinon";

import { STACKPATH_HOST } from "../../src/api/constants";
import { MockHelper } from "../helpers/mock-helper";
import * as Auth from "../../src/api/services/auth";

describe("command auth", () => {
  before(() => {
    MockHelper.mockFileSystem();
    sinon.stub(Auth, "getAccessToken");
  });

  after(() => {
    MockHelper.restoreFileSystem();
    (Auth.getAccessToken as sinon.SinonStub).restore();
  });

  test
    .nock(STACKPATH_HOST, MockHelper.mockAuth())
    .stdout()
    .command(["auth", "-f", "-c test", "-s test"])
    .it(
      "returns no error if succesful login credentials have been provided",
      ctx => {
        expect(ctx.stdout).to.eq("Your credentials have been configured.\n");
        expect((Auth.getAccessToken as any).calledOnce).to.equal(true);
      }
    );

  let promptCounter = 0;
  test
    .nock(STACKPATH_HOST, MockHelper.mockAuth())
    .stdout()
    .stub(cliUx, "prompt", (_: any) => {
      return async (b: any) => {
        switch (promptCounter) {
          case 0: {
            expect(b).to.be.eq("StackPath Client ID");
            promptCounter++;
            break;
          }
          case 1: {
            expect(b).to.be.eq("StackPath Client Secret");
            promptCounter++;
            break;
          }
        }
        return "test";
      };
    })
    .command(["auth", "-f"])
    .it("should prompt for StackPath Client ID and Secret when not provided");
});
