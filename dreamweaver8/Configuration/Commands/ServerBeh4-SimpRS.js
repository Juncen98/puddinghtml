// Copyright 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.
 
var helpDoc = MM.HELP_ssSimpleRecordset;
var gSimpleParamName = "MMColParam";
var gTypes; //This is an array that holds the types of the columns in the column lists.
var ERROR_MESSAGE = "";

// IAKT: Added by BRI on 06/07/02
var RECORDSET_TYPE = 'Simple';

var RS_NAME_BOX, RS_TYPE_PARAM, CONN_LIST,COLUMN_RADIO,TABLE_LIST,COLUMN_LIST,FILTER_COL,
    OPERATOR,PARAM_TYPE,PARAM_VAL,SORT_COL,SORT_TYPE,OLD_FILTER_COL_STRING;
     
     
function clickedAdvanced()
{

  MM.RecordsetObject = GetDataFromUI()
  MM.IsSimpleRecordset = false
  MM.RecordsetSwitchingUI = true
  MM.RecordsetDone = false
  window.close()
}


function clickedOK()
{
  MM.RecordsetOK = true

  if (MM.RecordsetPriorRec)
  {
    var errMsg = CheckData(FINAL, MM.RecordsetPriorRec)
  }
  else
  {
    var errMsg = CheckData(FINAL, "")
  }

  if (errMsg != "")
  {
    MM.RecordsetOK = false
    alert(errMsg)
    return
  }

  MM.RecordsetObject = GetDataFromUI()

  RememberSimpleRecordset()
  window.close()
}


function RememberSimpleRecordset()
{

  var path = dreamweaver.getConfigurationPath() + '/ServerBehaviors/Shared/RSSeverModelSwitches.js';
  var metaFile;

  metaFile = MMNotes.open(path, true); // Force create the note file.
  if (metaFile) {
    MMNotes.set(metaFile, 'PREF_rsType', RECORDSET_TYPE);
    MMNotes.close(metaFile);
  }
}


function clickedCancel()
{
  window.close()
}


// IAKT: Edited by BRI on 06/07/02
function commandButtons()
{
	// find the index of the current recordset in MM.rsTypes
	//rsIndex = recordsetDialog.searchByType(RECORDSET_TYPE);
	
	btnArray =  new Array(
		MM.BTN_OK,       "clickedOK()", 
        MM.BTN_Cancel,   "clickedCancel()", 
        MM.BTN_Test,     "PopUpTestDialog()");
	// add a button for each different rs type
	for (i = 0;i < MM.rsTypes.length;i++) {
		if(MM.rsTypes[i].single == "true") {
			continue;
		}
    	if (dw.getDocumentDOM().serverModel.getServerName() == MM.rsTypes[i].serverModel) {
    		if (RECORDSET_TYPE.toLowerCase() != MM.rsTypes[i].type.toLowerCase()) {
				var btnLabel = dw.loadString("recordsetType/" + MM.rsTypes[i].type);
				if (!btnLabel) 
					btnLabel = MM.rsTypes[i].type;
				btnArray.push(btnLabel+"...");
				btnArray.push("clickedChange(" + i + ")");
			}
		}
	}
	btnArray.push(MM.BTN_Help);
	btnArray.push("displayHelp()"); 
	return btnArray;
}

//--------------------------------------------------------------------
// FUNCTION:
//   clickedChange
//
// DESCRIPTION:
//   This function is called when the user clicks another rs Type button
//
// ARGUMENTS:
//   newUIAction - the index of the new rs Type
//
// RETURNS:
//   nothing
// IAKT: Added by BRI on 06/07/02
//--------------------------------------------------------------------
function clickedChange(newUIAction) {
  // Update RECORDSET_SBOBJ from the UI.
  MM.RecordsetObject = GetDataFromUI();
	if (recordsetDialog.canDialogDisplayRecordset(MM.rsTypes[newUIAction].command,MM.RecordsetObject)) {

		MM.RecordsetSwitchingUI = true;
		MM.RecordsetDone = false;
		MM.recordSetType = MM.rsTypes[newUIAction].type;
		window.close();
	} else {
		alert(dw.loadString("serverBehavior/alert/recordset/cantDisplay"));
	}
}



function GetParametersFromUI()
{
  var outArray = new Array()

  if (IsFilterEnabled())
  {
    outArray[0] = GetParamObject(PARAM_TYPE.getIndex(), PARAM_VAL.value, Trim(RS_NAME_BOX.value))
      
    if (outArray[0].defaultVal == 0 && MM.SimpleRecordsetDefaultVal)
    {
      outArray[0].defaultVal = MM.SimpleRecordsetDefaultVal
    }
  }
  return outArray
}


