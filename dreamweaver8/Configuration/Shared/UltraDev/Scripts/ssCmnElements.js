//SHARE-IN-MEMORY=true
// Copyright 2000, 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.


//*-------------------------------------------------------------------
// FUNCTION:
//   findAllRecordsetNames
//
// DESCRIPTION:
//   Returns an array of all the recordset names on the current page
//   Removes any names which match "MM_editCmd".  These are recordsets
//   specific to the edit operations.
//
// ARGUMENTS: 
//   none
//
// RETURNS:
//   an array of recordset names
//--------------------------------------------------------------------
function findAllRecordsetNames() {
  var currentdom = dw.getDocumentDOM();
  var nameList = new Array();

  if (currentdom) {
    var serverInfo = dwscripts.getServerImplObject();
    if (serverInfo.getRecordsetNames != null) {
      nameList = serverInfo.getRecordsetNames();
    }
  }
  
  for (var i=nameList.length; i >= 0; i--) {
    if (nameList[i] == "MM_editCmd") {
      nameList.splice(i,1);
    }
  }
  
  return nameList;
}


//*-------------------------------------------------------------------
// FUNCTION:
//   findRecordsetServerBehaviorNames
//
// DESCRIPTION:
//   Returns an array of all the recordset names on the current page
//   Removes any names which match "MM_editCmd".  These are recordsets
//   specific to the edit operations.
//
// ARGUMENTS: 
//   none
//
// RETURNS:
//   an array of recordset names
//--------------------------------------------------------------------
function findRecordsetServerBehaviorNames()
{
  var nameList = new Array();
  var serverName = "";
  var serverVersion = "";
  var tagStr = "";
   
  var currentdom = dreamweaver.getDocumentDOM();

  if(currentdom) {
    serverName =    currentdom.serverModel.getServerName();
    serverVersion = currentdom.serverModel.getServerVersion(serverName);
  } else {
    return returnArray;   
  }
  
  if(serverName && serverVersion) {
    if ((serverName == "ASP") || (serverName == "JSP") || (serverName=="ASPNet"))
      tagStr = "MM_RECORDSET"
    else if (serverName == "Cold Fusion") 
      tagStr = "CFQUERY"  

    var nodes = currentdom.getElementsByTagName(tagStr);
  
    for (var index =0 ; index < nodes.length ; index++) {
      var node = nodes.item(index);
      if (node) {
        nameList.push(node.getAttribute("NAME"));
      }
    }
  }
  
  for (var i=nameList.length; i >= 0; i--) {
    if (nameList[i] == "MM_editCmd") {
      nameList.splice(i,1);
    }
  }
  
  return nameList;
}


//*-------------------------------------------------------------------
// FUNCTION:
//   recordsetNameIsValid
//
// DESCRIPTION:
//   returns true if the given recordset name exists on the current page
//
// ARGUMENTS:
//   rsName - the name of the recordset to check for validity
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------
function recordsetNameIsValid(rsName){
   var isValid = false;
   var rsList = findAllRecordsetNames();
   var nRecords = rsList.length,i;

   if (rsName) {
     for (i=0; i < nRecords; i++) {
       if (rsList[i] == rsName) {
         isValid = true;
         break;
       }
     }
   }
   return isValid;
}


//*-------------------------------------------------------------------
// FUNCTION:
//   findAllColumnNames
//
// DESCRIPTION:
//   returns an array of all the column names for the given recordset
//
// ARGUMENTS:
//   rs - the name of the recordset to return the columns for
//
// RETURNS:
//   an array of column names
//--------------------------------------------------------------------
function findAllColumnNames(rs) {
  var currentdom = dreamweaver.getDocumentDOM();
  var nameList = new Array();
  
  
  if (currentdom) {
    var nodes, node, objList;
    var serverInfo = dwscripts.getServerImplObject();
    if (serverInfo.getColumnNames != null) {
      objList = serverInfo.getColumnNames(rs);
      //Find all column names returns an array of objects of type ObjectInfo. The
      //object has two attributes - name and fileInfo, where name is the name of the
      //column and fileInfo, the name of the image file associated with it.
      for (var i = 0; i < objList.length; i++) {
        nameList[nameList.length] = objList[i].title;
      }
    }
  }

  return nameList;
}


