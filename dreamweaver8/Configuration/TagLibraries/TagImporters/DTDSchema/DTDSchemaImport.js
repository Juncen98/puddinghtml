///////////////////////////////////////////////////////////////////////////////
//
// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.
//
// FileName: DTDSchemaImport.js
//
// Description: This is the implementation for Import DTD or Schema feature
//              available from the Tag Libraries dialog
//
///////////////////////////////////////////////////////////////////////////////

//******************GLOBAL VARIABLES*********************

var g_libPath                 = "TagLibraries.vtm";
var g_tagLibOpenPattern     = "<taglibrary name=\"@@NAME@@\" doctypes=\"XML,HTML\" prefix=\"<@@PREFIX@@:\" @@PREFIXISURI@@>";
var g_tagRefPattern         = "<tagref name=\"@@NAME@@\" file=\"@@LIBRARYNAME@@/@@NAME@@.vtm\"/>";
var g_tagLibClosePattern    = "</taglibrary>";
var g_tagPatternOpen        = "<tag name=\"@@NAME@@\" casesensitive=\"yes\"@@ENDTAG@@>\r\n";
var g_tagFormatPattern      = "	<tagformat indentcontents=\"yes\" formatcontents=\"yes\" nlbeforetag=\"1\" nlbeforecontents=\"0\" nlaftercontents=\"0\" nlaftertag=\"1\" />\r\n";
var g_tagPatternClose       = "</tag>";
var g_attrsOpenPattern	  = "	<attributes>\r\n";
var g_attrsClosePattern	  = "	</attributes>\r\n";
var g_attrPattern			  = "		<attrib name=\"@@NAME@@\" type=\"Enumerated\" casesensitive=\"yes\"/>\r\n";



var g_downloadFolder            = "ValidationFiles";

var helpDoc = MM.HELP_dtdImport;
//*************************API***************************

///////////////////////////////////////////////////////////////////////////////
//  Func Name: canImportTags
//
//  Purpose: Gets called from the Tag DataBase to allow a Tag Import Item to 
//          be disabled 
//      
//  Input Args: None  
//
//  Returns: boolean
//          True
//
///////////////////////////////////////////////////////////////////////////////

function canImportTags()
{
   return true;
}


///////////////////////////////////////////////////////////////////////////////
//  Func Name: importTags
//
//  Purpose: Gets called from the Tag DataBase dialog when the user clicks 
//          selects the XML DTD/Schema menu item from the "+" menu.  
//      
//  Input Args: None  
//
//  Returns: boolean
//          True if everything went well, false otherwise.
//
///////////////////////////////////////////////////////////////////////////////

function importTags()
{
  var libName = "";
  var libNodes;
  
  //It may take a few minutes at worst to complete introspecting all controls, 
  //  so set the WAIT cursor.
  MM.setBusyCursor();
  
  var fileURL = findObject('filePath').value;

	if (fileURL.length == 0)
	{
	  alert(errMsg(MSG_CHOOSEFILE));
		return false;
	}

  var downloaded = true;
  
  // if this is a remote URL, try to download it to Configuration/ValidationFiles
  if (fileURL.substring(0, 4).toLowerCase() == "http") {
    var localFile = dw.getConfigurationPath() + "/" + g_downloadFolder + "/" +
        fileURL.substring(fileURL.lastIndexOf("/")+1, fileURL.length);    
    var httpReply = MMHttp.getFile(fileURL, false);
    if (httpReply.statusCode == 200)
    {
      saveLoc = httpReply.data;    
      DWfile.copy(saveLoc, localFile);
      fileURL = localFile;
    }
    else
    {
      downloaded = false;
      alert(errMsg(MSG_REMOTENOTFOUND, httpReply.statusCode));
      return false;
    }
  }
  else
  {
    // it better be 'file://...' then
    if (fileURL.substring(0,7).toLowerCase() != "file://")
    {
      alert(errMsg(MSG_FILENAME));
      return false;
    }
  }
  
  if (! DWfile.exists(fileURL))
  {
  	alert(errMsg(MM.MSG_ShortFileNotFound));
  	return;
  }
  
	// tell the Tag Library to Import the DTD/Schema
	libName = dw.tagLibrary.importDTDOrSchema(fileURL, "");

  // if that was successful, we can now get the information from the tagLibrary
  // and write it to disk.

  if (libName.length == 0)
  {
    alert(errMsg(MSG_CREATELIBRARY));
    return;
  }
  
  // get the array of tags for this library
  var tagArray = dw.tagLibrary.getImportedTagList(libName);
  
  
  
  // if this is a DTD, use the filename as the library name.
  if (libName.lastIndexOf(".") != -1 && libName.substring(libName.lastIndexOf(".")).indexOf("dtd") != -1){
    libName = libName.substring(libName.lastIndexOf("/")+1);
    // remove whitespace from the libName
    libName = libName.replace(/\s+/,"");
  }

  libFolderName = dwscripts.stripInvalidVarChars(libName);

  addTagLibraryEntry("", libName, libFolderName, tagArray);
  
  //Reset Wait Cursor
  MM.clearBusyCursor();

  window.close();

  var retval = true;
  return retval;
}

//*******************LOCAL FUNCTIONS*********************

function initUI()
{
  findObject('filePath').focus();
}

function browseForDTDFile()
{
  // browse for the DTD or Schema file.
  var theFilter	= new Array(LABEL_DTDORSCHEMAFILTER, LABEL_DTDFILTER, LABEL_SCHEMAFILTER);
	var fileURL	= dw.browseForFileURL("open",MSG_CHOOSEFILE,false,false,theFilter);

  if (fileURL.length != 0)
  {
    var fileFld = findObject('filePath');
    fileFld.value = fileURL;
  }
}


