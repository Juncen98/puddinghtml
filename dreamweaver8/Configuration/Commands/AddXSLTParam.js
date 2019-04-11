// Copyright 2005 Macromedia, Inc. All rights reserved.

var HELP_DOC = MM.HELP_cmdXSLTAddParam;

//var _ParamName = null ;
var _DefaultValue = new DynamicTextField("", "DefaultValue", "");
var _ParamSelectList = new ListControl("ParamName");
var _RuntimeValue = null ;


//*************************API**************************

//--------------------------------------------------------------------
// FUNCTION:
//   commandButtons
//
// DESCRIPTION:
//   Returns the array of buttons that should be displayed on the
//   right hand side of the dialog.  The array is comprised
//   of name, handler function name pairs.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   array of strings - name, handler function name pairs
//--------------------------------------------------------------------

function commandButtons()
{                          
  return new Array(MM.BTN_OK,     "okClicked()",
                   MM.BTN_Cancel, "cancelClicked()",
                   MM.BTN_Help,   "displayHelp()" );
}

//--------------------------------------------------------------------
// FUNCTION:
//   okClicked
//
// DESCRIPTION:
//   Sets the return value to the selected DSN and closes the window.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function okClicked()
{
  var serverModel = dw.getDocumentDOM().documentType;
  var paramName = _ParamSelectList.getValue();
  
  if (paramName != "")
  {
  	if ((serverModel.indexOf('ASP')!=-1 && paramName.match(/^\d/)) || !paramName.match(/^[\w\d_]+$/)) {
  		alert(dw.loadString("XMLXSL_SBError/InvalidParamName"));
  	} else {
	    var defaultValue = _DefaultValue.textControl.value;
	
		if (defaultValue != "")
		{
	      var retVal = new Array();
	
	      retVal.push(paramName);
	      // retVal.push(_ParamType.getValue());
	      retVal.push(_DefaultValue.textControl.value );
		  retVal.push(_RuntimeValue.value ) ;
	
	      dwscripts.setCommandReturnValue(retVal);
	      window.close();
	    }
		else
		{
		  alert(dw.loadString("XMLXSL_SBError/NoParamValue"));
		  _DefaultValue.textControl.focus();
		}
	}
  }
  else
  {
    alert(dw.loadString("XMLXSL_SBError/NoParamName"));
    _ParamSelectList.focus();
  }
}

//--------------------------------------------------------------------
// FUNCTION:
//   cancelClicked
//
// DESCRIPTION:
//   Closes the window and returns nothing
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function cancelClicked()
{
  dwscripts.setCommandReturnValue("");
  window.close();
}

//--------------------------------------------------------------------
// FUNCTION:
//   updateUI
//
// DESCRIPTION:
//   This function is called by the UI controls to handle UI updates
//
// ARGUMENTS:
//   control - string - the name of the control sending the event
//   event - string - the event which is being sent
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function updateUI(control, event)
{
}

//--------------------------------------------------------------------
// FUNCTION:
//   initializeUI
//
// DESCRIPTION:
//   This function is called in the onLoad event.  It is responsible
//   for initializing the UI.  If we are inserting a recordset, this
//   is a matter of populating the connection drop down.
//
//   If we are modifying a recordset, this is a matter of inspecting
//   the recordset tag and setting all the form elements.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function initializeUI()
{
  // Initialize UI elements
 
  //_ParamName = dwscripts.findDOMObject("ParamName"); 
	_DefaultValue.initializeUI();
  //_DefaultValue = dwscripts.findDOMObject("DefaultValue");
  _RuntimeValue = dwscripts.findDOMObject("RuntimeValue");
 
  var cmdArgs = dwscripts.getCommandArguments();

  if (cmdArgs && (cmdArgs.length > 3))
	{
		//populate with list of xsl:params
		var xslFilePath = cmdArgs[3]
		autoPopulateXSLTParamNames(xslFilePath);
	}

 
  if (cmdArgs && (cmdArgs.length > 2))
  {
    _ParamSelectList.pickValue(cmdArgs[0]);
		_DefaultValue.textControl.value = cmdArgs[1] ;
		_RuntimeValue.value = cmdArgs[2] ;
  }
  else
  {
    _ParamSelectList.setValue("");
		_DefaultValue.textControl.value = "" ;
		_RuntimeValue.value = "" ;
  }

  _ParamSelectList.focus();
  updateDefaultState();
}

function autoPopulateXSLTParamNames(xsltFilePath)
{
	if (xsltFilePath != null)
	{
		if (DWfile.exists(xsltFilePath))
		{
			var xslFileDOM = dw.getDocumentDOM(xsltFilePath);		
			if (xslFileDOM != null)
			{
				var xslParamArray = xslFileDOM.getElementsByTagName("xsl:param");
				var xslNameList = new Array();
				for (var i =0; i < xslParamArray.length ; i++)
				{
					xslNameList[i] = xslParamArray[i].getAttribute("name");
				}
				_ParamSelectList.setAll(xslNameList,xslNameList);
			}
		}
	}
}

function launchLocalDynamicData() {
	_DefaultValue.launchDynamicData()
	var tmpValue = _DefaultValue.textControl.value;
	if (tmpValue.match(/^<cfoutput>#.*#<\/cfoutput>$/i)) {
		tmpValue = tmpValue.replace(/^<cfoutput>/i, '');
		tmpValue = tmpValue.replace(/<\/cfoutput>$/i, '');
		_DefaultValue.textControl.value = tmpValue;
	}
  updateDefaultState();
}

function updateDefaultState() {
	var tmpValue = _DefaultValue.textControl.value;
	var isDisabled = "true";
	if (tmpValue.match(/^\s*#.*#\s*$/)) {
		isDisabled = "false";
	} else if (tmpValue.match(/^\s*<\?.*\?>\s*$/)) {
		isDisabled = "false";
	} else if (tmpValue.match(/^\s*<%.*%>\s*$/)) {
		isDisabled = "false";
	} 
	
	_RuntimeValue.setAttribute("disabled", isDisabled);
	
	if (isDisabled == "true") {
		_RuntimeValue.value = tmpValue;
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
