// Copyright 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

// *************** GLOBALS VARS *****************

var helpDoc = MM.HELP_connCFDSNAdvanced;
var RDSusername="";
var RDSpassword="";

var dataSourceObj;
var driverObj;
var urlObj, usernameObj, passwordObj, machineRadioObj;

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

    // Specify the variables that are defined in the connection file
    connRec.variables = new Object();
    connRec.variables["MM_" + connRec.cname + "_DSN"] =      '"' + connRec.dsn      + '"';
    connRec.variables["MM_" + connRec.cname + "_USERNAME"] = '"' + connRec.username + '"';
    connRec.variables["MM_" + connRec.cname + "_PASSWORD"] = '"' + connRec.password + '"';

	// Extract Design-Time parameters
	var arr = new Array();
	arr = decodeJDBCParams(connRec.designtime);

	connRec.designtimeDriver = arr[0];
	connRec.designtimeString = arr[1];
	connRec.designtimeUsername = arr[2];
	connRec.designtimePassword = arr[3];
	connRec.usesDesigntimeInfo = (connRec.http == "false");

    return connRec;
}

function inspectConnection(connRec)
{
	if (connRec == null)
		return;

	// Enable for initialization
	document.theForm.ConnectionName.removeAttribute("disabled");

	document.theForm.ConnectionName.value = connRec.name;

	var dataSource = connRec.dsn;

	RDSusername = MMDB.getRDSUserName();
	RDSpassword = MMDB.getRDSPassword();

	CFDSNArray = MMDB.getColdFusionDsnList();
	dataSourceObj.setAll(CFDSNArray, CFDSNArray);

	var index = (connRec.http == "true") ? 0 : 1;
 	document.theForm.connectType[index].checked = true;

 	document.theForm.UserName.value = connRec.username;
	document.theForm.Password.value = connRec.password;

	document.theForm.Driver.value = connRec.designtimeDriver;
	document.theForm.URLEdit.value = connRec.designtimeString;
	document.theForm.DriverUserName.value = connRec.designtimeUsername;
	document.theForm.DriverPassword.value = connRec.designtimePassword;
	
	enableTheControls(connRec.http == "false");
    
	// Hidden (globals)
	restrict_catalog = connRec.catalog;
	restrict_schema	= connRec.schema;

	updateMode		 = connRec.updateExisting;

	if(!dataSourceObj.pickValue(connRec.dsn))
 	  dataSourceObj.setIndex(0);

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
	
	// Get useHTTP from radio buttons
	var useHTTP = new Boolean();
    useHTTP = document.theForm.connectType[0].checked;

	// Build tokens array
	params = new Object();
	
	params.cname = Trim(document.theForm.ConnectionName.value);
	params.type = "CFDSN";
	params.designtimeType = (useHTTP) ? "CFDSN" : "JDBC";
	params.designtime = buildJDBCParams();
	params.username = document.theForm.UserName.value;
	params.password = document.theForm.Password.value;	  

	var dsnValue = dataSourceObj.get();
	params.dsn = dsnValue;
	params.schema = restrict_schema;
	params.catalog = restrict_catalog;
	params.filename = "Connection_cf_direct.htm";
	
	params.http = (useHTTP ? "true" : "false");

	// Start with insertText
	var code = dw.getExtDataValue("connection_includefile", "insertText");

	// Replace each token
	for (var i in params)
		code = code.replace(RegExp("@@"+i+"@@","g"), params[i]);

	return code;
}

function commandButtons()
{
	return new Array(MM.BTN_OK, "", MM.BTN_Cancel, "", MM.BTN_Advanced, "clickedRestrict()", MM.BTN_Test, "clickedTest()", MM.BTN_Help, "displayHelp()")
}

// ***************** LOCAL FUNCTIONS	******************

//Set the insertion point

function initializeUI()
{ 
  dataSourceObj = new ListControl("DataSourceSelect");

  driverObj = findObject("Driver");
  urlObj = findObject("URLEdit");
  usernameObj = findObject("DriverUserName");
  passwordObj = findObject("DriverPassword");
  machineRadioObj = findObject("machineSpan");
}

function decodeJDBCParams(connStr)
{
  var arr = new Array();
  
  var re=/driver=([^\|]*)\|url=([^\|]*)\|uid=([^\|]*)\|pword=(.*)/gi;
  
  if(connStr.search(re) != -1)
  { 
    arr.push(RegExp.$1);
	arr.push(RegExp.$2);
	arr.push(RegExp.$3);
	arr.push(RegExp.$4);
  }
  else
  {
    arr.push("");
	arr.push("");
	arr.push("");
	arr.push("");
  }
  
  return arr;
}

function buildJDBCParams()
{
  var returnStr="";
  var driver="";
  var url = "";
  var pword = "";

  driver = Trim(document.theForm.Driver.value);
  url = Trim(document.theForm.URLEdit.value);
  user = Trim(document.theForm.DriverUserName.value);
  pword = document.theForm.DriverPassword.value;
  
  returnStr = "driver="	+ driver + "|" +
			  "url="	+ url	 + "|" +
			  "uid="	+ user	 + "|" +
			  "pword="	+ pword;
  
  return returnStr;
}

function enableTheControls(enable)
{
  SetEnabled(driverObj, enable);
  SetEnabled(urlObj, enable);
  SetEnabled(usernameObj, enable);
  SetEnabled(passwordObj, enable);
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
		dataSourceObj.setAll(CFDSNArray, CFDSNArray);
	}
}

function machineClicked()
{
   enableTheControls(true)
}

function webserverClicked()
{
   enableTheControls(false);
}

function clickedTest()
{
	if (!isValid())
		return;

	var useHTTP = new Boolean();
    useHTTP = document.theForm.connectType[0].checked;

	// Build tokens array
	var tokens = new Object();
	
	if (useHTTP)
	{
		tokens.type = "CFDSN";
		tokens.dsn = dataSourceObj.get();
	}
	else
	{
		tokens.type = "JDBC";
		tokens.driver = Trim(document.theForm.Driver.value);
		tokens.string = Trim(document.theForm.URLEdit.value);
		tokens.username = document.theForm.DriverUserName.value;
		tokens.password = document.theForm.DriverPassword.value;
	}

	tokens.http = (useHTTP ? "true" : "false");

	// This method returns success indicator, but we do not care
	// since it displays status messages for us
	MMDB.testConnection(tokens);
}

function isValid()
{
    var connName = document.theForm.ConnectionName.value;

	var useHTTP = new Boolean();
	useHTTP = document.theForm.connectType[0].checked;

	if (useHTTP==false)
	{
		//Validate the driver name to be valid...
		var driver = document.theForm.Driver.value;
		if (driver.length == 0)
		{
			alert(MM.MSG_SpecifyDriver);
			document.theForm.Driver.focus();
			return false;
		}
	}

	return isValidConnectionName(document.theForm.ConnectionName);
}

