// Copyright 2005 Macromedia, Inc. All rights reserved.

var HELP_DOC = MM.HELP_DSsettingMSAccess;

var CONN_NAME_OBJ;
var DB_FILE_OBJ;
var SYS_DB_FILE_OBJ;
var USE_DEFAULT_USERNAME_OBJ;
var USERNAME_OBJ;
var PASSWORD_OBJ;
var DESCRIPTION_OBJ;

var PAGE_TIMEOUT_OBJ;				//thePageTimeout
var MAX_BUFFER_SIZE_OBJ;			//theMaxBufferSize
var CONNECTION_STRING_OBJ;			//theConnectionString
var DEFAULT_USERNAME_OBJ;			//theDefaultUsername
var DEFAULT_PASSWORD_OBJ;			//theDefaultPassword
var RETURN_TIMESTAMP_AS_STRING_OBJ;	//theReturnTimestampAsString
var LIMIT_CONNECTIONS_OBJ;			//theLimitConnections
var RESTRICT_CONNECTIONS_TO_OBJ;	//theRestrictConnectionsTo
var MAINTAIN_CONNECTIONS_OBJ;		//theMaintainConnections
var TIMEOUT_OBJ;					//theTimeout
var INTERVAL_OBJ;					//theInterval

var AdvancedSettingsFileName = "../AdvancedSettings/Conn_CF_03_MSAccess_Adv.htm";



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
function initializeUI() { 
	CONN_NAME_OBJ = dwscripts.findDOMObject("ConnectionName");
	DB_FILE_OBJ = dwscripts.findDOMObject("DatabaseFile");
	SYS_DB_FILE_OBJ = dwscripts.findDOMObject("SysDatabaseFile");
	USE_DEFAULT_USENAME_OBJ = dwscripts.findDOMObject("UseDefaultUsername");
	USERNAME_OBJ = dwscripts.findDOMObject("UserName");
	PASSWORD_OBJ = dwscripts.findDOMObject("Password");
	DESCRIPTION_OBJ = dwscripts.findDOMObject("Description");

	CONN_NAME_OBJ.setAttribute("disabled","false");
	CONN_NAME_OBJ.focus();
}