//*-------------------------------------------------------------------
// FUNCTION:
//   findAllRepeatedRegionNames
//
// DESCRIPTION:
//   returns an array of the names of all repeated regions on
//   the current page
//
// ARGUMENTS: 
//   rs - (optional) restricts the list to only repeated regions using 
//          that recordset
//
// RETURNS:
//   an array of repeated region names
//--------------------------------------------------------------------
function findAllRepeatedRegionNames(rs) {
  var currentdom = dw.getDocumentDOM();
  var nameList = new Array();
  
  if (currentdom) {
    var serverInfo = dwscripts.getServerImplObject();
    if (serverInfo.getRepeatedRegionNames != null) {
      nameList = serverInfo.getRepeatedRegionNames(rs);
    }       
  }
  
  return nameList;
}


//*-------------------------------------------------------------------
// FUNCTION:
//   findAllRepeatedRegionNodes
//
// DESCRIPTION:
//   returns an array of all the repeated region nodes on the current page
//
// ARGUMENTS: 
//   none
//
// RETURNS:
//   an array of nodes
//--------------------------------------------------------------------
function findAllRepeatedRegionNodes() {
  var retArr = new Array();
  var dom = dw.getDocumentDOM();
  var serverModel = dom.serverModel.getServerName();
  
  if ( serverModel == "Cold Fusion") {
    var cfOutputTags = dom.getElementsByTagName("CFOUTPUT");
    var i, nTags = cfOutputTags.length;

    for (i=0;i<nTags;i++) {
      if (cfOutputTags[i].query) {
        retArr.push(cfOutputTags[i]);
      }
    }
    
  } else {
    retArr = dom.getElementsByTagName("MM_REPEATEDREGION");
  }
  
  return retArr;
}



//*-------------------------------------------------------------------
// FUNCTION:
//   createUniqueRepeatRegionName
//
// DESCRIPTION:
//   This function returns a unique name for a new repeated region
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string - a unique name
//--------------------------------------------------------------------
function createUniqueRepeatedRegionName()
{
  //search the ssRecs for other names
  var retVal = "";
  
  var ssRecs = dw.serverBehaviorInspector.getServerBehaviors();
  
  var num = 0;
  var rrName = "";
  
  while (!retVal) {
    num++;
    rrName = "Repeat" + num;
    for (var i=0; i < ssRecs.length; i++) { //search all ssRecs
      var ssRec = ssRecs[i];
      if (ssRec.parameters.loopName != null && 
          ssRec.parameters.loopName.toLowerCase() == rrName.toLowerCase()) {
        break;
      }
    }
    if (i >= ssRecs.length) {
      retVal = rrName;
    }
  }
  
  return retVal;
}



//*-------------------------------------------------------------------
// FUNCTION:
//  getNewConnection
//
// DESCRIPTION:
//  Given two arrays, this function returns the index of the first
//  "new" entry in the second array. ("new" means that it does
//  not occur in the first array)
//
// ARGUMENTS:
//  oldList - an array, the list to check against
//  newList - an array, the list to search for new entries
//
// RETURNS:
//  integer - index of new entry in newList
//--------------------------------------------------------------------
function getNewConnection(oldList, newList)
{
  var numUnmatched = 0
  var unMatchedIndex= -1
  for (var newCount = 0; newCount < newList.length; newCount++)
  {
    var foundThisOne = false
    for (oldCount = 0; oldCount < oldList.length; oldCount++)
    {
      if (oldList[oldCount] == newList[newCount])
      {
        foundThisOne = true
        break
      }
    }
    if (!foundThisOne)
    {
      numUnmatched++
      if (numUnmatched > 1)
      {
        break
      }
      unMatchedIndex = newCount
    }
  }

  return unMatchedIndex
}



//**************** CODE FOR FINDING NODES *****************

//*-------------------------------------------------------------------
// FUNCTION:
//   findLockedScriptNodes
//
// DESCRIPTION:
//   Returns an array of script nodes which are locked
//
// ARGUMENTS:
//   dom - (optional) the dom to search
//
// RETURNS:
//   an array of nodes
//--------------------------------------------------------------------
function findLockedScriptNodes(dom) {
  var scriptNodes = new Array();
  dom = dom || dw.getDocumentDOM();
  var nodes = findLockedNodes(dom);
  dreamweaver.useTranslatedSource(true);
  for (i=0; i<nodes.length; i++) {
    node = nodes[i];
    if (node.nodeType == Node.ELEMENT_NODE) {
      if (node.getAttribute("TYPE").toLowerCase() == "script") {
        scriptNodes.push(node);
    } }
  }
  return scriptNodes;
}


