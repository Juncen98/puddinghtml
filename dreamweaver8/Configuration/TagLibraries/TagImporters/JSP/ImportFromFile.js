///////////////////////////////////////////////////////////////////////////////
//
// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.
//
// FileName: ImportFromFile.js
//
// Description: This is the implementation for JSP Import From File 
//             feature available from the Tag Libraries dialog
//
///////////////////////////////////////////////////////////////////////////////

//*************** GLOBALS VARS *****************

var helpDoc				  = MM.HELP_tiImportTLDFile;

var LOCOBJ;				//location of the .tld/.jar
var PREFIXOBJ;			//prefix for the tag library.
var URIOBJ;				//uri for the tag library

var tldDom;				//dom for the tld.

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
//           selects the JSP\ImportFromFile menu item from the Plus Menu.  
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

    var status = buildTagTree(tldDom,URIOBJ.value,prefix,false);	
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
//  Purpose: browse the file system for .tld,.jar,.zip and retrieves the tld.
//			
//  Input Args: None  
//
//  Returns: Nothing
//
///////////////////////////////////////////////////////////////////////////////

function onBrowseButton()
{
	var theFilter		= new Array("Tag Library Files (*.tld, *.jar, *.zip)|*.tld;*.jar;*.zip|Tag Library Files|","TLD (*.tld)|*.tld|TLD|", "JAR (*.jar)|*.jar|JAR|","ZIP (*.zip)|*.zip|ZIP|");
	var tldFileName		= dw.browseForFileURL("open",MM.LABEL_GetTLDPackageName,false,false,theFilter);

	if (!tldFileName.length)
	{
		return;
	}

	if (!checkFileExtension(tldFileName))
	{
		alert(MM.MSG_JSPFileExtension);
		return;
	}

	setBusyCursor();
	var location		= MMNotes.localURLToFilePath(tldFileName);
    var tldData			= MMJB.getTLD(location);

	if (!tldData.length)
	{
		alert(MM.MSG_JARDoesNotContainTLD);
		LOCOBJ.value		= "";
		URIOBJ.value		= "";
		PREFIXOBJ.value		= "";
		return;
	}

	//Initialize the type library dom.
	LOCOBJ.value		= location;
	tldDom			= dw.getDocumentDOM(dw.getConfigurationPath() + '/Shared/MM/Cache/empty.htm');	
	tldDom.documentElement.outerHTML = tldData;

	//Initialize the uri field
	var uriNode		= tldDom.getElementsByTagName("uri");
	if (uriNode.length)
	{
		if (uriNode[0].innerHTML.length)
			URIOBJ.value		= uriNode[0].innerHTML;
		else
			URIOBJ.value		= "";
	}

	//Initialize the prefix field
	var prefixNode		= tldDom.getElementsByTagName("shortname");
	if (!prefixNode.length)
	{
		prefixNode		= tldDom.getElementsByTagName("short-name");
	}
	if (prefixNode.length)
	{
		var prefix  = prefixNode[0].innerHTML;
		prefix		= stripSpaces(prefix); //strip leading/trailing spaces.
		prefix		= prefix.replace(/\s+/g,"_"); //replace spaces with underscore.
		PREFIXOBJ.value		= prefix;
	}
	restoreCursor();
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
		errMessage = MM.MSG_TLDPackageName;
	}
	else if (!checkFileExtension(LOCOBJ.value))
	{
		errMessage = MM.MSG_JSPFileExtension;
	}
	else
	{
		errMessage  = checkIsValidPrefix(PREFIXOBJ.value);
	}

	return errMessage;
}