//--------------------------------------------------------------------
// FUNCTION:
//   initializeUI_advanced
//
// DESCRIPTION:
//   Get the DOM objects for the various advanced UI controls
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function initializeUI_advanced() {
	PAGE_TIMEOUT_OBJ = dwscripts.findDOMObject("thePageTimeout");
	MAX_BUFFER_SIZE_OBJ = dwscripts.findDOMObject("theMaxBufferSize");
	CONNECTION_STRING_OBJ = dwscripts.findDOMObject("theConnectionString");
	DEFAULT_USERNAME_OBJ = dwscripts.findDOMObject("theDefaultUsername");
	DEFAULT_PASSWORD_OBJ = dwscripts.findDOMObject("theDefaultPassword");
	RETURN_TIMESTAMP_AS_STRING_OBJ = dwscripts.findDOMObject("theReturnTimestampAsString");
	LIMIT_CONNECTIONS_OBJ = dwscripts.findDOMObject("theLimitConnections");
	RESTRICT_CONNECTIONS_TO_OBJ = dwscripts.findDOMObject("theRestrictConnectionsTo");
	MAINTAIN_CONNECTIONS_OBJ = dwscripts.findDOMObject("theMaintainConnections");
	TIMEOUT_OBJ = dwscripts.findDOMObject("theTimeout");
	INTERVAL_OBJ = dwscripts.findDOMObject("theInterval");

	initializeUI_advanced_common();
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
function inspectConnection(connParams) { 
	if (MM.DSNName) {
		var structure = getDataSourceStructure(MM.DSNName, true);
		if (structure) {
			CONN_NAME_OBJ.setAttribute("disabled","true");
			DB_FILE_OBJ.focus();
			
			CONN_NAME_OBJ.value = MM.DSNName;
			DB_FILE_OBJ.value = getDataSourceParameter(CONN_NAME_OBJ.value, 'databasefile', PARAM_STRING, structure);
			SYS_DB_FILE_OBJ.value = getDataSourceParameter(CONN_NAME_OBJ.value, 'systemDatabaseFile', PARAM_STRING, structure);
			USE_DEFAULT_USENAME_OBJ.checked = (getDataSourceParameter(CONN_NAME_OBJ.value, 'UseTrustedConnection', PARAM_STRING, structure).toLowerCase() == 'true')
			USERNAME_OBJ.value = getDataSourceParameter(CONN_NAME_OBJ.value, 'username', PARAM_STRING, structure);
			PASSWORD_OBJ.value = getDataSourceParameter(CONN_NAME_OBJ.value, 'password', PARAM_STRING, structure);
			DESCRIPTION_OBJ.value = getDataSourceParameter(CONN_NAME_OBJ.value, 'description', PARAM_STRING, structure);
		}

		MM.DSNName = "";
		MM.DSStructure = structure;
		MM.DSPassword = getDataSourceParameter(CONN_NAME_OBJ.value, 'password', PARAM_STRING, structure);
	} else {
		MM.DSStructure = "";
		MM.DSPassword = "";
	}
}



//--------------------------------------------------------------------
// FUNCTION:
//   inspectConnection_advanced
//
// DESCRIPTION:
//   Set the advanced UI controls based on the given connection parameters.
//   This function is called after initializeUI.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function inspectConnection_advanced() {
	var _DivAdvanced = dwscripts.findDOMObject("AdvancedSettingsDiv");
	if ((_DivAdvanced.innerHTML) && (CONN_NAME_OBJ.getAttribute("disabled") == "true")) {
		initializeUI_advanced();
		var structure = getDataSourceStructure(CONN_NAME_OBJ.value);
	
		PAGE_TIMEOUT_OBJ.value = getDataSourceParameter(CONN_NAME_OBJ.value, 'pageTimeout', PARAM_NUMBER, structure);
		MAX_BUFFER_SIZE_OBJ.value = getDataSourceParameter(CONN_NAME_OBJ.value, 'maxBufferSize', PARAM_STRING, structure);
		CONNECTION_STRING_OBJ.value = getDataSourceParameter(CONN_NAME_OBJ.value, 'args', PARAM_STRING, structure);
		DEFAULT_USERNAME_OBJ.value = getDataSourceParameter(CONN_NAME_OBJ.value, 'defaultusername', PARAM_STRING, structure);
		DEFAULT_PASSWORD_OBJ.value = getDataSourceParameter(CONN_NAME_OBJ.value, 'defaultpassword', PARAM_STRING, structure);
		RETURN_TIMESTAMP_AS_STRING_OBJ.checked = (getDataSourceParameter(CONN_NAME_OBJ.value, 'TimeStampAsString', PARAM_STRING, structure).toLowerCase() == 'true');
		LIMIT_CONNECTIONS_OBJ.checked = getDataSourceParameter(CONN_NAME_OBJ.value, 'maxconnections', PARAM_STRING, structure);
		RESTRICT_CONNECTIONS_TO_OBJ.value = getDataSourceParameter(CONN_NAME_OBJ.value, 'maxconnections', PARAM_STRING, structure);
		MAINTAIN_CONNECTIONS_OBJ.checked = (getDataSourceParameter(CONN_NAME_OBJ.value, 'pooling', PARAM_BOOLEAN, structure) == 'true');
		TIMEOUT_OBJ.value = Math.round(getDataSourceParameter(CONN_NAME_OBJ.value, 'timeout', PARAM_NUMBER, structure) / 60);
		INTERVAL_OBJ.value = Math.round(getDataSourceParameter(CONN_NAME_OBJ.value, 'interval', PARAM_NUMBER, structure) / 60);

		inspectConnection_advanced_common(structure);
	}
}



