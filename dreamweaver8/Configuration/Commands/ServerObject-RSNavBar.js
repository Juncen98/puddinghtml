// Copyright 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.


// *************** GLOBALS VARS *****************

var helpDoc         = MM.HELP_objRecordsetNavigation;

var _RecordsetName  = new EditableRecordsetMenu("RSStatsFirst.htm", "RecordsetName", "");

var FIRST_file      = "First.gif"
var PREVIOUS_file   = "Previous.gif"
var NEXT_file       = "Next.gif"
var LAST_file       = "Last.gif"

var DISPLAY_TYPE;

var LIMIT_RECORDSET = false;

//******************* API **********************

//--------------------------------------------------------------------
// FUNCTION:
//   canInsertObject
//
// DESCRIPTION:
//   This function is called to determine if this object can be inserted
//   into the current document.  It displays the relevant error messages,
//   and then returns a boolean to indicate if insertion is possible.
//
//   NOTE: this function is called before initializeUI, so it should
//         not rely on internal state.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------
function canInsertObject()
{
  var retVal = false;
  var errMsgStr = "";
  var isServerObject = true;
  
  if (errMsgStr)
  {
    alert (errMsgStr);
    retVal = false;
  }
  
  return retVal;
}
 

//--------------------------------------------------------------------
// FUNCTION:
//   commandButtons
//
// DESCRIPTION:
//   Returns the list of buttons which should appear on the right hand
//   side of the dialog
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   Array - pairs of button name and function call
//--------------------------------------------------------------------

function commandButtons()
{
   return new Array(MM.BTN_OK,     "clickedOK()",
                    MM.BTN_Cancel, "clickedCancel()",
                    MM.BTN_Help,   "displayHelp()");
}


