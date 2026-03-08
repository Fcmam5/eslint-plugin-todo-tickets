const DEFAULT_TICKET_PATTERNS = Object.freeze([
  // JIRA ticket format (e.g., ABC-123)
  "[A-Z]{2,}-\\d+",
  // GitHub issue format (e.g., #123)
  "#\\d+",
]);

const DEFAULT_KEYWORDS = Object.freeze(["TODO", "FIXME", "BUG", "HACK"]);

module.exports = {
  DEFAULT_TICKET_PATTERNS,
  DEFAULT_KEYWORDS,
};
