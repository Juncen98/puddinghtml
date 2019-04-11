
// Copyright 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved. 


//************************GLOBALS**************************

var helpDoc = MM.HELP_soMenuProps;

var _MenuGrid;
var _ManualLayer;
var _DatabaseLayer;
var _ColumnText;
var _ColumnValue;
var _DefaultManual;
var _DefaultDatabase;
var _PopulateRadio;
var _ElemUp, _ElemDown, _ElemAdd, _ElemDel;
var _RecordsetName = new RecordsetMenu("InsertRecord.htm","RecordsetName");
var _MenuLabels = new RecordsetFieldMenu("InsertRecord.htm", "MenuLabels", "", "_RecordsetName");
var _MenuValues = new RecordsetFieldMenu("InsertRecord.htm", "MenuValues", "", "_RecordsetName");
var _BindDataButton;
var SITE_DEFINED;

// The following variable is need by the UI.  Setting here,
//  rather than changing the UI file.
var TF_DEFAULT_DATABASE = "";

//********************API FUNCTIONS**************************
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

  return new Array(MM.BTN_OK,    "clickedOK()",
                   MM.BTN_Cancel,"clickedCancel()",
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
  if (_ManualLayer.visibility == "visible")
  { 
    // static menu object created
    var allRows = _MenuGrid.list, nRows = allRows.length, currRowText, dividerInd;
    var textArr = new Array(),valArr = new Array();
    var defaultVal = "";

    for (i=0;i<nRows;i++)
    {
      currRowText = allRows[i];
      dividerInd = currRowText.indexOf("|");
      textArr.push(currRowText.substring(0,dividerInd));
      valArr.push(currRowText.substring(dividerInd +1));
    }

    if (_DefaultManual)
    {
      var serverModel = dw.getDocumentDOM().serverModel.getServerName();

      if (serverModel == "PHP")
        defaultVal = dwscripts.encodeDynamicExpression(_DefaultManual.value);
      else
        defaultVal = _DefaultManual.value;
    }

    MM.commandReturnValue = new eoMenu(textArr,valArr,defaultVal);
  }
  else
  { 
    // dynamic menu object created
    dynMenuObj = new eoDynamicMenu();
    dynMenuObj.recordset = _RecordsetName.getValue();
    dynMenuObj.textCol = _MenuLabels.getValue();
    dynMenuObj.valCol = _MenuValues.getValue();
    dynMenuObj.defaultSelected = (_DefaultDatabase)?_DefaultDatabase.value:"";

    MM.commandReturnValue = dynMenuObj;
  }

  clearUI();
  window.close();
}


