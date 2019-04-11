//SHARE-IN-MEMORY=true
//
// Copyright 2000, 2001, 2002, 2003, 2004, 2005 Macromedia, Inc.  All rights reserved.
// -----------------------------------------------------
//
// DOM.js
//
// This file contains some general helper functions for working with
// the Dreamweaver DOM.
//


/////////////////////////////////////////////////////////////////////////////
// Function
//    getRootNode
//
// Purpose
//    Quickie function for getting the root node of the active document.
//
function getRootNode()
{
   return dreamweaver.getDocumentDOM("document").documentElement;
}


/////////////////////////////////////////////////////////////////////////////
// Function
//    findTag
//
// Purpose
//    Find a tag with the given name.  The search starts at startNode and
//    searches its children.
//
// Entry
//    tagName - a string that contains the name of the tag to find.
//    startNode - the node in the dom to start from.  If this is not
//       given, the root node will be used by default.
//
//??? used by clean up word and format table, recursive from root
function findTag(tagName) // optional:  startNode
{
   var startNode = (findTag.arguments.length >= 2 ? findTag.arguments[1] : null);
   var i, result;

   if(startNode == null)
      startNode = getRootNode();

   if(startNode.tagName != null &&
      startNode.tagName.toUpperCase() == tagName.toUpperCase()) // Always returned in uppercase.
      return startNode;

   for(i = 0; i < startNode.childNodes.length; i++)
   {
      result = findTag(tagName, startNode.childNodes[i]);

      if(result != null)
         return result;  // found it.
   }

   return null;  // didn't find it here.
}


//////////////////////////////////////////////////////////////////////////////
// Function
//    nodeList
//
// Purpose
//  Creates list of all nodes from the specified node.
//  Used to prevent recursion in traverse function - small speed improvement
//  Memory usage now linear and recursion limit not a problem. Note that the
//  dyanamic list takes the place of recursion.
//  i.e. One test had 0.5 Meg vs 65 Meg old style memory use.
//
function nodeList (startNode) {
  var rtnList = new Array();
  var curNode;
  
  if (startNode) {
    rtnList.push(startNode);
    for (var i = 0; i < rtnList.length; i++) {
      curNode = rtnList[i];
      if (curNode.hasChildNodes) {
        for (var j = 0; j < curNode.childNodes.length; j++) {
          rtnList.push(curNode.childNodes[j]);
        }
      }
    }
  }
  return rtnList;
}

//////////////////////////////////////////////////////////////////////////////
// Function
//    traverse
//
// Purpose
//    Given a node, this will traverse the entire DOM structure, calling
//    a handler (callback) function for each node type that it encounters.
//
function traverse( node, fElementHandler ) // optional: fTextHandler, fCommentHandler, userData )
{
   if(node == null)
      node = getRootNode();

   var fTextHandler  = traverse.arguments.length >= 3 ? traverse.arguments[2] : null;
   var fCommentHandler  = traverse.arguments.length >= 4 ? traverse.arguments[3] : null;
   var userData      = traverse.arguments.length >= 5 ? traverse.arguments[4] : null;
   var bContinue     = true;  // Return false to halt traverse.
   var current       = null;

   if(fElementHandler == null && fTextHandler == null && fCommentHandler == null)
      return;  // No callbacks.  Nothing to do.
   
   var nodeArr = nodeList(node);

   while(nodeArr.length > 0 && bContinue)
   {
      current = nodeArr.pop();

      // process current node
      switch( current.nodeType )
      {
         case Node.ELEMENT_NODE:
            if(fElementHandler != null)
               if ( userData != null )
                  bContinue = fElementHandler( current, userData );
               else
                  bContinue = fElementHandler( current );
            break;

         case Node.COMMENT_NODE:
            if ( fCommentHandler != null )
               if ( userData != null )
                  bContinue = fCommentHandler( current, userData );
               else
                  bContinue = fCommentHandler( current );
            break;

         case Node.TEXT_NODE:
            if ( fTextHandler != null )
               if ( userData != null )
                  bContinue = fTextHandler( current, userData )
               else
                  bContinue = fTextHandler( current )
            break;

         case Node.DOCUMENT_NODE: // Ignores document nodes.
            break;

         default:
             MM_error( MSG_UnknownNodeType, current.nodeType );
      }
   }
}


//////////////////////////////////////////////////////////////////////////////
// Function
//    isInsideTag
//
// Purpose
//    Check to see if a given tag is contained within another tag.
//
// Parameters
//    tag - the tag in the DOM for which to check
//    tagNames - a comma delimited list of tags to search for.
//       (ie "p,h1,h2,h3,h4,h5,h6").  No spaces.
//
// Returns
//    true if the tag is contained within one of the given tags.
//
function isInsideTag(tag, tagNames)
{
   var tagList = tagNames.split(",");
   var regx = new RegExp();
   var parent, result;

   for(i = 0; i < tagList.length; i++)
   {
      parent = tag.parentNode;
      regx.compile(tagList[i], "i");

      while(parent != null)
      {
         result = regx.exec(parent.tagName);

         if(result != null)
            return true;

         parent = parent.parentNode;
      }
   }

   return false;
}


