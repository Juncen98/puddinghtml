// Copyright 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

//*************** GLOBALS VARS *****************

var helpDoc = MM.HELP_CFCQuery_cmd;

var RECORDSET_SBOBJ;  // SBRecordset argument to the command.

var SP_Mode = false;  //Since we have different formatting behavior based on whether 
            //the object is a stored proc or not, we use this as a switch to 
            //keep track of what's the current selection.

//The following constants and vars are used to build up the SQL statement.

var RECORDSET_TYPE = 'CFC Query';

var RS_NAME, CFC_LIST, CFC_S, CFC_FUNCTION, CFC_PARAMETERS; 
var CFC_CONN, CFC_SQL;
var _ParamName = null;
var _ParamDefault = null;
var _ParamEditBtn = null;

var VAR_TYPE_URL = 1;
var VAR_TYPE_FORM = 2;
var VAR_TYPE_COOKIE = 3;
var VAR_TYPE_SESSION = 4;
var VAR_TYPE_APPLICATION = 5;
var VAR_TYPE_ENTERED_VALUE = 6;


var cfcprefix = "cfcs/recordsets/";

var packages = new Object();
var currPackage = null;
var currCfc = null;

var origCfcCfc = null;
var origCfcFn = null;
var origAttrs = new Array();
var gfnlistVal = new Object();

var allowChange = true;
var isEdit = false;



//--------------------------------------------------------------------
// FUNCTION:
//   commandButtons
//
// DESCRIPTION:
//   Returns the list of buttons which should appear on the right hand
//   side of the dialog
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   Array - pairs of button name and function call
//--------------------------------------------------------------------
function commandButtons() {
	
	var btnArray =  new Array(MM.BTN_OK,     "clickedOK()", 
                   MM.BTN_Cancel, "clickedCancel()", 
                   MM.BTN_Test,   "clickedTest()");

	
	var dom = dreamweaver.getDocumentDOM();
	var docName = dom.URL;
	var docType = dom.documentType;
	
	// add a button for each different rs type
	// add a button for each different rs type
	for (i = 0;i < MM.rsTypes.length;i++) 
	{
		if( (!MM.rsTypes[i].fileExt      || docName.match(MM.rsTypes[i].fileExtRegExp)) ||
		    (!MM.rsTypes[i].documentType || docType.match(MM.rsTypes[i].documentTypeRegExp)) )
		{	     
	    	if (dom.serverModel.getServerName() == MM.rsTypes[i].serverModel) {
	    		if (RECORDSET_TYPE.toLowerCase() != MM.rsTypes[i].type.toLowerCase()) {
					var btnLabel = dw.loadString("recordsetType/" + MM.rsTypes[i].type);
					if (!btnLabel)
						btnLabel = MM.rsTypes[i].type;
					btnArray.push(btnLabel+"...");
					btnArray.push("clickedChange(" + i + ")");
				} else {
					if(MM.rsTypes[i].changeOnEdit == 'no') {
						// this will prevent changing the rs type on edit
						allowChange = false;
					}
				}
			}
		}
	}
	btnArray.push(MM.BTN_Help);
	btnArray.push("displayHelp()"); 
	return btnArray;
}



function windowDimensions(platform) {
	if(navigator.platform.charAt(0)=="M") {
	  return "510,450";
	} else {
		return "";
	}
}



//--------------------------------------------------------------------
// FUNCTION:
//   clickedChange
//
// DESCRIPTION:
//   This function is called when the user clicks another rs Type button
//
// ARGUMENTS:
//   newUIAction - the index of the new rs Type
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function clickedChange(newUIAction) {
	// Update RECORDSET_SBOBJ from the UI.
	if (!allowChange) { // && isEdit) {
		alert(MM.MSG_RS_Type_Block);
		return;
	 }
	updateSBRecordsetObject();
	fillAditionalParameters(RECORDSET_SBOBJ);
	recordsetDialog.onClickSwitchUI(window, newUIAction, RECORDSET_SBOBJ, MM.rsTypes[newUIAction].command);
}