//*-------------------------------------------------------------------
// FUNCTION:
//   findLockedNodes
//
// DESCRIPTION:
//   Returns an array of begin lock nodes
//
// ARGUMENTS:
//   dom - (optional) the dom to search
//
// RETURNS:
//   an array of nodes
//--------------------------------------------------------------------
function findLockedNodes(dom) {
  var scriptNodes = new Array();
  dom = dom || dw.getDocumentDOM();
  var nodes = dom.getElementsByTagName("MM:BEGINLOCK");
  return nodes;
}

//*-------------------------------------------------------------------
// FUNCTION:
//   findEndLockedNodes
//
// DESCRIPTION:
//   Returns an array of end lock nodes
//
// ARGUMENTS: 
//   dom - (optional) the dom to search
//
// RETURNS:
//   an array of nodes
//--------------------------------------------------------------------
function findEndLockedNodes(dom) {
  var scriptNodes = new Array();
  dom = dom || dw.getDocumentDOM();
  var nodes = dom.getElementsByTagName("MM:ENDLOCK");
  return nodes;
}


//*-------------------------------------------------------------------
// FUNCTION:
//   findNodes
//
// DESCRIPTION:
//   Returns an array of nodes.  If dom is specified, searches in that
//   dom.  In Cold Fusion, searches for elements matching the given
//   tag name.
//
// ARGUMENTS:
//   dom - (optional) the dom to search
//   tagName - (required for Cold Fusion, ignored otherwise) 
//             the element types to return
//
// RETURNS:
//   an array of nodes
//--------------------------------------------------------------------
function findNodes(dom, tagName) {
  var nodes;
  var serverName = dom.serverModel.getServerName();
  if (serverName == "Cold Fusion") {
    nodes = dom.getElementsByTagName(tagName);
  } else {
    nodes = findLockedNodes();
  }
  return nodes;
}

//*-------------------------------------------------------------------
// FUNCTION:
//   getMyBeginLock
//
// DESCRIPTION:
//   Given a node, finds the begin lock associated with it
//
// ARGUMENTS:
//   node - the node to find the begin lock node for
//
// RETURNS:
//   a node
//--------------------------------------------------------------------
function getMyBeginLock(node)
{
  var dom = dw.getDocumentDOM();
  var retVal=null;
  var nodes = findLockedNodes(dom);
  var myOffset = dom.nodeToOffsets(node)[0];
  
  for (var i=0; i < nodes.length; i++){
    if (dom.nodeToOffsets(nodes[i])[0] == myOffset) {
      retVal = nodes[i];
      break;
    }
  }
  
  return retVal;
}

//*-------------------------------------------------------------------
// FUNCTION:
//   getMyEndLock
//
// DESCRIPTION:
//   Given a node, finds the end lock associated with it
//
// ARGUMENTS:
//   node - the node to find the end lock node for
//
// RETURNS:
//   a node
//--------------------------------------------------------------------
function getMyEndLock(node)
{
  var dom = dw.getDocumentDOM();
  var retVal=null;
  var nodes = findEndLockedNodes(dom);
  var myOffset = dom.nodeToOffsets(node)[1];
  for (var i=0;i<nodes.length;i++){
    if (dom.nodeToOffsets(nodes[i])[1] == myOffset){
      retVal = nodes[i];
      break;
    }
  }
  return retVal;
}



//********************* MISCELLANEOUS **************************


//*-------------------------------------------------------------------
// FUNCTION:
//   numberOfDependencies
//
// DESCRIPTION:
//   Counts the number of Server Behaviors that have participant pointers to
//   the given node. If the countGroupAsOne flag is set and the any SB has
//   a group property set, does not count other SBs with the same group prop.
//
// ARGUMENTS:
//   node - the node to check for dependencies
//   countGroupAsOne - boolean which indicates if groups should be counted
//                     only once
//
// RETURNS:
//   the number of dependencies
//--------------------------------------------------------------------
function numberOfDependencies(node, countGroupAsOne) { //second arg is optional
  var j,k,ssRecs,parts,num = 0;
  ssRecs = dw.serverBehaviorInspector.getServerBehaviors();
  for (j=0; j<ssRecs.length; j++) { //search all ssRecs
    parts = ssRecs[j].participants;
    for (k=0; k<parts.length; k++) {    //scan ssRec participants
      if (parts[k] == node) {
        num++;
        if (countGroupAsOne && ssRecs[j].group && j) { //if ignoring others in the same group
          for (i=j-1; i>=0; i--) { //search all previous ssRecs
            if (ssRecs[i].group == ssRecs[j].group) { //if found prior ssRec with same group
              num--;                                  //don't count the dependency
              break;
        } } }
        break;
      }
    }
  }
  return num;
}


