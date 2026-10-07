// -------------------------
// Select Page Elements
// -------------------------

const loadUsersButton =
  document.querySelector("#load-users");

const filterInput =
  document.querySelector("#filter-input");

const status =
  document.querySelector("#status");

const usersList =
  document.querySelector("#users-list");


// -------------------------
// Store Users
// -------------------------

let users = [];


// -------------------------
// Render Users
// -------------------------

function renderUsers(list) {

  // Clear the current displayed list
  usersList.textContent = "";


  // Check for an empty result
  if (list.length === 0) {

    status.textContent =
      "No users match your filter.";

    return;

  }


  // Display every user in the supplied array
  list.forEach(function (user) {

    const listItem =
      document.createElement("li");


    // Name
    const name =
      document.createElement("h3");

    name.textContent =
      user.name;


    // Email
    const email =
      document.createElement("p");

    email.textContent =
      `Email: ${user.email}`;


    // City
    const city =
      document.createElement("p");

    city.textContent =
      `City: ${user.address.city}`;


    // Company
    const company =
      document.createElement("p");

    company.textContent =
      `Company: ${user.company.name}`;


    // Build the user item
    listItem.appendChild(name);
    listItem.appendChild(email);
    listItem.appendChild(city);
    listItem.appendChild(company);


    // Add it to the page
    usersList.appendChild(listItem);

  });

}


// -------------------------
// Load Users
// -------------------------

async function loadUsers() {

  // Loading state
  status.textContent =
    "Loading users...";

  loadUsersButton.disabled = true;


  try {

    // Request users from the API
    const response = await fetch(
      "https://jsonplaceholder.typicode.com/users"
    );


    // Check whether the HTTP request succeeded
    if (!response.ok) {

      throw new Error(
        `HTTP error: ${response.status}`
      );

    }


    // Convert JSON and store the users
    users = await response.json();


    // Display all loaded users
    renderUsers(users);


    // Success state
    status.textContent =
      "Users loaded successfully.";

  } catch (error) {

    // Clear any existing displayed users
    usersList.textContent = "";


    // Error state
    status.textContent =
      "Error loading users.";


    // Useful while developing
    console.error(error);

  } finally {

    // Always re-enable the button
    loadUsersButton.disabled = false;

  }

}


// -------------------------
// Load Button
// -------------------------

loadUsersButton.addEventListener(
  "click",
  function () {

    loadUsers();

  }
);


// -------------------------
// Filter Users
// -------------------------

filterInput.addEventListener(
  "input",
  function () {

    // Get the filter text
    const filterText =
      filterInput.value
        .trim()
        .toLowerCase();


    // Search the stored users array
    const filteredUsers =
      users.filter(function (user) {

        return user.name
          .toLowerCase()
          .includes(filterText);

      });


    // Render only matching users
    renderUsers(filteredUsers);


    // Keep the success message when
    // matching users are displayed
    if (filteredUsers.length > 0) {

      status.textContent =
        "Users loaded successfully.";

    }

  }
);