// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

// *************** GLOBALS VARS *****************

var HELP_DOC = MM.HELP_connJSP;

var PARTICIPANT_FILE = "connection_includefile";

var CONN_NAME_OBJ;
var DRIVER_OBJ;
var URL_OBJ;
var USERNAME_OBJ;
var PASSWORD_OBJ;
var CONN_TYPE_OBJ;

var RESTRICT_CATALOG = "";
var RESTRICT_SCHEMA = "";

var USE_HTTP = true;

var DRIVER_LIST = new Array();


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
    if (connParams.designtimeType == undefined) // Migrate from v4 to v5
    {
      connParams.designtimeType = connParams.type;
      connParams.type = "JDBC";
    }

    // Specify the include statement that's used to include this connection
    connParams.includePattern = 
        "/<%@\\s+include\\s+file\\s*=\\s*\"([^\"]*)Connections\\/" +
        connParams.cname + 
        "\\.jsp\"\\s*%>/";

    // Specify the variables that are defined in the connection file
    connParams.variables = new Object();
    connParams.variables["MM_" + connParams.cname + "_STRING"] =   '"' + connParams.string + '"';
    connParams.variables["MM_" + connParams.cname + "_DRIVER"] =   '"' + connParams.driver + '"';
    connParams.variables["MM_" + connParams.cname + "_USERNAME"] = '"' + connParams.username + '"';
    connParams.variables["MM_" + connParams.cname + "_PASSWORD"] = '"' + connParams.password + '"';
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
    USE_HTTP = CONN_TYPE_OBJ[0].checked;
    
    // build tokens array
    connParams = new Object();
    connParams.designtime = "";
    connParams.type = "JDBC";
    connParams.designtimeType = "JDBC";
    connParams.cname = dwscripts.trim(CONN_NAME_OBJ.value);
    connParams.string = dwscripts.trim(URL_OBJ.value);
    connParams.schema = RESTRICT_SCHEMA;
    connParams.catalog = RESTRICT_CATALOG;
    connParams.filename = FILENAME;
    connParams.http = (USE_HTTP.toString());
    connParams.username = USERNAME_OBJ.value;
    connParams.password = PASSWORD_OBJ.value;
    connParams.driver = dwscripts.trim(DRIVER_OBJ.value);

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
  USE_HTTP = (connParams.http == "true");
  
  var tempArray = MMDB.getDriverUrlTemplateList();
  for(var i=0; i < tempArray.length; i+=2)
  {
    DRIVER_LIST.push(tempArray[i], tempArray[i]);
  }

  CONN_NAME_OBJ.value = connParams.name;
  URL_OBJ.value = (connParams.string != null) ? connParams.string : "";
  USERNAME_OBJ.value = connParams.username;
  PASSWORD_OBJ.value = connParams.password;

  // Set design-time connect radio button
  var index = (USE_HTTP ? 0 : 1);
  CONN_TYPE_OBJ[index].checked = true;
  
  DRIVER_OBJ.value = (connParams.driver != null) ? connParams.driver : "";

  // Hidden (globals)
  RESTRICT_CATALOG = connParams.catalog;
  RESTRICT_SCHEMA = connParams.schema;

  // initializeUI() gets called before we have this flag,
  // so we disable the name field here, if necessary
  if (connParams.updateExisting)
  {
    CONN_NAME_OBJ.setAttribute("disabled","true");
    URL_OBJ.focus();
  }
  else
  {   
    CONN_NAME_OBJ.focus();
  }

  // Set default values
  if (DRIVER_OBJ.value == "")
    DRIVER_OBJ.value = DEFAULT_DRIVER;

  if (URL_OBJ.value == "")
    URL_OBJ.value = DEFAULT_TEMPLATE;
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
    USE_HTTP = CONN_TYPE_OBJ[0].checked;

    // build tokens array
    var tokens = new Object();
    tokens.type = "JDBC";
    tokens.string = dwscripts.trim(URL_OBJ.value);
    tokens.http = (USE_HTTP.toString());
    tokens.username = USERNAME_OBJ.value;
    tokens.password = PASSWORD_OBJ.value;
    tokens.driver = dwscripts.trim(DRIVER_OBJ.value);

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
  DRIVER_OBJ = dwscripts.findDOMObject("Driver");
  URL_OBJ = dwscripts.findDOMObject("URLEdit");
  USERNAME_OBJ = dwscripts.findDOMObject("UserName");
  PASSWORD_OBJ = dwscripts.findDOMObject("Password");
  CONN_TYPE_OBJ = dwscripts.findDOMObject("connectType");
  
  // set the default value
  var index = (USE_HTTP ? 0 : 1);
  CONN_TYPE_OBJ[index].checked = true;
  
  CONN_NAME_OBJ.removeAttribute("disabled");
  CONN_NAME_OBJ.focus();
}


//--------------------------------------------------------------------
// FUNCTION:
//   clickedODBC
//
// DESCRIPTION:
//   Called when the user clicks the ODBC button.  Displays the 
//   ODBC dialog.
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
  
  // driver
  if (retVal)
  {
    var driver = DRIVER_OBJ.value;
    if (driver.length == 0)
    {
      alert(MM.MSG_SpecifyDriver);
      DRIVER_OBJ.focus();
      retVal = false;
    }
  }

  // url
  if (retVal)
  {
    var url_string = URL_OBJ.value;
    if (url_string.length == 0)
    {
      alert(MM.MSG_SpecifyUrlString);
      URL_OBJ.focus();
      retVal = false;
    }
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   machineClicked
//
// DESCRIPTION:
//   Ensure that the selected driver is available on the machine. 
//   If not, pop up an appropriate message.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function machineClicked()
{
  // only check if a message is specfied
  if (MSG_DriverNotFound)
  {
    var found = false;

    for (var i=0; i < DRIVER_LIST.length; i++)
    {
      if(DRIVER_OBJ.value == DRIVER_LIST[i])
      {
        found = true; 
        break;
      }
    }

    if (!found)
    {
      alert(MSG_DriverNotFound);
    }
  }
}
