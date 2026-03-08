const DEFAULT_TICKET_PATTERNS = [
  // JIRA ticket format (e.g., ABC-123)
  "[A-Z]{2,}-\\d+",
  // GitHub issue format (e.g., #123)
  "#\\d+",
];

const DEFAULT_KEYWORDS = ["TODO", "FIXME", "BUG", "HACK"];

const createPattern = (keywords, ticketPatterns) => {
  const keywordsPattern = keywords.join("|");
  const ticketPatternsGroup = ticketPatterns.map((p) => `(${p})`).join("|");
  // eslint-disable-next-line security/detect-non-literal-regexp
  return new RegExp(
    `(${keywordsPattern})\\s+(${ticketPatternsGroup})(?::\\s+|\\s+)(.*)`,
    "i",
  );
};

const create = (context) => {
  // Stryker disable next-line ConditionalExpression
  const config = context.options[0] || {};
  const ticketPatterns = config.ticketPatterns || DEFAULT_TICKET_PATTERNS;
  const keywords = config.keywords || DEFAULT_KEYWORDS;
  const todoPattern = createPattern(keywords, ticketPatterns);
  // eslint-disable-next-line security/detect-non-literal-regexp
  const keywordRegex = new RegExp(`^\\s*(${keywords.join("|")})\\b`, "i");

  // Fallback for older ESLint versions
  const sourceCode = context.sourceCode || context.getSourceCode();

  const comments = sourceCode.getAllComments();

  comments.forEach((comment) => {
    const lines = comment.value.split("\n");

    lines.forEach((line, lineNumber) => {
      const match = todoPattern.exec(line);
      if (!match) {
        const keywordMatch = keywordRegex.exec(line);
        if (keywordMatch) {
          const keyword = keywordMatch[1];
          context.report({
            node: comment,
            message: `"${keyword}" comment must be followed by a valid ticket number (e.g., ${ticketPatterns.join(
              // Stryker disable next-line StringLiteral
              " or ",
            )})`,
            // Stryker disable ObjectLiteral
            loc: {
              start: {
                // Stryker disable ArithmeticOperator
                line: comment.loc.start.line + lineNumber,
                column: comment.loc.start.column + 2 + line.indexOf(keyword),
              },
              end: {
                line: comment.loc.start.line + lineNumber,
                column:
                  comment.loc.start.column +
                  2 +
                  line.indexOf(keyword) +
                  keyword.length,
              },
            },
            // Stryker restore ObjectLiteral, ArithmeticOperator
          });
        }
      }
    });
  });

  return {};
};

// Stryker disable ObjectLiteral, StringLiteral, BooleanLiteral
const meta = {
  type: "suggestion",
  docs: {
    description: "Enforce TODO comments with ticket numbers",
    category: "Best Practices",
    recommended: true,
  },
  schema: [
    {
      type: "object",
      properties: {
        ticketPatterns: {
          type: "array",
          items: { type: "string" },
          default: DEFAULT_TICKET_PATTERNS,
        },
        keywords: {
          type: "array",
          items: { type: "string" },
          default: DEFAULT_KEYWORDS,
        },
      },
      additionalProperties: false,
    },
  ],
};
// Stryker restore ObjectLiteral, StringLiteral, BooleanLiteral

const rule = {
  meta,
  create,
};

const plugin = {
  rules: {
    "todo-tickets": rule,
  },
};

const recommendedRules = {
  "todo-tickets/todo-tickets": "error",
};

const jiraRecommendedRules = {
  "todo-tickets/todo-tickets": [
    "error",
    { ticketPatterns: ["[A-Z]{2,}-\\d+"] },
  ],
};

const githubRecommendedRules = {
  "todo-tickets/todo-tickets": ["error", { ticketPatterns: ["#\\d+"] }],
};

plugin.configs = {
  recommended: {
    plugins: ["todo-tickets"],
    rules: recommendedRules,
  },
  "flat/recommended": [
    {
      name: "todo-tickets/flat/recommended",
      plugins: {
        "todo-tickets": plugin,
      },
      rules: recommendedRules,
    },
  ],
  "flat/jira-recommended": [
    {
      name: "todo-tickets/flat/jira-recommended",
      plugins: {
        "todo-tickets": plugin,
      },
      rules: jiraRecommendedRules,
    },
  ],
  "flat/github-recommended": [
    {
      name: "todo-tickets/flat/github-recommended",
      plugins: {
        "todo-tickets": plugin,
      },
      rules: githubRecommendedRules,
    },
  ],
};

module.exports = plugin;
