//SHARE-IN-MEMORY=true
// Copyright 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

//--------------------------------------------------------------------
// CLASS:
//   recordsetDialog
//
// DESCRIPTION:
//   Static class used to display the recordset SB UI. Determines which UI, 
//   simple or advanced, to display. Also, houses functionality shared between
//   the UI implementations and mediates switches between the UIs.
//   Note: this class documentation uses 'SBRecordset' to refer to your recordset
//   subclass of SBDatabaseCall.
//
// PUBLIC PROPERTIES:
//   none
//
// PUBLIC FUNCTIONS:
//   display(SBRecordset, cmdFilenameSimple, cmdFilenameAdvanced) - show the 
//     recordset dialog. Return updated recordset SB.
//--------------------------------------------------------------------

function recordsetDialog()
{
  // This is a static class and should not be instantiated.
  throw dwscripts.sprintf(MM.MSG_createStaticClass, "recordsetDialog");
}

// PUBLIC METHODS
recordsetDialog.display = recordsetDialog_display;

// PRIVATE METHODS
recordsetDialog.canDialogDisplayRecordset = recordsetDialog_canDialogDisplayRecordset;
recordsetDialog.getCommandDialogPref = recordsetDialog_getCommandDialogPref;
recordsetDialog.setCommandDialogPref = recordsetDialog_setCommandDialogPref;

// Following functions are used by the recordset dialogs
recordsetDialog.onClickOK = recordsetDialog_onClickOK;
recordsetDialog.onClickCancel = recordsetDialog_onClickCancel;
recordsetDialog.onClickSwitchUI = recordsetDialog_onClickSwitchUI;
recordsetDialog.displayTestDialog = recordsetDialog_displayTestDialog;

recordsetDialog.searchByCommand = recordsetDialog_searchByCommand;
recordsetDialog.searchByType = recordsetDialog_searchByType;
recordsetDialog.searchDisplayableRecordset = recordsetDialog_searchDisplayableRecordset;

recordsetDialog.findPreferedType = recordsetDialog_findPreferedType;

// CLASS CONSTANTS
// Availabe recordset UI actions. 
recordsetDialog.UI_ACTION_OK            = -1;
recordsetDialog.UI_ACTION_CANCEL        = -2;

// Preference information.
recordsetDialog.CMD_FILENAME_PREF_SECTION = "Extensions\\ServerBehaviors\\Recordset";
recordsetDialog.CMD_FILENAME_PREF_KEY = "Command Filename";

// Name used for the parameter in a simple recordset.
recordsetDialog.SIMPLE_PARAM_NAME = "param1";

recordsetDialog.lastCmdFildName = '';


//--------------------------------------------------------------------
// FUNCTION:
//   recordsetDialog.display
//
// DESCRIPTION:
//   Show the recordset dialog. Determines which dialog to present based on
//   the recordset and the previous dialog used. Retrieves updated values for the
//   recordset.
//   This function invokes the recordset commands with SBRecordset as argument.
//   The list with recordset types and names is stored in a global variable MM.rsTypes
//
// ARGUMENTS:
//   priorSBRecordset - SBRecordset. Existing recordset SB. If there is no existing
//     recordset, send in an empty instance of a SBDatabaseCall subclass.
//   MM.rsTypes - global variable is used as a list of current recordset types
//
// RETURNS:
//   SBRecordset - updated recordset. null if cancelled.
//--------------------------------------------------------------------

