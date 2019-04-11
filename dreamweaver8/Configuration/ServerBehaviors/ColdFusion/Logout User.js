// Copyright 2002, 2003 Macromedia, Inc. All rights reserved.

//*************** GLOBALS VARS *****************

var  _linkTag = new TagMenu("Logout User.htm", "linkTag", "A");
var  _redirectPage = new URLTextField("Logout User.htm", "redirectPage", "");

var  RG_LOGOUTWHEN;

var  EMPTY_LIST = new Array("");


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
    var ourSBs = dwscripts.getServerBehaviorsByFileName("Logout User.htm");
    if (ourSBs.length != 0)
    {
      alert(MM.MSG_OnlyOneInstanceAllowed);
      retVal = false;
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
  sbArray = dwscripts.findSBs(MM.LABEL_TitleLogoutUser);
  
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
    
  if (!errMsg)
  {
    errMsg = _linkTag.applyServerBehavior(sbObj, paramObj);
  }

  if (!errMsg)
  {
    errMsg = _redirectPage.applyServerBehavior(sbObj, paramObj, MM.MSG_MustSupplyRedirectPage);
  }
  
  if (errMsg == "")
  {
    if (RG_LOGOUTWHEN.getSelectedValue() == "logoutWhenPageLoads")
    {
      paramObj.MM_subType = "NoLink";
    }
    
    paramObj.MM_username = MM_USERNAME;
    paramObj.MM_userAuthorization = MM_USERAUTHORIZATION;
    
    dwscripts.applySB(paramObj, sbObj);
  }
  
  return errMsg
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
  _redirectPage.inspectServerBehavior(sbObj);
  
  if (sbObj.getSubType() != "NoLink")
  {
    _linkTag.inspectServerBehavior(sbObj);
  } 
  else 
  {
    RG_LOGOUTWHEN.setSelectedValue("logoutWhenPageLoads")
    _linkTag.listControl.disable();
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
  _linkTag.initializeUI(MM.LABEL_LogoutNewLinkLabel);
  
  _redirectPage.initializeUI();
  
  RG_LOGOUTWHEN = new RadioGroup("logoutWhen");

  elts = document.forms[0].elements;
  if (elts && elts.length)
    elts[0].focus();
}

function onClickLogoutWhenLinkClicked()
{
  _linkTag.listControl.enable();
}

function onClickLogoutWhenPageLoads()
{
  _linkTag.listControl.disable();
}

function onChangeLink() 
{
}

function onClickBtnFileBrowser()
{
  _redirectPage.browseForFile();
}

