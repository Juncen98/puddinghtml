
// Copyright 2000, 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

    
//**********************GLOBAL VARS********************

var PREFIX = "editOps_";

// participants -- stored as globals because the overhead of getting them can be high, and
// some may be re-used
var PART_TEXT, PART_TF,PART_TA, PART_CB, PART_DYN_CB, PART_RG,PART_DYN_RG;     
var PART_SELECT,PART_OPTION,PART_DYN_MENU,PART_TR,PART_TR_RG,PART_TR_RB;     
var PART_TR_TA,PART_TABLE,PART_BEGIN_LOOP,PART_END_LOOP,PART_CHECKED_ATTR;
var PART_SELECTED_ATTR,PART_DYN_OPTION,PART_DYN_OP_NOSEL;
var PART_HF, PART_PF, PART_FF;

var TEXTFIELD     =  MM.LABEL_TextField;
var HIDDENFIELD   =  MM.LABEL_HiddenField;
var PASSWORDFIELD =  MM.LABEL_PasswordField;
var PASSWORD      =  MM.LABEL_Password;
var FILEFIELD     =  MM.LABEL_FileField;
var TEXTAREA      =  MM.LABEL_TextArea;
var MENU          =  MM.LABEL_Menu;
var CHECKBOX      =  MM.LABEL_CheckBox;
var RADIOGROUP    =  MM.LABEL_RadioGroup;
var TEXT          =  MM.LABEL_Text;
var NUMERIC       =  MM.LABEL_Numeric;
var DATE          =  MM.LABEL_Date;
var DATEMSACCESS  =  MM.LABEL_DateMSAccess;
var CHECKBOXYN    =  MM.LABEL_CheckBoxYN;
var CHECKBOX10    =  MM.LABEL_CheckBox10;
var CHECKBOXNEG10 =  MM.LABEL_CheckBoxNeg10;
var CHECKBOXACCESS=  MM.LABEL_CheckBoxAccess;

var STR_DIVIDER = "* *";
var STR_ELEMENT_NAMES = STR_DIVIDER;

var STR_CURR_RS = "";


// stores separate file dom needed for dynamic UI
var DOM_UI_PIECES = dw.getDocumentDOM("EditOpsAltHTML.htm"); 


// global form widget variables
var MENU_CONN, MENU_TABLES, MENU_DISPLAY, MENU_SUBMIT;
var MENU_RS, MENU_COLS; // only for Update
var TF_REDIRECT_URL, TF_LABEL, GRID_COLS, CB_NUMERIC;

var ARR_COLS_TO_ADD = new Array();
var ARR_COL_TYPES = new Array();
var EMPTY_LIST = new Array();
var EDIT_OP_TYPE;
var SUBMIT_BTN_TEXT = (EDIT_OP_TYPE == "Insert")?MM.BTN_InsertRecord:MM.BTN_UpdateRecord;
var GROUP_DYN_DATA;

//********************API FUNCTIONS******************************    


function commandButtons(){
  return new Array(MM.BTN_OK,       "okayClicked()",
                   MM.BTN_Cancel,   "cancelClicked()",
                   MM.BTN_Help,     "displayHelp()");
 
}


function canInsertObject()
{
  var retVal = true;
  
  var errMsgStr = "";
  
  if (EDIT_OP_TYPE != "Insert" && dwscripts.getRecordsetNames().length == 0) 
  { 
    errMsgStr = dwscripts.sprintf(MM.MSG_NeedRecordsetForObject, dwscripts.getRecordsetDisplayName());
  }

  if (!errMsgStr)
  {
    //check if a script of this type already exists
    var editOpType = (EDIT_OP_TYPE == "Insert") ? "insertRecord" : "updateRecord";
    var editOpTitle = (EDIT_OP_TYPE == "Insert") ? MM.LABEL_TitleInsertRecord : MM.LABEL_TitleUpdateRecord;

    var ssRecs = dw.serverBehaviorInspector.getServerBehaviors();

    var found = false;
    for (var i=0; !found && i < ssRecs.length; i++)
    {
      found = (ssRecs[i].type == editOpType);
    }
    
    if (found) 
    {
      errMsgStr = errMsg(MM.MSG_OnlyOneServerBehAllowed,editOpTitle);
    }
  }
  
  if (errMsgStr)
  {
    alert (errMsgStr);
    retVal = false;
  }
  
  return retVal;
}
 


//********************LOCAL FUNCTIONS******************************    

function getCommandTitle(){
  var titleStr = dw.getDocumentDOM().getElementsByTagName("TITLE").item(0).innerHTML;
  
  // strip starting white space
  while ( titleStr[0] == " " )  titleStr = titleStr.substring(1); 
  
  return titleStr;
}



