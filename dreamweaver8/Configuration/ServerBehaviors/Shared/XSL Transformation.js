// Copyright 2005 Macromedia, Inc. All rights reserved.

var _xslFile = new URLTextField("XSL Transformation.htm", "xslFile", "");
var _xmlFile = new URLTextField("XSL Transformation.htm", "xmlFile", "");

// The controls and buttons on the page 
var _ParamList = new ListControl("ParamList");
var _PlusBtn = null;
var _MinusBtn = null;
var _xmlBrowseBtn = null;
var _xslBrowseBtn = null;
var _ParamName = null;
var _ParamDefault = null;
var _ParamEditBtn = null;

// Arrays for the parameter properties
var paramValues = new Array();
var paramNames = new Array();
var paramDefaults = new Array();
var paramShortVal = new Array();
var paramID = new Array();
var paramNo = 0;

var VARPROP_WIDTH_PX = 190;

var HELP_DOC = MM.HELP_ConfigureXSLTransform;


var LABEL_XMLFILTER = "XML (*.xml)|*.xml|XML|";
var LABEL_XSLTFILTER = "XSL (*.xsl)|*.xsl|XSL|";


// Array filled with the IDs of the Server Side Errors
var ssErrors = new Array();
ssErrors["ColdFusion"] = new Array("MM_GEN_ERROR", "MM_XML_EMPTY_ERROR", "MM_XSL_EMPTY_ERROR", "MM_OPEN_REMOTE_ERROR", "MM_OPEN_FILE_ERROR", "MM_INVALID_XML_ERROR", "MM_INVALID_XSL_ERROR","MM_TRANSFORMATION_ERROR");

ssErrors["PHP_MySQL"] = new Array("MM_GEN_ERROR", "MM_NO_PROCESSOR_ERROR", "MM_XML_EMPTY_ERROR", "MM_XSL_EMPTY_ERROR", "MM_OPEN_REMOTE_ERROR", "MM_HTTPS_OPEN_ERROR", "MM_HTTPS_NOT_SUPPORTED_ERROR",
								 "MM_OPEN_FILE_ERROR", "MM_FILE_NOT_READABLE_ERROR", "MM_INVALID_XML_ERROR", "MM_CHECK_VALID_SAB_ERROR", "MM_CHECK_VALID_D4_TAG_ERROR", "MM_CHECK_VALID_D4_ERROR",
								  "MM_CHECK_VALID_D5_ERROR", "MM_TRANSFORMATION_ERROR", "MM_TRANSFORM_SAB_ERROR", "MM_TRANSFORM_D4_ERROR", "MM_TRANSFORM_D5_ERROR");

ssErrors["ASP-VB"] = new Array("MM_GENERIC_MESSAGE", "MM_EMPTY_XML_SOURCE", "MM_EMPTY_XSL_SOURCE", "MM_MISSING_OBJECT", "MM_INVALID_PATH", "MM_XML_LOADING_ERROR", "MM_XSL_LOADING_ERROR", "MM_INVALID_XML_ERROR", "MM_INVALID_XSL_ERROR", "MM_LOADING_FAILED_DETAILS", "MM_XSL_ERROR", "MM_TRANSFORM_ERROR", "MM_OPEN_FILE_ERROR");

ssErrors["ASP-JS"] = new Array("MM_GENERIC_MESSAGE", "MM_EMPTY_XML_SOURCE", "MM_EMPTY_XSL_SOURCE", "MM_MISSING_OBJECT", "MM_INVALID_PATH", "MM_XML_LOADING_ERROR", "MM_XSL_LOADING_ERROR", "MM_INVALID_XML_ERROR", "MM_INVALID_XSL_ERROR", "MM_LOADING_FAILED_DETAILS", "MM_XSL_ERROR", "MM_TRANSFORM_ERROR", "MM_OPEN_FILE_ERROR");

ssErrors["ASP.NET_VB"] = new Array("MM_GENERIC_MESSAGE", "MM_EMPTY_XML_SOURCE", "MM_EMPTY_XSL_SOURCE", "MM_INVALID_XML_ERROR", "MM_INVALID_XSL_ERROR", "MM_TRANSFORM_ERROR");

ssErrors["ASP.NET_CSharp"] = new Array("MM_GENERIC_MESSAGE", "MM_EMPTY_XML_SOURCE", "MM_EMPTY_XSL_SOURCE", "MM_INVALID_XML_ERROR", "MM_INVALID_XSL_ERROR", "MM_TRANSFORM_ERROR");

