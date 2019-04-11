///////////////////////////////////////////////////////////////////////////////
//
// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.
//
// FileName: ImportFromFolder.js
//
// Description: This is the implementation for JSP Import From Folder 
//             feature available from the Tag Libraries dialog
//
///////////////////////////////////////////////////////////////////////////////

//*************** GLOBALS VARS *****************

var helpDoc         = MM.HELP_tiImportTLDFolder;

//******************* API **********************


var LOCOBJ;				//location of the .jst folder
var PREFIXOBJ;			//prefix for the tag library.
var URIOBJ;				//uri for the tag library

var tldDom;				//dom for the tld.
var tldData="";			//tld text for the tld.

var jsptagLibOpenPattern     = "<taglib>\r\n";
var jsptagLibClosePattern    = "</taglib>";
var jsptagPatternOpen        = "<tag>\r\n";
var jsptagPatternClose       = "</tag>\r\n";
var jspattrOpenPattern		 = "<ATTRIBUTE>\r\n";
var jspattrClosePattern		 = "</ATTRIBUTE>\r\n";
var jspnameOpenPattern		 = "<name>";
var jspnameClosePattern		 = "</name>\r\n";
var jsprequiredOpenPattern	 = "<required>";
var jsprequiredClosePattern	 = "</required>\r\n";
var jsprtexprOpenPattern	 = "<rtexprvalue>";
var jsprtexprClosePattern	 = "</rtexprvalue>\r\n";
var jspPrefixPattern		 = "<shortname>@@PREFIX@@</shortname>\r\n";
var jspInfoPattern			 = "<info>@@NAME@@</info>\r\n";


//******************* API **********************
///////////////////////////////////////////////////////////////////////////////
//  Func Name: canImportTags
//
//  Purpose: Gets called from the Tag DataBase to allow a Tag Import Item to 
//           be disabled 
//      
//  Input Args: None  
//
//  Returns: boolean
//           True if the Site is an JSP site and if there's a remote folder.
//
///////////////////////////////////////////////////////////////////////////////

function canImportTags()
{
  /* 
    Ensure that the ServerModel is JSP and that there's a server to introspect from.
  */
  var retVal  = true;
  return retVal;
}

///////////////////////////////////////////////////////////////////////////////
//  Func Name: importTags
//
//  Purpose: Gets called from the Tag DataBase dialog when the user clicks 
//           selects the JSP\ImportFromFolder menu item from the Plus Menu.  
//      
//  Input Args: None  
//
//  Returns: boolean
//           True if everything went well, false otherwise.
//
///////////////////////////////////////////////////////////////////////////////


function importTags()
{
  //TO DO is check for duplicate entries:-
  var errMessage = validateInput();
  if (!errMessage.length)
  {
    // Add a colon to the end of the prefix, if it's not already there
    var prefix = PREFIXOBJ.value;
    if (prefix.length > 0 && prefix[prefix.length-1] != ':')
    {
      prefix = prefix + ":";
    }

	tldData = "";
	buildJSPTLD(LOCOBJ.value);
	tldDom			= dw.getDocumentDOM(dw.getConfigurationPath() + '/Shared/MM/Cache/empty.htm');	
	tldDom.documentElement.outerHTML = tldData;
	var status = buildTagTree(tldDom,URIOBJ.value,prefix,true);	
	return status;
  }
  else
  {
	alert(errMessage);
  }
  return false;
}


//***************** LOCAL FUNCTIONS  ******************
///////////////////////////////////////////////////////////////////////////////
//  Func Name: initializeUI
//
//  Purpose: Event handler for the form onLoad event.Initialize ui elements
//			
//  Input Args: None  
//
//  Returns: Nothing
//
///////////////////////////////////////////////////////////////////////////////


function initializeUI() {

  LOCOBJ	= findObject("location");
  URIOBJ	= findObject("uri");
  PREFIXOBJ = findObject("prefix");

  LOCOBJ.focus();
  LOCOBJ.select();
}


///////////////////////////////////////////////////////////////////////////////
//  Func Name: onBrowseButton
//
//  Purpose: browse the file system for jst folder
//			
//  Input Args: None  
//
//  Returns: Nothing
//
///////////////////////////////////////////////////////////////////////////////

function onBrowseButton()
{
	var aFolderName = dw.browseForFolderURL(MM.LABEL_GetJSTFolderName,dw.getSiteRoot());

	if (!aFolderName.length)
	{
		return;
	}

	//Initialize the type library dom.
	LOCOBJ.value = aFolderName;
}

