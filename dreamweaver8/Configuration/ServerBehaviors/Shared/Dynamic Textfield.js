// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

//*************** GLOBALS VARS *****************

var HELP_DOC        = MM.HELP_ssDynamicTextField;

var textNode = new TagMenu("Dynamic Textfield.htm", "textNode", "INPUT/TEXT,TEXTAREA,INPUT/PASSWORD,INPUT/HIDDEN"); // need TEXTAREA
var expression1 = new DynamicExpressionTextfield("Dynamic Textfield.htm", "expression1");


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
  var sbList = dwscripts.findSBs(MM.LABEL_DynamicTextfieldTitle);

  //Fixes the title for textarea instances. For dynamic textareas, we find directives, so
  //we can't get the name of the text area using a normal search pattern. Here we find
  //titles without names, and use the name from the parent node.
  for (var i=0; i<sbList.length; i++)
  {
    // remove items which are not textarea or input tags
    var tNode = sbList[i].parameters.textNode;
    
    // Special case check for the dynamic textarea for cold fusion. There was
    // a change in the way cfoutput inside of a textarea is parsed for DW MX
    // 2004, so we need to make this check to fix the dynamic textarea SB.
    // Server model specific code should not be in this shared file, but we
    // are running close to the end of beta, and this seemed the easiest
    // change.
    if (   tNode && dw.nodeExists(tNode) && tNode.tagName == "CFOUTPUT" 
        && tNode.parentNode && tNode.parentNode.tagName == "TEXTAREA"
       )
    {
      // Fix up the participant node so deletion of the dynamic textarea will work.
      var partList = sbList[i].getParticipants();
      if (partList && partList.length == 1)
      {
        partList[0].node = tNode;
      }

      // Fix up the selectedNode.
      sbList[i].selectedNode = tNode;
      
      // Update the textarea node.
      sbList[i].parameters.textNode = tNode.parentNode;
      tNode = sbList[i].parameters.textNode;
    }
    
    if (!tNode || !dw.nodeExists(tNode) || (tNode.tagName != "TEXTAREA" && tNode.tagName != "INPUT"))
    {
      sbList[i].deleted = true;
      continue;
    }
    
    if (sbList[i].title.indexOf("@@theName@@")!=-1 && sbList[i].parameters.textNode)
    {
      var theName = sbList[i].parameters.textNode.name;
      if (theName) {
        sbList[i].title = sbList[i].title.replace(/@@theName@@/,theName);
      }
    }
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
    success = textNode.canApplyServerBehavior(sbObj);

  if (success)
    success = expression1.canApplyServerBehavior(sbObj);

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

  if (!errStr) {
    errStr = textNode.applyServerBehavior(sbObj, paramObj);

    if (paramObj.textNode.tagName && paramObj.textNode.tagName.toUpperCase() == "TEXTAREA") {
      paramObj.MM_subType = "textarea";
    }
  }

  if (!errStr) {
    errStr = expression1.applyServerBehavior(sbObj, paramObj, MM.MSG_NothingEntered);
  }

  if (!errStr) {
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

  success = textNode.inspectServerBehavior(sbObj);
  success = expression1.inspectServerBehavior(sbObj);
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
  textNode.deleteServerBehavior(sbObj);
  expression1.deleteServerBehavior(sbObj);
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
  textNode.analyzeServerBehavior(sbObj, allRecs);
  expression1.analyzeServerBehavior(sbObj, allRecs);
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
  textNode.initializeUI();
  expression1.initializeUI();

  elts = document.forms[0].elements;
  if (elts && elts.length)
    elts[0].focus();
}

