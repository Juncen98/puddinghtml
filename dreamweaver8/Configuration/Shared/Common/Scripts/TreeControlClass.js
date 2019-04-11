//SHARE-IN-MEMORY=true
// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.


//--------------------------------------------------------------------
// CLASS:
//   TreeControl
//
// DESCRIPTION:
// 
//   !!! IMPORTANT !!! THIS CONTROL ONLY WORKS WITHIN DREAMWEAVER !!!
// 
//   This control manages a MM:TREECONTROL 
// 
//   To define a new TreeControl, create a global variable and define 
//   it after onLoad:
//     MY_TREE = new TreeControl(treeName, searchObj);
// 
//   The gridName argument is mandatory.
//   The searchObj argument is optional, if used, the gridName is searched
//   for inside of it.
// 
//   Thereafter, you can call methods and get properties, for example:
//     MY_GRID.addRow("hi|there");    MY_GRID.getRow();  
//
//   As in the above example, use the pipe sign (|) as a delimiter for columns.
//
// PUBLIC PROPERTIES:
//
//   <property> - <type and description>
//
// PUBLIC FUNCTIONS:
//
//   <function name> - <description>
//--------------------------------------------------------------------


//--------------------------------------------------------------------
// FUNCTION:
//   TreeControl
//
// DESCRIPTION:
//   Constructor function
//
// ARGUMENTS:
//   <arg1> - <type and description>
//
// RETURNS:
//   <type and description>
//--------------------------------------------------------------------

function TreeControl(gridName, searchObj, loadFromHTML)
{
  // properties
  if (gridName)
  {
    this.gridName  = gridName;
    this.object = (searchObj) ? dwscripts.findDOMObject(gridName,searchObj) : dwscripts.findDOMObject(gridName);
    this.columns = this.object.getElementsByTagName("MM:TREECOLUMN");
    this.nColumns = this.columns.length;
    this.columnNames = this.getColumnNames();
  }
  else 
  {
    this.gridName = "";
    this.object   = "";
    this.columns  = "";
    this.nColumns = "";
    this.columnNames = ""
  }
  
  this.list = new Array();
  this.valueList = new Array();
  this.index = -1;
  
  
  //  Load existing list names and values if they exist.
  if (loadFromHTML) 
  {
    this.initTreeControl();
  }
}

// public methods

TreeControl.prototype.setAllRows   = TreeControl_setAllRows;   //  setAllRows(list,valueList)  // set the entire grid at once
TreeControl.prototype.addRow       = TreeControl_addRow;   //  addRow()  // add a new blank line after the selected line.
                                                        //  addRow('default')  // add default text
                                                        //  addRow('default',value)  //  add text and an associated value
TreeControl.prototype.addRows      = TreeControl_addRows      //  addRows(textArr,valArr) // add an array of values
TreeControl.prototype.appendRow    = TreeControl_appendRow;   //  appendRow()   // append a new blank line to the end of the list
                                                        //  appendRow('default')  // append default text
                                                        //  appendRow('default',value)  //  append text and an associated value
TreeControl.prototype.delRow       = TreeControl_delRow;      //  delRow()  // delete the selected line
TreeControl.prototype.setRow       = TreeControl_setRow;      //  setRow('text')  // set the text of the current selection
                                                        //  setRow('text', n)  // set the text of the nth item
TreeControl.prototype.initTreeControl      = TreeControl_initTreeControl;     //  initTreeControl()  // set the entire list to the current HTML text and values
TreeControl.prototype.setRowValue  = TreeControl_setRowValue; //  setRowValue(value)  // set the value of the current selection
                                                        //  setRowValue(value, n)  // set the value of the nth item
TreeControl.prototype.getRow       = TreeControl_getRow;      //  getRow()  // return the current selection text
                                                        //  getRow(n)  // return text item n (starts at zero)
                                                        //  getrow('all')  // return array of all text items
TreeControl.prototype.getRowValue  = TreeControl_getRowValue; //  getRowValue()  // return the current selection value
                                                        //  getRowValue(n)  // return value item n (starts at zero)
                                                        //  getRowValue('all')  // return array of all value items
