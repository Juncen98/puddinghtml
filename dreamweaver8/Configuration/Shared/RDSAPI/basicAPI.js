// Copyright 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

var URL = "/CFIDE/main/ide.cfm?CFSRV=IDE&ACTION=ADMINAPI";

//--------------------------------------------------------------------
// FUNCTION:
//   stringToSTR  
//
// DESCRIPTION:
//   Adds a prefix to the specified string containing label STR: and the 
//   string length
//
// ARGUMENTS:
//   str - the string to be updated
//
// RETURNS:
//   a string with a prefix
//--------------------------------------------------------------------
function stringToSTR(str) {
	return 'STR:' + str.length + ':' + str;
}



//--------------------------------------------------------------------
// FUNCTION:
//   buildRequest  
//
// DESCRIPTION:
//   builds a server request
//
// ARGUMENTS:
//   component - the name of the component
//   method - the method name
//   arg - an object containing the arguments to be passed to the method
//   adminPass - administrator password
//
// RETURNS:
//   a string containing the server request
//--------------------------------------------------------------------
function buildRequest(component, method, arg, adminPass) {
	
	var request = '4:';
	var tmp = '';
	
	request += stringToSTR(component);
	request += stringToSTR(method);

	for (var i in arg) {
		tmp += i + ":" + arg[i] + ";";
		if (i.toLowerCase() == 'args') {
			var argsList = arg[i].split(';');
			for (var j in argsList) {
				var argData = argsList[j].split('=');
				tmp += argData[0] + ':' + argData[1] + ';';
			}
		}
	}
	
	if (tmp.length) {
		tmp = tmp.substr(0, tmp.length-1);
	}
	request += stringToSTR(tmp);
	request += stringToSTR(MMDB.getRDSPassword());

	return request;
}



//--------------------------------------------------------------------
// FUNCTION:
//   executeRequest
//
// DESCRIPTION:
//   performs a request from the server
//
// ARGUMENTS:
//   postText - the text to be posted on the server. It is a request
//              returned by a previous call of buildRequest() function
//
// RETURNS:
//   This function returns the server response
//--------------------------------------------------------------------
function executeRequest(postText) {
	var theDOM = dw.getNewDocumentDOM();
	var theResponseObj = MMHttp.postText(getCFServerURL(URL), postText, "", "");
	if (theResponseObj.data.substring(0, 1) == '-') {
		var error = theResponseObj.data.match(/([^\n]*)/gi)[0];
		error = error.substr(error.indexOf(':')+1);
		alert(MM.MSG_CFErrorOccured + error);
		return;
	}
	var theResponse = new String(theResponseObj.data);
	var packetIndex = theResponse.toLowerCase().indexOf("<wddxpacket");
	if (packetIndex >= 0) {
		theResponse = theResponse.substring(packetIndex);
		theResponse = dwscripts.entityNameDecode(theResponse);
		theDOM.documentElement.outerHTML = theResponse;
		return theDOM;
	} else {
		return null;
	}
}



//--------------------------------------------------------------------
// FUNCTION:
//   getCFSiteURL  
//
// DESCRIPTION:
//   returns the current CF site URL
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   current site's URL
//--------------------------------------------------------------------
function getCFSiteURL() {
	var urlPrefix = new String("");
	var currentDOM = dw.getDocumentDOM();
	if (currentDOM != null) {
		urlPrefix = new String(currentDOM.serverModel.getAppURLPrefix());
		if (urlPrefix != "") {
			if (urlPrefix.charAt(urlPrefix.length - 1) != "/") {
				urlPrefix = urlPrefix + "/";
			}
		}
	}
	return urlPrefix;
}



//--------------------------------------------------------------------
// FUNCTION:
//   getCFServerURL()
//
// DESCRIPTION:
//   returns the current CFServer URL
//
// ARGUMENTS:
//   args - arguments to be caoncatened to the base URL
//
// RETURNS:
//   current CFServer URL
//--------------------------------------------------------------------
function getCFServerURL(args) {
	var theURL = new String("");
	var urlPrefix = new String(getCFSiteURL());
	if (urlPrefix != "") {
		var nStartCharToSearchForSingleSlash = urlPrefix.indexOf("//");
		if (nStartCharToSearchForSingleSlash == -1) {
			nStartCharToSearchForSingleSlash = 0;
		}
		else {
			nStartCharToSearchForSingleSlash = nStartCharToSearchForSingleSlash + 2;
		}

		var nLengthWebSiteRootURL = urlPrefix.indexOf("/", nStartCharToSearchForSingleSlash);
		if (nLengthWebSiteRootURL == -1) {
			nLengthWebSiteRootURL = urlPrefix.length;
		}

		var webSiteRootURL = urlPrefix.substring(0, nLengthWebSiteRootURL);
		
		if ((args.charAt[0] == "/") && (webSiteRootURL.charAt[webSiteRootURL.length - 1] == "/")) {
			webSiteRootURL = webSiteRootURL.substring(webSiteRootURL, webSiteRootURL.length - 2);
		}

		theURL = webSiteRootURL + args;
	}

	return theURL;
}



//--------------------------------------------------------------------
// FUNCTION:
//   getAdminPassword()
//
// DESCRIPTION:
//   returns the current CFServer admin password
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   current CFServer admin password
//--------------------------------------------------------------------
function getAdminPassword() {
	return MMDB.getRDSPassword();
}
