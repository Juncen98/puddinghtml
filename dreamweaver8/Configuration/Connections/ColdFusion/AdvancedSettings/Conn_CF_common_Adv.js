// Copyright 2005 Macromedia, Inc. All rights reserved.

var DISABLE_CONNECTIONS_OBJ;		//theDisableConnections
var LOGIN_TIMEOUT_OBJ;				//theLoginTimeout
var CLOB_OBJ;						//theCLOB
var LONG_TEXT_BUF_OBJ;				//theLongTextBuf
var BLOB_OBJ;						//theBLOB
var BLOB_BUF_OBJ;					//theBlobBuf
var ALLOW_SELECT_OBJ;				//theAllowSELECT
var ALLOW_CREATE_OBJ;				//theAllowCreate
var ALLOW_GRANT_OBJ;				//theAllowGRANT
var ALLOW_INSERT_OBJ;				//theAllowINSERT
var ALLOW_DROP_OBJ;					//theAllowDROP
var ALLOW_REVOKE_OBJ;				//theAllowREVOKE
var ALLOW_UPDATE_OBJ;				//theAllowUPDATE
var ALLOW_ALTER_OBJ;				//theAllowALTER
var ALLOW_DELETE_OBJ;				//theAllowDELETE
var ALLOW_STORED_PROCS_OBJ;			//theAllowStoredProcs


//--------------------------------------------------------------------
// FUNCTION:
//   initializeUI_advanced_common
//
// DESCRIPTION:
//   Get the DOM objects for the various common advanced UI controls
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function initializeUI_advanced_common() {
	DISABLE_CONNECTIONS_OBJ = dwscripts.findDOMObject("theDisableConnections");
	LOGIN_TIMEOUT_OBJ = dwscripts.findDOMObject("theLoginTimeout");
	CLOB_OBJ = dwscripts.findDOMObject("theCLOB");
	LONG_TEXT_BUF_OBJ = dwscripts.findDOMObject("theLongTextBuf");
	BLOB_OBJ = dwscripts.findDOMObject("theBLOB");
	BLOB_BUF_OBJ = dwscripts.findDOMObject("theBlobBuf");
	ALLOW_SELECT_OBJ = dwscripts.findDOMObject("theAllowSELECT");
	ALLOW_CREATE_OBJ = dwscripts.findDOMObject("theAllowCreate");
	ALLOW_GRANT_OBJ = dwscripts.findDOMObject("theAllowGRANT");
	ALLOW_INSERT_OBJ = dwscripts.findDOMObject("theAllowINSERT");
	ALLOW_DROP_OBJ = dwscripts.findDOMObject("theAllowDROP");
	ALLOW_REVOKE_OBJ = dwscripts.findDOMObject("theAllowREVOKE");
	ALLOW_UPDATE_OBJ = dwscripts.findDOMObject("theAllowUPDATE");
	ALLOW_ALTER_OBJ = dwscripts.findDOMObject("theAllowALTER");
	ALLOW_DELETE_OBJ = dwscripts.findDOMObject("theAllowDELETE");
	ALLOW_STORED_PROCS_OBJ = dwscripts.findDOMObject("theAllowStoredProcs");
}



//--------------------------------------------------------------------
// FUNCTION:
//   inspectConnection_advanced_common
//
// DESCRIPTION:
//   Set the common advanced UI controls based on the given connection parameters.
//   This function is called after initializeUI.
//
// ARGUMENTS:
//   structure - connection record
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function inspectConnection_advanced_common(structure) {
	DISABLE_CONNECTIONS_OBJ.checked = (getDataSourceParameter(CONN_NAME_OBJ.value, 'disable', PARAM_BOOLEAN, structure) == 'true');
	LOGIN_TIMEOUT_OBJ.value = trimDotZero(getDataSourceParameter(CONN_NAME_OBJ.value, 'login_timeout', PARAM_NUMBER, structure));
	CLOB_OBJ.checked = (getDataSourceParameter(CONN_NAME_OBJ.value, 'disable_clob', PARAM_BOOLEAN, structure) == 'false');
	BLOB_OBJ.checked = (getDataSourceParameter(CONN_NAME_OBJ.value, 'disable_blob', PARAM_BOOLEAN, structure) == 'false');
	LONG_TEXT_BUF_OBJ.value = trimDotZero(getDataSourceParameter(CONN_NAME_OBJ.value, 'buffer', PARAM_NUMBER, structure));
	BLOB_BUF_OBJ.value = trimDotZero(getDataSourceParameter(CONN_NAME_OBJ.value, 'blob_buffer', PARAM_NUMBER, structure));
	ALLOW_SELECT_OBJ.checked = (getDataSourceParameter(CONN_NAME_OBJ.value, 'select', PARAM_BOOLEAN, structure) == 'true');
	ALLOW_CREATE_OBJ.checked = (getDataSourceParameter(CONN_NAME_OBJ.value, 'create', PARAM_BOOLEAN, structure) == 'true');
	ALLOW_GRANT_OBJ.checked = (getDataSourceParameter(CONN_NAME_OBJ.value, 'grant', PARAM_BOOLEAN, structure) == 'true');
	ALLOW_INSERT_OBJ.checked = (getDataSourceParameter(CONN_NAME_OBJ.value, 'insert', PARAM_BOOLEAN, structure) == 'true');
	ALLOW_DROP_OBJ.checked = (getDataSourceParameter(CONN_NAME_OBJ.value, 'drop', PARAM_BOOLEAN, structure) == 'true');
	ALLOW_REVOKE_OBJ.checked = (getDataSourceParameter(CONN_NAME_OBJ.value, 'revoke', PARAM_BOOLEAN, structure) == 'true');
	ALLOW_UPDATE_OBJ.checked = (getDataSourceParameter(CONN_NAME_OBJ.value, 'update', PARAM_BOOLEAN, structure) == 'true');
	ALLOW_ALTER_OBJ.checked = (getDataSourceParameter(CONN_NAME_OBJ.value, 'alter', PARAM_BOOLEAN, structure) == 'true');
	ALLOW_DELETE_OBJ.checked = (getDataSourceParameter(CONN_NAME_OBJ.value, 'delete', PARAM_BOOLEAN, structure) == 'true');
	ALLOW_STORED_PROCS_OBJ.checked = (getDataSourceParameter(CONN_NAME_OBJ.value, 'storedproc', PARAM_BOOLEAN, structure) == 'true');
}