TreeControl.prototype.setRowIndex  = TreeControl_setRowIndex; //  setRowIndex()  // set the selection to the given index
TreeControl.prototype.pickRowValue = TreeControl_pickRowValue;//  pickRowValue()  // set the selection to the item with the given value
TreeControl.prototype.getRowIndex  = TreeControl_getRowIndex; //  getRowIndex()  // pulls out the selected index.
TreeControl.prototype.getRowLen    = TreeControl_getRowLen;   //  getRowLen()  // returns the list length
TreeControl.prototype.refresh   = TreeControl_refreshTreeControl;  //  refreshTreeControl()  // captures the current selection
TreeControl.prototype.getColumnNames = TreeControl_getColumnNames; // getColumnNames() // returns an array of the column names
TreeControl.prototype.setColumnNames = TreeControl_setColumnNames; // setColumnNames(nameArr) // set column names, used for localization
TreeControl.prototype.getItem = TreeControl_getItem;  // getItem(n)  // gets the nth item of the currently selected row
TreeControl.prototype.setItem = TreeControl_setItem;  // setItem(n)  // sets the nth item of the currently selected row


// private methods

TreeControl.prototype.updateContents = TreeControl_updateContents;
TreeControl.prototype.escHTMLChars   = TreeControl_escHTMLChars;



//--------------------------------------------------------------------
// FUNCTION:
//   TreeControl.addRow
//
// DESCRIPTION:
//   Adds a new, blank item after the currently selected item (or end of list).
//   If there is no selection, it replaces the first item.
//
// ARGUMENTS:
//   <arg1> - <type and description>
//
// RETURNS:
//   <type and description>
//--------------------------------------------------------------------