//Popups up a command. Before popping it up, updates globals. Command can then
//use these globals to get and receive arguments from the caller.

function callCommand(cmdName,argObject) {
  MM.commandArgument = argObject;
  MM.commandReturnValue = null;
  dw.popupCommand(cmdName);
  return MM.commandReturnValue;
}



//************** FUNCTIONS FOR UPDATING BEHAVIOR CODE ****************8

var DW_VERSION = 4.0;

//Checks if function is latest, and maybe updates it. If out of date (and first caller),
//refresh all behaviors on page. Returns true if behavior was out of date.

function updateBehaviorFns() {
  var behNames = updateBehaviorFns.arguments;
  var retVal = false;
  var fnVerOnPage, fnVersion;

  for (i=0; i<behNames.length; i++) { //with each name passed in...
    fnVersion = document["VERSION_"+behNames[i]];   //if fn has defined document.VERSION_MM_fnName, get it
    if (!fnVersion) fnVersion = MM["VERSION_"+behNames[i]]; //if not defined on document, check MM.VERSION_MM_fnName
    if (!fnVersion) fnVersion = DW_VERSION;         //if not defined on MM, use general Dreamweaver version
    fnVerOnPage = getFunctionVersion(behNames[i]);  //get version of the function in user's page
    if (fnVerOnPage > -1 && fnVerOnPage < fnVersion) { //if fn out of date
      deleteFunction(behNames[i]);                     //delete older fn
      retVal = true;
  } }
  if (retVal) { //if any function was updated, refresh all the behavior calls on the page
    var DOM = dw.getDocumentDOM();
    if (DOM) {
        DOM.reapplyBehaviors();
  } }
  return retVal;
}

//Used by behaviors to see if behavior function already exists on the page, and
//if so, what version it is. Given a function name, returns the version (if
//it exists on the first line as //v3.123) or 0 if no version. Returns -1 if
//the function is not found on the page. For example, given function
//       function myFunction() { //v2.0
//Calling getFunctionVersion("myFunction") returns 2. Given function
//       function myFunction() {
//Calling getFunctionVersion("myFunction") returns 0.
//Searches dom if passed, else searches active document.
//Does not search included src files (use dom to do this).
//
//Arguments: fnName, dom (optional). If no dom, searches current page
//Returns -1 if function not found, 0 if found without version number.

function getFunctionVersion(fnName, dom) {
  if (!dom) dom = dreamweaver.getDocumentDOM("document");
  //get the server model and for vb-script make it case insensitive
  var serverModel = dw.getDocumentDOM().serverModel;
  var serverModelName = serverModel.getDisplayName();
  if (serverModelName.length == 0) {
		serverModelName = site.getServerDisplayNameForSite();
  }
  var bCaseInsensitive = false;
  //this is temporary fix the fix would be attach CaseInsenstive property to server info object.
  //serverModel.getServerInfo().isCaseSensitive and use that instead of hardcoding
  //specific langauges.
  if (serverModelName.length && ((serverModelName.indexOf("VB")>=0)|| (serverModelName.indexOf("Basic")>=0))) {
    bCaseInsensitive = true; 
  }  

  var i, aScript, result, version=-1;
  var allScripts = dom.getElementsByTagName("SCRIPT");
  var fnPatt = null;

  if (bCaseInsensitive) {
 	fnPatt = new RegExp("function\\s+" + fnName + "\\s*\\([^\r\n]+","i"); //find function fnName(...);  ...\n 
	}
  else {
 	fnPatt = new RegExp("function\\s+" + fnName + "\\s*\\([^\r\n]+"); //find function fnName(...);  ...\n
  }

  var verPatt = new RegExp("\\/\\/v(\\d+\\.?\\d*)","i");           //find //v3.123

  for (i=0; i<allScripts.length; i++) if (allScripts[i].hasChildNodes()) {
    aScript = allScripts[i].childNodes[0].data; //read script tag
    RegExp.multiline = true;        //required so that $ stops at the end of the line
    result = aScript.match(fnPatt);
    RegExp.multiline = false;       //reset the value
    if (result) {
      version = 0;
      aScript = result[0];
      result = aScript.match(verPatt);    //find //v3.123
      if (result) version = parseFloat(result[1]);
      break;
  } }
  return version;
}


//Used by behaviors to remove older versions of behavior functions.
//Deletes a function with a given name from the document.
//IMPORTANT! Will not work if function contains braces {} within quotes.
//Does not search included src files (use dom to do this).
//
//Arguments: fnName, dom (optional), deleteScriptTag (optional).
//If no dom, searches current page
// deleteScriptTag is a boolean value indicating whether to delete the parent 
// script tag, if it's empty after the function has been deleted. defaults to false.
//Returns: empty string if function not found, otherwise returns deleted function

