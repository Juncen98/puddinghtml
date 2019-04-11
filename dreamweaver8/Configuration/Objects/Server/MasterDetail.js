// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

// *************** GLOBALS VARS *****************

var helpDoc = MM.HELP_objMasterDetail;

var COMMAND_FILE = "";
var COMMAND_WINDOW = "";
var USING_OLD_IMPLEMENTATION = "";

var SUPPRESS_DIALOG = false;

// ******************* API **********************

//--------------------------------------------------------------------



// FUNCTION:
//   insertObject
//
// DESCRIPTION:
//   Collects values from the form elements in the dialog box and
//   adds the Master Detail Set
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string - empty upon success, or an error message
//
// NOTES:
//   The reason that the insertion is not done from the command file
//   is that there are focus issues if a dialog directly tries to insert
//   content on a second page (the detail page, in this case).
//
//   Instead, the object calls the command file, and gets the user interface
//   parameters. With the command file closed, we can call out to a function
//   inside of the command file to do the actual insertion.
//--------------------------------------------------------------------
function insertObject()
{
  if (!SUPPRESS_DIALOG)
  {
    defineGlobals(); // define COMMAND_FILE and COMMAND_WINDOW
 
    var params = dwscripts.callCommand(COMMAND_FILE);
  
    if (params) // if the user clicked "OK" on the dialog
    {
      if (USING_OLD_IMPLEMENTATION)
      {
        COMMAND_WINDOW.createDetailPage(params)
      }
      else
      {
        COMMAND_WINDOW.createMasterDetailSet(params);
      }
    }
  }
  else
  {
    // NOTE: we do not seem to reload the object if only the 
    //  setupStepsCompleted function is run, so we need to 
    //  reset this global boolean.
    
    SUPPRESS_DIALOG = false;
  }

  return "";
}


//--------------------------------------------------------------------
// FUNCTION:
//   getSetupSteps
//
// DESCRIPTION:
//   Returns an array of steps to be displayed in an instructions
//   dialog.  The first element of the array is the text that appears
//   above the list.  The remaining elements are the steps, which will
//   be rendered in a numbered list.
//
//   The steps are each HTML, which may contain JavaScript event
//   handlers.  The event handlers can either be a JavaScript script
//   or an "event:KeyWord" syntax.  If the latter is used, then the
//   handler for KeyWord is implemented internally in the Dreamweaver
//   executable.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   the array described above
//--------------------------------------------------------------------
function getSetupSteps()
{
  return getSetupStepsForServerObject();
}



//--------------------------------------------------------------------
// FUNCTION:
//   setupStepsCompleted
//
// DESCRIPTION:
//   Returns the number of steps (in the list of steps returned from
//   getSetupSteps) that have already been completed.  This number is
//   used to determine how many steps will have a check mark next to
//   them.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   An integer - the number of check marks to be displayed, or -1
//   if all steps have been completed.
//
// NOTE:
//   Some error dialogs should appear before or instead of the steps dialog,
//   which is why the check is done in this function and not somewhere else.
//--------------------------------------------------------------------
function setupStepsCompleted()
{
  var filePath = dw.getDocumentPath("document");
  var serverModel = dwscripts.getServerModel();
  var errMsg = "";
  var retVal = 0;
  // check that cursor is not inside of cfoutput tags
  if (  serverModel == "ColdFusion" &&
         dwscripts.canStripCfOutputTags()  )
  {
    errMsg = MM.MSG_NeedValidSelectionForMasterDetail;
  }

   // save document if not saved
  if (!filePath) 
  {
    if (confirm(MM.MSG_NeedSavedDocumentForMasterDetail) && 
        dw.canSaveDocument(dreamweaver.getDocumentDOM())) 
    {
      dw.saveDocument(dreamweaver.getDocumentDOM());
      filePath = dw.getDocumentPath("document");
    }
  }
  
  if (!filePath || errMsg)
  {
    if (errMsg) alert (errMsg)
    SUPPRESS_DIALOG = true;
    retVal = -1;
  }
  else
  {
    retVal = setupStepsCompletedForServerObject();
  }

  return retVal;
}



function displayHelp()
{
  dwscripts.displayDWHelp();
}


// ***************** LOCAL FUNCTIONS  ******************

function defineGlobals()
{
  var serverModel = dwscripts.getServerModel();
  var configPath = dw.getConfigurationPath();
  var commandFile = "";
  var commandPath = "";

  switch (serverModel)
  {
    case "UD4-ASP_VBS":
    case "UD4-ASP_JS":
    case "UD4-JSP":
    case "ASP_JS":
    case "ASP_VBS":
    case "JSP":
      USING_OLD_IMPLEMENTATION = true;
      commandFile = "ServerObject-MD4.htm";
      break;

    case "ColdFusion":
    case "ASP.NET_Csharp":
    case "ASP.NET_VB":
      USING_OLD_IMPLEMENTATION = false;
      commandFile = "ServerObject-MasterDetail.htm";
      break;

   case "PHP_MySQL":
   	  USING_OLD_IMPLEMENTATION = false;
      commandFile = "ServerObject-MastDetailPHP.htm";
      break;

    default:
      break;
  }

  commandPath = configPath + "/Commands/" + commandFile;
  COMMAND_WINDOW = dw.getDocumentDOM(commandPath).parentWindow;
  COMMAND_FILE = commandFile;

}




