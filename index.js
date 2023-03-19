import { convertCamelCaseToTitleCase } from "./utils.js";

const DEMO_URL = "https://flourishing-dodol-75a9a7.netlify.app/";
const SEARCH_FIELDS = ["name", "email", "contactName", "address"];

// updatePageSize = (n) => partitionedTable
// filter = (s) => list
// sort = (column, dir) => list
// style = (val) => HTMLElement
// tableRows = (filter, sort, style, currentPage, pageSize) => ElementList
// tbody.innerHTML = tableRows(data, filter, sort, style, currentPage, pageSize)

// tableRows("ada", ("amount", "desc"), fnList, 1, 10);
// tableRows("von Neumann", ("name", "asc"), fnList, 1, 10);
// tableRows("steve", ("amount", "asc"), fnList, 4, 10);

// const tableRows = (data, filter, sort, style, currentPage, pageSize) => {
//   const [rows, totalPages] = paginate(
//     style(sort(filter(data))),
//     currentPage,
//     pageSize
//   );

//   return { rows: rows, pageNum: currentPage, totalPages: totalPages };
// };

export const buildConfig = (data, config = {}) => {
  if (!data) throw new Error("Must specify a datasource");
  if (data.length === 0)
    throw new Error("Datasource must have at least one row");

  // set default formatFunctions
  const defaultFmtFn = Object.keys(data[0]).reduce((obj, key) => {
    obj[key] = (v) => v; // must be a function
    return obj;
  }, {});

  const conf = {
    sortable: config.sortable === undefined ? true : config.sortable,
    fmtFn:
      config.cellOverrides === undefined
        ? defaultFmtFn
        : {
            ...defaultFmtFn,
            ...config.cellOverrides,
          },
  };

  return conf;
};

// (data: array of objects, containerId: string id of container elem, options: obj})
export const createTable = (data, containerId, config, pageSize) => {
  const containerElem = document.getElementById(containerId);
  const columnNames = Object.keys(data[0]);
  // Define the page size and private update size function
  let _pageSize = pageSize;

  const readOnlyData = data;
  let _data = data;
  let _sortDirection = false;

  const _config = buildConfig(data, config);

  const table = document.createElement("table");
  const thead = document.createElement("thead");
  const tbody = document.createElement("tbody");
  table.id = "tw-table";
  table.className = "w-full";
  tbody.id = "table-body";
  tbody.className = "divide-y divide-gray-200";
  table.appendChild(tbody);

  containerElem.appendChild(table);
  const headerRow = document.createElement("tr");

  // sort internal data list then update the DOM
  const sortTable = (column) => {
    const key = column;
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
    paginate(readOnlyData, _pageSize);

    _sortDirection = !_sortDirection;
  };

  // convert data object keys to spaced and capitalized,
  // then create columns for header row
  convertCamelCaseToTitleCase(columnNames).forEach((columnName, i) => {
    const th = document.createElement("th");
    const text = document.createTextNode(columnName);
    th.className = "py-3.5 px-3 text-left text-sm text-gray-700";

    // set the data-value of the column to the field names to use to sort on click
    th.dataset.value = columnNames[i];
    th.appendChild(text);
    headerRow.appendChild(th);
    console.log(th);
  });

  thead.appendChild(headerRow);
  table.appendChild(thead);

  // table populate/redraw function
  const update = () => {
    const tbody = document.getElementById("table-body");
    const table = document.getElementById("tw-table");
    table.removeChild(tbody);
    tbody.innerHTML = "";
    tbody.className = "divide-y divide-gray-200";

    // populate the tbody
    _data.forEach((rowData) => {
      const tr = document.createElement("tr");
      tr.setAttribute("data-id", rowData["id"]);
      tr.setAttribute(
        "onclick",
        `view('${DEMO_URL}/deal?id=${rowData["id"]}')`
      );

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

    return table;
  };

  const _setPageSize = (n) => {
    _pageSize = n;
    paginate(readOnlyData, _pageSize);
  };

  let searchTerm;
  let _filterTerm = searchTerm === undefined ? "" : searchTerm;

  // Define the current page
  let currentPage = 1;

  const paginate = (data, pageSize) => {
    const filterByTerm = filterByPropertiesCurried(data);
    const filterByProperties = (filterTerm) =>
      filterByTerm(filterTerm)(SEARCH_FIELDS);

    const filteredData = filterByProperties(_filterTerm);

    // Calculate the start index and end index of the current page
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    // Get the data for the current page
    _data = filteredData.slice(startIndex, endIndex);

    // Display the data in the table
    update();

    // Update the page navigation
    const totalPages = Math.ceil(filteredData.length / pageSize);
    document.getElementById(
      "page-navigation"
    ).innerHTML = `Showing page ${currentPage} of ${totalPages}`;

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
  paginate(readOnlyData, _pageSize);

  // Add event listeners to the previous and next buttons
  document.getElementById("previous-button").addEventListener("click", () => {
    currentPage--;
    paginate(readOnlyData, _pageSize);
  });
  document.getElementById("next-button").addEventListener("click", () => {
    currentPage++;
    paginate(readOnlyData, _pageSize);
  });

  const _filterTable = (query) => {
    const searchTerm = query.toLowerCase();
    _filterTerm = searchTerm;

    _data = filterByProperties(readOnlyData, _filterTerm, SEARCH_FIELDS);

    // repopulate table based on the new filter
    update();
    paginate(readOnlyData, _pageSize);
  };

  return {
    // Table API
    rows: _data,
    search: _filterTable, //
    sort: sortTable, // sort based on data-value of buttons
    container: containerElem, // return the element containing the table
    setPageSize: _setPageSize,
  };
};

const filterByPropertiesCurried = (data) => (filterTerm) => (properties) => {
  return data.filter((row) => {
    return properties.some((prop) => {
      return row[prop].toLowerCase().indexOf(filterTerm.toLowerCase()) > -1;
    });
  });
};
