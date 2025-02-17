//#region Constant and Globals
const apiUrl = 'http://ingerberwetrust.com/LAMPAPI'; //api
const exten = 'php'; //extension for the api
let userId = 0;
let userN = "";

//#endregion

/**
 * Attemtps to login the user with the password and username.
 *
 * Sends a JSON package with the username 'login' and password 'password' in a json format
 */
function startLogin() {
    userId = 0;
    userN = "";

    let tmpPass = document.getElementById("loginPass").value;
    //let md5Hash = md5(tmpPass);
    let tempObj = { username: document.getElementById("loginName").value, password: tmpPass };
    let jsonload = JSON.stringify(tempObj);
    let link = apiUrl + '/Login.' + exten;


    let xhr = new XMLHttpRequest();
    xhr.open("POST", link, true);
  //  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    try {
        xhr.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                let replyObj = JSON.parse(xhr.responseText);
                userId = replyObj.id;
                userN = replyObj.username;
                bakeCookies(); // possibly unneeded
                sendTo('mainPage.html');
            } else if (this.status === 400) {
                let reply = JSON.parse(xhr.responseText);
                document.getElementById("result").innerHTML = `ERROR (${reply.error}): ${reply.message}`;
            }
            else if (this.status === 500) {
                let reply = JSON.parse(xhr.responseText);
                document.getElementById("result").innerHTML = `SERVER ERROR (${reply.error}): ${reply.message}`;
            }

        }
        xhr.send(jsonload);
    } catch (error) {
        document.getElementById("result").innerHTML = error.message
    }



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
 * Creates a new user, sends the username and password to API
 *
 * JSON  {username:registerName, password: MD5 Hashed password}
 */
function startRegister() {
    userN = "";
    userId = 0;
    bakeCookies(); //maybe unneaded
    let tmpPass = document.getElementById("registerPass").value;
    /*
        let p2 = document.getElementById("passwordPrime").value
        if(p1 !=== p2)
        {
        //dont go through and leave msg that Passwords don't match
        }
    */
    // hashedPass = md5(tmpPass);
    let tempObj = { username: document.getElementById("registerName").value, password: tmpPass }
    let jsonload = JSON.stringify(tempObj);
    let link = apiUrl + '/Register.' + exten;
    //document.getElementById("notice").innerHTML = "test";
    let xhr = new XMLHttpRequest();
    xhr.open("POST", link, true)
    //document.getElementById("notice").innerHTML = "Going to send";
    try {
        xhr.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 201) {
                let replyObj = JSON.parse(xhr.responseText)
                userId = replyObj.id;
                userN = replyObj.username;
                document.getElementById("result").innerHTML = "User CreatMade ed, Please Login.";
                sendTo('/index.html');
            } else if (this.status === 400) {
                let reply = JSON.parse(xhr.responseText);
                document.getElementById("result").innerHTML = `ERROR (${reply.error}): ${reply.message}`;
            } else if (this.status === 500) {
                let reply = JSON.parse(xhr.responseText);
                document.getElementById("result").innerHTML = `SERVER ERROR (${reply.error}): ${reply.message}`;
            }
        }
        xhr.send(jsonload); // send off the package
    } catch (error) {
        document.getElementById("notice").innerHTML = error.message
    }

}