//--------------------------------------------------------------------
// FUNCTION:
//   initializeUI
//
// DESCRIPTION:
//   Prepare the dialog and controls for user input
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function initializeUI()
{
  var elts;

// Initialize the controls and find the DOM Objects
  _xslFile.initializeUI();
  _xmlFile.initializeUI();

	_PlusBtn = dwscripts.findDOMObject("plusButton"); 
  _MinusBtn = dwscripts.findDOMObject("minusButton"); 
  _ParamName = dwscripts.findDOMObject("ParamName"); 
  _ParamDefault = dwscripts.findDOMObject("ParamDefault"); 
  _ParamEditBtn = dwscripts.findDOMObject("EditCFParam"); 
  _ParamEditBtn.setAttribute("value", dw.loadString("XMLXSL_SB/EditBtn"));
  _xmlBrowseBtn = dwscripts.findDOMObject("xmlBrowse"); 
  _xmlBrowseBtn.setAttribute("value", dw.loadString("XMLXSL_SB/BrowseBtn"));
  _xslBrowseBtn = dwscripts.findDOMObject("xslBrowse"); 
  _xslBrowseBtn.setAttribute("value", dw.loadString("XMLXSL_SB/BrowseBtn"));

  // set the readonly param properties
  _ParamName.innerHTML = dwscripts.entityNameEncode(MM.LABEL_ParamAttributesValue);
  _ParamDefault.innerHTML = dwscripts.entityNameEncode(MM.LABEL_ParamAttributesDefault);

  elts = document.forms[0].elements;
  if (elts && elts.length)
    elts[0].focus();
}


//--------------------------------------------------------------------
// FUNCTION:
//   findServerBehaviors
//
// DESCRIPTION:
//   Returns an array of ServerBehavior objects, each one representing
//   an instance of this Server Behavior on the page
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   JavaScript Array of ServerBehavior objects
//--------------------------------------------------------------------
function findServerBehaviors()
{
  _xslFile.findServerBehaviors();
  _xmlFile.findServerBehaviors();

  sbArray = dwscripts.findSBs();

  return sbArray;
}


//--------------------------------------------------------------------
// FUNCTION:
//   canApplyServerBehavior
//
// DESCRIPTION:
//   Returns true if a Server Behavior can be applied to the current
//   document
//
// ARGUMENTS:
//   sbObj - ServerBehavior object - one of the objects returned
//           from findServerBehaviors
//
// RETURNS:
//   boolean - true if the behavior can be applied, false otherwise
//--------------------------------------------------------------------
function canApplyServerBehavior(sbObj)
{
  var success = true;
	var aDoc = dw.getDocumentDOM();
	var docURL = aDoc.URL;
	if(docURL.length == 0) {
		alert(dw.loadString("XMLXSL_SBError/SaveFile"));
		success = false;
	}
  if (success)
  {
    success = _xslFile.canApplyServerBehavior(sbObj);
  }
  if (success)
  {
    success = _xmlFile.canApplyServerBehavior(sbObj);
  }
  if (success)
  {
    success = dwscripts.canApplySB(sbObj, false); // preventNesting is false
  }
  return success;
}