function GetDataFromUI() {

	var uiData = new Object();

	// CRA added - ASP bug fix
	if (MM.RecordsetObject) {
		if (MM.RecordsetObject.PageSize) {
			uiData.PageSize = MM.RecordsetObject.PageSize;
		}
		if (MM.RecordsetObject.StartRecord) {
			uiData.StartRecord = MM.RecordsetObject.StartRecord;
		}
		if (MM.RecordsetObject.loopName) {
			uiData.loopName = MM.RecordsetObject.loopName;
		}
		if (MM.RecordsetObject.ConnectionName) {
			uiData.ConnectionName = MM.RecordsetObject.ConnectionName;
		}
		if (MM.RecordsetObject.varName) {
			uiData.varName = MM.RecordsetObject.varName;
		}
	}
  
	uiData.name = Trim(RS_NAME_BOX.value)
	uiData.connectionName = CONN_LIST.getValue()
	uiData.paramArray = GetParametersFromUI()
	uiData.sql = GetSQLFromUI()
	uiData.isSimple = true  
	uiData.subType = RS_TYPE_PARAM.getValue()
    
	return uiData
}



function inspectTable(sqlObj)
{
  var ops = TABLE_LIST.object.options
  var foundTable = false
  for (var i = 0; i < ops.length; i++)
  {
    if (String(ops[i].text).toLowerCase() == String(sqlObj.table).toLowerCase())
    {
      foundTable = true
      ops[i].selected = true
    }
    else
    {
      ops[i].selected = false
    }
  }
}


function inspectColumns(sqlObj)
{
  var ops = COLUMN_LIST.object.options

  if (sqlObj.all)
  {
    COLUMN_RADIO[0].checked = true
    COLUMN_RADIO[1].checked = false
  }
  else
  {
    COLUMN_RADIO[0].checked = false
    COLUMN_RADIO[1].checked = true  
          
    for (var i = 0; i < ops.length; i++)
    {
      var shouldBeSelected = false

      for (var j = 0; j < sqlObj.columns.length; j++)
      {
        if (String(sqlObj.columns[j]).toLowerCase() == String(ops[i].text).toLowerCase())
        {
          shouldBeSelected = true
          break
        }
      }

      ops[i].selected = shouldBeSelected
    }
  }
}


function inspectFilter(sqlObj, rsName)
{

  if (sqlObj.filterColumn)
  {
    FILTER_COL.pickValue(sqlObj.filterColumn)
    PickValue(OPERATOR, sqlObj.filterOperator)

    // Parse the Runtime value of the parameter to see what type it is
    // and what the name of the param is

    var paramType = 0
    var paramName = "x"

    var paramObj = GetParamTypeAndName(MM.RecordsetObject.paramArray[0], rsName)
    if (paramObj)
    {
      paramType = paramObj.paramType
      paramName = paramObj.paramName
    }

    PARAM_TYPE.setIndex(paramType)
    PARAM_VAL.value = paramName
    if (paramName == sqlObj.filterColumn)
    {
      OLD_FILTER_COL_STRING = paramName // Remember that they used the name of the col
                                        // as the name of the param for use in
                                        // FilterColChanged.
    }

    SetFilterControlsEnabled(true)
  }
  else
  {
    //reset to disabled
    FILTER_COL.setIndex(0)
    SetFilterControlsEnabled(false)
  }
}

function inspectSort(sqlObj)
{
  if (sqlObj.sortColumn)
  {

    //Don't use the built-in pickValue method, as it is case sensitive.
    //Do it manually instead. Copy the code from the ListControl class..

    var indx = 0;
    var columnUpperCase = String(sqlObj.sortColumn).toUpperCase();

    for (var i=0; i < SORT_COL.getLen(); i++) {
      if (String(SORT_COL.getValue(i)).toUpperCase() == columnUpperCase) {  //  TO DO: what if value is an object?
        indx = i;
      }
    }
    SORT_COL.setIndex(indx);
        
    var ops = SORT_TYPE.options
    for (var i = 0; i < ops.length; i++)
    {
      if (ops[i].value == sqlObj.sortType)
      {
        ops[i].selected = true
        break
      }
    }

    SetEnabled(SORT_TYPE, true)
  }
  else
  {
    //reset disabled
    SORT_COL.setIndex(0)
    SetEnabled(SORT_TYPE, false)
  } 
}


