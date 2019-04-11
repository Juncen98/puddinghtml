// Copyright 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.
//---------------   GLOBAL VARIABLES   ---------------
var targetDom = null;
var targetRegion = null;
var moveLocation = ""; 
//---------------     API FUNCTIONS    ---------------
function isDOMRequired() {
	return true;
}

function getMoveLocation(direction)
	{
	moveLocation = window.event.altKey ? "up" : "down";
	
	if (direction != null)
		moveLocation = direction; 
		
	if (window.event.ctrlKey)
		moveLocation = (moveLocation == "up") ? "listBegin" : "listEnd";
	
	return moveLocation;
	} //getMoveLocation
	
	
function canAcceptCommand()
	{			
	return (dw.getDocumentDOM() != null && dw.canSaveDocumentAsTemplate(dw.getDocumentDOM()) && dw.getFocus() != 'browser' && dw.getDocumentDOM().getParseMode() == 'html');
	} //canAcceptCommand

//Move the selected entry up or down, to the beginning or end of the list.
//param 2 is a string telling where to move - it's optional. Possible values are
//"up", "down", "listBegin", "listEnd". Pass nothing and the modifier keys will be read
function receiveArguments()
	{
	targetDom = arguments[0];
	if (targetDom == null)
		targetDom = dw.getDocumentDOM();
			
	targetRegion = arguments[2]; 	
		
	var passedDirection = null; 
	if (arguments.length > 1) 
		passedDirection = arguments[1]; 
		
	getMoveLocation(passedDirection);
	}
	
function DoCommand()
	{	
	if (!canMoveRepeatEntry(targetDom, moveLocation, targetRegion))
		{
		dw.beep();
		
		if (getSelectedRepeatEntry(targetDom, targetRegion) == null)
			alert(MM.MSG_NoRepeatEntries);
		
		return;
		}
		
	if (moveLocation == "" )
		{
		alert(MSG_MissingParamMove);
		return;
		}
		
	if (!moveSelectedRepeatEntry(targetDom,  moveLocation, targetRegion))
		dw.beep();
		
	targetDom = null;
	moveLocation  = "";
	targetRegion = null;
	}
	
	
//---------------    LOCAL FUNCTIONS   ---------------
