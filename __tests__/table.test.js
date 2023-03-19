import { data } from "../data.js";
import { buildConfig } from "../index.js";
import { convertCamelCaseToTitleCase } from "../utils.js";

describe("My test suite", () => {
  test("My first test case", () => {
    // test code goes here
    expect(data.length).toBe(100);
  });

  test("My second test case", () => {
    // test code goes here
    expect(data.length).toBe(100);
  });

  const dataTest = [
    {
      id: 0,
      name: "xyz deal",
      address: "123 main street",
      contactName: "John Doe",
      amount: 30.45,
      email: "john@example.com",
    },
  ];

  const objTest = dataTest[0];

  // no override functions specified
  const optsA = { sortable: true };
  const confA = buildConfig(dataTest, optsA);

  expect(confA.sortable).toBe(true);
  expect(confA.fmtFn.id(objTest.id)).toBe(objTest.id);
  expect(confA.fmtFn.name(objTest.name)).toBe(objTest.name);
  expect(confA.fmtFn.address(objTest.address)).toBe(objTest.address);
  expect(confA.fmtFn.contactName(objTest.contactName)).toBe(
    objTest.contactName
  );
  expect(confA.fmtFn.amount(objTest.amount)).toBe(objTest.amount);
  expect(confA.fmtFn.email(objTest.email)).toBe(objTest.email);

  // with override function for contactName field
  const optsB = {
    sortable: false,
    cellOverrides: {
      contactName: (v) => `<div class="bold">${v}</div>`,
    },
  };

  const confB = buildConfig(dataTest, optsB);
  expect(confB.sortable).toBe(false);
  expect(confB.fmtFn.id(objTest.id)).toBe(0);
  expect(confB.fmtFn.name(objTest.name)).toBe("xyz deal");
  expect(confB.fmtFn.address(objTest.address)).toBe("123 main street");
  expect(confB.fmtFn.contactName(objTest.contactName)).toBe(
    `<div class="bold">John Doe</div>`
  );
  expect(confB.fmtFn.amount(objTest.amount)).toBe(30.45);
  expect(confB.fmtFn.email(objTest.email)).toBe("john@example.com");

  const camelCaseStrings = ["firstName", "lastName", "addressLine1", "zipCode"];
  const titleCaseStrings = convertCamelCaseToTitleCase(camelCaseStrings);
  const correct = ["First Name", "Last Name", "Address Line 1", "Zip Code"];
  titleCaseStrings.forEach((s, i) => expect(s).toBe(correct[i]));
});