//--------------------------------------------------------------------
// FUNCTION:
//   clickedOK
//
// DESCRIPTION:
//   This function is called when the user clicks OK
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function clickedOK() {
	if (!validateInput()) {
		return;
	}

	// Update RECORDSET_SBOBJ from the UI.
	updateSBRecordsetObject();
	fillAditionalParameters(RECORDSET_SBOBJ);

	var sql = RECORDSET_SBOBJ.getParameter('SQLStatement');
	for (var i=0;i<origAttrs.length;i++) {
		sql += '\n#' + origAttrs[i].varName + "#";
	}

	RECORDSET_SBOBJ.setParameter("SQLStatement", sql);
	recordsetDialog.onClickOK(window, RECORDSET_SBOBJ);
}



function validateInput() {
	var pName = CFC_LIST.getValue();
	if (!pName) {
		alert(MM.MSG_Choose_Package);
		return false;
	}

	var cName = CFC_S.getValue();
	if (!cName) {
		alert(MM.MSG_Choose_Component);
		return false;
	}

	var fName = CFC_FUNCTION.getValue();
	if (!fName) {
		alert(MM.MSG_Choose_Function);
		return false;
	}
	
	var sqlSyntax = CFC_SQL.value;
	if ((!sqlSyntax) || (sqlSyntax.toLowerCase() == "unknown")) {
		alert(MM.MSG_Invalid_SQL);
		return false;
	}
	
	return true;
}



//--------------------------------------------------------------------
// FUNCTION:
//   clickedCancel
//
// DESCRIPTION:
//   This function is called when CANCEL is clicked
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function clickedCancel() {
	recordsetDialog.onClickCancel(window);
}



//--------------------------------------------------------------------
// FUNCTION:
//   clickedTest
//
// DESCRIPTION:
//   This function is called when the user clicks the TEST button
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function clickedTest() {
  // Update RECORDSET_SBOBJ from the UI.
	updateSBRecordsetObject();
	fillAditionalParameters(RECORDSET_SBOBJ, 'test');

	recordsetDialog.displayTestDialog(RECORDSET_SBOBJ);
}



//--------------------------------------------------------------------
// FUNCTION:
//   displayHelp1
//
// DESCRIPTION:
//   This function is called when the user clicks the HELP button
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function displayHelp1() {
	dw.browseDocument(helpDoc);
}



