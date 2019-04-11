// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

//*************** GLOBALS VARS *****************

var HELP_DOC = MM.HELP_ssMoveTo;

var SB_NAME = dwscripts.getSBFileName();

var rsName = new RecordsetMenu(SB_NAME, "rsName");
var linkNode = new TagMenu(SB_NAME, "linkNode", "A");

                                
//******************* API **********************

//--------------------------------------------------------------------
// FUNCTION:
//   findServerBehaviors
//
// DESCRIPTION:
//   Returns an array of ServerBehavior objects, each one representing
//   an instance of this Server Behavior on the page
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   JavaScript Array of ServerBehavior objects
//--------------------------------------------------------------------
function findServerBehaviors()
{
  var paramObj = new Object();

  rsName.findServerBehaviors(paramObj);
  linkNode.findServerBehaviors(paramObj);

  var sbList = dwscripts.findSBs(getNewTitle());
  
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
//   Returns true if a Server Behavior can be applied to the current
//   document
//
// ARGUMENTS:
//   sbObj - ServerBehavior object - one of the objects returned
//           from findServerBehaviors
//
// RETURNS:
//   boolean - true if the behavior can be applied, false otherwise
//--------------------------------------------------------------------
function canApplyServerBehavior(sbObj)
{
  var success = true;

  if (success)
    success = rsName.canApplyServerBehavior(sbObj);

  if (success)
    success = linkNode.canApplyServerBehavior(sbObj);

  return success;
}


//--------------------------------------------------------------------
// FUNCTION:
//   applyServerBehavior
//
// DESCRIPTION:
//   Collects values from the form elements in the dialog box and
//   adds the Server Behavior to the user's document
//
// ARGUMENTS:
//   sbObj - ServerBehavior object - one of the objects returned
//           from findServerBehaviors
//
// RETURNS:
//   string - empty upon success, or an error message
//--------------------------------------------------------------------
function applyServerBehavior(sbObj)
{
  var paramObj = new Object();
  var errStr = "";

  if (!errStr)
    errStr = rsName.applyServerBehavior(sbObj, paramObj);

  if (!errStr)
    errStr = linkNode.applyServerBehavior(sbObj, paramObj);
    
  if (!errStr) {
    paramObj.type = MOVE_TYPE;
    var parameters = getExistingParameters();
    if (parameters) {
      paramObj.col = parameters.col;
      paramObj.paramName = parameters.paramName;
    } else {
      paramObj.col = "";
      paramObj.paramName = "";
    }
  }
  
  if (!errStr) {
    setMoveToParamsForJsp(paramObj);
  }

  if (!errStr)
  {
    dwscripts.fixUpSelection(dw.getDocumentDOM(), true, true);
    dwscripts.applySB(paramObj,sbObj);
  }

  return errStr;
}


//--------------------------------------------------------------------
// FUNCTION:
//   inspectServerBehavior
//
// DESCRIPTION:
//   Sets the values of the form elements in the dialog box based
//   on the given ServerBehavior object
//
// ARGUMENTS:
//   sbObj - ServerBehavior object - one of the objects returned
//           from findServerBehaviors
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function inspectServerBehavior(sbObj)
{
  var success = true;

  if (success)
    success = rsName.inspectServerBehavior(sbObj);
    
  if (success)
    success = linkNode.inspectServerBehavior(sbObj);
}


//--------------------------------------------------------------------
// FUNCTION:
//   deleteServerBehavior
//
// DESCRIPTION:
//   Remove the specified Server Behavior from the user's document
//
// ARGUMENTS:
//   sbObj - ServerBehavior object - one of the objects returned
//           from findServerBehaviors
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function deleteServerBehavior(sbObj)
{
  rsName.deleteServerBehavior(sbObj);
  linkNode.deleteServerBehavior(sbObj);
  dwscripts.deleteSB(sbObj);
}


//--------------------------------------------------------------------
// FUNCTION:
//   analyzeServerBehavior
//
// DESCRIPTION:
//   Performs extra checks needed to determine if the Server Behavior
//   is complete
//
// ARGUMENTS:
//   sbObj - ServerBehavior object - one of the objects returned
//           from findServerBehaviors
//   allRecs - JavaScripts Array of ServerBehavior objects - all of the
//             ServerBehavior objects known to Dreamweaver
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function analyzeServerBehavior(sbObj, allRecs)
{
  rsName.analyzeServerBehavior(sbObj, allRecs);
  linkNode.analyzeServerBehavior(sbObj, allRecs);
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
//   Prepare the dialog and controls for user input
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function initializeUI()
{
  rsName.initializeUI("rs");
  linkNode.initializeUI(getNewLinkLabel());

  var parameters = getExistingParameters();
  if (parameters && parameters.rsName) {
    rsName.listControl.pickValue(parameters.rsName);
  }

  elts = document.forms[0].elements;
  if (elts && elts.length)
    elts[0].focus();
}


//get the parameters from an existing behavior which includes the 
// moveTo_declareVars participant
function getExistingParameters()
{
  var retVal = null;
  
  var ssRecs = dw.serverBehaviorInspector.getServerBehaviors();  
  for (var i=0; !retVal && i < ssRecs.length; i++) { 
    for (j=0; !retVal && j < ssRecs[i].participants.length; j++) { 
      if (ssRecs[i].types[j] == "moveTo_declareVars") {
        retVal = ssRecs[i].parameters;
      }
    }
  }
  
  return retVal;
}


function getNewLinkLabel()
{
  var newLabel = "";
  
  switch (SB_NAME) {
  case "Move To First Record.htm":
    newLabel = MM.LABEL_NewMoveToFirstLinkLabel;
    break;
  case "Move To Previous Record.htm":
    newLabel = MM.LABEL_NewMoveToPrevLinkLabel;
    break;
  case "Move To Next Record.htm":
    newLabel = MM.LABEL_NewMoveToNextLinkLabel;
    break;
  case "Move To Last Record.htm":
    newLabel = MM.LABEL_NewMoveToLastLinkLabel;
    break;
  }
  
  return newLabel;
}


function getNewTitle()
{
  var newTitle = "";
  
  if (repeatedRegionExists()) {
    switch (SB_NAME) {
    case "Move To First Record.htm":
      newTitle = MM.LABEL_TitleMoveToFirstPlural;
      break;
    case "Move To Previous Record.htm":
      newTitle = MM.LABEL_TitleMoveToPrevPlural;
      break;
    case "Move To Next Record.htm":
      newTitle = MM.LABEL_TitleMoveToNextPlural;
      break;
    case "Move To Last Record.htm":
      newTitle = MM.LABEL_TitleMoveToLastPlural;
      break;
    }
  } else {
    switch (SB_NAME) {
    case "Move To First Record.htm":
      newTitle = MM.LABEL_TitleMoveToFirst;
      break;
    case "Move To Previous Record.htm":
      newTitle = MM.LABEL_TitleMoveToPrev;
      break;
    case "Move To Next Record.htm":
      newTitle = MM.LABEL_TitleMoveToNext;
      break;
    case "Move To Last Record.htm":
      newTitle = MM.LABEL_TitleMoveToLast;
      break;
    }
  }
  
  return newTitle + " (@@rsName@@)";
}


function repeatedRegionExists()
{
  var retVal = false;
  
  var ssRecs = dw.serverBehaviorInspector.getServerBehaviors();  
  for (var i=0; !retVal && i < ssRecs.length; i++) {
    if (ssRecs[i].serverBehavior == "Repeated Region.htm") {
      retVal = true;
    }
  }
  
  return retVal;
}
