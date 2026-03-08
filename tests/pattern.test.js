/* globals describe, it, expect */
const { createTodoPattern, createKeywordRegex } = require("../src/pattern");

describe("pattern helpers", () => {
  describe("createTodoPattern", () => {
    it("matches valid keyword, ticket, and description", () => {
      const regex = createTodoPattern(["TODO"], ["ABC-\\d+"]);
      expect(regex.test("TODO ABC-123: Fix this")).toBe(true);
    });

    it("does not match keyword without ticket", () => {
      const regex = createTodoPattern(["TODO"], ["ABC-\\d+"]);
      expect(regex.test("TODO: Missing ticket")).toBe(false);
    });
  });

  describe("createKeywordRegex", () => {
    it("matches configured keywords case-insensitively", () => {
      const regex = createKeywordRegex(["TODO", "FIXME"]);
      const match = regex.exec("   fixme missing ticket");
      expect(match).not.toBeNull();
      expect(match[1]).toBe("fixme");
    });

    it("does not match other words", () => {
      const regex = createKeywordRegex(["TODO"]);
      expect(regex.exec("NOTE something")).toBeNull();
    });
  });
});
