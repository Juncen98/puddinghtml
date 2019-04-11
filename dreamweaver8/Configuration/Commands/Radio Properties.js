
// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved. 

//************************GLOBALS**************************

var helpDoc = MM.HELP_soFormFieldProps;

var EMPTY_LIST = new Array();
var GRID_RADIO;
var TF_RADIO_LABEL;
var TF_RADIO_VALUE;
var TF_DEFAULT_MANUAL;


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
  var allRows = GRID_RADIO.list, nRows = allRows.length, currRowText, dividerInd;
  var labelArr = new Array(),valArr = new Array();

  for (i=0;i<nRows;i++){
    currRowText = allRows[i];
    dividerInd = currRowText.indexOf("|");
    labelArr.push(currRowText.substring(0,dividerInd));
    valArr.push(currRowText.substring(dividerInd +1));
  }

  MM.commandReturnValue = new eoRadioGroup(labelArr,valArr,TF_DEFAULT_MANUAL.value);
  
  clearUI();
  window.close();
}

function cancelClicked(){
  MM.commandReturnValue = "";
  clearUI();
  window.close();
}

function clearUI(){
  GRID_RADIO.setAllRows(new Array(),new Array());
  TF_RADIO_LABEL.value = "";
  TF_RADIO_VALUE.value = "";
  TF_DEFAULT_MANUAL.value = "";
}


function initializeUI(){

  GRID_RADIO = new GridWithNavControls("MenuGrid",null,true);
  GRID_RADIO.setColumnNames(MM.LABEL_RadioGrid);
    
  TF_RADIO_LABEL = findObject("MenuText");
  TF_RADIO_VALUE = findObject("MenuValue");
  TF_DEFAULT_MANUAL = findObject("DefaultValueManual");

  var radioGroupInfoObj = MM.commandArgument;
  if (radioGroupInfoObj.type == "radioGroup"){ // if a static radio group
    if (GRID_RADIO.list.length == 0){
      TF_DEFAULT_MANUAL.value = "";
      addNewRow();
      GRID_RADIO.setRowIndex(0);
    } else {
      if (GRID_RADIO.list.length == 1 && GRID_RADIO.getRow() == "|"){
        GRID_RADIO.setRow(" |");
        GRID_RADIO.setRowIndex(0);
      }
      TF_RADIO_LABEL.focus();
      TF_RADIO_LABEL.select();
    }
    
    if (radioGroupInfoObj.labelArr != "" || radioGroupInfoObj.defaultChecked != ""){ // if there are prior values
      var nOptions = radioGroupInfoObj.labelArr.length,i;
      var gridDisplayArr = new Array();
      var labelArr = radioGroupInfoObj.labelArr;
      var valArr  = radioGroupInfoObj.valArr;
      for (i=0;i<nOptions;i++){
        gridDisplayArr[i] = labelArr[i] + "|";
        if (valArr[i])
          gridDisplayArr[i] += valArr[i];
      }

      if (gridDisplayArr.length && gridDisplayArr.length > 0) {
        GRID_RADIO.setAllRows(gridDisplayArr);
        GRID_RADIO.setRowIndex(0);
        displayGridValues();
      }
    
      TF_RADIO_LABEL.focus();
      if (TF_RADIO_LABEL.value != "")
        TF_RADIO_LABEL.select();
      TF_DEFAULT_MANUAL.value = radioGroupInfoObj.defaultChecked;
    }
  }
}

function addNewRow(){
  GRID_RADIO.addRow(MM.LABEL_radioPropLabelPrefix + "|");
  displayGridValues();
  var newLabel = getUniqueLabel(MM.LABEL_radioPropLabelPrefix);
  TF_RADIO_LABEL.value = newLabel;
  updateGridRow();
  TF_RADIO_LABEL.focus();
  TF_RADIO_LABEL.select();
}



function updateGridRow(){
   GRID_RADIO.setRow(TF_RADIO_LABEL.value + "|" + TF_RADIO_VALUE.value);
}

function displayGridValues(){
   var currRow = GRID_RADIO.getRow();
   var dividerIndex = currRow.indexOf("|");
   TF_RADIO_LABEL.value = currRow.substring( 0,dividerIndex);
   TF_RADIO_VALUE.value = currRow.substring(dividerIndex+1);
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

function getUniqueLabel(baseName) {
  var label, i, num=1, isUnique,rowText,menuLabel;

  for (isUnique=false; !isUnique; num++) {
    label = baseName + num;
    isUnique = true;
    for (i=0; i<GRID_RADIO.list.length && isUnique; i++) {
      rowText = GRID_RADIO.list[i];
      menuLabel = rowText.substring(0,rowText.indexOf("|"));
      if (menuLabel == label) isUnique=false;
    }
  }
  return label;
}