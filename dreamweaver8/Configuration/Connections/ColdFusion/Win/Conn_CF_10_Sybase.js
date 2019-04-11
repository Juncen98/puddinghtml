// Copyright 2005 Macromedia, Inc. All rights reserved.

var HELP_DOC = MM.HELP_DSsettingSybase;

var CONN_NAME_OBJ;
var DB_NAME_OBJ;
var HOST_NAME_OBJ;
var PORT_OBJ;
var USERNAME_OBJ;
var PASSWORD_OBJ;
var DESCRIPTION_OBJ;

var SELECT_METHOD_OBJ;			//theSelectMethod
var LIMIT_CONNECTIONS_OBJ;		//theLimitConnections
var RESTRICT_CONNECTIONS_TO_OBJ;//theRestrictConnectionsTo
var MAINTAIN_CONNECTIONS_OBJ;	//theMaintainConnections
var STRING_FORMAT_OBJ;			//theStringFormat
var MAX_POOLED_STATEMENTS_OBJ;	//theMaxPooledStatements
var TIMEOUT_OBJ;				//theTimeout
var INTERVAL_OBJ;				//theInterval

var AdvancedSettingsFileName = "../AdvancedSettings/Conn_CF_10_Sybase_Adv.htm";
var selectMethod = new Array("Direct", "Cursor");


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
	DB_NAME_OBJ = dwscripts.findDOMObject("DatabaseName");
	HOST_NAME_OBJ = dwscripts.findDOMObject("HostName");
	PORT_OBJ = dwscripts.findDOMObject("Port");
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
	SELECT_METHOD_OBJ = dwscripts.findDOMObject("theSelectMethod");
	LIMIT_CONNECTIONS_OBJ = dwscripts.findDOMObject("theLimitConnections");
	RESTRICT_CONNECTIONS_TO_OBJ = dwscripts.findDOMObject("theRestrictConnectionsTo");
	MAINTAIN_CONNECTIONS_OBJ = dwscripts.findDOMObject("theMaintainConnections");
	STRING_FORMAT_OBJ = dwscripts.findDOMObject("theStringFormat");
	MAX_POOLED_STATEMENTS_OBJ = dwscripts.findDOMObject("theMaxPooledStatements");
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
			DB_NAME_OBJ.focus();
			
			CONN_NAME_OBJ.value = MM.DSNName;
			DB_NAME_OBJ.value = getDataSourceParameter(CONN_NAME_OBJ.value, 'database', PARAM_STRING, structure);
			HOST_NAME_OBJ.value = getDataSourceParameter(CONN_NAME_OBJ.value, 'host', PARAM_STRING, structure);
			PORT_OBJ.value = trimDotZero(getDataSourceParameter(CONN_NAME_OBJ.value, 'port', PARAM_ALL, structure));
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
	
		var connSelMethod = getDataSourceParameter(CONN_NAME_OBJ.value, 'selectMethod', PARAM_STRING, structure).toLowerCase();
		for (var i=0; i<selectMethod.length; i++) {
			if (connSelMethod == selectMethod[i].toLowerCase()) {
				SELECT_METHOD_OBJ.selectedIndex = i;
			}
		}
		LIMIT_CONNECTIONS_OBJ.checked = getDataSourceParameter(CONN_NAME_OBJ.value, 'maxconnections', PARAM_STRING, structure);
		RESTRICT_CONNECTIONS_TO_OBJ.value = getDataSourceParameter(CONN_NAME_OBJ.value, 'maxconnections', PARAM_STRING, structure);
		MAINTAIN_CONNECTIONS_OBJ.checked = (getDataSourceParameter(CONN_NAME_OBJ.value, 'pooling', PARAM_BOOLEAN, structure) == 'true');
		STRING_FORMAT_OBJ.checked = (getDataSourceParameter(CONN_NAME_OBJ.value, 'sendStringParametersAsUnicode', PARAM_STRING, structure) == 'true');
		MAX_POOLED_STATEMENTS_OBJ.value = getDataSourceParameter(CONN_NAME_OBJ.value, 'MaxPooledStatements', PARAM_STRING, structure);
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
	if (DB_NAME_OBJ.value) {
		param.database = DB_NAME_OBJ.value;
	}
	if (HOST_NAME_OBJ.value) {
		param.host = HOST_NAME_OBJ.value;
	}
	if (PORT_OBJ.value) {
		param.port = PORT_OBJ.value;
	}
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
	
		param.selectMethod = selectMethod[SELECT_METHOD_OBJ.selectedIndex];
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
		param.pooling = (MAINTAIN_CONNECTIONS_OBJ.checked) ? "true" : "false";
		param.sendStringParametersAsUnicode = (STRING_FORMAT_OBJ.checked) ? "true" : "false";
		if (MAX_POOLED_STATEMENTS_OBJ.value) {
			param.MaxPooledStatements = MAX_POOLED_STATEMENTS_OBJ.value;
		}
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
		if (getDataSourceParameter(CONN_NAME_OBJ.value, 'database', PARAM_STRING, structure)) {
			result.database = getDataSourceParameter(CONN_NAME_OBJ.value, 'database', PARAM_STRING, structure);
		}
		if (getDataSourceParameter(CONN_NAME_OBJ.value, 'host', PARAM_STRING, structure)) {
			result.host = getDataSourceParameter(CONN_NAME_OBJ.value, 'host', PARAM_STRING, structure);
		}
		if (trimDotZero(getDataSourceParameter(CONN_NAME_OBJ.value, 'port', PARAM_ALL, structure))) {
			result.port = trimDotZero(getDataSourceParameter(CONN_NAME_OBJ.value, 'port', PARAM_ALL, structure));
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
		if (getDataSourceParameter(CONN_NAME_OBJ.value, 'selectMethod', PARAM_STRING, structure)) {
			result.selectMethod = getDataSourceParameter(CONN_NAME_OBJ.value, 'selectMethod', PARAM_STRING, structure);
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
		if (getDataSourceParameter(CONN_NAME_OBJ.value, 'sendStringParametersAsUnicode', PARAM_STRING, structure)) {
			result.sendStringParametersAsUnicode = getDataSourceParameter(CONN_NAME_OBJ.value, 'sendStringParametersAsUnicode', PARAM_STRING, structure);
		}
		if (getDataSourceParameter(CONN_NAME_OBJ.value, 'MaxPooledStatements', PARAM_STRING, structure)) {
			result.MaxPooledStatements = getDataSourceParameter(CONN_NAME_OBJ.value, 'MaxPooledStatements', PARAM_STRING, structure);
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
//   This function creates a Sybase connection on the server
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
	executeRequest(buildRequest('cfide.adminapi.datasource', 'setSybase', params, getAdminPassword()));
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

	// database name
	if (retVal) {
		if (DB_NAME_OBJ.value == "") {
			alert(MM.MSG_DatabaseRequired);
			document.theForm.DatabaseName.focus();
			return false;
		}
	}
  
	// host name
	if (retVal) {
		if (HOST_NAME_OBJ.value == "") {
			alert(MM.MSG_HostNameRequired);
			document.theForm.HostName.focus();
			return false;
		}
	}
 
	return retVal;
}
