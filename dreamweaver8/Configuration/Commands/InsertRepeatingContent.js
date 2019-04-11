// Copyright 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

//---------------   GLOBAL VARIABLES   ---------------

var helpDoc = MM.HELP_insertRepeatingContent;
var targetDom = null; 
var abortCommand = false; //Set to true if the user cancels out of the 'save as template' dialog

var selectedRepeatingNode = null; 

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
	if (!targetDom)
		targetDom = dw.getDocumentDOM(); 
	
	if (targetDom == null)
		return false; 
		
	abortCommand = false; 
	
	if (!CheckWarnNoTemplate(targetDom))
		abortCommand = true; 
	
	var result = new Object();
		
	if (!canMakeTemplateContent("repeating", targetDom, result))
		{
		abortCommand = true; 
		
		if (result.status == "contained in DW4 edit")
			alert(MM.MSG_SaveDW4First); 
		else if (result.status == "locked")
			alert(MSG_cantInsertRepeatHere); 
		else if (result.status == "tableCells")
			alert(MM.TEMPLATE_UTILS_MultipleCellsNotAllowed);
		else if (result.status == "markup overlap")
			alert(MM.MSG_WrappingExistingEdit);
		else
			alert(MM.MSG_AlreadyEdit);
		}
		
   var curSelNode = getUnlockedSelNode(targetDom, false); 
   		
   if (curSelNode.tagName == "MMTEMPLATE:REPEATING" && arguments.length > 1 && arguments[1] == "useSelectedNode")
		selectedRepeatingNode = curSelNode; 
	} //receiveArguments


function okClicked()
	{
	var curDOM = (targetDom == null) ? dw.getDocumentDOM('document') : targetDom; 

	if (stringIsAllDigits(document.theForm.name.value))
		{
		//parsed as a number - this is not allowed. 
		alert(MSG_numberNotAllowed);
		return; 
		}

	if (selectedRepeatingNode != null)
		{		
		if (selectedRepeatingNode.name == document.theForm.name.value)
			{
			window.close();
			return; 			
			}
		
		if (findNamedRepeatingRegion(document.theForm.name.value, curDOM) != null)	
			{
			alert(MSG_alreadyExists_Repeat);
			return; 
			}		
			
		curDOM.syncronizeDocument(); 	
		curDOM.disableLocking(); 
		selectedRepeatingNode.name = document.theForm.name.value;			
		curDOM.enableLocking(); 
		
		window.close();
		}
	else if (doInsertRepeat(document.theForm.name.value, targetDom))
		window.close();
	}
	
function canAcceptCommand()
	{
	return (dw.getDocumentDOM('document') != null && dw.canSaveDocumentAsTemplate(dw.getDocumentDOM()) && dw.getFocus() != 'browser' && dw.getDocumentDOM().getParseMode() == 'html');
	} //canAcceptCommand

	
//---------------    LOCAL FUNCTIONS   ---------------


function initializeUI()
	{
	if (abortCommand)
		{
		window.close();
		return; 
		}
		
   if (selectedRepeatingNode != null)
		document.theForm.name.value = selectedRepeatingNode.name; 
	else
		document.theForm.name.value = getUniqueRegionName(MM.RepeatAutonamePreamble, "MMTemplate:Repeat",  dw.getDocumentDOM('document'));
		
  	document.theForm.name.focus(); //set focus on textbox
  	document.theForm.name.select(); //set insertion point into textbox
	} //initializeUI