function recordsetDialog_display(priorSBRecordset) {
  // Last action in command dialog prior to return
  var uiAction = recordsetDialog.UI_ACTION_SWITCH;

  // Command filename of recordset dialog currently displayed.
  var cmdFilename = recordsetDialog.getCommandDialogPref(MM.rsTypes[0].command);
  // check if the commanand is in the list
  if ((currentCmd = recordsetDialog.searchByCommand(cmdFilename)) < 0) {
    cmdFilename = MM.rsTypes[0].command;
    currentCmd = 0;
  }

	
  var newSBRecordset = priorSBRecordset.makeEditableCopy();

  currentCmd = recordsetDialog.searchDisplayableRecordset(priorSBRecordset,currentCmd);
  if (currentCmd < 0) {
    alert(dw.loadString("recordsetdialogclass/cannot_display_recordset"));
    return false;
  }
  cmdFilename = MM.rsTypes[currentCmd].command;
  while (   uiAction != recordsetDialog.UI_ACTION_CANCEL 
         && uiAction != recordsetDialog.UI_ACTION_OK
        ) 
  {

    // Note newSBRecordset will be updated using pass by reference.
    uiAction = dwscripts.callCommand(cmdFilename, newSBRecordset);
    if (uiAction == null) {
      // User cancelled. In case user clicked the 'X' button, set uiAction to
      // cancelled since it won't be set.
      uiAction = recordsetDialog.UI_ACTION_CANCEL;
    } else {
      //if uiAction is positive it points to an rs type in MM.rsTypes
      if (uiAction >= 0) {
        cmdFilename = MM.rsTypes[uiAction].command;
      }
    }
    this.lastCmdFildName = cmdFilename;
  }

  // Store the dialog used last.
  recordsetDialog.setCommandDialogPref(cmdFilename);

  return (uiAction == recordsetDialog.UI_ACTION_OK) ? newSBRecordset : null;
}


//--------------------------------------------------------------------
// FUNCTION:
//   recordsetDialog.onClickOK
//
// DESCRIPTION:
//   Event handler for the click of the OK button in a recordset dialog. Recordset
//   dialogs call this function from their onClickOK handlers. If the recordset
//   is valid, closes the window and sets the return value for the command.
//   Otherwise, displays an error message.
//
// ARGUMENTS:
//   theWindow - window. window object for the calling command dialog.
//   sbRecordset - SBRecordset. Recordset info updated from the dialog.
//
// RETURNS:
//   none
//--------------------------------------------------------------------

