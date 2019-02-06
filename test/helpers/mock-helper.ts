// tslint:disable newline-per-chained-call no-implicit-dependencies no-empty prefer-type-cast no-string-literal

import * as fs from "fs";
import * as os from "os";
import * as sinon from "sinon";
import { FancyTypes } from "@oclif/test";

import {
  STACKPATH_CREDENTIALSFILE_PATH,
  STACKPATH_CONFIGFILE_PATH
} from "../../src/api/constants";

/*
 * Namespace for mocking in the test environment.
 */
export namespace MockHelper {
  const deployResponse = {
    script: {
      id: "1",
      stackId: "2",
      siteId: "3",
      name: "Test",
      version: "1",
      code:
        "Y29uc29sZS5sb2coIlRoaXMgaXMgYSB0ZXN0IHNjcmlwdCBmb3IgU3RhY2tQYXRoIik7",
      paths: ["test/*"],
      createdAt: "1970-01-01T00:00:00.000000Z",
      updatedAt: "1970-01-01T00:00:00.000000Z"
    }
  };

  export const mockAuth = (optionally: boolean = true) => (
    api: FancyTypes.NockScope
  ) => {
    let call = api.post("/identity/v1/oauth2/token");
    if (optionally) {
      call = call.optionally();
    }

    return call.reply(200, {
      access_token: "test_access_token",
      token_type: "bearer",
      expires_in: 3600
    });
  };

  export const mockDeployPost = (optionally: boolean = true) => (
    api: FancyTypes.NockScope
  ) => {
    let call = api.post("/cdn/v1/stacks/1/sites/2/scripts");
    if (optionally) {
      call = call.optionally();
    }

    return call.reply(200, deployResponse);
  };

  export const mockDeployPatch = (optionally: boolean = true) => (
    api: FancyTypes.NockScope
  ) => {
    let call = api.patch("/cdn/v1/stacks/1/sites/2/scripts/3");
    if (optionally) {
      call = call.optionally();
    }

    return call.reply(200, deployResponse);
  };

  export const mockHttpError = (optionally: boolean = true) => (
    api: FancyTypes.NockScope
  ) => {
    let call = api.post("/error");
    if (optionally) {
      call = call.optionally();
    }
    return call.reply(500, { message: "Internal Server Error" });
  };

  export const mockFileSystem = () => {
    sinon.stub(fs, "writeFileSync").callsFake(() => {});
    sinon.stub(fs, "chmodSync").callsFake(() => {});

    sinon.stub(fs, "readFileSync");
    (fs.readFileSync as sinon.SinonStub)
      .withArgs(`${os.homedir()}/${STACKPATH_CREDENTIALSFILE_PATH}`, "utf8")
      .callsFake(() => {
        return '{"client_id":"test","client_secret":"test","access_token":"test_access_token","access_token_expiry":0}';
      });

    (fs.readFileSync as sinon.SinonStub)
      .withArgs(`${process.cwd()}/${STACKPATH_CONFIGFILE_PATH}`, "utf8")
      .callsFake(() => {
        return `{
                "stack_id": "1",
                "site_id": "2",
                "scripts": [
                    {
                        "name": "Test script",
                        "paths": [
                            "test/*"
                        ],
                        "file": "edgeengine/test.js",
                        "id": "3"
                    }, {
                        "name": "New test script",
                        "paths": [
                            "new_test/*"
                        ],
                        "file": "edgeengine/new_test.js"
                    }
                ]
            }`;
      });

    (fs.readFileSync as sinon.SinonStub)
      .withArgs(`${process.cwd()}/edgeengine/test.js`, "utf8")
      .callsFake(() => {
        return `console.log("This is a StackPath test script.");`;
      });

    (fs.readFileSync as sinon.SinonStub)
      .withArgs(`${process.cwd()}/edgeengine/new_test.js`, "utf8")
      .callsFake(() => {
        return `console.log("This is a StackPath test script.");`;
      });

    (fs.readFileSync as sinon.SinonStub).callThrough();

    sinon.stub(fs, "existsSync");

    (fs.existsSync as sinon.SinonStub)
      .withArgs(`${os.homedir()}/${STACKPATH_CREDENTIALSFILE_PATH}`)
      .callsFake(() => {
        return true;
      });

    (fs.existsSync as sinon.SinonStub)
      .withArgs(`${process.cwd()}/${STACKPATH_CONFIGFILE_PATH}`)
      .callsFake(() => {
        return true;
      });
    (fs.existsSync as sinon.SinonStub)
      .withArgs(`${process.cwd()}/edgeengine/test.js`)
      .callsFake(() => {
        return true;
      });
    (fs.existsSync as sinon.SinonStub)
      .withArgs(`${process.cwd()}/edgeengine/new_test.js`)
      .callsFake(() => {
        return true;
      });
    (fs.existsSync as sinon.SinonStub).callThrough();
  };

  export const restoreFileSystem = () => {
    if (typeof (fs.writeFileSync as any)["restore"] === "function") {
      (fs.writeFileSync as sinon.SinonStub)["restore"]();
    }
    if (typeof (fs.readFileSync as any)["restore"] === "function") {
      (fs.readFileSync as sinon.SinonStub)["restore"]();
    }
    if (typeof (fs.existsSync as any)["restore"] === "function") {
      (fs.existsSync as sinon.SinonStub)["restore"]();
    }
    if (typeof (fs.chmodSync as any)["restore"] === "function") {
      (fs.chmodSync as sinon.SinonStub)["restore"]();
    }
  };
}
