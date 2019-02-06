import { expect, test } from "@oclif/test";

import {
  getAccessToken,
  getCredentials,
  saveCredentials,
  credentialsFileExists,
  isAccessTokenExpired
} from "../../src/api/services/auth";
import { MockHelper } from "../helpers/mock-helper";
import { STACKPATH_HOST } from "../../src/api/constants";

describe("service auth", () => {
  before(() => {
    MockHelper.mockFileSystem();
  });

  after(() => {
    MockHelper.restoreFileSystem();
  });

  test.it("should get a file that contains credentials", () => {
    const credentials = getCredentials();
    expect(credentials).to.have.property("client_id");
    expect(credentials).to.have.property("client_secret");
    expect(credentials).to.have.property("access_token");
    expect(credentials).to.have.property("access_token_expiry");
  });

  test.it("should save a file that contains credentials", () => {
    let credentials = getCredentials();
    saveCredentials(credentials);
    credentials = getCredentials();
    expect(credentials).to.have.property("client_id");
    expect(credentials).to.have.property("client_secret");
    expect(credentials).to.have.property("access_token");
    expect(credentials).to.have.property("access_token_expiry");
  });

  test.it("should check if a credentials file exists", () => {
    let credentials = getCredentials();
    saveCredentials(credentials);
    expect(credentialsFileExists()).to.equal(true);
  });

  test
    .nock(STACKPATH_HOST, MockHelper.mockAuth())
    .it("should check if it obtains an access token", async () => {
      const result = await getAccessToken();
      expect(result).to.equal("test_access_token");
    });

  test.it("should check if the test access token is expired", async () => {
    const isExpired = await isAccessTokenExpired();
    expect(isExpired).to.equal(true);
  });
});
