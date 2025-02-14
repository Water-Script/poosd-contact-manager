//#region 
const apiUrl = 'http//ingerberwetrust.com/LAMPAPI'; //api
const exten = 'PHP'; //extension for the api

let userId = 0;
let firstN = "";
let lastN = "";
//#endregion 

/**
 * Attemtps to login the user with the password and username.
 * sends a json package with the username 'login' and password 'password' in a json format
 * err to connect results in a 
 */
function startLogin(){
    userId =0;
    firstN="";
    lastN ="";
    
    document.getElementById("result").innerHTML = "";
    //hash password here when added
    var tempObj = {login:Document.getElementById("loginName").value,password:Document.getElementById("loginPass").value}
    let jsonload = JSON.stringify(tempObj)

    var link = apiUrl+'/Login' + exten;
    let xhr = new XMLHttpRequest();
    xhr.open("POST", link, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    //setup is done send the request
    try {
        xhr.onreadystatechange = function() 
        {
            if(this.readyState == 4){
                document.getElementById("result").innerHTML = "Connection to server! HUZZAH";
            }
        }
        xhr.send(jsonload); // send off the package
    } catch (err) {
        document.getElementById("result").innerHTML = err.message
    }
    


}

/**
 * Swaps window to the corrosponding site
 * 
 * @param {String} site html location
 */
function sendTo(site){

    window.location.href =site;

}