//*-------------------------------------------------------------------
// FUNCTION:
//   getConnectionsPath
//
// DESCRIPTION:
//   Returns a string which represents the relative path from the
//   current document to the Connections directory
//
// ARGUMENTS: 
//   connectionName - (optional) If passed in, the function searches to see
//       if a connection exists on the page with a site relative path.
//       If one is found, this path is returned.
//
// RETURNS:
//   string
//--------------------------------------------------------------------
function getConnectionsPath(connectionName, urlFormatPref) {
	var retVal = "";
  
	var dom = dw.getDocumentDOM();
	var fileUrl = dom.URL;
	var siteUrl = dw.getSiteRoot();
	var siteUrlPrefix = dom.getSiteURLPrefixFromDoc();
	if( !urlFormatPref )
		urlFormatPref = getConnectionsUrlFormat(dom);
  
	if (urlFormatPref == "virtual") //if site relative append the site url prefix
	{
		retVal = siteUrlPrefix + "/";
	}
	else //file relative
	{
		if (fileUrl && siteUrl && fileUrl.toLowerCase().indexOf(siteUrl.toLowerCase()) != -1) 
		{

			//remove the site path from the file path
			fileUrl = fileUrl.substring(siteUrl.length);

			//if the site did not end in a slash, remove it from the fileUrl
			if (fileUrl.charAt(0) == "/") {
				fileUrl = fileUrl.substring(1);
			}

			//add an enclosing directory reference for each slash encountered
			for (var i=0; i < fileUrl.length; i++) {
				if (fileUrl.charAt(i) == "/") {
					retVal += "../";
				}
			}
		} 
		else if (!fileUrl && siteUrl) 
		{ 
			retVal = escape(siteUrl);  
		}
	}
  
	//search for an existing connection with a site relative path
	if (connectionName) 
	{
		var partList = dw.getParticipants("connectionref_statement");
		for (var i=0; partList && i < partList.length; i++)
		{
			if (partList[i].parameters.cname == connectionName && 
				partList[i].parameters.relpath.charAt(0) == "/") 
			{
				// preserve site relative links
				retVal = partList[i].parameters.relpath;
				break;
			}
		}
	}
	
	return retVal;
}

//*-------------------------------------------------------------------
// FUNCTION:
//   getConnectionsUrlFormat
//
// DESCRIPTION:
//   Returns the connection url format based on the 
//	 url format for the current document
//
// ARGUMENTS: 
//   current document - to see the default url format
// RETURNS:
//   file - if the document relative
//	 virtual - if the site relative
//--------------------------------------------------------------------
function getConnectionsUrlFormat(aDoc)
{
	var connectionUrlFormat = "file";
	if (aDoc != null)
	{
		var siteUrlFormat = aDoc.getSiteURLFormatFromDoc();
		if (siteUrlFormat == "site")
		{
			connectionUrlFormat = "virtual";
		}
	}
	return connectionUrlFormat;
}

//*-------------------------------------------------------------------
// FUNCTION:
//   IsConnectionSiteRelative
//
// DESCRIPTION:
//	 returns the url format to use for the connection
//
// ARGUMENTS: 
//   current document - to see the default url format
// RETURNS:
//--------------------------------------------------------------------
function IsConnectionSiteRelative(connectionPath)
{
  var bSiteRelative = false;
	if (connectionPath == null)
	{
		//default to default site url preference for doc-relative or site-relative
		var aCurrentDoc = dw.getDocumentDOM();
		var urlformatPref = aCurrentDoc.getSiteURLFormatFromDoc();
		if (urlformatPref == "site")
		{
				bSiteRelative = true;
		}
	}
	else
	{
		//preserves the existing format if doc or site relative
		if (connectionPath.charAt(0) == "/")
		{
				bSiteRelative = true;
		}
	}
  return bSiteRelative;
}



