//SHARE-IN-MEMORY=true
// Copyright 1998, 1999, 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.


//--------------------------------------------------------------------
// CLASS:
//   GridControl
//
// DESCRIPTION:
//   This class represents an editable grid control class.
//
// PUBLIC PROPERTIES:
//
//   SEPARATOR - (static) the separator of option values
//
// PUBLIC FUNCTIONS:
//
//   setAll(newDisplayArray)
//   getAll()
//   setIndex(theIndex)
//   getIndex()
//   setColumnNames(columnNameList)
//   getColumnNames()
//   append(optionArray)
//   del()
//   delAll()
//   add()
//   moveUp()
//   moveDown()
//
//--------------------------------------------------------------------


//--------------------------------------------------------------------
// FUNCTION:
//   GridControl
//
// DESCRIPTION:
//   Constructor function
//
// ARGUMENTS:
//   selName - string - the name of the grid control
//   layerObj - DOM object - (optional) the DOM node for the layer
//     in which this control lives
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function GridControl(selName, layerObj)
{
  // properties
  this.selectName  = selName;

  if (layerObj)
  {
    this.object = dwscripts.findDOMObject(selName, layerObj);
  }
  else
  {
    this.object = dwscripts.findDOMObject(selName);
  }
  
  this.list = new Array();
  this.valueList = new Array();
  this.index = -1;
  this.name = this.object.name;
}

// public methods

GridControl.prototype.setAll         = GridControl_setAll;
GridControl.prototype.getAll         = GridControl_getAll;
GridControl.prototype.setIndex       = GridControl_setIndex; 
GridControl.prototype.getIndex       = GridControl_getIndex;
GridControl.prototype.setColumnNames = GridControl_setColumnNames;
GridControl.prototype.getColumnNames = GridControl_getColumnNames;
GridControl.prototype.append         = GridControl_append;
GridControl.prototype.del            = GridControl_del;
GridControl.prototype.delAll         = GridControl_delAll;
GridControl.prototype.add            = GridControl_add;
GridControl.prototype.moveUp         = GridControl_moveUp;
GridControl.prototype.moveDown       = GridControl_moveDown;

// private methods

GridControl.prototype.extractOptionValueArray = GridControl_extractOptionValueArray;
GridControl.prototype.createOptionString = GridControl_createOptionString;
GridControl.prototype.setOptionsArray = GridControl_setOptionsArray;
GridControl.prototype.escHTMLChars = GridControl_escHTMLChars;
GridControl.prototype.unEscHTMLChars = GridControl_unEscHTMLChars;

// static properties

GridControl.SEPARATOR = ":MM_SEPARATOR:";



//--------------------------------------------------------------------
// FUNCTION:
//   setAll
//
// DESCRIPTION:
//   Sets the contents of the grid control based on the given array.
//
// ARGUMENTS:
//   newDisplayArray - 2D Array -  a two dimensional array of the 
//     display values which should be set within the grid.
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function GridControl_setAll(newDisplayArray)
{
  var strInner = "";
  var i;
  var nItems = newDisplayArray.length;

  for (i=0; i < nItems; i++)
  {
    strInner += this.createOptionString(newDisplayArray[i]);
  }

  this.object.innerHTML = strInner;
}


//--------------------------------------------------------------------
// FUNCTION:
//   getAll
//
// DESCRIPTION:
//   Returns a 2D Array of all of the values stored within the
//   grid control.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   2D Array of strings
//--------------------------------------------------------------------