//--------------------------------------------------------------------
// FUNCTION:
//   clickedOK
//
// DESCRIPTION:
//   This function is called when the user clicks OK
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function clickedOK()
{
  var rsName = _RecordsetName.getValue();  
  var bUseImages = (DISPLAY_TYPE[1].checked) ? true : false;
  
  if (rsName)
  {
    // check if a page navigation repeat region exists for this recordset
    dwscripts.warnIfNoPageNavDisplay(rsName,true);
    
    // Build up the insertion string, and then apply a doc edit    
    var paramObj = new Object();
    var sbObj = null;
      
    paramObj["RecordsetName"] = rsName;
    paramObj.AddQueryString = "QueryString";
    
    if (!LIMIT_RECORDSET)
    {
      paramObj.MM_familyDefaults = new Object();
      paramObj.MM_familyDefaults.PageSize = 10;
    }
    else
    {
      var sbRecordset = dwscripts.getServerBehaviorByParam("Recordset.htm","RecordsetName",paramObj["RecordsetName"]);
      if (sbRecordset)
      {
        var newRS = sbRecordset.makeEditableCopy();
        newRS.setDefaultPageSize();
        newRS.queueDocEdits();
      }
    }
    
    if(bUseImages)
    {
      if (!copyImageFiles())
      {
        return;
      }
      paramObj.FirstLinkText = '<img src="' + FIRST_file + '" border=0>';
      paramObj.PrevLinkText = '<img src="' + PREVIOUS_file + '" border=0>';
      paramObj.NextLinkText = '<img src="' + NEXT_file + '" border=0>';
      paramObj.LastLinkText = '<img src="' + LAST_file + '" border=0>';
    } 
    else 
    {
      //set parameter values for compound object from localizeable globals file.
	  if (dreamweaver.appVersion && ( (dreamweaver.appVersion.indexOf('ja') != -1) ||
									  (dreamweaver.appVersion.indexOf('ko') != -1) ||
									  (dreamweaver.appVersion.indexOf('zh') != -1) ) )
	  {  
    	  if (isDoubleByteEncoding()) 
    	  {
			  // Japanese, Korean and Chinese exceptions
    		  paramObj.FirstLinkText = MM.LABEL_NewMoveToFirstLinkLabel;  
    		  paramObj.PrevLinkText  = MM.LABEL_NewMoveToPrevLinkLabel;
    		  paramObj.NextLinkText  = MM.LABEL_NewMoveToNextLinkLabel;
    		  paramObj.LastLinkText  = MM.LABEL_NewMoveToLastLinkLabel;
    	  } 
          else 
          {
			  // not a JA, KO, or Chinese document so use English to prevent corruption
    	      paramObj.FirstLinkText = MM.LABEL_EngNewMoveToFirstLinkLabel;  
    	      paramObj.PrevLinkText  = MM.LABEL_EngNewMoveToPrevLinkLabel;
    	      paramObj.NextLinkText  = MM.LABEL_EngNewMoveToNextLinkLabel;
    	      paramObj.LastLinkText  = MM.LABEL_EngNewMoveToLastLinkLabel;
    	  }
      }
      else 
      {
    	  paramObj.FirstLinkText = dwscripts.entityNameEncode(MM.LABEL_NewMoveToFirstLinkLabel);  //"First" in English
    	  paramObj.PrevLinkText  = dwscripts.entityNameEncode(MM.LABEL_NewMoveToPrevLinkLabel);
    	  paramObj.NextLinkText  = dwscripts.entityNameEncode(MM.LABEL_NewMoveToNextLinkLabel);
    	  paramObj.LastLinkText  = dwscripts.entityNameEncode(MM.LABEL_NewMoveToLastLinkLabel);
      }
    }
    
    dwscripts.fixUpSelection(dw.getDocumentDOM(), false, true);
    dwscripts.applyGroup("RSNavBar", paramObj);
    
    window.close();
  }
  else
  {
    alert(dwscripts.sprintf(MM.MSG_invalidRS, dwscripts.getRecordsetDisplayName()));
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   clickedCancel
//
// DESCRIPTION:
//   This function is called when CANCEL is clicked
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function clickedCancel()
{
  window.close();
}


//--------------------------------------------------------------------
// FUNCTION:
//   displayHelp
//
// DESCRIPTION:
//   This function is called when the user clicks the HELP button
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function displayHelp()
{
  dwscripts.displayDWHelp(helpDoc);
}


//***************** LOCAL FUNCTIONS  ******************

//--------------------------------------------------------------------
// FUNCTION:
//   initializeUI
//
// DESCRIPTION:
//   This function is called in the onLoad event.  It is responsible
//   for initializing the UI.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function initializeUI()
{
  var args = dwscripts.getCommandArguments();
  var obj = dwscripts.findDOMObject("RecordsetName");
  if (args && obj)
  {
    if (args.editableRecordset)
    {
      obj.setAttribute("editable","true");
    }
    else
    {
      obj.removeAttribute("editable");
    }
  }
  
  if (args)
  {
    LIMIT_RECORDSET = args.limitRecordset;
  }
  
  // Build Recordset menu
  _RecordsetName.initializeUI();
  
  var rsToPick = dwscripts.getRecordsetNameWithPageNav();
  if (rsToPick)
  {
    _RecordsetName.pickValue(rsToPick);
  }
  
  DISPLAY_TYPE = dwscripts.findDOMObject("DisplayType");

  if (obj)
  {
    obj.focus();
  }
}

//--------------------------------------------------------------------
// FUNCTION:
//   copyImageFiles
//
// DESCRIPTION:
//   This function is called to copy the image files from the 
//   configuration directory to the document path.  This happens when
//   the user choses Images in the dialog
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function copyImageFiles()
{
  var bCopyFlag = false;
  
  var dom = dreamweaver.getDocumentDOM();
  var documentPath = dom.URL;
  var lastSlashIndex = documentPath.lastIndexOf('/');
  documentPath = documentPath.substring(0, lastSlashIndex+1);
  
  if(documentPath != "")
  {
    var configPath = dreamweaver.getConfigurationPath();
    configPath += "/Shared/UltraDev/Images/";
  
    bCopyFlag = true;

    copyTheFiles(configPath+FIRST_file, documentPath+FIRST_file);
    copyTheFiles(configPath+NEXT_file, documentPath+NEXT_file);
    copyTheFiles(configPath+PREVIOUS_file, documentPath+PREVIOUS_file);
    copyTheFiles(configPath+LAST_file, documentPath+LAST_file);
 
  } 
  
  if(!bCopyFlag)
  {
     alert(MM.MSG_rsNavigationBarSaveDocument);
  }
  
  return bCopyFlag;
}

//--------------------------------------------------------------------
// FUNCTION:
//   copyTheFiles
//
// DESCRIPTION:
//   Utility function used for copying a file from source directory
//   to the destination directory
//
// ARGUMENTS:
//   source - the file including the path that needs to be copied
//   destination - the file including the path to where the source
//                 needs to be copied
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function copyTheFiles(source, destination)
{
  if(!DWfile.exists(destination))
  {
    if(DWfile.exists(source))
    {
      DWfile.copy(source, destination);
    }
  }
}

//--------------------------------------------------------------------
// FUNCTION:
//   isDoubleByteEncoding
//
// DESCRIPTION:
//   Check to avoid entity encoding in double byte languages
//   
// ARGUMENTS:
//   none
//   
// RETURNS:
//   true if charSet and appVersion correspond to a DoubleByte language
//   false otherwise
//
//--------------------------------------------------------------------

function isDoubleByteEncoding()
{
	var charSet = dw.getDocumentDOM().getCharSet();
	charSet = charSet.toLowerCase();
	if (   ( (dreamweaver.appVersion.indexOf('ja') != -1) && 
			 (charSet == "shift_jis" || charSet == "x-sjis" || charSet == "euc-jp" || charSet == "iso-2022-jp") )
		|| ( (dreamweaver.appVersion.indexOf('ko') != -1) && 
			 (charSet == "euc-kr") )
		|| ( (dreamweaver.appVersion.indexOf('zh') != -1) && 
			 (charSet == "big5" || charSet == "gb2312") ) )
	{
		return true;
	}
	else
	{
		return false;
	}
}