function deleteFunction(fnName, dom, deleteScriptTag) {
  if (!deleteScriptTag) deleteScriptTag = false;
  if (!dom) dom = dreamweaver.getDocumentDOM("document");
  var i, j, aScript, startPos, curChar, braceCount, retVal=false;
  var allScripts = dom.getElementsByTagName("SCRIPT");
  var fnPatt = new RegExp("function\\s+" + fnName + "\\s*\\(");  //find function fnName(...{

  for (i=0; i<allScripts.length; i++) if (allScripts[i].hasChildNodes()) {
    aScript = allScripts[i].childNodes[0].data;
    startPos = aScript.search(fnPatt);
    if (startPos != -1) { //found function, start traversing
      for (j=startPos; aScript.charAt(j) != "{"; j++);  //find first brace
      j++;
      braceCount=1;
      while (braceCount>0 && j<aScript.length) {        //count braces until 0
        curChar = aScript.charAt(j++);
        if (curChar=="{") braceCount++;
        if (curChar=="}") braceCount--;
      }
      if (braceCount == 0) {
        while (aScript.charAt(j).search(/\s/) != -1) j++; //remove trailing whitespace
        retVal = (aScript.substring(startPos,j));         //return the chunk to delete
        allScripts[i].childNodes[0].data = aScript.substring(0,startPos) + aScript.substring(j); //delete it!
        if (deleteScriptTag && scriptIsEmpty(allScripts[i].innerHTML))
          allScripts[i].outerHTML = '';
      }
      break;
    } 
  }
  return retVal;
}




//Used by behaviors to remove old function call.
//Deletes a function call with a given name from the document.
//Does not search included src files (use dom to do this).
//Requires function to have closing semicolon.
//
//Arguments: fnName, dom (optional). If no dom, searches current page
//Returns: false if function call not found, otherwise returns script node in which it was deleted.

function deleteFunctionCall(fnName, dom) {
  if (!dom) dom = dreamweaver.getDocumentDOM("document");
  var i, j, aScript, startPos, retVal=false;
  var allScripts = dom.getElementsByTagName("SCRIPT");
  var fnPatt = new RegExp("\\s+" + fnName + "\\s*\\(");  //find function fnName(...{
 
  for (i=0; i<allScripts.length; i++) if (allScripts[i].hasChildNodes()) {
    aScript = allScripts[i].childNodes[0].data;
    startPos = aScript.search(fnPatt);
    if (startPos != -1) { //found function, start traversing
      for (j=startPos; j<aScript.length-1 && aScript.charAt(j) != ";"; j++);  //find closing semicolon
      if (aScript.charAt(j) == ";") {  //if semicolon found
        retVal = aScript.substring(startPos,j);      //return the deleted string.
        aScript = aScript.substring(0,startPos) + aScript.substring(j+1);
        if (scriptIsEmpty(aScript) && !allScripts[i].src) {  // Remove the entire script if it is empty.
          allScripts[i].outerHTML = '';
        } else {
          allScripts[i].childNodes[0].data = aScript; //delete it!
        }
      }
      break;
  } }
  return retVal;
}

//Tests for the exisitence of a function call.
//Does not search included src files (use dom to do this).
//
//Arguments: fnName, dom (optional). If no dom, searches current page
//Returns: false if function call not found, otherwise true.

function hasFunctionCall(fnName, dom) {
  if (!dom) dom = dreamweaver.getDocumentDOM("document");
  var retVal=false;
  var allScripts = dom.getElementsByTagName("SCRIPT");
  var fnPatt = new RegExp("\\s+" + fnName + "\\s*\\(");  //find function fnName(...{

  for (var i=0; i<allScripts.length; i++) {
    if (fnPatt.test(allScripts[i].innerHTML)) {
      retVal = true;
      break;
    }
  }
  return retVal;
}



// Determine if script is empty. Check for just white space
//  and a standard javascript comment tag.
//Arguments: String (which should be the contents of a script tag.
//Returns: true if the script contains only empty commments, otherwise false.

function scriptIsEmpty(aScript) {
  var re = /^\s*(<!--+)*\s*(\/\/+\s*--+>)*\s*$/;
  if (dwscripts.isXSLTDoc())
    re = /^\s*(<!--+)*\s*<xsl\:text\s+disable-output-escaping\s*=\s*"yes"\s*>\s*<\!\[CDATA\[\]\]>\s*<\/xsl\:text>\s*(\/\/+\s*--+>)*\s*$/;
  return re.test(aScript);
}



//Check if selection or any parent of the selection is a link,
//and return the link node if found.

function getSelectionLink() {
  var retVal = "";
  var dom = dw.getDocumentDOM();
  var node = dom.getSelectedNode();

  while (node.nodeType != Node.DOCUMENT_NODE) {
    if (node.nodeType == Node.ELEMENT_NODE && node.tagName == "A") {
      retVal = node;
      break;
    }
    else node = node.parentNode;
  }

  return retVal;
}
