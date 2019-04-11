// Copyright 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

//---------------   GLOBAL VARIABLES   ---------------

var helpDoc = MM.HELP_insertOptionalContent;
var targetDom = null;
var abortCommand = false; //Set to true if the user cancels out of the 'save as template' dialog

var selectedOptionalNode = null;
var currentExpression = "";
var addEditable = false; 

var T = null; //Tab Control

var paramController = null;

//---------------     API FUNCTIONS    ---------------

function commandButtons()
	{
  	return new Array(
  					MM.BTN_OK,"okClicked()",
  					MM.BTN_Cancel,"window.close()",
  					MM.BTN_Help,"displayHelp()");
	}


function isDomRequired() {
	return true;
}

function receiveArguments()
	{	
	targetDom = arguments[0];
	if (targetDom == null)
		targetDom = dw.getDocumentDOM();
		
	abortCommand = false;
	
	if (!CheckWarnNoTemplate(targetDom))
		abortCommand = true;
	
	var result = new Object();
	
	if (!canMakeTemplateContent("optional", targetDom, result))
		{
		abortCommand = true;
		
		if (result.status == "contained in DW4 edit")
			alert(MM.MSG_SaveDW4First);
		else if (result.status == "locked")
			alert(MM.TEMPLATE_UTILS_CantInsertOptionalHere); 
		else if (result.status == "tableCells")
			alert(MM.TEMPLATE_UTILS_MultipleCellsNotAllowed);
		else if (result.status == "markup overlap")
			alert(MM.MSG_WrappingExistingEdit);
		else
			alert(MM.MSG_AlreadyEdit);
		}

   var curSelNode = null;
   if (arguments.length > 2 && arguments[2] != null)
	   	curSelNode = arguments[2];
   	else
	   	curSelNode = getUnlockedSelNode(targetDom, false);

   if (curSelNode != null && curSelNode.tagName == "MMTEMPLATE:IF" && arguments.length > 1 && arguments[1] == "useSelectedNode")
		selectedOptionalNode = curSelNode;
	
	if (arguments.length > 3 && arguments[3] == "addEditable")
		addEditable = true; 
	else
		addEditable = false; 
				
	} //receiveArguments

function canAcceptCommand()
	{
	targetDom = arguments[0];
	if (targetDom == null)
		targetDom = dw.getDocumentDOM();
		
	return (targetDom != null && dw.canSaveDocumentAsTemplate(targetDom) && dw.getFocus() != 'browser' && dw.getDocumentDOM().getParseMode() == 'html');
	} //canAcceptCommand

	
