// Copyright 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

// *************** GLOBALS VARS *****************

var HELP_DOC = MM.HELP_objDynamicTable;

var PREF_SECTION = "Extensions\\Objects\\Dynamic Table";

var PREF_KEY_SHOW     = "Show";
var PREF_DEFAULT_SHOW = 10;

var PREF_KEY_BORDER     = "Border";
var PREF_DEFAULT_BORDER = 1;

var PREF_KEY_CELLPADDING     = "Cell Padding";
var PREF_DEFAULT_CELLPADDING = "";

var PREF_KEY_CELLSPACING     = "Cell Spacing";
var PREF_DEFAULT_CELLSPACING = "";


// global form elements
var _Recordset = new ListMenu("Dynamic Table.htm", "Recordset", "");
var _Show = new NumRecButtons("Dynamic Table.htm", "Show", "");
var _Border = new TextField("Dynamic Table.htm", "Border", "");
var _Cell__Padding = new TextField("Dynamic Table.htm", "Cell__Padding", "");
var _Cell__Spacing = new TextField("Dynamic Table.htm", "Cell__Spacing", "");



// ******************* API **********************

//--------------------------------------------------------------------
// FUNCTION:
//   insertObject
//
// DESCRIPTION:
//   inserts the appropriate html into the document head and document body
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string - empty upon success, or an error message if not successful.
//            if a string is returned, then that string is alerted when the
//            user clicks the "OK" button
//--------------------------------------------------------------------
function insertObject()
{
  var errStr = "";
  var rsName = _Recordset.getValue();
  var fieldNames = dwscripts.getFieldNames(rsName);
  var numRecs = _Show.getValue(); // equals "all" or an integer
  var border = _Border.getValue();
  var cellPadding = _Cell__Padding.getValue();
  var cellSpacing = _Cell__Spacing.getValue();
  
  if (!errStr)
  {
    errStr = _Show.applyServerBehavior("",new Object());
  }
  
  if (!errStr)
  {
    var isAll = (numRecs == "all");
    errStr = dwscripts.canInsertPageNavDisplay(rsName, true, isAll);
  }
  
  if (!errStr)
  {
    if (!isBlankOrZeroOrAPositiveInteger(border))
      errStr = dwscripts.sprintf(MM.MSG_NeedBlankOrNumberZeroOrGreater,MM.LABEL_Border);
  }
  
  if (!errStr)
  {
    if (!isBlankOrZeroOrAPositiveInteger(cellPadding))
      errStr = dwscripts.sprintf(MM.MSG_NeedBlankOrNumberZeroOrGreater,MM.LABEL_CellPadding);
  }
  
  if (!errStr)
  {
    if (!isBlankOrZeroOrAPositiveInteger(cellSpacing))
      errStr = dwscripts.sprintf(MM.MSG_NeedBlankOrNumberZeroOrGreater,MM.LABEL_CellSpacing);
  }
  
  
  if (!errStr)
  {
    var paramObj = new Object();
    paramObj.RecordsetName = rsName;
    paramObj.PageSize = (numRecs == "all")?"":numRecs;
    paramObj.Border = border;
    paramObj.CellPadding = cellPadding;
    paramObj.CellSpacing = cellSpacing;
    paramObj.FieldNameArray = fieldNames;
   
    //entity encode the table names for the labels, but only for latin encodings
    var fieldLabels = new Array();
    if( dw.getDocumentDOM() && dw.getDocumentDOM().getCharSet().indexOf("iso-8859-") != -1 )
	{
		for( var i = 0 ; i < fieldNames.length ; i++ ) {
			fieldLabels[i] = dwscripts.entityNameEncode(fieldNames[i]);
		}
	}
	else
	{
		fieldLabels = fieldNames;
	}
    paramObj.FieldLabelArray = fieldLabels;
    

    // Set parameters to support the older Server Models
    paramObj.rsName = paramObj.RecordsetName;
    paramObj.loopName = createUniqueRepeatedRegionName();
    paramObj.numRows = (paramObj.PageSize) ? paramObj.PageSize : -1;


    // Set the page size on the recordset, if the function
    //  setPageSize is defined
    var sbRecordset = dwscripts.getServerBehaviorByParam("Recordset.htm","RecordsetName",paramObj["RecordsetName"]);
    if (sbRecordset && sbRecordset.setPageSize != null)
    {
      var newRS = sbRecordset.makeEditableCopy();
      newRS.setPageSize(paramObj.PageSize);
      newRS.queueDocEdits();
    }
    
    // fix up the selection for table insert
    if (!dwscripts.selectionIsInBody())
    {
      dwscripts.setCursorToEndOfBody();
    }
    dwscripts.setCursorOutsideParagraph();
    dwscripts.adjustCursorForEmptyTableCell();


		// Apply the group file to the page
    paramObj.MM_ignoreFamily = "RepeatedRegion_pageNum,RepeatedRegion_maxRows,RepeatedRegion_startRow,RepeatedRegion_endRow,RepeatedRegion_totalPages";
    dwscripts.applyGroup("DynamicTable", paramObj);
    
    
    // Save the dialog preferences
    savePreferences();
  }
  
 
  return errStr;
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



// ***************** LOCAL FUNCTIONS  ******************

//--------------------------------------------------------------------
// FUNCTION:
//   initializeUI
//
// DESCRIPTION:
//   Initializes the form elements and populates them with needed content
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function initializeUI()
{
  // populate Recordset menu
  var rsNames = dwscripts.getRecordsetNames();
  _Recordset.initializeUI(rsNames, rsNames);
  
  // initialize Num Recs control and textfields
  _Show.initializeUI();
  _Border.initializeUI();
  _Cell__Padding.initializeUI();
  _Cell__Spacing.initializeUI();
  
  // restore Show, Border, Cell Padding, and Cell Spacing values
  _Show.setValue(getPreference("show"));
  _Border.setValue(getPreference("border"));
  _Cell__Padding.setValue(getPreference("cellPadding"));
  _Cell__Spacing.setValue(getPreference("cellSpacing"));

  document.forms[0].elements[0].focus();
}



//--------------------------------------------------------------------
// FUNCTION:
//   getPreference
//
// DESCRIPTION:
//   gets the previous repeated region, border, cell padding, and cell spacing values
//
// ARGUMENTS:
//   whichPref - string ("border,"show","cellPadding" and "cellSpacing" are valid)
//     
//
// RETURNS:
//   the last chosen preference, uses default value if no previous preference
//--------------------------------------------------------------------
function getPreference(whichPref)
{ 
  var retVal = "";
  var pref = whichPref.toLowerCase();

  if (pref == "show")
  {
    retVal = dw.getPreferenceString(PREF_SECTION,PREF_KEY_SHOW,PREF_DEFAULT_SHOW);
  } 
  else if (pref == "border")
  {
    retVal = dw.getPreferenceString(PREF_SECTION,PREF_KEY_BORDER,PREF_DEFAULT_BORDER);
  } 
  else if (pref == "cellpadding")
  {
    retVal = dw.getPreferenceString(PREF_SECTION,PREF_KEY_CELLPADDING,PREF_DEFAULT_CELLPADDING);
  }
  else if (pref == "cellspacing")
  {
    retVal = dw.getPreferenceString(PREF_SECTION,PREF_KEY_CELLSPACING,PREF_DEFAULT_CELLSPACING);
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   savePreferences
//
// DESCRIPTION:
//   saves the repeated region, border, cell padding, and cell spacing values
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function savePreferences()
{
  dw.setPreferenceString(PREF_SECTION,PREF_KEY_SHOW,_Show.getValue());
  dw.setPreferenceString(PREF_SECTION,PREF_KEY_BORDER,_Border.getValue());
  dw.setPreferenceString(PREF_SECTION,PREF_KEY_CELLPADDING,_Cell__Padding.getValue());
  dw.setPreferenceString(PREF_SECTION,PREF_KEY_CELLSPACING,_Cell__Spacing.getValue());
}


//--------------------------------------------------------------------
// FUNCTION:
//   isBlankOrZeroOrAPositiveInteger
//
// DESCRIPTION:
//   determines if the value is blank or zero or a positive integer.
//   Used for the border, cell padding, and cell spacing checks
//
// ARGUMENTS:
//   theVal -- string or integer
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------
function isBlankOrZeroOrAPositiveInteger(theVal)
{
  var retVal = true;
  
  if (theVal)
  {
    if (parseInt(theVal) != theVal || theVal<0)
    {
      retVal = false;
    }
  }
  
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   createUniqueRepeatRegionName
//
// DESCRIPTION:
//   This function returns a unique name for a new repeated region
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string - a unique name
//--------------------------------------------------------------------
function createUniqueRepeatedRegionName()
{
  //search the ssRecs for other names
  var retVal = "";
  
  var ssRecs = dw.serverBehaviorInspector.getServerBehaviors();
  
  var num = 0;
  var rrName = "";
  
  while (!retVal)
  {
    num++;
    rrName = "Repeat" + num;
    for (var i=0; i < ssRecs.length; i++) //search all ssRecs
    {
      var ssRec = ssRecs[i];
      if (ssRec.parameters.loopName != null && 
          ssRec.parameters.loopName.toLowerCase() == rrName.toLowerCase())
      {
        break;
      }
    }
    if (i >= ssRecs.length)
    {
      retVal = rrName;
    }
  }
  
  return retVal;
}