function okayClicked(){
  var conn = MMDB.getConnectionString(MENU_CONN.get());
  var editOpTypeIsInsert = ( EDIT_OP_TYPE == "Insert" );
  var rs = "",col="", colQuote, dom = dw.getDocumentDOM();
  var table = MENU_TABLES.getValue();
  var redirectURL   = (TF_REDIRECT_URL.value)?TF_REDIRECT_URL.value:"";
  if ( !editOpTypeIsInsert ) {
    rs  = MENU_RS.getValue();
    col = MENU_COLS.getValue();
    colQuote = (CB_NUMERIC.checked.toString() == "true")?"":"'";
  }
  
  // check for error conditions
  var errMsgStr = "";
  if (!conn) {
    errMsgStr = MM.MSG_NoConnection;
  } else if (!table) {
    errMsgStr = MM.MSG_NoTables;
  } else if ( !editOpTypeIsInsert && !col) {
    errMsgStr = MM.MSG_NoColumn;
  }
  if ( !editOpTypeIsInsert && !errMsgStr) {
    // check that the selected column exists in the recordset
    var colList = dwscripts.getFieldNames(MENU_RS.getValue()),i, found=true;
    for (i=0, found=false; !found && i < colList.length; i++)
      found = (colList[i].toLowerCase() == col.toLowerCase());  
    if (!found)
	{
	  errMsgStr = dwscripts.sprintf(MM.MSG_NoColumnInRS, dwscripts.getRecordsetDisplayName());
	}
  }

  // if error condition, alert it and return
  if (errMsgStr){
    alert (errMsgStr);
    return;
  }
  
  // if no error conditions, build the edits to apply to the document
  MM.setBusyCursor();
  // if cursor is inside of a form, set the selection so that the cursor is just outside
  // of the form
  checkThatCursorIsNotInsideOfAForm();
  // call generic selection handling for non-object insertion
  fixUpInsertionPoint();
  
  // create participant group to apply/insert into document
  var formContent = createFormContent(GRID_COLS.valueList,rs,col);
  var editOpsGroup = new Group( (editOpTypeIsInsert)?"insertRecord":"updateRecord" ); 
  var customGroup = new Group();
  var formActionPart = new Participant("editOps_formAttr"); 
  var formPart = new Participant("editOps_form");
  
  customGroup.addParticipants(editOpsGroup.getParticipants("aboveHTML"));
  
  // comment out below line if using insertHTML
  customGroup.addParticipants(Array(formPart));


  // create parameter object used to provide variables for this edit op
  // server behavior
  var paramObj = new Object();
  paramObj.table   = wrapNamesWithSpaces(table);
  //paramObj.elemStr = determineElementsString();
  setFieldsAndColumns(paramObj);
  paramObj.redirect__url     = redirectURL;
  paramObj.conn    = conn;
  paramObj.username = (MENU_CONN.object) ? MMDB.getUserName(MENU_CONN.get()) : '';
  paramObj.password = (MENU_CONN.object) ? MMDB.getPassword(MENU_CONN.get()) : '';
  paramObj.driver   = (MENU_CONN.object) ? MMDB.getDriverName(MENU_CONN.get()) : '';  
  if (!editOpTypeIsInsert){
    paramObj.rs  = rs;
    paramObj.col = col;
    paramObj.colQuote = colQuote;
  }
  
  paramObj.formContent = formContent;
  paramObj.formAction  = killEndingWhiteSpace(formActionPart.getInsertString());
  paramObj.formName    = makeUniqueName("FORM","form");
  
  // needed for connection participant
  paramObj.cname   = (MENU_CONN.object) ? MENU_CONN.get() : '';
	//get the default url format
	paramObj.urlformat = getConnectionsUrlFormat(dw.getDocumentDOM());
	//set the relative path for site relative preference
	paramObj.relpath = getConnectionsPath(paramObj.cname,paramObj.urlformat);

  paramObj.ext = getServerExtension();
	//for JSP file with "/" serves as virtual url prefix, so change the urlformat to "file"
	var currServerModel = dw.getDocumentDOM().serverModel.getServerName();
	if ((currServerModel == "JSP") && ((paramObj.urlformat != null) && (paramObj.urlformat == "virtual")))
	{
		paramObj.urlformat = "file";
	}
  
  
  // H: uncomment out below to use dw.insertHTML
  //var formStr = formPart.getInsertString(paramObj);
  //dom.insertHTML(formStr);
  customGroup.apply(paramObj);
  
  MM.clearBusyCursor();
  window.close();
  
}


function cancelClicked(){
  MM.commandReturnValue = "";
  window.close();
}

function initializeUI(){ 

   defineGlobalsBasedOnServerModel();
   
   // define global form elements
   MENU_CONN   = new ListControl("Connection")
   MENU_TABLES = new ListControl("TableToUpdate");
   MENU_DISPLAY = new ListControl("DisplayAs");
   MENU_SUBMIT = new ListControl("SubmitAs");
   if (EDIT_OP_TYPE == "Update"){
     MENU_RS = new ListControl("SelectRecordFrom");
     MENU_COLS = new ListControl("UniqueKeyColumn");
     CB_NUMERIC  = findObject("Numeric");
   } 
   TF_REDIRECT_URL  = findObject("GoToURL");
   TF_LABEL    = findObject("ElementLabel");
   GRID_COLS   = new GridWithNavControls("ColumnNames");
   GRID_COLS.setColumnNames(MM.LABEL_ColGrid);

   // populate menus
   var displayAsArr = new Array(TEXTFIELD,TEXTAREA,MENU,HIDDENFIELD,CHECKBOX,
                                RADIOGROUP,PASSWORDFIELD,TEXT);
   var submitAsArr  = new Array(TEXT,NUMERIC,DATE,DATEMSACCESS,CHECKBOXYN,CHECKBOX10,CHECKBOXNEG10,CHECKBOXACCESS);
   MENU_DISPLAY.setAll(displayAsArr,displayAsArr);
   MENU_SUBMIT.setAll(submitAsArr,submitAsArr);
   updateUI("populateConnectionList");

   // if "Update Record", then populate recordset list
   if (EDIT_OP_TYPE == "Update"){ 
     var rsNames = dwscripts.getRecordsetNames();
     if (rsNames) {
       MENU_RS.setAll(rsNames,rsNames);
       STR_CURR_RS = MENU_RS.get();
     }
	 else
	 {
       MENU_RS.setAll(new Array(dwscripts.sprintf(MM.LABEL_NoRecordsets, 
	                                              dwscripts.getRecordsetDisplayName())), 
												  EMPTY_LIST);
     }
   }
  
  elts = document.forms[0].elements;
  if (elts && elts.length)
    elts[0].focus();
}


