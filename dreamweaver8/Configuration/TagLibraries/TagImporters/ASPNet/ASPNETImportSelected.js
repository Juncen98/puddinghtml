///////////////////////////////////////////////////////////////////////////////
//
// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.
//
// FileName: ASPNetImportSelected.js
//
// Description: This is the implementation for ASPNet Import Selected Tags 
//             feature available from the Tag Libraries dialog
//
///////////////////////////////////////////////////////////////////////////////

//******************GLOBAL VARIABLES*********************

var helpDoc                   = MM.HELP_aspnetImportSelected;
var g_tagList                 = new Array();
var g_selectObj;

var g_libPath                 = "TagLibraries.vtm"
var g_localIntrospectionPath  = "TagLibIntrospection/ASPNet/";
var g_remoteIntrospectionPath = "_mmServerScripts/"
var g_introspectionFileName   = "introspect.aspx"
var g_tagLibOpenPattern       = "<taglibrary name=\"@@NAME@@\" DOCTYPES=\"ASP.NET_CSharp,ASP.NET_VB\" prefix=\"<@@NAME@@:\" servermodel=\"ASPNet\">"
var g_tagRefPattern           = "<tagref name=\"@@NAME@@\" file=\"ASPNet/@@NAME@@.vtm\"/>"
var g_tagLibClosePattern      = "</taglibrary>"
var g_tagPatternOpen          = "<tag name=\"@@NAME@@\" endtag=\"xml\" tagtype=\"nonempty\" @@BIND@@ @@CASESENSITIVE@@>\r\n"
var g_tagFormatPattern        = "<tagformat indentcontents=\"yes\" formatcontents=\"yes\" nlbeforetag=\"1\" nlbeforecontents=\"0\" nlaftercontents=\"0\" nlaftertag=\"1\" />\r\n"
var g_tagPatternClose         = "</tag>"
var g_libDom;
var g_subFolderName           = "ASPNet/"
var remotePath;

//*************************API***************************

///////////////////////////////////////////////////////////////////////////////
//  Func Name: canImportTags
//
//  Purpose: Gets called from the Tag DataBase to allow a Tag Import Item to 
//           be disabled 
//      
//  Input Args: None  
//
//  Returns: boolean
//           True if the Site is an ASPNet site and if there's a remote folder.
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
//           selects the ASPNet\ImportSelected menu item from the Plus Menu.  
//      
//  Input Args: None  
//
//  Returns: boolean
//           True if everything went well, false otherwise.
//
///////////////////////////////////////////////////////////////////////////////

function importTags()
{
  var retVal = false;
  var libNodes;

  //It may take a few minutes at worst, to complete this task, so set a busy
  //  cursor.
  MM.setBusyCursor();

  var selectionList = buildSelectionList();
  
  // Post the introspection file on the server and hit with a http request 
  //   along with the user's selection.
  var httpReply = MMHttp.postText(remotePath, 
    "mode=introspectSomeSources&sources=" + selectionList, 
    "application/x-www-form-urlencoded","",
    g_localIntrospectionPath );

  if(httpReply.statusCode == 200)
  {
    // We're going to use a file to temporarily cache the data obtained from the 
    //   httpReply. The empty.htm file should exist. 
    var tempFilename = dw.getConfigurationPath() + '/Shared/MM/Cache/empty.htm';

    // If it doesn't, bail. It is very unlikely that this file would be missing.
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
            
          // If name space does not exist in the TagLibrary, add a new entry for it. 
          createNewNamespace(tagNodes[i]);

          // Update the libNodes as the g_libDom has been updated.
          libNodes = g_libDom.getElementsByTagName("TAGLIBRARY");
        } 

        // Update the tag Ref Entry. If it doesn't exist, this function will 
        //   create         //   it. It will also update/create the tag reference file as well. 
        updateTagRefEntry(tagNodes[i]);

      }// end for
    
      var cNodes = g_libDom.getElementsByTagName("TAGLIBRARIES");

    } else {
      // We need an appropriate error message here... 

      // We should not really get here, as it would mean, either the user's 
      //   UD installation is messed up, or the user has deleted empty.htm. 
      //   We absolutely need that file to work correctly. 
    }
    retVal = true;
  } else {
    // An HTTP error occured. Display the http error message. 
    displayHTTPError(httpReply.statusCode);
  }
  
  //Reset cursor
  MM.clearBusyCursor();

  return retVal;
}

//*******************LOCAL FUNCTIONS*********************

///////////////////////////////////////////////////////////////////////////////
//  Func Name: initializeUI
//
//  Purpose: Event handler for the form onLoad event. Populate the
//           list with available remote ASCX files and assemblies.
//      
//  Input Args: None  
//
//  Returns: Nothing
//
///////////////////////////////////////////////////////////////////////////////

function initializeUI()
{
  remotePath = site.getAppURLPrefixForSite() + 
    g_remoteIntrospectionPath + g_introspectionFileName;

  g_selectObj = new ListControl("SelectList");

  // Build the list of available ASCX and DLL files.
  buildList();
}


///////////////////////////////////////////////////////////////////////////////
//  Func Name: buildList
//
//  Purpose: Build the list of ASCX and DLL files that can be introspected.
//             To do this, we put the introspection file on the server and then
//             hit it with a http request. The HTTP reply will be an xml 
//             stream that contains the list of available assemblies (ASCX and
//             DLL files)
//      
//  Input Args: None  
//
//  Returns: Nothing. If there's an error, an appropriate message will be 
//           displayed
//
///////////////////////////////////////////////////////////////////////////////

function buildList()
{
  // FTP the introspection file to server and follow up with a HTTP request.
  var httpReply = MMHttp.postText(remotePath, "mode=listAllSources", 
    "application/x-www-form-urlencoded", "", g_localIntrospectionPath ); 

  if(httpReply.statusCode == 200)
  {
    //The data obtained from the server is in the form of an XML file. We
    //need to access it like a DOM, so put it into a file and access the 
    //file instead.

    //We probably should do a check here to see if the empty.htm file 
    //exists. If it doesn't we need to create an alternative repository
    var filename = dw.getConfigurationPath() + '/Shared/MM/Cache/empty.htm';
    tagDom = dw.getDocumentDOM(filename);
    tagDom.documentElement.outerHTML = httpReply.data;

    var cNodes = tagDom.getElementsByTagName("ITEMS");
    var cSubNodes;
    if (cNodes[0])
      cSubNodes = cNodes[0].childNodes;
    else
      cSubNodes = new Array();

    for (var i=0; i < cSubNodes.length ; i++)
    {
      g_tagList.push(cSubNodes[i].innerHTML);
    }
  } else {
    // Uh-oh. We ran into a problem. Display the HTTP error code and message.
    displayHTTPError(httpReply.statusCode);
  }
  g_selectObj.setAll(g_tagList, g_tagList);
}


///////////////////////////////////////////////////////////////////////////////
//  Func Name: buildSelectionList
//
//  Purpose: Build a list with the user's selection.
//      
//  Input Args: None  
//
//  Returns: Array
//           Returns an array containing the user's selection. 
//
///////////////////////////////////////////////////////////////////////////////

function buildSelectionList()
{
  var sel = "";
  var selection = new Array();
  var selection = g_selectObj.getValue("multiple");

  for(var i=0; i<selection.length; i++) {
    sel = sel + selection[i] + ";";   
  }
  return sel;
}
