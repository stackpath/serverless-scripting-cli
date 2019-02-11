import { expect } from "chai";

import { validateConfiguration } from "../../src/api/services/validation";
import { IConfiguration, IConfigurationScript } from "../../src/api/interfaces";

const validScripts: IConfigurationScript[] = [
  {
    id: "theid1",
    name: "thename1",
    paths: ["path1", "path2"],
    file: ".gitignore" // File must exist, otherwise fails
  },
  {
    id: "theid2",
    name: "thename2",
    paths: ["path3", "path4"],
    file: ".gitignore", // File must exist, otherwise fails
    site_id: "thesiteid"
  }
];

const validTestConfig: IConfiguration = {
  stack_id: "thestackid",
  site_id: "thesiteid",
  scripts: validScripts
};

const deepCloneArray = (array: any[]) => array.map(x => Object.assign({}, x));

describe("Validation, validateConfiguration", () => {
  it("Should succeed when the configuration is valid", () => {
    expect(() => validateConfiguration(validTestConfig)).to.not.throw();
  });

  it("Should error if stack_id is missing", () => {
    const invalidConfig: any = { ...validTestConfig, stack_id: null };
    expect(() =>
      validateConfiguration(invalidConfig as IConfiguration)
    ).to.throw(/stack_id/);
  });

  it("Should error if stack_id is missing", () => {
    const invalidConfig: any = { ...validTestConfig, site_id: undefined };
    expect(() =>
      validateConfiguration(invalidConfig as IConfiguration)
    ).to.throw(/site_id/);
  });

  it("Should error if scripts is missing", () => {
    const invalidConfig: any = { ...validTestConfig, scripts: undefined };
    expect(() =>
      validateConfiguration(invalidConfig as IConfiguration)
    ).to.throw(/scripts/);
  });

  it("Should error if scripts is not an array", () => {
    const invalidConfig = { ...validTestConfig, scripts: "astring" };
    // @ts-ignore
    expect(() => validateConfiguration(invalidConfig)).to.throw(
      /scripts.*array/
    );
  });

  /*
   * IConfigurationScript testing
   */
  it("Should error if a script name is missing", () => {
    const invalidScripts = deepCloneArray(validScripts);
    invalidScripts[0].name = undefined;
    const invalidConfig = { ...validTestConfig, scripts: invalidScripts };
    expect(() => validateConfiguration(invalidConfig)).to.throw(/script.*name/);
  });

  it("Should error if a script paths property is missing", () => {
    const invalidScripts = deepCloneArray(validScripts);
    invalidScripts[0].paths = undefined;
    const invalidConfig = { ...validTestConfig, scripts: invalidScripts };
    expect(() => validateConfiguration(invalidConfig)).to.throw(
      /script.*paths/
    );
  });

  it("Should error if a script paths property is an empty array", () => {
    const invalidScripts = deepCloneArray(validScripts);
    invalidScripts[0].paths = [];
    const invalidConfig = { ...validTestConfig, scripts: invalidScripts };
    expect(() => validateConfiguration(invalidConfig)).to.throw(
      /script.*at least one path/
    );
  });

  it("Should error if a script file property is undefined", () => {
    const invalidScripts = deepCloneArray(validScripts);
    invalidScripts[0].file = undefined;
    const invalidConfig = { ...validTestConfig, scripts: invalidScripts };
    expect(() => validateConfiguration(invalidConfig)).to.throw(
      /script.*not contain.*its file/
    );
  });

  it("Should error if a script file property is an empty string", () => {
    const invalidScripts = deepCloneArray(validScripts);
    invalidScripts[0].file = "";
    const invalidConfig = { ...validTestConfig, scripts: invalidScripts };
    expect(() => validateConfiguration(invalidConfig)).to.throw(
      /script.*not contain.*its file/
    );
  });

  it("Should error if a script file property points to a non-existing file", () => {
    const invalidScripts = deepCloneArray(validScripts);
    invalidScripts[0].file = "a-very-nonexisting-file.extension";
    const invalidConfig = { ...validTestConfig, scripts: invalidScripts };
    expect(() => validateConfiguration(invalidConfig)).to.throw(
      /file.*not be found/
    );
  });
});
