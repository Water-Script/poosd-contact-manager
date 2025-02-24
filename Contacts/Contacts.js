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
    `</div>`,
  ].join("");

  return wrapperDiv;
}

function logOut() {
  document.cookie = "userId=; expires=01 Jan 1970 00:00:00 UTC; path=/";
  document.cookie = "username=; expires=01 Jan 1970 00:00:00 UTC; path=/";

  sendTo("/index.html");
}

window.onload = function () {
  const cookie = parseCookie(document.cookie);
  document
    .getElementById("errorMessage")
    .replaceChildren(
      createAlert(`The user id is: ${cookie.userId}`, "warning")
    );

  console.log(cookie);
  userId = cookie.userId;

  if (!userId || !cookie.username) {
    logOut();
    console.log("Cookie expired!");
  }
  searchDB(userId, "getAll");
};

/*
 * Parse the cookie and return an object consisting of they keys and their
 * stringified values.
 */
function parseCookie(cookie) {
  const cookieTokens = cookie.split(";");
  let obj = {};

  for (let token of cookieTokens) {
    const [key, value] = token.trim().split("=");

    obj[key] = value;
  }

  return obj;
}

function searchDB(userId, type) {
  let search = "";
  switch (type) {
    case "getAll":
      break;
    case document.getElementById("contactFirstName").value:
      type = "firstname";
      search = document.getElementById("contactFirstName").value;
      break;
    case document.getElementById("contactLastName").value:
      type = "lastname";
      search = document.getElementById("contactLastName").value;
      break;
    case document.getElementById("contactPhoneNumber").value:
      type = "phonenumber";
      search = document.getElementById("contactPhoneNumber").value;
      break;
    case document.getElementById("contactEmail").value:
      type = "email";
      search = document.getElementById("contactEmail").value;
      break;
    default:
      break;
  }

  let searchStr = {
    userId: userId,
    type: type,
    search: search,
  };

  if (type === "getAll") {
    let ourLink = apiUrl + "/Search." + exten;

    fetch(ourLink, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(searchStr),
    })
      .then((response) => {
        if (!response.ok) {
          throw Error(response.statusText);
        }
        return response.json();
      })
      .then((data) => {
        if (data.error) {
          // Display erro
          //displayError(data.message);
          document
            .getElementById("errorMessage")
            .replaceChildren(createAlert(`${data.message}`, "warning"));
        } else {
          // display initial set of contacts
          updateTable(data.contacts);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        // displayError("An error occurred.");
        document
          .getElementById("errorMessage")
          .replaceChildren(createAlert(`An error occurred.`, "warning"));
      });
  }
}

function isPhoneNumber(value) {
  // Check if the value is a string and contains exactly 10 digits
  const regex = /^\d{10}$/;
  return regex.test(value);
}

function addContact() {
  let fields = [
    document.getElementById("contactFirstName").value,
    document.getElementById("contactLastName").value,
    document.getElementById("contactPhone").value,
    document.getElementById("contactEmail").value,
  ];

  if (checkEmpty(fields)) {
    document
      .getElementById("errorMessage")
      .replaceChildren(
        createAlert("Please make sure all fields are filled out.", "warning")
      );
    return 0;
  }
  if (!isPhoneNumber(fields[2])) {
    document
      .getElementById("errorMessage")
      .replaceChildren(
        createAlert("A phone number must be 10 digits", "warning")
      );
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
        createAlert(data.message, "warning");
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
  const tableBody = document.querySelector("#table tbody");
  const newRow = document.createElement("tr");
  const firstNameCell = document.createElement("td");
  nameCell.innerText = firstName;
  const lastNameCell = document.createElement("td");
  lastNameCell.innerText = lastName;
  const phoneNumberCell = document.createElement("td");
  phoneNumberCell.innerText = phoneNumber;
  const emailCell = document.createElement("td");
  emailCell.innerText = email;
  const funcCell = document.createElement("td");

  const editButton = document.createElement("button");
  editButton.innerText = "Edit";
  editButton.classList.add("btn", "btn-warning", "mr-1");
  editButton.onclick = function () {
    editContact();
  };

  const deleteButton = document.createElement("button");
  deleteButton.innerText = "Delete";
  deleteButton.classList.add("btn", "btn-danger");
  deleteButton.onclick = function () {
    deleteContact(deleteButton);
  };

  funcCell.appendChild(editButton);
  funcCell.appendChild(deleteButton);

  newRow.appendChild(firstNameCell);
  newRow.appendChild(lastNameCell);
  newRow.appendChild(phoneNumberCell);
  newRow.appendChild(emailCell);
  newRow.appendChild(funcCell);

  tableBody.appendChild(newRow);
}

function displayError(message) {
  const errorDiv = document.getElementById("errorMessage");
  errorDiv.replaceChildren(createAlert(message, "warning"));
}

function clearErrorMessage() {
  const errorDiv = document.getElementById("errorMessage");
  errorDiv.innerHTML = "";
}

function sendTo(site) {
  window.location.href = site;
}