function updateUI(whichSection){ 
  
   switch (whichSection){
     case "defineConnection":
       var pickedValue = MENU_CONN.getValue();
       MMDB.showConnectionMgrDialog()
       updateUI("populateConnectionList");
       break;
         
     case "populateConnectionList":
       var connNames = MMDB.getConnectionList();
       connNames.unshift(MM.LABEL_None);
       if (connNames.length > 0) 
         MENU_CONN.setAll(connNames,connNames);
       else
         MENU_CONN.setAll(new Array(MM.LABEL_NoConnections), EMPTY_LIST);
       if (pickedValue)
         MENU_CONN.pickValue(pickedValue);
       updateUI("tableMenu");
       break;
      
     case "tableMenu":
       var tableNames = new Array(), tableName,i;
       if (MENU_CONN.get() != MM.LABEL_None) {
         var tableObjects = MMDB.getTables(MENU_CONN.get());
         for (var i = 0; i < tableObjects.length; i++) {
           var tableName = "";
           if (tableObjects[i].schema != "") {
             tableName = Trim(tableObjects[i].schema) + ".";
           } else if (tableObjects[i].catalog != "") {
             tableName = Trim(tableObjects[i].catalog) + ".";
           }
           tableName += tableObjects[i].table;
           if (tableName) {
             tableNames.push(tableName);
           }
         }
       }
       if (tableNames.length > 0) {
         MENU_TABLES.setAll(tableNames,tableNames);
         MENU_TABLES.setIndex(0);
       }
       else {
         MENU_TABLES.setAll(new Array(MM.LABEL_NoTables), EMPTY_LIST);
       }
       updateUI('columnGrid');
       break;
        
      case "RSHasChanged":
        if (STR_CURR_RS != ""){
          updateDefaultFormFieldValues(STR_CURR_RS,MENU_RS.getValue());
          displayGridFieldValues();
          STR_CURR_RS = MENU_RS.getValue();
        }
        break;
        
        
      case "tableColList":
        // check for checking numeric box here
        var column = MENU_COLS.get();
        if (ARR_COL_TYPES[column] != null) {
          if (dwscripts.isNumericDBColumnType(ARR_COL_TYPES[column])) {
            CB_NUMERIC.setAttribute("checked","true");
          } else {
            CB_NUMERIC.removeAttribute("checked");
          }
        }
        break;
        
      case "columnGrid": 
        // populate grid, and populate UI according to first grid item
        populateColumnGrid();
        displayGridFieldValues();
        
        // if Update, populate uniqueID menu
       if (EDIT_OP_TYPE == "Update") {
         var i, colArr = new Array();
         for (i in ARR_COL_TYPES){
           colArr.push(i);
       }
       if (colArr.length > 0)
         MENU_COLS.setAll(colArr, colArr);
       else
         MENU_COLS.setAll(new Array(MM.LABEL_NoColumns), EMPTY_LIST); 
       updateUI("tableColList");
  }
        break;
        
      case "GoToURL":
      {
        browseFile(TF_REDIRECT_URL);
        
        var currServerModel = dw.getDocumentDOM().serverModel.getServerName();
        if (currServerModel == "ASP" || currServerModel == "JSP")
        {
          var theRedirect_url = TF_REDIRECT_URL.value; 

          if (theRedirect_url.length > 0)
          {
            // convert any script blocks to concat values
            theRedirect_url = theRedirect_url.replace(/<%=?\s*/gi, "\" + ");
            theRedirect_url = theRedirect_url.replace(/\s*%>/gi, " + \"");

            TF_REDIRECT_URL.value = theRedirect_url;       
          }
        }
        break;
      }
   
      default:
        break;

   }
}


function populateColumnGrid(){
  // clear additional column list
  // it lists columns that don't get populated in the grid, and needs to be cleared
  updateAdditionalColumnList('clear'); 
  
  // if there are no tables, then clear grid, and return
  if ( !connectionHasBeenChosen() ){
    GRID_COLS.setAllRows(new Array(),new Array());
    return;
  }
  
  var colsAndTypes = MMDB.getColumnAndTypeOfTable(MENU_CONN.get(),MENU_TABLES.getValue())
  var nColumns = colsAndTypes.length/2, rowInfo, i;
  var rowTextArr = new Array();
  var rowValArr  = new Array();
  ARR_COL_TYPES = new Array();
  
  for (var i=0; i < colsAndTypes.length; i+=2) {
     ARR_COL_TYPES[colsAndTypes[i]] = colsAndTypes[i+1];
     if (EDIT_OP_TYPE == "Update") {
       rowInfo = getRowTextAndValue(colsAndTypes[i],colsAndTypes[i+1],MENU_RS.get());
     } else {  // if Insert (and recordset menu does not exist)
       rowInfo = getRowTextAndValue(colsAndTypes[i],colsAndTypes[i+1]);
     }
     rowTextArr.push(rowInfo[0]);
     rowValArr.push(rowInfo[1]);
  }
  
  GRID_COLS.setAllRows(rowTextArr,rowValArr);
  
  // clear global field names array (used to check for dupe field names)
  STR_ELEMENT_NAMES = STR_DIVIDER;
  
  
}


