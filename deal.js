import { data } from "./data.js";
import { USD } from "./templates.js";

document.addEventListener("DOMContentLoaded", function () {
  const contactName = document.getElementById("contactName");
  const dealName = document.getElementById("dealName");
  const email = document.getElementById("email");
  const dealId = document.getElementById("dealId");

  let params = new URLSearchParams(document.location.search);
  let id = parseInt(params.get("id")); // is the string "Jonathan"

  const deal = data.filter((deal) => deal.id === id)[0];

  Object.keys(deal).forEach((key) => {
    if (!document.getElementById(key)) return null;

    if (key !== "amount") {
      document.getElementById(key).innerHTML = deal[key];
    } else {
      document.getElementById(key).innerHTML = USD(deal[key]);
    }
  });
});
