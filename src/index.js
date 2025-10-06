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
  return new RegExp(
    `(${keywordsPattern})\\s+(${ticketPatternsGroup})(?::\\s+|\\s+)(.*)`,
    "i"
  );
};

const create = (context) => {
  // Stryker disable next-line ConditionalExpression
  const config = context.options[0] || {};
  const ticketPatterns = config.ticketPatterns || DEFAULT_TICKET_PATTERNS;
  const keywords = config.keywords || DEFAULT_KEYWORDS;
  const todoPattern = createPattern(keywords, ticketPatterns);

  const sourceCode = context.getSourceCode();
  const comments = sourceCode.getAllComments();

  comments.forEach((comment) => {
    const lines = comment.value.split("\n");

    lines.forEach((line, lineNumber) => {
      const match = todoPattern.exec(line);
      if (!match) {
        // Check if line starts with any keyword but doesn't match the pattern
        const keywordMatch = new RegExp(
          `^\\s*(${keywords.join("|")})\\b`,
          // Stryker disable next-line StringLiteral
          "i"
        ).exec(line);
        if (keywordMatch) {
          const keyword = keywordMatch[1];
          context.report({
            node: comment,
            message: `"${keyword}" comment must be followed by a valid ticket number (e.g., ${ticketPatterns.join(
              // Stryker disable next-line StringLiteral
              " or "
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

module.exports = {
  rules: {
    "todo-tickets": rule,
  },
};
