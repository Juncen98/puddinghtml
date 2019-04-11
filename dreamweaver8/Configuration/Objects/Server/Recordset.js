// Copyright 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

//--------------------------------------------------------------------
// FUNCTION:
//   insertObject
//
// DESCRIPTION:
//   Just a caller to insert the recordset server behavior. 
//
//   We call the "applyServerBehavior" function of the server behavior file.
//   The aforementioned function launches a command dialog, reads the users' values,
//   and applies the recordset.
//
//   This method of calling the applyServerBehavior function of the server behavior
//   file is unique to the recordset case. It can be done here only because the
//   recordset server behavior launches a command file.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string - empty upon success, or an error message.
//--------------------------------------------------------------------
function insertObject()
{

  var retVal = "";
  var serverModel = dwscripts.getServerModel();

  var sbFile = dw.getConfigurationPath() + "/ServerBehaviors/" + serverModel + "/Recordset.htm";

  if (sbFile)
  {
    var sbFileDOM = dw.getDocumentDOM(sbFile);
    
    MM.RecordsetApplied = false;
    
    // the next line is the crux of this function and does the work of launching the
    // recordset dialog and applying the edits
    var errStr = sbFileDOM.parentWindow.applyServerBehavior(null);

    // if a recordset has been sucessfully applied, the user needs feedback about what
    // has just occurred. Because a recordset has no visual cue and inserts no visible html,
    // the way we let the user know a recordset has been added is by popping up the data
    // bindings panel, thereby allowing the user to see the recordset and drag dynamic
    // content from the recordset into the document
    if (MM.RecordsetApplied)
    {
      // after inserting the recordset, give the data bindings panel focus
      if ( !dw.getFloaterVisibility('data bindings'))
      {
        dw.toggleFloater('data bindings');
      }
      
	  if( !MM.noInsertObjectMessages )
	  {
        var rsDisplayName = dwscripts.getRecordsetDisplayName();
        var message = dwscripts.sprintf(MM.MSG_ARecordsetWasAdded,rsDisplayName,rsDisplayName);
        dwscripts.informDontShow(message,
          "Extensions\\ServerObjects\\Recordset","SkipRecordsetAddedWarning");
	  }
    }
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
  return getSetupStepsForServerObject(true); // exclude recordset creation step
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
  return setupStepsCompletedForServerObject(true); // exclude recordset creation step
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
  var name = MM.MENU_Recordset;
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
          name = MM.MENU_DataSet;
          break;
      }
    }
  }

  items[0] = name + ";id=" + itemID;

  return items;
}

