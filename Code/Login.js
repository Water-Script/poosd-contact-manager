//#region Constant and Globals
const apiUrl = 'http://Ingerberwetrust.com/LAMPAPI'; //api
const exten = 'php'; //extension for the api

let userId = 0;
let firstN = "";
let lastN = "";
//#endregion 

/** 
 * Attemtps to login the user with the password and username.
 * 
 * Sends a JSON package with the username 'login' and password 'password' in a json format
 */
function startLogin() {
    userId = 0;
    firstN = "";
    lastN = "";


    //hash password here when added

    var tempObj = { login:document.getElementById("loginName").value, password:document.getElementById("loginPass").value };
    let jsonload = JSON.stringify(tempObj);
    var link = apiUrl + '/Login.' + exten;


    let xhr = new XMLHttpRequest();
    xhr.open("POST", link, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    //setup is done send the request
    try {
        document.getElementById("result").innerHTML = link;
        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                var replyObj = JSON.parse(xhr.responseText)
                userId = replyObj.id;
                firstN = replyObj.firstname;
                lastN  = replyObj.lastN;
                bakeCookies();
                sendTo('index.html');
            } else{
                document.getElementById("result").innerHTML = "Username or Password is incorrect"
            }
        }
        xhr.send(jsonload); // send off the package
    } catch (err) {
        document.getElementById("result").innerHTML = err.message
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
    ;
    var date = new Date();
    date.setTime(date.getTime() + (30 * 60 * 1000));
    document.cookie = "firstname=" + firstN + "|lastname=" + lastN + "|userid=" + userId + "expires=" + date.toGMTString();

}

/**
 * Swaps window to the corrosponding html file
 * 
 * @param {String} site html location
 */
function sendTo(site) {

    window.location.href = site;

}