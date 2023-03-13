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

// Cache sorted values here
const cache = {
  // key:val
};

const createTable = (data, containerId) => {
  const _el = document.getElementById(containerId);
  const _table = data;

  let _currentSort = false;

  const _sortTable = (e) => {
    const key = e.target.dataset.value;
    if (_currentSort === true) {
      const sorted = _table.sort((a, b) => a[key] - b[key]);
      return sorted;
    }
    const sorted = _table.sort((a, b) => b[key] - a[key]);
    return sorted;
  };

  return {
    // Table API
    rows: _table,
    sort: _sortTable,
    container: _el,
  };
};

const dataTable = createTable(data, "Table");

const table = document.createElement("table");
const thead = document.createElement("thead");
const tbody = document.createElement("tbody");

const btn = document.getElementById("sort");
btn.onclick = dataTable.sort;

const headers = Object.keys(data[0]);

const headerRow = document.createElement("tr");
headers.forEach((header) => {
  const th = document.createElement("th");
  const text = document.createTextNode(header);
  th.appendChild(text);
  headerRow.appendChild(th);
});
thead.appendChild(headerRow);

data.forEach((rowData) => {
  const tr = document.createElement("tr");
  headers.forEach((header) => {
    const td = document.createElement("td");
    const text = document.createTextNode(rowData[header]);
    td.appendChild(text);
    tr.appendChild(td);
  });
  tbody.appendChild(tr);
});

table.appendChild(thead);
table.appendChild(tbody);

dataTable.container.innerHTML = table.outerHTML;
