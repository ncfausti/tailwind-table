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

const options = { 
    sortable: true, 
    cellOverrides: {}
};

// Allow overriding basic display for any cell
const CustomCell = (val, row, fmtCallback) => {
  return fmtCallback(val, row);
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



// (data: array, containerId: string, options: obj})
const createTable = (data, containerId, config) => {
  const _el = document.getElementById(containerId);
  const _table = data;

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

        // if there is a cell override for this column, use that

        // else
        const td = document.createElement("td");
        const text = document.createTextNode(rowData[header]);


        td.appendChild(text);
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

const dataTable = createTable(data, "Table", options);

const btn = document.getElementById("sort");
btn.onclick = dataTable.sort;
