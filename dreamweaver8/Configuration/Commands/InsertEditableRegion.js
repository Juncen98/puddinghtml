// Copyright 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

//---------------   GLOBAL VARIABLES   ---------------

var helpDoc = MM.HELP_insertEditableRegion; 
var targetDom = null;
var abortCommand = false; //Set to true if the user cancels out of the 'save as template' dialog
var abortMessage = ""; 

var selectedEditableNode = null; 

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
		{
		abortCommand = true; 
		return "abort";
		}
	
	var result = new Object();
		
	if (!abortCommand && !canMakeTemplateContent("editable", targetDom, result))
		{
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
		
		abortCommand = true; 
		return "abort"; 
		}
		
   var curSelNode = getUnlockedSelNode(targetDom, false); 
   selectedEditableNode = null;
   
   if (curSelNode.tagName == "MMTEMPLATE:EDITABLE" && arguments.length > 1 && arguments[1] == "useSelectedNode")
		selectedEditableNode = curSelNode; 
	} //receiveArguments

function canAcceptCommand()
	{
	return (dw.getDocumentDOM('document') != null && dw.canSaveDocumentAsTemplate(dw.getDocumentDOM()) && dw.getFocus() != 'browser' && dw.getDocumentDOM().getParseMode() == 'html');
	} //canAcceptCommand

function okClicked()
	{	
	
	var curDOM = (targetDom == null) ? dw.getDocumentDOM('document') : targetDom; 
			
	if (selectedEditableNode != null)
		{	
			
		if (selectedEditableNode.name == document.theForm.name.value)
			{
			window.close();
			return; 
			}
			
		if (findNamedEditableRegion(document.theForm.name.value, curDOM, null, false, selectedEditableNode) != null)	
			{
			alert(MSG_alreadyExists);
			document.theForm.name.focus();
		  	document.theForm.name.select(); //set insertion point into textbox
			return; 
			}		
			
		curDOM.disableLocking(); 
		curDOM.syncronizeDocument(); 
		selectedEditableNode.name = dwscripts.minentityNameEncode(document.theForm.name.value);			
		curDOM.synchronizeDocument();
		curDOM.enableLocking();
		
		window.close();
		}
	else 
		{
		
		if (doInsertEditable(document.theForm.name.value, targetDom))
			window.close();
		}
		
	}
	
	
//---------------    LOCAL FUNCTIONS   ---------------


function initializeUI()
	{	
	if (abortCommand)
		{		
		window.close();
		return; 
		}
	
   if (selectedEditableNode != null)
		document.theForm.name.value = dwscripts.minEntityNameDecode(selectedEditableNode.name); 
	else
		document.theForm.name.value =   getUniqueRegionName(MM.EditAutonamePreamble, "MMTemplate:Editable",  dw.getDocumentDOM('document'));
		
  	document.theForm.name.focus(); //set focus on textbox
  	document.theForm.name.select(); //set insertion point into textbox
	} //initializeUI


