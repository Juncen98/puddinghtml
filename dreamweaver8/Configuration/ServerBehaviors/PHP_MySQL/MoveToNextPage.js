// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

// *************** GLOBALS VARS *****************

var HELP_DOC = MM.HELP_ssMoveTo;

var SB_NAME = dwscripts.getSBFileName();

var _a__tag = new TagMenu(SB_NAME, "a__tag", "A");
var _RecordsetName = new RecordsetMenu(SB_NAME, "RecordsetName", "");
var _Parameters = new TextField(SB_NAME, "Parameters", "");


// ******************* API **********************

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
  var elts;

  _a__tag.initializeUI(MM.LABEL_NewMoveToNextLinkLabel);
  _RecordsetName.initializeUI();
  _Parameters.initializeUI();

  var rsToPick = dwscripts.getRecordsetNameWithPageNav();
  if (rsToPick)
  {
    _RecordsetName.pickValue(rsToPick);
  }
  
  elts = document.forms[0].elements;
  if (elts && elts.length > 1)
    elts[1].focus();
}


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
  _a__tag.findServerBehaviors();
  _RecordsetName.findServerBehaviors();
  _Parameters.findServerBehaviors();

  sbArray = dwscripts.findSBs(MM.LABEL_TitleMoveToNextPage + " (@@RecordsetName@@)");

  return sbArray;
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
  {
    success = _a__tag.canApplyServerBehavior(sbObj);
  }
  if (success)
  {
    success = _RecordsetName.canApplyServerBehavior(sbObj);
  }
  if (success)
  {
    success = _Parameters.canApplyServerBehavior(sbObj);
  }
  if (success)
  {
    success = dwscripts.canApplySB(sbObj, false); // preventNesting is false
  }
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
  {
    errStr = _a__tag.applyServerBehavior(sbObj, paramObj);
  }
  if (!errStr)
  {
    errStr = _RecordsetName.applyServerBehavior(sbObj, paramObj);
  }
  if (!errStr)
  {
    errStr = _Parameters.applyServerBehavior(sbObj, paramObj);
  }

  if (!errStr)
  {
    // check if a page navigation repeat region exists for this recordset
    dwscripts.warnIfNoPageNavDisplay(paramObj["RecordsetName"],true);
    
    var sbRecordset = dwscripts.getServerBehaviorByParam("Recordset.htm","RecordsetName",paramObj["RecordsetName"]);
    if (sbRecordset)
    {
      var newRS = sbRecordset.makeEditableCopy() ;
      newRS.setDefaultPageSize();
      newRS.queueDocEdits();
    }
  }

  if (!errStr)
  {
    dwscripts.fixUpSelection(dw.getDocumentDOM(), true, true);
    dwscripts.applySB(paramObj, sbObj)
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
  _a__tag.inspectServerBehavior(sbObj);
  _RecordsetName.inspectServerBehavior(sbObj);
  _Parameters.inspectServerBehavior(sbObj);
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
  _a__tag.deleteServerBehavior(sbObj);
  _RecordsetName.deleteServerBehavior(sbObj);
  _Parameters.deleteServerBehavior(sbObj);

  var sbRecordset = dwscripts.getServerBehaviorByParam("Recordset.htm","RecordsetName",sbObj.getParameter("RecordsetName"));
  if (sbRecordset)
  {
    var newRS = sbRecordset.makeEditableCopy() ;
    newRS.updatePageSize(sbObj);
    newRS.queueDocEdits();
  }

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
  _a__tag.analyzeServerBehavior(sbObj, allRecs);
  _RecordsetName.analyzeServerBehavior(sbObj, allRecs);
  _Parameters.analyzeServerBehavior(sbObj, allRecs);
  
  var rsName = sbObj.getParameter("RecordsetName")
  sbObj.setParameter("NeedsPageSize_" + rsName, true);
}


//--------------------------------------------------------------------
// FUNCTION:
//   updateUI
//
// DESCRIPTION:
//   Called from controls to update the dialog based on user input
//
// ARGUMENTS:
//   controlName - string - the name of the control which called us
//   event - string - the name of the event which triggered this call
//           or null
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function updateUI(controlName, event)
{
  if (window["_" + controlName] != null)
  {
    var controlObj = window["_" + controlName];

    if (_a__tag.updateUI != null)
    {
      _a__tag.updateUI(controlObj, event);
    }
    if (_RecordsetName.updateUI != null)
    {
      _RecordsetName.updateUI(controlObj, event);
    }
    if (_Parameters.updateUI != null)
    {
      _Parameters.updateUI(controlObj, event);
    }
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
