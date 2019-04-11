// Copyright 2005 Macromedia, Inc. All rights reserved.

var FILE_CONFIG_PATH = dw.getConfigurationPath();
var recentSnippetFile = FILE_CONFIG_PATH + "/Snippets/RecentSnippets.xml";
var focusView;

function receiveArguments()
{
	var fileurl = arguments[0];
	fileurl = fileurl.replace(/Snippets\*/, "");	// strip snippets folder
	fileurl = fileurl.replace(/\*/g, "\\");			// replace * in id with path separators
	dw.snippetPalette.insertSnippet(fileurl);

	// need to restore focus to the active view after calling dw.snippetPalette.insertSnippet
	if (focusView == 'document' || focusView == 'textView' || focusView == 'html')
		dw.setFocus(focusView);	
}

function isDOMRequired()
{
	return false;
}

function canAcceptCommand()
{
	if (!DWfile.exists(recentSnippetFile))
		return false;

	var dom = dreamweaver.getDocumentDOM(recentSnippetFile);
	if (!dom)
		return false;
		
	focusView = dw.getFocus(true);	// remember the active view so that we can restore focus to it before inserting snippet.
	
	var menuitemArray = new Array();
	menuitemArray = dom.getElementsByTagName("snippet");
	
	var enabled = menuitemArray.length > 0;
	enabled = enabled && dw.getDocumentDOM() != null;
	enabled = enabled && ((focusView == 'document' && dw.getDocumentDOM().getFocus() != 'head') || focusView != 'document');
	
	return enabled; 
}

// getDynamicContent returns the contents of a dynamically generated menu.
// returns an array of strings to be placed in the menu, with a unique
// identifier for each item separated from the menu string by a semicolon.
//
// return null from this routine to indicate that you are not adding any
// items to the menu
function getDynamicContent(itemID)
{
	var retArray = null;
	
	if (!DWfile.exists(recentSnippetFile))
		return retArray;
		
	var dom = dreamweaver.getDocumentDOM(recentSnippetFile);
	
	if (dom)
	{
		var menuitemArray = new Array();
		retArray = new Array();

		menuitemArray = dom.getElementsByTagName("snippet");
		for (var i=0,j=0; i<menuitemArray.length; i++)
		{
			var id = menuitemArray[i].getAttribute("id");
			var fileurl = id.replace(/\*/g, "/");			// replace * in id with path separators
			fileurl = fileurl.replace(/^\s*/, "");			// remove any leading white spaces
			fileurl = fileurl.replace(/\s*$/, "");			// remove any trailing white spaces
			if (fileurl == '')
				continue;
			fileurl = FILE_CONFIG_PATH+"/"+fileurl;
			if (!DWfile.exists(fileurl))
				continue;	// don't show the item if it is not found.
			retArray[j] = new String(menuitemArray[i].getAttribute("name"));
			retArray[j] += ";id='"+id+"'"; // each item needs an ID
			j++;
		}
	}
	
	return retArray;
}
