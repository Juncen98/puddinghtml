// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

// *************** GLOBALS VARS *****************

var HELP_DOC = MM.HELP_connASPDSN;

var PARTICIPANT_FILE = "connection_includefile";

var CONN_NAME_OBJ;
var USERNAME_OBJ;
var PASSWORD_OBJ;
var CONN_TYPE_OBJ;

var DIV_DSN;
var DIV_BTN;
var DSN_TEXT_OBJ;
var DSN_SELECT_OBJ;
var DSN_LIST = new Array();

var DSN_TEXT_HTML = '<input type="text" style="width:150px" name="dsn">';
var DSN_SELECT_HTML = '<select name="dsn" style="width:150px"></select>';

var DEFINE_BTN_HTML = '<input type="button" name="ODBC_button" value="' + MM.BTN_ConnDefine + '" onClick="clickedODBC()">';
var DSN_BTN_HTML = '<input type="button" name="ODBC_button" value="' + MM.BTN_ConnDSN + '" onClick="clickedODBC()">';

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
                   MM.BTN_Help,     "displayHelp()");
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
//   text - string - the string contents of a connection file
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

    // specify the include statement that's used to include this connection
    connParams.includePattern = 
      "/<!--\\s*#include\\s*(file|virtual)\\s*=\\s*\"([^\"]*)Connections\\/" + 
      connParams.cname + 
      "\\.asp\"\\s*-->/"

    // specify the variables that are defined in the connection file
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
//   None
//
// RETURNS:
//   string - connection code
//--------------------------------------------------------------------

function applyConnection()
{
  var code = "";
  
  if (isValid())
  {
    // get the dsn name
    var dsn = getDSNName();   

    // build parameters array
    var connParams = new Object();
    connParams.type = "ADO";
    connParams.designtimeType = "ADO";
    connParams.designtimeString = "";
    connParams.cname = dwscripts.trim(CONN_NAME_OBJ.value);
    connParams.schema = RESTRICT_SCHEMA;
    connParams.catalog = RESTRICT_CATALOG;
    connParams.filename = "Connection_odbc_conn_dsn.htm"
    connParams.http = (USE_HTTP.toString());
    connParams.string = "\"" + buildDSNConnectionString(dsn,USERNAME_OBJ.value, PASSWORD_OBJ.value) +"\"";

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

  // Set the DSN list or text field
  var decodedContents = decodeDSNConnectionString(connParams.string);
  if (USE_HTTP)
  {
    if (CONN_TYPE_OBJ != null)
    {
      CONN_TYPE_OBJ[0].checked = true;
    }
    
    makeEditControlVisible();

    if (decodedContents.length > 0)
    {
      DSN_TEXT_OBJ.value = decodedContents[0];
      USERNAME_OBJ.value = decodedContents[1];
      PASSWORD_OBJ.value = decodedContents[2];
    }
  } 
  else 
  {
    CONN_TYPE_OBJ[1].checked = true;

    makeSelectControlVisible();

    if (decodedContents.length > 0)
    {
      if(!DSN_SELECT_OBJ.pickValue(decodedContents[0]))
      {
        DSN_SELECT_OBJ.setIndex(0);
      }
      USERNAME_OBJ.value = decodedContents[1];
      PASSWORD_OBJ.value = decodedContents[2];
    }
  } 

  // Set globals
  RESTRICT_CATALOG = connParams.catalog;
  RESTRICT_SCHEMA = connParams.schema;

  // this function is always called, not just on re-edit,
  // so we check the updateExisting flag to determine
  // if we are re-editing.
  if (connParams.updateExisting)
  {
    CONN_NAME_OBJ.setAttribute("disabled","true");
    
    if (USE_HTTP)
    {
      DSN_TEXT_OBJ.focus();
    }
    else
    {
      DSN_SELECT_OBJ.object.focus();
    }
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
  var retArray = new Array();
  retArray = MMDB.showRestrictDialog(RESTRICT_CATALOG, RESTRICT_SCHEMA);

  if (retArray.catalog != null && retArray.schema != null)
  {
    RESTRICT_CATALOG = retArray.catalog;
    RESTRICT_SCHEMA = retArray.schema;
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
    var dsn = getDSNName();

    // build tokens object to pass to MMDB.testConnection
    var tokens = new Object();
    tokens.type = "ADO";
    tokens.http = (USE_HTTP.toString());
    tokens.string = "\"" + buildDSNConnectionString(dsn, USERNAME_OBJ.value, PASSWORD_OBJ.value) + "\"";
    
    // This method returns success indicator, but we do not care
    // since it displays status messages for us
    MMDB.testConnection(tokens);

  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   clickedODBC
//
// DESCRIPTION:
//   Displays either a dialog (command) for selecting a DSN or
//   the built in ODBC dialog.  The result of these dialogs is
//   stored in the relevant control.
//   
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function clickedODBC()
{
  if (USE_HTTP)
  {
    var retVal = dwscripts.callCommand("SelectDSN.htm", new Array(DSN_TEXT_OBJ.value, true));
    if (retVal)
    {
      DSN_TEXT_OBJ.value = retVal;
    }
  }
  else
  {
    MMDB.showOdbcDialog();
    
    DSN_LIST = MMDB.getLocalDsnList();
    DSN_SELECT_OBJ.setAll(DSN_LIST, DSN_LIST);
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
//   Find the dom objects that will be used to manipualte the dialog
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
  
  USERNAME_OBJ = dwscripts.findDOMObject("UserName");
  PASSWORD_OBJ = dwscripts.findDOMObject("Password");
  
  CONN_TYPE_OBJ = dwscripts.findDOMObject("connectType");
  
  // find the layers that will be used to change the HTML
  DIV_DSN = dwscripts.findDOMObject("dsnLayer");
  DIV_BTN = dwscripts.findDOMObject("btnLayer");
  
  if (dwscripts.IS_MAC)
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
//   makeSelectControlVisible
//
// DESCRIPTION:
//   Sets the UI to display a DSN select list, with a Define button
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function makeSelectControlVisible()
{
  if (!dwscripts.IS_MAC)
  {
    USE_HTTP = false;
    
    DIV_DSN.innerHTML = DSN_SELECT_HTML;
    DIV_BTN.innerHTML  =  DEFINE_BTN_HTML;
    
    DSN_SELECT_OBJ = new ListControl("dsn");
    
    DSN_LIST = MMDB.getLocalDsnList();        
    DSN_SELECT_OBJ.setAll(DSN_LIST, DSN_LIST);
  }
}
   

//--------------------------------------------------------------------
// FUNCTION:
//   makeEditControlVisible
//
// DESCRIPTION:
//   Sets the UI to display a DSN text box, and a DSN button
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function makeEditControlVisible()
{
  USE_HTTP = true;
  
  if (!dwscripts.IS_MAC)
  {
    DIV_DSN.innerHTML = DSN_TEXT_HTML;
    DIV_BTN.innerHTML  =  DSN_BTN_HTML;
  }
  
  DSN_TEXT_OBJ = dwscripts.findDOMObject("dsn");
}


//--------------------------------------------------------------------
// FUNCTION:
//   getDSNName
//
// DESCRIPTION:
//   Returns the currently selected DSN name
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string - dsn name
//--------------------------------------------------------------------

function getDSNName()
{
  var retVal = "";
  
  if (USE_HTTP)
  {
    retVal = DSN_TEXT_OBJ.value;
  }
  else
  {
    retVal = DSN_SELECT_OBJ.get();
  }
  
  return retVal;
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
    
  return retVal;
}

