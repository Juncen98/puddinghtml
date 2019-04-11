// Copyright 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

//*************** GLOBALS  *****************

var m_Recordset = "";
var m_ColumnsToShow = "";
var m_AvailableColumns = "";
var m_NumberOfRecords = 0;
var m_CreateFile = false;
var m_FileName = ""
var m_LinkFromColumn = ""
var m_UniqueKeyColumn = ""
var m_urlPath;
var m_RepeatRegionName = "";
var detailPageObj;
var m_colShowArray;
var m_ServerLanguage;
var m_ServerModel;
var m_ServerExt;
var m_enclosingToken;
var m_documentTypeID = "";
var CONST_where = "WHERE";
var CONST_and = "AND";
var CONST_orderBy = "ORDER BY";
var CONST_groupBy = "GROUP BY";
var defaultValue = "1";

var LIST_RS, LIST_COL_SHOW, LIST_KEY_COL, LIST_LINK_COL, LIST_DETAIL_COL;
//var CHECK_CREATEFILE;
var m_ColShowArray, m_ColAvlArray, m_DetailColShowArray, mDetailColAvlArray, m_typesArray, m_allColumnsArray; 

var MODEL_IS_CF;
var TF_REPEAT_COUNT;

var helpDoc = MM.HELP_objMasterDetail;


//******************* API **********************

function commandButtons()
{
   return new Array( MM.BTN_OK, "okClicked()",
                     MM.BTN_Cancel, "cancelClicked()",
                     MM.BTN_Help, "displayHelp()");
}
 
//***************** LOCAL FUNCTIONS  ******************
function canInsert()
{

  var retVal = true;
  var errMsgStr = "";
  var filePath = dreamweaver.getDocumentPath("document");
  m_ServerLanguage = dw.getDocumentDOM().serverModel.getServerLanguage();
  m_ServerModel = dw.getDocumentDOM().serverModel.getServerName();
  m_ServerExt = dw.getDocumentDOM().serverModel.getServerExtension().replace(/\./g, "");

  if (dwscripts.getRecordsetNames().length == 0)
  { 
    errMsgStr = dwscripts.sprintf(MM.MSG_NeedRecordsetForObject, dwscripts.getRecordsetDisplayName());
  } else if (filePath == "") {
    errMsgStr = MM.MSG_saveDocument;
  }
    
  if (errMsgStr)
  {
    alert (errMsgStr);
    retVal = false;
  }
  
  return retVal;

}



function initializeUI() {

  var errMsg ="";

  //Build Recordset menu
  LIST_RS           = new ListControl("Recordset");
  LIST_COL_SHOW     = findObject("ColumnsToShow");
  LIST_DETAIL_COL   = findObject("DetailColumnsToShow");
  
  //The two objects below will be used for all m anipulation of data.
  LIST_LINK_COL   = new ListControl("LinkColumn");
  LIST_KEY_COL    = new ListControl("KeyColumn");

  //These two objects are a copy of the two above but will be used only for 
  //the enabling/disabling mechanism. All data related manipulation must be 
  //done using the above two objects.
  LIST_LINK_COL_OBJ = findObject("LinkColumn");
  LIST_KEY_COL_OBJ  = findObject("KeyColumn");
  
  TF_REPEAT_COUNT   = findObject("RepeatCount");
  RB_COUNT          = new RadioGroup("RecordCount");

  EDIT_FILENAME     = findObject("DetailFileName");

  m_ColShowArray = new Array();
  m_ColAvlArray = new Array();
  m_DetailColShowArray = new Array();
  m_DetailColAvlArray = new Array();
  m_allColumnsArray = new Array();
  m_typesArray = new Array();
  
  MODEL_IS_CF = (dw.getDocumentDOM() != null && dw.getDocumentDOM().serverModel.getServerName() == "Cold Fusion");

  m_RepeatRegionName = createNewRepeatRegionName();

  m_documentTypeID = dw.getDocumentDOM().documentType;

  var rsNames = dwscripts.getRecordsetNames();

  //Fill the Recordset listbox with names of the Recordset objects available
  //on the current page. 
  LIST_RS.setAll(rsNames,rsNames);

  //Get the currently selected Recordset
  m_Recordset = LIST_RS.get();

  findTheRecordsetColumns(m_Recordset);
  updateColumnLists();
  updateDetailColumnList();
  updateColumnLinkList();

  //Populate the Unique Key Column List.
  LIST_KEY_COL.setAll(m_ColShowArray, m_ColShowArray);

  elts = document.forms[0].elements;
  if (elts && elts.length)
    elts[0].focus();
}

