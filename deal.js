import { data } from "./data.js";
import { USD } from "./templates.js";

document.addEventListener("DOMContentLoaded", function () {
  const contactName = document.getElementById("contactName");
  const dealName = document.getElementById("dealName");
  const email = document.getElementById("email");
  const dealId = document.getElementById("dealId");

  let params = new URLSearchParams(document.location.search);
  let id = parseInt(params.get("id")); // is the string "Jonathan"

  //   console.log(parseInt(params.get("id")));
  console.log(id, id === 0);
  const deal = data.filter((deal) => deal.id === id)[0];

  console.log(deal);

  // address:"354 Newton Rd"
  // amount: 87.1438689733105
  // contactName: "Jon Hopper"
  // email:"contact0@example.com"
  // id: 0
  // name: "Deal 0"
  //   contactName.innerHTML = deal.contactName;
  //   amount.innerHTML = deal.amount;
  //   email.innerHTML = deal.contactName;
  //   contactName.innerHTML = deal.contactName;
  //   contactName.innerHTML = deal.contactName;
  Object.keys(deal).forEach((key) => {
    console.log(key, deal[key]);
    if (key !== "amount") {
      document.getElementById(key).innerHTML = deal[key];
    } else {
      document.getElementById(key).innerHTML = USD(deal[key]);
    }
  });
});
