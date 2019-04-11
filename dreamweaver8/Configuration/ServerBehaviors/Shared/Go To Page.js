// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

//*************** GLOBALS VARS *****************

var OPT_KEEPURL, OPT_KEEPFORM;
var NAME_PREV_COL = '';

var SB_NAME = dwscripts.getSBFileName();

var rs = new RecordsetMenu(SB_NAME, "rs");
var col = new RecordsetColumnMenu(SB_NAME, "col", null, "rs");
var linkNode = new TagMenu(SB_NAME, "linkNode", "A");
var paramName = new TextField(SB_NAME, "paramName");
var url = new TextField(SB_NAME, "url");


//******************* API **********************


//--------------------------------------------------------------------
// FUNCTION:
//   findServerBehaviors
//
// DESCRIPTION:
//   Locates instances of this server behavior on the current page.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   an array of SSRecord objects
//--------------------------------------------------------------------
function findServerBehaviors()
{
  var sbList;
  if (SB_NAME == "Go To Detail Page.htm") {
    sbList = dwscripts.findSBs(MM.LABEL_TitleGoToDetail);
  } else {
    sbList = dwscripts.findSBs(MM.LABEL_TitleGoToRelated);
  }
  
  for (var i=0; i < sbList.length; i++) {
    //set the family attribute
    sbList[i].family = "moveTo";
  }
  
  return sbList;
}


//--------------------------------------------------------------------
// FUNCTION:
//   canApplyServerBehavior
//
// DESCRIPTION:
//   Returns true if the server behavior can be applied.
//   Otherwise, displays an alert and returns false.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------
function canApplyServerBehavior(sbObj)
{
  var success = true;

  if (SB_NAME == "Go To Detail Page.htm") {
    if (success)
      success = rs.canApplyServerBehavior(sbObj);

    if (success)
      success = col.canApplyServerBehavior(sbObj);

    if (success)
      success = paramName.canApplyServerBehavior(sbObj);
  }

  if (success)
    success = url.canApplyServerBehavior(sbObj);

  if (success)
    success = linkNode.canApplyServerBehavior(sbObj);

  return success;
}



//--------------------------------------------------------------------
// FUNCTION:
//   applyServerBehavior
//
// DESCRIPTION:
//   adds the server behavior to the users page, based on the UI settings
//
// ARGUMENTS:
//   sbObj - if we are re-applying, the previous SSRecord for this
//              server behavior
//
// RETURNS:
//   string - error message to indicate failure, or the empty string
//            to indicate success
//--------------------------------------------------------------------
function applyServerBehavior(sbObj)
{
  var paramObj = new Object();
  var errStr = "";

  if (SB_NAME == "Go To Detail Page.htm") {
    if (!errStr)
      errStr = rs.applyServerBehavior(sbObj, paramObj);

    if (!errStr)
      errStr = col.applyServerBehavior(sbObj, paramObj);

    if (!errStr)
      errStr = paramName.applyServerBehavior(sbObj, paramObj);
  }

  if (!errStr)
    errStr = url.applyServerBehavior(sbObj, paramObj, MM.MSG_NeedUrl);

  if (!errStr)
    errStr = linkNode.applyServerBehavior(sbObj, paramObj);
    
  if (!errStr) {
    var keepURL = OPT_KEEPURL.checked;
    var keepForm = OPT_KEEPFORM.checked
    if (keepURL && keepForm) paramObj.keepType = "Both";
    else if (keepURL) paramObj.keepType = "URL";
    else if (keepForm) paramObj.keepType = "Form";
    else paramObj.keepType = "None";
  }

  if (!errStr)
    dwscripts.applySB(paramObj, sbObj);

  return errStr;
}


//--------------------------------------------------------------------
// FUNCTION:
//   inspectServerBehavior
//
// DESCRIPTION:
//   populates the UI based on the SSRecord of the current server behavior
//
// ARGUMENTS: 
//   sbObj - the instance of the server behavior to inspect
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function inspectServerBehavior(sbObj)
{
  var success = true;

  if (SB_NAME == "Go To Detail Page.htm") {
    if (success) {
      success = rs.inspectServerBehavior(sbObj);
    }

    if (success) {
      col.updateUI(sbObj);
      success = col.inspectServerBehavior(sbObj);
    }

    if (success) {
      success = paramName.inspectServerBehavior(sbObj);
    }
  }
    
  if (success)
    success = url.inspectServerBehavior(sbObj);
    
  if (success)
    success = linkNode.inspectServerBehavior(sbObj);
    
  OPT_KEEPURL.checked = (sbObj.parameters.keepType == "Both" || sbObj.parameters.keepType == "URL");
  OPT_KEEPFORM.checked = (sbObj.parameters.keepType == "Both" || sbObj.parameters.keepType == "Form");
}