//This method is called when the recordset has changed and the 
//columns need to be gotten from the Recordset. This method will update
//the arrays that support the list boxes.
function findTheRecordsetColumns(recordset)
{
  //Init vars
  var newLength = 0;
  var colTypesOk = true;

  var ssRecordset = findRecordset(recordset);
    
  //Empty m_ColShowArray first...
  newLength = m_ColShowArray.length;
  m_ColShowArray.splice(0, newLength);

    //Empty m_allColumnsArray
  var allColumnsLength = m_allColumnsArray.length;
  m_allColumnsArray.splice(0, allColumnsLength);

    // Empty m_typesArray
  var typesLength = m_typesArray.length;
  m_typesArray.splice(0, typesLength);

  //Empty m_ColAvlArray too...
  var showAvlLength = m_ColAvlArray.length;
  m_ColAvlArray.splice(0, showAvlLength);

  //Empty m_DetailAvlArray
  var detailArrayLength = m_DetailColAvlArray.length;
  m_DetailColAvlArray.splice(0, showAvlLength);

  //Empty m_DetailColShowArray first...
  newLength = m_DetailColShowArray.length;
  m_DetailColShowArray.splice(0, newLength);

  if (ssRecordset)
  {
    //Get all the column names for the Recordset
    //and put them in the Show array.
    
    m_ColShowArray = dwscripts.getFieldNames(m_Recordset);
      
    //Get all the column names for the Recordset
    //and put them in the Detail Show array.
    m_DetailColShowArray = dwscripts.getFieldNames(m_Recordset);
  
    var colsAndTypes = getCachedColumnAndTypeArray(ssRecordset.rsName);
    
    if (String(colsAndTypes[0]).indexOf("MM_ERROR:") == -1)
    {
      var numCols = 0
      for (var i = 0; i < colsAndTypes.length; i+=2)
      {
        m_allColumnsArray[numCols] = colsAndTypes[i]
        m_typesArray[numCols] = colsAndTypes[i + 1]
      
        if(m_typesArray[numCols] == "")
        {
          if(colTypesOk)
            colTypesOk = false;
        }
        numCols++
      }
    } else {
      //Don't do anything here. If something is not right with the 
      //recordset, we would have caught it earlier.
    }
    
    //If the column types did not make it, we have another chance to get the info
    //if the server model is Cold Fusion.
    if(!colTypesOk)
    {
      //If the server model is Cold Fusion, let's try something else as well...
      if(MODEL_IS_CF) {
      var rsObj = ParseSimpleSQL(ssRecordset.source);
      
      if(rsObj) {
        var numColsCF = 0
          var colsAndTypesCF = MMDB.getColumnAndTypeOfTable(ssRecordset.connectionName, rsObj.table);
  
      for (var i = 1; i < colsAndTypesCF.length; i+=2)
      {
          m_typesArray[numColsCF] = colsAndTypesCF[i];
        numColsCF++;
      }
      }
    }
    }
  }
}

function updateColumnLists()
{

  var showArr = new Array();

  for (j=0; j < m_ColShowArray.length; j++) {
     showArr.push("<option>" + escHTMLChars(m_ColShowArray[j]) + "</option>");
  }
  LIST_COL_SHOW.innerHTML = showArr.join("");
}

function updateDetailColumnList()
{

  var showArr = new Array();
  for (var j=0; j < m_DetailColShowArray.length; j++) {
     showArr.push("<option>" + escHTMLChars(m_DetailColShowArray[j]) + "</option>");
  }
  LIST_DETAIL_COL.innerHTML = showArr.join("");

}

function updateColumnLinkList()
{
  LIST_LINK_COL.setAll(m_ColShowArray, m_ColShowArray);
}


function escHTMLChars(theStr) {
  theStr = String(theStr);
  theStr = theStr.replace(/\&/g,"&amp;");
  theStr = theStr.replace(/\</g,"&lt;");
  theStr = theStr.replace(/\>/g,"&gt;");
  return theStr;
}

function okClicked() {
  
  var retval = getDataFromUI();
  //findRecordset();
  if (retval == "") {
     if (applyMasterDetail())
       window.close();
  } else {
  alert(retval);
  }
}

function cancelClicked()
{
  MM.commandReturnValue = false;
  window.close();
}

// function: createDetailPage
function createDetailPage(detailPageObj)
{

  m_ServerLanguage = dw.getDocumentDOM().serverModel.getServerLanguage();
  m_ServerModel = dw.getDocumentDOM().serverModel.getServerName();
  m_ServerExt = dw.getDocumentDOM().serverModel.getServerExtension().replace(/\./g, "");

  var rootPath = dreamweaver.getSiteRoot();

  if(DWfile.exists(detailPageObj.detailPageName))
  {
    var fileIsOpen = fileIsCurrentlyOpen(detailPageObj.detailPageName);
    dreamweaver.openDocument(detailPageObj.detailPageName);

    if (fileIsOpen) {
      fixUpInsertionPoint();
    } else {
      moveCursorToEndOfBody();
    }

    } else {

      dreamweaver.createDocument(false, m_documentTypeID);
      dreamweaver.saveDocument(dreamweaver.getDocumentDOM(), detailPageObj.detailPageName);
    }

    populateDetailPage(detailPageObj);
    dreamweaver.openDocument(detailPageObj.detailPageName);
    createLiveDataSettings(detailPageObj);
}


function RecordsetChanged()
{
  m_Recordset = LIST_RS.get();
  findTheRecordsetColumns(m_Recordset);
  updateColumnLists();
  updateDetailColumnList();
  updateColumnLinkList();

  //Populate the Unique Key Column List.
  LIST_KEY_COL.setAll(m_ColShowArray, m_ColShowArray);
}


