import { pathFiller } from "../src/utils/fs";
import { describe, it, expect } from "vitest";

/** Generated with Github Copilot
 *  Option to "steal" code has been disabled
 */
describe("pathFiller", () => {
  it("should replace {localeDefinitions} in the path", () => {
    const path = "/{localeDefinitions}/en-US.ts";
    const matcher = {
      exp: /\{localeDefinitions\}/g,
      value: "config/locales",
    };
    const expectedPath = "/config/locales/en-US.ts";
    expect(pathFiller(path, matcher)).toBe(expectedPath);
  });

  it("should replace a single matcher in the path", () => {
    const path = "{localeDefinitionsPath}/file.txt";
    const matcher = {
      exp: /{localeDefinitionsPath}/g,
      value: "locales/definitions",
    };
    const result = pathFiller(path, matcher);
    expect(result).toBe("locales/definitions/file.txt");
  });

  it("should replace a single matcher in the path multiple times", () => {
    const path = "{localeDefinitionsPath}/{localeDefinitionsPath}/file.txt";
    const matcher = {
      exp: /{localeDefinitionsPath}/g,
      value: "locales/definitions",
    };
    const result = pathFiller(path, matcher);
    expect(result).toBe("locales/definitions/locales/definitions/file.txt");
  });

  it("should replace multiple matchers in the path", () => {
    const path = "{localeDefinitionsPath}/{localeDir}/file.txt";
    const matchers = [
      { exp: /{localeDefinitionsPath}/g, value: "locales/definitions" },
      { exp: /{localeDir}/g, value: "en-US" },
    ];
    const result = pathFiller(path, matchers);
    expect(result).toBe("locales/definitions/en-US/file.txt");
  });

  it("should handle paths without matchers", () => {
    const path = "locales/definitions/en-US/file.txt";
    const matcher = {
      exp: /{localeDefinitionsPath}/g,
      value: "locales/definitions",
    };
    const result = pathFiller(path, matcher);
    expect(result).toBe(path);
  });

  it("should handle empty paths", () => {
    const path = "";
    const matcher = {
      exp: /{localeDefinitionsPath}/g,
      value: "locales/definitions",
    };
    const result = pathFiller(path, matcher);
    expect(result).toBe(path);
  });
});