//--------------------------------------------------------------------
// FUNCTION:
//   getParams_common
//
// DESCRIPTION:
//   This function return all the advanced parameters used to create the DS
//
// ARGUMENTS:
//   param - existing params
//
// RETURNS:
//   an object containing existing and newly added parameters
//--------------------------------------------------------------------
function getParams_common(param) {
	param.disable = (DISABLE_CONNECTIONS_OBJ.checked) ? "true" : "false";
	if (LOGIN_TIMEOUT_OBJ.value) {
		param.login_timeout = LOGIN_TIMEOUT_OBJ.value;
	}
	param.disable_clob = (CLOB_OBJ.checked) ? "false" : "true";
	if (LONG_TEXT_BUF_OBJ.value) {
		param.buffer = LONG_TEXT_BUF_OBJ.value;
	}
	param.disable_blob = (BLOB_OBJ.checked) ? "false" : "true";
	if (BLOB_BUF_OBJ.value) {
		param.blob_buffer = BLOB_BUF_OBJ.value;
	}
	param.select = (ALLOW_SELECT_OBJ.checked) ? "true" : "false";
	param.create = (ALLOW_CREATE_OBJ.checked) ? "true" : "false";
	param.grant = (ALLOW_GRANT_OBJ.checked) ? "true" : "false";
	param.insert = (ALLOW_INSERT_OBJ.checked) ? "true" : "false";
	param.drop = (ALLOW_DROP_OBJ.checked) ? "true" : "false";
	param.revoke = (ALLOW_REVOKE_OBJ.checked) ? "true" : "false";
	param.update = (ALLOW_UPDATE_OBJ.checked) ? "true" : "false";
	param.alter = (ALLOW_ALTER_OBJ.checked) ? "true" : "false";
	param.Delete = (ALLOW_DELETE_OBJ.checked) ? "true" : "false";
	param.storedproc = (ALLOW_STORED_PROCS_OBJ.checked) ? "true" : "false";
	return param;
}



//--------------------------------------------------------------------
// FUNCTION:
//   getParamsFromStructure_common
//
// DESCRIPTION:
//   This function return all the advanced parameters used to create the DS
//
// ARGUMENTS:
//   structure - a datasource structure
//   result - an existing object which has to be updated
//
// RETURNS:
//   an object containing existing and newly added parameters
//--------------------------------------------------------------------
function getParamsFromStructure_common(structure, result) {
	result.disable = getDataSourceParameter(CONN_NAME_OBJ.value, 'disable', PARAM_BOOLEAN, structure);
	if (trimDotZero(getDataSourceParameter(CONN_NAME_OBJ.value, 'login_timeout', PARAM_NUMBER, structure))) {
		result.login_timeout = trimDotZero(getDataSourceParameter(CONN_NAME_OBJ.value, 'login_timeout', PARAM_NUMBER, structure));
	}
	result.disable_clob = getDataSourceParameter(CONN_NAME_OBJ.value, 'disable_clob', PARAM_BOOLEAN, structure);
	result.disable_blob = getDataSourceParameter(CONN_NAME_OBJ.value, 'disable_blob', PARAM_BOOLEAN, structure);
	if (trimDotZero(getDataSourceParameter(CONN_NAME_OBJ.value, 'buffer', PARAM_NUMBER, structure))) {
		result.buffer = trimDotZero(getDataSourceParameter(CONN_NAME_OBJ.value, 'buffer', PARAM_NUMBER, structure))
	}
	if (trimDotZero(getDataSourceParameter(CONN_NAME_OBJ.value, 'blob_buffer', PARAM_NUMBER, structure))) {
		result.blob_buffer = trimDotZero(getDataSourceParameter(CONN_NAME_OBJ.value, 'blob_buffer', PARAM_NUMBER, structure));
	}
	result.select = getDataSourceParameter(CONN_NAME_OBJ.value, 'select', PARAM_BOOLEAN, structure);
	result.create = getDataSourceParameter(CONN_NAME_OBJ.value, 'create', PARAM_BOOLEAN, structure);
	result.grant = getDataSourceParameter(CONN_NAME_OBJ.value, 'grant', PARAM_BOOLEAN, structure);
	result.insert = getDataSourceParameter(CONN_NAME_OBJ.value, 'insert', PARAM_BOOLEAN, structure);
	result.drop = getDataSourceParameter(CONN_NAME_OBJ.value, 'drop', PARAM_BOOLEAN, structure);
	result.revoke = getDataSourceParameter(CONN_NAME_OBJ.value, 'revoke', PARAM_BOOLEAN, structure);
	result.update = getDataSourceParameter(CONN_NAME_OBJ.value, 'update', PARAM_BOOLEAN, structure);
	result.alter = getDataSourceParameter(CONN_NAME_OBJ.value, 'alter', PARAM_BOOLEAN, structure);
	result.Delete = getDataSourceParameter(CONN_NAME_OBJ.value, 'delete', PARAM_BOOLEAN, structure);
	result.storedproc = getDataSourceParameter(CONN_NAME_OBJ.value, 'storedproc', PARAM_BOOLEAN, structure);
	
	return result;
}