//--------------------------------------------------------------------
// FUNCTION:
//   getParams
//
// DESCRIPTION:
//   This function return all the parameters used to create the DS
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   an object containing all the parameters
//--------------------------------------------------------------------
function getParams() {
	var param = new Object();
	param.name = CONN_NAME_OBJ.value;

	// standard values
	if (DB_FILE_OBJ.value) {
		param.databasefile = DB_FILE_OBJ.value;
	}
	if (SYS_DB_FILE_OBJ.value) {
		param.systemDatabaseFile = SYS_DB_FILE_OBJ.value;
	}
	param.UseTrustedConnection = (USE_DEFAULT_USENAME_OBJ.checked) ? "true" : "false";
	if (USERNAME_OBJ.value) {
		param.username = USERNAME_OBJ.value;
	}
	if (PASSWORD_OBJ.value) {
		param.password = PASSWORD_OBJ.value;
	}
	if (DESCRIPTION_OBJ.value) {
		if ((DESCRIPTION_OBJ.value.indexOf('<!--')>=0) && (DESCRIPTION_OBJ.value.indexOf('-->')<0)) {
			alert(MM.MSG_DSDescriptionNoClosedComment);
			document.theForm.Description.focus();
			return;
		}
		param.description = DESCRIPTION_OBJ.value;
	}
	
	// advanced values
	var _DivAdvanced = dwscripts.findDOMObject("AdvancedSettingsDiv");
	if (_DivAdvanced.innerHTML) {
	
		initializeUI_advanced();
	
		if (PAGE_TIMEOUT_OBJ.value) {
			param.pageTimeout = PAGE_TIMEOUT_OBJ.value;
		}
		if (MAX_BUFFER_SIZE_OBJ.value) {
			param.maxBufferSize = MAX_BUFFER_SIZE_OBJ.value;
		}
		if (CONNECTION_STRING_OBJ.value) {
			if ((CONNECTION_STRING_OBJ.value.indexOf('<!--')>=0) && (CONNECTION_STRING_OBJ.value.indexOf('-->')<0)) {
				alert(MM.MSG_DSConnStrNoClosedComment);
				document.theForm.theConnectionString.focus();
				return;
			}
			param.args = CONNECTION_STRING_OBJ.value;
		}
		if (DEFAULT_USERNAME_OBJ.value) {
			param.defaultusername = DEFAULT_USERNAME_OBJ.value;
		}
		if (DEFAULT_PASSWORD_OBJ.value) {
			param.defaultpassword = DEFAULT_PASSWORD_OBJ.value;
		}
		if (RESTRICT_CONNECTIONS_TO_OBJ.value && LIMIT_CONNECTIONS_OBJ.checked) {
			param.enablemaxconnections = (RESTRICT_CONNECTIONS_TO_OBJ.value) ? "true" : "false";
			if (RESTRICT_CONNECTIONS_TO_OBJ.value) {
				if (Math.round(RESTRICT_CONNECTIONS_TO_OBJ.value) == RESTRICT_CONNECTIONS_TO_OBJ.value) {
					param.MAXCONNECTIONS = RESTRICT_CONNECTIONS_TO_OBJ.value;
				} else {
					alert(MM.MSG_DSWrongRestrictConn);
					return;
				}
			}
		}
		param.TimeStampAsString = (RETURN_TIMESTAMP_AS_STRING_OBJ.checked) ? "true" : "no";
		param.pooling = (MAINTAIN_CONNECTIONS_OBJ.checked) ? "true" : "false";
		if (TIMEOUT_OBJ.value) {
			param.timeout = TIMEOUT_OBJ.value * 60;
		}
		if (INTERVAL_OBJ.value) {
			param.interval = INTERVAL_OBJ.value * 60;
		}

		param = getParams_common(param);
	}

	return param;
}