//*-------------------------------------------------------------------
// FUNCTION:
//   stripCFOutputTags
//
// DESCRIPTION:
//   Returns the given string, stripped of all cfoutput tags
//
// ARGUMENTS:
//   str - the string to strip cfouput tags from
//
// RETURNS:
//   string
//--------------------------------------------------------------------
function stripCFOutputTags(str){
   var exp1 = /<cfoutput[^>]*>/gi;
   var exp2 = /<\/cfoutput>/gi;
   var retVal = str.replace(exp1,"");
   
   retVal = retVal.replace(exp2,"");

   //We need to preserve the hashes for the translator.
   /*if (retVal.indexOf("#") != -1){
     retVal = retVal.substring(retVal.indexOf("#")+1,retVal.lastIndexOf("#"));
   }*/
   
   return retVal;
}


//*-------------------------------------------------------------------
// FUNCTION:
//   wrapNamesWithSpaces
//
// DESCRIPTION:
//   this fn is needed for SQL statements,
//   names with spaces need brackets around them
//
// ARGUMENTS:
//   nameStr - the name to wrap
//
// RETURNS:
//   string - the wrapped name
//--------------------------------------------------------------------
function wrapNamesWithSpaces(nameStr){
  var hasSpaces = ( nameStr.indexOf(" ") != -1 );
  return (hasSpaces)? "[" + nameStr + "]" : nameStr;

}


//*-------------------------------------------------------------------
// FUNCTION:
//   unwrapNamesWithSpaces
//
// DESCRIPTION:
//   in SQL, names with spaces are wrapped with brackets. this function removes
//   the brackets
//
// ARGUMENTS: 
//   nameStr - the name to unwrap
//
// RETURNS:
//   string - the unawrapped name
//--------------------------------------------------------------------
function unwrapNamesWithSpaces(nameStr){
  var hasBrackets = nameStr.charAt(0) == "[",retVal;
  return (hasBrackets && nameStr.length > 0)?nameStr.substring(1,nameStr.length-1):nameStr;
}


//*-------------------------------------------------------------------
// FUNCTION:
//   getServerExtension
//
// DESCRIPTION:
//   Returns the current server file extension, without the leading period
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string - the server file extension
//--------------------------------------------------------------------
function getServerExtension(){
  return ( dw.getDocumentDOM().serverModel.getServerExtension().replace(/\./g, "") );
}



//*-------------------------------------------------------------------
// FUNCTION:
//   setMoveToParamsForJsp
//
// DESCRIPTION:
//   Called by ServerBehaviors which apply the Move To behaviors,
//   to set parameters needed by Jsp
//
// ARGUMENTS:
//   paramObj - the parameter object to add parameters to
//
// RETURNS:
//   nothing (updates the paramObj)
//--------------------------------------------------------------------
function setMoveToParamsForJsp(paramObj) {
  if (dw.getDocumentDOM().serverModel.getServerName() == "JSP") {
    
    var rsName = paramObj.rsName;
    
    //check if this is a recordset from a callable object
    var callableName = "";
    ssRecs = dw.serverBehaviorInspector.getServerBehaviors();
    for (var i=0; i < ssRecs.length; i++) {
      if (ssRecs[i].recordset == rsName && ssRecs[i].callableName) {
        callableName = ssRecs[i].callableName;
        break;
      }
    }
    
    if (callableName) {
      paramObj.callableName = callableName;
      var part = new Participant("moveTo_resetCallableCall");
    } else {
      var part = new Participant("moveTo_resetRecordsetCall");
    }
    
    paramObj.resetRecordsetCall = part.getInsertString(paramObj);
    
  }
}



//**************************** DEPRECATED ******************************


//*-------------------------------------------------------------------
// FUNCTION:
//   findInputElements
//
// DESCRIPTION:
//   Given an input name, returns a node ptr to it.
//   Given no name, returns an array of all hidden buttons.
//   Searches entire dom by default. 
//   If the optional formObj parameter is given, only searches that form.
//
// ARGUMENTS:
//   inputName - (optional) the name of the input element to find
//   formObj - (optional) the form to search in for the element
//
// RETURNS:
//   an array of nodes
//--------------------------------------------------------------------

