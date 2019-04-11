// Copyright 2002, 2003 Macromedia, Inc. All rights reserved.

//*************** GLOBALS VARS *****************

var LIST_FORMELEMENT;
var EDIT_GOTOURLONUSERNAMEEXISTS;

var EMPTY_LIST = new Array("");

var INSERT_SB_FILENAME = "InsertRecord.htm";


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
  var success = true;
  if (!sbObj) 
  {
    // attempting to add the behavior - check to see if one already exists on the page
    var ourSBs = dwscripts.getServerBehaviorsByFileName("Check New Username.htm");
    if (ourSBs.length != 0)
    {
      alert(MM.MSG_OnlyOneInstanceAllowed);
      success=false;
    }
  } 

  if (success)
  {
    var insertSBs = dwscripts.getServerBehaviorsByFileName(INSERT_SB_FILENAME);
    if (insertSBs.length == 0)
    {
      if (sbObj != null)
      {
        alert(MM.MSG_InsertBehaviorMissing);
      } 
      else 
      {
        alert(MM.MSG_MustHaveInsertBehavior);
      }
      success = false;
    }
  }

  if (success && (sbObj != null) && sbObj.incomplete)
  {
    alert(MM.MSG_OutOfSyncWithInsert);
  }
  
  return success;
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
  sbArray = dwscripts.findSBs(MM.LABEL_TitleRedirectIfUsernameFound);

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
  var paramObj = new Object();
  var errStr = "";

  if (EDIT_GOTOURLONUSERNAMEEXISTS.value == "")
  {
    errStr = MM.MSG_MustSupplyRedirectPage;
  }
  
  if (!errStr)
  {
    var formField = LIST_FORMELEMENT.getValue();
    
    var insertSBs = dwscripts.getServerBehaviorsByFileName(INSERT_SB_FILENAME);
    if (insertSBs.length != 0)
    {
      var insertSB = insertSBs[0];
      
      var columnName = insertSB.getColumnNameForFormElement(formField);
      if (columnName)
      {
        paramObj.FormField      = formField;
        paramObj.ColumnName     = columnName;
        paramObj.RedirectURL    = EDIT_GOTOURLONUSERNAMEEXISTS.value;
        paramObj.ConnectionName = insertSB.getParameter("ConnectionName");
        paramObj.UserName       = insertSB.getParameter("UserName");
        paramObj.Password       = insertSB.getParameter("Password");
        paramObj.TableName      = insertSB.getParameter("TableName");
      }
      else
      {
        errStr = MM.MSG_NoFormElementFound;
      }
      
    } 
    else
    {
      errStr = MM.MSG_NoInsertBehavior;
    }    
  }
  
  if (!errStr)
  {
    dwscripts.applySB(paramObj, sbObj)
  }
  return errStr;
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
  var idxBinding;
  
  // Reset incomplete flag, in case we are called again without
  //  findServerBehaviors being called.
  sbObj.incomplete = false;

  var insertSBs = dwscripts.getServerBehaviorsByFileName(INSERT_SB_FILENAME);
  if (insertSBs.length != 0)
  {
    var insertSB = insertSBs[0];
    
    var columnName = insertSB.getColumnNameForFormElement(sbObj.getParameter("FormField"));
    if (columnName)
    {
      if (columnName != sbObj.getParameter("ColumnName"))
      {
        sbObj.incomplete = true;
      }
      if (insertSB.getParameter("ConnectionName") != sbObj.getParameter("ConnectionName"))
      {
        sbObj.incomplete = true;
      }
      if (insertSB.getParameter("TableName") != sbObj.getParameter("TableName"))
      {
        sbObj.incomplete = true;
      }
    }
    else 
    { // can't find the username form element in the insert behavior.
      sbObj.incomplete = true;
    }
    
  } 
  else
  {
    sbObj.incomplete = true;
  }
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
  // select form in form list
  EDIT_GOTOURLONUSERNAMEEXISTS.value = sbObj.getParameter("RedirectURL");
  LIST_FORMELEMENT.pickValue(sbObj.getParameter("FormField"));
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
  var insertSBs = dwscripts.getServerBehaviorsByFileName(INSERT_SB_FILENAME);
  if (insertSBs.length != 0)
  {
    var insertSB = insertSBs[0];
    
    // get the bound form elements from the insert behavior
    var formElementNames = insertSB.getFormElementNames();
    LIST_FORMELEMENT = new ListControl("listFormElement");
    LIST_FORMELEMENT.setAll(formElementNames,formElementNames);
    
    EDIT_GOTOURLONUSERNAMEEXISTS = dwscripts.findDOMObject("textGoToURLOnUsernameExists");
  } 
  else
  {
    alert(MM.MSG_NoInsertBehavior);
  }

  elts = document.forms[0].elements;
  if (elts && elts.length)
    elts[0].focus();
}


//--------------------------------------------------------------------
// FUNCTION:
//   onClickBtnFileBrowserOnUsernameExists
//
// DESCRIPTION:
//   As the name says: on click button file browser on username exists
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function onClickBtnFileBrowserOnUsernameExists()
{
  var fileName = browseForFileURL();  //returns a local filename
  if (fileName)
  {
    EDIT_GOTOURLONUSERNAMEEXISTS.value = fileName;
  }
}
