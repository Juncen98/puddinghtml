// Copyright 2005 Macromedia, Inc. All rights reserved.

function receiveArguments()
{
	var i=0;
	var theWindow = arguments[0];
	i=parseInt(theWindow);
	dw.setActiveWindow(dw.getDocumentList()[i]);
	if (dw.getFocus(true) == 'html')
	{
		// temporary set focus back to code view to force sync html inspector to the active doc.
		dw.setFocus('textView');
		dw.setFocus('html');
	}
}

function canAcceptCommand()
{
	var winlist = dw.getDocumentList();
	return winlist.length > 0;
}

// getDynamicContent returns the contents of a dynamically generated menu.
// returns an array of strings to be placed in the menu, with a unique
// identifier for each item separated from the menu string by a semicolon.
//
// return null from this routine to indicate that you are not adding any
// items to the menu
function getDynamicContent(itemID)
{
	var windowList = null;
	var i;
	windowList = new Array();
	var dwWindowNames = dw.getDocumentList();
	if (dwWindowNames.length > 0)
	{
		for (i=0; i<dwWindowNames.length; i++)
		{
			windowList[i] = new String(dwWindowNames[i].getOpenPathName());
			windowList[i] += ";id='"+i+"'"; // each item needs an ID
			windowList[i] = windowList[i].replace(/_/g,"%_");
		}
	}
	
	return windowList;
}

function isCommandChecked(itemID)
{
	var itemIndex = parseInt(itemID);
	return dw.getDocumentList()[itemIndex] == dw.getActiveWindow();
}
