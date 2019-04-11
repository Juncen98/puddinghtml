// Copyright 2003 Macromedia, Inc. All rights reserved.

//*************** GLOBALS VARS *****************

var LIST_ACCESSLEVELS;
var TEXT_GOTOURLONFAILURE;
var RG_SECURITYMETHOD;

var EMPTY_LIST = new Array("");


//******************* API **********************

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
  var retVal = true;
  
  if (!sbObj)
  {
    // attempting to add the behavior - check to see if one already exists on the page
    var ourSBs = dwscripts.getServerBehaviorsByFileName("Restrict Access To Page.htm");
    if (ourSBs.length != 0)
    {
      alert(MM.MSG_OnlyOneInstanceAllowed);
      retVal = false;
    }
    else
    {
      // check to see if login already exists
      var loginSB = dwscripts.getServerBehaviorsByFileName("Login User.htm");
      if (loginSB.length != 0)
      {
        alert(MM.MSG_RestAccessLoginPage);
        retVal = false;
      }
    }
  }
  
  return retVal;
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
  sbArray = dwscripts.findSBs(MM.LABEL_TitleRestrictAccess + " (@@accessLevels@@)");
  
  return sbArray;
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
  var errMsg = "";
  var paramObj = new Array();
  
  paramObj.failureURL = TEXT_GOTOURLONFAILURE.value;
  paramObj.accessLevels = getAuthorizationList();
  
  var dontUseLevels = (RG_SECURITYMETHOD.getSelectedValue() != "UseAccessLevel");
  paramObj.dontUseAccessLevel = dontUseLevels.toString();

  if (paramObj.failureURL == "")
  {
    errMsg = MM.MSG_MustSupplyUnauthorizedURL;
  } 
  else if (!dontUseLevels && getSecurityMethodFromNotes() != "useAccessList")
  {
    alert(MM.MSG_AccessListNotEnabled);
  } 
  else if (!dontUseLevels && paramObj.accessLevels.length == 0)
  {
    errMsg = MM.MSG_NoAccessLevelsSelected;
  }
  var validReg = /\s/;
  var validwordReg = /\w/;
  var  validSuccessIdx = (paramObj.failureURL).search(validReg);
 
   if ( validSuccessIdx >= 0)  
  {
    validSuccessIdx=(paramObj.failureURL).search(validwordReg);
	if( validSuccessIdx == -1)
    errMsg = MM.MSG_MustSupplyUnauthorizedURL;
  }
  if (errMsg=="")
  {
    paramObj.MM_username = MM_USERNAME;
    paramObj.MM_userAuthorization = "MM_UserGroup";
    
    dwscripts.applySB(paramObj, sbObj);
  }
  
  return errMsg;
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
  TEXT_GOTOURLONFAILURE.value = sbObj.getParameter("failureURL");
  
  var arrAccessLevels = new Array();  
  if (dwscripts.trim(sbObj.getParameter("accessLevels")) != "")
  {
    arrAccessLevels = sbObj.getParameter("accessLevels").split(",");
  }
  var unknownAuthorizations = selectAccessLevels(arrAccessLevels);
  
  if (sbObj.getParameter("dontUseAccessLevel") == "false") // use access levels if set to false
  {
    RG_SECURITYMETHOD.setSelectedValue("UseAccessLevel");
    onClickUseAccessLevel();
    if (getSecurityMethodFromNotes() != "useAccessList")
    {
      alert(MM.MSG_RestAccessWrongProtType);
    }
  }
  
  if (unknownAuthorizations.length > 0)
  {
    var msg = dwscripts.sprintf(MM.MSG_UnknownAccessLevels,unknownAuthorizations.toString());
    if (confirm(msg))
    {
      var knownAuthLevels = getAccessLevelsFromNotes();
      putAccessLevelsToNotes(knownAuthLevels.concat(unknownAuthorizations));
      initializeUI();
      selectAccessLevels(arrAccessLevels);
    }
  }
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
  dwscripts.deleteSB(sbObj);
  return true;
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


/*
function copyServerBehavior(sbObj) {
  return true; // everything of consequence is already a string
}


function pasteServerBehavior(sbObj) {
  priorRec = getssRecByType("RestrictAccess"); 
  var editList = buildSSEdits(priorRec,sbObj.accessLevels,sbObj.failureURL);
  editList.insert();
}
*/


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
  LIST_ACCESSLEVELS   = new ListControl("listAccessLevels");
  TEXT_GOTOURLONFAILURE = dwscripts.findDOMObject("textGoToURLOnFailure");
  RG_SECURITYMETHOD = new RadioGroup("securityMethod");

  LIST_ACCESSLEVELS.setAll(getAccessLevelsFromNotes());
  var ops = LIST_ACCESSLEVELS.object.options
  for (i=0; i<ops.length; i++)
  {
    ops[i].selected = false;
  }

  onClickDontUseAccessLevel();

  elts = document.forms[0].elements;
  if (elts && elts.length)
    elts[0].focus();
}


function onClickBtnDefineAuthLevels()
{
  MM.retVal = "";
  
  var authorizationsList = getAuthorizationList();
  dreamweaver.popupCommand("Define Access Levels.htm");
  if (MM.retVal == "OK")
  {
    LIST_ACCESSLEVELS.setAll(getAccessLevelsFromNotes());
  }
  selectAccessLevels(authorizationsList);
}


function onClickDontUseAccessLevel()
{
  LIST_ACCESSLEVELS.disable();
}


function onClickUseAccessLevel()
{
  LIST_ACCESSLEVELS.enable();
}


function onClickBtnFileBrowserOnFailure()
{
  dwscripts.browseFile(TEXT_GOTOURLONFAILURE);
}


function getAuthorizationList()
{
	var authorizations = new Array();
  var ops = LIST_ACCESSLEVELS.object.options
  for (i=0; i<ops.length; i++) 
  {
    if (ops[i].selected)
    {
      authorizations.push(String(ops[i].text));
    }
  }
  return authorizations;
}


function selectAccessLevels(arrAuthLevels)
{
	var ops = LIST_ACCESSLEVELS.object.options
  var unknownAuthorizations = new Array();
  var found;
  for (var iAuth=0; iAuth<arrAuthLevels.length; iAuth++)
  {
    found = false;
    for (var i=0; i<ops.length; i++)
    {
      if (String(ops[i].text) == arrAuthLevels[iAuth])
      {
        ops[i].selected = true;
        found=true;
        break;
      }
    }
    if (!found)
    {
      unknownAuthorizations.push(arrAuthLevels[iAuth]);
    }
  }
  
  return unknownAuthorizations;
}

