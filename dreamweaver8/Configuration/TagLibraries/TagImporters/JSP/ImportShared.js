///////////////////////////////////////////////////////////////////////////////
//
// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.
//
// FileName: ImportShared.js
//
// Description: This is the implementation for some of the common JSP Import 
//              features 
//
///////////////////////////////////////////////////////////////////////////////

var tagLibOpenPattern     = "<taglibrary name=\"@@NAME@@\" filetypes=\"*.jsp\" prefix=\"<@@PREFIX@@:\" servermodel=\"JSP\" uri=\"@@URI@@\" id=\"@@PREFIX@@\">";
var tagRefPattern         = "<tagref name=\"@@NAME@@\" file=\"@@PREFIX@@/@@NAME@@.vtm\"/>";
var tagLibClosePattern    = "</taglibrary>";
var tagPatternOpen        = "<tag name=\"@@NAME@@\" @@BIND@@ casesensitive=\"yes\">\r\n";
var tagFormatPattern      = "	<tagformat indentcontents=\"yes\" formatcontents=\"yes\" nlbeforetag=\"1\" nlbeforecontents=\"0\" nlaftercontents=\"0\" nlaftertag=\"1\" />\r\n";
var tagPatternClose       = "</tag>";
var attrsOpenPattern	  = "	<attributes>\r\n";
var attrsClosePattern	  = "	</attributes>\r\n";
var attrPattern			  = "		<attrib name=\"@@NAME@@\" required=\"@@REQUIRED@@\" dynamic=\"@@DYNAMIC@@\" casesensitive=\"yes\"/>\r\n";

///////////////////////////////////////////////////////////////////////////////
//  Func Name: buildTagTree(tldDom,uri,prefix,isJST)
//
//  Purpose:This function walks the tldDom and import the taglibrary entries in the 
//			TagLibraries.vtm and for every tag creates references PrefixName/TagName.vtm.
//
//      
//  Input Args: tldDom : the dom containing the xml based tld.
//				uri :	 the uri reference for taglibrary.
//				prefix : the prefix for tld
//				isJST	: if we are currently using the jst folder.
//
//  Returns: boolean
//           True if everything went well, false otherwise.
//
///////////////////////////////////////////////////////////////////////////////

function buildTagTree(tldDom,uri,prefix,isJST)
{
	setBusyCursor();

	var taglibName;
	if (tldDom)
	{

		//Check to see if there are multiple tlds

		var errNodes	= tldDom.getElementsByTagName("ERROR");
		if (errNodes.length > 0)
		{
			var errMessage	= errNodes[0].getAttribute("Description");
			alert(errMessage);
			return false;
		}

		var taglibs = tldDom.getElementsByTagName("taglib")
		if (taglibs.length > 1)
		{
			alert(MM.MSG_JARCONTAINSMULTIPLETLDS);
			return false;
		}

		var dom = dw.tagLibrary.getTagLibraryDOM("TagLibraries.vtm");
		// Insert the new tag just before the </taglibraries>
		var librariesTagArray = dom.getElementsByTagName("taglibraries");
		var libraryTagArray = dom.getElementsByTagName("taglibrary");

		// Look to see if this taglibrary already exists.  
		var tagLibExists = -1;

		if (!prefix.length)
		{
			prefixNode	= tldDom.getElementsByTagName("shortname");
			if (!prefixNode.length)
			{
				prefixNode		= tldDom.getElementsByTagName("short-name");
			}
			if (prefixNode.length)
			{
				prefix		= prefixNode[0].innerHTML;
				prefix		= stripSpaces(prefix); //strip leading/trailing spaces.
				prefix		= prefix.replace(/\s+/g,"_"); //replace spaces with underscore.
			}
		}

		var prefixName = "<" + prefix;
		
		//add a prefix if it missing...
		if (prefixName.charAt(prefixName.length-1) != ":")
		{
			prefixName+=":";
		}

		for (i = 0; i < libraryTagArray.length; i++)
		{
			if (libraryTagArray[i].prefix == prefixName)
			{
				tagLibExists = i;
			}
		}

		if (prefix.charAt(prefix.length-1) == ":")
		{
			prefix = prefix.substring(0,prefix.length-1);
		}

		taglibName = prefix;

		var nameReplacePattern = /@@NAME@@/g;
		var prefixReplacePattern = /@@PREFIX@@/g;
		var uriReplacePattern = /@@URI@@/g;

		var newTagLib = tagLibOpenPattern.replace(nameReplacePattern, taglibName);
		newTagLib = newTagLib.replace(prefixReplacePattern, prefix);
		newTagLib = newTagLib.replace(uriReplacePattern, uri);

		var tagList = tldDom.getElementsByTagName("tag");

		//Check if there are tags in the list.
		if (tagList.length==0)
		{
			if (isJST)
			{
				alert(MM.MSG_JSTDoesNotContainTag);
			}
			else
			{
				alert(MM.MSG_TLDDoesNotContainTag);
			}
			return false;
		}

		//form the tag list.
		for (var i=0 ; i < tagList.length ; i++)
		{
			var cNodes = tagList[i].childNodes;
			if (cNodes && cNodes.length > 0)
			{
				if (cNodes[0].tagName == "NAME")
				{
					var newTagRef = tagRefPattern.replace(nameReplacePattern, cNodes[0].innerHTML);
					newTagRef	  = newTagRef.replace(prefixReplacePattern, prefix);
					newTagLib	  = newTagLib + newTagRef;
					//build the tag file
					fileName = prefix + "/" + cNodes[0].innerHTML + ".vtm";
					buildTag(tagList[i],cNodes[0].innerHTML,fileName);
				}
			}
		}
		
		newTagLib = newTagLib + "\r\n" + tagLibClosePattern;

		if (tagLibExists == -1)
		{
			//add case
			if (librariesTagArray.length > 0)
			librariesTagArray[0].innerHTML = librariesTagArray[0].innerHTML + newTagLib;
		}
		else
		{
			//update case
			var ret = confirm(errMsg(MM.MSG_UpdateTagLibrary,libraryTagArray[tagLibExists].name,libraryTagArray[tagLibExists].prefix));
			if (ret)
			{
				libraryTagArray[tagLibExists].outerHTML = newTagLib;
			}
			return ret;
		}
	}

	restoreCursor();
	return true;
}

