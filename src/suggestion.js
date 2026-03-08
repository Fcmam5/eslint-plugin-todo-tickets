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
    const remainder = line.slice(insertionPoint);
    const colonInRemainder = remainder.indexOf(":");
    const needsColon = colonInRemainder === -1;
    const suffix = needsColon
      ? ` ${placeholderTicket}:`
      : ` ${placeholderTicket}`;
    updatedLine = line.slice(0, insertionPoint) + suffix + remainder;
  }

  const lines = comment.value.split("\n");
  // eslint-disable-next-line security/detect-object-injection
  lines[lineNumber] = updatedLine;

  const replacementText =
    comment.type === "Line" ? `//${lines[0]}` : `/*${lines.join("\n")}*/`;

  return (fixer) => fixer.replaceTextRange(comment.range, replacementText);
};

module.exports = {
  createPlaceholderSuggestion,
};
