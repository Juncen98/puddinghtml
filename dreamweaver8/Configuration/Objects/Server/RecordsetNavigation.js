// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

// *************** GLOBALS VARS *****************

// ******************* API **********************

//--------------------------------------------------------------------
// FUNCTION:
//   objectTag
//
// DESCRIPTION:
//   This object is used as a shim to launch the appropriate 
//   command file for the current server model.  The individual
//   command files are responsible for inserting the code on the
//   page, so this function just returns the empty string.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string - empty string to indicate that nothing should be inserted
//--------------------------------------------------------------------

function objectTag() 
{
  var dom = dw.getDocumentDOM();
  
  if (dom)
  {
    var serverModel = dom.serverModel.getFolderName();
    
    if (serverModel)
    {    
      var commandFile = "";
      var args = null;

      switch (serverModel)
      {
      case "ASP_VBS":
      case "ASP_JS":
      case "JSP":
        commandFile = "RecordsetNavigation.htm";
        break;

      case "ASP.NET_Csharp":
      case "ASP.NET_VB":
        commandFile = "ServerObject-DSNavBar.htm";
        break;

      case "ColdFusion":
        commandFile = "ServerObject-RSNavBar.htm";
        args = new Object();
        args.editableRecordset = false;
        args.limitRecordset = false;
        break;

      case "PHP_MySQL":
        commandFile = "ServerObject-RSNavBar.htm";
        args = new Object();
        args.editableRecordset = false;
        args.limitRecordset = true;
        break;

      default:
        // We will launch a command with the server model
        // as a prefix, so that live objects can be implemented
        // for third party server models.

        commandFile = serverModel + "-RSNavBar.htm";        
        break;
      } 

      if (commandFile && canInsertServerObject(commandFile))
      {
        dwscripts.callCommand(commandFile, args);
      }
    }
    else
    {
      alert(MM.MSG_NeedServerModelForSO);
    }
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
//--------------------------------------------------------------------
function setupStepsCompleted()
{
  return setupStepsCompletedForServerObject();
}



// ***************** LOCAL FUNCTIONS  ******************

//--------------------------------------------------------------------
// FUNCTION:
//   canInsertServerObject
//
// DESCRIPTION:
//   The function returns true if this object can be inserted in the
//   current document.  This function, and the functions it calls should
//   display the necessary error messages.
//
// ARGUMENTS:
//   commandFileName - string - the file name of the command file
//     which implements this object
//
// RETURNS:
//   boolean - true if the dialog should be displayed, or false otherwise
//--------------------------------------------------------------------

function canInsertServerObject(commandFileName)
{
  var retVal = true;
  
  var path = dw.getConfigurationPath() + "/Commands/" + commandFileName;
  
  if (!dwscripts.fileExists(path))
  {
    var err = dwscripts.sprintf(MM.MSG_NeedCommandFileForSO, path);
    retVal = false;
    alert(err);
  }
  
  return retVal;
}

//--------------------------------------------------------------------
// FUNCTION:
//   getDynamicContent
//
// DESCRIPTION:
//   Returns the contents of a dynamically generated menu.
//
// ARGUMENTS:
//   ID of the menuitem
//
// RETURNS:
//   An array of strings to be placed in the menu, with a unique
//   identifier for each item separated from the menu string by a semicolon.
//   Return null from this routine to indicate that you are not adding any
//   items to the menu.
//--------------------------------------------------------------------

function getDynamicContent(itemID)
{
  var items = new Array();
  var name = MM.MENU_RecordsetNavBar;
  var dom = dw.getDocumentDOM();
  
  if (dom)
  {
    var serverModel = dom.serverModel.getFolderName();
    
    if (serverModel)
    {
      switch (serverModel)
      {
        case "ASP.NET_Csharp":
	      case "ASP.NET_VB":
          name = MM.MENU_DataSetNavBar;
          break;
      }
    }
  }

  items[0] = name + ";id=" + itemID;

  return items;
}