// Note: rsName is last parameter because it is only used for Update
function getRowTextAndValue(colName,colType,rsName){
  var rowValObj = new Object();
  var colLabel = getLabelFromColumnName(colName);
  // default to password display type if "password" appears in field name
  var colFieldType = (colName.toLowerCase().indexOf(PASSWORD) != -1)?
                      PASSWORDFIELD:getFieldTypeFromColumnType(colType);
  var colSubmitType = getSubmitTypeFromColumnType(colType);
  var rowText = colName + "|" + colLabel + "|" + colFieldType + "|" + colSubmitType;
      
  rowValObj.column = colName;
  rowValObj.label = colLabel;
  rowValObj.displayAs = getFormFieldStorageObjectFromFormFieldType(colFieldType);
  rowValObj.submitAs = colSubmitType;
  rowValObj.fieldName = getElementNameFromColumnName(colName);
  rowValObj.defaultStr = "";
  rowValObj.passwordStr = "";
 
  // populate storage object with any default values
  if (EDIT_OP_TYPE == "Update" && rowValObj.displayAs.type != "passwordField"){
    var rs = (rsName)?rsName:MENU_RS.getValue();
    rowValObj = populateFormFieldStorageType(rowValObj,rs,colName);
  }
          
  return new Array(rowText,rowValObj);
}


// note: this fn is only called when the row is first created, which is why
// it only lists some of the available form types

function populateFormFieldStorageType(rowValObj,rsName,colName){
  var displayType = rowValObj.displayAs.type;
  var dynDataVal = createDynamicData(rsName,colName);
  rowValObj.defaultStr = dynDataVal;
  
  if  (displayType == "textField" || displayType  == "textArea" || 
       displayType  == "hiddenField" ) {
    rowValObj.displayAs.value = dynDataVal;
  } else if (displayType == "text" ){
    rowValObj.displayAs.text = dynDataVal;
  } else if (displayType == "dynamicCheckBox"){
    rowValObj.displayAs.checkIf = dynDataVal;
  }

  return rowValObj;
}


function getFormFieldStorageObjectFromFormFieldType(fieldType){
  var retObj = "";
    
  if (fieldType == TEXT){
    retObj = new eoText();
  } else if (fieldType == TEXTFIELD){
    retObj = new eoTextField();
  } else if (fieldType == HIDDENFIELD){
    retObj = new eoHiddenField();
  } else if (fieldType == PASSWORDFIELD){
    retObj = new eoPasswordField();
  } else if (fieldType == FILEFIELD){
    retObj = new eoFileField();
  } else if (fieldType == TEXTAREA){
    retObj = new eoTextArea();
  } else if (fieldType == MENU){
    retObj = new eoMenu();
  } else if (fieldType == RADIOGROUP){
    retObj = new eoRadioGroup();
  } else if (fieldType == CHECKBOX){
    retObj = (EDIT_OP_TYPE == "Insert")?new eoCheckBox():new eoDynamicCheckBox();
  } 

  return retObj;
}



// function: showDifferentParams
// description: shows form field specific parameters at the bottom of the dialog
// for instance, shows "Menu Properties" button for menu, value field for textfield, etc.

function showDifferentParams(displayDefaultStr){
  
   // don't bother if connection has not been chosen
   if ( !connectionHasBeenChosen() ){
     return;
   }
   var displayAs = MENU_DISPLAY.getValue()?MENU_DISPLAY.getValue():"none";
   var tables = DOM_UI_PIECES.getElementsByTagName("TABLE"), param, i;
   var mmParamsTag = document.body.getElementsByTagName("mmParams").item(0);
   
   toggleSubmitAsVisibility(displayAs); // enable or disable Submit As Menu
   toggleLabelVisibility(displayAs);    // enable or disable Label textfield

   if (displayAs == TEXTFIELD || displayAs == TEXTAREA || displayAs == HIDDENFIELD ||
       displayAs == PASSWORDFIELD || displayAs == FILEFIELD) {
     param = "textField";
   } else if (displayAs == TEXT){
     param = "text";
   } else if (displayAs == RADIOGROUP){
     param = "radio";
   } else if (displayAs == MENU){
     param = "menu";
   } else if (displayAs == CHECKBOX){
     param = (EDIT_OP_TYPE == "Insert") ? "checkBox" : "dynamicCheckBox";
   } else if (displayAs == "none"){
     param = "none";
   }
   
   for (i=0;i<tables.length;i++){
      if (tables[i].name && tables[i].name == param){
         mmParamsTag.innerHTML = tables[i].innerHTML;
         break;
      }
   }
   // if display as equals text, text area, or text field, and the display as menu has
   // just been changed, then display the default text for this column
   if (displayDefaultStr) {
     var rowInfoObj = GRID_COLS.getRowValue();
     var defaultStr = GRID_COLS.getRowValue().defaultStr;
     var passwordStr = GRID_COLS.getRowValue().passwordStr;
     
     if ( displayAs == TEXTFIELD || displayAs == TEXTAREA ||
          displayAs == HIDDENFIELD || displayAs == FILEFIELD ) {
         findObject("SetValueTo").value = rowInfoObj.displayAs.value = defaultStr;  // set UI
     } else if ( displayAs == PASSWORDFIELD ) {
         findObject("SetValueTo").value = rowInfoObj.displayAs.value = passwordStr;    // set UI
     } else if ( displayAs == TEXT ) {
         findObject("Text").value = rowInfoObj.displayAs.text = defaultStr;    // set UI
     } else if ( param == "dynamicCheckBox" ){
         findObject("CheckIf").value = rowInfoObj.displayAs.checkIf = defaultStr;
     }
   }
    
}

