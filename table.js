// Id, Name, Amount ($), Address, Contact Name
const firstNames = ["Alan", "Ada", "Bob", "Grace", "Jon", "Steve", "Frank"];

const lastNames = [
  "Jobs",
  "Wozniak",
  "Turing",
  "von Neumann",
  "Lovelace",
  "Hopper",
];

const streets = [
  "Kierkegaard",
  "Russell",
  "Camus",
  "Nietzsche",
  "Descartes",
  "Newton",
  "Poincaré",
  "Laplace",
  "Euler",
];
const streetEndings = ["St", "Ave", "Rd", "Way"];

const generateUniqueNameFunction = (firstNames, lastNames) => {
  return function () {
    const randomFirstNameIndex = Math.floor(Math.random() * firstNames.length);
    const randomLastNameIndex = Math.floor(Math.random() * lastNames.length);
    const firstName = firstNames[randomFirstNameIndex];
    const lastName = lastNames[randomLastNameIndex];

    return `${firstName} ${lastName}`;
  };
};

const generateName = generateUniqueNameFunction(firstNames, lastNames);

export const generateObjects = (n) => {
  const objects = [];
  for (let i = 0; i < n; i++) {
    const object = {
      id: i,
      name: `Deal ${i}`,
      amount: Math.random() * 100,
      address: `${Math.floor(Math.random() * 1000) + 1} ${
        streets[Math.floor(Math.random() * streets.length)]
      } ${streetEndings[Math.floor(Math.random() * streetEndings.length)]}`,
      contactName: generateName(),
      email: `contact${i}@example.com`,
    };
    objects.push(object);
  }
  return objects;
};