function inspectUI() 
{ 
	
  var ro = MM.RecordsetObject

  if (MM.RecordsetObject.paramArray.length == 1)
  {
    // Remember if there was a default val for use in GetParametersFromUI()
    MM.SimpleRecordsetDefaultVal = MM.RecordsetObject.paramArray[0].defaultVal
  }

  RS_NAME_BOX.value = MM.RecordsetObject.name
  CONN_LIST.pickValue(MM.RecordsetObject.connectionName)
  
  // IAKT: Added by BRI on 08/07/02
  if (!RS_TYPE_PARAM.pickValue(ro.subType)) {
      RS_TYPE_PARAM.setIndex(0);
  }

  ConnectionChanged()

  var sqlObj = ParseSimpleSQL(MM.RecordsetObject.sql)

  if (!sqlObj)
  {
    alert(dwscripts.sprintf(MM.MSG_SQLNotSimple, dwscripts.getRecordsetDisplayName()));
    return
  }

  if (sqlObj.empty)
  {
    // nothing to inspect

    return
  }

  if (sqlObj.table != TABLE_LIST.getValue())
  {
    refreshColumns = true
  }
  else
  {
    refreshColumns = false
  }

  inspectTable(sqlObj)

  if (refreshColumns)
  {
    TableChanged() 
  }

  inspectColumns(sqlObj)

  inspectFilter(sqlObj, MM.RecordsetObject.name)

  inspectSort(sqlObj) 

  RadioChanged()

}


function PickValue(list, val)
{
  var ops = list.options
  for (var i = 0; i < ops.length; i++)
  {
    if (ops[i].value == val)
    {
      ops[i].selected = true
      break
    }
  }
}


function CheckData(reason, priorName)
{
  /*
  This function checks all of the input variables to see
  if the user has filled out everything okay...if not
  return an error string.  If so, return empty string
  */

  var strOut = ""

  if (reason == FINAL)
  {
    // we don't get here if we are just testing the SQL statement
    var theName = Trim(RS_NAME_BOX.value)
    if (theName == "")
    {
      strOut += MM.MSG_NoRecordsetName;
      return strOut
    }

    if (!IsValidVarName(theName))
    {
      strOut = MM.MSG_InvalidRecordsetName
      return strOut
    }

    if (IsDupeObjectName(theName, priorName))
    {
      return MM.MSG_DupeRecordsetName;
    }
  
    if (IsReservedWord(theName))
    {
      return dwscripts.sprintf(MM.MSG_ReservedWord, theName);
    }
    
  }

  if (CONN_LIST.getIndex() == 0)
  {
    strOut += MM.MSG_NoConnection;
    return strOut
  }

  var tableName = TABLE_LIST.getValue();
  if(Trim(tableName) == "")
  {
    strOut += MM.MSG_NoTableSelected;
    return strOut;
  }
  
  if (GetColumns() == "")
  {
    return MM.MSG_SelectColumns 
  }

  if (IsFilterEnabled())
  {
    if (Trim(PARAM_VAL.value) == "")
    {
      PARAM_VAL.focus()
      if (!IsLiteralValue(PARAM_TYPE.getIndex()))
      {
        return MM.MSG_MissingParamName + " " + PARAM_TYPE.getValue()
      }
      else
      {
        return MM.MSG_MissingFilterVal;
      }
      
    }

    if (!isFilterColumnString())
    {
      var operator = OPERATOR.options[OPERATOR.selectedIndex].value
      switch(operator)
      {
        case "begins with":
        case "ends with":
        case "contains":
          
          return MM.MSG_CanOnlyUseThisOperatorOnAString;
      }
    } 
  }

  return strOut
}


