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
  const placeholderTicket = config.suggestPlaceholderWithTicket;
  const suggestPlaceholder = !!placeholderTicket;

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
          const keywordIndex = line.indexOf(keyword);
          const reportOptions = {
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
                column: comment.loc.start.column + 2 + keywordIndex,
              },
              end: {
                line: comment.loc.start.line + lineNumber,
                column:
                  comment.loc.start.column + 2 + keywordIndex + keyword.length,
              },
            },
            // Stryker restore ObjectLiteral, ArithmeticOperator
          };

          if (suggestPlaceholder) {
            const suggestionFix = createPlaceholderSuggestion({
              comment,
              lineNumber,
              line,
              keyword,
              placeholderTicket,
            });

            if (suggestionFix) {
              reportOptions.suggest = [
                {
                  desc: `Insert placeholder ticket "${placeholderTicket}"`,
                  fix: suggestionFix,
                },
              ];
            }
          }

          context.report(reportOptions);
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
  hasSuggestions: true,
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
          examples: DEFAULT_KEYWORDS,
        },
        suggestPlaceholderWithTicket: {
          type: "string",
          examples: "ABC-000",
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

const createPlaceholderSuggestion = ({
  comment,
  lineNumber,
  line,
  keyword,
  placeholderTicket,
}) => {
  const keywordIndex = line.indexOf(keyword);
  if (keywordIndex === -1) {
    return null;
  }

  const colonIndex = line.indexOf(":", keywordIndex + keyword.length);
  let updatedLine;

  if (
    colonIndex !== -1 &&
    line.slice(keywordIndex + keyword.length, colonIndex).trim() === ""
  ) {
    updatedLine =
      line.slice(0, colonIndex) +
      ` ${placeholderTicket}` +
      line.slice(colonIndex);
  } else {
    const insertionPoint = keywordIndex + keyword.length;
    const needsColon = !/^\s*:/.test(line.slice(insertionPoint));
    const suffix = needsColon
      ? ` ${placeholderTicket}:`
      : ` ${placeholderTicket}`;
    updatedLine =
      line.slice(0, insertionPoint) + suffix + line.slice(insertionPoint);
  }

  const lines = comment.value.split("\n");
  lines[lineNumber] = updatedLine;

  const replacementText =
    comment.type === "Line" ? `//${lines[0]}` : `/*${lines.join("\n")}*/`;

  return (fixer) => fixer.replaceTextRange(comment.range, replacementText);
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
