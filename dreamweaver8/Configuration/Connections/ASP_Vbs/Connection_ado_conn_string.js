// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

// *************** GLOBALS VARS *****************

var HELP_DOC = MM.HELP_connASPConnString;

var PARTICIPANT_FILE = "connection_includefile";

var CONN_NAME_OBJ;
var CONN_STRING_OBJ;
var CONN_TYPE_OBJ;

var RESTRICT_CATALOG = "";
var RESTRICT_SCHEMA = "";

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
  return new Array(MM.BTN_OK,       "", 
                   MM.BTN_Cancel,   "", 
                   MM.BTN_Advanced, "clickedRestrict()", 
                   MM.BTN_Test,     "clickedTest()", 
                   MM.BTN_Help,     "displayHelp()")
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

    if (connParams.designtimeType == null)  // Migrate from v4 to v5
    {   
      connParams.designtimeType = connParams.type;
      connParams.type = "ADO";
    }

    // Strip whitespace and trailing ';' from string
    connParams.string = dwscripts.trim(connParams.string);
    if (connParams.string[connParams.string.length-1] == ';')
    {
      connParams.string = connParams.string.substr(0, connParams.string.length-1);
    }

    // Specify the include statement that's used to include this connection
    connParams.includePattern = 
      "/<!--\\s*#include\\s*(file|virtual)\\s*=\\s*\"([^\"]*)Connections\\/" + 
      connParams.cname + 
      "\\.asp\"\\s*-->/"

    // Specify the variables that are defined in the connection file
    connParams.variables = new Object();
    connParams.variables["MM_" + connParams.cname + "_STRING"] = connParams.string;

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
    getUseHTTP();

    // Build tokens array
    connParams = new Object();
    connParams.type = "ADO";
    connParams.designtimeType = "ADO";
    connParams.designtimeString = "";
    connParams.cname = dwscripts.trim(CONN_NAME_OBJ.value);
    connParams.string = ensureQuotesForStaticText(CONN_STRING_OBJ.value);
    connParams.schema = RESTRICT_SCHEMA;
    connParams.catalog = RESTRICT_CATALOG;
    connParams.filename = "Connection_ado_conn_string.htm";
    connParams.http = USE_HTTP.toString();
  
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
  if (dwscripts.IS_MAC)
    USE_HTTP = true;
  else
    USE_HTTP = (connParams.http == "true");
  
  CONN_NAME_OBJ.value = connParams.name;
  CONN_STRING_OBJ.value = connParams.string;

  // Set design-time connect radio button
  if (CONN_TYPE_OBJ != null)  // radio buttons are not present on the Mac
  {
    var index = (USE_HTTP ? 0 : 1);
    CONN_TYPE_OBJ[index].checked = true;
  }

  // hidden (globals)
  RESTRICT_CATALOG = connParams.catalog;
  RESTRICT_SCHEMA = connParams.schema;

  if (connParams.updateExisting)
  {
    CONN_NAME_OBJ.setAttribute("disabled","true");
    CONN_STRING_OBJ.focus();
  }
  else
  {   
    CONN_NAME_OBJ.focus();
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   clickedRestrict
//
// DESCRIPTION:
//   Called when the user clicks the restrict button.
//   Sets the global catalog and schema values.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function clickedRestrict()
{ 
  var returnArray = new Array();
  
  returnArray = MMDB.showRestrictDialog(RESTRICT_CATALOG, RESTRICT_SCHEMA);

  if (returnArray.catalog != null && returnArray.schema != null)
  {
    RESTRICT_CATALOG = returnArray.catalog;
    RESTRICT_SCHEMA = returnArray.schema;
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
    getUseHTTP();

    // Build tokens array
    var tokens = new Object();
    tokens.type = "ADO";
    tokens.string = ensureQuotesForStaticText(dwscripts.trim(CONN_STRING_OBJ.value));
    tokens.http = (USE_HTTP.toString());

    // This method returns success indicator, but we do not care
    // since it displays status messages for us
    MMDB.testConnection(tokens);
    
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
  CONN_STRING_OBJ = dwscripts.findDOMObject("ConnectionString");
  CONN_TYPE_OBJ = dwscripts.findDOMObject("connectType");
  
  if (CONN_TYPE_OBJ == null)
  {
    USE_HTTP = true;
  }
  else
  {
    // set the default value
    var index = (USE_HTTP ? 0 : 1);
    CONN_TYPE_OBJ[index].checked = true;
  }
  
  CONN_NAME_OBJ.removeAttribute("disabled");
  CONN_NAME_OBJ.focus();
}


//--------------------------------------------------------------------
// FUNCTION:
//   clickedODBC
//
// DESCRIPTION:
//   Display the ODBC dialog when the buttun is clicked
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
}


//--------------------------------------------------------------------
// FUNCTION:
//   getUseHTTP
//
// DESCRIPTION:
//   Sets the golbal USE_HTTP, based on the platform and control
//   settings
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function getUseHTTP()
{
  if (CONN_TYPE_OBJ != null)
  {
    USE_HTTP = CONN_TYPE_OBJ[0].checked;
  }
  else // we are on Mac, where HTTP is always used
  {
    USE_HTTP = true;
  }
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
  
  //connection string
  if (retVal)
  {
    retVal = isValidConnectionString(CONN_STRING_OBJ);
  }
  
  return retVal;
}


