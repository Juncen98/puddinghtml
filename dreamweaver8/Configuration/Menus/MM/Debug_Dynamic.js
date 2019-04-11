// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.


function isDOMRequired() {
	// Return false, indicating that this is enabled when focus is in the code view.
	return false;
}

function haveDebugTarget()
{
	var bHaveDebugTarget = false;

	// no debug if site has focus or if it is a frameset document
	var doc = dw.getDocumentDOM('document');

	if (dw.getFocus() == 'site')
		bHaveDebugTarget = false;
	if (dw.getFocus() == 'document' ||
		dw.getFocus() == 'textView' || dw.getFocus("true") == 'html' )
		bHaveDebugTarget = (dw.getDocumentDOM('document') != null && 
								dw.getDocumentDOM().getParseMode() == 'html');

	// In order to debug JavaScript documents, we need to establish a 
	// communication link between Dreamweaver and an applet running in
	// the browser.  Currently, there are now browsers on the OSX platform
	// that support such a link.  Therefore, the feature is disabled for
	// OSX.
	if (dw.isOSX())
		bHaveDebugTarget = false;

	return bHaveDebugTarget;
}

function receiveArguments()
{
	var whichBrowser = arguments[0];
	var theBrowser = null;
	var i=0;
	var browserList = null;
	var result = false;

	if (haveDebugTarget())
	{
		// Code to check if we were called from a shortcut key
		if (whichBrowser == 'primary' || whichBrowser == 'secondary')
		{
			// get the path of the selected browser
			if (whichBrowser == 'primary')
			{
				theBrowser = dw.getPrimaryBrowser();
			}
			else if (whichBrowser == 'secondary')
			{
				theBrowser = dw.getSecondaryBrowser();
			}

			// match up the path with the name of the corresponding browser
			// that appears in the menu
			browserList = dw.getDebugBrowserList();
			while (i < browserList.length)
			{
				if (browserList[i+1] == theBrowser)
					theBrowser = browserList[i];
				i+=2;
			}
		}
		else
			theBrowser = whichBrowser;

		// If the path contains double-byte character, cannot debug in NetScape. If user 
		// try to debug it, show alert.

		var pathStr = dw.getDocumentPath('document');
		var isDoubleBytePath = false;
		var unableToDebug = false;

		for (i=0; i<pathStr.length; i++) {
			theChar = ""+pathStr.charAt(i); //get char, convert to string
			if (theChar.charCodeAt(0) > 255 && i<pathStr.length-1) {
				isDoubleBytePath = true;
				i = pathStr.length;									// break		
			}
		}
		if (theBrowser.toLowerCase().indexOf("netscape") != -1 && isDoubleBytePath) 
			unableToDebug = true;

		// Only launch the browser if we have a valid browser selected

		if (theBrowser != "file:///" && typeof(theBrowser) != "undefined" && theBrowser.length > 0 && !unableToDebug)
		{
			dw.debugDocument(dw.getDocumentPath('document'),theBrowser);
		}
		else if (unableToDebug) 
		{
			alert(MM.MSG_dbgDoubleBytePathNS);
		}
		else
		{
			// otherwise, if the user hit the F12 or Ctrl+F12 keys,
			// ask if they want to specify a primary or secondary browser now.
			if (whichBrowser == 'primary')
			{
				result = window.confirm(MSG_NoPrimaryBrowserDefined);
			}
			else if (whichBrowser == 'secondary')
			{
				result = window.confirm(MSG_NoSecondaryBrowserDefined);
			}

			// If they clicked OK, show the prefs dialog with the browser panel
			if (result)
				dw.showPreferencesDialog('browsers');
		}
	}
}

function canAcceptCommand()
{
	var DIB = dw.getDebugBrowserList();

	if (arguments[0] == 'primary' || arguments[0] == 'secondary')
		return haveDebugTarget();

	return haveDebugTarget() && (DIB.length > 0);
}

// getDynamicContent returns the contents of a dynamically generated menu.
// returns an array of strings to be placed in the menu, with a unique
// identifier for each item separated from the menu string by a semicolon.
//
// return null from this routine to indicate that you are not adding any
// items to the menu
function getDynamicContent(itemID)
{
	var browsers = null;
	var PIB = null;
	var i;
	var j=0;
	browsers = new Array();
	DIB = dw.getDebugBrowserList();
	// each browser pair has the name of the browser and the path that leads
	// to the application on disk. We only put the names in the menus
	for (i=0; i<DIB.length; i=i+2)
	{
		browsers[j] = new String(DIB[i]);

		if (dw.getPrimaryBrowser() == DIB[i+1])
		   browsers[j] += "\tOpt+F12";
		else if (dw.getSecondaryBrowser() == DIB[i+1])
		  browsers[j] += "\tOpt+Cmd+F12";

		browsers[j] += ";id='"+escQuotes(DIB[i])+"'";

		if (itemID == "DWPopup_PIB_Debug_Default")
			browsers[j] = MENU_strDebugIn + browsers[j];

		j = j+1;
	}
	return browsers;
}


