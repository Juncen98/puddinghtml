///////////////////////////////////////////////////////////////////////////////
//
// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.
//
// FileName: ASPNetImportCommon.js
//
// Description: This is the implementation for some of the common ASPNet Import 
//              features 
//
///////////////////////////////////////////////////////////////////////////////


//****************** COMMON FUNCTIONS *********************

///////////////////////////////////////////////////////////////////////////////
//  Func Name: displayHTTPError
//
//	Purpose: Displays an appropriate error based on the status code of the
//			 failed request.
//
///////////////////////////////////////////////////////////////////////////////

function displayHTTPError(statusCode)
{
	if (statusCode == 12002)
		alert(MM.MSG_ImportHTTPTimeout);
	else
	    alert(errMsg(MM.MSG_ImportHTTPError, statusCode));
}

///////////////////////////////////////////////////////////////////////////////
//  Func Name: namespaceExists
//
//  Purpose: Checks to see if the given namespace exists in the TagLibrary 
//      
//  Input Args: 
//      nameSpace: The namespace to search for in the tag library.
//      libNodes:  List of TAGLIBRARY Tag nodes.
//
//  Returns: boolean
//          True if the namespace is found.
//
///////////////////////////////////////////////////////////////////////////////

function namespaceExists(nameSpace, libNodes)
{
  var ret = false;
  
  for(var i=0; i<libNodes.length; i++)
  {
    if (libNodes[i].name == nameSpace) {
      ret = true;
    }
  }
  return ret;
}


///////////////////////////////////////////////////////////////////////////////
//  Func Name: createNewNamespace
//
//  Purpose: Add a TAGLIBRARY tag to TagLibraries.vtm with info from the 
//           xml document returned from the server. 
//      
//  Input Args: 
//      tagNode: The namespace node from the xml document returned from the 
//               server.
//
//  Returns: Nothing
//
///////////////////////////////////////////////////////////////////////////////

function createNewNamespace(tagNode)
{
  var cNodes = g_libDom.getElementsByTagName("TAGLIBRARIES");
  
  // We know for sure there's only one TAGLIBRARIES element, hence use 0.
  var iHTML = cNodes[0].innerHTML;

  // Set the Namespace and format the line.
  var tagReplacePattern = /@@NAME@@/g;
  var newTagLib = g_tagLibOpenPattern.replace(tagReplacePattern, tagNode.NAMESPACE);
  newTagLib = newTagLib + "\r\n" + g_tagLibClosePattern;

  // Add a new line char to the end 
  iHTML = iHTML + "\r\n" + newTagLib;
  cNodes[0].innerHTML = iHTML;
}


///////////////////////////////////////////////////////////////////////////////
//  Func Name: updateTagRefEntry
//
//  Purpose: Update the Tag Ref .vtm file 
//      
//  Input Args: 
//      tagNode:  Tag Node with info to update the Tag .VTM file with.
//
//  Returns: Nothing
//
///////////////////////////////////////////////////////////////////////////////

function updateTagRefEntry(tagNode)
{
  var cNodes = g_libDom.getElementsByTagName("TAGLIBRARY")
  var cTagRefNodes;
  var nodeIndex = -1;
  var tagRefIndex = -1;
  var tagRefFileName = ""
  var tagRefDom;
  var iHTML;

  for(var i=0; i<cNodes.length; i++)
  {
    if(cNodes[i].name == tagNode.NAMESPACE)
    { 
      nodeIndex = i;
      break;
    }
  }

  if(nodeIndex >= 0)
  {
    // Get the Tag Ref objects from the selected TagLibrary. 
    cTagRefNodes = cNodes[nodeIndex].childNodes;

    // Iterate through the list to find out if it already exists.
	var namePattern = new RegExp("^" + tagNode.name + "$", "i");
    for( var j=0; j < cTagRefNodes.length; j++) {
      if(cTagRefNodes[j].name.search(namePattern) != -1) {
        tagRefIndex = j;
        break;
      }
    }
    
    if(tagRefIndex >= 0) {
      
      // An entry already exists for the tag. Just get the filename....
      tagRefFileName = cTagRefNodes[tagRefIndex].file;

    } else {

      // This is a new tag. We will need to create an entry.
      iHTML = cNodes[nodeIndex].innerHTML;
      var tagRefNamePattern = /@@NAME@@/g;
      var newTagRef = g_tagRefPattern.replace(tagRefNamePattern, tagNode.name);
      tagRefFileName = g_subFolderName + tagNode.name + ".vtm"
      iHTML = iHTML + newTagRef + "\r\n";
      cNodes[nodeIndex].innerHTML = iHTML;
    }

  } else {
    // Something bad happened. We got here without a namespace being created. Don't do anything.
    return;
  }

  // OK, now on to the individual VTM file...

  // Form the url to the tag ref file.
  var fileName = 'ASPNet/' + tagRefFileName;

  // Get the DOM for the specified Tag file.    
  tagRefDom = dw.tagLibrary.getTagLibraryDOM(tagRefFileName);

  var tagPatternStr = /@@NAME@@/g;

  // Note: We may have to do something special with the BIND/CASESENSITIVE.
  var tag2PatternStr = /@@BIND@@/g;
  var tag3PatternStr = /@@CASESENSITIVE@@/g;

  var newTagString = g_tagPatternOpen.replace(tagPatternStr, tagNode.name);
  newTagString = newTagString.replace(tag2PatternStr, "");
  newTagString = newTagString.replace(tag3PatternStr, "");
  
  newTagString += g_tagPatternClose;

  tagRefDom.documentElement.outerHTML = newTagString;

  // Build up the Tag Information 
  var tNodes = tagRefDom.getElementsByTagName("TAG");

  if(tNodes.length > 0) {

    var sourceAttrNodes = tagNode.getElementsByTagName("ATTRIBUTES");
    var sourceAttrCatNodes = tagNode.getElementsByTagName("ATTRIBCATEGORIES");

    tNodes[0].innerHTML = g_tagFormatPattern + sourceAttrNodes[0].outerHTML;

    if (sourceAttrCatNodes.length > 0)
    {
      tNodes[0].innerHTML += sourceAttrCatNodes[0].outerHTML;
    }
  }
}