// function: updateGridRow
// description: called whenever the label, submitAs, or displayAs fields are edited
// updates both the actual text display in the grid, 
// and the object that stores the information about the display
// whichColumn: the parameter which has been edited -- displayAs, submitAs, or label

function updateGridRow(whichColumn){
  // check that connection has been chosen before proceeding
  if ( !connectionHasBeenChosen() ){
    alert( MM.MSG_NoConnectionSelected );
    // MENU_DISPLAY.setIndex(0); // set display menu back to first item
    return;
  }
  
  var currRowObj  = GRID_COLS.getRowValue();
  var currRowText = GRID_COLS.getRow();
  var currColName = currRowText.substring(  0,currRowText.indexOf("|")  );
  
  // update grid row text
  var newRowText = currColName + "|" + TF_LABEL.value + "|" + MENU_DISPLAY.get() + "|"; 
  newRowText += (findObject("SubmitAs")) ? MENU_SUBMIT.get() : "";
  GRID_COLS.setRow(newRowText);
  
  // update object that stores information about grid row
  // this object is stored in a value attribute of the Grid object
  // these objects are stored in an array: GridObj.valueList
  
  switch (whichColumn){
    case "label":
      currRowObj.label = TF_LABEL.value;
      break;
      
    case "submitAs":
      currRowObj.submitAs = MENU_SUBMIT.get();
      break;
      
    case "displayAs": 
      currRowObj.displayAs = getFormFieldStorageObjectFromFormFieldType(MENU_DISPLAY.getValue());
      // need to update submit property, because changing displayAs menu can
      // auto-change submit type
      if ( findObject("SubmitAs") ) {
        currRowObj.submitAs = MENU_SUBMIT.getValue();
      }
      
      var defaultStr = currRowObj.defaultStr;
      var passwordStr = currRowObj.passwordStr;
      var fieldType = currRowObj.displayAs.type;
      
      if ( fieldType == "textField"  || fieldType == "hiddenField" || 
           fieldType == "fileField"  ||  fieldType == "textArea" ){
           currRowObj.displayAs.value = defaultStr;
      } else if ( fieldType == "passwordField"){
           currRowObj.displayAs.value = passwordStr;          
      } else if ( fieldType == "text"){
           currRowObj.displayAs.text = defaultStr;
      } else if ( fieldType == "menu"){
           currRowObj.displayAs.defaultSelected = defaultStr;
      } else if ( fieldType == "radioGroup"){
           currRowObj.displayAs.defaultChecked = defaultStr;
      } else if (fieldType == "dynamicCheckBox"){
           currRowObj.displayAs.checkIf = defaultStr;
      }
      break;
      
    default:
      break;
  }
}


// function: displayGridFieldValues
// description: called when the user clicks on a new row in the grid,
// changes the values of the UI fields to display the correct information

function displayGridFieldValues(){ 
  // don't bother if grid is empty -- needed because this fn is also
  // called when the connection or table changes
  if (GRID_COLS.list.length == 0){
    TF_LABEL.value = "";
    return;
  }
    
   var currRowText = GRID_COLS.getRow();
   var currRowVal  = GRID_COLS.getRowValue();
   var rowTextTokens = getTokens(currRowText,"|");

      
   TF_LABEL.value = rowTextTokens[1]; // update label field
   MENU_DISPLAY.pickValue(rowTextTokens[2]); // update display menu
   
   // change UI at bottom of dialog, if relevent
   // for instance, if prior row had displayAs = Text, but this row has displayAs = Menu
   showDifferentParams(); 
   
   if (  findObject("SubmitAs")  ) 
     MENU_SUBMIT.pickValue(rowTextTokens[3]); // update submit menu
   
   // fill in form parameters at bottom of UI
   // note that in the case of radio or menu, there is nothing to fill in
   switch (currRowVal.displayAs.type){
     
     case "text":
       findObject("Text").value = currRowVal.displayAs.text = currRowVal.defaultStr;
       break;
     case "textArea":
     case "textField":
     case "hiddenField":
     case "fileField":
       findObject("SetValueTo").value = currRowVal.displayAs.value = currRowVal.defaultStr;
       break;
     case "passwordField":
       findObject("SetValueTo").value = currRowVal.displayAs.value = currRowVal.passwordStr;
       break;
     case "checkBox": 
       // note: findObject doesn't work with radios, so manual references are needed
       var InitialStateRadios = document.forms[0].InitialState;
       if ( currRowVal.displayAs.checked.toString() == "true"){
         InitialStateRadios[0].checked = true; InitialStateRadios[1].checked = false;
       } else {
         InitialStateRadios[0].checked = false; InitialStateRadios[1].checked = true;
       }
       break;
       
     case "dynamicCheckBox":
       findObject("CheckIf").value = currRowVal.displayAs.checkIf;
       findObject("EqualTo").value = currRowVal.displayAs.equalTo;
       break;
       
     case "default":
       break; 
   }
}


