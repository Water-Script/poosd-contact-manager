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
                <button class="btn btn-danger" onclick="deleteContact()">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" class="bi bi-trash-fill" viewBox="0 0 16 16">
  <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0"/>
</svg>
                </button>
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
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil" viewBox="0 0 16 16">
      <path d="M12.146.854a1 1 0 0 1 1.415 1.415L6.62 8.379a6.016 6.016 0 0 0-1.163.685l-1.56.78a.5.5 0 0 0-.268.315l-.493 2.05a.5.5 0 0 0 .149.523l1.155 1.155a.5.5 0 0 0 .523.149l2.05-.493a.5.5 0 0 0 .315-.268l.78-1.56a6.016 6.016 0 0 0 .685-1.163l5.11-6.941a1 1 0 0 1 1.415 1.415l-5.11 6.941a7.978 7.978 0 0 1-.93 1.549l-.77 1.537a.5.5 0 0 0 .122.565l1.5 1.5a.5.5 0 0 0 .707 0l1.5-1.5a.5.5 0 0 0 .122-.565l-.77-1.537a7.978 7.978 0 0 1-.93-1.549l-5.11-6.941A1 1 0 0 1 12.146.854z"/>
    </svg>`;
  button.setAttribute("onclick", "saveContact(this)");
  button.classList.remove("btn-warning");
  button.classList.add("btn-success");
}

function saveContact(button) {
  let contact = button.closest("tr");
}
