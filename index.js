// - A table, where each row is a Deal with attributes:
//      Id, Name, Amount ($), Address, Contact Name
//
// - Clicking on a Deal takes you to that Deal's details page
//
// - DONE Ascending/Descending sorting for the first 3 columns
//
// - Adjustable # of entries per page
//
// - Pagination
//
// - DONE Search

import { generateObjects } from "./table.js";
import { data } from "./data.js";
import { convertCamelCaseToTitleCase } from "./utils.js";
import { amountCol, dealNameCol, grayCol } from "./templates.js";
import { assertEqual } from "./test.js";

const fmtBase = (val) => {
  return val;
};

export const buildConfig = (data, config) => {
  if (!data) throw new Error("Must specify a datasource");
  if (data.length === 0)
    throw new Error("Datasource must have at least one row");

  // set default formatFunctions
  const allBaseFormatFunctions = Object.keys(data[0]).reduce((obj, key) => {
    obj[key] = fmtBase;
    return obj;
  }, {});

  if (!config) {
    // default to sortable: true, fmtBase(val)
    return {
      sortable: true,
      fmtFn: allBaseFormatFunctions,
    };
  } else {
    let conf = {};
    // check for sortable
    if (config.sortable === undefined) {
      conf.sortable = true;
    } else {
      conf.sortable = config.sortable;
    }
    // check for format functions
    if (config.cellOverrides === undefined) {
      conf.fmtFn = allBaseFormatFunctions;
    } else {
      // take the functions in config.cellOverrides that are specified and apply them
      conf.fmtFn = allBaseFormatFunctions;
      Object.keys(config.cellOverrides).forEach(
        (key) => (conf.fmtFn[key] = config.cellOverrides[key])
      );
    }

    return conf;
  }
};

// (data: array, containerId: string, options: obj})
export const createTable = (data, containerId, config) => {
  const containerElem = document.getElementById(containerId);
  const readOnlyData = data;
  let _data = data;
  let _currentSort = false;

  const _config = buildConfig(data, config);

  const table = document.createElement("table");
  const thead = document.createElement("thead");
  const tbody = document.createElement("tbody");
  table.id = "tw-table";
  tbody.id = "table-body";

  const headerRow = document.createElement("tr");

  // sort internal data list then update the html
  const _sortTable = (e) => {
    const key = e.target.dataset.value;

    const sortAsc = (a, b) => {
      if (typeof a === "string" && typeof b === "string") {
        return a.localeCompare(b);
      } else {
        return a - b;
      }
    };
    const sortDesc = (a, b) => {
      if (typeof a === "string" && typeof b === "string") {
        return b.localeCompare(a);
      } else {
        return b - a;
      }
    };

    if (_currentSort === true) {
      _data.sort((a, b) => sortAsc(a[key], b[key]));
    } else {
      _data.sort((a, b) => sortDesc(a[key], b[key]));
    }

    update();
    _currentSort = !_currentSort;
    return;
  };

  const columnNames = Object.keys(data[0]);

  // create columns for header row
  convertCamelCaseToTitleCase(columnNames).forEach((columnName, i) => {
    const th = document.createElement("th");
    const text = document.createTextNode(columnName);
    th.dataset.value = columnNames[i];
    th.appendChild(text);

    headerRow.appendChild(th);
  });

  thead.appendChild(headerRow);
  table.appendChild(thead);

  const update = () => {
    console.log("updating...");
    const tbody = document.getElementById("table-body");
    const table = document.getElementById("tw-table");

    console.log(table);
    table.removeChild(tbody);

    tbody.innerHTML = "";

    // for each of the rows in the internal object array
    _data.forEach((rowData) => {
      // create a new row element
      const tr = document.createElement("tr");
      tr.setAttribute("data-id", rowData["id"]);
      tr.setAttribute("onclick", `view('/deal?id=${rowData["id"]}')`);

      columnNames.forEach((headerString) => {
        // get the format function for this column
        const fn = _config.fmtFn[headerString];
        const td = document.createElement("td");

        // format the innerHTML for this column
        const text = fn(rowData[headerString], rowData);
        td.innerHTML = text;
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });

    // add the newly created row to the table
    table.appendChild(tbody);

    containerElem.innerHTML = table.outerHTML;
    return table;
  };

  //   update();

  //   table.appendChild(thead);
  table.appendChild(tbody);

  containerElem.appendChild(table);
  update();

  const _filterTable = (e) => {
    // need to take sorted into consideration to keep
    // results sorted when searching
    // and limit per page
    // and pagination
    const searchTerm = e.target.value.toLowerCase();

    _data = readOnlyData.filter(
      (row) =>
        row.name.toLowerCase().indexOf(searchTerm) > -1 ||
        row.email.toLowerCase().indexOf(searchTerm) > -1 ||
        row.contactName.toLowerCase().indexOf(searchTerm) > -1 ||
        row.address.toLowerCase().indexOf(searchTerm) > -1
    );

    update();
    return;
  };

  return {
    // Table API
    rows: _data,
    search: _filterTable, //
    sort: _sortTable, // sort based on data-value of buttons
    container: containerElem, // return the element containing the table
  };
};

// TESTS
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

assertEqual(confA.sortable, true);
assertEqual(confA.fmtFn.id(objTest.id), objTest.id);
assertEqual(confA.fmtFn.name(objTest.name), objTest.name);
assertEqual(confA.fmtFn.address(objTest.address), objTest.address);
assertEqual(confA.fmtFn.contactName(objTest.contactName), objTest.contactName);
assertEqual(confA.fmtFn.amount(objTest.amount), objTest.amount);
assertEqual(confA.fmtFn.email(objTest.email), objTest.email);

// with override function for contactName field
const optsB = {
  sortable: false,
  cellOverrides: {
    contactName: (v) => `<div class="bold">${v}</div>`,
  },
};

const confB = buildConfig(dataTest, optsB);
assertEqual(confB.sortable, false);
assertEqual(confB.fmtFn.id(objTest.id), 0);
assertEqual(confB.fmtFn.name(objTest.name), "xyz deal");
assertEqual(confB.fmtFn.address(objTest.address), "123 main street");
assertEqual(
  confB.fmtFn.contactName(objTest.contactName),
  `<div class="bold">John Doe</div>`
);
assertEqual(confB.fmtFn.amount(objTest.amount), 30.45);
assertEqual(confB.fmtFn.email(objTest.email), "john@example.com");

const camelCaseStrings = ["firstName", "lastName", "addressLine1", "zipCode"];
const titleCaseStrings = convertCamelCaseToTitleCase(camelCaseStrings);
const correct = ["First Name", "Last Name", "Address Line 1", "Zip Code"];
titleCaseStrings.forEach((s, i) => assertEqual(s, correct[i]));