function applyMasterDetail() {

 
  var temp_width;
  var repeatRegionPart1, repeatRegionPart2, repeatRegionPart3, repeatRegionPart4;

  MM.setBusyCursor();

  MODEL_IS_CF = (dw.getDocumentDOM() != null && dw.getDocumentDOM().serverModel.getServerName() == "Cold Fusion");

  //BEGIN: Code for the detail page

  var colIndex = -1;
  var index = 0; 

  for (index=0; index < m_allColumnsArray.length; index++) 
  {
    if(m_UniqueKeyColumn == m_allColumnsArray[index])
      colIndex = index; 
  }

  var detailPageObj = new Object();
  detailPageObj.columnList = m_DetailColShowArray;
  detailPageObj.colId = m_UniqueKeyColumn;
  
  if(colIndex > -1) {
    detailPageObj.columnType = m_typesArray[colIndex];
  } else {
    detailPageObj.columnType = "";
  }

  detailPageObj.paramName = "MMColParam";
  detailPageObj.detailPageName = buildUpFileName(EDIT_FILENAME.value);

  detailPageObj.ssRec = findRecordset(m_Recordset);

  MM.commandReturnValue = detailPageObj;

  var DEBUG = false;
  if (DEBUG) var debugMsg="COMPOUND SB OBJECT TEST:\n";

  //fixUpSelection(dreamweaver.getDocumentDOM());

  var paramObj = new Object();
  var sbObj = null;

  //create new, empty custom group
  var customGroup = new Group();

  //Open the Go To Detail Page Group
  var goToDetailPageGroup = new Group("goToDetailPage");

  //Open the 4 existing Move To group files we are borrowing from
  var moveToFirstGroup = new Group("moveToFirstRecord");
  var moveToPrevGroup = new Group("moveToPreviousRecord");
  var moveToNextGroup = new Group("moveToNextRecord");
  var moveToLastGroup = new Group("moveToLastRecord");

  //Open the rsStat group file we are borrowing from
  var rsStatsGroup = new Group("Recordset Statistics");

  //For ColdFusion, the are two repeat region groups... one for all records and the 
  //other for a fixed number of records.

  if(MODEL_IS_CF & m_NumberOfRecords == -1)
  {
    repeatRegionPart1 = new Participant("repeatedRegionAll_init");
    repeatRegionPart3 = new Participant("repeatedRegionAll_begin");

  } else {

    //get the RepeatedRegion participants.
    repeatRegionPart1 = new Participant("repeatedRegion_init2");
    repeatRegionPart2 = new Participant("repeatedRegion_beginInit");
    repeatRegionPart3 = new Participant("repeatedRegion_begin");
    repeatRegionPart4 = new Participant("repeatedRegion_end2");
  }
  
  //paramObj.loopName = m_Recordset + "RR";
  paramObj.loopName = m_RepeatRegionName;
  paramObj.rsName = m_Recordset;
  
  paramObj.numRows = m_NumberOfRecords;

  customGroup.addParticipants(Array(repeatRegionPart1));

  if(MODEL_IS_CF & m_NumberOfRecords == -1) 
  {
  //don't do anything.
  }
  else {
    customGroup.addParticipants(Array(repeatRegionPart2));
  }

  //get the "aboveHTML" participants from the Go To Detail Page group
  customGroup.addParticipants(goToDetailPageGroup.getParticipants("aboveHTML"));

  //get "directive" participants from Move To groups and add to customGroup
  customGroup.addParticipants(moveToFirstGroup.getParticipants("aboveHTML"));
  customGroup.addParticipants(moveToPrevGroup.getParticipants("aboveHTML"));
  customGroup.addParticipants(moveToNextGroup.getParticipants("aboveHTML"));
  customGroup.addParticipants(moveToLastGroup.getParticipants("aboveHTML"));

  //get "directive" participants from stat group and add to customGroup
  customGroup.addParticipants(rsStatsGroup.getParticipants("aboveHTML"));

  var customStatPart = new Participant("rsStats_display");

  var rowDataPart = new Participant("MasterDetail_TableData");

  var rowPart = new Participant("MasterDetail_TableRow");

  var tablePart = new Participant("MasterDetail_Table");
 
  var dynDataPart = new Participant("dynamicData_ref");

  if (DEBUG) debugMsg += "\nAdded all directive participants from Move To, a total of "+customGroup.participants.length;
  
  //BEGIN The stuff for the table and repeat region go here....
  
  var tableStr = "";
  var tableStr2 = "";

  var tableObj = new Object();
  var tableObj2 = new Object();
  var dynObj = new Object();
  var rrObj = new Object();

  //dynObj.rs = m_Recordset;
  //dynObj.col = m_ColShowArray[i];

  tableObj.align = "left";
  
  var tableWidth = String(100/m_ColShowArray.length);
  var decimalIndex = tableWidth.indexOf(".");
  if ( decimalIndex > -1) {
    tableObj.width = tableWidth.slice(0, decimalIndex);
  } else {
    tableObj.width = tableWidth;
  }

  for (var i = 0; i < m_ColShowArray.length; i++) {

  tableObj.rowDataContent = m_ColShowArray[i];
    tableStr += rowDataPart.getInsertString(tableObj, "afterSelection")
  }

  tableObj.preRowData = "";
  tableObj.tableRowContent = tableStr;
  tableObj.postRowData = "";

  tableStr = rowPart.getInsertString(tableObj, "afterSelection");


  for (var i = 0; i < m_ColShowArray.length; i++) {
  
  if (m_LinkFromColumn == m_ColShowArray[i]) {
      var linkObj = new Object();
    var hrefObj = new Object();
    var goToDetailPart = new Participant("goToDetailPage_attr");

    var hrefPart = new Participant("Href");

    linkObj.rs = m_Recordset;
    //linkObj.col = m_ColShowArray[i];
    linkObj.col = m_UniqueKeyColumn;
    linkObj.url = m_FileName;
    linkObj.keepType = "Both";
    
    linkObj.paramName = m_UniqueKeyColumn;

    dynObj.rsName = m_Recordset;
    dynObj.bindingName = m_ColShowArray[i];
    
    hrefObj.hrefParam = goToDetailPart.getInsertString(linkObj, "nodeAttribute");
    
    if (dw.getDocumentDOM() != null && dw.getDocumentDOM().serverModel.getServerName() == "JSP" &&
        m_LinkFromColumn == m_UniqueKeyColumn) {
      //Need to handle duplicate getObject calls for JSP 1.0
      var dynDataJSP = new Participant("dynamicData_refJSP");
      hrefObj.linkParam = dynDataJSP.getInsertString(dynObj, "replaceSelection");
    } else {
      hrefObj.linkParam = dynDataPart.getInsertString(dynObj, "replaceSelection");  
    }
    
    tableObj.rowDataContent = hrefPart.getInsertString(hrefObj, "replaceSelection");
    if(MODEL_IS_CF)
      tableObj.rowDataContent = tableObj.rowDataContent.replace(/<[\/]?cfoutput>/gi, "");
  } else {
    dynObj.rsName = m_Recordset;
    dynObj.bindingName = m_ColShowArray[i];
    tableObj.rowDataContent = dynDataPart.getInsertString(dynObj, "replaceSelection");
    if(MODEL_IS_CF)
      tableObj.rowDataContent = tableObj.rowDataContent.replace(/<[\/]?cfoutput>/gi, "");
  }
    tableStr2 += rowDataPart.getInsertString(tableObj, "afterSelection")
  }

  rrObj.loopName = m_RepeatRegionName;
  rrObj.rsName = m_Recordset;

  tableObj2.preRowData = repeatRegionPart3.getInsertString(rrObj, "beforeSelection");

  if (MODEL_IS_CF & m_NumberOfRecords == -1)
    tableObj2.postRowData = "";
  else 
    tableObj2.postRowData = repeatRegionPart4.getInsertString(rrObj, "afterSelection");

  if(MODEL_IS_CF)
  {
  tableObj2.postRowData += "</cfoutput>";
  }
  tableObj2.tableRowContent = tableStr2;

  tableStr2 = rowPart.getInsertString(tableObj2, "afterSelection");

  paramObj.tableContent = tableStr + tableStr2;
  paramObj.tableAlign = "center";
  paramObj.border = "1";
  customGroup.addParticipants(Array(tablePart))

  // END The stuff for the table and repeat region go here....

  //We will be using tables, so
  customPart = new Participant("rsNav_Table");
  customGroup.addParticipants(Array(customPart));   
  
  //Add the Recordset Stats participant
  customGroup.addParticipants(Array(customStatPart));   

  //Hide Links
  //Get the groups handling the Show Regions for first and last record.
  var showRegion_firstRecord = new Group("showRegion_notFirstRecord");
  var showRegion_lastRecord = new Group("showRegion_notLastRecord");

  //get the show Region participants.
  
  var showRegion_first_participants = showRegion_firstRecord.getParticipants()
  var showRegion_last_participants = showRegion_lastRecord.getParticipants();
  
  var emptyParamObject = new Object();

  //Set the showRegion parameters
  paramObj.hideLinksFirstBegin = showRegion_first_participants[0].getInsertString(emptyParamObject, "beforeSelection");
  paramObj.hideLinksFirstEnd = showRegion_first_participants[1].getInsertString(emptyParamObject, "afterSelection");
  if(MODEL_IS_CF) {
    paramObj.hideLinksFirstEnd += "</cfif>";
  }
  paramObj.hideLinksLastBegin = showRegion_last_participants[0].getInsertString(emptyParamObject, "beforeSelection");
  paramObj.hideLinksLastEnd = showRegion_last_participants[1].getInsertString(emptyParamObject, "afterSelection");
  if(MODEL_IS_CF) {
    paramObj.hideLinksLastEnd += "</cfif>";
  }

  //set parameter values for Move To stuff (from UI settings)
  paramObj.rsName  = m_Recordset;
  paramObj.rs      = m_Recordset;
  paramObj.col     = "";
  paramObj.paramName = "";

  var displayStats_participant = rsStatsGroup.getParticipants("replaceSelection");

  paramObj.bindingName = "first";
  var firstDisplayStr = displayStats_participant[0].getInsertString(paramObj, "replaceSelection");
  if(firstDisplayStr && firstDisplayStr.length)paramObj.firstStatistics = firstDisplayStr;
    
  paramObj.bindingName = "last";
  var lastDisplayStr = displayStats_participant[0].getInsertString(paramObj, "replaceSelection");
  if( lastDisplayStr && lastDisplayStr.length) paramObj.lastStatistics = lastDisplayStr;

  paramObj.bindingName = "total";
  var totalDisplayStr = displayStats_participant[0].getInsertString(paramObj, "replaceSelection");
  if(totalDisplayStr && totalDisplayStr.length) paramObj.totalStatistics = totalDisplayStr;

  //set parameter values for compound object from localizeable globals file.
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
	  paramObj.firstStr = MM.LABEL_NewMoveToFirstLinkLabel;
	  paramObj.prevStr  = MM.LABEL_NewMoveToPrevLinkLabel;
	  paramObj.nextStr = MM.LABEL_NewMoveToNextLinkLabel;
	  paramObj.lastStr  = MM.LABEL_NewMoveToLastLinkLabel;
	} else {
	  // not a JA, KO, or Chinese document so we will use English to prevent corruption
	  paramObj.firstStr = MM.LABEL_EngNewMoveToFirstLinkLabel;  
	  paramObj.prevStr  = MM.LABEL_EngNewMoveToPrevLinkLabel;
	  paramObj.nextStr  = MM.LABEL_EngNewMoveToNextLinkLabel;
	  paramObj.lastStr  = MM.LABEL_EngNewMoveToLastLinkLabel;
	}
  }
  else {
  	  paramObj.firstStr = entityNameEncode(MM.LABEL_NewMoveToFirstLinkLabel);  //"First" in English
	  paramObj.prevStr  = entityNameEncode(MM.LABEL_NewMoveToPrevLinkLabel);
	  paramObj.nextStr  = entityNameEncode(MM.LABEL_NewMoveToNextLinkLabel);
	  paramObj.lastStr  = entityNameEncode(MM.LABEL_NewMoveToLastLinkLabel);
  }

  //set parameter values extracted from Move To groups, in this case HREF strings
  var hrefArray = moveToFirstGroup.getInsertStrings(paramObj,"nodeAttribute+HREF");
  if (hrefArray && hrefArray.length) paramObj.moveFirstHref = hrefArray[0];
  var hrefArray = moveToPrevGroup.getInsertStrings(paramObj,"nodeAttribute+HREF");
  if (hrefArray && hrefArray.length) paramObj.movePrevHref = hrefArray[0];
  var hrefArray = moveToNextGroup.getInsertStrings(paramObj,"nodeAttribute+HREF");
  if (hrefArray && hrefArray.length) paramObj.moveNextHref = hrefArray[0];
  var hrefArray = moveToLastGroup.getInsertStrings(paramObj,"nodeAttribute+HREF");
  if (hrefArray && hrefArray.length) paramObj.moveLastHref = hrefArray[0];

  //Code for the Recordset Statistics
  //Open the rsStats group files we are borrowing from
  var rsStatsGroup = new Group("rsStats");
  customGroup.addParticipants(rsStatsGroup.getParticipants(""));

  //Set the individual parameters for the rsStats group
  if (dreamweaver.appVersion && dreamweaver.appVersion.indexOf('ja') != -1) {  // Japanese version?
	var charSet = dw.getDocumentDOM().getCharSet();
	charSet = charSet.toLowerCase();
	if (charSet.toLowerCase() == "shift_jis" || charSet == "x-sjis" || charSet == "euc-jp" || charSet == "iso-2022-jp") 
	{
	  paramObj.beforeFirst = MM.LABEL_RSNavBeforeFirst;
	  paramObj.beforeLast  = MM.LABEL_RSNavBeforeLast;
	  paramObj.beforeTotal = MM.LABEL_RSNavBeforeTotal;
	  paramObj.afterTotal  = MM.LABEL_RSNavAfterTotal;
	} else {	// not a japanese document so we will use English to prevent corruption
	  paramObj.beforeFirst = MM.LABEL_EngRSNavBeforeFirst;
	  paramObj.beforeLast  = MM.LABEL_EngRSNavBeforeLast;
	  paramObj.beforeTotal = MM.LABEL_EngRSNavBeforeTotal;
	  paramObj.afterTotal  = MM.LABEL_EngRSNavAfterTotal;
	}
  } else { 
  	  paramObj.beforeFirst = entityNameEncode(MM.LABEL_RSNavBeforeFirst);
	  paramObj.beforeLast  = entityNameEncode(MM.LABEL_RSNavBeforeLast);
	  paramObj.beforeTotal = entityNameEncode(MM.LABEL_RSNavBeforeTotal);
	  paramObj.afterTotal  = entityNameEncode(MM.LABEL_RSNavAfterTotal);
  } 

  setMoveToParamsForJsp(paramObj);

  //Apply everything to the page
  
  fixUpInsertionPoint();

  customGroup.apply(paramObj,sbObj);
  MM.clearBusyCursor();

  return true;
}