function okClicked()
	{	
	var curDOM = (targetDom == null) ? dw.getDocumentDOM('document') : targetDom;
	
	if (T.getCurPageNum() == 1)
		{
		var newCondName = findObject("condName").value;
		var showByDefault = findObject("showByDefault").checked;
		
		if (stringIsAllDigits(newCondName))
			{
			//parsed as a number - this is not allowed.
			alert(MSG_numberNotAllowed);
			return;
			}
						
		if (selectedOptionalNode != null)
			{
			curDOM.disableLocking();
			
			if (!checkLegalTemplateName(newCondName))
				return; //make them enter the name, or cancel the main dialog.

			//selectedOptionalNode.cond = dwscripts.minEntityNameEncode(encodeTemplateParam(newCondName, true));
			selectedOptionalNode.cond = encodeTemplateParam(newCondName, true);

			//Insert or update the param, if this isn't an expression. Don't encode.
			if (!isExpressionString(newCondName, true))
				{
				if (checkInsertTemplateParam(targetDom))
					insertTemplateParam(newCondName, "boolean", showByDefault ? "true" : "false", targetDom);
				}
				
			curDOM.enableLocking();
			window.close();
			}
		else
			{
			var oldParamNode = getTemplateParamTag(newCondName, targetDom);
			if (oldParamNode != null && !RunDSConfirmDialog_YesNo(dwscripts.sprintf(MM.Optional_MSG_ParamExists, newCondName), "showCreateParamWarning", true))
				return;

			if (!doInsertConditional(newCondName,showByDefault, null, targetDom, true, addEditable))
				return;
				
			window.close();
			}
		}
	else
		{		
		var isExpression = findObject("expressionRadio").checked;
		var exprString = findObject("expression").value;

		//Strip linefeeds from the expression, replace with spaces. For some reason 
		//the regexp code only replaces the first instance, so loop until there aren't any more. 
	    var oldMulti = RegExp.multiline;
	    RegExp.multiline = true;
	    var pat1 = /\r/g;
	    exprString = exprString.replace(pat1, " ");
	    var pat2 = /\n/g; 
	    exprString = exprString.replace(pat2, " ");
		RegExp.multiline = oldMulti; 
			
		
		var isExistingParam = findObject("existingParamRadio").checked;
		var existingParamToUse = paramController.getValue();
		
		curDOM.synchronizeDocument();
		curDOM.disableLocking();
		var result = false;
											
		if (selectedOptionalNode != null)
			{
			if (isExpression && exprString.length > 0)
				{
				//selectedOptionalNode.cond = dwscripts.minEntityNameEncode(exprString);
				selectedOptionalNode.cond = exprString;
								
				result = true;
				}
			else if (isExistingParam && existingParamToUse != MM.Optional_MSG_None)
				{
				//selectedOptionalNode.cond = dwscripts.minEntityNameEncode(encodeTemplateParam(existingParamToUse, true));
				selectedOptionalNode.cond = encodeTemplateParam(existingParamToUse, true);
				result = true;
				}
			else
				alert(MM.Optional_MSG_MustPick);
			}
		else
			{
			if (isExpression && exprString.length > 0)
				result = doInsertConditional("",true, exprString, targetDom, false, addEditable);
			else if (isExistingParam && existingParamToUse != MM.Optional_MSG_None)
				result = doInsertConditional("",true, encodeTemplateParam(existingParamToUse, true), targetDom, true, addEditable);
			else
				alert(MM.Optional_MSG_MustPick);
			}
		
		curDOM.enableLocking();
	
		if (result)
			{
			curDOM.synchronizeDocument();
			window.close();
			}
		}
	} //okClicked
	

	
//---------------    LOCAL FUNCTIONS   ---------------



//Update the selection state on the controls, based on one of them changing.
function updateControls(whichControl)
	{	
	var expressionRadio = findObject("expressionRadio");
	var existingParamRadio = findObject("existingParamRadio");
	
	switch (whichControl)
		{
		case 'expression':
			{
	  		expressionRadio.checked = true;
	  		existingParamRadio.checked = false;
	  		break;
			}
			
		case 'existingParams':
			{
	  		expressionRadio.checked = false;
	  		existingParamRadio.checked = true;
	  		break;
			}
			
		case 'expressionRadio':
			{
	  		expressionRadio.checked = true;
	  		existingParamRadio.checked = false;
	  		break;
			}
			
		case 'existingParamRadio':
			{
	  		expressionRadio.checked = false;
	  		existingParamRadio.checked = true;
	  		break;
			}
		}
	} //updateControls




//This is an example of a page class to be used with the TabControl.
//Uncomment the alert() calls to display the various events as they occur.

function Pg1(theTabLabel) {
  this.tabLabel = theTabLabel;
}
Pg1.prototype.getTabLabel = Pg1_getTabLabel;


function Pg1_getTabLabel() {
  return this.tabLabel;
}


