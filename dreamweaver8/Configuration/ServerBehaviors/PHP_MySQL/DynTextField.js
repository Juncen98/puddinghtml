// Copyright 2002, 2003 Macromedia, Inc. All rights reserved.

var HELP_DOC = MM.HELP_ssDynamicTextField;

var _input_type_text__tag = new TagMenu("DynTextField.htm", "input_type_text__tag", "INPUT/TEXT,TEXTAREA,INPUT/PASSWORD,INPUT/HIDDEN");
var _expression1 = new DynamicTextField("DynTextField.htm", "expression1", "");


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

  _input_type_text__tag.initializeUI();
  _expression1.initializeUI();

  elts = document.forms[0].elements;
  if (elts && elts.length)
    elts[0].focus();
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
  var sbList = dwscripts.findSBs(MM.LABEL_DynamicTextfieldTitle);

  //Fixes the title for textarea instances. For dynamic textareas, we find directives, so
  //we can't get the name of the text area using a normal search pattern. Here we find
  //titles without names, and use the name from the parent node.
  for (var i=0; i<sbList.length; i++)
  {
    // remove items which are not textarea or input tags
    var tNode = sbList[i].parameters.input_type_text__tag;
    if (!tNode || !dw.nodeExists(tNode) || (tNode.tagName != "TEXTAREA" && tNode.tagName != "INPUT"))
    {
      sbList[i].deleted = true;
      continue;
    }
    
    if (sbList[i].title.indexOf("@@theName@@")!=-1 && sbList[i].parameters.input_type_text__tag)
    {
      var theName = sbList[i].parameters.input_type_text__tag.name;
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
  {
    success = _input_type_text__tag.canApplyServerBehavior(sbObj);
  }
  if (success)
  {
    success = _expression1.canApplyServerBehavior(sbObj);
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
    errStr = _input_type_text__tag.applyServerBehavior(sbObj, paramObj);

    if (paramObj.input_type_text__tag.tagName && paramObj.input_type_text__tag.tagName.toUpperCase() == "TEXTAREA") {
      paramObj.MM_subType = "textarea";
    }
  
  }
  if (!errStr)
  {
    errStr = _expression1.applyServerBehavior(sbObj, paramObj);
  }

  if (!errStr)
  {
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
  _input_type_text__tag.inspectServerBehavior(sbObj);
  _expression1.inspectServerBehavior(sbObj);
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
  _input_type_text__tag.deleteServerBehavior(sbObj);
  _expression1.deleteServerBehavior(sbObj);

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
  _input_type_text__tag.analyzeServerBehavior(sbObj, allRecs);
  _expression1.analyzeServerBehavior(sbObj, allRecs);
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

    if (_input_type_text__tag.updateUI != null)
    {
      _input_type_text__tag.updateUI(controlObj, event);
    }
    if (_expression1.updateUI != null)
    {
      _expression1.updateUI(controlObj, event);
    }
  }
}