///////////////////////////////////////////////////////////////////////////////
//  Func Name: buildTag(tagNode,tagName,fileName)
//
//  Purpose:	This function walks the tldDom and import(add/update) the tag information
//				Name/TagName.vtm
//      
//  Input Args: tagNode:the node current being added/updated
//				tagName:the tagname
//				fileName:the filename corresponding to tag.
//			
//
//  Returns: nothing
//
///////////////////////////////////////////////////////////////////////////////

//
function buildTag(tagNode,tagName,fileName)
{
	var tagRefDom = dw.tagLibrary.getTagLibraryDOM(fileName);
	attrArray = tagRefDom.getElementsByTagName("attributes");
	var tagDomExists = false;

	if (attrArray && attrArray.length)
	{
		tagDomExists = 	true;
	}

	var namePatternStr		= /@@NAME@@/g;
	var bindPatternStr		= /@@BIND@@/g;
	var requiredPatternStr	= /@@REQUIRED@@/g;
	var dynamicPatternStr	= /@@DYNAMIC@@/g;

	var newAttrsString;
	newAttrsString = attrsOpenPattern;
	var cNodes = tagNode.childNodes;
	for (var i=0; i < cNodes.length; i++)
	{
		if (cNodes[i].tagName == "ATTRIBUTE")
		{
			var attrChildNodes	= cNodes[i].childNodes;

			var attrName;
			var required;
			var dynamicExpr;

			var attrNameNode=null;
			var dynamicExprNode=null;
			var requiredNode=null;

			for (var cIndex = 0 ; cIndex < attrChildNodes.length; cIndex++)
			{
				var attrtagName = attrChildNodes[cIndex].tagName;
				if (attrtagName)
				{
					attrtagName = attrtagName.toLowerCase();
					if (attrtagName == "name")
					{
						attrName		= attrChildNodes[cIndex].innerHTML;
					}
					else if (attrtagName == "rtexprvalue")
					{
						dynamicExpr		= attrChildNodes[cIndex].innerHTML;
					}
					else if (attrtagName == "required")
					{
						required = attrChildNodes[cIndex].innerHTML;
					}
				}
			}
			var attrString     = attrPattern.replace(namePatternStr, attrName);
			attrString		   = attrString.replace(requiredPatternStr, required);
			attrString		   = attrString.replace(dynamicPatternStr, dynamicExpr);
			newAttrsString += attrString;
		}
	}
	newAttrsString += attrsClosePattern;

	if (tagDomExists)
	{
		//update the attributes section selectively.
		attrArray[0].outerHTML = newAttrsString;
		var newTagString = tagRefDom.documentElement.outerHTML;
		tagRefDom.documentElement.outerHTML = newTagString;
	}
	else
	{
		//build the entire file.
		var newTagString = tagPatternOpen.replace(namePatternStr, tagName);
		newTagString = newTagString.replace(bindPatternStr, "");
		newTagString += tagFormatPattern;
		newTagString += newAttrsString;
		newTagString += tagPatternClose;
		tagRefDom.documentElement.outerHTML = newTagString;
	}
}

///////////////////////////////////////////////////////////////////////////////
//  Func Name: checkFileExtension(fileName)
//
//  Purpose:	Check if the file Extension is tld/jar/zip
//
//  Input Args: filename pointing to tld/jar/zip
//
//  Returns: boolean 
//			 true the fileExtension contains tld/jar/zip
//
///////////////////////////////////////////////////////////////////////////////
function checkFileExtension(fileName)
{
	var extIndex		= fileName.lastIndexOf(".");
	if (extIndex != -1)
	{
		var extension = fileName.substring(extIndex+1);
		if ((extension == "tld") || (extension == "jar") || (extension == "zip"))
		{
			return true;			
		}
	}

	return false;
}

///////////////////////////////////////////////////////////////////////////////
//  Func Name: checkIsValidPrefix(prefix)
//
//  Purpose:	Check if the file prefix is valid name and not a reserved
//
//  Input Args: prefix
//
//  Returns: errMsg
//			 if blank there is no error.
//
///////////////////////////////////////////////////////////////////////////////
//Check if the entered prefix is valid
function checkIsValidPrefix(prefix)
{
	var errMsg = "";

	if (prefix.length)
	{
		if (prefix.charAt(prefix.length-1) == ":")
		{
			prefix = prefix.substring(0,prefix.length-1);
		}

		// Dashes are allowed in a tag prefix name, but they're rejected by
		// IsValidVarName.  Replace the dashes with underscores, which the
		// IsValidVarName function will accept.
		var prefixWithoutDashes = prefix.replace("-", "_");

		if (!IsValidVarName(prefixWithoutDashes))
		{
			errMsg = MM.MSG_JspPrefixInvalidName;		
			return errMsg;
		}		
		else 
		{
			if ((prefix == "jsp") ||
				(prefix == "jspx") ||
				(prefix == "java") ||
				(prefix == "javax") ||
				(prefix == "sun") ||
				(prefix == "sunw"))
			{
				errMsg = MM.MSG_JspPrefixReserved;
				return errMsg;
			}
		}
	}

	return errMsg;
}
