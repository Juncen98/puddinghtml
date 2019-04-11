// Copyright 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

//---------------   GLOBAL VARIABLES   ---------------

var targetDom = null;
var insertLocation = ""; 
var insertNode=null;

//---------------     API FUNCTIONS    ---------------

function isDomRequired() {
	return true;
}


function getInsertLocation(menuArguments)
	{	
	insertLocation = window.event.altKey ? "beforeEntry" : "afterEntry"; 
	
	if (window.event.ctrlKey)
		insertLocation = window.event.altKey ? "listBegin" : "listEnd"; 

	if (menuArguments.length > 2) 
		insertLocation = menuArguments[2]; 
		
	return insertLocation; 
	} //getInsertLocation
	
	
function canAcceptCommand()
	{			
	targetDom = arguments[0]; 
	if (targetDom == null)
		targetDom = dw.getDocumentDOM(); 

	if (targetDom == null)
		return false; 
			
	return (dw.getFocus() != 'browser' && dw.getDocumentDOM() != null && dw.canSaveDocumentAsTemplate(dw.getDocumentDOM()) && dw.getDocumentDOM().getParseMode() == 'html');
	} //canAcceptCommand


//Pass the target DOM, or null here. If you wish, you can also
//pass a string as the second param, to determine whether to 
//insert before or after the current entry, or beginning or end of the list. 
//If no param is passed we will look at the altKey. Note that if there is no 
//entry selected, this controls whether the entry appears 
//at the beginning or end of the list. 
//legal values for this string are: "listBegin", "listEnd", "beforeEntry", "afterEntry"
function receiveArguments()
	{
	targetDom = arguments[0];
	if (targetDom == null)
		targetDom = dw.getDocumentDOM();
				
	insertNode = arguments[1]; 
	getInsertLocation(arguments); 
	}

function DoCommand()
	{	
	if (!canInsertRepeatEntry(targetDom, insertLocation, insertNode))
		{
		dw.beep();
		alert(MM.MSG_CantInsertRepeatEntry); 
		return; 
		}

	
	if (insertLocation == "")
		{
		alert(MSG_MissingParams); 
		return;
		}
		
	doInsertRepeatEntry(targetDom, insertNode, insertLocation);
	insertNode = null; 
	targetDom = null; 
	insertLocation = ""; 
	}
	
	
//---------------    LOCAL FUNCTIONS   ---------------

