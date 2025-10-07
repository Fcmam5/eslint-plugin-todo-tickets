import todoTickets from "eslint-plugin-todo-tickets";

export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
    },
    plugins: {
      "todo-tickets": todoTickets,
    },
    rules: {
      "todo-tickets/todo-tickets": [
        "error",
        {
          ticketPatterns: [
            "[A-Z]{2,}-\\d+", // JIRA format (e.g., ABC-123)
            "#\\d+", // GitHub format (e.g., #42)
          ],
          keywords: ["TODO", "FIXME", "BUG", "HACK"],
        },
      ],
    },
  },
];