function findRecordset(recordsetName)
{
   var ssRecords = dw.sbi.getServerBehaviors();
   var ssRec = null;
   
   for (var i = 0; i < ssRecords.length; i++)
   {  
     if(ssRecords[i].type == "recordset")
   {  
      if(ssRecords[i].rsName == m_Recordset)
    {
      ssRec = ssRecords[i]
      copyServerBehavior(ssRec)
    } 
   }
   }

   return ssRec;
}

function getDataFromUI()
{
  var retval = "";

  m_Recordset = LIST_RS.getValue();

  if(m_Recordset != "") 
  {
    // Check if the chosen recordset is returned from a stored procedure. The master
    //   detail object is not built to work with a rs returned from a stored proc.
    var allRSs = dwscripts.getRecordsetNames();
    var allNonSPRSs = dwscripts.getRecordsetNames(true);
    if (   dwscripts.findInArray(allNonSPRSs, m_Recordset) == -1 
        && dwscripts.findInArray(allRSs, m_Recordset) != -1
       )
    {
      retval = MM.MSG_NoRecordsetsFromSPs;
    }
  }
  else 
  {
    retval = MM.MSG_invalidRS;
  }
  
  if (!retval)
  {
    if (RB_COUNT.getSelectedIndex()== 0)
    {
       var rc =TF_REPEAT_COUNT.value;
       if (!((parseInt(rc)== rc) && (rc>0)))
       {
        return MM.MSG_ValueGreaterThanZero;
       } else {
      m_NumberOfRecords = parseInt(rc);
     } 
    } else {
    m_NumberOfRecords = -1;
    }
  
    if(m_ColShowArray.length == 0)
    retval = MM.MSG_columnsEmpty;
   
    m_CreateFile = true;
    m_FileName = EDIT_FILENAME.value;
    if ((!m_FileName) || (m_FileName.charAt(0) == " ") || (m_FileName.charAt(0) == " ") || (m_FileName.length == 0) ||
      (m_FileName.indexOf("/") != -1) || (StripChars(" ", m_FileName) == ""))
      retval = errMsg(MM.MSG_invalidDetailPageName, m_FileName); 
  
    if(LIST_LINK_COL.getLen() && LIST_LINK_COL_OBJ.selectedIndex >= 0)
      m_LinkFromColumn = LIST_LINK_COL_OBJ.options[LIST_LINK_COL_OBJ.selectedIndex].text;
    else 
    retal = MM.MSG_invalidLinkFromColumn;
      
    if(LIST_KEY_COL.getLen() && LIST_KEY_COL_OBJ.selectedIndex >= 0)
      m_UniqueKeyColumn = LIST_KEY_COL_OBJ.options[LIST_KEY_COL_OBJ.selectedIndex].text;
    else
      retval = MM.MSG_invalidUniqueKeyColumn;
  }
    
  return retval;
}


