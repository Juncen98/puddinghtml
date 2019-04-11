// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

//---------------   GLOBAL VARIABLES   ---------------

var targetDom = null;
var targetRegion = null; 


//---------------     API FUNCTIONS    ---------------



function isDOMRequired() {
	return true;
}

function canAcceptCommand()
	{			
	targetDom = arguments[0]; 
	if (targetDom == null)
		targetDom = dw.getDocumentDOM(); 

	if (targetDom == null)
		return false; 
	
	targetRegion = arguments[1]; 
	
	return true; 
	} //canAcceptCommand

function receiveArguments()
	{
	targetDom = arguments[0];
	if (targetDom == null)
		targetDom = dw.getDocumentDOM();
	
	targetRegion = arguments[1]; 
	}

	
function DoCommand()
	{
	if (!canDeleteRepeatEntry(targetDom, targetRegion))
    {
        var msg = dw.loadString("template editing/delete warning");
        alert(msg);
		dw.beep();
    }
	else if (!doDeleteRepeatEntry(targetDom, targetRegion))
    {
		dw.beep();
    }
	
	targetDom = null; 
	targetRegion = null;
	}
	
	
//---------------    LOCAL FUNCTIONS   ---------------