function initialiseUI() {
	if(!checkAdvRS('2.7.7')) {
		alert(MM.MSG_CFC_old_AdvRS);
	}
	
	var loadingLayer = dwscripts.findDOMObject("loadingLayer");
	var mainLayer = dwscripts.findDOMObject("mainLayer");

	_ParamName = dwscripts.findDOMObject("ParamName"); 
	_ParamDefault = dwscripts.findDOMObject("ParamDefault"); 
	_ParamEditBtn = dwscripts.findDOMObject("editCFParam"); 

	_ParamName.innerHTML = MM.LABEL_ParamAttributesValue;
	_ParamDefault.innerHTML = MM.LABEL_ParamAttributesDefault;

	var args = dwscripts.getCommandArguments();
	RECORDSET_SBOBJ = args;
	if(RECORDSET_SBOBJ.sbParticipants.length > 0) {	
		// we are on edit
		isEdit = true;
	}
	
	RS_NAME = findObject("rsName");
	CFC_LIST = new ListControl("CFCPackage");
	CFC_S = new ListControl("CFCs");
	CFC_FUNCTION = new ListControl("CFCFunction");
	CFC_PARAMETERS = new ListControl("CFCParameters");
	CFC_CONN = new ListControl("CFCConnection");
	CFC_SQL = findObject("CFCsql");
	var rsName = RECORDSET_SBOBJ.getRecordsetName();
	if (!rsName) 	{
	    rsName = RECORDSET_SBOBJ.getUniqueRecordsetName();
	}
	RS_NAME.value = rsName;
	PopulateCFCList(false);
	if (CFC_LIST.getLen() == 0) {
		loadingLayer.visibility="hidden";
		mainLayer.visibility="visible";
		return;
		//alert("TODO: error, no CFCs found.");
	}
	// Select the CFC previosly choosen
	//if (MM.RecordsetObject) {
	var origCfcName = RECORDSET_SBOBJ.getParameter('CfcName');
	if (origCfcName) {
		var origCfcPack = origCfcName.replace(/\.[^\.]*$/, '');
		origCfcCfc = origCfcName.replace(/^.*\.([^\.]*)$/, '$1');
		origCfcFn = RECORDSET_SBOBJ.getParameter('CfcMethod');
		for (i=0;i<CFC_LIST.getLen();i++) {
			if (CFC_LIST.get(i) == origCfcPack) {
				CFC_LIST.setIndex(i);
			}
		}
	}
	

	var torigAttrs = new Array();
	var sqlParams = new Array();

	// get all defined parameters
	var dom = dw.getDocumentDOM();
	var paramTags = dom.getElementsByTagName("cfparam");
	for (var j = 0; j < paramTags.length; j++) {
		var param = new Object();
		param.varName = paramTags[j].getAttribute("name"); 
		param.varDefault = paramTags[j].getAttribute("default");
		sqlParams.push(param);
	}
	
	// make the model
	var tmpKeys = RECORDSET_SBOBJ.getParameter('extraArgKeys');
	var tmpValues = RECORDSET_SBOBJ.getParameter('extraArgValues');
	// this when comming from 'Advanced...'
	var tmpDefNames = RECORDSET_SBOBJ.getParameter('VariableNames');
	var tmpDefValues = RECORDSET_SBOBJ.getParameter('VariableDefaults');
	if (tmpKeys) {
		for (var i=0;i<tmpKeys.length;i++) {
			var tmp = new Object();
			tmp.name = tmpKeys[i];
			tmp.varName = tmpValues[i].replace(/(^#|#$)/g, '');
			tmp.varType = getVarType(tmp.varName);
			
			if (tmp.varName.match(/^[a-z_]/i)) {
				tmp.varDefault = 0;
				if(sqlParams.length > 0) {
					// we are on edit - get values from dom
					for (var j=0;j<sqlParams.length;j++) {
						if (sqlParams[j].varName == tmp.varName.replace(/#/g, '')) {
							tmp.varDefault = sqlParams[j].varDefault;
							break;
						}
					}
				} else {
					// comming from other RS type - get values from RECORDSET_SBOBJ
					for (var j=0;j<tmpDefNames.length;j++) {
						if (tmpDefNames[j] == tmp.varName.replace(/#/g, '')) {
							tmp.varDefault = tmpDefValues[j];
							break;
						}
					}
				}
			} else {
				tmp.varDefault = tmp.varName;
			}
			torigAttrs.push(tmp);
		}
	}

	updateUI('CFCPackage');
	origAttrs = torigAttrs;
	updateUI('CFCParameters');
	
	loadingLayer.visibility="hidden";
	mainLayer.visibility="visible";
}



function updateUI(control) {
	switch (control) {
		case 'CFCPackage':
			if (!CFC_LIST.getValue()) {
				// no CFCs found
				CFC_S.setAll("", "");
				return;
			}
			currPackage = packages[CFC_LIST.getValue()];
			var cfclist = new Array();
			var sitePrefix = getSitePrefix();
			
			for (var i=0; i<currPackage.CFCs.length; i++) {
				var cfcinmcdlDOM = getcfcinmcdlDOM(CFC_LIST.getValue(), currPackage.CFCs[i].name);
				if (cfcinmcdlDOM) {
					cfclist.push(currPackage.CFCs[i].name);
				}
			}
			
			if (cfclist.length == 0) {
				alert(MM.MSG_NewComponentNoCFCsUploaded);
				return;
			}
			CFC_S.setAll(cfclist, cfclist);
			if (origCfcCfc) {
				CFC_S.pickValue(origCfcCfc);
				origCfcCfc = null;
			}
			updateUI('CFCs');
			break;
		case 'CFCs':
			var i;
			if(!currPackage) {
				// there are no CFCs
				return;
			}
			for (i=0; i<currPackage.CFCs.length; i++) {
				if (currPackage.CFCs[i].name == CFC_S.getValue()) {
					currCfc = currPackage.CFCs[i].name;
					var cfcinmcdlDOM = getcfcinmcdlDOM(CFC_LIST.getValue(), currCfc);

					var methodsToIgnore = new Array();
					var bFilterOutBuiltInMethods = true;  //  TBD:  get this from the UI somehow.
					if (bFilterOutBuiltInMethods)
					{
						methodsToIgnore.push("getDescriptor");
						methodsToIgnore.push("getDescriptor_html");
						methodsToIgnore.push("getDescriptor_mcdl");
						methodsToIgnore.push("getDescriptor_wddx");
						methodsToIgnore.push("getDescriptor_wsdl");
						methodsToIgnore.push("cfcToHTML");
						methodsToIgnore.push("cfcToMCDL");
						methodsToIgnore.push("cfcToMCDL_");
						methodsToIgnore.push("cfcToWDDX");
						methodsToIgnore.push("cfcToWSDL");
					}
					currCfc = new Object();

					/*
					currCfc.methods = new Array();
					if (cfcinmcdlDOM) {
						currCfc.methods = cfcinmcdlDOM.getElementsByTagName('method');
					} else {
						alert("There is a problem with this CFC.");
					}
					*/

					if (cfcinmcdlDOM) {
						parseCFCinMCDL(cfcinmcdlDOM, currCfc, methodsToIgnore);
					} else {
						alert(MM.MSG_CFC_Bad);
						return;
					}
					break;
				}
			}
			var fnlist = new Array();
			gfnlistVal = new Object();
			if (currCfc) {
				for(var i=0; i<currCfc.methods.length; i++) {
					if ((currCfc.methods[i].returnType && currCfc.methods[i].returnType.toUpperCase() == 'QUERY')&&(!currCfc.methods[i].access || currCfc.methods[i].access.toUpperCase() != "PRIVATE") && (!currCfc.methods[i].inherited)) {
						fnlist.push(String(currCfc.methods[i].name));
						gfnlistVal[currCfc.methods[i].name] = currCfc.methods[i];
					}
				}
				CFC_FUNCTION.setAll(fnlist, fnlist);
				if (fnlist.length == 0) {
					alert(MM.MSG_NewComponentNoValidFunction);
					CFC_CONN.setAll(Array(MM.MSG_Choose_Function), Array(MM.MSG_Choose_Function));
					CFC_SQL.value = MM.MSG_Choose_Function;
					return;
				}
				if (origCfcFn) {
					CFC_FUNCTION.pickValue(origCfcFn);
					origCfcFn = null;
				}
				updateUI('CFCFunction');
			} else {
				CFC_LIST.del();
			}
			break;
		case 'CFCFunction':
			origAttrs = new Array();
			updateHiddenFields();
			var arguments = new Array();
			if (CFC_FUNCTION.getValue()) {
				var oarguments = gfnlistVal[CFC_FUNCTION.getValue()].arguments;
				for (var i=0;i<oarguments.length;i++) {
					arguments.push(oarguments[i].name);
				}
			}
			CFC_PARAMETERS.setAll(arguments, arguments);
			updateUI('CFCParameters');
			break;
		case 'CFCParameters':
			if (CFC_PARAMETERS.getLen() > 0 && CFC_PARAMETERS.getValue() != '') {
				_ParamEditBtn.removeAttribute("disabled");
				var found = false;
				for (var i=0;i<origAttrs.length;i++) {
					if (origAttrs[i].name.toLowerCase() == CFC_PARAMETERS.getValue().toLowerCase()) {
						_ParamName.innerHTML = MM.LABEL_ParamAttributesValue + origAttrs[i].varName.replace(/(^#|#$)/g, '');
						if(origAttrs[i].varDefault != null) {
							_ParamDefault.innerHTML = MM.LABEL_ParamAttributesDefault + origAttrs[i].varDefault;
						} else {
							_ParamDefault.innerHTML = MM.LABEL_ParamAttributesDefault;
						}
						found = true;
						break;
					}
				}
				if (!found) {
					var defaultVal = 0;
					var oarguments = gfnlistVal[CFC_FUNCTION.getValue()].arguments;
					for (var i=0;i<oarguments.length;i++) {
						if( oarguments[i].name == CFC_PARAMETERS.getValue() ){
							defaultVal = oarguments[i].defaultValue;
							break;
						}
					}
					
					var tmp = new Object();
					tmp.name = CFC_PARAMETERS.getValue();
					tmp.varName = defaultVal;
					tmp.varDefault = defaultVal;
					tmp.varType = getVarType(tmp.varName);
					_ParamName.innerHTML = MM.LABEL_ParamAttributesValue + defaultVal;
					_ParamDefault.innerHTML = MM.LABEL_ParamAttributesDefault + defaultVal;
					origAttrs.push(tmp);
				}
			} else {
				_ParamName.innerHTML = MM.LABEL_ParamAttributesValue;
				_ParamDefault.innerHTML = MM.LABEL_ParamAttributesDefault;
				_ParamEditBtn.setAttribute("disabled", "true");
			}
			break;
		case 'editCFParam':
			var found = false;
			var i;
			for (i=0;i<origAttrs.length;i++) {
				if (origAttrs[i].name.toLowerCase() == CFC_PARAMETERS.getValue().toLowerCase()) {
					found = true;
					break;
				}
			}
			if (found) {
				var cmdArgs = new Array();
				cmdArgs[0] = false;
				cmdArgs[1] = origAttrs[i].name;
				cmdArgs[2] = origAttrs[i].varName;
				cmdArgs[3] = origAttrs[i].varDefault;

				var editParamResult = dwscripts.callCommand("Edit CFCRS Parameter", cmdArgs);            
				if (editParamResult && editParamResult.length)
				{
					origAttrs[i].varName = editParamResult[0];
					origAttrs[i].varDefault = editParamResult[1];
					origAttrs[i].varType = getVarType(origAttrs[i].varName);
					updateUI('CFCParameters');
				}
			}
			break;
	}
}



function updateHiddenFields() {
	updateSBRecordsetObject();
	fillAditionalParameters(RECORDSET_SBOBJ);
	var tmp = findObject("CFCsql");
	tmp.value = RECORDSET_SBOBJ.getParameter('SQLStatement').replace(/^\s*/m, '');

	var tmp = findObject("CFCConnection");
	tmp.options[0].text = RECORDSET_SBOBJ.getParameter('ConnectionName');
}


//--------------------------------------------------------------------
// FUNCTION:
//   getVarType
//
// DESCRIPTION:
//   This function determines the type of the entered variable by
//   looking at it's name
//
// ARGUMENTS:
//   varName - variable name
//
// RETURNS:
//   A constant representing it's type: URL, FORM, COOKIE, SESSION,
//   APPLICATION, ENTERED VALUE
//--------------------------------------------------------------------
function getVarType(varName) {
	var varType = VAR_TYPE_ENTERED_VALUE;
	if ((varName) && (varName.indexOf('.') != -1)) {
		switch (varName.substr(0, varName.indexOf('.')).toLowerCase()) {
			case "url":
				varType = VAR_TYPE_URL;
				break;
			case "form":
				varType = VAR_TYPE_FORM;
				break;
			case "cookie":
				varType = VAR_TYPE_COOKIE;
				break;
			case "session":
				varType = VAR_TYPE_SESSION;
				break;
			case "application":
				varType = VAR_TYPE_APPLICATION;
				break;
		}
	}
	
	return varType;
}


//--------------------------------------------------------------------
// FUNCTION:
//   updateSBRecordsetObject
//
// DESCRIPTION:
//   Collects information from the UI and sets the SBRecordset object
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   boolean - true if successful, false otherwise
//--------------------------------------------------------------------
function updateSBRecordsetObject() {
	RECORDSET_SBOBJ.setRecordsetName(RS_NAME.value);
	//RECORDSET_SBOBJ.setConnectionName('Unknown');
	//RECORDSET_SBOBJ.setDatabaseCall('Unknown',new Array());

	RECORDSET_SBOBJ.setParameter("MM_subType","CFC Query");
	RECORDSET_SBOBJ.setParameter("CfcName",CFC_LIST.getValue() + "." + CFC_S.getValue());
	RECORDSET_SBOBJ.setParameter("CfcMethod",CFC_FUNCTION.getValue());

	var extraArgKeys = new Array();
	var extraArgValues = new Array();
	for (var i=0; i<origAttrs.length; i++) {
		var tmp = origAttrs[i].varName;
		if ((tmp.match(/^[a-z_]/i)) && (origAttrs[i].varType != VAR_TYPE_ENTERED_VALUE)) {
			tmp = "#" + tmp + "#";
		}
		extraArgKeys[i]   = origAttrs[i].name;
		extraArgValues[i] = tmp;
	}
	RECORDSET_SBOBJ.setParameter("extraArgKeys", extraArgKeys);
	RECORDSET_SBOBJ.setParameter("extraArgValues", extraArgValues);
	RECORDSET_SBOBJ.setParameter("Bogous", 1);
}



// called when Test button is pressed
// shows the SQL result
function PopUpTestDialog(){
	MMDB.showResultset(CFC_LIST.getValue(),"TODO: ?!");
}



function canDisplayRecordset(sbRecordset) {
	return true;
}



function checkAdvRS(version) {
	if ((!MM.AdvRs_Version) || (MM.AdvRs_Version < version)) {
		return false;
	}
	return true;
}



function PopulateCFCList(refresh) {

	var theDOM = getcfctreeDOM(refresh);
	var list = new Array();
	var roots = new Array();
	packages = new Object();
	var sitePrefix = getSitePrefix();
	sitePrefix = sitePrefix.replace(/\.$/, '');

	if (theDOM) {
		parseCFCtree(theDOM, roots);
	}
	if (roots.length) {
		for (var r=0; r<roots.length; r++) {
			var aRoot = roots[r];
			if (aRoot.packages.length) {
				for (var p=0; p<aRoot.packages.length; p++) {
					var aPackage = aRoot.packages[p];
					var tmp = aPackage.name.toString();
					if(tmp.toLowerCase().indexOf(sitePrefix.toLowerCase()) == 0) {
						list.push(tmp);
						packages[tmp]=aPackage;
					}
				}
			}
		}
	}
	list.sort();

	CFC_LIST.setAll(list, list);
	return;
}



function getSitePrefix() {
	var tmp = site.getAppURLPrefixForSite();
	tmp = tmp.replace(/^\w+:\/\/[^\/]+\//, '');
	tmp = tmp.replace(/\//g, '.');
	return tmp;
}



//------------------------------------------------------------------
//FUNCTION:
//		fillAditionalParameters
//
//DESCRIPTION:
//		called by findServerBehaviors to add the aditional parameters 
//		that do not came imediatly from the group Pattern Matching
//
//ARGUMENTS:
//		sbObj - the recordset instance object
//
//RETURNS:
// 	a new recordset instance object
//------------------------------------------------------------------
function fillAditionalParameters(sbObj, type) {
	var cfcName = sbObj.getParameter("CfcName");
	var cfcFName = sbObj.getParameter("CfcMethod");
	if (cfcName) {
		var sitePrefix = getSitePrefix();
		if(cfcName.toLowerCase().indexOf(sitePrefix.toLowerCase()) == 0) {
                    cfcName = cfcName.substr(sitePrefix.length);
		}
		var cfcFileName = cfcName.replace(/\./g, '/');
		cfcFileName = dreamweaver.getSiteRoot() + cfcFileName + ".cfc";
		var cfcContent = '';

		var dom;
		if (DWfile.exists(cfcFileName)) {
			dom = dw.getDocumentDOM(cfcFileName);
		} else {
			alert(MM.MSG_CFCFileMissing);
		}
		
		var cfcDOM;
		if (dom && dom.getElementsByTagName) {
			cfcDOM = dom.getElementsByTagName('cfcomponent');
			if (cfcDOM && cfcDOM.length>0) {
				cfcDOM = cfcDOM[0];
			}
		}

		if (cfcDOM && cfcDOM.getElementsByTagName) {
			var cfcFunctions = cfcDOM.getElementsByTagName('cffunction');
			var cfcFunction;
			for (var i=0; i<cfcFunctions.length; i++) {
				if (cfcFunctions[i].getAttribute('name').toLowerCase() == cfcFName.toLowerCase()) {
					cfcFunction = cfcFunctions[i];
					break;
				}
			}
			if (cfcFunction) {

				var cfcResult = cfcFunction.getElementsByTagName('cfreturn');
				if (cfcResult && cfcResult.length>0) {
					cfcResult = cfcResult[cfcResult.length-1].outerHTML;
					cfcResult = cfcResult.match(/<cfreturn\s*(.*?)\s*>/i)[1];
				} else {
					cfcResult = '';
				}
				var cfcQueries = cfcFunction.getElementsByTagName('cfquery');
				var cfcQuery;
				if (cfcQueries.length>0) {
					cfcQuery = cfcQueries[cfcQueries.length-1];
				}
				for (var i=0; i<cfcQueries.length; i++) {
					if (cfcQueries[i].getAttribute('name').toLowerCase() == cfcResult.toLowerCase()) {
						cfcQuery = cfcQueries[i];
						break;
					}
				}
				if(cfcQuery) {
				cfcContent = cfcQuery.outerHTML;
				} else {
					cfcContent = '';
				}
			}

			var ds = cfcContent.match(/datasource="([^"]*)"/i);
			if (ds) {
				sbObj.setConnectionName(ds[1]);
			} else {
				sbObj.setConnectionName('Unknown');
			}
			ds = cfcContent.match(/<cfquery[^>]*>([\w\W]*?)<\/cfquery>/i);
			if (ds) {
				var attrs = new Array();
				if (origAttrs) {
					for (var i=0;i<origAttrs.length;i++) {
						// if Entered Value default value is null
						if(origAttrs[i].varDefault != null) {
							var tattrs = new Object();
							tattrs.varDefault = origAttrs[i].varDefault.toString().replace(/#/g, '');
							if (type != 'test') {
								tattrs.varName = origAttrs[i].varName.replace(/#/g, '');
							} else {
								tattrs.varName = "Arguments." + origAttrs[i].name;
							}

							attrs.push(tattrs);
						}
					}
				}
				sbObj.setDatabaseCall(ds[1],attrs);
			} else {
				sbObj.setDatabaseCall('Unknown',attrs);
			}
		}
	}
	return sbObj;
}



function refreshCFCS() {
	MM.setBusyCursor(); 
	PopulateCFCList(true);
	MM.clearBusyCursor(); 
	var torigAttrs = origAttrs;
	updateUI('CFCPackage');
	origAttrs = torigAttrs;
	updateUI('CFCParameters');
}



function newComponent() {
	dwscripts.callCommand("CreateNewCFCRecordset.htm", null);
	if (MM.CFCNeedRefresh) {
		refreshCFCS();
		var newCFC = getSitePrefix().substr(0, getSitePrefix().length-1)
		if (MM.CFCSitePath) {
			newCFC += '.' + MM.CFCSitePath;
		}
		for (var i=0; i<CFC_LIST.getLen(); i++) {
			if (CFC_LIST.getValue(i).toLowerCase() == newCFC.toLowerCase()) {
				CFC_LIST.setIndex(i);	
			}
		}
		updateUI('CFCPackage');
		CFC_S.pickValue(MM.CFCNewName);
		updateUI('CFCs');
	}
}

function newFunctionForCFQuery() 
{
	var localCFC = new String(site.getLocalPathToFiles());
	//ensure trailing slash
	if( localCFC.charAt(localCFC.length-1) != '\\' && localCFC.charAt(localCFC.length-1) != '/' ) {
		localCFC += '/';
	}
	
	var sitePrefix = getSitePrefix().replace(/\.$/, "");
	var relativeCfcPath = CFC_LIST.getValue();
	//remove the site prefix from the relative path, that the path on the server we connect to
	var re = new RegExp( "^" + sitePrefix + "\.?");
	relativeCfcPath = relativeCfcPath.replace( re, "" );
	
	if( relativeCfcPath.length > 0 ) {
		localCFC = localCFC + relativeCfcPath.replace(/\./g, '/') + '/';
	}
	localCFC = localCFC + CFC_S.getValue() + ".cfc";
	alert( localCFC );
	var localUrl = MMNotes.filePathToLocalURL(localCFC);
	alert( localUrl );

	if( site.canCheckOut(localUrl) )	{
		alert(site.getCheckOutUserForFile(localUrl));
		alert(site.getCheckOutUser());
}
	
	var dom = dreamweaver.getDocumentDOM(localUrl);
	if( !dom ) {
		alert( "Could not get DOM for " + localUrl );
		return;
	}

	insertNewCFCRecordset(dom, localUrl, CFC_LIST.getValue(), CFC_S.getValue());
	
	if (MM.CFCNeedRefresh) {
		refreshCFCS();
		var newCFC = sitePrefix;
		if (MM.CFCSitePath) {
			newCFC += '.' + MM.CFCSitePath;
		}
		for (var i=0; i<CFC_LIST.getLen(); i++) {
			if (CFC_LIST.getValue(i).toLowerCase() == newCFC.toLowerCase()) {
				CFC_LIST.setIndex(i);	
			}
		}
		updateUI('CFCPackage');
		CFC_S.pickValue(MM.CFCNewName);
		updateUI('CFCs');
	}
}
