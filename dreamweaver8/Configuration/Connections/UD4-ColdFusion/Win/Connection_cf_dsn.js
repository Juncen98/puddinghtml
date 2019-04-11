// Copyright 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

// *************** GLOBALS VARS *****************

var helpDoc = MM.HELP_connCFDSN;
var RDSusername="";
var RDSpassword="";
var CFDSNArray = new Array();
var ODBCArray = new Array();
var DataSourceObj;

// ******************* API **********************

function findConnection(text)
{
    connRec = findConnectionParameters(text);
    if (connRec == null)
        return null;

    if (connRec.designtimeType == undefined)
    {   // Migrate from v4 to v5
        connRec.designtimeType = connRec.type;
        connRec.type = "CFDSN";
    }

    // Specify the include statement that's used to include this connection
    connRec.includePattern = 
        "/<cfinclude\\s+template\\s*=\\s*\"([^\"]*)Connections\\/" +
        connRec.cname + 
        "\\.cfm\"\\s*>/";

	if (connRec.http == "false")
	{
		var connString = "dsn=" + connRec.dsn;

		if (connRec.username != "")
			connString = connString + ";" + "uid=" + connRec.username;

		if (connRec.password != "")
			connString = connString + ";" + "pwd=" + connRec.password;

		connRec.designtimeString = connString;
		connRec.usesDesigntimeInfo = true;
	}

    // Specify the variables that are defined in the connection file
    connRec.variables = new Object();
    connRec.variables["MM_" + connRec.cname + "_DSN"] =      '"' + connRec.dsn      + '"';
    connRec.variables["MM_" + connRec.cname + "_USERNAME"] = '"' + connRec.username + '"';
    connRec.variables["MM_" + connRec.cname + "_PASSWORD"] = '"' + connRec.password + '"';
    return connRec;
}

function inspectConnection(connRec)
{
    var selectIndex=0;
	// Enable for initialization
	document.theForm.ConnectionName.removeAttribute("disabled");
    
	document.theForm.ConnectionName.value = connRec.name;
	document.theForm.UserName.value = connRec.username;
	document.theForm.Password.value = connRec.password;

	CFDSNArray = MMDB.getColdFusionDsnList();
	ODBCArray = MMDB.getLocalDsnList();

	RDSusername = MMDB.getRDSUserName();
	RDSpassword = MMDB.getRDSPassword();

	// Set design-time connect radio button

	if (connRec.http == "true"){
	  document.theForm.connectType[0].checked = true;
	  DataSourceObj.setAll(CFDSNArray, CFDSNArray);
   	  if (CFDSNArray.length == 0)
	    EnsureRDSValidation();
	} else {
      document.theForm.connectType[1].checked = true;
	  DataSourceObj.setAll(ODBCArray, ODBCArray);
	}
    
    if(!DataSourceObj.pickValue(connRec.dsn))
      DataSourceObj.setIndex(0);

	// Hidden (globals)
	restrict_catalog = connRec.catalog;
	restrict_schema	= connRec.schema;
	updateMode = connRec.updateExisting;

	// initializeUI() gets called before we have this flag,
	// so we disable the name field here, if necessary
	if (updateMode)
	{
		document.theForm.ConnectionName.setAttribute("disabled","true");
		document.theForm.DataSourceSelect.focus();
	}
	else
    {
        document.theForm.ConnectionName.focus();
    }
}