//--------------------------------------------------------------------
// FUNCTION:
//   applyServerBehavior
//
// DESCRIPTION:
//   Collects values from the form elements in the dialog box and
//   adds the Server Behavior to the user's document
//
// ARGUMENTS:
//   sbObj - ServerBehavior object - one of the objects returned
//           from findServerBehaviors
//
// RETURNS:
//   string - empty upon success, or an error message
//--------------------------------------------------------------------
function applyServerBehavior(sbObj)
{
  var paramObj = new Object();
  var errStr = "";
  var serverModel = dw.getDocumentDOM().documentType;
  var paramDef = new Array();
  var theSel = dw.getDocumentDOM().getSelection();
  
  // Check that the xml and xsl file fields are not empty
  if (!errStr)
  {
    errStr = _xslFile.applyServerBehavior(sbObj, paramObj, dw.loadString("XMLXSL_SBError/XSLEmpty"));
  }
  // Check that the xml and xsl file fields contain valid values
  if (!errStr) 
	{
  	if (!_xslFile.getValue().match(/^\w+:\/\//i)) 
		{
			var bIsXSLTFile = ((_xslFile.getValue().match(/\.xsl$/i) != null) || (_xslFile.getValue().match(/\.xslt$/i) != null))
			//if file extension not ending in xslt
			if (!bIsXSLTFile) 
			{
				errStr = dw.loadString("XMLXSL_SBError/NO_XSLFile");
			}
  	} 
		else 
		{
			errStr = dw.loadString("XMLXSL_SBError/XSLLocal");
		}
  }
  
  // Check that the xml and xsl file fields are not empty
  if (!errStr)
  {
    errStr = _xmlFile.applyServerBehavior(sbObj, paramObj, dw.loadString("XMLXSL_SBError/XMLEmpty"));
  }
  // Check that the xml and xsl file fields contain valid values
  if (!errStr) {
  	if (!_xmlFile.getValue().match(/^\w+:\/\//i)) {
  			paramObj.mapURL = "true";
			//we won't to support other file extension too.
			/*if (!_xmlFile.getValue().match(/\.xml$/i)) {
				errStr = dw.loadString("XMLXSL_SBError/NO_XMLFile");
			}*/
  	} else {
 		paramObj.mapURL = "";
	  	if (!_xmlFile.getValue().match(/^http(?:s?):\/\//i)) {
				errStr = dw.loadString("XMLXSL_SBError/Wrong_Prot");
			}
		}
  }

	//check for xslt entire page check if existing doc don't have 
	//already existing html , body
	if (!errStr)
	{
			var htmlNodeRegExp = /<\s*html/ig;
			var headNodeRegExp = /<\s*head/ig;
			var bodyNodeRegExp = /<\s*body/ig;

		  var xslFilePath = _xslFile.getValue();
			if (xslFilePath.charAt(0) == '/')
			{
				 //check for site relative path and map them to absolute path
				xslFilePath = site.siteRelativeToLocalPath(xslFilePath);										
			}
			else
			{
				//doc relative to absolute
				var currDocURL = dw.getDocumentDOM().URL;
				var siteRootURL	= dreamweaver.getSiteRoot();
				xslFilePath = dreamweaver.relativeToAbsoluteURL( currDocURL, siteRootURL, xslFilePath);
			}

			if ((xslFilePath != null) && (xslFilePath.length))
			{
				 var bIsXSLTEntire = false;
				 if (DWfile.exists(xslFilePath))
				 {
					 xslFileContents = DWfile.read(xslFilePath);
					 if ((xslFileContents != null) && (xslFileContents.length))
					 {
						 if ((xslFileContents.match(htmlNodeRegExp) != null) ||
								 (xslFileContents.match(headNodeRegExp) != null) ||
								 (xslFileContents.match(bodyNodeRegExp) != null))	 	
						 {
								 bIsXSLTEntire = true;
						 }
					 }

					 if (bIsXSLTEntire)
					 {
							//check if existing document also has html , head , body						 
						 var curDocContents = "";
						 if (dw.getDocumentDOM().documentElement)
						 {
							  curDocContents = dw.getDocumentDOM().documentElement.outerHTML;
						 }
						 if ((curDocContents != null) && (curDocContents.length))
						 {
							 if ((curDocContents.match(htmlNodeRegExp) != null) ||
									 (curDocContents.match(headNodeRegExp) != null) ||
									 (curDocContents.match(bodyNodeRegExp) != null))	 	
							 {
									//have a set of html , head , body
									errStr = dw.loadString("XMLXSL_SBError/XSLT_Entire_Html_Existing");
							 }
						 }
					 }
				}
			}
	}	

  // Generate necessary relative paths  
  if (!errStr)
  {
		var siteURL = site.getAppURLPrefixForSite();
		var pathToSite = siteURL.replace(/[^:]*:\/\/[^\/]*\//, '');
		pathToSite = pathToSite.replace(/\/*$/, '');  // */
		var sitePath = pathToSite.replace(/\//g, '.');
		if (sitePath != '') {
			sitePath = sitePath + ".";
		}
		paramObj.sitePath = sitePath;
		if (!sbObj) {
			paramObj.transName = makeNewName("XSL Transformation.htm", "transName", "mm_xsl", "transName", false);
		} else {
			paramObj.transName = sbObj.getParameter("transName");
		}
		var aDoc = dw.getDocumentDOM();
		if (aDoc != null)
		{
		  //make it doc relative always
			paramObj.relPath = getConnectionsPath("","file");			
		}
  }
  if (!errStr)
  {
		paramNo = 0;
		// Process the parameter properties
		for (var i=0;i<paramValues.length;i++) {
			// Process the parameter properties if the server model is an ASP one
			if (serverModel == "ASP-VB" || serverModel == "ASP-JS" || serverModel == "ASP.NET_VB" || serverModel == "ASP.NET_CSharp") {
				// Check if the parameter has a dynamic value and set the appropriate 
				// array values for generating the dynamic parameter code
				if (paramValues[i].match(/^\s*\<\%[\=\#]\s*\(?.*\)?\s*\%\>\s*$/)) {
					paramShortVal[paramNo] = paramValues[i];
					paramShortVal[paramNo] = getASPDynVal(paramShortVal[paramNo], serverModel);
					if (paramID[paramNo]==undefined) {
						paramID[paramNo] = paramObj.transName + "_param" + (paramNo+1);
					}
					paramValues[i] = paramID[paramNo]; 
					paramDef[paramNo] = paramDefaults[i];
					paramNo++;
				} else {
					paramValues[i] = '"' + paramValues[i] + '"';
				}
			}
			// Process the parameter properties if the server model is an PHP one			
			if (serverModel == "PHP_MySQL" || serverModel == "PHP_ADODB") {
				// Check if the parameter has a dynamic value and set the appropriate 
				// array values for generating the dynamic parameter code
				if (paramValues[i].match(/^\s*\<\?php\s+echo\s*.*;\s*\?\>\s*$/)) {
					paramShortVal[paramNo] = paramValues[i];
					paramShortVal[paramNo] = paramShortVal[paramNo].replace(/^\s*\<\?php\s+echo\s*[\=]*/, '');
					paramShortVal[paramNo] = paramShortVal[paramNo].replace(/;\s*\?\>\s*$/, '');
					if (paramID[paramNo]==undefined) {
						paramID[paramNo] = paramObj.transName + "_param" + (paramNo+1);
					}
					paramValues[i] = "$" + paramID[paramNo]; 
					paramDef[paramNo] = paramDefaults[i];					
					paramNo++;
				} else {
					paramValues[i] = '"' + paramValues[i] + '"';
				}
			}
			// Process the parameter properties if the server model is ColdFusion
			if (serverModel == "ColdFusion") {		
				// Check if the parameter has a dynamic value
				if (paramValues[i].match(/^\s*#.*#\s*$/)) {
					var dom = dw.getDocumentDOM();
					// Find all the cfparam tags in the document
					var paramTags = dom.getElementsByTagName("cfparam");
					var sw = false;
					paramValueName = paramValues[i];
					// Remove the # characters
					if (paramValueName.match(/^#.*#$/)) {
						paramValueName = paramValueName.replace(/^\s*#/, '');
						paramValueName = paramValueName.replace(/#\s*$/, '');
					}
					var j;
					// If the parameter exists on the page, set it's value
					for (j=0;j<paramTags.length;j++) {
						if (paramTags[j].getAttribute("name") == paramValueName) {
							sw = true;
							break;
						}
					}
					if (sw) {
						paramTags[j].setAttribute("default", paramDefaults[i]);
					} else {
					// If the parameter does not exist on the page, create it
						var paramObj2 = new Object();
						paramObj2.ParamName = paramValueName;
						paramObj2.Default = paramDefaults[i];
						paramObj2.ParamType = "";
						if (dw.getDocumentDOM().documentType == "CFC") {
							paramObj2["MM_location"] = "beforeSelection";
						}
						extPart.queueDocEdits("","CFParam_main", paramObj2, null);
					}
				}
			}
		}
		// Remove deleted parameters (on edit)
		if (paramDef.length < paramID.length) {
			var start = paramDef.length;
			var end = paramID.length;
			for (var i=end-1;i>=start;i--) {
				paramID.pop();
				paramShortVal.pop();
			}
		}
		// Add the arrays to the parameters object
		paramObj.paramNames = paramNames;
		paramObj.paramValues = paramValues;
		paramObj.paramShortVal = paramShortVal;
		paramObj.paramDefault = paramDef;
		paramObj.paramID = paramID;
	}
  if (!errStr)
  {
  	// Update include files
	updateIncludes();
	// Apply the Server Behavior
	dw.getDocumentDOM().setSelection(theSel[0], theSel[1]);
    dwscripts.fixUpSelection(dw.getDocumentDOM(), true, true);
    dwscripts.applySB(paramObj, sbObj);
  }
  return errStr;
}


//--------------------------------------------------------------------
// FUNCTION:
//   inspectServerBehavior
//
// DESCRIPTION:
//   Sets the values of the form elements in the dialog box based
//   on the given ServerBehavior object
//
// ARGUMENTS:
//   sbObj - ServerBehavior object - one of the objects returned
//           from findServerBehaviors
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function inspectServerBehavior(sbObj)
{
	var serverModel = dw.getDocumentDOM().documentType;
	// Get the parameters from the SB object and initialize arrays
	_xslFile.inspectServerBehavior(sbObj);
	_xmlFile.inspectServerBehavior(sbObj);
	paramNames = new Array().concat(sbObj.getParameter("paramNames"));
	paramValues = new Array().concat(sbObj.getParameter("paramValues"));
	paramShortVal = new Array().concat(sbObj.getParameter("paramShortVal"));
	paramID = new Array().concat(sbObj.getParameter("paramID"));
	var paramDef = new	Array().concat(sbObj.getParameter("paramDefault"));
	paramDefaults = new Array();
	if (!paramValues) {
		paramValues = new Array();
		paramNames = new Array();
	} else {
		if (paramNames[0] == null) {
			paramNames = new Array();
			paramValues = new Array();
		}
		// Process the parameter properties arrays if the server model is an ASP one
		if (serverModel=="ASP-VB" || serverModel=="ASP-JS"  || serverModel == "ASP.NET_VB" || serverModel == "ASP.NET_CSharp") {
			paramNo = 0;		
			for (var i=0;i<paramNames.length;i++) {
				if (buildParamValue(paramValues[i])!="") {
					paramValues[i] = buildParamValue(paramValues[i]);
					paramDefaults[i] = paramDef[paramNo];
					paramNo++;
				} else {
					paramValues[i] = paramValues[i].replace(/\"/g, "");
					paramDefaults[i] = paramValues[i];
				}
			}
		} 
		// Process the parameter properties arrays if the server model is an PHP one		
		if (serverModel=="PHP_MySQL" || serverModel=="PHP_ADODB") {
			paramNo = 0;
			for (var i=0;i<paramNames.length;i++) {
				if (paramValues[i].match(/^\$/)) {
					paramValues[i] = buildParamValue(paramValues[i]);
					paramDefaults[i] = paramDef[paramNo];
					paramNo++;
				} else {
					//bug fix for #200023 editing xslt server behavior in PHP adds extra quotes to parameter values  
					paramValues[i] = paramValues[i].replace(/\"/g, "");
					paramDefaults[i] = paramValues[i];
				}
			}
		}
		// Process the parameter properties arrays if the server model is ColdFusion
		if (serverModel=="ColdFusion") {
			var dom = dw.getDocumentDOM();
			var paramTags = dom.getElementsByTagName("cfparam");
			for (var i=0;i<paramNames.length;i++) {
				paramValueName = paramValues[i];
				if (paramValueName.match(/^#.*#$/)) {
					paramValueName = paramValueName.replace(/^#/, '');
					paramValueName = paramValueName.replace(/#$/, '');
				}
				var j, sw = false;
				for (j=0;j<paramTags.length;j++) {
					if (paramTags[j].getAttribute("name") == paramValueName) {
						paramDefaults[i] = paramTags[j].getAttribute("default");
						sw = true;
						break;
					}
				}
				if (sw == false) {
					if (paramValues[i].match(/\w\.\w/)) {
						paramDefaults[i] = '';
					} else {
						paramDefaults[i] = paramValues[i];
					}
				}
			}
		}
		// Fills the parameters list in the interface
		_ParamList.setAll(paramNames, paramNames);
		updateUI("ParamList");
	}
}


//--------------------------------------------------------------------
// FUNCTION:
//   deleteServerBehavior
//
// DESCRIPTION:
//   Remove the specified Server Behavior from the user's document
//
// ARGUMENTS:
//   sbObj - ServerBehavior object - one of the objects returned
//           from findServerBehaviors
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function deleteServerBehavior(sbObj)
{
  _xslFile.deleteServerBehavior(sbObj);
  _xmlFile.deleteServerBehavior(sbObj);

  dwscripts.deleteSB(sbObj);
}


//--------------------------------------------------------------------
// FUNCTION:
//   analyzeServerBehavior
//
// DESCRIPTION:
//   Performs extra checks needed to determine if the Server Behavior
//   is complete
//
// ARGUMENTS:
//   sbObj - ServerBehavior object - one of the objects returned
//           from findServerBehaviors
//   allRecs - JavaScripts Array of ServerBehavior objects - all of the
//             ServerBehavior objects known to Dreamweaver
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function analyzeServerBehavior(sbObj, allRecs)
{
  _xslFile.analyzeServerBehavior(sbObj, allRecs);
  _xmlFile.analyzeServerBehavior(sbObj, allRecs);
}


//--------------------------------------------------------------------
// FUNCTION:
//   updateUI
//
// DESCRIPTION:
//   Called from controls to update the dialog based on user input
//
// ARGUMENTS:
//   controlName - string - the name of the control which called us
//   event - string - the name of the event which triggered this call
//           or null
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function updateUI(controlName, event)
{
  if (window["_" + controlName] != null)
  {
    var controlObj = window["_" + controlName];

    if (_xslFile.updateUI != null)
    {
      _xslFile.updateUI(controlObj, event);
    }
    if (_xmlFile.updateUI != null)
    {
      _xmlFile.updateUI(controlObj, event);
    }
  }
  if (controlName == "plusButton")
  {
  	// Call the AddXSLTParam command and adds the parameter in the list
    var cmdArgs = new Array();
    cmdArgs[0] = "";
    cmdArgs[1] = "";
    cmdArgs[2] = "";
		cmdArgs[3] = getSelectedXSLTFilePath();
    var addParamResult = dwscripts.callCommand("AddXSLTParam",cmdArgs);    
    if (addParamResult && addParamResult.length && addParamResult[0])
    {
		paramNames[paramNames.length] = addParamResult[0];
		paramValues[paramValues.length] = addParamResult[1];
		paramDefaults[paramDefaults.length] = addParamResult[2];
		_ParamList.setAll(paramNames, paramNames);
      	updateCFParamProperties(); 
      	setParamEditButtonState(); 
	}
  }
  else if (controlName == "minusButton")
  {
    // Remove the selected parameter from the list
    var selParamName = _ParamList.get();
	for (var i=0;i<paramNames.length;i++) {
		if (paramNames[i] == selParamName) {
			paramNames.splice(i, 1);
			paramValues.splice(i, 1);
			paramDefaults.splice(i, 1);
			break;
		}
	}
	_ParamList.setAll(paramNames, paramNames);
    updateCFParamProperties(); 
    setParamEditButtonState(); 
  }
  else if (controlName == "editCFParam")
  {
	// Call the EditXSLTParam command and puts the new values in the list  
    var cmdArgs = new Array();
    cmdArgs[0] = _ParamList.get();
    cmdArgs[1] = getParamValue(cmdArgs[0]);
    cmdArgs[2] = getParamDefault(cmdArgs[0]);
		cmdArgs[3] = getSelectedXSLTFilePath();
    var editParamResult = dwscripts.callCommand("EditXSLTParam", cmdArgs);            
    if (editParamResult && editParamResult.length)
    {
		var selParamName = _ParamList.get();
		for (var i=0;i<paramNames.length;i++) {
			if (paramNames[i] == selParamName) {
				paramNames[i] = editParamResult[0];
				paramValues[i] = editParamResult[1];
				paramDefaults[i] = editParamResult[2];
				break;
			}
		}
		_ParamList.setAll(paramNames, paramNames);
		updateCFParamProperties(); 
		setParamEditButtonState(); 
    }
  }
  else if (controlName == "ParamList")
  {
	// Change the read only values in the interface when the 
	// selected parameters change
    setParamEditButtonState(); 
    updateCFParamProperties();
  }
}

//--------------------------------------------------------------------
// FUNCTION:
//   getParamValue
//
// DESCRIPTION:
//   Gets the runtime value of a parameter
//
// ARGUMENTS:
//   selParamName - the name of a parameter
//
// RETURNS:
//   the runtime value of the parameter or "" if the parameter does not exist
//--------------------------------------------------------------------
function getParamValue(selParamName) {
	for (var i=0;i<paramNames.length;i++) {
		if (paramNames[i] == selParamName) {
			return paramValues[i];
		}
	}
	return "";
}

//--------------------------------------------------------------------
// FUNCTION:
//   getParamDefault
//
// DESCRIPTION:
//    Gets the default value of a parameter
//
// ARGUMENTS:
//   selParamName - the name of a parameter
//
// RETURNS:
//   the default value of the parameter or "" if the parameter does not exist
//--------------------------------------------------------------------
function getParamDefault(selParamName) {
	for (var i=0;i<paramNames.length;i++) {
		if (paramNames[i] == selParamName) {
			return paramDefaults[i];
		}
	}
	return "";
}

//--------------------------------------------------------------------
// FUNCTION:
//   updateCFParamProperties
//
// DESCRIPTION:
//   Updates the name and default read only display values if there 
//   is a parameter selected in the list control 
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function updateCFParamProperties()
{
	var selParamName = (_ParamList.get()) ? _ParamList.get() : "";
  var selParamValue = getParamValue(selParamName);
  var selParamDefault = getParamDefault(selParamName); 

  var shortParamName = dw.shortenString(MM.LABEL_ParamAttributesValue + selParamValue, VARPROP_WIDTH_PX, false);
  _ParamName.innerHTML = dwscripts.entityNameEncode(shortParamName);
  var shortParamDefault = dw.shortenString(MM.LABEL_ParamAttributesDefault + selParamDefault, VARPROP_WIDTH_PX, false);
  _ParamDefault.innerHTML = dwscripts.entityNameEncode(shortParamDefault);
}

//--------------------------------------------------------------------
// FUNCTION:
//   setParamEditButtonState
//
// DESCRIPTION:
//   Sets the param edit button to be enabled or disabled depending
//   on whether there is a selected parameter
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function setParamEditButtonState()
{
  if (_ParamList.get()){
    _ParamEditBtn.removeAttribute("disabled");   
  }
  else 
  {
    _ParamEditBtn.setAttribute("disabled","disabled"); 
  }
}

//--------------------------------------------------------------------
// FUNCTION:
//   updateIncludes
//
// DESCRIPTION:
//   Checks the version of the include files on the server and updates 
//	them if necessary
//
// ARGUMENTS:
//	 none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function updateIncludes() {
	// Set the extension of the include file depending on the server model
	var serverModel = dw.getDocumentDOM().documentType;
	var ext;
	switch (serverModel) {
		case "ColdFusion": ext = ".cfc"; break;
		case "PHP_MySQL": ext = ".class.php"; break;
		case "PHP_ADODB": ext = ".class.php"; break;
		case "ASP-VB": ext = ".classVB.asp"; break;
		case "ASP-JS": ext = ".classJS.asp"; break;
		case "ASP.NET_VB": ext = ".vb"; break;
		case "ASP.NET_CSharp": ext = ".cs"; break;
	}	
	// Set paths to the site include file depending on the server model
	var	sitePath = dw.getSiteRoot() + "includes/MM_XSLTransform/MM_XSLTransform" + ext;
	// Set paths to the configuration include file depending on the server model
	var configPath = dw.getConfigurationPath() + "/Shared/XSLTransform/" + serverModel + "/MM_XSLTransform" + ext;
	// Regexp used to determine the version of the file
	var regex = /MM_XSLTransform\s+version:\s+((?:[0-9]|\.)*)\s+/i;
	
	// Get the versions of the site and configuration include files
	var siteVerRes;
	if (DWfile.exists(sitePath)) {
		siteVerRes = DWfile.read(sitePath).match(regex);
	}
	var configVerRes = DWfile.read(configPath).match(regex);
	
	var siteVer = (siteVerRes!=null) ? siteVerRes[1] : "0.0";
	var configVer = (configVerRes!=null) ? configVerRes[1] : "0.0";

	// Compare the versions of the two files
	if (compareVersions(siteVer, configVer)==-1) {
	// If the configuration file is newer, update the include file

		// Create an object containing the names and values of the server-side errors
		paramObj = new Object();
		paramObj.names = new Array();
		paramObj.values = new Array();
		for (var i=0;i<ssErrors[serverModel].length;i++) {
			paramObj.names.push(ssErrors[serverModel][i]);
			paramObj.values.push(dw.loadString("XMLXSL_SSError/" + serverModel + "/" + ssErrors[serverModel][i]));
		}
		// Use an edml participant to generate a code block containing all the 
		// server-side error definitions
		var errorsText = extPart.getInsertString("", "MM_XMLXSL_SSErrors", paramObj);
		// Read the contents of the configuration file and insert the generated code block
		var fileText = DWfile.read(configPath).replace(/@@errorMessageList@@/, errorsText);
		// Create folders if necessary
		if (!DWfile.exists("/includes")){
	    	dwscripts.createFolder("/includes")
	    }
		if (!DWfile.exists("/includes/MM_XSLTransform")) {
		    	dwscripts.createFolder("/includes/MM_XSLTransform")
	    }
	    // Write the contents to the site file
		DWfile.write(sitePath, fileText);
		//	Put the new files
		/*if (site.canPut(sitePath)) {
				site.put(sitePath);
		}*/
	}
}

//--------------------------------------------------------------------
// FUNCTION:
//   compareVersions
//
// DESCRIPTION:
//   Compares two version numbers.
//
// ARGUMENTS:
//	 ver1 - the first version number
//   ver2 - the second version number
//
// RETURNS:
//   integer - -1 -> ver1 < ver2
//				0 -> ver1 = ver2
//				1 -> ver1 > ver2
//--------------------------------------------------------------------
function compareVersions(ver1, ver2) {
	var arr1 = ver1.split('.');
	var arr2 = ver2.split('.');
	var cmp = 0;
	var ix = 0;
	while(cmp == 0 && (arr1.length > ix || arr2.length > ix)) {
		if((arr1.length <=ix && arr2.length > ix) || arr1[ix] < arr2[ix]) {
			cmp = -1;
		} else if ((arr2.length <= ix && arr1.length > ix) || arr1[ix] > arr2[ix]) {
			cmp = 1;
		}
		ix++;
	}
	return cmp;
}

//--------------------------------------------------------------------
// FUNCTION:
//   makeNewName
//
// DESCRIPTION:
//   Make a new unique name for the SB instance.
//
// ARGUMENTS:
//	 behaviorName - the name of the behavior 
//   paramName - the name of the parameter that will be searched
//	 prefix - prefix of new names (new names will be obtainde by adding a unique number to this prefix)
//	 commonParam - common Parameter for multiple SB type (they usualy have a unique SB Constructor)
//   doNotAddNumber (boolean) - (optional) if true, no number will be added to our prefix if it is a valid name (is unique per page)
//
// RETURNS:
//   string - new unoque name
//--------------------------------------------------------------------
function makeNewName(behaviorName, paramName, prefix, doNotAddNumber) {
	var sbList = dwscripts.getServerBehaviorsByFileName(behaviorName);
	var name = prefix;
	var uniqueNum = false;
	var count = (doNotAddNumber) ? 0 : 1;
	var sbIndex;
	
	
	while (!uniqueNum)  {
		if (count != 0) {
			name = prefix + count;
		}
		uniqueNum = true;
		for (sbIndex = 0;sbIndex < sbList.length;sbIndex++) {
			if (name == sbList[sbIndex].getParameter(paramName)) {
				uniqueNum = false;
				break;
			}
		}
		count++;
	}
	
	if ((uniqueNum) && (count == 1) && (doNotAddNumber)) {
		name = prefix;
	}

	return name;
}

//--------------------------------------------------------------------
// FUNCTION:
//   getASPDynVal
//
// DESCRIPTION:
//   Builds the short form of an ASP parameter depending on the server model
//
// ARGUMENTS:
//	 val - the long value of the variable
//	 sm - the server Model
//
// RETURNS:
//   string - the short form
//--------------------------------------------------------------------
function getASPDynVal(val, sm) {
	val = val.replace(/^\s*\<\%[\=\#]\s*/, '');
	val = val.replace(/\s*\%\>\s*$/, '');		
	if (sm=="ASP.NET_CSharp" && val.indexOf("FieldValue")!=-1) {
		val = val.replace(/Container/i, 'null');
	}
	if (sm=="ASP.NET_VB" && val.indexOf("FieldValue")!=-1) {
		val = val.replace(/Container/i, 'nothing');
	}
	return val;
}

//--------------------------------------------------------------------
// FUNCTION:
//   buildParamValue
//
// DESCRIPTION:
//   Builds the complete form of a parameter depending on the server model
//
// ARGUMENTS:
//	 varName - the name of the variable
//
// RETURNS:
//   string - the complete form
//--------------------------------------------------------------------
function buildParamValue(varName) {
	var serverModel = dw.getDocumentDOM().documentType;
	var start = "";
	var end = "";
	var nullVal = "";
	switch (serverModel) {
		case "ASP-VB": start = "<%"; end = "%>"; break;
		case "ASP-JS": start = "<%"; end = "%>"; break;
		case "ASP.NET_VB": start = "<%"; end = "%>"; nullVal = "nothing"; break;
		case "ASP.NET_CSharp": start = "<%"; end = "%>"; nullVal = "null"; break;				
		case "PHP_MySQL": start = "<?php echo "; end = "; ?>"; break;
		case "PHP_ADODB": start = "<?php echo "; end = "; ?>"; break;				
	}
	varName = varName.replace(/^\$/, "");
	for (var i=0;i<paramID.length;i++) {
		if (varName==paramID[i]) {
			if ((serverModel=="ASP.NET_VB" || serverModel=="ASP.NET_CSharp") && paramShortVal[i].indexOf("FieldValue")!=-1) {
				return start + "#" + paramShortVal[i].replace(new RegExp(nullVal, "i"), "Container") + end;
			} else {
				return start + "=" + paramShortVal[i] + end;
			}
		}
	}
	return "";
}

/*
function checkPath(textObj) {
	val = textObj.getValue();
	if (val.indexOf('/')==0) {
		val = getConnectionsPath() + val.slice(1);
	}
	textObj.setValue(val);
}
*/

//--------------------------------------------------------------------
// FUNCTION:
//   autoPopulateXML
//
// DESCRIPTION:
//   auto populate the xml from the specified xsl
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function autoPopulateXML()
{
  var xslFileURI = _xslFile.getValue();
	var xmlSourceURI = _xmlFile.getValue();
	if (xslFileURI.length)
	{
		if (xmlSourceURI.length == 0)
		{
			//autopopulate if the xsl file has an associated xml source doc
			var docURL = dreamweaver.getDocumentPath("DOCUMENT");
			var siteRootURL	= dreamweaver.getSiteRoot();
 			var absoluteXSLURI = dreamweaver.relativeToAbsoluteURL( docURL, siteRootURL, xslFileURI);
			if ((absoluteXSLURI != null) && (absoluteXSLURI.length > 0))
			{
				var absXMLSourceURI = MMXSLT.getXMLSourceURI(absoluteXSLURI,false);
				if ((absXMLSourceURI != null) && (absXMLSourceURI.length > 0))
				{		
						var isHTTPReference = ((absXMLSourceURI.indexOf("http://") != -1) || (absXMLSourceURI.indexOf("https://") != -1));
						if (!isHTTPReference)
						{						
								//make it file relative
								 docRelURI = dw.absoluteURLToDocRelative(docURL,siteRootURL,absXMLSourceURI);				
								_xmlFile.setValue(docRelURI);
						}
						else
						{
								_xmlFile.setValue(absXMLSourceURI);
						}
				}
			}
		}
	}
}

//--------------------------------------------------------------------
// FUNCTION:
//   browseForXSLTFile
//
// DESCRIPTION:
//   browses for the xslt file
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function browseForXSLTFile()
{
  var fileName = "";
  var theXSLFilter	= new Array(LABEL_XSLTFILTER);
  fileName = dw.browseForFileURL("select",dw.loadString("XMLXSL_SB/SelectXSLT"),false,false,theXSLFilter);
  if (fileName) 
  {
    // If we are using ColdFusion, then we probably want this URL
    // for a cflocation tag, therefore we should strip any cfoutput tags.
    // This will be a no-op for other server models.
    if (dwscripts.stripCFOutputTags != null)
    {
      fileName = dwscripts.stripCFOutputTags(fileName);
    }    
   _xslFile.setValue(fileName);
  }	
}

//--------------------------------------------------------------------
// FUNCTION:
//   browseForXMLFile
//
// DESCRIPTION:
//   browses for the xml file
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function browseForXMLFile()
{
  var fileName = "";
  var theXMLFilter	= new Array(LABEL_XMLFILTER);
  fileName = dw.browseForFileURL("select",dw.loadString("XMLXSL_SB/SelectXML"),false,false,theXMLFilter);
  if (fileName) 
  {
    // If we are using ColdFusion, then we probably want this URL
    // for a cflocation tag, therefore we should strip any cfoutput tags.
    // This will be a no-op for other server models.
    if (dwscripts.stripCFOutputTags != null)
    {
      fileName = dwscripts.stripCFOutputTags(fileName);
    }    
   _xmlFile.setValue(fileName);
  }	
}


//--------------------------------------------------------------------
// FUNCTION:
//   getSelectedXSLTFilePath
//
// DESCRIPTION:
//   get selected XSLT File Path as an absolute path
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function getSelectedXSLTFilePath()
{
  var xslFileURI = _xslFile.getValue();
	var xslAbsRef=null;
	if (xslFileURI.length)
	{
		var isHTTPReference = ((xslFileURI.indexOf("http://") != -1) || (xslFileURI.indexOf("https://") != -1));
		if (!isHTTPReference)
		{
			if (xslFileURI.charAt(0) == '/')
			{
				 //check for site relative path and map them to absolute path
				xslAbsRef = site.siteRelativeToLocalPath(xslFileURI);										
			}
			else
			{
				//doc relative to absolute
				var currDocURL = dw.getDocumentDOM().URL;
				var siteRootURL	= dreamweaver.getSiteRoot();
				xslAbsRef = dreamweaver.relativeToAbsoluteURL( currDocURL, siteRootURL, xslFileURI);
			}
		}
	}
	return xslAbsRef;
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
