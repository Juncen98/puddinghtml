// Copyright 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

// *************** GLOBALS VARS *****************

//var HELP_DOC = MM.HELP_connPHP;
var debugURL = "/CFIDE/main/ide.cfm?CFSRV=IDE&ACTION=DBFuncs";

var isAdvanced = false;

//var MSG_WantsHostName = 
//   "You have not specified a hostname. Most production environments\n" +
//   "require a host name for database connectivity.\n";
//var MSG_WantsUserName =
//   "You have not specified a username. Most production environments\n" +
//   "require a username for database connectivity.\n";
//var MSG_WantsPassword =
//   "You have not specified a password. Most production environments\n" +
//   "require a password for database connectivity.\n";
//var MSG_RequiresDatabase = 
//   "Please specify a Database. Most production environments\n" +
//   "require a database name.\n" ;
//var MSG_DSNAlreadyExists = 
//   "You have specified a Data Source Name that already exists on the server.\n" +
//   "Please specify another valid DSN.\n";
//var MSG_DataSourceTestOK = 
//   "Connection was made successfully.";
//var MSG_DataSourceTestError = 
//   "There were some errors while testing your Data Source.";

// ******************* API **********************
//--------------------------------------------------------------------
// FUNCTION:
//   commandButtons
//
// DESCRIPTION:
//   Returns the array of buttons that should be displayed on the
//   right hand side of the connection dialog.  The array is comprised
//   of name, handler function name pairs.
//
//   Note: the handler functions for OK and Cancel are left blank,
//   because these are handled automatically by the Conection dialog
//   API.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   array of strings - name, handler function name pairs
//--------------------------------------------------------------------
function commandButtons() {
	return new Array(
				MM.BTN_OK,     "clickedOK()", 
				MM.BTN_Cancel, "clickedCancel()", 
				MM.BTN_Test,   "clickedTest()", 
				MM.BTN_Help,   "displayHelp()")
}



//--------------------------------------------------------------------
// FUNCTION:
//   clickedAdvanced
//
// DESCRIPTION:
//   This function is called when user clicks Show/Hide Advanced Settings
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function clickedAdvanced() {
	var _Button = dwscripts.findDOMObject("AdvancedButton");
	var _DivAdvanced = dwscripts.findDOMObject("AdvancedSettingsDiv");
	if (!isAdvanced) {
		var UIPieces = dw.getDocumentDOM(AdvancedSettingsFileName);
		var content1 = UIPieces.documentElement.getElementsByTagName("body").item(0).innerHTML;
		var UIPieces = dw.getDocumentDOM("../AdvancedSettings/Conn_CF_common_Adv.htm");
		var content2 = UIPieces.documentElement.getElementsByTagName("body").item(0).innerHTML;
		_DivAdvanced.innerHTML = content1 + content2;
		window.resizeToContents();
		isAdvanced = true;
		_Button.setAttribute("value", MM.BTN_HideAdvancedSettings);
		inspectConnection_advanced();
	} else {
		var elem = _DivAdvanced.getElementsByTagName("input");
		for (var i=0; i<elem.length; i++) {
			if (elem[i].getAttribute("name") == "theCFPassword") {
				PASSWORD_OBJ = null;
			}
		}
		_DivAdvanced.innerHTML = "";
		window.resizeToContents();
		isAdvanced = false;
		_Button.setAttribute("value", MM.BTN_ShowAdvancedSettings);
	}
}


//--------------------------------------------------------------------
// FUNCTION:
//   clickedTest
//
// DESCRIPTION:
//   Tests the current connection and displays a success or failure
//   message.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function clickedTest() {

	var isEditMode = false;
	if (MM.DSStructure) {
		isEditMode = true;
	}

	var connectionName = CONN_NAME_OBJ.value;

//	if ((!CONN_NAME_OBJ.getAttribute("disabled")) || (CONN_NAME_OBJ.getAttribute("disabled") != "true")) {
	if (!isEditMode) {
		var exists = existsDatasource(CONN_NAME_OBJ.value);
		if (exists == true) {
			alert(MM.MSG_DSNAlreadyExists);
			document.theForm.ConnectionName.focus()
			return;
		} else if (exists == -1) {
			return;
		}
//	} else {
//		do {
//			connectionName += '_';
//		} while (existsDatasource(connectionName));
	}

	if ((PASSWORD_OBJ) && (PASSWORD_OBJ.value)) {
		var isOK = ((MM.DSPassword == PASSWORD_OBJ.value) || (!isEditMode));
	} else {
		var isOK = true;
	}
	if (!isOK) {
		if (confirm("By changing the password for this connection, you will lose the original one. Are you sure you want to continue ?")) {
			isOK = true;
		} else {
			if (confirm("Do you want to restore the original password ?")) {
				PASSWORD_OBJ.value = MM.DSPassword;
			}
		}
	}
	
	var params = getParams();
	if (!params) {
		return;
	}
	params.name = connectionName;
	
	if (isOK) {
		if (createDatasource(params)) {
			var postText = "5:";
			postText += stringToSTR(connectionName);
			postText += stringToSTR('TABLEINFO');
			postText += stringToSTR('');
			postText += stringToSTR('');
			postText += stringToSTR(getAdminPassword());
	
			var theResponseObj = MMHttp.postText(getCFServerURL(debugURL), postText, "", "");
			var theResponse = new String(theResponseObj.data);
			if (theResponse[0] == '-') {
				alert(theResponse);
			} else {
				alert(MM.MSG_DataSourceTestOK);
			}
	
			if (isEditMode) {
				params = getParamsFromStructure(MM.DSStructure);
				params.name = connectionName;
				createDatasource(params);
			} else {
				deleteDSN(connectionName);
			}
		}
	}
}



//--------------------------------------------------------------------
// FUNCTION:
//   displayHelp
//
// DESCRIPTION:
//   Displays the built-in Dreamweaver help.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function displayHelp() {
	// Replace the following call if you are modifying this file for your own use.
	dwscripts.displayDWHelp(HELP_DOC);
}



//--------------------------------------------------------------------
// FUNCTION:
//   clickedOK
//
// DESCRIPTION:
//   This function is called when user clicks OK button
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function clickedOK() {
	// if it's not in Edit mode
	if (!MM.DSStructure) {
		var existsDS = existsDatasource(CONN_NAME_OBJ.value);
		if (existsDS) {
			if (existsDS == -1) {
				return;
			}
			alert(MM.MSG_DSNAlreadyExists);
			document.theForm.ConnectionName.focus()
			return;
		}
	}
	if (createDatasource(getParams())) {
		refreshDSList();
		window.close();
	}
}



//--------------------------------------------------------------------
// FUNCTION:
//   clickedCancel
//
// DESCRIPTION:
//   Closes the current window. This function is called when the user
//   clicks the Cancel button.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function clickedCancel() {
	window.close();
}



//--------------------------------------------------------------------
// FUNCTION:
//   findConnection
//
// DESCRIPTION:
//   Returns a JavaScript object which indicates the parameters
//   found in the given connection file text.  If no parameters
//   are found, null is returned.
//
// ARGUMENTS:
//   text - string - the text of a connection file
//
// RETURNS:
//   JavaScript object - connection parameters
//--------------------------------------------------------------------
function findConnection(text) {
}



//--------------------------------------------------------------------
// FUNCTION:
//   applyConnection
//
// DESCRIPTION:
//   Returns the code that should be inserted into the connection
//   include file.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string - connection code
//--------------------------------------------------------------------
function applyConnection() {
	var code = "";
	return code;
}