function GetSQLFromUI()
{
  var theTable = TABLE_LIST.getValue()

  if (theTable == null || theTable == "")
  {
    return "";
  }
  if (theTable.indexOf(" ") >= 0)
  {
	var aBracketedTable = "";
	var theSplitTable = theTable.split(".");
	var n = theSplitTable.length;
	for(var i = 0; i < n; i++)
	{
		if(i > 0)
		{
			aBracketedTable += ".";
		}
		var aSlice = theSplitTable[i];
		if(aSlice.indexOf(" ") >= 0)
		{
			aBracketedTable += "[" + aSlice + "]";
		}
		else
		{
			aBracketedTable += aSlice;
		}
	}
	theTable = aBracketedTable;
  }

  var cols = GetColumns()
  var theSQL = "SELECT " + cols + " FROM " + theTable

  if (IsFilterEnabled())
  {
    theSQL += " WHERE " + FILTER_COL.getValue() 
    var theOperator = OPERATOR.options[OPERATOR.selectedIndex].value
    switch(theOperator)
    {
      case "=":
      case ">":
      case "<":
      case ">=":
      case "<=":
      case "<>":
        theSQL += " " + theOperator + " "
        var enclosingToken = getToken()
        theSQL += enclosingToken + gSimpleParamName + enclosingToken
        break;
      case "begins with":
        theSQL += " LIKE '" + gSimpleParamName + "%'"
        break
      case "ends with":
        theSQL += " LIKE '%" + gSimpleParamName + "'"
        break
      case "contains":
        theSQL += " LIKE '%" + gSimpleParamName + "%'"
        break
    }
  }

  if (IsSortEnabled())
  {
    theSQL += " ORDER BY " + SORT_COL.getValue() + " " + SORT_TYPE.options[SORT_TYPE.selectedIndex].value
  }

  
  return theSQL
}


function isFilterColumnString()
{
  return (getToken() == "'");
}

function getToken()
{
  if (IsFilterEnabled())
  {
    if (IsLiteralValue(PARAM_TYPE.getIndex()))
    {
      var value = PARAM_VAL.value;
      if (value.length)
      {
        if ((value.charAt(0)=="#") &&
          (value.charAt(value.length-1)=="#"))
        {
          return "";
        }
      }
    }
  }

  var index = FILTER_COL.object.selectedIndex - 1
  
  var retVal = "";
  if (   dwscripts.isStringDBColumnType(gTypes[index])
      || dwscripts.isDateDBColumnType(gTypes[index])
     )
  {
    retVal = "'";
  }
  
  return retVal;
}


function GetColumns()
{
  var cols = "*"

  if (COLUMN_RADIO[1].checked)
  {
    var ops = COLUMN_LIST.object.options
    cols = ""
    for (var i = 0; i < ops.length; i++)
    {
      if (ops[i].selected)
      {
        if(cols != "")
        {
          cols += ", "
        }
        cols += ops[i].text
      }
    }
  }

  return cols
}

function initializeUI()
{
  //Create global vars for all controls

  MM.SimpleRecordsetDefaultVal = null  //Clear the default Val holder. It
                                          //may be set again in inspectUI
  
  RS_NAME_BOX = findObject("RecordsetName")

  RS_NAME_BOX.value = CreateNewName()
  CONN_LIST = new ListControl("ConnectionList")

  COLUMN_RADIO = findObject("RadioButton")
  TABLE_LIST = new ListControl("TableList")
  COLUMN_LIST = new ListControl("ColumnList")

  FILTER_COL = new ListControl("ColumnDropDown")
  OPERATOR = findObject("OperatorDropDown")
  PARAM_TYPE = new ListControl("ParameterTypeDropDown")
  PARAM_VAL = findObject("ParameterValue")
  SORT_COL = new ListControl("SortByColumnDropDown")
  SORT_TYPE = findObject("SortByTypeDropDown")

  OLD_FILTER_COL_STRING = ""  // Global var to remember the last filter
                              // col selected. (This var is used in
                              // FilterColChanged and inspectFilter)

  // Get the UI elements
	RS_TYPE_PARAM = new RsTypeMenu("Recordset.htm", "RsTypeParameter",recordsetDialog.searchByType(RECORDSET_TYPE));
	RS_TYPE_PARAM.initializeUI();

  PopulateConnectionList()
  


  ConnectionChanged()

  PopulateParamTypeList() 


  if (MM.RecordsetSwitchingUI || MM.RecordsetPriorRec)
  {

    inspectUI()

  }
  else
  {
    // Make sure these are disabled

    FILTER_COL.setIndex(0)
    SetFilterControlsEnabled(false)

    SORT_COL.setIndex(0)
    SetEnabled(SORT_TYPE, false)

  }

  if (ERROR_MESSAGE) alert(ERROR_MESSAGE);
  
  elts = document.forms[0].elements;
  if (elts && elts.length)
  {
    elts[0].focus();
    elts[0].select();
  }
}


function PopulateParamTypeList()
{
  var paramTypes = GetParamTypeArray()
  PARAM_TYPE.setAll(paramTypes, paramTypes)
  PARAM_TYPE.setIndex(0)
}


function IsFilterEnabled()
{
  return (FILTER_COL.object.selectedIndex > 0)
}


