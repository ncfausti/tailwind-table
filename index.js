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
const createTable = (data, containerId, config) => {
  const _el = document.getElementById(containerId);
  const readOnlyData = data;
  let _table = data;

  // if no config object is passed in default to:
  // sortable = true and baseFmt for all data cells
  const _config = buildConfig(data, config);

  // setup basic table elements needed
  const table = document.createElement("table");
  const thead = document.createElement("thead");
  const tbody = document.createElement("tbody");
  const headerRow = document.createElement("tr");

  // create headers from keys in first object
  const headers = Object.keys(data[0]);

  // create columns for header row
  convertCamelCaseToTitleCase(headers).forEach((header) => {
    const th = document.createElement("th");
    const text = document.createTextNode(header);
    th.appendChild(text);
    headerRow.appendChild(th);
  });

  const update = () => {
    const table = document.createElement("table");
    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");

    thead.appendChild(headerRow);

    _table.forEach((rowData) => {
      const tr = document.createElement("tr");
      tr.setAttribute("data-id", rowData["id"]);
      tr.setAttribute("onclick", `view('/deal?id=${rowData["id"]}')`);
      tr.className = "text-xl";
      headers.forEach((header) => {
        // get the format function for this column
        const fn = _config.fmtFn[header];
        // call the format function and append to table
        const td = document.createElement("td");
        const text = fn(rowData[header], rowData);
        td.innerHTML = text;
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(thead);
    table.appendChild(tbody);

    _el.innerHTML = table.outerHTML;
    return tbody;
  };

  update();

  //   table.appendChild(thead);
  table.appendChild(tbody);

  _el.appendChild(table);

  let _currentSort = false;

  // sort internal data list then update the html
  const _sortTable = (e) => {
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
    const key = e.target.dataset.value;

    if (_currentSort === true) {
      _table.sort((a, b) => sortAsc(a[key], b[key]));
    } else {
      _table.sort((a, b) => sortDesc(a[key], b[key]));
    }

    update();
    _currentSort = !_currentSort;
    return;
  };

  const _filterTable = (e) => {
    // need to take sorted into consideration to keep
    // results sorted when searching
    // and limit per page
    // and pagination
    const searchTerm = e.target.value.toLowerCase();

    _table = readOnlyData.filter(
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
    rows: _table,
    search: _filterTable, //
    sort: _sortTable, // sort based on data-value of buttons
    container: _el, // return the element containing the table
  };
};

const tableOptions = {
  sortable: false,
  cellOverrides: {
    id: (v, row) => grayCol(v, row),
    name: (v, row) => grayCol(v, row),
    contactName: (v, row) => dealNameCol(v, row),
    amount: (v, row) => amountCol(v, row),
    email: (v, row) => grayCol(v, row),
    address: (v, row) => grayCol(v, row),
  },
};

const tableData = data;
// const tableData = generateObjects(100);

console.log(tableData);

const dataTable = createTable(tableData, "Table", tableOptions);

const btn = document.getElementById("sort");
btn.onclick = dataTable.sort;

const btnName = document.getElementById("sort-name");
btnName.onclick = dataTable.sort;

const btnId = document.getElementById("sort-id");
btnId.onclick = dataTable.sort;

const searchBox = document.getElementById("search");
searchBox.onkeyup = dataTable.search;

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