function TreeControl_addRow(newItemStr, newValueStr)
{
  var i, retVal = false;
  with (this)
  {
    if (!newItemStr)
    {
      newItemStr = "";  // if no newItemStr, make it blank
    }
    if (!newValueStr)
    {
      newValueStr = "";
    }
    
    index = this.getRowIndex();
    
    if (index >= 0 || list.length == 0) // if there is a selection or no list
    {
      index++;
      list.splice(index, 0, newItemStr);
      valueList.splice(index, 0, newValueStr);
      updateContents();
      setRowIndex(index);
      retVal = true;
    }
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   TreeControl.addRows
//
// DESCRIPTION:
//   <description>
//
// ARGUMENTS:
//   <arg1> - <type and description>
//
// RETURNS:
//   <type and description>
//--------------------------------------------------------------------

function TreeControl_addRows(textArr,valArr)
{
   nItems = textArr.length, i;
   
   for (i=0;i<nItems;i++)
   {
     this.addRow(textArr[i],valArr[i]);
   } 
}


//--------------------------------------------------------------------
// FUNCTION:
//   TreeControl.appendRow
//
// DESCRIPTION:
//   Append a new, blank item to the end of the list.
//   If there is no selection, it replaces the first item.
//
// ARGUMENTS:
//   <arg1> - <type and description>
//
// RETURNS:
//   <type and description>
//--------------------------------------------------------------------

function TreeControl_appendRow(newItemStr, newValueStr)
{
  var i, retVal = false;
  with (this) 
  {
    if (!newItemStr)
    {
      newItemStr = "";  // if no newItemStr, make it blank
    }
    if (!newValueStr)
    {
      newValueStr = "";
    }
    
    index = list.length;
    list[index] = newItemStr;
    valueList[index] = newValueStr;
    updateContents();
    setRowIndex(index);
    retVal = true;
  }
  
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   TreeControl.delRow
//
// DESCRIPTION:
//   Deletes the currently selected item, and selects the one 
//   that followed it.
//
// ARGUMENTS:
//   <arg1> - <type and description>
//
// RETURNS:
//   <type and description>
//--------------------------------------------------------------------

function TreeControl_delRow()
{
  var i, retVal = false;
  with (this)
  {
    index = getRowIndex();
    if (index >= 0)  // if there is a selection
    {
      list.splice(index, 1);
      valueList.splice(index, 1);
      updateContents();
      selectedIndex = (index >= list.length)? --index : index; // if del last, move sel up one
      setRowIndex(selectedIndex)
      retVal = true;
    }
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   TreeControl.setRow
//
// DESCRIPTION:
//   Replaces the list selection with the given value.
//
// ARGUMENTS:
//   <arg1> - <type and description>
//
// RETURNS:
//   <type and description>
//--------------------------------------------------------------------

function TreeControl_setRow(newItemStr, itemNum)
{
  var retVal = false;
  // next line exists to work around MM:treecontrol bug
  var theItemStr = replaceEmptyStringsWithTabs(newItemStr);
  
  with (this)
  {
    index = getRowIndex();
    if (itemNum == null)
    {
      itemNum = index; // if not passed in, use selection
    }
    if (itemNum >= 0 && itemNum < list.length)  //  if selection in range
    {
      if (list[itemNum] != theItemStr) // if text has been changed
      {
        list[itemNum] = theItemStr;  // replace text
        object.getElementsByTagName("MM:TREENODE").item(itemNum).value = theItemStr;
      }
      retVal = true;
    }
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   TreeControl.setRowValue
//
// DESCRIPTION:
//   Replaces the value list selection with the given value.
//
// ARGUMENTS:
//   <arg1> - <type and description>
//
// RETURNS:
//   <type and description>
//--------------------------------------------------------------------

function TreeControl_setRowValue(newValueStr, itemNum)
{
  var retVal = false;
  
  with (this)
  {
    index = getRowIndex();
    if (itemNum == null) 
    {
      itemNum = index; // if not passed in, use selection
    }
    
    if (itemNum >= 0 && itemNum < list.length)  //  if selection in range
    {
      if (valueList[itemNum] != newValueStr) // if text has been changed
      {
        valueList[itemNum] = newValueStr;  // replace text
      }
      retVal = true;
    }
  }

  return retVal;
}



//--------------------------------------------------------------------
// FUNCTION:
//   TreeControl.getRow
//
// DESCRIPTION:
//   Gets the currently selected item, or optionally the one 
//   at the given index
//
// ARGUMENTS:
//   <arg1> - <type and description>
//
// RETURNS:
//   <type and description>
//--------------------------------------------------------------------

function TreeControl_getRow(optIndex)
{
  var retVal = "";  // return blank if all else fails
  
  with (this)
  {
    index = getRowIndex(); // get prior selection
    if (optIndex == null)
    {
      optIndex = index;  // if they don't pass num, use selection
    }
    if (optIndex == "all") 
    {
      retVal = list;
    }
    else if (optIndex > -1)
    {
      retVal = list[optIndex];
    }
  }
  // replace function called below is used to work around MM:treecontrol bug
  // concerning whitespace
  return replaceTabsWithEmptyStrings(retVal);
}


//--------------------------------------------------------------------
// FUNCTION:
//   TreeControl.getRowValue
//
// DESCRIPTION:
//   Gets the currently selected value, or optionally the one 
//   at the given index
//
// ARGUMENTS:
//   <arg1> - <type and description>
//
// RETURNS:
//   <type and description>
//--------------------------------------------------------------------

function TreeControl_getRowValue(optIndex)
{
  var retVal = "";  // return blank if all else fails
  
  with (this)
  {
    index = getRowIndex() // get prior selection
    if (optIndex == null)
    {
      optIndex = index;  // if they don't pass num, use selection
    }
    
    if (optIndex == "all") 
    {
      retVal = valueList;
    }
    else if (optIndex > -1)
    {
      retVal = valueList[optIndex];
    }
  }
  
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   TreeControl.setRowIndex
//
// DESCRIPTION:
//   Sets the list selection to the given index
//   treecontrols don't support the selectedIndex property, therefore
//   everything is done manually
//
// ARGUMENTS:
//   <arg1> - <type and description>
//
// RETURNS:
//   <type and description>
//--------------------------------------------------------------------

function TreeControl_setRowIndex(theIndex)
{
  var retVal = false, selNode, selectedNodeHTML;
  var treeNodes = this.object.getElementsByTagName("MM:TREENODE");
  var nNodes = treeNodes.length;
  var i;
  
  // remove all currently selected attributes
  for (i=0;i<nNodes;i++)
  {
    treeNodes[i].removeAttribute("selected");
  }
  
  //set new selected attribute
  if (theIndex < nNodes && theIndex>-1)
  {
    selNode = treeNodes[theIndex];
    selNode.setAttribute("selected","selected");
    retVal = true;
  }
  
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   TreeControl.pickRowValue
//
// DESCRIPTION:
//   Sets the list selection to the given index
//
// ARGUMENTS:
//   <arg1> - <type and description>
//
// RETURNS:
//   <type and description>
//--------------------------------------------------------------------

function TreeControl_pickRowValue(theValue)
{
  var retVal = false;
  
  with (this)
  {
    for (var i=0; i < valueList.length; i++)
    {
      if (valueList[i] == theValue)
      {
        setRowIndex(i);
        index = i;
        retVal = true;
        break;
      }
    }
  }

  return retVal
}


//--------------------------------------------------------------------
// FUNCTION:
//   TreeControl.getRowIndex
//
// DESCRIPTION:
//   Gets the list selection
//
// ARGUMENTS:
//   <arg1> - <type and description>
//
// RETURNS:
//   <type and description>
//--------------------------------------------------------------------

function TreeControl_getRowIndex()
{
  var index = -1, i;
  
  with (this)
  {
    var selectedNode = object.selectedNodes[0];
    var treeNodes = object.getElementsByTagName("MM:TREENODE");
    var nNodes = treeNodes.length;
  }
  
  for (i=0;i<nNodes;i++)
  {
    if (treeNodes[i] == selectedNode)
    {
      index = i;
      break;
    }
  }
  
  return index;
}


//--------------------------------------------------------------------
// FUNCTION:
//   TreeControl.getRowLen
//
// DESCRIPTION:
//   Returns the length of the current list
//
// ARGUMENTS:
//   <arg1> - <type and description>
//
// RETURNS:
//   <type and description>
//--------------------------------------------------------------------

function TreeControl_getRowLen()
{
  return this.list.length;
}


//--------------------------------------------------------------------
// FUNCTION:
//   TreeControl.initTreeControl
//
// DESCRIPTION:
//   Sets the list to the current values
//
// ARGUMENTS:
//   <arg1> - <type and description>
//
// RETURNS:
//   <type and description>
//--------------------------------------------------------------------

function TreeControl_initTreeControl()
{
  var retVal = false, i;
  
  // Note: we can't use the childNodes property in the below line
  // because MM:TREECOLUMNS are also children of MM:TREECONTROL tags
  // and we only want the MM:TREENODE tags
  ////////////////// RIGHT HERE /////////////////////////
  
  with (this)
  {
    var treeNodes = object.getElementsByTagName("MM:TREENODE");
    var nNodes = treeNodes.length;
    index = getRowIndex(); // set the index value

    list = new Array();
    valueList = new Array();

    for (i=0; i<nNodes; i++)
    {
      list[i] = treeNodes[i].value;
      valueList[i] = "";
    }
    
    retVal = true;
  }
  
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   TreeControl.setAllRows
//
// DESCRIPTION:
//   Sets the entire list to the contents of newList, expanding the list
//   as necessary
//
// ARGUMENTS:
//   <arg1> - <type and description>
//
// RETURNS:
//   <type and description>
//--------------------------------------------------------------------

function TreeControl_setAllRows(newList, newValueList)
{
  var retVal = false;
  
  with (this)
  {
    index = getRowIndex(); // get prior selection
    if (index < 0 || newList.length <= index)
    {
      index = 0; // if outta range
    }
    list = new Array();
    valueList = new Array();
    for (i=0; i < newList.length; i++)
    {
      list[i] = newList[i]; // dupe array
      valueList[i] = (newValueList && newValueList.length > i) ? newValueList[i] : '';
    }
    updateContents();
    setRowIndex(index);
    retVal = true;
  }
  
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   TreeControl.refreshTreeControl
//
// DESCRIPTION:
//   <description>
//
// ARGUMENTS:
//   <arg1> - <type and description>
//
// RETURNS:
//   <type and description>
//--------------------------------------------------------------------

function TreeControl_refreshTreeControl()
{
  this.index = getRowIndex(); // get prior selection
}


//--------------------------------------------------------------------
// FUNCTION:
//   TreeControl.updateContents
//
// DESCRIPTION:
//   <description>
//
// ARGUMENTS:
//   <arg1> - <type and description>
//
// RETURNS:
//   <type and description>
//--------------------------------------------------------------------

function TreeControl_updateContents()
{  
  var allColumnNodes = this.columns;
  var nColumnNodes = this.nColumns;
  var treeContents = "";
  
  // blow away all current tree nodes
  // note that we can't just set the innerHTML of MM:TREENODE to
  // be an empty string, because we have to preserve the MM:COLUMN nodes
  for (i=0;i<nColumnNodes;i++)
  {
    treeContents += allColumnNodes[i].outerHTML;
  }
  
  // put in the new nodes
  for (i=0; i < this.list.length; i++)
  {
    treeContents += '<MM:TREENODE value="' + this.escHTMLChars(this.list[i]) +'">' +
                    '</MM:TREENODE>';  
  }
 
  this.object.innerHTML = treeContents;
}


//--------------------------------------------------------------------
// FUNCTION:
//   TreeControl.getColumnNames
//
// DESCRIPTION:
//   <description>
//
// ARGUMENTS:
//   <arg1> - <type and description>
//
// RETURNS:
//   <type and description>
//--------------------------------------------------------------------

function TreeControl_getColumnNames()
{
  var colNameArr = new Array();
  
  if (this.columnNames)
  {
    colNameArr = this.columnNames;
  } 
  else
  {
    var treeColumns = this.object.treeColumns;
    var nColumns = treeColumns.length, i;
    
    for (i=0;i<nColumns;i++)
    {
      colNameArr.push( (treeColumns[i].name) ? treeColumns[i].name : ""  );
    }    
  }
  
  return colNameArr;
}


//--------------------------------------------------------------------
// FUNCTION:
//   TreeControl.setColumnNames
//
// DESCRIPTION:
//   <description>
//
// ARGUMENTS:
//   <arg1> - <type and description>
//
// RETURNS:
//   <type and description>
//--------------------------------------------------------------------

function TreeControl_setColumnNames(nameArr)
{
  var colNameArr = new Array();
  var treeColumns = this.object.treeColumns;
  var nColumns = treeColumns.length,i;
  
  for (i=0;i<nColumns;i++)
  {
    if (treeColumns[i] && nameArr[i])
    {
      treeColumns[i].value = nameArr[i];
    }
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   TreeControl.escHTMLChars
//
// DESCRIPTION:
//   <description>
//
// ARGUMENTS:
//   <arg1> - <type and description>
//
// RETURNS:
//   <type and description>
//--------------------------------------------------------------------

function TreeControl_escHTMLChars(theStr)
{
  theStr = String(theStr);
  theStr = theStr.replace(/\&/g,"&amp;");
  theStr = theStr.replace(/\</g,"&lt;");
  theStr = theStr.replace(/\>/g,"&gt;");
  
  return theStr;
}


//--------------------------------------------------------------------
// FUNCTION:
//   TreeControl.getItem
//
// DESCRIPTION:
//   Returns the nth item of the currently selected row
//   first item is item 0, because this is how one refers to grid rows
//
// ARGUMENTS:
//   <arg1> - <type and description>
//
// RETURNS:
//   <type and description>
//--------------------------------------------------------------------

function TreeControl_getItem(ind)
{
  retVal = null;
  var rowText = this.getRow();
  var rowArr  = getTokens(rowText,"|");
  
  if (rowArr[ind])
  {
    retVal = rowArr[ind];
  }
  
  return retVal;

}


//--------------------------------------------------------------------
// FUNCTION:
//   TreeControl.setItem
//
// DESCRIPTION:
//   Sets the nth item in the currently selected row
//   first item is item 0, because this is how one refers to grid rows.
//
// ARGUMENTS:
//   <arg1> - <type and description>
//
// RETURNS:
//   <type and description>
//--------------------------------------------------------------------

function TreeControl_setItem(ind,newValue)
{
  retVal = false;
  var rowText = this.getRow();
  var rowArr = getTokens(rowText,"|");
  
  if (rowArr[ind])  
  {
    rowArr[ind] = newValue;
    rowText = rowArr.join("|");
    this.setRow(rowText);
    retVal = true;
  }
  
  return retVal;
}




//--------------------------------------------------------------------
// CLASS:
//   TreeControlWithNavControls
//
// DESCRIPTION:
//   <description>
//
// PUBLIC PROPERTIES:
//   <property> - <type and description>
//
// PUBLIC FUNCTIONS:
//   <function name> - <description>
//--------------------------------------------------------------------


//--------------------------------------------------------------------
// FUNCTION:
//   TreeControlWithNavControls
//
// DESCRIPTION:
//   Constructor function
//
// ARGUMENTS:
//   <arg1> - <type and description>
//
// RETURNS:
//   <type and description>
//--------------------------------------------------------------------

function TreeControlWithNavControls(gridName, searchObj, loadFromHTML)
{
  // call parent class constructor
  this.base = TreeControl;
  this.base(gridName,searchObj,loadFromHTML);

  this.addBtnArr      = new Array(3);
  this.delBtnArr      = new Array(3);
  this.moveUpBtnArr   = new Array(3);
  this.moveDownBtnArr = new Array(3);
}

TreeControlWithNavControls.prototype = new TreeControl;


// methods specific to this class
TreeControlWithNavControls.prototype.initButtons  = TreeControlWithNavControls_initButtons;
TreeControlWithNavControls.prototype.moveRowUp    = TreeControlWithNavControls_moveRowUp;
TreeControlWithNavControls.prototype.moveRowDown  = TreeControlWithNavControls_moveRowDown;


//--------------------------------------------------------------------
// FUNCTION:
//   TreeControlWithNavControls.initButtons
//
// DESCRIPTION:
//   <description>
//
// ARGUMENTS:
//   <arg1> - <type and description>
//
// RETURNS:
//   <type and description>
//--------------------------------------------------------------------

function TreeControlWithNavControls_initButtons(addBtnArr,delBtnArr,moveUpBtnArr,moveDownBtnArr)
{
   this.addBtnArr      = addBtnArr;
   this.delBtnArr      = delBtnArr;
   this.moveUpBtnArr   = moveUpBtnArr;
   this.moveDownBtnArr = moveDownBtnArr;
   
   // in the future:
   // each array that the user enters content for will make the corresponding
   // image button properly greyed out or activated. Add content to the 
   // moveRowUp, moveRowDown, delRow, and addRow methods that properly
   // change the button states.
}


//--------------------------------------------------------------------
// FUNCTION:
//   TreeControlWithNavControls.moveRowUp
//
// DESCRIPTION:
//   <description>
//
// ARGUMENTS:
//   <arg1> - <type and description>
//
// RETURNS:
//   <type and description>
//--------------------------------------------------------------------

function TreeControlWithNavControls_moveRowUp()
{
   var selInd = this.getRowIndex();
   var rowMoved = false;
   if (selInd < 1)
   {
     return rowMoved; // return false if top row or no row selected
   }
   
   var selIndMinusOne = selInd - 1
   var temp;
   
   with (this)
   {
     temp = list[selInd];
     list[selInd] = list[selIndMinusOne];
     list[selIndMinusOne] = temp;
     
     temp = valueList[selInd];
     valueList[selInd] = valueList[selIndMinusOne];
     valueList[selIndMinusOne] = temp;

     updateContents();
     rowMoved = true;
     setRowIndex(selIndMinusOne);
   }  
   
   return rowMoved;
}


//--------------------------------------------------------------------
// FUNCTION:
//   TreeControlWithNavControls.moveRowDown
//
// DESCRIPTION:
//   <description>
//
// ARGUMENTS:
//   <arg1> - <type and description>
//
// RETURNS:
//   <type and description>
//--------------------------------------------------------------------

function TreeControlWithNavControls_moveRowDown()
{
  var selInd = this.getRowIndex();
  var rowMoved = false;
  
  // return false if no row or bottom row selected
  if (selInd == -1 || selInd == (this.list.length - 1) )
  {
     return rowMoved;
  }
  
  var selIndPlusOne = selInd + 1;
  var temp;
  
  with (this)
  {
     temp = list[selInd];
     list[selInd] = list[selIndPlusOne];
     list[selIndPlusOne] = temp;
     
     temp = valueList[selInd];
     valueList[selInd] = valueList[selIndPlusOne];
     valueList[selIndPlusOne] = temp;
     
     updateContents();
     rowMoved = true;  
     setRowIndex(selIndPlusOne);
  }
  
  return rowMoved;
}


/////////////////////////////////////////////////////////////////////////////
// these fns exist to work around a MM:treecontrol bug that empty
// strings between the pipe signs cause an incorrect display
// special pipe handing is specific to this file; these fns are not generic
/////////////////////////////////////////////////////////////////////////////

//--------------------------------------------------------------------
// FUNCTION:
//   replaceEmptyStringsWithTabs
//
// DESCRIPTION:
//   <description>
//
// ARGUMENTS:
//   <arg1> - <type and description>
//
// RETURNS:
//   <type and description>
//--------------------------------------------------------------------

function replaceEmptyStringsWithTabs(inStr)
{
  var patt = /\|\s*\|/g;
  return inStr.replace(patt,"|\t|");
  //return inStr;
}


//--------------------------------------------------------------------
// FUNCTION:
//   replaceTabsWithEmptyStrings
//
// DESCRIPTION:
//   <description>
//
// ARGUMENTS:
//   <arg1> - <type and description>
//
// RETURNS:
//   <type and description>
//--------------------------------------------------------------------

function replaceTabsWithEmptyStrings(inStr)
{
  var patt = /\t/g;
  return inStr.replace(patt,"  ");
  //return inStr;
}
