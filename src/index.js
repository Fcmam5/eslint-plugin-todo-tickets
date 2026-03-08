const { DEFAULT_TICKET_PATTERNS, DEFAULT_KEYWORDS } = require("./constants");
const { createTodoPattern, createKeywordRegex } = require("./pattern");
const { createPlaceholderSuggestion } = require("./suggestion");

const resolveConfig = (context) => {
  const [userConfig = {}] = context.options ?? [];
  const {
    ticketPatterns = DEFAULT_TICKET_PATTERNS,
    keywords = DEFAULT_KEYWORDS,
    suggestPlaceholderWithTicket: placeholderTicket,
  } = userConfig;

  return {
    ticketPatterns,
    keywords,
    placeholderTicket,
  };
};

const getSourceCode = (context) =>
  context.sourceCode ?? context.getSourceCode();

const buildMissingTicketMessage = (keyword, ticketPatterns) =>
  `"${keyword}" comment must be followed by a valid ticket number (e.g., ${ticketPatterns.join(
    // Stryker disable next-line StringLiteral
    " or ",
  )})`;

const buildLocation = ({
  comment,
  lineNumber,
  keywordIndex,
  keywordLength,
}) => ({
  start: {
    // Stryker disable ArithmeticOperator
    line: comment.loc.start.line + lineNumber,
    column: comment.loc.start.column + 2 + keywordIndex,
  },
  end: {
    line: comment.loc.start.line + lineNumber,
    column: comment.loc.start.column + 2 + keywordIndex + keywordLength,
  },
  // Stryker restore ArithmeticOperator
});

const addSuggestion = ({
  placeholderTicket,
  comment,
  lineNumber,
  line,
  keyword,
}) => {
  if (placeholderTicket) {
    const suggestionFix = createPlaceholderSuggestion({
      comment,
      lineNumber,
      line,
      keyword,
      placeholderTicket,
    });

    return [
      {
        desc: `Insert placeholder ticket "${placeholderTicket}"`,
        fix: suggestionFix,
      },
    ];
  }

  return;
};

const reportMissingTicket = ({
  context,
  comment,
  lineNumber,
  line,
  keyword,
  ticketPatterns,
  placeholderTicket,
}) => {
  const keywordIndex = line.indexOf(keyword);
  if (keywordIndex === -1) {
    return;
  }

  const reportOptions = {
    node: comment,
    message: buildMissingTicketMessage(keyword, ticketPatterns),
    loc: buildLocation({
      comment,
      lineNumber,
      keywordIndex,
      keywordLength: keyword.length,
    }),
  };

  if (placeholderTicket) {
    reportOptions.suggest = addSuggestion({
      placeholderTicket,
      comment,
      lineNumber,
      line,
      keyword,
    });
  }

  context.report(reportOptions);
};

const analyzeLine = ({
  line,
  lineNumber,
  comment,
  todoPattern,
  keywordRegex,
  context,
  ticketPatterns,
  placeholderTicket,
}) => {
  if (todoPattern.test(line)) {
    return;
  }

  const keywordMatch = keywordRegex.exec(line);
  if (!keywordMatch) {
    return;
  }

  reportMissingTicket({
    context,
    comment,
    lineNumber,
    line,
    keyword: keywordMatch[1],
    ticketPatterns,
    placeholderTicket,
  });
};

const analyzeComment = ({
  comment,
  todoPattern,
  keywordRegex,
  context,
  ticketPatterns,
  placeholderTicket,
}) => {
  comment.value.split("\n").forEach((line, lineNumber) => {
    analyzeLine({
      line,
      lineNumber,
      comment,
      todoPattern,
      keywordRegex,
      context,
      ticketPatterns,
      placeholderTicket,
    });
  });
};

const create = (context) => {
  const { ticketPatterns, keywords, placeholderTicket } =
    resolveConfig(context);

  const todoPattern = createTodoPattern(keywords, ticketPatterns);
  const keywordRegex = createKeywordRegex(keywords);

  const comments = getSourceCode(context).getAllComments();

  comments.forEach((comment) => {
    analyzeComment({
      comment,
      todoPattern,
      keywordRegex,
      context,
      ticketPatterns,
      placeholderTicket,
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

const plugin = {
  rules: {
    "todo-tickets": rule,
  },
};

const recommendedRules = {
  "todo-tickets/todo-tickets": [
    "error",
    { ticketPatterns: DEFAULT_TICKET_PATTERNS },
  ],
};

const jiraRecommendedRules = {
  "todo-tickets/todo-tickets": [
    "error",
    {
      ticketPatterns: ["[A-Z]{2,}-\\d+"],
      suggestPlaceholderWithTicket: "ABC-000",
    },
  ],
};

const githubRecommendedRules = {
  "todo-tickets/todo-tickets": [
    "error",
    { ticketPatterns: ["#\\d+"], suggestPlaceholderWithTicket: "#00" },
  ],
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