function initializeUI()
	{	
	if (abortCommand)
		{
		window.close();
		return;
		}

  var tab0 = findObject("Tab0");
  var tab1 = findObject("Tab1");

  //Use appropriate background & tabs for Mac OS X.
  if (dw.isOSX()) {
    findObject("tabBgWin").src = "../Shared/MM/Images/tabBgOSX335x290.gif";    
    var oldMulti = RegExp.multiline;
    RegExp.multiline = true;
    var pat1 = /tabBg\.gif/;
    tab0.innerHTML = tab0.innerHTML.replace(pat1, "tabBgOSX.gif");
	  tab1.innerHTML = tab1.innerHTML.replace(pat1, "tabBgOSX.gif");
    var pat2 = /tabBgSel\.gif/;
    tab0.innerHTML = tab0.innerHTML.replace(pat2, "tabBgSelOSX.gif");
    tab1.innerHTML = tab1.innerHTML.replace(pat2, "tabBgSelOSX.gif");
	  RegExp.multiline = oldMulti;
  // Use appropriate background & tabs for WinXP with themes  
  } else if (dw.isXPThemed()) {
    findObject("tabBgWin").src = "../Shared/MM/Images/tabBgWinXP335x290.gif";
    var oldMulti = RegExp.multiline;
    RegExp.multiline = true;
    var pat1 = /tabBg\.gif/;
    tab0.innerHTML = tab0.innerHTML.replace(pat1, "tabBgXP.gif");
	  tab1.innerHTML = tab1.innerHTML.replace(pat1, "tabBgXP.gif");
    var pat2 = /tabBgSel\.gif/;
    tab0.innerHTML = tab0.innerHTML.replace(pat2, "tabBgSelXP.gif");
    tab1.innerHTML = tab1.innerHTML.replace(pat2, "tabBgSelXP.gif");
    RegExp.multiline = oldMulti;
  // Use standard background  
  } else {	
    findObject("tabBgWin").src = "../Shared/MM/Images/tabBgWin.gif";
  }

   T = new TabControl('Tab');
   T.addPage('basic', new Pg1(MM.Optional_LABEL_Basic));
   T.addPage('advanced', new Pg1(MM.Optional_LABEL_Advanced));
  
   var startPage = 'basic';
   currentExpression = "";
          
   if (selectedOptionalNode != null)
  	 	currentExpression = decodeTemplateParam(dwscripts.minEntityNameDecode(selectedOptionalNode.cond));
   else
   	{
   	//auto-name the optional area. 
   	//Count the number of optional areas, add one. 
   	currentExpression = getUniqueRegionName(MM.OptionalAutonamePreamble, "MMTemplate:If",  dw.getDocumentDOM('document'));
   	}
   		
   var isExpression = (selectedOptionalNode != null && isExpressionString(currentExpression, true));
  
   if (isExpression)
	  startPage = 'advanced';
   	
   T.start(startPage);

  
   if (currentExpression != "")
   	{
		findObject("condName").value = currentExpression;
		findObject("expression").value = currentExpression;
		}
		
	if (startPage == 'basic')
		{
  		findObject("condName").focus(); //set focus on textbox
  		findObject("condName").select(); //set insertion point into textbox
  		}
  		
  	findObject("expressionRadio").checked = isExpression;
  	findObject("existingParamRadio").checked = !isExpression;

  	//Setup the popup of existing params.
  	paramController = new ListControl("existingParams");
  	var boolParams =  getTemplateParams("boolean", null);
  	
  	var paramNames = new Array();
  	paramNames.push(MM.Optional_MSG_None);
  	for (i=0;i<boolParams.length;i++)
  		paramNames.push(boolParams[i].name);
  		
  	paramController.setAll(paramNames, paramNames);  	
	if (!isExpression && selectedOptionalNode != null && currentExpression.length > 0)
		paramController.pickValue(currentExpression);
	if (selectedOptionalNode != null)
		{
		var curDOM = (targetDom == null) ? dw.getDocumentDOM('document') : targetDom;
		var paramTag = getTemplateParamTag(currentExpression, curDOM);

		if (paramTag != null)
			{
			findObject("showByDefault").checked = paramTag.value == "true";
  			findObject("existingParamRadio").checked = true;
  			findObject("expressionRadio").checked = false;
  			paramController.pickValue(paramTag.name);
			}
		}
	} //initializeUI