//The "Move Up" button has been clicked
function onMoveUpClicked()
{
  var index = LIST_COL_SHOW.selectedIndex
  if(index > 0)
  {
    //Swap the text in the list control
  var columnValue = LIST_COL_SHOW.options[index].text;
  LIST_COL_SHOW.options[index].text = LIST_COL_SHOW.options[index - 1].text;
  LIST_COL_SHOW.options[index - 1].text = columnValue;
  
  //Now updated the List Arrays..
  columnValue = m_ColShowArray[index];
  m_ColShowArray[index] = m_ColShowArray[index - 1];
  m_ColShowArray[index - 1] = columnValue;

  //Set the new selection
  LIST_COL_SHOW.options[index].selected = false;
  LIST_COL_SHOW.options[index-1].selected = true;
  }
}

//The "Move Down" button has been clicked
function onMoveDownClicked()
{
  var index = LIST_COL_SHOW.selectedIndex;
  
  if( (index >= 0) & (index < (LIST_COL_SHOW.options.length - 1)))
  {
    //Swap the text in the list control
  var columnValue = LIST_COL_SHOW.options[index].text;
  LIST_COL_SHOW.options[index].text = LIST_COL_SHOW.options[index + 1].text;
  LIST_COL_SHOW.options[index + 1].text = columnValue;
  
  //Now updated the List Arrays..
  columnValue = m_ColShowArray[index];
  m_ColShowArray[index] = m_ColShowArray[index + 1];
  m_ColShowArray[index + 1] = columnValue;

  //Set the new selection.
  LIST_COL_SHOW.options[index].selected = false;
  LIST_COL_SHOW.options[index+1].selected = true;
  }
}

