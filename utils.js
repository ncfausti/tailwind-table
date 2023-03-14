export const convertCamelCaseToTitleCase = (camelCaseStrings) => {
  return camelCaseStrings.map((str) => {
    const words = [];
    let wordStart = 0;

    for (let i = 1; i < str.length; i++) {
      if (str[i] === str[i].toUpperCase()) {
        words.push(str.substring(wordStart, i));
        wordStart = i;
      }
    }

    words.push(str.substring(wordStart));
    return words
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  });
};