// function: deleteGridRow
// description: called when the user clicks the "--" image button

function deleteGridRow(){
  var currRow = GRID_COLS.getRow();
  var currCol = currRow.substring(0,currRow.indexOf("|") );
  var nRows = GRID_COLS.list.length;
  
  if (nRows > 1){
    updateAdditionalColumnList('add',currCol);
    GRID_COLS.delRow();
    displayGridFieldValues(); 
  } else {
    alert(MM.MSG_NeedOneColumnInList);
  }
}


// function: addGridRow
// description: if there are columns not already displayed in the grid
// pop up the "Add Columns" dialog, and allow the user to add them

function addGridRow(){
  // check to see if there are columns to add first
  if (ARR_COLS_TO_ADD.length == 0){
    alert(MM.MSG_NoMoreColumnsToAdd);
    return;
  }
  
  var colsToAdd = callCommand('Add Column.htm',ARR_COLS_TO_ADD);
  if (!colsToAdd) return; // user clicked Cancel
  var nCols = colsToAdd.length,i, currCol, rowInfoArr;
  
  for (i=0;i<nCols;i++){
    currCol = colsToAdd[i];
    rowInfoArr = getRowTextAndValue(currCol,ARR_COL_TYPES[currCol]);
    GRID_COLS.addRow(rowInfoArr[0],rowInfoArr[1]);
    updateAdditionalColumnList('del',currCol);
  }
}


// function: updateAdditionalColumnList
// description: the + button calls up an Add Columns dialog, allowing
// the user to add additional columns to the list. When the Add Columns
// dialog is called, it is populated with the "additional columns list".
// This list is updated when a user adds or deletes a column from the UI.
// The action argument can be add, del, or clear

function updateAdditionalColumnList(action,col){
   var addColArr = ARR_COLS_TO_ADD; 
   if (action == 'add'){
      addColArr.push(col);
   } else if ( action == 'clear'){
      // addColArr.length = 0;
      ARR_COLS_TO_ADD = new Array();
   } else { // delete an item from additional column list
     var nItems = addColArr.length,i;
     
     for (i=0;i<nItems;i++){
       if (addColArr[i] == col){
         addColArr.splice(i,1);
         break;
       }
     }
   }
}


// function: popUpFormFieldPropertiesDialog
// description: pops up the Radio or Menu Properties dialog,
// and passes in the current menu/radio storage object
// so that the dialog can be initialized correctly
// "whichOne" argument can be "Radio" or "Menu";

function popUpFormFieldPropertiesDialog(whichOne){
  var commandFileName = whichOne + " Properties.htm";
  var rowObj = GRID_COLS.getRowValue();
  var fieldInfoObj = callCommand(commandFileName,rowObj.displayAs)


  // note: use the "type" property on the menuInfoObj to see which
  // type of object was returned
  if (fieldInfoObj) {
    rowObj.displayAs = fieldInfoObj;
  }
}


function getFieldTypeFromColumnType(colType){
  return ( dwscripts.isBooleanDBColumnType(colType)) ? CHECKBOX : TEXTFIELD;
}


function getLabelFromColumnName(colName){
  return colName.charAt(0).toUpperCase() + colName.substring(1) + MM.LABEL_Delimiter;      
}

// function: getSubmitTypeFromColumnType
// description: called when the grid is populated, to choose a submit type based
// on the column type
// Note: this function is used during initial population only.
// changeSubmitTypeBasedOnElementType() is used when the element type is changed

function getSubmitTypeFromColumnType(colType){
  var retVal = "";
  var colIsNumeric = dwscripts.isNumericDBColumnType(colType);
  var colIsDate    = dwscripts.isDateDBColumnType(colType);
  var colIsBoolean = dwscripts.isBooleanDBColumnType(colType);
  
  if ( colIsNumeric ){
    retVal = (colIsBoolean) ? CHECKBOX10 : NUMERIC;
  } else if ( colIsDate ){
    retVal = DATE;
  } else { // if text-based
    retVal = (colIsBoolean) ? CHECKBOXYN : TEXT;
  }
  return retVal;

}

function connectionHasBeenChosen(){
  return ( MENU_CONN.getIndex() != 0 );
}


