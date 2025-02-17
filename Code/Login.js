const md5 = require("./md5");

//#region Constant and Globals
const apiUrl = 'http://ingerberwetrust.com/LAMPAPI'; //api
const exten = 'php'; //extension for the api

let userId = 0;
let UserN = "";

//#endregion 

/** 
 * Attemtps to login the user with the password and username.
 * 
 * Sends a JSON package with the username 'login' and password 'password' in a json format
 */
function startLogin() {
    userId = 0;
    UserN = "";
    //hash password here when added
    var tmpPass = document.getElementById("loginPass").value;
    var md5Password = md5(tmpPass);
    var tempObj = { username:document.getElementById("loginName").value, password:md5Password};
    let jsonload = JSON.stringify(tempObj);
    var link = apiUrl + '/Login.' + exten;


    let xhr = new XMLHttpRequest();
    xhr.open("POST", link, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    //setup is done send the request
    try {
        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                var replyObj = JSON.parse(xhr.responseText)
                userId = replyObj.id;
                userN = replyObj.username;
                bakeCookies();
                sendTo('index.html');
            } else{
                document.getElementById("result").innerHTML = "Username or Password is incorrect"
            }
        }
        xhr.send(jsonload); // send off the package
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
    ;
    var date = new Date();
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
 * JSON = username: registerName, password: registerPass}
 */
function startRegister() {
    userN = "";
    userId = 0;
    document.getElementById("notice").innerHTML = "";
    bakeCookies();
    // Grab password  and compare with the entered here
    var tmpPass = document.getElementById("registerPass").value;
    /*
        var p2 = document.getElementById("passwordPrime").value
        if(p1 !=== p2) 
        {
        //dont go through and leave msg that Passwords don't match
        }
    */
   hashedPass = md5(tmpPass);
    var tempObj ={username:document.getElementById("registerName").value, password:p1}
    let jsonload = JSON.stringify(tempObj);
    var link = apiUrl + '/Register.' + exten;
    let xhr = new XMLHttpRequest();
    xhr.open("POST", link, true)
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    try {
        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                var replyObj = JSON.parse(xhr.responseText)
                userId = replyObj.id;
                userN = replyObj.username;
                sendTo('draftIndex.html');
            } else{
                document.getElementById("notice").innerHTML = "Account already exist"
            }
        }
        xhr.send(jsonload); // send off the package
    } catch (error) {
        document.getElementById("notice").innerHTML = error.message

    }

    




}