//The "Detail Move Up" button has been clicked
function onDetailMoveUpClicked()
{
  var index = LIST_DETAIL_COL.selectedIndex
  if(index > 0)
  {
    //Swap the text in the list control
  var columnValue = LIST_DETAIL_COL.options[index].text;
  LIST_DETAIL_COL.options[index].text = LIST_DETAIL_COL.options[index - 1].text;
  LIST_DETAIL_COL.options[index - 1].text = columnValue;
  
  //Now updated the List Arrays..
  columnValue = m_DetailColShowArray[index];
  m_DetailColShowArray[index] = m_DetailColShowArray[index - 1];
  m_DetailColShowArray[index - 1] = columnValue;

  //Set the new selection
  LIST_DETAIL_COL.options[index].selected = false;
  LIST_DETAIL_COL.options[index-1].selected = true;
  }
}

//The "Detail Move Down" button has been clicked
function onDetailMoveDownClicked()
{
  var index = LIST_DETAIL_COL.selectedIndex;
  
  if( (index >= 0) & (index < (LIST_DETAIL_COL.options.length - 1)))
  {
    //Swap the text in the list control
  var columnValue = LIST_DETAIL_COL.options[index].text;
  LIST_DETAIL_COL.options[index].text = LIST_DETAIL_COL.options[index + 1].text;
  LIST_DETAIL_COL.options[index + 1].text = columnValue;
  
  //Now updated the List Arrays..
  columnValue = m_DetailColShowArray[index];
  m_DetailColShowArray[index] = m_DetailColShowArray[index + 1];
  m_DetailColShowArray[index + 1] = columnValue;

  //Set the new selection.
  LIST_DETAIL_COL.options[index].selected = false;
  LIST_DETAIL_COL.options[index+1].selected = true;
  }
}


//The "<" button has been clicked. Add a column to the Columns to Show list
function onAddButtonClicked()
{
  // check to see if there are columns to add first
  if (m_ColAvlArray.length == 0){
    alert(MM.MSG_NoMoreColumnsToAdd);
    return;
  }

  var colsToAdd = callCommand('Add Column.htm', m_ColAvlArray);
  if (!colsToAdd) return; // user clicked Cancel

  var nCols = colsToAdd.length,i;
  var currSelection = LIST_COL_SHOW.selectedIndex;
  if(currSelection == -1){
  currSelection = LIST_COL_SHOW.options.length;
  }

  for(i = 0; i < colsToAdd.length; i++)
  {
    m_ColShowArray.splice(currSelection, 0, colsToAdd[i]);
    currSelection++;
  for (var j=0; j < m_ColAvlArray.length; j++)
  {
       if(m_ColAvlArray[j] == colsToAdd[i])
       m_ColAvlArray.splice(j, 1);
  }
  }
  updateColumnLists();
  updateColumnLinkList();
}

//The ">" button has been clicked. Remove a column to the Columns to Show list
function onRemoveButtonClicked()
{
  if(LIST_COL_SHOW.selectedIndex >= 0)
  {
    // First check if there will be any columns left in the list after the delete.
    //   If not, warn the user that there must be at least one column in the 
    //   list and return.
    var deleteCount = 0;
    var numItems = LIST_COL_SHOW.options.length;
    for (var start_select_index = LIST_COL_SHOW.selectedIndex;
         start_select_index < numItems; start_select_index++)
    {
      if(LIST_COL_SHOW.options[start_select_index].selected == true)
      {
        deleteCount++;
      }
    }

    if (numItems == 1 || numItems == deleteCount)
    {
      alert(MM.MSG_NeedOneColumnInList);
      return;
    }

    var deleteCount = 0;
    for (var start_select_index = LIST_COL_SHOW.selectedIndex;
     start_select_index < LIST_COL_SHOW.options.length; start_select_index++)
  {
    if(LIST_COL_SHOW.options[start_select_index].selected == true)
      {
      m_ColAvlArray.splice(m_ColAvlArray.length, 0, m_ColShowArray[start_select_index - deleteCount]);
      m_ColShowArray.splice((start_select_index - deleteCount), 1);
      deleteCount++;
    }
  }
  updateColumnLists();
  updateColumnLinkList();
  }
}

function onDetailAddButtonClicked()
{
  // check to see if there are columns to add first
  if (m_DetailColAvlArray.length == 0){
    alert(MM.MSG_NoMoreColumnsToAdd);
    return;
  }

  var colsToAdd = callCommand('Add Column.htm', m_DetailColAvlArray);
  if (!colsToAdd) return; // user clicked Cancel

  var nCols = colsToAdd.length,i;
  var currSelection = LIST_DETAIL_COL.selectedIndex;
  if(currSelection == -1){
  currSelection = LIST_DETAIL_COL.options.length;
  }

  for(i = 0; i < colsToAdd.length; i++)
  {
    m_DetailColShowArray.splice(currSelection, 0, colsToAdd[i]);
    currSelection++;
  for (var j=0; j < m_DetailColAvlArray.length; j++)
  {
       if(m_DetailColAvlArray[j] == colsToAdd[i])
       m_DetailColAvlArray.splice(j, 1);
  }
  }
  updateDetailColumnList();
}

