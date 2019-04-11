///////////////////////////////////////////////////////////////////////////////
//
// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.
//
// FileName: ASPNetImportAll.js
//
// Description: This is the implementation for ASPNet Import All Tags feature
//              available from the Tag Libraries dialog
//
///////////////////////////////////////////////////////////////////////////////

//******************GLOBAL VARIABLES*********************

var g_libPath                 = "TagLibraries.vtm";
var g_localIntrospectionPath  = "TagLibIntrospection/ASPNet/";
var g_remoteIntrospectionPath = "_mmServerScripts/"
var g_introspectionFileName   = "introspect.aspx"
var g_tagLibOpenPattern       = "<taglibrary name=\"@@NAME@@\" DOCTYPES=\"ASP.NET_CSharp,ASP.NET_VB\" prefix=\"<@@NAME@@:\" servermodel=\"ASPNet\">"
var g_tagRefPattern           = "<tagref name=\"@@NAME@@\" file=\"ASPNet/@@NAME@@.vtm\"/>"
var g_tagLibClosePattern      = "</taglibrary>"
var g_tagPatternOpen          = "<tag name=\"@@NAME@@\" endtag=\"xml\" tagtype=\"nonempty\" @@BIND@@ @@CASESENSITIVE@@>\r\n"
var g_tagFormatPattern        = "<tagformat indentcontents=\"yes\" formatcontents=\"yes\" nlbeforetag=\"1\" nlbeforecontents=\"0\" nlaftercontents=\"0\" nlaftertag=\"1\" />\r\n"
var g_tagPatternClose         = "</tag>"
var libFileName;
var g_libDom;
var g_subFolderName           = "ASPNet/"
var g_remotePath;

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
//          True if the Site is an ASPNet site and if there's a remote folder.
//
///////////////////////////////////////////////////////////////////////////////

function canImportTags()
{
  // Refuse to translate if the document's server model is not ASP.NET
  if (site.getServerModelNameForSite() != "ASP.NET")
  {
    alert(MM.MSG_ASPNETSiteMissing);
	return false;
  }

  // And ensure that the site has a remote folder.
  if (!site.remoteIsValid())
  {
    alert(MM.MSG_ASPNETServerMissing);
	return false;
  }

  return true;
}

///////////////////////////////////////////////////////////////////////////////
//  Func Name: importTags
//
//  Purpose: Gets called from the Tag DataBase dialog when the user clicks 
//          selects the ASPNet\ImportAll menu item from the Plus Menu.  
//      
//  Input Args: None  
//
//  Returns: boolean
//          True if everything went well, false otherwise.
//
///////////////////////////////////////////////////////////////////////////////

function importTags()
{
  var retVal = false;
  var libNodes;
  
  //It may take a few minutes at worst to complete introspecting all controls, 
  //  so set the WAIT cursor.
  MM.setBusyCursor();

  // Note: This function should change to use Randy's javascript support for 
  // site info.
  g_remotePath = site.getAppURLPrefixForSite() + 
    g_remoteIntrospectionPath + g_introspectionFileName;

  // Post the Introspection File and then hit it with a http request.
  var httpReply = MMHttp.postText(g_remotePath, 
    "mode=introspectAllSources", "application/x-www-form-urlencoded","", 
    g_localIntrospectionPath);

  if(httpReply.statusCode == 200)
  {
    // We're going to use an empty file to temporarily cache the data
    // obtained from the httpReply. This empty.html file should exist.
    var tempFilename = dw.getConfigurationPath() + '/Shared/MM/Cache/empty.htm';

    // If the file doesn't exist, bail. It is very unlikely that this situation
    // will occur. 
    if (DWfile.exists(tempFilename)) 
    {
      g_libDom = dw.tagLibrary.getTagLibraryDOM(g_libPath);
      libNodes = g_libDom.getElementsByTagName("TAGLIBRARY");

      var tempDom = dw.getDocumentDOM(tempFilename);  
      tempDom.documentElement.outerHTML = httpReply.data;
        
      var tagNodes = tempDom.getElementsByTagName("TAG");
        
      for(var i=0; i<tagNodes.length; i++) {

        // Check if there's a tag library corresponding to the namespace. 
        if (!namespaceExists(tagNodes[i].NAMESPACE, libNodes)) {

          // If the name space does not exist in the TagLibrary, add a new entry for it. 
          createNewNamespace(tagNodes[i]);
           
          // Update the libNodes as the g_libDom has been updated.
          libNodes = g_libDom.getElementsByTagName("TAGLIBRARY");
        } 

        // Update the tag Ref Entry. If it doesn't exist, this function will 
        // create it. It will also update/create the tag reference file as well. 
        updateTagRefEntry(tagNodes[i]);
      }
    
      var cNodes = g_libDom.getElementsByTagName("TAGLIBRARIES");
      retVal = true;
    } else {
      // We need an appropriate error message here... 
      
	  // We should not really get here, as it would mean, either the user's UD installation
      //   is messed up, or the user has deleted empty.htm. We absolutely need that file 
      //   to work correctly. 
    }

  } else {
    // An HTTP error occured. Display the http error message. 
    displayHTTPError(httpReply.statusCode);
  }
  //Reset Wait Cursor
  MM.clearBusyCursor();

  window.close();

  return retVal;
}

//*******************LOCAL FUNCTIONS*********************

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
//          xml document returned from the server. 
//      
//  Input Args: 
//      tagNode: The namespace node from the xml document returned from the 
//          server.
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
    if(cNodes[i].NAME == tagNode.NAMESPACE)
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
    for( var j=0; j < cTagRefNodes.length; j++) {
      if(cTagRefNodes[j].Name == tagNode.Name) {
        tagRefIndex = j;
        break;
      }
    }
    
    if(tagRefIndex >= 0) {
      
      // An entry already exists for the tag. Just get the filename....
      tagRefFileName = cTagRefNodes[tagRefIndex].File;

    } else {

      // This is a new tag. We will need to create an entry.
      iHTML = cNodes[nodeIndex].innerHTML;
      var tagRefNamePattern = /@@NAME@@/g;
      var newTagRef = g_tagRefPattern.replace(tagRefNamePattern, tagNode.NAME);
      tagRefFileName = g_subFolderName + tagNode.NAME + ".vtm"
      iHTML = iHTML + newTagRef + "\r\n";
      cNodes[nodeIndex].innerHTML = iHTML;
    }

  } else {
    // Something bad happened. We got here without a namespace being created. Don't do anything.
    return;
  }

  // OK, now on to the individual VTM file...

  // Form the url to the tag ref file.
  var fileName = 'TagLibraries/ASPNet/' + tagRefFileName;

  // Get the DOM for the specified Tag file.    
  tagRefDom = dw.tagLibrary.getTagLibraryDOM(tagRefFileName);

  var tagPatternStr = /@@NAME@@/g;

  // Note: We may have to do something special with the BIND/CASESENSITIVE.
  var tag2PatternStr = /@@BIND@@/g;
  var tag3PatternStr = /@@CASESENSITIVE@@/g;

  var newTagString = g_tagPatternOpen.replace(tagPatternStr, tagNode.NAME);
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