//--------------------------------------------------------------------
// FUNCTION:
//   deleteServerBehavior
//
// DESCRIPTION:
//   Removes the selected server behavior from the page
//
// ARGUMENTS: 
//   sbObj - the SSRecord of the server behavior to delete
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------
function deleteServerBehavior(sbObj)
{
  if (SB_NAME == "Go To Detail Page.htm") {
    rs.deleteServerBehavior(sbObj);
    col.deleteServerBehavior(sbObj);
    paramName.deleteServerBehavior(sbObj);
  }
  url.deleteServerBehavior(sbObj);
  linkNode.deleteServerBehavior(sbObj);
  dwscripts.deleteSB(sbObj);
  return true;
}


//--------------------------------------------------------------------
// FUNCTION:
//   analyzeServerBehavior
//
// DESCRIPTION:
//   Called after all server behaviors have been found to allow
//   for any further checks which need to be performed
//
// ARGUMENTS: 
//   sbObj - the SSRecord of the behavior we are analyzing
//   allRecs - a list of all server behavior records
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function analyzeServerBehavior(myRec, allRecs)
{
  for (var i = 0; i < allRecs.length; i++) {
    var thisRec = allRecs[i]
    if (thisRec.type == "dynamicBinding" && (thisRec.participants[0] == myRec.participants[0])) {
      thisRec.deleted = true;
    }
  }
  if (myRec.serverBehavior == "Go To Detail Page.htm") {
    rs.analyzeServerBehavior(myRec, allRecs);
    col.analyzeServerBehavior(myRec, allRecs);
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   displayHelp
//
// DESCRIPTION:
//   Displays the built-in Dreamweaver help.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function displayHelp()
{
  // Replace the following call if you are modifying this file for your own use.
  dwscripts.displayDWHelp(HELP_DOC);
}


//***************** LOCAL FUNCTIONS  ******************


//--------------------------------------------------------------------
// FUNCTION:
//   initializeUI
//
// DESCRIPTION:
//   popoulate the UI elements
//
// ARGUMENTS: 
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function initializeUI()
{
  if (SB_NAME == "Go To Detail Page.htm") {
    rs.initializeUI();
    col.initializeUI();
    paramName.initializeUI();
    paramName.setValue(col.getValue());
  }
  url.initializeUI();
  linkNode.initializeUI((SB_NAME == "Go To Detail Page.htm")? MM.LABEL_NewDetailLinkLabel : MM.LABEL_NewRelatedLinkLabel);  
  
  OPT_KEEPURL = dwscripts.findDOMObject("keepURL");
  OPT_KEEPURL.checked = false;
  
  OPT_KEEPFORM = dwscripts.findDOMObject("keepForm");
  OPT_KEEPFORM.checked = false;
  
  updateUI("linkNode"); //display URL for current link (if any)

  elts = document.forms[0].elements;
  if (elts && elts.length)
    elts[0].focus();
}


//--------------------------------------------------------------------
// FUNCTION:
//   updateUI
//
// DESCRIPTION:
//   process any events from the UI elements
//
// ARGUMENTS:
//   itemName - the name of the control which called updateUI
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function updateUI(itemName)
{
  
  if (itemName == "linkNode") {
    
    var linkValue = linkNode.getValue();
    if (typeof linkValue == "object") { // if link is a node
      var theHref = linkValue.getAttribute("HREF");
      theHref = (theHref != null) ? theHref : "";
      var pos = theHref.indexOf("?");
      if (pos != -1) theHref = theHref.substring(0,pos); //remove stuff after ?
      url.setValue(theHref); //display link value
    } else {
      url.setValue("");
    }
    
  } else if (itemName == "rs" || itemName == "col") {
    
    // set the name of the parameter to the column name
    if (NAME_PREV_COL == "" || 
        paramName.getValue() == "" || 
        NAME_PREV_COL == paramName.getValue()) {
      var newValue = col.getValue();
      paramName.setValue(newValue);
      NAME_PREV_COL = newValue;
    }
    
  }
}