//The ">" button has been clicked. Remove a column to the Columns to Show list
function onDetailRemoveButtonClicked()
{
  if(LIST_DETAIL_COL.selectedIndex >= 0)
  {
    // First check if there will be any columns left in the list after the delete.
    //   If not, warn the user that there must be at least one column in the 
    //   list and return.
    var deleteCount = 0;
    var numItems = LIST_DETAIL_COL.options.length;
    for (var start_select_index = LIST_DETAIL_COL.selectedIndex;
         start_select_index < numItems; start_select_index++)
    {
      if(LIST_DETAIL_COL.options[start_select_index].selected == true)
      {
        deleteCount++;
      }
    }

    if (numItems == 1 || numItems == deleteCount)
    {
      alert(MM.MSG_NeedOneColumnInList);
      return;
    }

    deleteCount = 0;
    for (var start_select_index = LIST_DETAIL_COL.selectedIndex;
     start_select_index < numItems; start_select_index++)
    {
      if(LIST_DETAIL_COL.options[start_select_index].selected == true)
      {
        m_DetailColAvlArray.splice(m_DetailColAvlArray.length, 0, m_DetailColShowArray[start_select_index - deleteCount]);
        m_DetailColShowArray.splice((start_select_index - deleteCount), 1);
        deleteCount++;
      }
    }
    updateDetailColumnList();
  }
}


function setCount(element)
{
   if (element.value == "All"){
     TF_REPEAT_COUNT.setAttribute("disabled","true");
   } else {
     TF_REPEAT_COUNT.removeAttribute("disabled");
   }
}

function browseButtonClicked()
{
  var result = dw.browseForFileURL("select", MM.MSG_detailPageDialog, false, true);
  
  if (result) {
     EDIT_FILENAME.value = result;
  }
}

//Function: buildUpFileName
//Purpose: Accept the file name as a param. Do the following:
//  1. Add extension to name if it does not already exist.
//  2. Prepend the current document path to the file name.
//  This function assumes that the current document has been saved, since this
//  would have been checked when the object was called.
//
function buildUpFileName(baseName)
{
  //Initialize vars
  var retVal = "";
  var lastIndex = -1;
  var path = "";
  var newPath = "";

  var ext = dw.getDocumentDOM().serverModel.getServerExtension();

  //Attach the file extension to the baseName if it doesn't already exist.
  if(baseName.lastIndexOf(ext) == -1){
  baseName = baseName + ext;
  }

  //Set the m_FileName global var with the corrected (if necessary) file name.
  m_FileName = baseName;

  path = dreamweaver.getDocumentPath("document");
  
  lastIndex = path.lastIndexOf("/");
  newPath = path.slice(0, lastIndex + 1);
  retVal = newPath + baseName;

  return retVal;
}

function createNewRepeatRegionName()
{
  //search the ssRecs for other names
  var retVal = "";
  
  var ssRecs = dw.serverBehaviorInspector.getServerBehaviors();
  
  var num = 0;
  var rrName = "";
  
  while (!retVal) {
    num++;
    rrName = "Repeat" + num;
    for (var i=0; i < ssRecs.length; i++) { //search all ssRecs
      var ssRec = ssRecs[i];
      if (ssRec.parameters.loopName != null && 
          ssRec.parameters.loopName.toLowerCase() == rrName.toLowerCase()) {
        break;
      }
    }
    if (i >= ssRecs.length) {
      retVal = rrName;
    }
  }
  
  return retVal;
}

function createLiveDataSettings(detailPageObj)
{
  var defaultValue = 1;
  var str =  detailPageObj.colId + "=" + defaultValue;
  dw.setLiveDataParameters(str);
}

