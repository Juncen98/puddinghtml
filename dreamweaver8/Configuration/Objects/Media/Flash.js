// Copyright 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.
function isDOMRequired() { 
  // return true.  This will insert the object into the design view.
  return true;
}

function isAsset() {
	return true;
}

function objectTag(assetArgs)
{
	var dom = dw.getDocumentDOM();
	if (!dom)
	{
		return '';
	}

	var bDialogState = dw.getShowDialogsOnInsert();

	// Return the html tag that should be inserted

	var theMovie = '';

	if (dw.appName == "Contribute")
	{
		var filter = new Array(dw.loadString("insert doc dialog/flash doc desc") + " (*.swf)|*.swf|");
		theMovie = dw.browseForFileURL("open", "", false, "", filter, "", "", "desktop");
	}
	else
	{
		theMovie = dw.browseForFileURL();
	}
	
	if (theMovie != '')
	{
		theMovie = dw.doURLEncoding(theMovie);
	}

	if (assetArgs)
	{
		theMovie = assetArgs;
	}

	if ((theMovie == '') && bDialogState)
	{
		return '';
	}

	rtnStr = '<OBJECT CLASSID="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"' + 
				' CODEBASE="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=7,0,19,0" WIDTH="32" HEIGHT="32">\n' + 
				'<PARAM NAME="movie" VALUE="' + theMovie + '"> <PARAM NAME="quality" VALUE="high">\n' +
				'<EMBED SRC="' + theMovie +
				'" quality="high" PLUGINSPAGE="http://www.macromedia.com/go/getflashplayer" ' +
				'TYPE="application/x-shockwave-flash" WIDTH="32" HEIGHT="32">'+
				'</EMBED></OBJECT>';

	prefsAccessibilityOption = dw.getPreferenceString("Accessibility", "Accessibility Media Options", "");

	if (prefsAccessibilityOption == 'TRUE')
	{
		rtnStr = addAccessibility(rtnStr);
	}

  // tell dw to prepend a browser-safe script if the preference is turned on
  // (see Code Rewriting preferences)
  if (dom.convertNextActiveContent) // if the function doesn't exist, don't call it
    dom.convertNextActiveContent();

	return rtnStr;
}


function addAccessibility(rtnStr) {
   var cmdFile = dreamweaver.getConfigurationPath() + "/Commands/Object Options.htm";
   var cmdDOM = dreamweaver.getDocumentDOM(cmdFile);
 
   cmdDOM.parentWindow.setFormItem(rtnStr);
   dreamweaver.popupCommand("Object Options.htm");
   return (cmdDOM.parentWindow.returnAccessibilityStr(rtnStr));	
}
