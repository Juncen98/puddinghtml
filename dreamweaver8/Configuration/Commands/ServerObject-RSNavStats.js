// Copyright 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

// *************** GLOBALS VARS *****************

var helpDoc = MM.HELP_objRecordsetStatistics;

var _RecordsetName = new EditableRecordsetMenu("RSStatsFirst.htm", "RecordsetName", "");

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
  var retVal = true;
  
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
  
  if (rsName)
  {
    // check if a page navigation repeat region exists for this recordset
    dwscripts.warnIfNoPageNavDisplay(rsName,true);
        
    // Build up the insertion string, and then apply a doc edit    
    var paramObj = new Object();
    
    paramObj["RecordsetName"] = rsName;
       
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
    
    // Get the language specific display strings
  if (dreamweaver.appVersion && ( (dreamweaver.appVersion.indexOf('ja') != -1) ||
								  (dreamweaver.appVersion.indexOf('ko') != -1) ||
								  (dreamweaver.appVersion.indexOf('zh') != -1) ) ) {
	var charSet = dw.getDocumentDOM().getCharSet();
	charSet = charSet.toLowerCase();
	if (   ( (dreamweaver.appVersion.indexOf('ja') != -1) && 
			 (charSet == "shift_jis" || charSet == "x-sjis" || charSet == "euc-jp" || charSet == "iso-2022-jp") )
		|| ( (dreamweaver.appVersion.indexOf('ko') != -1) && 
			 (charSet == "euc-kr") )
		|| ( (dreamweaver.appVersion.indexOf('zh') != -1) && 
			 (charSet == "big5" || charSet == "gb2312") ) ) {
	  // Japanese, Korean and Chinese exceptions
	  paramObj.beforeFirst = MM.LABEL_RSNavBeforeFirst;
	  paramObj.beforeLast  = MM.LABEL_RSNavBeforeLast;
	  paramObj.beforeTotal = MM.LABEL_RSNavBeforeTotal;
	  paramObj.afterTotal  = MM.LABEL_RSNavAfterTotal;
	} else {
	  // not a JA, KO, or Chinese document so we will use English to prevent corruption
        paramObj.beforeFirst = MM.LABEL_EngRSNavBeforeFirst;
        paramObj.beforeLast  = MM.LABEL_EngRSNavBeforeLast;
        paramObj.beforeTotal = MM.LABEL_EngRSNavBeforeTotal;
        paramObj.afterTotal  = MM.LABEL_EngRSNavAfterTotal;
      }
    } 
    else 
    {
      paramObj.beforeFirst = dwscripts.entityNameEncode(MM.LABEL_RSNavBeforeFirst);
      paramObj.beforeLast  = dwscripts.entityNameEncode(MM.LABEL_RSNavBeforeLast);
      paramObj.beforeTotal = dwscripts.entityNameEncode(MM.LABEL_RSNavBeforeTotal);
      paramObj.afterTotal  = (MM.LABEL_RSNavAfterTotal != null) ? "" : dwscripts.entityNameEncode(MM.LABEL_RSNavAfterTotal);
    }
    
    dwscripts.fixUpSelection(dw.getDocumentDOM(), false, true);
    dwscripts.applyGroup("RSNavStats", paramObj);
    
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
  
  // Display the example text
  var spanObj = dwscripts.findDOMObject("exampleSpan");
  
  if (spanObj)
  {
    spanObj.innerHTML = MM.LABEL_RSNavExampleText;
  }

  // Build Recordset menu
  _RecordsetName.initializeUI();
  
  var rsToPick = dwscripts.getRecordsetNameWithPageNav();
  if (rsToPick)
  {
    _RecordsetName.pickValue(rsToPick);
  }
  
  if (obj)
  {
    obj.focus();
  }
}