function populateDetailPage(detailPageObj)
{
  MM.setBusyCursor();

  var paramObj = new Object();
  var sbObj = null;
  var tableCol1Str, tableCol2Str, tableRowStr;
  var tableObj = new Object();
  var tableObj2 = new Object();
  var dynObj = new Object();

  tableObj.align = "left";
  tableObj.width = "50";

  //Get the selected columns from the detailPageObj.
  colShowArray = detailPageObj.columnList;

  //Since the columns will include the 3 Recordset stats objects,
  //remove them from the list before updating the dialog list boxes.
  //var newLength = (colShowArray.length) - 3;
  //colShowArray.splice(newLength, 3);

  dom = dw.getDocumentDOM();

  var rsName = detailPageObj.ssRec.rsName;

  //Check if the recordset name is unique on the detail page.
  if(IsDupeObjectName(detailPageObj.ssRec.rsName)) rsName = CreateNewName();

  //create new, empty custom group
  var customGroup = new Group();

  var recordsetGroup = new Group("recordset");

  customGroup.addParticipants(recordsetGroup.getParticipants("aboveHTML"));
  customGroup.addParticipants(recordsetGroup.getParticipants("belowHTML"));

  paramObj.rsName = rsName;
  paramObj.varName = detailPageObj.paramName;
  paramObj.defaultValue = "1";
  var obj = new Object();
  obj = GetParamObj(0, detailPageObj.colId);
  paramObj.runtimeValue =  obj.runtimeVal;

  paramObj.ext = m_ServerExt;
	//get the default url format
	paramObj.urlformat = getConnectionsUrlFormat(dw.getDocumentDOM());
  paramObj.cname = detailPageObj.ssRec.connectionName;
  paramObj.relpath = getConnectionsPath(paramObj.cname,paramObj.urlformat);

  if (m_ServerModel == "ASP") {

      paramObj.cursorType     = 0; /*adOpenForwardOnly*/
      paramObj.lockType       = 3; /*adLockOptimistic*/
      paramObj.cursorLocation = 2; /*adUseServer*/

  } else if (m_ServerModel == "Cold Fusion") {

      //strip the # signs from the runtime values
    paramObj.runtimeValue = paramObj.runtimeValue.replace(/#(.*)#/, "$1");
      paramObj.maxRows = "";
  } else if (m_ServerModel == "JSP") {
		if ((paramObj.urlformat != null) && (paramObj.urlformat == "virtual"))
		{
			paramObj.urlformat = "file";
		}
	}

  m_enclosingToken = "";

  if(detailPageObj.columnType != "" && dwscripts.isStringDBColumnType(detailPageObj.columnType)) {
    m_enclosingToken = "'";
  }

  paramObj.encodedSQL = addFilterToSql(detailPageObj.ssRec.source, paramObj.varName, detailPageObj.colId, paramObj.rsName, m_enclosingToken);

  var rowDataPart = new Participant("MasterDetail_DetailTblData");

  var rowPart = new Participant("MasterDetail_DetailTableRow");

  var tablePart = new Participant("MasterDetail_DetailTable");

  var dynDataPart = new Participant("dynamicData_ref");

  tableCol1Str = "";
  tableCol2Str = "";
  tableRowStr = "";
  outStr = ""

  for (var i = 0; i < colShowArray.length; i++) {

    //Display the column name in the first column..
    tableObj.rowDataContent = colShowArray[i];
    tableCol1Str = rowDataPart.getInsertString(tableObj, "afterSelection");

    //Display the dynamic data in the second column..
    dynObj.rsName = paramObj.rsName;
    dynObj.bindingName = colShowArray[i];
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
  customGroup.apply(paramObj,sbObj);

  MM.clearBusyCursor();
}

function GetParamObj(paramType, paramVal)
{
  var runtimeVal = "MM_Error: Could not create runtime value."
  var defaultVal = "0"
  
  switch(m_ServerLanguage)
  {
    case "JavaScript":
    case "VBScript":
      switch(paramType)
      {
        case 0:
          runtimeVal = "Request.QueryString(\"" + paramVal + "\")"
          break
        case 1:
          runtimeVal = "Request.Form(\"" + paramVal + "\")"
          break
        case 2:
          runtimeVal = "Request.Cookies(\"" + paramVal + "\")"
          break
        case 3:
          runtimeVal = "Session(\"" + paramVal + "\")"
          break
        case 4:
          runtimeVal = "Application(\"" + paramVal + "\")"
          break
        case 5:
          runtimeVal = "Request(\"MM_EmptyValue\")"
          defaultVal = paramVal
          break
      }
      break

    case "CFML":

      switch(paramType)
      {
        case 0:
          runtimeVal = "#URL." + paramVal + "#"
          break
        case 1:
          runtimeVal = "#FORM." + paramVal + "#"
          break
        case 2:
          runtimeVal = "#Cookie." + paramVal + "#"
          break
        case 3:
          runtimeVal = "#Session." + paramVal + "#"
          break
        case 4:
          runtimeVal = "#Application." + paramVal + "#"
          break
        case 5:
          runtimeVal = "#" + rsName + "_Literal#"
          defaultVal = paramVal
          break
      }
      break

    case "Java":

      switch(paramType)
      {
        case 0:
          runtimeVal = "request.getParameter(\"" + paramVal + "\")"
          break
        case 1:
          runtimeVal = "session.getValue(\"" + paramVal + "\")"
          break
        case 2:
          runtimeVal = "request.getParameter(\"MM_EmptyValue\")"
          defaultVal = paramVal
          break
      }

      break
  }

  var outObj = new Object()

  outObj.defaultVal = defaultVal
  outObj.runtimeVal = runtimeVal

  return outObj
}

function addFilterToSql(source, varName, colId, rsName, enclosingToken)
{
   
   var part = new Participant("recordset_sqlVar");
   var sourceStr = source;
   var filter = "";
   var newSource = "";
   
   var paramObj = new Object();
   paramObj.rsName = rsName;
   paramObj.varName = varName;
   
   filter = part.getInsertString(paramObj);
   
   filter = colId + " = " + enclosingToken + filter + enclosingToken;

   var re = new RegExp("\\bwhere\\b","gi");

   var index = sourceStr.search(re);

   if (index == -1) {
     //The where clause was not found in the sql
     
     var reOrderBy = new RegExp("\\border\\s+by\\b","gi");
     var reGroupBy = new RegExp("\\bgroup\\s+by\\b","gi");
     var orderIndex = sourceStr.search(reOrderBy);
     var groupIndex = sourceStr.search(reGroupBy);
     if(groupIndex == orderIndex)
     {
         //This can only mean that the group by and order by clause both don't exist (index returns -1).
         newSource = sourceStr + " " + CONST_where + " " + filter;
     } else {

         var groupBoolean = new Boolean(false);

         // Either group by or order by or both clauses exist in the sql.
       if((groupIndex > -1) && (orderIndex > -1)) {
           // both clause's exist. Check which one has the least index value and insert the filter before it.
         groupBoolean = (groupIndex < orderIndex);
       } else {
           //only one clause exists. Check which one has the greater index value and insert the filter before it.
             groupBoolean = (groupIndex > orderIndex);
       }
       if(groupBoolean)
          newSource = buildNewSQLSource(sourceStr, groupIndex, CONST_where, filter);
       else 
          newSource = buildNewSQLSource(sourceStr, orderIndex, CONST_where, filter);  
     }
   } 
   else 
   {
     //The sql contains a where clause. We need to find out where it is and insert our filter just after it. 
     //newSource = sourceStr.substr(0, index + 6) + filter + " AND " + sourceStr.substr(index + 6);
		 //bug #174946 invalid SQL created in detail page when master page uses a filtered recordset and is preceded by a search page  
      newSource = sourceStr.substr(0, index) + " " + CONST_where + " " + filter;
   }

   return newSource;
}

function buildNewSQLSource(sourceStr, index, clause, filter)
{
    var newSource;
    
  newSource = sourceStr.substr(0, index - 1) + " " + clause + " " + filter + " " + sourceStr.substr(index, sourceStr.length - index);
    
  return newSource;

}