///////////////////////////////////////////////////////////////////////////////
//  Func Name: addTagLibraryEntry
//
//  Purpose: Update the TAGLIBRARY tag in TagLibraries.vtm
//
//  Input Args:
//		prefix: tag prefix 
//		libName: name of library (could be schema URI)
//		libFolderName: name for library folder on disk
//		tagNodes: array of tags for this library  
//
//  Returns: boolean
//          True if everything went well, false otherwise.
//
///////////////////////////////////////////////////////////////////////////////

function addTagLibraryEntry(prefix, taglibName, libFolderName, tagNodes)
{
		var dom = dw.tagLibrary.getTagLibraryDOM("TagLibraries.vtm");
		// Insert the new tag just before the </taglibraries>
		var librariesTagArray = dom.getElementsByTagName("taglibraries");
		var libraryTagArray = dom.getElementsByTagName("taglibrary");

		// Look to see if this taglibrary already exists.  
		var tagLibExists = -1;

		for (i = 0; i < libraryTagArray.length; i++)
		{
			if (libraryTagArray[i].name == taglibName)
			{
				tagLibExists = i;
			}
		}

		// chances are, this is a targetNamespace
		var fileURL = findObject('filePath').value;
		if (prefix.length == 0 && taglibName.substring(0, 4).toLowerCase() == "http" && fileURL.substring(fileURL.length-4) == ".xsd")
			prefix = taglibName;
	
		if (prefix.length > 0 && prefix.charAt(prefix.length-1) != ":")
		{
		  prefix+=":";
		}

		var nameReplacePattern = /@@NAME@@/g;
		var prefixReplacePattern = /@@PREFIX@@:/g;
		var prefixIsURIReplacePattern = /@@PREFIXISURI@@/g;

		var newTagLib = g_tagLibOpenPattern.replace(nameReplacePattern, taglibName);	// this might have to be the real libname
		newTagLib = newTagLib.replace(prefixReplacePattern, prefix);
		
		var prefixIsURI = (prefix.length > 0) ? "prefixIsURI=\"true\"" : "";
		newTagLib = newTagLib.replace(prefixIsURIReplacePattern, prefixIsURI);

		// Check if there are tags in the list.
		if (tagNodes.length==0)
		{
		  alert(errMsg(MSG_NOTAGSFOUND));
			return;
		}

		//form the tag list.
		for (var i=0 ; i < tagNodes.length ; i++)
		{
      var newTagRef = g_tagRefPattern.replace(nameReplacePattern, tagNodes[i].tagName);
	  var libnameReplacePattern = /@@LIBRARYNAME@@/g;
      newTagRef	  = newTagRef.replace(libnameReplacePattern, libFolderName); 
      newTagLib	  = newTagLib + newTagRef;

      // build the tag file
      fileName = libFolderName + "/" + tagNodes[i].tagName + ".vtm";
      buildTag(tagNodes[i],fileName);
    }
      
		
		newTagLib = newTagLib + "\r\n" + g_tagLibClosePattern;

		if (tagLibExists == -1)
		{
			// add new library
			if (librariesTagArray.length > 0)
			librariesTagArray[0].innerHTML = librariesTagArray[0].innerHTML + newTagLib;
		}
		else
		{
			// update existing library
			var ret = confirm(errMsg(MM.MSG_UpdateTagLibrary,libraryTagArray[tagLibExists].name,libraryTagArray[tagLibExists].prefix));
			if (ret)
			{
				libraryTagArray[tagLibExists].outerHTML = newTagLib;
			}
			return ret;
		}
	
	return true;
}


///////////////////////////////////////////////////////////////////////////////
//  Func Name: buildTag(tagInfo,fileName)
//
//  Purpose:	This function walks the tldDom and import(add/update) the tag information
//				Name/TagName.vtm
//      
//  Input Args: tagInfo: current taginfo structure
//				fileName:the filename corresponding to tag.
//			
//
//  Returns: nothing
//
///////////////////////////////////////////////////////////////////////////////

//
function buildTag(tagInfo, fileName)
{
	var tagRefDom = dw.tagLibrary.getTagLibraryDOM(fileName);
  var attrArray = tagInfo.attributes;
	var namePatternStr		= /@@NAME@@/g;
	var endTagPatternStr = /@@ENDTAG@@/g;
	
	if (!tagRefDom)
	{
	  alert(errMsg(MSG_GENERIC_ERROR));
	  return;
	}

	var newAttrsString;
	newAttrsString = g_attrsOpenPattern;
	
  for (var i=0; i<attrArray.length; i++)
	{
    var attrString     = g_attrPattern.replace(namePatternStr, attrArray[i]);
    newAttrsString += attrString;
  }

	newAttrsString += g_attrsClosePattern;

	// tagInfo.hasEndTag may equal "true", "false", or "unknown"
	var endTag = "";
	if (tagInfo.hasEndTag == "true")
		endTag = " endtag=\"yes\"";
	else if (tagInfo.hasEndTag == "false")
		endTag = " endtag=\"no\"";

	// build the entire file.
	var newTagString = g_tagPatternOpen.replace(namePatternStr, tagInfo.tagName);
	newTagString = newTagString.replace(endTagPatternStr, endTag);
	newTagString += g_tagFormatPattern;
	newTagString += newAttrsString;
	newTagString += g_tagPatternClose;
	tagRefDom.documentElement.outerHTML = newTagString;
}