function recordsetDialog_onClickOK(theWindow, sbRecordset)
{
  if (!sbRecordset.checkData(false))
  {
    alert(sbRecordset.getErrorMessage());
  }
  else
  {
    dwscripts.setCommandReturnValue(recordsetDialog.UI_ACTION_OK);
    theWindow.close();
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   recordsetDialog.onClickCancel
//
// DESCRIPTION:
//   Event handler for the click of the Cancel button in a recordset dialog. Recordset
//   dialogs call this function from their onClickCancel handlers. If everything
//   is in order, closes the window and sets the return value for the command.
//
// ARGUMENTS:
//   theWindow - window. window object for the calling command dialog.
//
// RETURNS:
//   none
//--------------------------------------------------------------------

function recordsetDialog_onClickCancel(theWindow)
{
  // No need to do any additional processing for now.
  dwscripts.setCommandReturnValue(recordsetDialog.UI_ACTION_CANCEL);
  theWindow.close();
}


//--------------------------------------------------------------------
// FUNCTION:
//   recordsetDialog.onClickSwitchUI
//
// DESCRIPTION:
//   Mediate a switch between recordset dialogs. This function is called by a 
//   recordset dialog when the user wants to switch the UI. It handles closing
//   the window and setting the return value for the command if it is a valid switch.
//   Otherwise, displays an error message.
//
// ARGUMENTS:
//   theWindow - window. Window object for the calling command dialog.
//   uiAction - index to a rs Type
//   sbRecordset - SBRecordset. Recordset updated from the dialog. 
//   switchCmdFilename - string. Command filename for the recordset dialog to switch
//     to.
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function recordsetDialog_onClickSwitchUI(theWindow, uiAction, sbRecordset, switchCmdFilename)
{
	if (uiAction < 0) {
		alert(dw.loadString("recordsetdialogclass/invalid_action"));
        return;
      }
	if (!recordsetDialog.canDialogDisplayRecordset(switchCmdFilename, sbRecordset)) {
		alert(dwscripts.sprintf(MM.MSG_SQLNotSimple, dwscripts.getRecordsetDisplayName()));
      return;
  }
  
  // Set return value and close the window for the command dialog.
  dwscripts.setCommandReturnValue(uiAction);
  theWindow.close();
}


//--------------------------------------------------------------------
// FUNCTION:
//   recordsetDialog.displayTestDialog
//
// DESCRIPTION:
//   If the recordset info is valid, display the query results in a dialog.
//
// ARGUMENTS:
//   sbRecordset - SBRecordset. Recordset info updated from the dialog.
//
// RETURNS:
//   none
//--------------------------------------------------------------------

function recordsetDialog_displayTestDialog(sbRecordset)
{
  if (!sbRecordset.checkData(true))
  {
    alert(sbRecordset.getErrorMessage());
    return;
  }

  var theSQL = sbRecordset.getSQLForTest();
  
  if (theSQL)
  {
    MMDB.showResultset(sbRecordset.getConnectionName(), theSQL);
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   recordsetDialog.getCommandDialogPref
//
// DESCRIPTION:
//   Get the preference for the command file to use for the recordset dialog.
//
// ARGUMENTS:
//   cmdFilenameDefault - string. Default command dialog filename to display
//     the recordset.
//
// RETURNS:
//   String - command file name. One of recordsetDialog.CMD_FILENAME_*
//            returns simple command dialog by default
//--------------------------------------------------------------------

function recordsetDialog_getCommandDialogPref(cmdFilenameDefault)
{
  prefValue = dw.getPreferenceString(recordsetDialog.CMD_FILENAME_PREF_SECTION, 
                                     recordsetDialog.CMD_FILENAME_PREF_KEY, 
                                     cmdFilenameDefault);

  return prefValue;
}


//--------------------------------------------------------------------
// FUNCTION:
//   recordsetDialog.setCommandDialogPref
//
// DESCRIPTION:
//   Set the preference for the command file to use for the recordset dialog.
//
// ARGUMENTS:
//   cmdFilename - string. Command dialog filename. One of
//     recordsetDialog.CMD_FILENAME_*.
//
// RETURNS:
//   none
//--------------------------------------------------------------------

function recordsetDialog_setCommandDialogPref(cmdFilename)
{
  var cIdx = recordsetDialog.searchByCommand(cmdFilename);
  if ((cIdx > -1) && (MM.rsTypes[cIdx].saveUI)) {
    dw.setPreferenceString(recordsetDialog.CMD_FILENAME_PREF_SECTION, 
                         recordsetDialog.CMD_FILENAME_PREF_KEY, 
                         cmdFilename
                        );  
  }
}

//--------------------------------------------------------------------
// FUNCTION:
//   recordsetDialog.canDialogDisplayRecordset
//
// DESCRIPTION:
//   Determines if the recordset command dialog can accept the recordset server
//   behavior. Check if the function 'canDisplayRecordset()' is defined in the command
//   dialog. If it is defined, invoke it to determine if the command can 
//   accept the recordset. If it is not defined, assume the recordset can be
//   displayed.
//
// ARGUMENTS:
//   cmdFilename - string. name of command dialog.
//   sbRecordset - SBRecordset. Recordset instance to check.
//
// RETURNS:
//   boolean. true if command can accept the SBRecordset.
//--------------------------------------------------------------------

function recordsetDialog_canDialogDisplayRecordset(cmdFilename, sbRecordset)
{  
  var bCanDisplayRecordset = false; 
  var domCommand = null;
  var windowCommand = null;
  
  if (cmdFilename)
  {
    domCommand = dw.getDocumentDOM(dw.getConfigurationPath() + "/Commands/" + cmdFilename); 
    if (domCommand)
    {
      bCanDisplayRecordset = true;
      windowCommand = domCommand.parentWindow;
      if (   windowCommand.canDisplayRecordset
          && !windowCommand.canDisplayRecordset(sbRecordset)
         )
      {
        bCanDisplayRecordset = false;
      }
    }
  }
  
  return bCanDisplayRecordset;
}



//--------------------------------------------------------------------
// FUNCTION:
//   recordsetDialog_searchByCommand
//
// DESCRIPTION:
//	Search the global variable MM.rsTypes for the a command
//
// ARGUMENTS:
//	scommand -- the command to be searched
//
// RETURNS:
//   the position count of the rs element, -1 otherwise
//--------------------------------------------------------------------
function recordsetDialog_searchByCommand(scommand) {
	var ii;
	for (ii = 0; ii < MM.rsTypes.length;ii++) {
		if (MM.rsTypes[ii].command == scommand) {
			return ii;
		}
	}
	return -1;
}


//--------------------------------------------------------------------
// FUNCTION:
//   recordsetDialog_searchByType
//
// DESCRIPTION:
//	Search the global variable MM.rsTypes for the a type
//
// ARGUMENTS:
//	stype -- the rs type to be searched
//
// RETURNS:
//   the position count of the rs element, -1 otherwise
//--------------------------------------------------------------------
function recordsetDialog_searchByType(stype) 
{
	var dom = dreamweaver.getDocumentDOM();
	var docName = dom.URL;
	var docType = dom.documentType;
	
	// add a button for each different rs type
	for (i = 0;i < MM.rsTypes.length;i++) 
	{
		if( (!MM.rsTypes[i].fileExt      || docName.match(MM.rsTypes[i].fileExtRegExp)) ||
		    (!MM.rsTypes[i].documentType || docType.match(MM.rsTypes[i].documentTypeRegExp)) )
		{	     
    		if (dom.serverModel.getServerName() == MM.rsTypes[i].serverModel) {
    			if (MM.rsTypes[i].type == stype) {
					return i;
				}
			}
		}
	}
	return -1;
}


//--------------------------------------------------------------------
// FUNCTION:
//   recordsetDialog_searchDisplayableRecordset
//
// DESCRIPTION:
//	Check if the current rsType can display the SBRecordset object.
//	If not try's to find another recordset type that can do that
//
// ARGUMENTS:
//	SBRecordset - the SBRecordset object 
//  currentIndex - index of the current rs Type
//
// RETURNS:
//   the new rs type index, -1 otherwise
//--------------------------------------------------------------------
function recordsetDialog_searchDisplayableRecordset(SBRecordset,currentIndex) 
{
	var docName = (dreamweaver.getDocumentPath('document'));
	var docType = dreamweaver.getDocumentDOM().documentType;

	var cIdx = recordsetDialog.findPreferedType(SBRecordset);
	if (cIdx == -1) {
		cIdx = currentIndex;
	}
	
		// See if this rsType is retricted to a particular file extension or document type 
	if ( (!MM.rsTypes[cIdx].fileExt      || docName.match(MM.rsTypes[cIdx].fileExtRegExp)) ||
		 (!MM.rsTypes[cIdx].documentType || docType.match(MM.rsTypes[cIdx].documentTypeRegExp)) )
	{
		if (dw.getDocumentDOM().serverModel.getServerName() == MM.rsTypes[cIdx].serverModel) {
			if (recordsetDialog.canDialogDisplayRecordset(MM.rsTypes[cIdx].command, SBRecordset)) {	
				return cIdx;
			}
		}
	}
	
	//now check all possible rsType
	for (ii = 0;ii < MM.rsTypes.length;ii++) 
	{
		if ( (!MM.rsTypes[ii].fileExt      || docName.match(MM.rsTypes[ii].fileExtRegExp)) ||
		     (!MM.rsTypes[ii].documentType || docType.match(MM.rsTypes[ii].documentTypeRegExp)) )
		{

			if (dw.getDocumentDOM().serverModel.getServerName() == MM.rsTypes[ii].serverModel) {
				if (recordsetDialog.canDialogDisplayRecordset(MM.rsTypes[ii].command, SBRecordset)) {
					return ii;
				}
			}
		}
	}
	return -1;
}

//--------------------------------------------------------------------
// FUNCTION:
//   findPreferedType
//
// DESCRIPTION:
//	Search the global variable MM.rsTypes for a rs type that has as
//	prefered type the SBRecordset.name
//
// ARGUMENTS:
//	SBRecordset - the SBRecordset object 
//
// RETURNS:
//   the position count of the rs element, -1 otherwise
//--------------------------------------------------------------------
function recordsetDialog_findPreferedType(SBRecordset) {
	for (ii = 0; ii < MM.rsTypes.length;ii++) {
		if (dw.getDocumentDOM().serverModel.getServerName() == MM.rsTypes[ii].serverModel) {
			if ((SBRecordset.name) && (MM.rsTypes[ii].preferedName == SBRecordset.name.replace(/safe/i, ''))) {
				return ii;
			}
		}
	}
	return -1;
}