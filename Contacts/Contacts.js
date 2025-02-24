const apiUrl = "http://ingerberwetrust.com/LAMPAPI"; //api
let userId = 0;
let username = "";
const exten = "php"; //extension for the api

function createAlert(message, type) {
  const wrapperDiv = document.createElement("div");
  wrapperDiv.innerHTML = [
    `<div class="alert alert-${type} alert-dismissible" role="alert">`,
    `   <div>${message}</div>`,
    `   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>`,
    `</div>`
  ].join("");

  return wrapperDiv;
}

window.onload = function() {
  const cookie = parseCookie(document.cookie);
  //getUserIdFromCookies();
  document.getElementById("errorMessage").insertAdjacentHTML(createAlert(
    `The user id is: ${cookie.userId}`,
    "warning"
  ));

  if (userId === null || Date.parse(cookie.expires) > Date.now()) {
    sendTo("/index.html");
    document.cookie = "";
  }
  //searchDB(userId, "getAll");
};

/*
 * Parse the cookie and return an object consisting of they keys and their
 * stringified values.
*/
function parseCookie() {
  const cookie = document.cookie;
  const cookieTokens = cookie.split(";");
  let obj = {};

  for (let token of cookieTokens) {
    const [key, value] = token.trim().split("=");

    obj[key] = value;
  }
}

function searchDB(userId, type) {
  let search = [
    document.getElementById("contactFirstName").value,
    document.getElementById("contactLastName").value,
    document.getElementById("contactPhone").value,
    document.getElementById("contactEmail").value,
  ];
  let searchStr = "";

  if (type === "getAll") {
    searchStr = `UserID=${userId}`;
    let ourLink = apiUrl + "/Search." + exten;

    fetch(ourLink)
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          // Display erro
          displayError(data.message);
        } else {
          // display initial set of contacts
          updateTable(data.contacts);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        displayError("An error occurred.");
      });
  }
}

function addContact() {
  let fields = [
    document.getElementById("contactFirstName").value,
    document.getElementById("contactLastName").value,
    document.getElementById("contactPhone").value,
    document.getElementById("contactEmail").value,
  ];

  if (checkEmpty(fields)) {
    document.getElementById("errorMessage").append(createAlert(
      "Please make sure all fields are filled out.",
      "warning"
    ));
    return 0;
  }

  let dataObject = {
    userId: userId,
    firstName: fields[0],
    lastName: fields[1],
    phoneNumber: fields[2],
    email: fields[3],
  };

  let ourLink = apiUrl + "/ContactAdd." + exten;

  fetch(ourLink, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dataObject),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        addContactToTable(userId, firstName, lastName, phoneNumber, email);
        clearForm();
        clearErrorMessage(); // Clear any previous error messages
      } else {
        displayError(data.message);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      displayError("An error occurred while adding the contact.");
    });
}

function checkEmpty(field) {
  let flag = false;
  for (const elment of field) {
    if (elment == "") flag = true;
  }
  return flag;
}

function updateTable(contacts) {
  const tableBody = document.querySelector("#contactTable tbody");
  tableBody.innerHTML = "";

  contacts.forEach((contact) => {
    const row = document.createElement("tr");

    row.innerHTML = `
            <td>${contact.firstName}</td>
            <td>${contact.lastName}</td>
            <td>${contact.phoneNumber}</td>
            <td>${contact.email}</td>
        `;

    tableBody.appendChild(row);
  });
}

function addContactToTable(firstName, lastName, phoneNumber, email) {
  const table = document
    .getElementById("contactsTable")
    .getElementsByTagName("tbody")[0];

  const row = table.insertRow();
  row.insertCell(0).innerText = firstName;
  row.insertCell(1).innerText = lastName;
  row.insertCell(2).innerText = phoneNumber;
  row.insertCell(3).innerText = email;
}

function displayError(message) {
  const errorDiv = document.getElementById("errorMessage");
  errorDiv.append(createAlert(message, "warning"));
}

function clearErrorMessage() {
  const errorDiv = document.getElementById("errorMessage");
  errorDiv.innerHTML = "";
}

function sendTo(site) {
  window.location.href = site;
}
