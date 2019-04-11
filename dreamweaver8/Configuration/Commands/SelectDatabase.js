// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

// *************** GLOBALS VARS *****************

var HELP_DOC = MM.HELP_cmdSelectPHPDSNList;

var DB_NAME_OBJ;
var HOST_NAME_OBJ;
var USERNAME_OBJ;
var PASSWORD_OBJ;

var DB_TYPE = "";


//*************************API**************************

//--------------------------------------------------------------------
// FUNCTION:
//   commandButtons
//
// DESCRIPTION:
//   Returns the array of buttons that should be displayed on the
//   right hand side of the dialog.  The array is comprised
//   of name, handler function name pairs.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   array of strings - name, handler function name pairs
//--------------------------------------------------------------------

function commandButtons()
{
  return new Array(MM.BTN_OK,      "okClicked()", 
                   MM.BTN_Cancel,  "cancelClicked()", 
                   // MM.BTN_Refresh, "refreshClicked()", 
                   MM.BTN_Help,    "displayHelp()" );
}


//--------------------------------------------------------------------
// FUNCTION:
//   okClicked
//
// DESCRIPTION:
//   This function is called when the OK button is clicked.
//   It sets the command return value.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function okClicked()
{
  var retVal = new Array();
  
  retVal.push(DB_NAME_OBJ.get());
  retVal.push(dwscripts.trim(HOST_NAME_OBJ.value));
  retVal.push(dwscripts.trim(USERNAME_OBJ.value));
  retVal.push(PASSWORD_OBJ.value);
  
  dwscripts.setCommandReturnValue(retVal);
  
  // reset the options list
  DB_NAME_OBJ.setAll(new Array(MM.LABEL_Loading));
  
  window.close();
}


//--------------------------------------------------------------------
// FUNCTION:
//   cancelClicked
//
// DESCRIPTION:
//   This function is called when the cancel button is pressed.
//   Set the command return value to blank.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function cancelClicked()
{
  dwscripts.setCommandReturnValue("");
  
  // reset the options list
  DB_NAME_OBJ.setAll(new Array(MM.LABEL_Loading));
  
  window.close();
}


//--------------------------------------------------------------------
// FUNCTION:
//   refreshClicked
//
// DESCRIPTION:
//   This function is called when the refesh button is clicked.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

// no longer needed since the username and password have been removed
// from the SelectDB dialog.
// function refreshClicked()
// {
//  refreshList(DB_NAME_OBJ.get());
// }


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

function displayHelp()
{
  // Replace the following call if you are modifying this file for your own use.
  dwscripts.displayDWHelp(HELP_DOC);
}


//*******************LOCAL FUNCTIONS*********************

//--------------------------------------------------------------------
// FUNCTION:
//   initializeUI
//
// DESCRIPTION:
//   Get the DOM objects for the various UI controls
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function initializeUI()
{
  DB_NAME_OBJ = new ListControl("Database");
  HOST_NAME_OBJ = dwscripts.findDOMObject("HostName");
  USERNAME_OBJ = dwscripts.findDOMObject("UserName");
  PASSWORD_OBJ = dwscripts.findDOMObject("Password");

  // get arguments: dbName, dbType, host name, username, password
  var args = dwscripts.getCommandArguments();
  
  DB_TYPE = args[1];
  HOST_NAME_OBJ.value = args[2];
  USERNAME_OBJ.value = args[3];
  PASSWORD_OBJ.value = args[4];

  // Validate connection
  if (!testConnection(false))
  {
    // Show specific error message
    testConnection(true);

	// Close dialog
	cancelClicked();
  }

  refreshList(args[0]);
}


//--------------------------------------------------------------------
// FUNCTION:
//   refreshList
//
// DESCRIPTION:
//   Updates the list of remote DSN's, and selects the entry
//   matching the given name.
//
// ARGUMENTS:
//   selectedDB - string - the db name to select
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function refreshList(selectedDB)
{
  // Build URL Parameters string. The HTTP Connectivity Scripts expect
  // all parameters (except Type) to be in ADO Connection String format
  // and passed as the "ConnectionString" URL Parameter
  
  var urlParams = "Type=" + DB_TYPE + "&ConnectionString=";

  var host = dwscripts.trim(HOST_NAME_OBJ.value);
  if (host != "")
  {
    urlParams += "host=" + host + ";";
  }

  var uid = dwscripts.trim(USERNAME_OBJ.value);
  if (uid != "")
  {
    urlParams += "uid=" + uid + ";";
  }

  var pwd = dwscripts.trim(PASSWORD_OBJ.value);
  if (pwd != "")
  {
    urlParams += "pwd=" + pwd + ";";
  }

  if (urlParams != "")
  {
	urlParams += "&Host=" + host + "&";
	urlParams += "&Database=" + "&";
	urlParams += "UserName=" + uid + "&";
	urlParams += "Password=" + pwd + "&";
	urlParams += "Timeout=30";
  }

  var remoteDBs = MMDB.getRemoteDsnList(urlParams);
  DB_NAME_OBJ.setAll(remoteDBs, remoteDBs);

  if (!DB_NAME_OBJ.pickValue(selectedDB))
  {
    DB_NAME_OBJ.setIndex(0);
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   testConnection
//
// DESCRIPTION:
//   Validates the current connection and displays a success or failure
//   message if specified.
//
//   This function was copied from Connection_php_mysql.js
//
// ARGUMENTS:
//   showMessage  true/false to display messages from MMDB.testConnection
//
// RETURNS:
//   true/false
//--------------------------------------------------------------------

function testConnection(showMessage)
{
	// build tokens array
	var tokens = new Object();

	tokens.hostname = dwscripts.trim(HOST_NAME_OBJ.value);
	tokens.username = dwscripts.trim(USERNAME_OBJ.value);
	tokens.password = PASSWORD_OBJ.value;
	tokens.databasename = "";
	tokens.http = "true";
	tokens.type = "MYSQL";
	tokens.string = "type=MYSQL;host=" + tokens.hostname + ";db="  + tokens.databasename + ";uid=" + tokens.username + ";pwd=" + tokens.password + ";";
	tokens.customURLParams = "Host=" + tokens.hostname + "&Database=" + tokens.databasename;

    return MMDB.testConnection(tokens, showMessage);
}  
