const createTodoPattern = (keywords, ticketPatterns) => {
  const keywordsPattern = keywords.join("|");
  const ticketPatternsGroup = ticketPatterns.map((pattern) => `(${pattern})`).join("|");

  // eslint-disable-next-line security/detect-non-literal-regexp
  return new RegExp(
    `(${keywordsPattern})\\s+(${ticketPatternsGroup})(?::\\s+|\\s+)(.*)`,
    "i",
  );
};

const createKeywordRegex = (keywords) => {
  // eslint-disable-next-line security/detect-non-literal-regexp
  return new RegExp(`^\\s*(${keywords.join("|")})\\b`, "i");
};

module.exports = {
  createTodoPattern,
  createKeywordRegex,
};