function clearUI()
{
  _MenuGrid.setAllRows(new Array(),new Array());
  _ColumnText.value = "";
  _ColumnValue.value = "";
  if (_DefaultManual)
    _DefaultManual.value = ""; 
  if (_DefaultDatabase)
    _DefaultDatabase.value = "";

  _ManualLayer.visibility="hidden";
  _DatabaseLayer.visibility="hidden";
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
  MM.commandReturnValue = "";
//  dwscripts.findDOMObject("RecordsetName").selectedIndex = _RecordsetName.listControl.getIndex();
//  dwscripts.findDOMObject("MenuLabels").selectedIndex = _MenuLabels.listControl.getIndex();
//  dwscripts.findDOMObject("MenuValues").selectedIndex = _MenuValues.listControl.getIndex();    
  clearUI();
  window.close();
}

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
  // Some callers pass just the type, some pass an array w/ type and display name
  var menuInfoObj = MM.commandArgument;
  var serverModel = dw.getDocumentDOM().serverModel.getServerName();

  _ManualLayer   = document.layers["manualLayer"];
  _DatabaseLayer = document.layers["databaseLayer"];

  _PopulateRadio = dwscripts.findDOMObject("Populate");
  _MenuGrid = new TreeControlWithNavControls("MenuGrid",_ManualLayer,true);
  _MenuGrid.setColumnNames(MM.LABEL_MenuGrid);

  _ColumnText = dwscripts.findDOMObject("MenuText",_ManualLayer);
  _ColumnValue = dwscripts.findDOMObject("MenuValue",_ManualLayer);
  _DefaultManual = dwscripts.findDOMObject("DefaultValueManual", _ManualLayer);

  var displayNameSpan = dwscripts.findDOMObject("RecordsetDisplayName", _DatabaseLayer);
  displayNameSpan.innerHTML = dwscripts.getRecordsetDisplayName();

  _DefaultDatabase = dwscripts.findDOMObject("DefaultValueDatabase",_DatabaseLayer);
  TF_DEFAULT_DATABASE = _DefaultDatabase;
  _BindDataButton = dwscripts.findDOMObject("bindDynData");
  

  if (dw.getSiteRoot() != ""){
    _RecordsetName.initializeUI();
    _MenuLabels.initializeUI();
    _MenuValues.initializeUI();
    _PopulateRadio[1].removeAttribute("disabled");
    if (_DefaultManual && _BindDataButton){
       _BindDataButton.removeAttribute("disabled");
       _BindDataButton.setAttribute("src","../Shared/UltraDev/Images/Boltup.gif");
    }
    SITE_DEFINED = true;
  }else{
    dwscripts.findDOMObject('MenuValues',_DatabaseLayer).setAttribute("disabled","true");
    dwscripts.findDOMObject('MenuLabels',_DatabaseLayer).setAttribute("disabled","true");
    dwscripts.findDOMObject('RecordsetName',_DatabaseLayer).setAttribute("disabled","true");
    _PopulateRadio[1].setAttribute("disabled","true");
    if (_DefaultManual && _BindDataButton){
       _BindDataButton.setAttribute("disabled","true");
       _BindDataButton.setAttribute("src","../Shared/MM/Images/Bolt_dis.gif");
    }
    SITE_DEFINED = false;
  }

  _ElemUp = dwscripts.findDOMObject("elemUp");
  _ElemDown = dwscripts.findDOMObject("elemDown");
  _ElemAdd = dwscripts.findDOMObject("elemAdd");
  _ElemDel = dwscripts.findDOMObject("elemDel");

  if (menuInfoObj.type == "menu" )
  { 
    // if a static menu
    initManualLayer();
    showDifferentLayer("manual");
    _PopulateRadio[0].checked = true;
    if (menuInfoObj.textArr != "" || menuInfoObj.defaultSelected != "")
    { 
      if (serverModel == "Cold Fusion")
      {
        menuInfoObj.defaultSelected = dwscripts.stripCFOutputTags(menuInfoObj.defaultSelected);          
      } 
      else 
      {
        // other server models go here  
      }


      // if there are prior values
      var nOptions = menuInfoObj.textArr.length,i;
      var gridDisplayArr = new Array();
      var textArr = menuInfoObj.textArr;
      var valArr  = menuInfoObj.valArr;
      for (i=0;i<nOptions;i++)
      {
        gridDisplayArr[i] = textArr[i] + "|";
        if (valArr[i])
          gridDisplayArr[i] += valArr[i];
      }

      if (gridDisplayArr.length && gridDisplayArr.length > 0)
      {
        _MenuGrid.setAllRows(gridDisplayArr);
        _MenuGrid.setRowIndex(0);
        displayGridValues();
      }

      _ColumnText.focus();
      if (_ColumnText.value != "")
        _ColumnText.select();
      if (_DefaultManual)
        _DefaultManual.value = menuInfoObj.defaultSelected;
    }
//    EnableDisableUpDownBtns();
//    EnableDisableAddDelBtns();      
  }
  else if (SITE_DEFINED)
  { 
    // if a dynamic menu
    _PopulateRadio[1].checked = true;
    initDatabaseLayer();
    showDifferentLayer('database');
    if (menuInfoObj.recordset)
    { 
      _RecordsetName.pickValue(menuInfoObj.recordset);
      updateColumns();
      _MenuLabels.pickValue(menuInfoObj.textCol);
      _MenuValues.pickValue(menuInfoObj.valCol);      
      if (_DefaultDatabase)
        _DefaultDatabase.value = menuInfoObj.defaultSelected;
    }
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   initDatabaseLayer
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
function initDatabaseLayer()
{
  updateColumns();
  if (_DefaultDatabase)
    _DefaultDatabase.value = "";
  if (_DefaultManual && _DefaultDatabase && _DefaultManual.value != "")
  {
    _DefaultDatabase.value = _DefaultManual.value;
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   addNewRow
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
function addNewRow()
{
  _MenuGrid.addRow(MM.LABEL_menuPropLabelPrefix + "|");
  displayGridValues();
  var newLabel = getUniqueLabel(MM.LABEL_menuPropLabelPrefix);
  _ColumnText.value = newLabel;
  updateGridRow();
  _ColumnText.focus();
  _ColumnText.select();
//  EnableDisableUpDownBtns();
//  EnableDisableAddDelBtns();   
}

//--------------------------------------------------------------------
// FUNCTION:
//   delRow
//
// DESCRIPTION:
//  This function deletes a row in the grid control.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function delRow()
{
  _MenuGrid.delRow();
  displayGridValues();
  updateGridRow();  
//  EnableDisableUpDownBtns();
//  EnableDisableAddDelBtns();     
}

//--------------------------------------------------------------------
// FUNCTION:
//   moveRowUp
//
// DESCRIPTION:
//  This function moves the selected row up in the grid control.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function moveRowUp()
{
  _MenuGrid.moveRowUp();
//  EnableDisableUpDownBtns();
//  EnableDisableAddDelBtns();       
}

//--------------------------------------------------------------------
// FUNCTION:
//   moveRowDown
//
// DESCRIPTION:
//  This function moves the selected row down in the grid control.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function moveRowDown()
{
  _MenuGrid.moveRowDown();
//  EnableDisableUpDownBtns();
//  EnableDisableAddDelBtns();       
}


//--------------------------------------------------------------------
// FUNCTION:
//   initManualLayer
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
function initManualLayer()
{
  if (_MenuGrid.list.length == 0)
  {
    if (_DefaultManual)
      _DefaultManual.value = "";
    addNewRow();
    _MenuGrid.setRowIndex(0);
//    EnableDisableUpDownBtns();
//    EnableDisableAddDelBtns();    
  }
  else
  {
    if (_MenuGrid.list.length == 1 && _MenuGrid.getRow() == "|")
    {
      _MenuGrid.setRow(" |");
      _MenuGrid.setRowIndex(0);
    }
    _ColumnText.focus();
    _ColumnText.select();
  }

  if (_DefaultDatabase && _DefaultDatabase.value !="" && _DefaultManual)
  {
    _DefaultManual.value = _DefaultDatabase.value;
  }
}

//--------------------------------------------------------------------
// FUNCTION:
//   showDifferentLayer
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
function showDifferentLayer(whichOne)
{
  if (whichOne == 'database')
  {
    if (dwscripts.getRecordsetNames().length == 0)
    {
      alert (dwscripts.sprintf(MM.MSG_NeedRecordsetForOption, dwscripts.getRecordsetDisplayName()));
      _PopulateRadio[0].checked = true;
      return;
    }
    _ManualLayer.visibility   = "hidden";
    _DatabaseLayer.visibility = "visible";
    initDatabaseLayer();
  }
  else
  {
    _DatabaseLayer.visibility = "hidden";
    _ManualLayer.visibility   = "visible";
    initManualLayer();
  }

}


//--------------------------------------------------------------------
// FUNCTION:
//   updateGridRow
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
function updateGridRow()
{
  _MenuGrid.setRow(_ColumnText.value + "|" + _ColumnValue.value);
}


//--------------------------------------------------------------------
// FUNCTION:
//   displayGridValues
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
function displayGridValues()
{
  var currRow = _MenuGrid.getRow();
  var dividerIndex = currRow.indexOf("|");
  _ColumnText.value = currRow.substring( 0,dividerIndex);
  _ColumnValue.value = currRow.substring(dividerIndex+1);
//  EnableDisableUpDownBtns();
//  EnableDisableAddDelBtns();   
}


//--------------------------------------------------------------------
// FUNCTION:
//   displayDynamicDataDialog
//
// DESCRIPTION:
//   This function pops up the dialog allowing the user to choose 
//   dynamic data
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function displayDynamicDataDialog(textFieldObj)
{
  var serverModel = dw.getDocumentDOM().serverModel.getServerName();
  var expression = dw.showDynamicDataDialog(textFieldObj.value);

  if (expression)
  {
    if (serverModel == "Cold Fusion")
    {
      expression = dwscripts.stripCFOutputTags(expression);
    }
    textFieldObj.value = expression;
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   updateColumns
//
// DESCRIPTION:
//   This function pops up the dialog allowing the user to choose 
//   dynamic data
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function updateColumns()
{
  _MenuLabels.updateUI();
  _MenuValues.updateUI();   
}


//--------------------------------------------------------------------
// FUNCTION:
//   getUniqueLabel
//
// DESCRIPTION:
//   This function pops up the dialog allowing the user to choose 
//   dynamic data
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function getUniqueLabel()
{
  var label, i, num=1, isUnique;

  for (isUnique=false; !isUnique; num++)
  {
    label = TEXT_defaultItemText + num;
    isUnique = true;
    for (i=0; i<GarrMenuOptions.length && isUnique; i++)
      if (GarrMenuOptions[i][0] == label) isUnique=false;
  }
  return label;
}


//--------------------------------------------------------------------
// FUNCTION:
//   getUniqueLabel
//
// DESCRIPTION:
//   This function pops up the dialog allowing the user to choose 
//   dynamic data
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function getUniqueLabel(baseName)
{
  var label, i, num=1, isUnique,rowText,menuLabel;

  for (isUnique=false; !isUnique; num++)
  {
    label = baseName + num; 
    isUnique = true;
    for (i=0; i<_MenuGrid.list.length && isUnique; i++)
    {
      rowText = _MenuGrid.list[i]; 
      menuLabel = rowText.substring(0,rowText.indexOf("|"));
      if (menuLabel == label) isUnique=false;
    }
  }
  return label;
}

//--------------------------------------------------------------------
// FUNCTION:
//   EnableDisableUpDownBtns
//
// DESCRIPTION:
//   Enable/disables the elemUp and elemDown buttons
//
// ARGUMENTS:
//   None
//
// RETURNS:
//   Nothing
//--------------------------------------------------------------------
function EnableDisableUpDownBtns()
{
  // Check if there are any columns
  if (_MenuGrid.list.length == 0 || _MenuGrid.getRowIndex() == -1)
  {
    _ElemUp.setAttribute("disabled", true);
    _ElemUp.src = "../Shared/MM/Images/btnUp_dis.gif";   

    _ElemDown.setAttribute("disabled", true);
    _ElemDown.src = "../Shared/MM/Images/btnDown_dis.gif";        
  }
  else
  {
    if(_MenuGrid.list.length == 1)
      {
      // first row, so disable the up and down buttons
      _ElemDown.setAttribute("disabled", true);
      _ElemDown.src = "../Shared/MM/Images/btnDown_dis.gif";

      _ElemUp.setAttribute("disabled", true);
      _ElemUp.src = "../Shared/MM/Images/btnUp_dis.gif";
    }
    else if(_MenuGrid.list.length-1 == _MenuGrid.getRowIndex())
    {
      // last row, so disable the down button and enable the up button
      _ElemDown.setAttribute("disabled", true);
      _ElemDown.src = "../Shared/MM/Images/btnDown_dis.gif";

      _ElemUp.setAttribute("disabled", false);
      _ElemUp.src = "../Shared/MM/Images/btnUp.gif";
    }    
    // first row, if it is disable up button and enable the down button
    else if (_MenuGrid.getRowIndex() == 0)
    {
      _ElemUp.setAttribute("disabled", true);
      _ElemUp.src = "../Shared/MM/Images/btnUp_dis.gif";

      _ElemDown.setAttribute("disabled", false);
      _ElemDown.src = "../Shared/MM/Images/btnDown.gif";      
    }
    else
    {
      //enable both up and down buttons
      _ElemDown.setAttribute("disabled", false);
      _ElemDown.src = "../Shared/MM/Images/btnDown.gif";

      _ElemUp.setAttribute("disabled", false);
      _ElemUp.src = "../Shared/MM/Images/btnUp.gif";      
    }
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   EnableDisableAddDelBtns
//
// DESCRIPTION:
//   Enable/disables the elemAdd and elemDel buttons
//
// ARGUMENTS:
//   None
//
// RETURNS:
//   Nothing
//--------------------------------------------------------------------
function EnableDisableAddDelBtns()
{
  // if there is no selection, disable the del button and make sure you 
  // enable the add button...
  if (_MenuGrid.getRowIndex() == -1)
  {
    _ElemAdd.setAttribute("disabled", false);
    _ElemAdd.src = "../Shared/MM/Images/btnAdd.gif";   

    _ElemDel.setAttribute("disabled", true);
    _ElemDel.src = "../Shared/MM/Images/btnDel_dis.gif";        
  }
  else
  {
    _ElemAdd.setAttribute("disabled", false);
    _ElemAdd.src = "../Shared/MM/Images/btnAdd.gif";   

    _ElemDel.setAttribute("disabled", false);
    _ElemDel.src = "../Shared/MM/Images/btnDel.gif";          
  }
}
