// Copyright 2005 Macromedia, Inc. All rights reserved.

//*************** GLOBALS VARS *****************
var MAX_TIMEOUT = 50;  // Maximum 50 requests on the server
var CFLiveDebug_wasError = false;
var CFLiveDebug_IPList;
var CFLiveDebug_debugState = "";
var CFLiveDebug_currentIP;

function getInitialConfiguration() {
	CFLiveDebug_IPList = getCFDebugIPList();
	CFLiveDebug_debugState = getDebugState();
	CFLiveDebug_currentIP = getCurrentIP();
}


//--------------------------------------------------------------------
// FUNCTION:
//   getCFDebugIPList  
//
// DESCRIPTION:
//   Returns a list containing IP debug list
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   IP list
//--------------------------------------------------------------------
function getCFDebugIPList() {
	if (CFLiveDebug_wasError) {
		return;
	}
	var param = new Object();
	param.adminPassword = getAdminPassword();
	var theDOM = executeRequest(buildRequest("cfide.adminapi.debugging", "getIPList", param, param.adminPassword));
	if (!theDOM) {
//		alert(MM.MSG_CFError);
		CFLiveDebug_wasError = true;
		return;
	}
	var currIP = theDOM.getElementsByTagName("string");
	if (currIP.length) {
		currIP = currIP[0].innerHTML;
	} else {
		alert(MM.MSG_CFError);
		CFLiveDebug_wasError = true;
		return;
	}
	return currIP;
}



//--------------------------------------------------------------------
// FUNCTION:
//   existsIPWithinIPList
//
// DESCRIPTION:
//   This function looks for a specified IP within a IP List
//
// ARGUMENTS:
//   currIP - the IP to be analysed
//   IPList - a list of IPs
//
// RETURNS:
//   true if the specified IP exists, false otherwise
//--------------------------------------------------------------------
function existsIPWithinIPList(currIP, IPList) {
	if (CFLiveDebug_wasError) {
		return;
	}
	var exists = false;
	for (var i=0; i<IPList.length; i++) {
		if (IPList[i] == currIP) {
			exists = true;
			break;
		}
	}
	return exists;
}



//--------------------------------------------------------------------
// FUNCTION:
//   restoreCFDebugIPList
//
// DESCRIPTION:
//   Restores the IP Debug List. IF current IP was added then it should
//   be deleted
//
// ARGUMENTS:
//   currIP - IP to be tested. If it wasn't before within the IP Debug List
//            we should remove it
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function restoreCFDebugIPList(IPList, currIP) {
	if (CFLiveDebug_wasError) {
		return;
	}
	if (!existsIPWithinIPList(currIP, IPList)) {
		deleteIPFromDebugList(currIP);
	}
}



//--------------------------------------------------------------------
// FUNCTION:
//   
//
// DESCRIPTION:
//   
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   current IP
//--------------------------------------------------------------------
function getCurrentIP() {
	if (CFLiveDebug_wasError) {
		return;
	}
	var theDOM = executeRequest(buildRequest("cfide.adminapi.debugging", "getCurrentIP", null, getAdminPassword()));
	if (!theDOM) {
		alert(MM.MSG_CFError);
		CFLiveDebug_wasError = true;
		return;
	}
	var currIP = theDOM.getElementsByTagName("string");
	if (currIP.length) {
		currIP = currIP[0].innerHTML;
	} else {
		alert(MM.MSG_CFError);
		CFLiveDebug_wasError = true;
		return;
	}
	return currIP;
}


//--------------------------------------------------------------------
// FUNCTION:
//   
//
// DESCRIPTION:
//   
//
// ARGUMENTS:
//   IP - IP address or a list of IP addresses to be added
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function addIPToDebugList(IP) {
	if (CFLiveDebug_wasError) {
		return;
	}
	var param = new Object();
	param.debugip = IP;
	executeRequest(buildRequest("cfide.adminapi.debugging", "setIP", param, getAdminPassword()));
}


//--------------------------------------------------------------------
// FUNCTION:
//   
//
// DESCRIPTION:
//   
//
// ARGUMENTS:
//   IP - IP address or a list of IP addresses to be deleted
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function deleteIPFromDebugList(IP) {
	if (CFLiveDebug_wasError) {
		return;
	}
	var param = new Object();
	param.debugip = IP;
	executeRequest(buildRequest("cfide.adminapi.debugging", "deleteIP", param, getAdminPassword()));
}


//--------------------------------------------------------------------
// FUNCTION:
//   
//
// DESCRIPTION:
//   
//
// ARGUMENTS:
//   IP - IP address or a list of IP addresses to be deleted
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function getDebugState() {
	if (CFLiveDebug_wasError) {
		return;
	}
	var param = new Object();
	param.propertyName = "enableDebug";
	var theDOM = executeRequest(buildRequest("cfide.adminapi.debugging", "getDebugProperty", param, getAdminPassword()));
	if (!theDOM) {
		alert(MM.MSG_CFError);
		CFLiveDebug_wasError = true;
		return;
	}
//	alert(theDOM.documentElement.outerHTML);
	var debugState = theDOM.getElementsByTagName("boolean");
	if (debugState.length) {
		debugState = debugState[0].getAttribute('value');
	} else {
		debugState = theDOM.getElementsByTagName("string");
		if (debugState.length) {
			debugState = debugState[0].innerHTML;
		} else {
			alert(MM.MSG_CFError);
			CFLiveDebug_wasError = true;
			return;
		}
	}
	return debugState;
}


//--------------------------------------------------------------------
// FUNCTION:
//   
//
// DESCRIPTION:
//   
//
// ARGUMENTS:
//   IP - IP address or a list of IP addresses to be deleted
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function setDebugState(state) {
	if (CFLiveDebug_wasError) {
		return;
	}
	if( state == "" ){
		return;
	}
	
	var param = new Object();
	param.propertyName = "enableDebug";
	param.propertyValue = state;
	executeRequest(buildRequest("cfide.adminapi.debugging", "setDebugProperty", param, getAdminPassword()));
}



//--------------------------------------------------------------------
// FUNCTION:
//   enableRemoteDebuggingSettings  
//
// DESCRIPTION:
//   Turns on remote debugging for this client on the server
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   none
//--------------------------------------------------------------------
function enableRemoteDebuggingSettings() 
{
	var waitTimeout = 0;

	getInitialConfiguration();
	if (CFLiveDebug_wasError) {
		CFLiveDebug_wasError = false;
		return;
	}

	if (getDebugState().toLowerCase() != 'true') {
		setDebugState("true");
		waitTimeout = 0;
		// Wait until the server updates my request: ENABLE DEBUGGING
		while ((getDebugState().toLowerCase() != 'true') && (waitTimeout<MAX_TIMEOUT)) {
			waitTimeout++;
		}
	}

	var currentIP = getCurrentIP();
	addIPToDebugList(currentIP);

	waitTimeout = 0;
	// Wait until the server updates my request: ADD CURRENT IP
	while ((existsIPWithinIPList(currentIP, getCFDebugIPList())) && (waitTimeout<MAX_TIMEOUT)) {
		waitTimeout++;
	}
}


//--------------------------------------------------------------------
// FUNCTION:
//   restoreRemoteDebuggingSettings  
//
// DESCRIPTION:
//   Reverts and changes we made on the server back to their orignal state
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   none
//--------------------------------------------------------------------
function restoreRemoteDebuggingSettings() 
{
	if (CFLiveDebug_IPList != null)
	{
		restoreCFDebugIPList(CFLiveDebug_IPList.split(','), CFLiveDebug_currentIP);
		setDebugState(CFLiveDebug_debugState);
	}
}
