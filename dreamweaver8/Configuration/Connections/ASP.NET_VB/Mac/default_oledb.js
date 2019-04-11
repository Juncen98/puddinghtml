// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

// *************** GLOBALS VARS *****************

var helpDoc = MM.HELP_connASPNETOleDb;
var connStrObj;

// ******************* API **********************

function findConnection(text)
{
    connRec = findConnectionParameters(text);
	
    if (connRec == null)
        return null;

	if ((connRec.cname != connRec.cnameDBType) ||
	    (connRec.cname != connRec.cnameHandler) ||
	    (connRec.cname != connRec.cnameSchema) ||
	    (connRec.cname != connRec.cnameCatalog))
		return null;

	// ADO connectivity expects connection string to be
	// enclosed in quotes for Server.MapPath() support
	connRec.string = ensureQuotes(connRec.string);

    // We need to pull out the last ; from the string, but not the last "
    if (connRec.string.substr(connRec.string.length - 2, 2) == ';"')
	  connRec.string = connRec.string.substr(0, connRec.string.length - 2) + '"';

    // Specify the variables that are defined in the connection file
    connRec.variables = new Object();
    connRec.variables["System.Configuration.ConfigurationSettings.AppSettings(\"MM_CONNECTION_STRING_" + connRec.cname + "\")"] = connRec.string;
    connRec.variables["System.Configuration.ConfigurationSettings.AppSettings(\"MM_CONNECTION_DATABASETYPE_" + connRec.cname + "\")"] = "\"" + connRec.databaseType + "\"";

	// ===
	// connRec.usesDesigntimeInfo = true;
	// ===

    //alert(connRec.string);

	connRec.filename = "default_oledb.htm"
	connRec.type = "ADO";
	connRec.designtimeType = "ADO";
	connRec.designtimeString = "";
	connRec.http = "true";

    return connRec;
}

function inspectConnection(connRec)
{ 
  editObj = null;

  updateMode = false;

  // Enable for initialization
  document.theForm.ConnectionName.removeAttribute("disabled");
  document.theForm.ConnectionName.value = connRec.name;
  document.theForm.ConnectionString.value = formatConnectionString(connRec.string);

  // Hidden (globals)
  restrict_catalog = connRec.catalog;
  restrict_schema = connRec.schema;
  updateMode = connRec.updateExisting;

  // initializeUI() gets called before we have this flag,
  // so we disable the name field here, if necessary

  if (updateMode){
    document.theForm.ConnectionName.setAttribute("disabled","true");
    document.theForm.ConnectionString.focus();
  }
  else {   
    document.theForm.ConnectionName.focus();
  }
}

function applyConnection()
{ 
  if (!isValid())
    return "";

  // Build tokens array
  connRec = new Object();

  connRec.cnameHandler = Trim(document.theForm.ConnectionName.value);
  connRec.handler = "default_oledb.htm"
  connRec.cname = connRec.cnameHandler;
  connRec.string = ensureQuotes(Trim(unFormatConnectionString(connStringObject.value)));  
  connRec.cnameDBType = connRec.cnameHandler;
  connRec.databaseType = "OleDb";
  connRec.cnameSchema = connRec.cnameHandler;
  connRec.schema = restrict_schema;
  connRec.cnameCatalog = connRec.cnameHandler;
  connRec.schema = restrict_schema;
  connRec.catalog = restrict_catalog;
  connRec.filename = "default_oledb.htm"
  connRec.type = "ADO";
  connRec.designtimeType = "ADO";
  connRec.designtimeString = "";
  connRec.http = "true";
    
  // Start with insertText
  var code = dw.getExtDataValue("connection_includefile", "insertText");

  // Replace each token
  for (var i in connRec)
    code = code.replace(RegExp("@@"+i+"@@","g"), connRec[i]);

  return code;
}

function commandButtons()
{
  return new Array(MM.BTN_OK, "", MM.BTN_Cancel, "", MM.BTN_Advanced, "clickedRestrict()", MM.BTN_Test, "clickedTest()", MM.BTN_Help, "displayHelp()")
}


// ***************** LOCAL FUNCTIONS  ******************

function templateClicked()
{
  dw.runCommand("OLEDBConnectionList");
  if(MM.commandReturnValue != "") {
    connStringObject.value = formatConnectionString(MM.commandReturnValue);
  }
}

function formatConnectionString(connStr)
{
  var connectionStr = Trim(connStr);

  var strArray = connectionStr.split(";");
  if (strArray.length == 0)
    return "";

  var retVal = strArray[0];
  for (var i=1; i < strArray.length; i++)
	  retVal += ";\n" + strArray[i];
 
  return retVal;
}

function unFormatConnectionString(connectionStr)
{
  return StripChars("\r\n", connectionStr);
}

//Set the insertion point

function initializeUI() 
{ 
  connStringObject = findObject("ConnectionString");
}

function clickedRestrict()
{ 
  var returnArray = new Array();
  returnArray = MMDB.showRestrictDialog(restrict_catalog, restrict_schema);

  if (returnArray.catalog != null && returnArray.schema != null)
  {
    restrict_catalog = returnArray.catalog;
    restrict_schema = returnArray.schema;
  }
}


function clickedTest()
{
  if (!isValid())
  {
    return;
  }

  // Build tokens array
  var tokens = new Object();
  tokens.type = "ADO";
  tokens.http = "true"
  tokens.string = ensureQuotes(Trim(unFormatConnectionString(connStringObject.value)));
  tokens.databaseType = "OleDb";

  // This method returns success indicator, but we do not care
  // since it displays status messages for us
  MMDB.testConnection(tokens);
}

function isValid()
{
  var connName = document.theForm.ConnectionName.value;
  if (!IsValidVarName(connName))
  {
    if (connName.charAt(0).search(/\d/) != -1)  // can't start with a number
      alert(MM.MSG_InvalidConnectionName2);      
    else 
      alert(MM.MSG_InvalidConnectionName);
    document.theForm.ConnectionName.focus();
    return false;
  }
  return true;
}

