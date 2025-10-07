const { RuleTester } = require("eslint");
const plugin = require("../src/index.js");

const rule = plugin.rules["todo-tickets"];

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: { ecmaVersion: 2015, sourceType: "module" },
  },
});

ruleTester.run("todo-tickets", rule, {
  valid: [
    { code: "// TODO ABC-123: Fix this issue" },
    { code: "// FIXME #42: Something to fix" },
    { code: "/* BUG ASMO-42: Important bug */" },
    { code: "// HACK MCO-123: Temporary solution" },
    { code: "// todo ABC-123: lower case todo" },
    { code: "// TODO ABC-123: Some description" },
    { code: "// Just a regular comment" },
    {
      code: "/* Multi-line comment\n   with TODO ABC-123: valid todo */",
    },
    { code: "// TODO ABC-123: Some description", options: [] },
    {
      code: "// TODO CUSTOM-123: Custom pattern",
      options: [{ ticketPatterns: ["CUSTOM-\\d+"] }],
    },
    {
      code: "// CUSTOM-TAG CUSTOM-123: Custom keyword",
      options: [
        {
          keywords: ["CUSTOM-TAG"],
          ticketPatterns: ["CUSTOM-\\d+"],
        },
      ],
    },
  ],
  invalid: [
    {
      code: "// TODO: Missing ticket",
      errors: [
        {
          message: /must be followed by a valid ticket number/,
        },
      ],
    },
    {
      code: "// FIXME: No ticket here",
      errors: [
        {
          message: /must be followed by a valid ticket number/,
        },
      ],
    },
    {
      code: "// TODO INVALID-TICKET: Invalid format",
      errors: [
        {
          message: /must be followed by a valid ticket number/,
        },
      ],
    },
    {
      code: "// TODO ABC-123",
      options: [{ ticketPatterns: ["#\\d+"] }],
      errors: [
        {
          message: /must be followed by a valid ticket number/,
        },
      ],
    },
  ],
});
