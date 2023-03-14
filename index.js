// - A table, where each row is a Deal with attributes:
//      Id, Name, Amount ($), Address, Contact Name
//
// - Clicking on a Deal takes you to that Deal's details page
//
// - Ascending/Descending sorting for the first 3 columns
//
// - Adjustable # of entries per page
//
// - Pagination
//
// - Search

import { data } from "./table.js";
import { assertEqual } from "./test.js";
// Cache sorted values here
const cache = {
  // key:val
};

const options = {
  sortable: true,

  // Cell overrides must use column header value as key
  cellOverrides: {},
};

// Allow overriding basic display for any cell
const CustomCell = (val, row, fmtCallback) => {
  return fmtCallback(val, row);
};

const fmtBase = (val) => {
  return val;
};

// ex. formatCallback, must be same as
const dealNameCol = (val, row) => {
  return ```
    <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-0">
        <div class="flex items-center">
        <div class="h-10 w-10 flex-shrink-0">
            <img
            class="h-10 w-10 rounded-full"
            src="https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
            alt=""
            />
        </div>
        <div class="ml-4">
            <div class="font-medium text-gray-900">
            ${val}
            </div>
            <div class="text-gray-500">
            ${row.email}
            </div>
        </div>
        </div>
    </td>```;
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
  const _table = data;

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
  headers.forEach((header) => {
    const th = document.createElement("th");
    const text = document.createTextNode(header);
    th.appendChild(text);
    headerRow.appendChild(th);
  });

  // append the header
  thead.appendChild(headerRow);

  // create initial table rows from data list passed in
  const update = () => {
    _table.forEach((rowData) => {
      const tr = document.createElement("tr");
      headers.forEach((header) => {
        // get the format function for this column
        const fn = _config.fmtFn[header];

        // call the format function with this data
        const td = document.createElement("td");
        const text = fn(rowData[header]);
        td.innerHTML = text;
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
  };

  update();

  table.appendChild(thead);
  table.appendChild(tbody);

  _el.innerHTML = table.outerHTML;

  let _currentSort = false;

  // sort internal data list then update the html
  const _sortTable = (e) => {
    const key = e.target.dataset.value;
    if (_currentSort === true) {
      const sorted = _table.sort((a, b) => a[key] - b[key]);
      update();
      return sorted;
    }
    const sorted = _table.sort((a, b) => b[key] - a[key]);
    update();
    return sorted;
  };

  return {
    // Table API
    rows: _table, //
    sort: _sortTable, // sort based on data-value of buttons
    container: _el, // return the element containing the table
  };
};

const tableOptions = {
  sortable: false,
  cellOverrides: {
    contactName: (v) => `<div class="bold">${v}</div>`,
  },
};

const dataTable = createTable(data, "Table");

const btn = document.getElementById("sort");
btn.onclick = dataTable.sort;

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
