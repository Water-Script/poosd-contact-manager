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
    document.getElementById("result").innerHTML = "";
    let fields = [document.getElementById("loginName").value, document.getElementById("loginPass").value]
    if(checkEmpty(fields))
        {
            document.getElementById("result").innerHTML = "Please make sure all fields are filled out";
            return(0);
        } 
    let tempObj = { username: fields[0], password: fields[1]};
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
 * JSON  {username:registerName, password: password}
 */
function startRegister() {
    userN = "";
    userId = 0;
    document.getElementById("notice").innerHTML ="";
    bakeCookies(); //maybe unneaded
   let fields = [document.getElementById("registerName").value,document.getElementById("registerPass").value ];
   if(checkEmpty(fields)){
    document.getElementById("notice").innerHTML = "Please make sure all fields are filled out.";
    return(0);
   }
    /*
        let p2 = document.getElementById("passwordPrime").value
        if(p1 !=== p2)
        {
        //dont go through and leave msg that Passwords don't match
        }
    */
    let tempObj = { username: fields[0], password: fields[1] }
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
                sendTo('/index.html');
                document.getElementById("result").innerHTML = "User Created, Please Login.";
            } else if (this.status === 400) {
                let reply = JSON.parse(xhr.responseText);
                document.getElementById("notice").innerHTML = `ERROR (${reply.error}): ${reply.message}`;
            } else if (this.status === 500) {
                let reply = JSON.parse(xhr.responseText);
                document.getElementById("notice").innerHTML = `SERVER ERROR (${reply.error}): ${reply.message}`;
            }
        }
        xhr.send(jsonload); // send off the package
    } catch (error) {
        document.getElementById("notice").innerHTML = error.message
    }

}

/**
 * Checks each item in the array to check which is nil
 * 
 * Returns true if a field is empty.
 * @param {*} fields Array with fields
 */
function checkEmpty(field){
let flag = false
for(const elment of field){
    if(elment == "") flag  = true;
 }
 return flag;

}