///////////////////////////////////////////////////////////////////////////////
//  Func Name: buildJSPTLD
//
//  Purpose: walks the folder to read in .jst files and parse them to 
//			 a tld out of them , add new tags and parse for attribute info.
//			
//  Input Args: foldername where the jst resides.  
//
//  Returns: Nothing
//
///////////////////////////////////////////////////////////////////////////////

function buildJSPTLD(folderName)
{	
	var list = DWfile.listFolder(folderName,"files");
	tldData += jsptagLibOpenPattern;

	var prefixReplacePattern = /@@PREFIX@@/g;
	var prefixString = jspPrefixPattern.replace(prefixReplacePattern,PREFIXOBJ.value);
	tldData += prefixString;

	var nameReplacePattern = /@@NAME@@/g;
	var nameString = jspInfoPattern.replace(nameReplacePattern,PREFIXOBJ.value);
	tldData += nameString;

	for (var i=0; i < list.length ; i++)
	{
		var filename = folderName + list[i];

		//check for .jst files only.
		var extIndex		= list[i].lastIndexOf(".");
		if (extIndex != -1)
		{
			var extension = list[i].substring(extIndex+1);
			if (extension != "jst")
			{
				continue;
			}
		}

		tldData += jsptagPatternOpen;
		tldData += jspnameOpenPattern;

		var dotIndex = list[i].indexOf(".");
		if (dotIndex != -1)
		{
			var tagName = list[i].substring(0,dotIndex);
		}

		tldData += tagName;
		tldData += jspnameClosePattern;
		var inStr		 = DWfile.read(filename);
		var callbackObj = new Object();
		callbackObj.directive  = TLD_directive;
		dreamweaver.scanSourceString(inStr, callbackObj);
		tldData += jsptagPatternClose;
	}
	tldData += jsptagLibClosePattern;
}

///////////////////////////////////////////////////////////////////////////////
//  Func Name: TLD_directive
//
//  Purpose: callback to process the directive node from jst file i.e<%..%>
//			 extracts the name,required , dynamic expression
//			
//  Input Args: code snippets
//
//  Returns: Nothing
//
///////////////////////////////////////////////////////////////////////////////

function TLD_directive(code)
{
	if (code.indexOf("tagAttribute") != -1)
	{
		tldData += jspattrOpenPattern;

		var i = code.search(/name="([^"]*)"/i);
		if (i != -1)
		{
			tldData += jspnameOpenPattern;
			tldData += RegExp.$1;
			tldData += jspnameClosePattern;
		}

		var i = code.search(/required="([^"]*)"/i);
		if (i != -1)
		{
			tldData += jsprequiredOpenPattern;
			tldData += RegExp.$1;
			tldData += jsprequiredClosePattern;
		}

		var i = code.search(/rtexpr="([^"]*)"/i);
		if (i != -1)
		{
			tldData += jsprtexprOpenPattern;
			tldData += RegExp.$1;
			tldData += jsprtexprClosePattern;
		}

		//if rtexpr failed try to check rtexp
		if (i==-1)
		{
			var i = code.search(/rtexp="([^"]*)"/i);
			if (i != -1)
			{
				tldData += jsprtexprOpenPattern;
				tldData += RegExp.$1;
				tldData += jsprtexprClosePattern;
			}
		}

		tldData += jspattrClosePattern;
	}
}

///////////////////////////////////////////////////////////////////////////////
//  Func Name: validateInput
//
//  Purpose: validates the user input for missing fields and valid file extension
//			 prefix string.
//			 
//  Input Args: None  
//
//  Returns: an error string
//
///////////////////////////////////////////////////////////////////////////////

function validateInput()
{
	var errMessage = "";

	if (URIOBJ.value.length == 0)
	{
		errMessage = MM.MSG_URIMissing;
	}
	else if (PREFIXOBJ.value.length == 0)
	{
		errMessage = MM.MSG_PrefixMissing;
	}
	else if (PREFIXOBJ.value.match(/\s/))
	{
		errMessage = MM.MSG_JspPrefixInvalidName;
	}
	else if (LOCOBJ.value.length == 0)
	{
		errMessage = MM.MSG_JSTFolderName;
	}
	else
	{
		errMessage  = checkIsValidPrefix(PREFIXOBJ.value);
	}

	return errMessage;
}
