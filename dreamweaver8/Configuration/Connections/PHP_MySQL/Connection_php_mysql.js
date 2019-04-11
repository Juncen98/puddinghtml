// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

// *************** GLOBALS VARS *****************

var HELP_DOC = MM.HELP_connPHP;

var PARTICIPANT_FILE = "connection_includefile";

var CONN_NAME_OBJ;
var HOST_NAME_OBJ;
var DB_NAME_OBJ;
var USERNAME_OBJ;
var PASSWORD_OBJ;
var CONN_TYPE_OBJ;
var DSN_NAME_OBJ;
var DSN_LIST = new Array();
var SKIP_PASSWORD_WARNING;

var USE_HTTP = true;


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

function commandButtons()
{
  return new Array(MM.BTN_OK,     "", 
                   MM.BTN_Cancel, "", 
                   MM.BTN_Test,   "clickedTest()", 
                   MM.BTN_Help,   "displayHelp()")
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

function findConnection(text)
{
  var part = new Participant(PARTICIPANT_FILE);
  var connParams = part.findInString(text);
  
  if (connParams != null)
  {
    if (dwscripts.IS_MAC)  // only use http connectivity on the mac
    {
      connParams.http = "true";
    }

    if (connParams.designtimeType == undefined) // Migrate from v4 to v5
    {
        connParams.designtimeType = connParams.type;
        connParams.type = "MYSQL";
    }

    // specify the include statement that's used to include this connection
    connParams.includePattern = 
        "/<\\?php\\s+(require|include)(_once)?\\([\"']([^'\"]*)Connections\\/" + connParams.cname +  "\\.php[\"']\\);?\\s*\\?>/"
    if (connParams.http == "true")
    {
      connParams.usesDesigntimeInfo = false;
      connParams.string = "type=MYSQL;host=" + connParams.hostname + ";db="  + connParams.databasename + ";uid=" + connParams.username + ";pwd=" + connParams.password + ";";
	  connParams.customURLParams = "Host=" + connParams.hostname + "&Database=" + connParams.databasename;
    }
    else
    {
      connParams.usesDesigntimeInfo = true;
    }

    // specify the variables that are defined in the connection file
    connParams.variables = new Object();
    connParams.variables["$hostname_" + connParams.cname] = '"' + connParams.hostname + '"';
    connParams.variables["$database_" + connParams.cname] = '"' + connParams.databasename + '"';
    connParams.variables["$username_" + connParams.cname] = '"' + connParams.username + '"';
    connParams.variables["$password_" + connParams.cname] = '"' + connParams.password + '"';
    connParams.variables["$" + connParams.cname] = "mysql_pconnect(\"" + connParams.hostname + "\",\"" + connParams.username + "\",\"" + connParams.password + "\")";
  }

  return connParams;
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

function applyConnection()
{
  var code = "";
  
  if (isValid())
  {  
    // build tokens array
    connParams = new Object();
    connParams.cname = dwscripts.trim(CONN_NAME_OBJ.value);
    connParams.hostname = dwscripts.trim(HOST_NAME_OBJ.value);
    connParams.username = dwscripts.trim(USERNAME_OBJ.value);
    connParams.password = PASSWORD_OBJ.value;
    connParams.databasename = dwscripts.trim(DB_NAME_OBJ.value);
    connParams.filename = "Connection_php_mysql.htm";
    connParams.type = "MYSQL";

    if (USE_HTTP)
    {
      connParams.http = "true";
      connParams.designtimeType = "MYSQL";
      connParams.designtimeString = "";
    }
    else
    {
      connParams.http = "false";
      connParams.designtimeType = "ADO";

      // var dsn = DSN_NAME_OBJ.get();
      // JALBANO: connParams.designtimeString = "\"" + buildDSNConnectionString(dsn) + "\"";
      // connParams.designtimeString = buildDSNConnectionString(dsn, connParams.username, connParams.password);
    }

    var part = new Participant(PARTICIPANT_FILE);

    code = part.getInsertString(connParams);
  }
  
  return code;
}


//--------------------------------------------------------------------
// FUNCTION:
//   inspectConnection
//
// DESCRIPTION:
//   Set the UI controls based on the given connection parameters.
//   This function is called after initializeUI.
//
//   NOTE: This function does not work like the other JavaScript API
//     inspect functions.  This function is always called, even 
//     for a new connection, and in this case, it is used to clear 
//     the form element fields.
//
// ARGUMENTS:
//   connParams - object - connection record returned from findConnection
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function inspectConnection(connParams)
{ 
  if (connParams.updateExisting)
  {
    USE_HTTP = (connParams.http == "true");
    if (dwscripts.IS_MAC)
    {
      USE_HTTP = true;
    }
  }
    
  CONN_NAME_OBJ.value = connParams.name;
  HOST_NAME_OBJ.value = (typeof(connParams.hostname) == "undefined") ? "" : connParams.hostname;
  DB_NAME_OBJ.value = (typeof(connParams.databasename) == "undefined") ? "" : connParams.databasename;
  USERNAME_OBJ.value = connParams.username;
  PASSWORD_OBJ.value = connParams.password;

  // Set design-time connect radio button
  if (CONN_TYPE_OBJ != null)
  {
    var index = (USE_HTTP) ? 0 : 1;
    CONN_TYPE_OBJ[index].checked = true;

    // DSN_LIST = MMDB.getLocalDsnList();
    // DSN_NAME_OBJ.setAll(DSN_LIST, DSN_LIST);

    // if (!USE_HTTP)
    // {
    //  var decodedContents = decodeDSNConnectionString(connParams.designtimeString);

    //  if (decodedContents.length > 0 &&
    //    !DSN_NAME_OBJ.pickValue(decodedContents[0]))
    //  {
    //    DSN_NAME_OBJ.setIndex(0);
    //  }
    // }
  }

  updateControls(USE_HTTP);

  // this function is always called, not just on re-edit,
  // so we check the updateExisting flag to determine
  // if we are re-editing.
  if (connParams.updateExisting)
  {
    CONN_NAME_OBJ.setAttribute("disabled","true");
    HOST_NAME_OBJ.focus();
  }
  else
  {
    CONN_NAME_OBJ.focus();
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

function clickedTest()
{
  if (isValid())
  {  
    testConnection(true);
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
	tokens.databasename = dwscripts.trim(DB_NAME_OBJ.value);
    
	if (USE_HTTP)
    {
      tokens.http = "true";
      tokens.type = "MYSQL";
      tokens.string = "type=MYSQL;host=" + tokens.hostname + ";db="  + tokens.databasename + ";uid=" + tokens.username + ";pwd=" + tokens.password + ";";
      tokens.customURLParams = "Host=" + tokens.hostname + "&Database=" + tokens.databasename;
    }
    else
    {
      tokens.http = "false";
      tokens.type = "ADO";

      // var dsn = DSN_NAME_OBJ.get();
      // JALBANO: tokens.string = "\"" + buildDSNConnectionString(dsn) + "\"";
      // tokens.string = buildDSNConnectionString(dsn, tokens.username, tokens.password);
    }

    return MMDB.testConnection(tokens, showMessage);
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

function displayHelp()
{
  // Replace the following call if you are modifying this file for your own use.
  dwscripts.displayDWHelp(HELP_DOC);
}


// ***************** LOCAL FUNCTIONS  ******************

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
  CONN_NAME_OBJ = dwscripts.findDOMObject("ConnectionName");
  HOST_NAME_OBJ = dwscripts.findDOMObject("HostName");
  DB_NAME_OBJ = dwscripts.findDOMObject("DatabaseName");
  USERNAME_OBJ = dwscripts.findDOMObject("UserName");
  PASSWORD_OBJ = dwscripts.findDOMObject("Password");
  // CONN_TYPE_OBJ = dwscripts.findDOMObject("connectType");
  // DSN_NAME_OBJ = new ListControl("dsn");
  
  USE_HTTP = true ;
  SKIP_PASSWORD_WARNING = false ;
    
  // if (CONN_TYPE_OBJ == null)
  // {
  //  USE_HTTP = true;
  // }
  // {
    // set the default value
    var index = (USE_HTTP ? 0 : 1);
    // CONN_TYPE_OBJ[index].checked = true;
  // }
  
  CONN_NAME_OBJ.removeAttribute("disabled");  
  CONN_NAME_OBJ.focus();
}


//--------------------------------------------------------------------
// FUNCTION:
//   updateControls
//
// DESCRIPTION:
//   Updates the enabled/disabled state of the controls based on
//   the selected connection type.
//
// ARGUMENTS:
//   useHTTP - boolean - true if using HTTP connectivity, false otherwise.
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function updateControls(useHTTP)
{
  USE_HTTP = useHTTP;
  
  // if (DSN_NAME_OBJ != null)
  // {
    if (USE_HTTP)
    {
      // document.theForm.dsn.setAttribute("disabled","true");
      // document.theForm.ODBC_button.setAttribute("disabled","true");
      document.theForm.DB_button.removeAttribute("disabled");
    }
    else
    {
      // document.theForm.dsn.removeAttribute("disabled");
      // document.theForm.ODBC_button.removeAttribute("disabled");
      document.theForm.DB_button.setAttribute("disabled","true");
    }
  // }
}


//--------------------------------------------------------------------
// FUNCTION:
//   selectDatabase
//
// DESCRIPTION:
//   Launches the database selection dialog, and update the UI
//   values based on the returned values.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function selectDatabase()
{
  var args = new Array();
  var retVal = "";

  if (USERNAME_OBJ.value == "" && PASSWORD_OBJ.value == "")
  {
    alert(MM.MSG_MustSelectUserNamePassword)
    return
  }

  args.push(dwscripts.trim(DB_NAME_OBJ.value));
  args.push("MYSQL");
  args.push(dwscripts.trim(HOST_NAME_OBJ.value));
  args.push(dwscripts.trim(USERNAME_OBJ.value));
  args.push(PASSWORD_OBJ.value);

  // Validate connection code moved to SelectDatabase dialog because
  // testing the connection here was causing this dialog to be displayed
  // in front of the SelectDatabase dialog in some cases.
  retVal = dwscripts.callCommand("SelectDatabase.htm", args);
  
  if (retVal != null && retVal != "")
  {
    // Selected database
    DB_NAME_OBJ.value = retVal[0];

    // Also, propagate changes to other fields back to connection
    // HOST_NAME_OBJ.value = retVal[1];
    // USERNAME_OBJ.value = retVal[2];
    // PASSWORD_OBJ.value = retVal[3];
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   clickedODBC
//
// DESCRIPTION:
//   Called when the user clicks the Define button
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function clickedODBC()
{
  MMDB.showOdbcDialog();
  // DSN_LIST = MMDB.getLocalDsnList();
  // DSN_NAME_OBJ.setAll(DSN_LIST, DSN_LIST);
}


//--------------------------------------------------------------------
// FUNCTION:
//   isValid
//
// DESCRIPTION:
//   Checks if the current values entered in the dialog are valid.
//   Displays an error message if a problem is found.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   boolean - true if the dialog values are valid
//--------------------------------------------------------------------

function isValid()
{
  var retVal = true;
  
  //connection name
  if (retVal)
  {
    retVal = isValidConnectionName(CONN_NAME_OBJ);
  }
  if (retVal)
  {
    if (DB_NAME_OBJ.value == "")
    {
      alert(MM.MSG_MySQLRequiresDatabase);
      document.theForm.DatabaseName.focus();
      return false;
    }
  }
  
  //host name
  if (retVal)
  {
    if (HOST_NAME_OBJ.value == "")
    {
      if ( dwscripts.informDontShow(MM.MSG_MySQLWantsHostName,"Extensions\\Connections\\PHPConnection","SkipHostConnectionWarning") == true )
      {
        document.theForm.HostName.focus();
        return false;
      }
    }
  }

  //user name check
  if (retVal)
  {
    if (USERNAME_OBJ.value == "")
    {
      if ( dwscripts.informDontShow(MM.MSG_MySQLWantsUserName,"Extensions\\Connections\\PHPConnection","SkipUserNameConnectionWarning") == true )
      {
        document.theForm.UserName.focus();
        return false;
      }
    }
  }


 //user name check
  if (retVal)
  {
    if (PASSWORD_OBJ.value == "")
    {
	  if ( !SKIP_PASSWORD_WARNING )
	  {
        if ( dwscripts.informDontShow(MM.MSG_MySQLWantsPassword,"Extensions\\Connections\\PHPConnection","SkipPasswordConnectionWarning") == true )
        {
          document.theForm.Password.focus();
		  SKIP_PASSWORD_WARNING = true;
          return false;
        }
	  }
	  else
	  {
	  	return true;
	  }
    }
  }
  
  return retVal;
}
