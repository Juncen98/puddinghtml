
// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved. 


//************************GLOBALS**************************

var helpDoc = MM.HELP_soFormFieldProps;

var EMPTY_LIST = new Array();
var GRID_MENU;
var LAYER_MANUAL;
var LAYER_DATABASE;
var TF_MENU_TEXT;
var TF_MENU_VALUE;
var TF_DEFAULT_MANUAL;
var MENU_RECORDSET;
var MENU_TEXT;
var MENU_VALUES;
var TF_DEFAULT_DATABASE;
var RADIO_MENU_TYPE;


//********************API FUNCTIONS**************************

function commandButtons(){

   return new Array(MM.BTN_OK,    "okClicked()",
                    MM.BTN_Cancel,"cancelClicked()",
                    MM.BTN_Help, "displayHelp()"); 
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


//******************LOCAL FUNCTIONS**************************

function okClicked(){
  if (LAYER_MANUAL.visibility == "visible"){ // static menu object created
    var allRows = GRID_MENU.list, nRows = allRows.length, currRowText, dividerInd;
  var textArr = new Array(),valArr = new Array();

  for (i=0;i<nRows;i++){
    currRowText = allRows[i];
    dividerInd = currRowText.indexOf("|");
    textArr.push(currRowText.substring(0,dividerInd));
    valArr.push(currRowText.substring(dividerInd +1));
  }

  MM.commandReturnValue = new eoMenu(textArr,valArr,TF_DEFAULT_MANUAL.value);
  } else { // dynamic menu object created

    dynMenuObj = new eoDynamicMenu();
    dynMenuObj.recordset = MENU_RECORDSET.getValue();
    dynMenuObj.textCol = MENU_TEXT.getValue();
    dynMenuObj.valCol = MENU_VALUES.getValue();
    dynMenuObj.defaultSelected = TF_DEFAULT_DATABASE.value;

  MM.commandReturnValue = dynMenuObj;
  }
  
  clearUI();
  window.close();
}


function clearUI(){
  GRID_MENU.setAllRows(new Array(),new Array());
  TF_MENU_TEXT.value = "";
  TF_MENU_VALUE.value = "";
  TF_DEFAULT_MANUAL.value = ""; 
  TF_DEFAULT_DATABASE.value = "";
  
  LAYER_MANUAL.visibility="hidden";
  LAYER_DATABASE.visibility="hidden";
  MENU_RECORDSET.setIndex(0);
  MENU_TEXT.setIndex(0);
  MENU_VALUES.setIndex(0);
}

function cancelClicked(){
  MM.commandReturnValue = "";
  clearUI();
  window.close();
}


function initializeUI(){

  LAYER_MANUAL   = document.layers["manualLayer"];
  LAYER_DATABASE = document.layers["databaseLayer"];
  
  RADIO_MENU_TYPE = new RadioGroup("Populate");
  GRID_MENU = new GridWithNavControls("MenuGrid",LAYER_MANUAL,true);
  GRID_MENU.setColumnNames(MM.LABEL_MenuGrid);

  TF_MENU_TEXT = findObject("MenuText",LAYER_MANUAL);
  TF_MENU_VALUE = findObject("MenuValue",LAYER_MANUAL);
  TF_DEFAULT_MANUAL = findObject("DefaultValueManual",LAYER_MANUAL);
  MENU_RECORDSET = new ListControl("Recordset",LAYER_DATABASE);
  MENU_TEXT = new ListControl("GetMenuText",LAYER_DATABASE);
  MENU_VALUES = new ListControl("GetMenuValues",LAYER_DATABASE);
  TF_DEFAULT_DATABASE = findObject("DefaultValueDatabase",LAYER_DATABASE);

  var menuInfoObj = MM.commandArgument;
  if (menuInfoObj.type == "menu" ){ // if a static menu
    initManualLayer();
    showDifferentLayer("manual");
    RADIO_MENU_TYPE.setSelectedIndex(0);
    if (menuInfoObj.textArr != "" || menuInfoObj.defaultSelected != ""){ // if there are prior values
      var nOptions = menuInfoObj.textArr.length,i;
      var gridDisplayArr = new Array();
      var textArr = menuInfoObj.textArr;
      var valArr  = menuInfoObj.valArr;
      for (i=0;i<nOptions;i++){
        gridDisplayArr[i] = textArr[i] + "|";
        if (valArr[i])
          gridDisplayArr[i] += valArr[i];
      }
    
      if (gridDisplayArr.length && gridDisplayArr.length > 0) {
        GRID_MENU.setAllRows(gridDisplayArr);
        GRID_MENU.setRowIndex(0);
        displayGridValues();
      }
        
      TF_MENU_TEXT.focus();
      if (TF_MENU_TEXT.value != "")
        TF_MENU_TEXT.select();
      TF_DEFAULT_MANUAL.value = menuInfoObj.defaultSelected;
   }
  } else { // if a dynamic menu
    RADIO_MENU_TYPE.setSelectedIndex(1);
    initDatabaseLayer();
    showDifferentLayer('database');
    if (menuInfoObj.recordset){ // if there are prior values
      MENU_RECORDSET.pickValue(menuInfoObj.recordset);
      updateColumns();
      MENU_TEXT.pickValue(menuInfoObj.textCol);
      MENU_VALUES.pickValue(menuInfoObj.valCol);
      TF_DEFAULT_DATABASE.value = menuInfoObj.defaultSelected;
    }
  }


}

function initDatabaseLayer(){
  var rsNames = dwscripts.getRecordsetNames(), colNames;
  MENU_RECORDSET.setAll(rsNames,rsNames);
  updateColumns();
  TF_DEFAULT_DATABASE.value = "";
  if (TF_DEFAULT_MANUAL.value != ""){
    TF_DEFAULT_DATABASE.value = TF_DEFAULT_MANUAL.value;
  }
}



function addNewRow(){
  GRID_MENU.addRow(MM.LABEL_menuPropLabelPrefix + "|");
  displayGridValues();
  var newLabel = getUniqueLabel(MM.LABEL_menuPropLabelPrefix);
  TF_MENU_TEXT.value = newLabel;
  updateGridRow();
  TF_MENU_TEXT.focus();
  TF_MENU_TEXT.select();
}

function initManualLayer(){
  if (GRID_MENU.list.length == 0){
    TF_DEFAULT_MANUAL.value = "";
    addNewRow();
    GRID_MENU.setRowIndex(0);
  } else {
    if (GRID_MENU.list.length == 1 && GRID_MENU.getRow() == "|"){
      GRID_MENU.setRow(" |");
      GRID_MENU.setRowIndex(0);
    }
    TF_MENU_TEXT.focus();
    TF_MENU_TEXT.select();
  }
  
  if (TF_DEFAULT_DATABASE.value !=""){
    TF_DEFAULT_MANUAL.value = TF_DEFAULT_DATABASE.value;
  }
}


function showDifferentLayer(whichOne){
  if (whichOne == 'database'){
    if (dwscripts.getRecordsetNames().length == 0){
      alert (dwscripts.sprintf(MM.MSG_NeedRecordsetForOption, dwscripts.getRecordsetDisplayName()));
      document.forms[0].Populate[0].checked = true;
      document.forms[0].Populate[1].checked = false;
      return;
    }
    LAYER_MANUAL.visibility   = "hidden";
    LAYER_DATABASE.visibility = "visible";
   initDatabaseLayer();
  } else {
   LAYER_DATABASE.visibility = "hidden";
   LAYER_MANUAL.visibility   = "visible";
   initManualLayer();
  }

}

function updateGridRow(){
   GRID_MENU.setRow(TF_MENU_TEXT.value + "|" + TF_MENU_VALUE.value);
}

function displayGridValues(){
   var currRow = GRID_MENU.getRow();
   var dividerIndex = currRow.indexOf("|");
   TF_MENU_TEXT.value = currRow.substring( 0,dividerIndex);
   TF_MENU_VALUE.value = currRow.substring(dividerIndex+1);
}




// function: displayDynamicDataDialog
// description: pops up the dialog allowing the user to choose dynamic data
function displayDynamicDataDialog(textFieldObj){
  var serverModel = dw.getDocumentDOM().serverModel.getServerName();
  var expression = dw.showDynamicDataDialog(textFieldObj.value);
  
   if (expression) {
     if (serverModel == "Cold Fusion") {
       expression = stripCFOutput(expression);
     }
     textFieldObj.value = expression;
   }
}


function updateColumns(){
  colNames = dwscripts.getFieldNames(MENU_RECORDSET.getValue());
  
    if (colNames && colNames.length > 0) {
      MENU_TEXT.setAll(colNames, colNames);
      MENU_TEXT.setIndex(0);
    } else {
      MENU_TEXT.setAll(new Array(MM.LABEL_NoColumns), EMPTY_LIST);
    }
      
    if (colNames && colNames.length > 0) {
      MENU_VALUES.setAll(colNames, colNames);
      MENU_VALUES.setIndex(0);
    } else {
      MENU_VALUES.setAll(new Array(MM.LABEL_NoColumns), EMPTY_LIST);
    }
}


function getUniqueLabel() {
  var label, i, num=1, isUnique;

  for (isUnique=false; !isUnique; num++) {
    label = TEXT_defaultItemText + num;
    isUnique = true;
    for (i=0; i<GarrMenuOptions.length && isUnique; i++)
      if (GarrMenuOptions[i][0] == label) isUnique=false;
  }
  return label;
}


function getUniqueLabel(baseName) {
  var label, i, num=1, isUnique,rowText,menuLabel;

  for (isUnique=false; !isUnique; num++) {
    label = baseName + num; 
    isUnique = true;
    for (i=0; i<GRID_MENU.list.length && isUnique; i++) {
      rowText = GRID_MENU.list[i]; 
      menuLabel = rowText.substring(0,rowText.indexOf("|"));
      if (menuLabel == label) isUnique=false;
    }
  }
  return label;
}
