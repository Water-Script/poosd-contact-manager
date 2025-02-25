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
  // document
  //   .getElementById("errorMessage")
  //   .replaceChildren(
  //     createAlert(`The user id is: ${cookie.userId}`, "warning")
  //   );

  // console.log(cookie);
  userId = cookie.userId;

  if (!userId || !cookie.username) {
    logOut();
    console.log("Cookie expired!");
  }
  searchDB("getAll");
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

function searchDB(type) {
  let search = "";

  switch (type) {
    case "getAll":
      break;
    case "firstName":
      search = document.getElementById("dynamicInput").value;
      break;
    case "lastName":
      search = document.getElementById("dynamicInput").value;
      break;
    case "email":
      search = document.getElementById("dynamicInput").value;
      break;
    default:
      break;
  }

  let searchStr = {
    userId: userId,
    type: type,
    search: search,
  };

  let searchStrLink = new URLSearchParams(searchStr).toString();

  let ourLink = apiUrl + "/Search." + exten + "?" + searchStrLink;

  fetch(ourLink, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
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
      createAlert(`An error occurred: ${error}`, "warning");
    });
}

function isPhoneNumber(value) {
  const digitsOnly = value.replace(/\D/g, "");
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
    .then((response) => {
      if (!response.ok) {
        throw Error(response.statusText);
      }
      return response.json();
    })
    .then((data) => {
      if (data.error) {
        createAlert(data.message, "warning");
      } else {
        sendTo("/Contacts/Contacts.html");
      }
    })
    .catch((error) => {
      createAlert(`An error occurred: ${error}`, "warning");
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
            <td>${contact.FirstName}</td>
            <td>${contact.LastName}</td>
            <td>${contact.PhoneNumber}</td>
            <td>${contact.Email}</td>
            <td>
                <button class="btn btn-warning mr-1" onclick="editToggle(this)">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" class="bi bi-pencil-square" viewBox="0 0 16 16">
  <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
  <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
</svg>
                </button>
                <button class="btn btn-danger" onclick="deleteContact(this)">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" class="bi bi-trash-fill" viewBox="0 0 16 16">
  <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0"/>
</svg>
                </button>
            </td>
            <td style="display: none;" class="contactid">${contact.ID}</td>
            </td>

        `;

    tableBody.appendChild(row);
  });
}

function addContactToTable(firstName, lastName, phoneNumber, email) {
  const tableBody = document.querySelector("#table tbody");
  const newRow = document.createElement("tr");
  const firstNameCell = document.createElement("td");
  firstNameCell.innerText = firstName;
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

function changeInputType() {
  let selectedValue = document.getElementById("inputTypeSelect").value;
  let inputField = document.getElementById("dynamicInput");

  switch (selectedValue) {
    case "firstName":
      inputField.placeholder = "Search by First Name";
      break;
    case "lastName":
      inputField.placeholder = "Search by Last Name";
      break;
    case "email":
      inputField.placeholder = "Search by Email";
      break;
    default:
      break;
  }
}

function editToggle(button) {
  let contact = button.closest("tr");

  contact.cells[0].contentEditable = true;
  contact.cells[1].contentEditable = true;
  contact.cells[2].contentEditable = true;
  contact.cells[3].contentEditable = true;

  // Change the Edit button to a Save button (SVG icon)
  button.innerHTML = `
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check-square" viewBox="0 0 16 16">
  <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z"/>
  <path d="M10.97 4.97a.75.75 0 0 1 1.071 1.05l-3.992 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425z"/>
</svg>`;
  button.setAttribute("onclick", "saveContact(this)");
  button.classList.remove("btn-warning");
  button.classList.add("btn-success");
}

function saveContact(button) {
  let setcontact = button.closest("tr");

  let firstName = setcontact.cells[0].innerText;
  let lastName = setcontact.cells[1].innerText;
  let phoneNumber = setcontact.cells[2].innerText;
  let email = setcontact.cells[3].innerText;
  let contactID = setcontact.cells[5].innerText;

  if (checkEmpty(setcontact.cells)) {
    document
      .getElementById("errorMessage")
      .replaceChildren(
        createAlert("Please make sure all fields are filled out.", "warning")
      );
    return 0;
  }
  if (!isPhoneNumber(phoneNumber)) {
    document
      .getElementById("errorMessage")
      .replaceChildren(
        createAlert("A phone number must be 10 digits", "warning")
      );
    return 0;
  }

  setcontact.cells[0].contentEditable = false;
  setcontact.cells[1].contentEditable = false;
  setcontact.cells[2].contentEditable = false;
  setcontact.cells[3].contentEditable = false;

  button.innerHTML = `
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" class="bi bi-pencil-square" viewBox="0 0 16 16">
  <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
  <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
</svg>`;
  button.setAttribute("onclick", "editToggle(this)");
  button.classList.remove("btn-success");
  button.classList.add("btn-warning");

  let dataObject = {
    userId: userId,
    contactId: contactID,
    firstName: firstName,
    lastName: lastName,
    phoneNumber: phoneNumber,
    email: email,
  };

  let ourLink = apiUrl + "/ContactEdit." + exten;

  fetch(ourLink, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dataObject),
  })
    .then((response) => {
      if (!response.ok) {
        throw Error(response.statusText);
      }
      return response.json();
    })
    .then((data) => {
      if (data.error) {
        createAlert(data.message, "warning");
      } else {
        searchDB("getAll");
      }
    })
    .catch((error) => {
      createAlert(`An error occurred: ${error}`, "warning");
    });
}

function deleteContact(button) {
  let delcontact = button.closest("tr");

  let contactId = delcontact.cells[5].innerText;
  createAlert(`An error occurred: ${contactId}`, "warning");

  let dataObject = {
    userId: userId,
    contactId: contactId,
  };

  let ourLink = apiUrl + "/ContactDel." + exten;

  fetch(ourLink, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dataObject),
  })
    .then((response) => {
      if (!response.ok) {
        throw Error(response.statusText);
      }
      return response.json();
    })
    .then((data) => {
      if (data.error) {
        createAlert(data.message, "warning");
      } else {
        sendTo("/Contacts/Contacts.html");
      }
    })
    .catch((error) => {
      createAlert(`An error occurred: ${error}`, "warning");
    });
  searchDB("getAll");
}

function phoneStructure(phone) {
  let digit = phone.value.replace(/\D/g, "");
  if (digit.length <= 3) {
    phone.value = "(" + digit;
  } else if (digit.length <= 6) {
    phone.value = "(" + digit.slice(0, 3) + ") " + digit.slice(3);
  } else {
    phone.value =
      "(" +
      digit.slice(0, 3) +
      ") " +
      digit.slice(3, 6) +
      "-" +
      digit.slice(6, 10);
  }
}
