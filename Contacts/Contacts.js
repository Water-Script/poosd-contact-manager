const apiUrl = "http://ingerberwetrust.com/LAMPAPI"; //api
const exten = "php"; //extension for the api
let userId = getUserIdFromCookies();
let userN = "";
/*
window.onload = function () {
  if (userId === null) {
    sendTo("/index.html");
  }
  searchDB(userId, "getAll");
};
*/
function getUserIdFromCookies() {
  // obtain cookies
  let cookies = document.cookie;

  // look for match
  let match = cookies.match(/userid=([^;|]+)/);

  // if match is found, return that user id value
  if (match) {
    return match[1];
  } else {
    return null;
  }
}
function searchDB(userId, type) {
  let search = [
    document.getElementById("contactFirstName").value,
    document.getElementById("contactLastName").value,
    document.getElementById("contactPhone").value,
    document.getElementById("contactEmail").value,
  ];
  let searchObj = { userId: userId, type: type, search: search };
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
    document.getElementById("errorMessage").innerHTML =
      "Please make sure all fields are filled out.";
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
        addContactToTable(firstName, lastName, phoneNumber, email);
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
  errorDiv.innerText = message;
}

function clearErrorMessage() {
  const errorDiv = document.getElementById("errorMessage");
  errorDiv.innerText = "";
}