function setFieldsAndColumns(paramObj) {
  var colInfoObjs = GRID_COLS.valueList, nCols = colInfoObjs.length, i, currObj;
  var fieldsStr = "",columnsStr = "", submitType;
  
  // create mini-lookup table
  var lookupTable = new Object();
  lookupTable[TEXT]          = "',none,''";
  lookupTable[NUMERIC]       = "none,none,NULL";
  lookupTable[DATE]          = "',none,NULL";
  lookupTable[DATEMSACCESS]  = "#,none,NULL";
  lookupTable[CHECKBOXYN]    = "none,'Y','N'";
  lookupTable[CHECKBOX10]    = "none,1,0";
  lookupTable[CHECKBOXNEG10] = "none,-1,0";
  lookupTable[CHECKBOXACCESS]= "none,Yes,No";
  
  for (i=0;i<nCols;i++){
    currObj = colInfoObjs[i];
    if (currObj.displayAs.type != "text"){ // if a form element
      submitType = currObj.submitAs;  
      fieldsStr += currObj.fieldName + "|value|";
      columnsStr += wrapNamesWithSpaces(currObj.column) + "|" + lookupTable[submitType] + "|";
    }
  }
  
  // remove last separators
  fieldsStr = fieldsStr.substring(0,fieldsStr.length-1);
  columnsStr = columnsStr.substring(0,columnsStr.length-1);
  
  if (dw.getDocumentDOM() != null && 
      dw.getDocumentDOM().serverModel.getServerName() == "Cold Fusion") {
    fieldsStr = fieldsStr.replace(/#/g,"##");
    columnsStr = columnsStr.replace(/#/g,"##");      
  }
  
  paramObj.fieldsStr = fieldsStr;
  paramObj.columnsStr = columnsStr;
}


// function: checkThatCursorIsNotInsideOfAForm
// description: before inserting a form, check that cursor is not inside of 
// an existing form. If it is, set IP location to be just after the form

function checkThatCursorIsNotInsideOfAForm(){
  var dom = dw.getDocumentDOM();
  var formNode = findForm(dom);
  
  if (formNode){ // if inside of a form tag
    formArr = dom.nodeToOffsets(formNode);
    dom.setSelection(formArr[1]+1,formArr[1]+1);
  }
}

function findForm(dom){
  var formObj="";
  var selArr = dom.getSelection();
  var selObj = dom.offsetsToNode(selArr[0],selArr[1]);

  while (formObj=="" && selObj.parentNode){
    if (selObj.nodeType == Node.ELEMENT_NODE && selObj.tagName=="FORM")
    formObj=selObj;
  else
    selObj = selObj.parentNode;
  }
  
  return formObj;
}


function changeSubmitTypeBasedOnElementType(){
  
  // don't bother if conection hasn't been chosen
  if ( !connectionHasBeenChosen() ){
    return;
  }
  
  var elemType = MENU_DISPLAY.get();
  var submitType = MENU_SUBMIT.get();
  var newSubmitType = "";
  var colType = ARR_COL_TYPES[ GRID_COLS.getRowValue().column ];
  var colIsNumeric = dwscripts.isNumericDBColumnType(colType);
  var colIsDate    = dwscripts.isDateDBColumnType(colType);
  
  if ( elemType == CHECKBOX ) { // if display element is a checkbox
    if (colIsNumeric)       
      newSubmitType = CHECKBOX10;
    else
      newSubmitType = CHECKBOXYN;
  } else { // display type does not equal checkbox
  
    // if submit type is currently a checkbox type,
    // then change it back to the most appropriate
    // non-checkbox type
    
    if (submitType==CHECKBOXYN    || submitType==CHECKBOX10 ||
        submitType==CHECKBOXNEG10 || submitType == CHECKBOXACCESS) {
        if (colIsNumeric) {
          newSubmitType = NUMERIC;
        } else if (colIsDate) {
          newSubmitType = DATE;
        } else {
          newSubmitType = TEXT;
        }
    }
  }
  
  if (newSubmitType)
    MENU_SUBMIT.pickValue(newSubmitType);

}



// function: toggleSubmitAsVisibility 
// description: toggles the visibility of "Submit As: [menu]" that appears
// on the UI.
// This menu should be visible for all items except text

function toggleSubmitAsVisibility(displayAs){
  var currentVal = MENU_SUBMIT.getValue();
  if ( displayAs != TEXT && (currentVal == " " || !currentVal)) { // if any form field is chosen in displayAs menu
      MENU_SUBMIT.enable();
      MENU_SUBMIT.del();
      var submitType = getSubmitTypeFromColumnType(ARR_COL_TYPES[GRID_COLS.getRowValue().column]);
      MENU_SUBMIT.pickValue(submitType);
  } else if (displayAs == TEXT)  { // if plain text was chosen in displayAs menu
      MENU_SUBMIT.append(" ");
      MENU_SUBMIT.disable();
  }
}



// function: toggleLabelVisibility
// description: toggles the visibility of "Label: [textfield]" that appears
// on the UI.
// This textfield should be visible for all items except hidden fields

function toggleLabelVisibility(displayAs){
  var labelFieldIsVisible = !( TF_LABEL.disabled == "true");
  
   if (displayAs != HIDDENFIELD && !labelFieldIsVisible) { // if non-hidden field & non-visible label field
      TF_LABEL.removeAttribute("disabled")                     // then make label field visible
      TF_LABEL.setAttribute("value",GRID_COLS.getRowValue().label); // and set value of it 
      
  } else if (displayAs == HIDDENFIELD && labelFieldIsVisible)  {  // if hidden field
      TF_LABEL.setAttribute("value","");                          // then set value field to empty string
      TF_LABEL.setAttribute("disabled","true");                   // and make it non-editable
  }
}


function updateUIBasedOnDisplayAsMenuChange(){
  showDifferentParams(true);
  changeSubmitTypeBasedOnElementType();
  updateGridRow('displayAs')
}



function getElementNameFromColumnName(col){
  var elemName = col;
  var counter = 2;
  var divider = STR_DIVIDER;
  
  // replace spaces with underscores
  var regExp = / /g;
  elemName = elemName.replace(regExp,"_");
  // strip out all characters that are not alpha-numeric, or underscores
  regExp = /[^a-zA-Z_0-9]/g;
  elemName = elemName.replace(regExp,"");
  // don't allow the first character to be numeric
  while (parseInt(elemName.charAt(0)) &&
         parseInt(elemName.charAt(0) ) == elemName.charAt(0) ){
     elemName = elemName.substring(1);
  }

  // in the unlikely case that no characters are left after the above,
  // then name element generically as "element"
  if (elemName.length == 0) {
    elemName = MM.LABEL_Element;
  }

  // ensure that name is not a dupe
  var tempName = elemName; 
  while (STR_ELEMENT_NAMES.indexOf(divider + elemName + divider) != -1){
    elemName = tempName + counter++;
  }

  // add name to global names list
  STR_ELEMENT_NAMES += elemName + divider;
  
  return elemName;
}



// function: displayDynamicDataDialog
// description: pops up the dialog allowing the user to choose dynamic data
function displayDynamicDataDialog(textFieldObj){
  var serverModel = dw.getDocumentDOM().serverModel.getServerName();
  var expression = dw.showDynamicDataDialog(textFieldObj.value);
  
   if (expression) {
     
     // NOTE: removed to fix bug 42279
     // if (serverModel == "Cold Fusion") {
     //   expression = stripCFOutput(expression);
     // }
     
     textFieldObj.value = expression;
   }
}


function createDynamicData(rs,col){
  var retVal = "";
  if (rs){
    var colArray = dwscripts.getFieldNames(rs);
    if (dwscripts.findInArray(colArray, col) != -1){
      var paramObj = new Object();
      paramObj.rsName = rs;
      paramObj.bindingName = col;

      retVal = GROUP_DYN_DATA.getInsertStrings(paramObj,"replaceSelection");
    }
  }
  return retVal;
}

// go through the default values, and replace references to the old
// recordset with the new recordset

function updateDefaultFormFieldValues(oldRS,newRS){
  var rowObjs = GRID_COLS.valueList;
  var nRows = rowObjs.length, i, fieldType, currRowObj, regExp;
  
  for (i=0;i<nRows;i++){
    currRowObj = rowObjs[i];
    regExp = new RegExp(oldRS,"g");
    currRowObj.defaultStr = currRowObj.defaultStr.toString().replace(regExp,newRS);
    currRowObj.passwordStr = currRowObj.passwordStr.toString().replace(regExp,newRS);

    // update the current display
    switch(currRowObj.displayAs.type){
      case "textField":
      case "textArea":
      case "hiddenField":
        currRowObj.displayAs.value = currRowObj.defaultStr;
        break;
      case "passwordField":
         currRowObj.passwordField.value = currRowObj.passwordStr;
         break;
      case "text":
        currRowObj.displayAs.text = currRowObj.defaultStr;
        break;
      case "radioGroup":
      case "dynamicRadioGroup":
        currRowObj.displayAs.defaultChecked = currRowObj.defaultStr;
        break;
      case "menu":
      case "dynamicMenu":
        currRowObj.displayAs.defaultSelected = currRowObj.defaultStr;
        break;
      case "dynamicCheckBox":
        currRowObj.displayAs.checkIf = currRowObj.defaultStr;
        break;
      case "default":
        break;  
    }
  } 
 
}


function killEndingWhiteSpace(textStr){
  var str = textStr;
  while (  str.length > 0 &&
           ( str.charAt( str.length - 1 ) == "\n" ||
             str.charAt( str.length - 1 ) == "\r" ||
             str.charAt( str.length - 1 ) == " " )) {    
       
               str = str.substring(0,str.length-1);  
  }
  
  return str;
}


// function: defineGlobalsBasedOnServerModel
// description: define global variables that depend on the server model
function defineGlobalsBasedOnServerModel(){
  PART_TEXT       =   new Participant(PREFIX + "text");   
  PART_TF         =   new Participant(PREFIX + "textField");
  PART_TA         =   new Participant(PREFIX + "textArea");
  PART_HF         =   new Participant(PREFIX + "hiddenField");         
  PART_PF         =   new Participant(PREFIX + "passwordField");
  PART_FF         =   new Participant(PREFIX + "fileField");
  PART_CB         =   new Participant(PREFIX + "checkBox");  
  PART_DYN_CB     =   new Participant(PREFIX + "dynamicCheckBox");
  PART_RG         =   new Participant(PREFIX + "radioGroup"); 
  PART_DYN_RG     =   new Participant(PREFIX + "dynamicRadioGroup"); 
  PART_SELECT     =   new Participant(PREFIX + "select");      
  PART_OPTION     =   new Participant(PREFIX + "option");    
  PART_DYN_OPTION =   new Participant("dynamicList_option");
  PART_DYN_OP_NOSEL = new Participant("dynamicListNoSel_option");
  PART_DYN_MENU   =   new Participant(PREFIX + "dynamicMenu"); 
  PART_TR         =   new Participant(PREFIX + "tableRow");  
  PART_TR_RG      =   new Participant(PREFIX + "radioGroupTableRow"); 
  PART_TR_RB      =   new Participant(PREFIX + "radioButtonTableRow"); 
  PART_TR_TA      =   new Participant(PREFIX + "textAreaTableRow"); 
  PART_TABLE      =   new Participant(PREFIX + "table");    
  PART_BEGIN_LOOP =   new Participant("dynamicList_begin");
  PART_END_LOOP   =   new Participant("dynamicList_end");
  PART_CHECKED_ATTR = new Participant("dynamicRadioButtons_attrib");
  PART_SELECTED_ATTR = new Participant("dynamicList_attrib");

  GROUP_DYN_DATA = new Group("dynamicData");

}



