// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

// *************** GLOBALS VARS *****************

// ******************* API **********************

//--------------------------------------------------------------------
// FUNCTION:
//   objectTag
//
// DESCRIPTION:
//   This object is used as a shim to launch the appropriate 
//   server behavior for the current server model.  The individual
//   server behavior files are responsible for inserting the code on the
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
      var serverBehaviorFile = "";

      switch (serverModel)
      {
      case "ASP_VBS":
      case "ASP_JS":
      case "JSP":
        serverBehaviorFile = "Dynamic Data.htm";
        break;

      case "ASP.NET_Csharp":
      case "ASP.NET_VB":
      case "ColdFusion":
      case "PHP_MySQL":
        serverBehaviorFile = "DynamicText.htm";
        break;

      default:
        // We will launch a server behavior with a default name
        // so that live objects can be implemented
        // for third party server models.

        serverBehaviorFile = "DynamicText.htm";        
        break;
      } 

      if (serverBehaviorFile && canInsertServerObject(serverBehaviorFile))
      {
        dw.popupServerBehavior(serverBehaviorFile);
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
//   canInsertServerObject
//
// DESCRIPTION:
//   The function returns true if this object can be inserted in the
//   current document.  This function, and the functions it calls should
//   display the necessary error messages.
//
// ARGUMENTS:
//   sbFileName - string - the file name of the server behavior file
//     which implements this object
//
// RETURNS:
//   boolean - true if the dialog should be displayed, or false otherwise
//--------------------------------------------------------------------

function canInsertServerObject(sbFileName)
{
  var retVal = true;

  var curDom = dw.getDocumentDOM();
  var serverModel = (curDom) ? curDom.serverModel.getFolderName() : "";
  var path = dw.getConfigurationPath() + "/ServerBehaviors/" + serverModel
           + "/" + sbFileName;
           
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