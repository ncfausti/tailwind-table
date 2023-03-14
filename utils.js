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

export const assertEqual = (actual, expected) => {
  if (actual !== expected) {
    console.error(`Assertion failed: expected ${expected}, but got ${actual}`);
  }
};

export const filterTable = (table, searchTerm) => {
  return table.filter(
    (row) =>
      row.name.toLowerCase().indexOf(searchTerm) > -1 ||
      row.email.toLowerCase().indexOf(searchTerm) > -1 ||
      row.contactName.toLowerCase().indexOf(searchTerm) > -1 ||
      row.address.toLowerCase().indexOf(searchTerm) > -1
  );
};
