// Copyright 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

//*************** GLOBALS VARS *****************

var HELP_DOC         = MM.HELP_ssDynamicCheckBox;

var chbxNode = new TagMenu("Dynamic Checkbox.htm", "chbxNode", "INPUT/CHECKBOX");
var expression1 = new DynamicExpressionTextfield("Dynamic Checkbox.htm", "expression1");
var expression2 = new DynamicExpressionTextfield("Dynamic Checkbox.htm", "expression2");


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

  var sbList = dwscripts.findSBs(MM.LABEL_DynCheckboxTitle);

  for (var i=0; i<sbList.length; i++)
  {
    // update the title with the name of the checkbox
    if (!sbList[i].getParameter("theName"))
    {
      var chbxNode = sbList[i].getParameter("chbxNode");
      if (chbxNode && chbxNode.getAttribute("name"))
      {
        sbList[i].setParameter("theName", chbxNode.getAttribute("name"));
      }
      else
      {
        sbList[i].setParameter("theName","");
      }
      
      var sbTitle = sbList[i].getTitle();
      sbTitle = sbTitle.replace(/@@theName@@/,sbList[i].getParameter("theName"));
      sbList[i].setTitle(sbTitle);
    }
    
    //We need special purpose attributes attached to ssRec to support the DBI/PI in C++.
    //so please do not remove them.
    sbList[i].selectionexp = extractDynamicExpression(sbList[i].parameters.expression1);
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
    success = chbxNode.canApplyServerBehavior(sbObj);

  if (success)
    success = expression1.canApplyServerBehavior(sbObj);

  if (success)
    success = expression2.canApplyServerBehavior(sbObj);

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

  if (applyServerBehavior.arguments.length > 1) {
    
    //we are being called silently, by the data bindings inspector
    paramObj.chbxNode = applyServerBehavior.arguments[0];
    paramObj.expression1 = formatDynamicExpression(applyServerBehavior.arguments[1]);
    paramObj.expression2 = "\"1\"";
    
    sbObj = null;
    
  } else {
    
    if (!errStr)
      errStr = chbxNode.applyServerBehavior(sbObj, paramObj);

    if (!errStr)
      errStr = expression1.applyServerBehavior(sbObj, paramObj,MM.MSG_NeedDynamicCheckboxValue);

    if (!errStr)
      errStr = expression2.applyServerBehavior(sbObj, paramObj,MM.MSG_NeedCheckboxBooleanValue);
  }

	if (!errStr) {
	  var serverModel = dwscripts.getServerModel();
		paramObj.checked = 'checked="checked"';

		if (serverModel.match(/(?:PHP|ASP_JS|JSP)/i)) {
			paramObj.checked = paramObj.checked.replace(/"/g, '\\"');
		}
		if (serverModel.match(/(?:ASP_VB)/i)) {
			paramObj.checked = paramObj.checked.replace(/"/g, '""');
		}
	}

  if (!errStr)
    dwscripts.applySB(paramObj,sbObj);

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

  success = chbxNode.inspectServerBehavior(sbObj);
  success = expression1.inspectServerBehavior(sbObj);
  success = expression2.inspectServerBehavior(sbObj);
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
  chbxNode.deleteServerBehavior(sbObj);
  expression1.deleteServerBehavior(sbObj);
  expression2.deleteServerBehavior(sbObj);
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
  chbxNode.analyzeServerBehavior(sbObj, allRecs);
  expression1.analyzeServerBehavior(sbObj, allRecs);
  expression2.analyzeServerBehavior(sbObj, allRecs);

  //delete this if any other server behavior is using the same participant
  for (var i=0; i<allRecs.length; i++) {
    var thisRec = allRecs[i]
    if ((thisRec != sbObj) && (thisRec.type != sbObj.type)) {
      for (j=0; j<thisRec.participants.length; j++) {
        if (thisRec.participants[j] == sbObj.participants[0] &&
            (sbObj.title != thisRec.title || (sbObj.subType && sbObj.subType == "UD1"))) {
          sbObj.deleted = true;
          break;
  } } } }
  
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
  chbxNode.initializeUI();
  expression1.initializeUI();
  expression2.initializeUI();

  elts = document.forms[0].elements;
  if (elts && elts.length)
    elts[0].focus();
}