function findInputElements(inputName, formObj) {
  var btnType, nodes = new Array();
  var dom = (formObj != null)? formObj : dw.getDocumentDOM();
  
  if (dom) {
    var allInputs = dom.getElementsByTagName("INPUT");
    if (!inputName) {
      nodes = allInputs;
    } else {
      for (i=0; i < allInputs.length; i++) {
        if (allInputs[i].getAttribute("name") == inputName) {
          nodes.push(allInputs[i]);
        }
      }
    }
  }

  return nodes;
}


//*-------------------------------------------------------------------
// FUNCTION:
//   findAllAspNodes
//
// DESCRIPTION:
//   Returns an array of the asp nodes within the current page
//
// ARGUMENTS:
//   theNode - (optional) the node to search within
//
// RETURNS:
//   an array of nodes
//--------------------------------------------------------------------
function findAllAspNodes(theNode) {
  var nodeList = new Array();
  if (!theNode) theNode = dw.getDocumentDOM();

  if (theNode.hasChildNodes()) {
    for (var i=0; i<theNode.childNodes.length; i++) {
      nodeList = nodeList.concat(findAllAspNodes(theNode.childNodes[i]));
    }
  } else if (theNode.nodeType == Node.COMMENT_NODE) {
    if (theNode.data.indexOf("<%") == 0) { //if starts with <%
      nodeList.push(theNode);
    }
  }
  return nodeList;
}


//*-------------------------------------------------------------------
// FUNCTION:
//   findAllServerBehaviorNodes
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------
function findAllServerBehaviorNodes() {
  var dom = dw.getDocumentDOM();
  var retVal = null;
  var serverModel = dw.getDocumentDOM().serverModel.getServerName();

  if (serverModel == "Cold Fusion") {
    //Cold Fusion code here

  } else { //if (serverModel == "ASP") {
    var ssRecs = dw.serverBehaviorInspector.getServerBehaviors();
    if (!MM.aspNodes || !MM.oldServerBehaviors || MM.oldServerBehaviors != ssRecs) {
      if (DEBUG) alert("finding tags again");
      MM.aspNodes = findAllAspNodes(dom);
      MM.oldServerBehaviors = ssRecs;
    } else {
      if (DEBUG) alert("cache is up to date!");
    }
    retVal = MM.aspNodes;
  }
  return retVal;
}


//*-------------------------------------------------------------------
// FUNCTION:
//   getCFQueryNames
//
// DESCRIPTION:
//   Returns an array of cf query names on the current page
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   an array of names
//--------------------------------------------------------------------
function getCFQueryNames() {
  var nameList = new Array();
  var cfQueryTags = dw.getDocumentDOM().getElementsByTagName("CFQUERY");
  var nQuerys = cfQueryTags.length, i, currTag;

  for (i=0;i<nQuerys;i++) {
    currTag = cfQueryTags[i];
    if (currTag.name && currTag.name != "") {
      nameList.push(currTag.name);
    }
  }

  return nameList;
}


//*-------------------------------------------------------------------
// FUNCTION:
//   cfQueryNameIsValid
//
// DESCRIPTION:
//   Returns true if the given query exists on the current page,
//   false otherwise.
//
// ARGUMENTS:
//   queryName - the name of the query to check for validity
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------
function cfQueryNameIsValid(queryName) {
   var nameArr = getCFQueryNames();
   var isValid = false;
   var nNames = nameArr.length,i;
   
   for (i=0;i<nNames;i++) {
     if (nameArr[i] == queryName) {
       isValid = true;
       break;
     }
   }

   return isValid;
}


//*-------------------------------------------------------------------
// FUNCTION:
//   selIsInCFOutputTags
//
// DESCRIPTION:
//   Returns true if the current selection is within a cfoutput tag
//
// ARGUMENTS:
//   dom - (optional) the dom to check
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------
function selIsInCFOutputTags(dom) {
  var theDOM = (dom)?dom:dw.getDocumentDOM();
  var selObj = theDOM.getSelectedNode();
  var foundCFOutput = false;

  if (selObj.tagName && selObj.tagName == "CFOUTPUT"){
    foundCFOutput = true;
  } else {
    while (selObj.parentNode && !foundCFOutput){
      selObj = selObj.parentNode;
      if (selObj.tagName && selObj.tagName == "CFOUTPUT"){
      foundCFOutput = true;
      } else if (selObj.tagName && selObj.tagName == "HTML"){
        break;
      }
    }
  }

  return foundCFOutput;
}