function GridControl_getAll()
{
  var retVal = new Array();

  // When you get innerHTML here, there are a bunch of
  // spaces and newlines inserted for formatting.
  // Strip this out first
  var controlSrc = this.object.innerHTML;
  controlSrc = controlSrc.replace(/\n/g, "");
  controlSrc = controlSrc.replace(/\r/g, "");
  controlSrc = controlSrc.replace(/ /g, "");
  var lowerStr = String(controlSrc).toLowerCase();

  // now extract the individual options
  var start = 0;
  var end = 0;
    
  while (start < controlSrc.length)
  {
    start = lowerStr.indexOf("<option", start);

    if (start == -1) // no more options found
    {
      break;
    }

    start = lowerStr.indexOf(">", start + 1);

    end = lowerStr.indexOf("</option", start);

    var optionSrc = controlSrc.substring(start + 1, end);

    retVal.push(this.extractOptionValueArray(optionSrc));

    start = end + 9;
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   extractOptionValueArray
//
// DESCRIPTION:
//   This function returns an array of the values contained within
//   the given option source.  The option source is the HTML code for
//   the grid control.
//
// ARGUMENTS:
//   optionSrc - string - the HTML code for the option to extract 
//     values from
//
// RETURNS:
//   Array of strings
//--------------------------------------------------------------------

function GridControl_extractOptionValueArray(optionSrc)
{
  var retVal = new Array();

  optionSrc = String(optionSrc);
  var strLen = optionSrc.length;
  var delimLen = GridControl.SEPARATOR.length;
  var theStr = "";

  var start = 0;

  while (start <= strLen)
  {
    var found = optionSrc.indexOf(GridControl.SEPARATOR, start);

    if (found != -1)
    {
      theStr = optionSrc.substring(start, found);
      theStr = this.unEscHTMLChars(theStr);
      retVal.push(theStr);
      start = found + delimLen;
    }
    else
    {
      theStr = optionSrc.substring(start, strLen);
      theStr = this.unEscHTMLChars(theStr);
      retVal.push(theStr);
      start = strLen + 1;
    }
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   setIndex
//
// DESCRIPTION:
//   Sets the selected index for the grid control object
//
// ARGUMENTS:
//   theIndex - integer - the numeric value of the index to select
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function GridControl_setIndex(theIndex)
{
  // if there is a previous selection, setting a new selection selects
  // only the first column of the selected row, which feels awkward,
  // particularly if the user was editing another column
  
  // to select the entire row instead of only the first column, 
  // the method used here is to deselect everything first.
  
  var theOptions = this.object.options;
  var nOptions = theOptions.length;
  
  for (i=0;i<nOptions;i++)
  {
    theOptions[i].removeAttribute("selected");
  }

  this.object.selectedIndex = theIndex;
  this.index = theIndex;
}


//--------------------------------------------------------------------
// FUNCTION:
//   getIndex
//
// DESCRIPTION:
//   Returns the currently selected index
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   integer - the currently selected index
//--------------------------------------------------------------------

function GridControl_getIndex()
{
  this.index = this.object.selectedIndex; //get selection
  return this.index;
}


//--------------------------------------------------------------------
// FUNCTION:
//   setColumnNames
//
// DESCRIPTION:
//   Sets the column titles for the grid control
//
// ARGUMENTS:
//   columnNameList - comma separated string - a comma separated list
//     the column names for the grid control
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function GridControl_setColumnNames(columnNameList)
{
  this.object.columns = columnNameList;
}


//--------------------------------------------------------------------
// FUNCTION:
//   getColumnNames
//
// DESCRIPTION:
//   Returns a comma separated list of the column names
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   comma separated string
//--------------------------------------------------------------------

function GridControl_getColumnNames()
{
  return String(this.object.columns);
}


//--------------------------------------------------------------------
// FUNCTION:
//   append
//
// DESCRIPTION:
//   Adds a new blank option to the end of the control
//
// ARGUMENTS:
//   optionArray - Array of strings - (optional) the values to place
//     in each of the columns of the new option
//
// RETURNS:
//   boolean - true if added, false if not
//--------------------------------------------------------------------

function GridControl_append(optionArray)
{
  var retVal = false;

  var newOptionSrc = "";

  with (this) 
  {
    if (!optionArray)
    {
      var colArray = this.getColumnNames().split(",");

      for (var i=0; i < colArray.length; i++)
      {
        if (i > 0) 
        {
          newItemStr += GridControl.SEPARATOR;
        }
      }
    }
    else
    {
      for (var i=0; i < optionArray.length; i++)
      {
        if (i > 0)
        {
          newOptionSrc += GridControl.SEPARATOR
        }

        newOptionSrc += this.escHTMLChars(optionArray[i]);
      }
    }
 
    object.innerHTML += "<option>" + newOptionSrc + "</option>";
    
    this.setIndex(object.options.length - 1);

    retVal = true;

  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   del
//
// DESCRIPTION:
//   Deletes the currently selected item, and selects the one 
//   that followed it.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------


function GridControl_del()
{
  var retVal = true;
    
  var theSrc = this.object.innerHTML;
  var selInd = this.getIndex();
  var nOptions = this.object.options.length;
  

  if (selInd >= 0)
  {
    var optionStart = -1;
    var optionEnd = -1;

    for (var i=0; i < this.index + 1; i++)
    {
      optionStart = theSrc.indexOf("<option", optionStart + 1)
      optionEnd = theSrc.indexOf("</option>", optionEnd + 1)
    } 
    optionEnd += 9

    var newSrc = theSrc.substring(0, optionStart) + 
                 theSrc.substring(optionEnd, theSrc.length);

    this.object.innerHTML = newSrc;

    if (selInd == (nOptions-1))
    {
      this.setIndex(nOptions-2)
    }
    else
    {
      this.setIndex(selInd);
    }
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   delAll
//
// DESCRIPTION:
//   Removes all options from the grid control
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function GridControl_delAll()
{
  this.object.innerHTML = ""

}


//--------------------------------------------------------------------
// FUNCTION:
//   escHTMLChars
//
// DESCRIPTION:
//   <description>
//
// ARGUMENTS:
//   theStr - a string
//
// RETURNS:
//   theStr with escaped characters
//--------------------------------------------------------------------

function GridControl_escHTMLChars(theStr) 
{
  theStr = theStr.replace(/&/g,"&amp;"); // always do this one first
  theStr = theStr.replace(/</g,"&lt;");
  theStr = theStr.replace(/>/g,"&gt;");
  theStr = theStr.replace(/"/g,"&quot;");
  theStr = theStr.replace(/ /g,"MM_SPACECHAR");

  return theStr;
}


//--------------------------------------------------------------------
// FUNCTION:
//   unEscHTMLChars
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

function GridControl_unEscHTMLChars(theStr) 
{
  
  theStr = theStr.replace(/&lt;/g,"<");
  theStr = theStr.replace(/&gt;/g,">");
  theStr = theStr.replace(/&quot;/g,"\"");
  theStr = theStr.replace(/MM_SPACECHAR/g," ");
  theStr = theStr.replace(/&amp;/g,"&");  // always do this one last

  return theStr;
}



//--------------------------------------------------------------------
// FUNCTION:
//   add
//
// DESCRIPTION:
//   adds an item. adds the item at the selected index if there is one, otherwise
//   adds an item to the end of the list
//
// ARGUMENTS:
//   colArr - an array that contains the values for the different columns
//
// RETURNS:
//   <type and description>
//--------------------------------------------------------------------


function GridControl_add(colArr) 
{
  if (!colArr) return; // currently only written to handle new item with content
  
  var newOptionStr = this.createOptionString(colArr); // option string to add
  var theOptions = this.object.options;
  var nOptions = theOptions.length;
  var selInd = this.getIndex();
  var nOptions = this.object.options.length;
  var i;
  var optionStrArr = new Array();

  for (i=0;i<nOptions;i++)
  {
    optionStrArr.push(theOptions[i].outerHTML);
  }
  
  if (selInd == (nOptions-1))
  {
    optionStrArr.push(newOptionStr);
  }
  else
  {
    var tempArr = optionStrArr.slice(0,selInd+1);
    tempArr.push(newOptionStr);
    optionStrArr = tempArr.concat(optionStrArr.slice(selInd+1));
  }
    
  this.object.innerHTML = optionStrArr.join("\n");
  this.setIndex(selInd + 1);
}



//--------------------------------------------------------------------
// FUNCTION:
//   moveUp
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
function GridControl_moveUp() 
{
  var selInd = this.getIndex();
  var nItems = this.object.options.length;
  var theOptions = this.object.options;
  
  if (selInd == 0) return; // return if first option is selected.
  
  if (selInd != -1)
  {    
    var tempItem = "";
    var theOptions = this.object.options;
    var moveToInd = selInd - 1;
    var moveFromInd = selInd;
    
    tempItem = theOptions[moveToInd].text;
    theOptions[moveToInd].text = theOptions[moveFromInd].text;
    theOptions[moveFromInd].text = tempItem;    
  }

  this.setIndex(moveToInd);
}

//--------------------------------------------------------------------
// FUNCTION:
//   moveDown
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
function GridControl_moveDown() 
{
  var selInd = this.getIndex(); 
  var nItems = this.object.options.length;
  var theOptions = this.object.options;
  
  if (selInd == (nItems-1)) return; // return if last option is selected.
  
  if (selInd != -1)
  {
    var tempArr = this.object.options;
    var tempItem = "";
    var moveToInd = selInd + 1
    var moveFromInd = selInd;
      
    tempItem = theOptions[moveToInd].text;
    theOptions[moveToInd].text = theOptions[moveFromInd].text;
    theOptions[moveFromInd].text = tempItem; 
  } 
  
  this.setIndex(moveToInd);

}

//--------------------------------------------------------------------
// FUNCTION:
//   setOptionsArray
//
// DESCRIPTION:
//   resets the options array
// ARGUMENTS:
//   newOptionsArr -- an array of strings representing options
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function GridControl_setOptionsArray (newOptionsArr)
{
  var gridContents = newOptionsArr.join("\n");
  this.object.innerHTML = gridContents;
}


//--------------------------------------------------------------------
// FUNCTION:
//   createOptionString
//
// DESCRIPTION:
//   Given a single dimensional array, creates the option string
//
// ARGUMENTS:
//   optionValArr - the value of the columns
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function GridControl_createOptionString(optionValArr)
{
  
   var optionStr = ""; 
   var nItems = optionValArr.length;
   
   for (i=0;i<nItems;i++)
   {
     if (i>0)
     {
       optionStr += GridControl.SEPARATOR;
     }
     
     optionStr += this.escHTMLChars(optionValArr[i]);
   }
   
   return "<option>" + optionStr + "</option>";
}