function IsSortEnabled()
{
  return (SORT_COL.object.selectedIndex > 0)
}


function PopUpTestDialog()
{

  var msg = CheckData(FOR_TEST, "")
  if (msg != "")
  {
    alert(msg)
    return
  }

  var statement = GetSQLFromUI()

  if (IsFilterEnabled())
  {
  
    var isEmpty = Trim(PARAM_VAL.value) == ""
  
    if (!IsLiteralValue(PARAM_TYPE.getIndex()))
    {
      // Pop up a dialog to get the default value to use in the test  
      MM.paramName = PARAM_TYPE.getValue() + ": " + PARAM_VAL.value
      dw.runCommand("GetTestValue")
      if (!MM.clickedOK)
      {
        return
      }
    }
    else
    {
      // The user has chosen to provide the comparison value of the filter
      MM.retVal = PARAM_VAL.value
    }
  }

  var re = new RegExp("\\b" + gSimpleParamName + "\\b", "g")

  statement = statement.replace(re, String(MM.retVal).replace(/'/g, "''"))

  //alert(statement)

  MMDB.showResultset(CONN_LIST.getValue(), statement)
}


function RemoveWhereClause(sql)
{
  var theSQL = String(sql)
  var strOut = theSQL

  var wherePos = theSQL.search(/\s+where\s+/i)
  if (wherePos != -1)
  {
    var orderByPos = theSQL.search(/\s+order\s+by\s+/i)
    if (orderByPos != -1)
    {
      strOut = theSQL.substring(0, wherePos) + theSQL.substring(orderByPos)
    }
    else
    {
      strOut = theSQL.substring(0, wherePos)
    }
  }

  return strOut
}


function ConnectionChanged()
{

  var i, tables
  
  if (CONN_LIST.getIndex() == 0)
  {
    tables = new Array()
  }
  else
  {
    // Get the tables and views

    // First get the tables
    tables = new Array()
    tableObjects = MMDB.getTables(CONN_LIST.getValue())    
    if (tableObjects.length == 0)
    {
      alert(MM.MSG_ConnErrs)
    }
    for (i = 0; i < tableObjects.length; i++)
    {
      var thisTable = tableObjects[i]
      thisSchema =  Trim(thisTable.schema)
      if (thisSchema.length == 0)
      {
        thisSchema = Trim(thisTable.catalog)
      }
      if (thisSchema.length > 0)
      {
        thisSchema += "."
      }
      tables.push(String(thisSchema + thisTable.table))
    }

    // Now get the views
    views = new Array()
    tableObjects = MMDB.getViews(CONN_LIST.getValue())
    for (i = 0; i < tableObjects.length; i++)
    {
      thisTable = tableObjects[i]
      thisSchema =  Trim(thisTable.schema)
      if (thisSchema.length == 0)
      {
        thisSchema = Trim(thisTable.catalog)
      }
      if (thisSchema.length > 0)
      {
        thisSchema += "."
      }
      views.push(String(thisSchema + thisTable.view))
    }

    if (views.length > 0)
    {
    var isMySQL = false;
    var tableslen = tables.length;
    var viewslen = views.length;

    if (tableslen == viewslen)
    {
     if ((tableslen) && (viewslen))
     {
      //Quick check for mysql...
      if ((tables[0] == views[0]) &&
          (tables[tableslen-1] == views[viewslen-1]) &&
        (tables[tableslen/2] == views[viewslen/2]))
      {
        isMySQL = true;
      }
     }
    }

    if (!isMySQL)
    { 
    tables = tables.concat(views)
    }
    }

  }


  TABLE_LIST.setAll(tables, tables)
  TABLE_LIST.setIndex(0)

  TableChanged()
  RadioChanged()
}


function TableChanged()
{
  var colsAndTypes = MMDB.getColumnAndTypeOfTable(CONN_LIST.getValue(), TABLE_LIST.getValue())

  var cols = new Array()
  gTypes = new Array()

  if (String(colsAndTypes[0]).indexOf("MM_ERROR:") == -1)
  {
    var numCols = 0
    for (var i = 0; i < colsAndTypes.length; i+=2)
    {
      cols[numCols] = colsAndTypes[i]
      gTypes[numCols] = colsAndTypes[i + 1]
      numCols++
    }
  }

  COLUMN_LIST.setAll(cols, cols)

  var ops = COLUMN_LIST.object.options
  
  if(COLUMN_RADIO[0].checked)
  {
    if(ops.length > 0)
    {
      ops[0].selected = false
    }
  }


  var colsWithNone = new Array(MM.LABEL_None)
  colsWithNone = colsWithNone.concat(cols)
  FILTER_COL.setAll(colsWithNone, colsWithNone)
  SORT_COL.setAll(colsWithNone, colsWithNone)


  //Reset the controls
  PARAM_VAL.value = ""
  // Set the ALL radio to be checked
  COLUMN_RADIO[0].checked = true
  //COLUMN_RADIO[1].checked = false
  RadioChanged()
  FILTER_COL.setIndex(0)
  SORT_COL.setIndex(0)
  FilterColChanged()
  SortColChanged()
}



function LaunchConnectionManager()
{
  var oldList = String(CONN_LIST.valueList).split(",")
  MMDB.showConnectionMgrDialog()
  PopulateConnectionList()
  var newConnectionIndex = getNewConnection(oldList, CONN_LIST.valueList)
  if (newConnectionIndex != -1)
  {
    CONN_LIST.setIndex(newConnectionIndex)
  }
  ConnectionChanged()
}


function RadioChanged()
{

  var ops = COLUMN_LIST.object.options

  if(COLUMN_RADIO[0].checked)
  {

    SetEnabled(COLUMN_LIST.object, false) 

    for (var i = 0; i < ops.length; i++)
    {
      ops[i].selected = false
    }

  } 
  else 
  {

    SetEnabled(COLUMN_LIST.object, true)

  }

}


function FilterColChanged()
{
  var filCol = FILTER_COL.getValue()
  if (IsFilterEnabled() && (Trim(PARAM_VAL.value) == "" || PARAM_VAL.value == OLD_FILTER_COL_STRING))
  {
    // If the filter is enabled and
    // (the param val is blank or the param val is the name of the old filter col)
    // change the param val.
    // If the user entered their own param val, we will not write over it.
    PARAM_VAL.value = filCol
    OLD_FILTER_COL_STRING = filCol  // Remember for next time we are called
  }
  SetFilterControlsEnabled(IsFilterEnabled())
}


function SortColChanged()
{
  SetEnabled(SORT_TYPE, IsSortEnabled())
}


function SetFilterControlsEnabled(enable)
{
  SetEnabled(OPERATOR, enable)
  SetEnabled(PARAM_TYPE.object, enable)
  SetEnabled(PARAM_VAL, enable)
}


// As opposed to the Advanced RS, the simple RS does not
// automatically choose the connection if it is the only
// one.  This is because it takes a while for the
// UI to populate itself if we do it that way.

function PopulateConnectionList()
{
  var oldConn = CONN_LIST.getValue()

  var connList = MMDB.getConnectionList()

  var wholeList = new Array()

  wholeList.push(MM.LABEL_None)
  for (var i = 0; i < connList.length; i++)
  {
    wholeList.push(connList[i])
  }

  CONN_LIST.setAll(wholeList, wholeList)
  CONN_LIST.setValue(MM.LABEL_None, 0)

  var index = CONN_LIST.getIndex(oldConn)

  if (!CONN_LIST.pickValue(oldConn)) 
  {
  
    CONN_LIST.setIndex(0)
    
  }
}


function receiveArguments(errorMsg) {
  ERROR_MESSAGE = errorMsg;
}


// IAKT: Added by BRI on 08/07/02
function rsTypeChanged(){
	
}

//--------------------------------------------------------------------
// FUNCTION:
//   canDisplayRecordset
//
// DESCRIPTION:
//   Check if the Recordset Object can be displayed by this Command
//
// ARGUMENTS:
//   rsObject - the Recordset Object. Contains information about the recordset that needs to be displayed
//
// RETURNS:
//   boolean - (true if the recordset can be displayed)
//--------------------------------------------------------------------

function canDisplayRecordset(rsObject) {
    if (!rsObject) return true;
    var sqlString = rsObject.sql;
	var params = new Array();
	//backing out this fix since it is introducing other side effects
	//bug 200176:Can't open recordset in simple mode  
	/*for (var i=0; i<rsObject.paramArray.length; i++) {
		var re = new RegExp("where\\s+\\w+\\s*[^\\s]+\\s*'*"+rsObject.paramArray[i].name+"'*", "i");
		if(!sqlString.match(re)) {
		sqlString = sqlString.replace(rsObject.paramArray[i].name, "%s");
		}
	}*/
	simpleObj = ParseSimpleSQL(sqlString);
	if (simpleObj) {
		return true;
	} else {
		return false;
	}
}
