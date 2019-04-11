// Copyright 2000, 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.
// include ../reports.js
//*************** GLOBAL CONSTANTS *****************

//*************** GLOBAL VARIABLES *****************

// other globals
var CK_VALUES = 
  { // Default values - names must match cooresponding object names.
	  CKName:''
  };
var PREF_OBJ = new Preferences(document.URL, CK_VALUES);
// var REPORT_STR = "Design Note Info: ";
var REPORT_STR = new Array();
var DEBUG_FILE = dw.getConfigurationPath() + "/REPORT_DEBUG.txt";
//******************* API **********************


//---------------
// Function: beginReporting
// Description: Standard report API, gets called just before
// report is to be run.  We check here to see if file activity
// is happening.  If so, we warn the user and return false
// indicating we can't run the report right now.
//
function beginReporting()
{
  if (site.serverActivity())
  {
    alert(MSG_CantRun_FileActivity);
    return false;
  }
  return true;
}

//---------------
// Function: preventFileActivity
// Description: Standard report API, gets called just before
// report is to be run.  We check here to see if any report
// wants to prevent file activity during its run.
function preventFileActivity()
{
	return true;
}

//---------------
// Function: configureSettings
// Description: Standard report API, used to initialize and load
//  the default values. Does not initialize the UI.
//
function configureSettings() {
  // Load all the saved settings into the preferences object.
  PREF_OBJ.load();
  return true;
}
//---------------
// Function: commandButtons
// Description: Standard report API, like commands the return value
//  controls the display of command buttons in the settings dialog.
//
function commandButtons() 
{
  return new Array(
            MM.BTN_OK,         "applyParams()",
            MM.BTN_Cancel,     "window.close();"
            );
}

// Function: processFile
// Description: Report command api called during file processing.
function processFile (fileURL) 
{
  // Check if this is actually a folder
	var fileCOName;
	var retStr = MSG_CheckOutReport;
  var searchCOName = CK_VALUES['CKName'];
	if (!MM.CheckOutError)
	  MM.CheckOutError = 0;
	if (site.getCheckOutUser()=="" && MM.CheckOutError != 1)
	{
	 	 alert(MSG_CheckInOutNotEnabled);
		MM.CheckOutError = 1;   // This variable is reset in menus.xml when reports dialog is called
		return;
	}
	else if (site.getCheckOutUser()=="" ){
		return;
  }
	if (site.getConnectionState()==false)  // if not connected to site
	{
    // If the site is LAN, site.setConnectionState() is not enabled because
    // we can't really 'connect' to a LAN site. Use canConnect enabler to determine
    // if we have a LAN site. If we do not have a LAN site, use setConnectionState. 
    // Otherwise, use site.refresh to refresh the remote files for the LAN site.
	  if (site.canConnect())
      site.setConnectionState(true);
    else if (site.canRefresh("Remote"))
      site.refresh("Remote");
    
    // If we still are not connected to the site, bail.
    if (site.getConnectionState() == false)
    {
      return;
    }
	}
  fileCOName = site.getCheckOutUserForFile(fileURL);
	if (fileCOName)
	  fileCOName = fileCOName.replace(/\(\w*\)/,"");
  if (fileCOName.indexOf(searchCOName) != -1) // Matches checkout name
	{
	  if (fileCOName)
		{
	    retStr += fileCOName;
	    reportItem(REP_ITEM_NOTE, fileURL, retStr);
		}
	}
}
//***************    LOCAL FUNCTIONS   ***************

//---------------
// Function: initialize
// Description: Configures the UI of a dialog.
//
function initializeUI() 
{
	PREF_OBJ.initialize ({CKName : new PrefField(findObject('checkOutField'))})
}

//---------------
// Function: applyParams
// Description: Applies or takes action.
//  Uses the preferences object to set and save the current settings.
//
function applyParams() {
  // Get the current values from the UI and set the values.
  PREF_OBJ.set();
  
  PREF_OBJ.save();
  window.close();
}
