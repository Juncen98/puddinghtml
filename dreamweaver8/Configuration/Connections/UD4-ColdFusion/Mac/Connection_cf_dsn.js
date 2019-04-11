// Copyright 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

// *************** GLOBALS VARS *****************

var helpDoc = MM.HELP_connCFDSN;
var RDSusername="";
var RDSpassword="";
var DSNArray = new Array();
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

    // Specify the variables that are defined in the connection file
    connRec.variables = new Object();
    connRec.variables["MM_" + connRec.cname + "_DSN"] =        '"' + connRec.dsn      + '"';
    connRec.variables["MM_" + connRec.cname + "_USERNAME"] =   '"' + connRec.username + '"';
    connRec.variables["MM_" + connRec.cname + "_PASSWORD"] =   '"' + connRec.password + '"';

    return connRec;
}

function inspectConnection(connRec)
{
	// Enable for initialization
	document.theForm.ConnectionName.removeAttribute("disabled");
    
	document.theForm.ConnectionName.value = connRec.name;
	document.theForm.UserName.value = connRec.username;
	document.theForm.Password.value = connRec.password;

    CFDSNArray = MMDB.getColdFusionDsnList();
	
	RDSusername = MMDB.getRDSUserName();
	RDSpassword = MMDB.getRDSPassword();

    if(CFDSNArray.length == 0)
	  EnsureRDSValidation();

	DataSourceObj.setAll(CFDSNArray, CFDSNArray);

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
	else document.theForm.DataSourceSelect.focus();
}

function applyConnection()
{ 
	if (!isValid())
		return "";

	var dsnValue = DataSourceObj.get();

	// Build tokens array
    connRec = new Object();
	connRec.type = "CFDSN";
	connRec.designtimeType = "CFDSN";
	connRec.cname = Trim(document.theForm.ConnectionName.value);
	connRec.username = document.theForm.UserName.value;
	connRec.password = document.theForm.Password.value;
	connRec.schema = restrict_schema;
	connRec.catalog = restrict_catalog;
	connRec.dsn = dsnValue;
	connRec.filename = "Connection_cf_dsn.htm";
	connRec.http = "true";
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

	var dsnValue = DataSourceObj.get();

	// Build tokens array
	var tokens = new Object();
	tokens.type = "CFDSN";
	tokens.dsn = dsnValue;
	tokens.username = document.theForm.UserName.value;
	tokens.password = document.theForm.Password.value;
	tokens.http = "true";

	// This method returns success indicator, but we do not care
	// since it displays status messages for us

	MMDB.testConnection(tokens);
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
		DataSourceObj.setAll(CFDSNArray, CFDSNArray);

		if(CFDSNArray.length == 0)
		  EnsureRDSValidation();
	}
}

function isValid()
{
	// dsn
	if (DataSourceObj.list.length == 0)
	{
	  alert(MM.MSG_NoServerCfDSNs);
	}

	return isValidConnectionName(document.theForm.ConnectionName);
}