function applyConnection()
{ 
	if (!isValid())
		return "";

    var connType = "";

	// Get useHTTP from radio buttons
	var dsnValue = DataSourceObj.get();

	var useHTTP = new Boolean();
    useHTTP = document.theForm.connectType[0].checked;

	connType = (useHTTP) ? "CFDSN" : "ADO";

	// Build tokens array
    connRec = new Object();
	connRec.type = "CFDSN";
	connRec.designtimeType = connType;
	connRec.cname = Trim(document.theForm.ConnectionName.value);
	connRec.schema = restrict_schema;
	connRec.catalog = restrict_catalog;
	connRec.dsn = dsnValue;
	connRec.username = document.theForm.UserName.value;
	connRec.password = document.theForm.Password.value;
	connRec.filename = "Connection_cf_dsn.htm";
	connRec.http = (useHTTP ? "true" : "false");
	connRec.designtime = "";

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

// ***************** LOCAL FUNCTIONS	******************

//This method gives the user an opportunity to ensure the RDS user name and password are right. If the user
//hits the ok button in the RDS dialog, the connection will be tested automatically and if it fails,
//the username/password dialog pops up again. If the user clicks cancel, the dialog closes without 
//testing the connection. 

function EnsureRDSValidation()
{
  var exit = false;
  var returnArray = new Array();  
  
  //Keep popping up the RDS dialog as long as the the 
  //remote dsn list is empty and the user clicks ok in the RDS dialog. If the user 
  //clicks cancel, back off and let the user into the connection dialog.

  while (!exit)
  {
    //Show the RDS Dialog
	returnArray = MMDB.showRdsUserDialog(RDSusername, RDSpassword, returnArray);

    //Proceed if the user name or password and not empty. We use or instead of and because
	//ColdFusion might need only a password in certain circumstances.

    if (returnArray.username != null && returnArray.password != null) 
    {
  	    RDSusername = returnArray.username;
		RDSpassword	= returnArray.password;

		MMDB.setRDSUserName(RDSusername);
		MMDB.setRDSPassword(RDSpassword);

		CFDSNArray = MMDB.getColdFusionDsnList();
		
		if (document.theForm.connectType[0].checked)
			DataSourceObj.setAll(CFDSNArray, CFDSNArray);

		if (CFDSNArray.length > 0)
			exit = true;
	} else {
  	  exit = true;
	}
	
  } //while
}

function initializeUI() { 

  DataSourceObj = new ListControl("DataSourceSelect");
}

function populateListWithArray(strArray)
{
	DataSourceObj.setAll(strArray, strArray);
}

function webServerClicked()
{
  populateListWithArray(CFDSNArray);
  if(CFDSNArray.length == 0)
  {
	EnsureRDSValidation();
  }
}

function machineClicked()
{
  populateListWithArray(ODBCArray);
}

function decodeConnectionString(connStr)
{
  var arr = new Array();

  arr.push((connStr.search(/dsn=(\w+);/gi) != -1) ? RegExp.$1 : "");
  arr.push((connStr.search(/uid=(\w+);/gi) != -1) ? RegExp.$1 : "");
  arr.push((connStr.search(/pwd=(\w+);/gi) != -1) ? RegExp.$1 : "");

  return arr;


}

function buildConnectionString(dsn)
{
   var connString = "dsn=" + dsn;
   if (document.theForm.UserName.value != "")
   {
	  connString = connString + ";" + "uid=" + document.theForm.UserName.value;
   }
   if (document.theForm.Password.value != "")
   {
	  connString = connString + ";" + "pwd=" + document.theForm.Password.value;
   }
	return connString;
}

function clickedRestrict()
{ 
	var returnArray = new Array();
	returnArray = MMDB.showRestrictDialog(restrict_catalog, restrict_schema);

	if (returnArray.catalog != null && returnArray.schema != null)
	{
		restrict_catalog = returnArray.catalog;
		restrict_schema	= returnArray.schema;
	}
}

function clickedTest()
{
	if (!isValid())
		return;

	var tokens = new Object();
    var connType = "";
	var connString = "";

	var useHTTP = new Boolean();
	useHTTP = document.theForm.connectType[0].checked;

	// Parameters are all required:
	//   type, string, dsn, driver, username, password, useHTTP
	// This method returns success indicator, but we do not care
	// since it displays status messages for us

    //&type, &string, &dsn, &driver, &username, &password, &useHTTP
	var dsnValue = DataSourceObj.get();
	if(useHTTP)
	{
		connType = "CFDSN";

	} else {
		connType = "ADO"
		connString = buildConnectionString(dsnValue);
	}

	// Build tokens array

	tokens.type = connType;
	tokens.string = connString;
	tokens.dsn = dsnValue;
	tokens.username = document.theForm.UserName.value;
	tokens.password = document.theForm.Password.value;
	tokens.http = (useHTTP ? "true" : "false");

	MMDB.testConnection(tokens);
}

function clickedODBC()
{
	MMDB.showOdbcDialog();

	// Update DSN list, if applicable
}

function RDSButtonClicked()
{
	var returnArray = new Array();
	returnArray = MMDB.showRdsUserDialog(RDSusername, RDSpassword, returnArray);

	if (returnArray.username != null && returnArray.password != null)
	{
		RDSusername = returnArray.username;
		RDSpassword	= returnArray.password;

		MMDB.setRDSUserName(RDSusername);
		MMDB.setRDSPassword(RDSpassword);

		CFDSNArray = MMDB.getColdFusionDsnList();
		if (document.theForm.connectType[0].checked)
			DataSourceObj.setAll(CFDSNArray, CFDSNArray);

		if(CFDSNArray.length == 0)
		{
		  EnsureRDSValidation();
		}
	}
}

function isValid()
{
	// dsn
	if (DataSourceObj.list.length == 0)
	{
		alert(document.theForm.connectType[0].checked ? MM.MSG_NoServerCfDSNs : MM.MSG_NoLocalOdbcDSNs);
		return false;
	}

	return isValidConnectionName(document.theForm.ConnectionName);
}