//--------------------------------------------------------------------
// FUNCTION:
//   getParamsFromStructure
//
// DESCRIPTION:
//   This function returns an object with various attributes found
//   within the structure passed as function argument
//
// ARGUMENTS:
//   structure - a structure variable
//
// RETURNS:
//   an object built on structure's structure
//--------------------------------------------------------------------
function getParamsFromStructure(structure) {
	var result = new Object();
	if (structure) {
		if (getDataSourceParameter(CONN_NAME_OBJ.value, 'databasefile', PARAM_STRING, structure)) {
			result.databasefile = getDataSourceParameter(CONN_NAME_OBJ.value, 'databasefile', PARAM_STRING, structure);
		}
		if (getDataSourceParameter(CONN_NAME_OBJ.value, 'systemDatabaseFile', PARAM_STRING, structure)) {
			result.systemDatabaseFile = getDataSourceParameter(CONN_NAME_OBJ.value, 'systemDatabaseFile', PARAM_STRING, structure);
		}
		if (getDataSourceParameter(CONN_NAME_OBJ.value, 'UseTrustedConnection', PARAM_STRING, structure)) {
			result.UseTrustedConnection = getDataSourceParameter(CONN_NAME_OBJ.value, 'UseTrustedConnection', PARAM_STRING, structure);
		}
		if (getDataSourceParameter(CONN_NAME_OBJ.value, 'username', PARAM_STRING, structure)) {
			result.username = getDataSourceParameter(CONN_NAME_OBJ.value, 'username', PARAM_STRING, structure);
		}
		if (getDataSourceParameter(CONN_NAME_OBJ.value, 'password', PARAM_STRING, structure)) {
			result.password = getDataSourceParameter(CONN_NAME_OBJ.value, 'password', PARAM_STRING, structure);
		}
		if (getDataSourceParameter(CONN_NAME_OBJ.value, 'description', PARAM_STRING, structure)) {
			result.description = getDataSourceParameter(CONN_NAME_OBJ.value, 'description', PARAM_STRING, structure);
		}

		// Advanced
		if (getDataSourceParameter(CONN_NAME_OBJ.value, 'pageTimeout', PARAM_NUMBER, structure)) {
			result.pageTimeout = getDataSourceParameter(CONN_NAME_OBJ.value, 'pageTimeout', PARAM_NUMBER, structure);
		}
		if (getDataSourceParameter(CONN_NAME_OBJ.value, 'maxBufferSize', PARAM_STRING, structure)) {
			result.maxBufferSize = getDataSourceParameter(CONN_NAME_OBJ.value, 'maxBufferSize', PARAM_STRING, structure);
		}
		if (getDataSourceParameter(CONN_NAME_OBJ.value, 'args', PARAM_STRING, structure)) {
			result.args = getDataSourceParameter(CONN_NAME_OBJ.value, 'args', PARAM_STRING, structure);
		}
		if (getDataSourceParameter(CONN_NAME_OBJ.value, 'defaultusername', PARAM_STRING, structure)) {
			result.defaultusername = getDataSourceParameter(CONN_NAME_OBJ.value, 'defaultusername', PARAM_STRING, structure);
		}
		if (getDataSourceParameter(CONN_NAME_OBJ.value, 'defaultpassword', PARAM_STRING, structure)) {
			result.defaultpassword = getDataSourceParameter(CONN_NAME_OBJ.value, 'defaultpassword', PARAM_STRING, structure);
		}
		if (getDataSourceParameter(CONN_NAME_OBJ.value, 'TimeStampAsString', PARAM_STRING, structure)) {
			result.TimeStampAsString = getDataSourceParameter(CONN_NAME_OBJ.value, 'TimeStampAsString', PARAM_STRING, structure);
		}
		var maxConnections = getDataSourceParameter(CONN_NAME_OBJ.value, 'maxconnections', PARAM_STRING, structure);
		if (maxConnections) {
			result.enablemaxconnections = (maxConnections) ? 'true' : 'false';
			if (maxConnections) {
				result.MAXCONNECTIONS = getDataSourceParameter(CONN_NAME_OBJ.value, 'maxconnections', PARAM_STRING, structure);
			}
		}
		if (getDataSourceParameter(CONN_NAME_OBJ.value, 'pooling', PARAM_BOOLEAN, structure)) {
			result.pooling = getDataSourceParameter(CONN_NAME_OBJ.value, 'pooling', PARAM_BOOLEAN, structure);
		}
		if (Math.round(getDataSourceParameter(CONN_NAME_OBJ.value, 'timeout', PARAM_NUMBER, structure) / 60)) {
			result.timeout = Math.round(getDataSourceParameter(CONN_NAME_OBJ.value, 'timeout', PARAM_NUMBER, structure) / 60);
		}
		if (Math.round(getDataSourceParameter(CONN_NAME_OBJ.value, 'interval', PARAM_NUMBER, structure) / 60)) {
			result.interval = Math.round(getDataSourceParameter(CONN_NAME_OBJ.value, 'interval', PARAM_NUMBER, structure) / 60);
		}
		
		result = getParamsFromStructure_common(structure, result);
	}
	return result;
}



//--------------------------------------------------------------------
// FUNCTION:
//   createDatasource
//
// DESCRIPTION:
//   This function creates a DB2 connection on the server
//
// ARGUMENTS:
//   params - on object containing all parameters to be passed to the
//            CF server.
//
// RETURNS:
//   1 if successfull, 0 otherwise
//--------------------------------------------------------------------
function createDatasource(params) {
	if (!isValidConnection() || !params) {
		return 0;
	}
	executeRequest(buildRequest('cfide.adminapi.datasource', 'setMSAccess', params, getAdminPassword()));
	return 1;
}



//--------------------------------------------------------------------
// FUNCTION:
//   isValidConnection
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
function isValidConnection() {
	var retVal = true;

	// connection name
	if (retVal)   {
		retVal = isValidConnectionName(CONN_NAME_OBJ);
	}

	// database file
	if (retVal) {
		if (DB_FILE_OBJ.value == "") {
			alert(MM.MSG_DatabaseFileRequired);
			document.theForm.DatabaseFile.focus();
			return false;
		}
	}
  
	return retVal;
}
