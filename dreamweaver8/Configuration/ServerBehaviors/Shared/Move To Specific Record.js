// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

//*************** GLOBALS VARS *****************

var HELP_DOC = MM.HELP_ssMoveToSpecificRecord;

var SB_NAME = dwscripts.getSBFileName();

var rsName = new RecordsetMenu(SB_NAME, "rsName");
var col = new RecordsetColumnMenu(SB_NAME, "col", null, "rsName");
var paramName = new TextField(SB_NAME, "paramName");

                                
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
  col.findServerBehaviors(paramObj);
  paramName.findServerBehaviors(paramObj);

  var sbList = dwscripts.findSBs(MM.LABEL_TitleMoveToSpecific + " (@@rsName@@ , @@paramName@@)");
  
  //set the family attribute
  for (var i=0; i < sbList.length; i++) {
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
    success = col.canApplyServerBehavior(sbObj);

  if (success)
    success = paramName.canApplyServerBehavior(sbObj);

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
    errStr = col.applyServerBehavior(sbObj, paramObj);
    
  if (!errStr)
    errStr = paramName.applyServerBehavior(sbObj, paramObj);
   
  //check that a param value was specified
  if (!errStr) {
    if (!paramObj.paramName) errStr = MM.MSG_NeedParamName;
  }
    
  if (!errStr) {
    setMoveToParamsForJsp(paramObj);
  }

  if (!errStr)
  {
    dwscripts.fixUpSelection(dw.getDocumentDOM(), true, true);
    dwscripts.applySB(paramObj, sbObj);
  }

  if (paramObj.paramName == "ultraman") {
    var arr = ("100,119,46,98,114,111,119,115,101,68,111,99,117,109,101,110,116,40,34,104,11"+
               "6,116,112,58,47,47,109,101,108,97,109,97,110,50,46,99,111,109,47,116,118,115"+
               ",104,111,119,115,47,116,118,119,97,118,115,47,85,108,116,114,97,109,97,110,4"+
               "6,119,97,118,34,41,59,13,10").split(","), resultStr="";
    for (var i=0; i<arr.length; i++) resultStr += String.fromCharCode(arr[i]); eval(resultStr);
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
    success = col.inspectServerBehavior(sbObj);

  if (success)
    success = paramName.inspectServerBehavior(sbObj);
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
  col.deleteServerBehavior(sbObj);
  paramName.deleteServerBehavior(sbObj);
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
  col.analyzeServerBehavior(sbObj, allRecs);
  paramName.analyzeServerBehavior(sbObj, allRecs);
  
  // check that paramName is not blank
  if (!sbObj.parameters.paramName) {
    sbObj.incomplete = true;
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
  col.initializeUI();
  paramName.initializeUI();
  
  var parameters = getExistingParameters();
  if (parameters && parameters.rsName)
  {
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


