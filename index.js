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

// (data: array of objects, containerId: string id of container elem, options: obj})
export const createTable = (data, containerId, config) => {
  const containerElem = document.getElementById(containerId);
  const columnNames = Object.keys(data[0]);

  const readOnlyData = data;
  let _data = data;
  let _sortDirection = false;

  const _config = buildConfig(data, config);

  const table = document.createElement("table");
  const thead = document.createElement("thead");
  const tbody = document.createElement("tbody");
  table.id = "tw-table";
  tbody.id = "table-body";
  table.appendChild(tbody);

  containerElem.appendChild(table);
  const headerRow = document.createElement("tr");

  // sort internal data list then update the DOM
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

    if (_sortDirection === true) {
      _data = readOnlyData.sort((a, b) => sortAsc(a[key], b[key]));
    } else {
      _data = readOnlyData.sort((a, b) => sortDesc(a[key], b[key]));
    }
    paginate();

    // update();
    _sortDirection = !_sortDirection;
    return;
  };

  // convert data object keys to spaced and capitalized,
  // then create columns for header row
  convertCamelCaseToTitleCase(columnNames).forEach((columnName, i) => {
    const th = document.createElement("th");
    const text = document.createTextNode(columnName);

    // set the data-value of the column to the field names to use to sort on click
    th.dataset.value = columnNames[i];
    th.appendChild(text);
    headerRow.appendChild(th);
  });

  thead.appendChild(headerRow);
  table.appendChild(thead);

  // table populate/redraw function
  const update = () => {
    const tbody = document.getElementById("table-body");
    const table = document.getElementById("tw-table");
    table.removeChild(tbody);
    tbody.innerHTML = "";

    // populate the tbody
    _data.forEach((rowData) => {
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

    // add populated tbody to table
    table.appendChild(tbody);

    // place the table inside the container element
    containerElem.innerHTML = table.outerHTML;

    const tableHeaders = document.getElementsByTagName("th");
    for (let el of tableHeaders) {
      el.addEventListener("click", _sortTable);
    }

    return table;
  };

  // Define the page size and private update size function
  let _pageSize = 10;
  const _setPageSize = (n) => {
    _pageSize = n;
    paginate();
  };

  // semi-global flag to be used in paginate
  let searchTerm;
  let _filterTerm = searchTerm === undefined ? "" : searchTerm;

  // Define the current page
  let currentPage = 1;

  // Define the function to handle pagination
  const paginate = () => {
    // Check if a filter shoould be applied FIRST
    const filteredData = readOnlyData.filter(
      (row) =>
        row.name.toLowerCase().indexOf(_filterTerm) > -1 ||
        row.email.toLowerCase().indexOf(_filterTerm) > -1 ||
        row.contactName.toLowerCase().indexOf(_filterTerm) > -1 ||
        row.address.toLowerCase().indexOf(_filterTerm) > -1
    );

    // Calculate the start index and end index of the current page
    const startIndex = (currentPage - 1) * _pageSize;
    const endIndex = startIndex + _pageSize;

    // Get the data for the current page
    _data = filteredData.slice(startIndex, endIndex);

    // Display the data in the table
    update();

    // Update the page navigation
    const totalPages = Math.ceil(filteredData.length / _pageSize);
    document.getElementById(
      "page-navigation"
    ).innerHTML = `Page ${currentPage} of ${totalPages}`;

    // Disable or enable the previous and next buttons as needed
    if (currentPage === 1) {
      document.getElementById("previous-button").disabled = true;
    } else {
      document.getElementById("previous-button").disabled = false;
    }
    if (currentPage === totalPages) {
      document.getElementById("next-button").disabled = true;
    } else {
      document.getElementById("next-button").disabled = false;
    }
  };

  // populate table for the first time
  update();

  // paginate the results if necessary
  paginate();

  // Add event listeners to the previous and next buttons
  document.getElementById("previous-button").addEventListener("click", () => {
    currentPage--;
    paginate();
  });
  document.getElementById("next-button").addEventListener("click", () => {
    currentPage++;
    paginate();
  });

  const _filterTable = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    _filterTerm = searchTerm;

    _data = readOnlyData.filter(
      (row) =>
        row.name.toLowerCase().indexOf(searchTerm) > -1 ||
        row.email.toLowerCase().indexOf(searchTerm) > -1 ||
        row.contactName.toLowerCase().indexOf(searchTerm) > -1 ||
        row.address.toLowerCase().indexOf(searchTerm) > -1
    );

    // repopulate table based on the new filter
    update();
    paginate();
    return;
  };

  return {
    // Table API
    rows: _data,
    search: _filterTable, //
    sort: _sortTable, // sort based on data-value of buttons
    container: containerElem, // return the element containing the table
    setPageSize: _setPageSize,
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
