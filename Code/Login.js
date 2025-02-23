//#region Constant and Globals
const apiUrl = "http://ingerberwetrust.com/LAMPAPI"; //api
const exten = "php"; //extension for the api
let userId = 0;
let userN = "";

//#endregion

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

/**
 * Checks each item in the array to check which is nil
 *
 * Returns true if a field is empty.
 * @param {*} fields Array with fields
 */
function checkEmpty(field) {
    for (const elment of field) {
        if (elment === "") {
            return true;
        }
    }
    return false;
}

/**
 * Bakes cookies YUM - I'm going insane
 *
 * saves cookies, Primaraly First and last name, user ID.  All seperated by a |
 *
 * expires 30mins after being saved
 */
function bakeCookies() {
    let date = new Date();
    date.setTime(date.getTime() + (30 * 60 * 1000));
    document.cookie = "username=" + userN + "|userid=" + userId + "expires=" + date.toGMTString();
}

/**
 * Swaps window to the corrosponding html file
 *
 * @param {String} site html location
 */
function sendTo(site) {
    window.location.href = site;
}

/**
 * Attemtps to login the user with the password and username.
 *
 * Sends a JSON package with the username "login" and password "password" in a json format
 */
function startLogin() {
    userId = 0;
    userN = "";
    document.getElementById("loginAlert").innerHTML = "";
    const fields = [
        document.getElementById("loginName").value,
        document.getElementById("loginPass").value
    ];

    if (checkEmpty(fields)) {
        document.getElementById("loginAlert").append(createAlert(
            "<strong>Oops!</strong> Please make sure all fields are filled out.",
            "warning"
        ));

        return 0;
    }

    const jsonload = JSON.stringify({
        username: fields[0],
        password: md5(fields[1])
    });
    // const link = apiUrl + "/Login." + exten;
    const requestUrl = `${apiUrl}/Login.${exten}`;
    const loginAlert = document.getElementById("loginAlert");
    let xhr = new XMLHttpRequest();
    //  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    xhr.open("POST", requestUrl);
    try {
        xhr.onreadystatechange = () => {
            if (reply.responseText === "") {
                loginAlert.append(createAlert(
                    "<strong>Drat!<strong> It seems our servers are having some issues right now. Please try again in a bit.",
                    "danger"
                ));
                return;
            }

            const reply = JSON.parse(xhr.responseText);

            if (xhr.readyState === 4 && xhr.status === 200) {
                userId = reply.id;
                userN = reply.username;
                bakeCookies(); // possibly unneeded
                sendTo("mainPage.html");
            } else if (xhr.status === 400) {
                switch (reply.error) {
                    case "AccountNotFoundError":
                    case "MismatchPasswordError":
                        loginAlert.append(
                            createAlert(`<strong>Oops!</strong> ${reply.message}`, "warning")
                        );
                        break;
                    default:
                        loginAlert.append(createAlert(
                            "<strong>Uh oh!<strong> Something seems to be wrong with the server right now. Please try again at another time",
                            "danger"
                        ));
                }
            } else if (xhr.status === 500) {
                console.error(reply);
                loginAlert.append(createAlert(
                    "<strong>Uh oh!</strong> The server seems to be having problems right now. Please try again in a few minutes.",
                    "danger"
                ));
            } else {
                console.error(reply);
                loginAlert.append(createAlert(
                    "<strong>Sorry!</strong> It seems like something isn't working right...",
                    "danger"
                ));
            }
        }
        xhr.send(jsonload);
    } catch (error) {
        console.error(error);
        loginAlert.append(createAlert(
            "<strong>Yikes!</strong> An error has been encountered! Please try again.",
            "danger"
        ));
    }
}

/**
 * Creates a new user, sends the username and password to API
 *
 * JSON  {username:registerName, password: password}
 */
function startRegister() {
    userN = "";
    userId = 0;
    document.getElementById("registerAlert").innerHTML = "";
    bakeCookies(); //maybe unneaded
    let fields = [
        document.getElementById("registerName").value,
        document.getElementById("registerPass").value
    ];

    if (checkEmpty(fields)) {
        document.getElementById("registerAlert").append(createAlert(
            "<strong>Oops!</strong> Please make sure all fields are filled out.",
            "warning"
        ));

        return 0;
    }
    /*
        let chekPass = document.getElementById("passwordPrime").value
        if(p1 !=== p2)
        {
        document.getElementById("notice").innerHTML = "Passwords do not match!";
        return(0);
        }
    */
    let tempObj = {
        username: fields[0],
        password: md5(fields[1])
    }
    let jsonload = JSON.stringify(tempObj);
    let link = `${apiUrl}/Register.${exten}`;
    const registerAlert = document.getElementById("registerAlert");
    let xhr = new XMLHttpRequest();
    try {
        xhr.open("POST", link, true);
        xhr.onreadystatechange = () => {
            let reply = JSON.parse(xhr.responseText);

            if (xhr.readyState === 4 && xhr.status === 201) {
                userId = reply.id;
                userN = reply.username;
                registerAlert.append(createAlert(
                    "<strong>Hooray!</strong> User Created, please Login.",
                    "success"
                ));
                sendTo("/index.html");
            } else if (xhr.status === 400) {
                registerAlert.append(
                    ((reply.error === "ExistingUserError")
                        ? createAlert(`<strong>Woops!</strong> ${reply.message}`, "warning")
                        : createAlert(
                            [
                                "<strong>Embarrassing!</strong> ",
                                "Something isn't quite right on our end! ",
                                "Please try again."
                            ].join(""),
                            "danger"
                        )
                    )
                );
            } else if (xhr.status === 500) {
                console.error(reply);
                registerAlert.append(createAlert(
                    "<strong>Uh oh!</strong> The server seems to be having problems right now. Please try again in a few minutes.",
                    "danger"
                ));
            } else {
                console.error(reply);
                registerAlert.append(createAlert(
                    "<strong>Sorry!</strong> It seems like something isn't working right...",
                    "danger"
                ));
            }
        }
        xhr.send(jsonload); // send off the package
    } catch (error) {
        console.error(error);
        registerAlert.append(createAlert(
            "<strong>Yikes!</strong> An error has been encountered! Please try again.",
            "danger"
        ));
    }

}
