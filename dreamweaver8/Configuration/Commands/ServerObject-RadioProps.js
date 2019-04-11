
// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved. 

//************************GLOBALS**************************

var helpDoc = MM.HELP_soFormFieldProps;

var _MenuGrid;
var _ColumnText;
var _ColumnValue;
var _DefaultManual;

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
                   MM.BTN_Help,  "displayHelp()"); 
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
  // static radio object created
  var allRows = _MenuGrid.list, nRows = allRows.length, currRowText, dividerInd;
  var labelArr = new Array(),valArr = new Array();

  for (i=0;i<nRows;i++)
  {
    currRowText = allRows[i];
    dividerInd = currRowText.indexOf("|");
    labelArr.push(currRowText.substring(0,dividerInd));
    valArr.push(currRowText.substring(dividerInd +1));
  }

  MM.commandReturnValue = new eoRadioGroup(labelArr,valArr,_DefaultManual.value);
  
  clearUI();
  window.close();
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
  clearUI();
  window.close();
}

function clearUI()
{
  _MenuGrid.setAllRows(new Array(),new Array());
  _ColumnText.value = "";
  _ColumnValue.value = "";
  _DefaultManual.value = "";
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
  var radioGroupInfoObj = MM.commandArgument;

  _MenuGrid = new TreeControlWithNavControls("MenuGrid",null,true);
  _MenuGrid.setColumnNames(MM.LABEL_RadioGrid);

  _ColumnText = dwscripts.findDOMObject("MenuText");
  _ColumnValue = dwscripts.findDOMObject("MenuValue");
  _DefaultManual = dwscripts.findDOMObject("DefaultValueManual");
  

  if (radioGroupInfoObj.type == "radioGroup")
  { 
    // if a static radio group
    if (_MenuGrid.list.length == 0)
    {
      _DefaultManual.value = "";
      addNewRow();
      _MenuGrid.setRowIndex(0);
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
    
    if (radioGroupInfoObj.labelArr != "" || radioGroupInfoObj.defaultChecked != "")
    {
       // strip the CFoutput tag...
      radioGroupInfoObj.defaultChecked = dwscripts.stripCFOutputTags(radioGroupInfoObj.defaultChecked);      
      // if there are prior values
      var nOptions = radioGroupInfoObj.labelArr.length,i;
      var gridDisplayArr = new Array();
      var labelArr = radioGroupInfoObj.labelArr;
      var valArr  = radioGroupInfoObj.valArr;
      for (i=0;i<nOptions;i++)
      {
        gridDisplayArr[i] = labelArr[i] + "|";
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
      _DefaultManual.value = radioGroupInfoObj.defaultChecked;
    }
  }
}

//--------------------------------------------------------------------
// FUNCTION:
//   addNewRow
//
// DESCRIPTION:
//  This function adds a new row to the grid control
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function addNewRow()
{
  _MenuGrid.addRow(MM.LABEL_radioPropLabelPrefix + "|");
  displayGridValues();
  var newLabel = getUniqueLabel(MM.LABEL_radioPropLabelPrefix);
  _ColumnText.value = newLabel;
  updateGridRow();
  _ColumnText.focus();
  _ColumnText.select();
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
}


function updateGridRow()
{
  _MenuGrid.setRow(_ColumnText.value + "|" + _ColumnValue.value);
}

function displayGridValues()
{
  var currRow = _MenuGrid.getRow();
  var dividerIndex = currRow.indexOf("|");
  _ColumnText.value = currRow.substring( 0,dividerIndex);
  _ColumnValue.value = currRow.substring(dividerIndex+1);
}


// function: displayDynamicDataDialog
// description: pops up the dialog allowing the user to choose dynamic data
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

function updateColumns()
{
  _MenuLabels.updateUI();
  _MenuValues.updateUI();   

}



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

