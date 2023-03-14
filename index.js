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

import { generateObjects } from "./table.js";
import { assertEqual } from "./test.js";
// Cache sorted values here
const cache = {
  // key:val
};
const USD = (amount) =>
  amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

// Allow overriding basic display for any cell
const CustomCell = (val, row, fmtCallback) => {
  return fmtCallback(val, row);
};

const fmtBase = (val) => {
  return val;
};

const dealNameCol = (val, row) => {
  return `
    <td>
        <div class="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-0">
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
        </div>
    </td>`;
};

const amountCol = (val, row) => {
  return `<td>
  <div class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
    <span
      class="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800"
      >${USD(val)}</span>
      </div>
  </td>`;
};

const emailCol = (val, row) => {
  return `<td>
            <span class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
            ${val}
            </span>
        </td>`;
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

  const update = () => {
    const table = document.createElement("table");
    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");

    thead.appendChild(headerRow);

    _table.forEach((rowData) => {
      const tr = document.createElement("tr");
      headers.forEach((header) => {
        debugger;
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
      const sorted = _table.sort((a, b) => sortAsc(a[key], b[key]));
    } else {
      const sorted = _table.sort((a, b) => sortDesc(a[key], b[key]));
    }

    update();
    _currentSort = !_currentSort;
    return;
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
    contactName: (v, row) => dealNameCol(v, row),
    amount: (v, row) => amountCol(v, row),
    email: (v, row) => emailCol(v, row),
  },
};

// const tableData = data;
const tableData = generateObjects(100);

const dataTable = createTable(tableData, "Table", tableOptions);

const btn = document.getElementById("sort");
btn.onclick = dataTable.sort;

const btnName = document.getElementById("sort-name");
btnName.onclick = dataTable.sort;

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
