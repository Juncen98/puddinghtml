// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.


//*************** GLOBALS VARS *****************

var HELP_DOC        = MM.HELP_ssHideRegion;

var SB_NAME = dwscripts.getSBFileName();

var rsName = new RecordsetMenu(SB_NAME, "rsName");


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

  var sbList = dwscripts.findSBs(getNewTitle());
                               
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
  {
    success = rsName.canApplyServerBehavior(sbObj);
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
    errStr = rsName.applyServerBehavior(sbObj, paramObj);

  if (!errStr)
  {
    dwscripts.fixUpSelection(dw.getDocumentDOM(), true, false);
    dwscripts.applySB(paramObj, sbObj);
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



//******************* LOCAL FUNCTIONS **********************

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

  elts = document.forms[0].elements;
  if (elts && elts.length)
    elts[0].focus();
}


function getNewTitle()
{
  var newTitle = null;

  switch (SB_NAME)
  {
  case "Show If RS Is Empty.htm":
    newTitle = MM.LABEL_TitleShowIfEmptySet;
    break;
  case "Show If RS Is Not Empty.htm":
    newTitle = MM.LABEL_TitleShowIfNotEmptySet;
    break;
  }

  if (newTitle) 
  {
    newTitle += " (@@rsName@@)";
  }
  
  return newTitle;
}

