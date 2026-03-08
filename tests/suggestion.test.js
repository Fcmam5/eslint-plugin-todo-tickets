/* globals describe, it, expect, jest */
const { createPlaceholderSuggestion } = require("../src/suggestion");

describe("suggestion helper", () => {
  const baseComment = {
    value: "TODO missing ticket",
    type: "Line",
    range: [0, 10],
  };

  it("returns null when keyword is missing", () => {
    const suggestion = createPlaceholderSuggestion({
      comment: baseComment,
      lineNumber: 0,
      line: "NOTE nothing",
      keyword: "TODO",
      placeholderTicket: "ABC-123",
    });

    expect(suggestion).toBeNull();
  });

  it("inserts ticket before colon and applies fixer", () => {
    const comment = {
      ...baseComment,
      value: "TODO: missing ticket",
    };

    const suggestion = createPlaceholderSuggestion({
      comment,
      lineNumber: 0,
      line: "TODO: missing ticket",
      keyword: "TODO",
      placeholderTicket: "ABC-123",
    });

    expect(typeof suggestion).toBe("function");

    const replaceTextRange = jest.fn();
    suggestion({ replaceTextRange });

    expect(replaceTextRange).toHaveBeenCalledWith(
      comment.range,
      "//TODO ABC-123: missing ticket",
    );
  });

  it("adds colon when absent", () => {
    const comment = {
      ...baseComment,
      value: "TODO missing colon",
    };

    const suggestion = createPlaceholderSuggestion({
      comment,
      lineNumber: 0,
      line: "TODO missing colon",
      keyword: "TODO",
      placeholderTicket: "ABC-123",
    });

    const replaceTextRange = jest.fn();
    suggestion({ replaceTextRange });

    expect(replaceTextRange).toHaveBeenCalledWith(
      comment.range,
      "//TODO ABC-123: missing colon",
    );
  });

  it("updates multiline block comments preserving formatting", () => {
    const comment = {
      value: "TODO first line\nTODO needs ticket",
      type: "Block",
      range: [5, 42],
    };

    const suggestion = createPlaceholderSuggestion({
      comment,
      lineNumber: 1,
      line: "TODO needs ticket",
      keyword: "TODO",
      placeholderTicket: "ABC-123",
    });

    expect(typeof suggestion).toBe("function");

    const replaceTextRange = jest.fn();
    suggestion({ replaceTextRange });

    expect(replaceTextRange).toHaveBeenCalledWith(
      comment.range,
      "/*TODO first line\nTODO ABC-123: needs ticket*/",
    );
  });
});
