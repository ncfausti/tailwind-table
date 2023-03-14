const USD = (amount) => {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
};

export const dealNameCol = (val, row) => {
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

export const amountCol = (val, row) => {
  return `<td>
    <div class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
      <span
        class="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800"
        >${USD(val)}</span>
        </div>
    </td>`;
};

export const emailCol = (val, row) => {
  return `<td>
              <span class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
              ${val}
              </span>
          </td>`;
};
