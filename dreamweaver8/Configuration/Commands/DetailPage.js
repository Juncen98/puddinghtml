// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

//*************** GLOBALS  *****************

var LIST_RS, LIST_COL_SHOW, LIST_KEY_COL, LIST_LINK_COL, LIST_DETAIL_COL;
//var CHECK_CREATEFILE;

var MODEL_IS_CF = (dw.getDocumentDOM().serverModel.getServerName() == "Cold Fusion");
var NUM_RepeatCount = 0; // this number is updated in initializeUI
var TF_REPEAT_COUNT;

var detailPageObj = new Object();
var m_colShowArray = new Array();
var dom;

//******************* API **********************

function commandButtons()
{
   return "";
}
 
function receiveArguments(obj)
{
  detailPageObj = obj;

}

//***************** LOCAL FUNCTIONS  ******************

function InitializeUI() {

  MM.setBusyCursor();

  var paramObj = new Object();
  var sbObj = null;
  var tableCol1Str, tableCol2Str, tableRowStr;
  var tableObj = new Object();
  var tableObj2 = new Object();
  var dynObj = new Object();

  tableObj.align = "default";
  tableObj.width = "50%";

  //TODO: Ensure that the recordset name is unique.


  //Get the selected columns from the detailPageObj.
  m_colShowArray = detailPageObj.columnList;
  alert(m_colShowArray.length);

  //Since the columns will include the 3 Recordset stats objects, 
  //remove them from the list before updating the dialog list boxes.
  //var newLength = (m_colShowArray.length) - 3;
  //m_colShowArray.splice(newLength, 3);

  dom = dw.getDocumentDOM();

  paramObj.rs = detailPageObj.ssRec.rsName;

  //Set the columnID and param.
  paramObj.paramName = detailPageObj.paramName;
  paramObj.col = detailPageObj.colId;

  //create new, empty custom group
  var customGroup = new Group();

  //get the moveToSpecificRecord Group.
  var moveToSpecificRecordGroup = new Group("moveToSpecificRecord");
  moveToSpecificRecordGroup.getData(true,true);

  //get "directive" participants from Move To groups and add to customGroup
  customGroup.addParticipants(moveToSpecificRecordGroup.getParticipants("aboveHTML"));

  var rowDataPart = new Participant("MasterDetail_TableData");
  rowDataPart.getData(true, true);

  var rowPart = new Participant("MasterDetail_TableRow");
  rowPart.getData(true, true);

  var tablePart = new Participant("MasterDetail_Table");
  tablePart.getData(true, true);
 
  var dynDataPart = new Participant("dynamicData_ref");
  dynDataPart.getData(true,true);

  tableCol1Str = "";
  tableCol2Str = "";
  tableRowStr = "";
  outStr = ""

  for (var i = 0; i < m_colShowArray.length; i++) {

    //Display the column name in the first column..
	tableObj.rowDataContent = m_colShowArray[i];
    tableCol1Str = rowDataPart.getInsertString(tableObj, "afterSelection");
	
    //Display the dynamic data in the second column..
    dynObj.rsName = detailPageObj.ssRec.rsName;;
    dynObj.bindingName = m_colShowArray[i];
    tableObj.rowDataContent = dynDataPart.getInsertString(dynObj, "replaceSelection")
    tableCol2Str = rowDataPart.getInsertString(tableObj, "afterSelection")

    //Build the HTML table row
	tableObj2.tableRowContent = tableCol1Str + tableCol2Str;
    tableObj2.preRowData = "";
    tableObj2.postRowData = "";

    tableRowStr = rowPart.getInsertString(tableObj2, "afterSelection");

	outStr += tableRowStr;
  }	

  paramObj.tableContent = outStr;
  paramObj.tableAlign = "center";
  paramObj.border = "1";
  customGroup.addParticipants(Array(tablePart))

  //Apply the custom group.
  customGroup.apply(paramObj,sbObj);

  //Paste the recordset
  pasteServerBehavior(detailPageObj.ssRec);

  MM.clearBusyCursor();
}
