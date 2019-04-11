//SHARE-IN-MEMORY=true
// Copyright 1998, 1999, 2000, 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.


//--------------------------------------------------------------------
// CLASS:
//   ListControl
//
// DESCRIPTION:
//
//   !!! IMPORTANT !!! THIS CONTROL ONLY WORKS WITHIN DREAMWEAVER !!!
// 
//   This control manages a SELECT control.
// 
//   To define a new ListControl, create a global variable and define it after onLoad:
//     MYLIST = new ListControl(selectName);
// 
//   The layerObj parameter is optional.  If specified, that layer will be searched
//    for the select list named selectName.
// 
//   Thereafter, you can call methods and get properties, for example:
//     MYLIST.add("newItem");    MYLIST.get();   length = MYLIST.getLen;
//
//   Limitations:
//     Does not manage multiple selections.
// 
//
// PUBLIC PROPERTIES:
//
//   selectName - the name of the select list
//   object - the DOM object for this list control
//
//
// PUBLIC FUNCTIONS:
//
//   init()  - set the entire list to the current HTML text and values
//
//   setAll(list, valueList)  - set the entire list at once
//
//   pickValue(theValue)  - set the selection to the item with the given value
//   pick(theLabel)       - set the selection to the item with the given label
//
//   get()       - return the current selection text
//   get(n)      - return text item n (starts at zero)
//   get('all')  - return array of all text items
//
//   getValue()            - return the current selection value
//   getValue(n)           - return value item n (starts at zero)
//   getValue('all')       - return array of all value items
//   getValue('multiple')  - return array of all selected value items
//
//   getIndex()  - returns the selected index.
//
//   setIndex(theIndex)  - sets the selection to the given index
//
//   getLen()  - returns the list length
//
//   enable()   - enables control if not already enabled
//   disable()  - disables control if not already disabled
//
//   set('text')     - set the text of the current selection
//   set('text', n)  - set the text of the nth item
//
//   setValue(value)     - set the value of the current selection
//   setValue(value, n)  - set the value of the nth item
//
//   add()                 - add a new blank line after the selected line.
//   add('default')        - add text
//   add('default',value)  -  add text and an associated value
//
//   append()                 - append a new blank line to the end of the list
//   append('default')        - append default text
//   append('default',value)  - append text and an associated value
//
//   prepend()                 - prepend a new blank line to the start of the list
//   prepend('default')        - prepend default text
//   prepend('default',value)  - prepend text and an associated value
//
//   del()  - delete the selected line(s)
//
//   refresh()  - captures the current selection
//
//   focus()  - sets focus to the list object
//
//--------------------------------------------------------------------

function ListControl(selName, layerObj, loadFromHTML) 
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

  if (!this.object)
  {
    throw dwscripts.sprintf(MM.MSG_unknownNodeObject, selName);
  }
    
  this.list = new Array();
  this.valueList = new Array();
  this.index = -1;
  
  //  Load existing list names and values if they exist.
  if (loadFromHTML) 
  {
    this.init();
  }
}


// Public methods

ListControl.prototype.init      = ListControl_init;
ListControl.prototype.setAll    = ListControl_setAll;
ListControl.prototype.pickValue = ListControl_pickValue;
ListControl.prototype.pick      = ListControl_pick;
ListControl.prototype.get       = ListControl_get;
ListControl.prototype.getValue  = ListControl_getValue;
ListControl.prototype.getIndex  = ListControl_getIndex;
ListControl.prototype.setIndex  = ListControl_setIndex;
ListControl.prototype.getLen    = ListControl_getLen;
ListControl.prototype.enable    = ListControl_enable;
ListControl.prototype.disable   = ListControl_disable;
ListControl.prototype.set       = ListControl_set;
ListControl.prototype.setValue  = ListControl_setValue;
ListControl.prototype.add       = ListControl_add;
ListControl.prototype.append    = ListControl_append;
ListControl.prototype.prepend    = ListControl_prepend;
ListControl.prototype.del       = ListControl_del;
ListControl.prototype.refresh   = ListControl_refresh;
ListControl.prototype.focus     = ListControl_focus;
ListControl.prototype.isEditable = ListControl_isEditable;

// Private methods

ListControl.prototype.updateContents = ListControl_updateContents;



//--------------------------------------------------------------------
// FUNCTION:
//   ListControl_init
//
// DESCRIPTION:
//   Sets the list to the current values
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function ListControl_init()
{
  var retVal = false;
  
  with (this) 
  {
    index = object.selectedIndex; // set the index value
    
    list = new Array();
    valueList = new Array();
    for (i=0; i < object.options.length; i++)
    {
      list[i] = object.options[i].text;
      valueList[i] = (object.options[i].value) ? object.options[i].value : '';
    }
    retVal = true;
  }
  
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   ListControl_setAll
//
// DESCRIPTION:
//   Sets the entire list to the contents of newList, expanding the list
//    as necessary
//
// ARGUMENTS:
//   newDisplayList - JavaScript array of strings - an array of string
//     values to display within the select list.
//   newValueList - JavaScript array of anything - an array of values
//     to store parallel to the display values.  This allows more
//     complex information to be stored with each of the display values.
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function ListControl_setAll(newDisplayList, newValueList)
{
  var retVal = false;
  
  with (this) 
  {
    index = object.selectedIndex; // get prior selection

	// -1 is a legal selection for editable comboboxes.
    if (((!this.object.editable || this.object.editable != "true") && index < 0) || newDisplayList.length <= index)
    {
      index = 0; // if outta range
    }
    
    list = new Array();
    valueList = new Array();
    for (i=0; i < newDisplayList.length; i++) 
    {
      list[i] = newDisplayList[i]; // dupe array
      valueList[i] = (newValueList && newValueList.length > i) ? newValueList[i] : '';
    }
    
    updateContents();
    object.selectedIndex = index;
    retVal = true;
  }
  
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   ListControl_pick
//
// DESCRIPTION:
//   set the selection to the item with the given label
//
// ARGUMENTS:
//   theLabel - anything - the value to compare against the stored labels
//     to determine which item to select.
//   optionalMatchFn - function object - an optional parameter which
//     can be specified to determine how the values should be compared
//	optionalSetOptionSelected - bool - also added the selected atribute to the
//		option instead of the selectedIndex, useful for setting multiple selections
//
// RETURNS:
//   boolean - returns true if a match was found
//--------------------------------------------------------------------

function ListControl_pick(theLabel, optionalMatchFn, optionalSetOptionSelected)
{
  var retVal = false; 
  var foundIndex = dwscripts.findInArray(this.list, theLabel, optionalMatchFn);
 
  if (foundIndex != -1)
  {
    if( optionalSetOptionSelected && foundIndex < this.object.options.length){
		this.object.options[foundIndex].selected = "true";
	}
	else {
      	this.object.selectedIndex = foundIndex;
	}
    this.index = foundIndex;
    //wmc - just selecting is not enough for an editable, need to set the text region.
    if ((this.object.editable) && (this.object.editable == "true"))
    {
      this.object.editText = this.get(foundIndex);
    }
    retVal = true;
  }
  else if ((this.object.editable) && (this.object.editable == "true"))
  { //add functionality to work with editable dropdowns
    this.object.selectedIndex = -1;
    index = -1;
    
    if (!theLabel)
    {
      this.object.editText = "";
    }
    else if (theLabel != this.object.editText)
    {
      this.object.editText = theLabel;
    } 
    retVal = true;
  }
  
  return retVal
}


//--------------------------------------------------------------------
// FUNCTION:
//   ListControl_pickValue
//
// DESCRIPTION:
//   Sets the list selection to the given index
//
// ARGUMENTS:
//   theValue - anything - the value to compare against the stored values
//     to determine which item to select.
//   optionalMatchFn - function object - an optional parameter which
//     can be specified to determine how the values should be compared
//	optionalSetOptionSelected - bool - also added the selected atribute to the
//		option instead of the selectedIndex, useful for setting multiple selections
//
// RETURNS:
//   boolean - returns true if a match was found
//--------------------------------------------------------------------

function ListControl_pickValue(theValue, optionalMatchFn, optionalSetOptionSelected)
{
  var retVal = false; 
  with (this) 
  {
    var foundIndex = dwscripts.findInArray(valueList, theValue, optionalMatchFn);
   
    if (foundIndex != -1)
    {
	  if( optionalSetOptionSelected && foundIndex < object.options.length){
	  	object.options[foundIndex].selected = true;
	  }
	  else {
      	object.selectedIndex = foundIndex;
	  }
      index = foundIndex;
	 
      //wmc - just selecting is not enough for an editable, need to set the text region.
      if ((object.editable) && (object.editable == "true"))
          object.editText = getValue(foundIndex);
        retVal = true;
    }
    else if ((object.editable) && (object.editable == "true"))
    { //add functionality to work with editable dropdowns
      object.selectedIndex = -1;
      index = -1;

      if (!theValue)
      {
       object.editText = "";
      } 
      else if (theValue != object.editText)
      {
       object.editText = theValue;
      }

      retVal = true;
    }
  }
  
  return retVal
}


//--------------------------------------------------------------------
// FUNCTION:
//   ListControl_get
//
// DESCRIPTION:
//   If no arguments are specified, returns the display value of 
//     the currently selected item.
//   If an index is specfied, returns the display value of that index.
//   If "all" is specified, returns an array of all the display values.
//   If "multiple" is specified, returns an array of the selected 
//     display values.
//
// ARGUMENTS:
//   optionalIndex - optional parameter, which can specify the index
//     of the item to return, the string "all", or the string "multiple"
//
// RETURNS:
//   string or array of strings - the display value
//--------------------------------------------------------------------

function ListControl_get(optionalIndex)
{
  var retVal = "";  // return blank if all else fails
  
  with (this) 
  {
    index = object.selectedIndex; // get prior selection
    
    if (optionalIndex == null && index > -1)
    {
      retVal = list[index];
    }    
  else if (optionalIndex == null && index == -1) 
  { //for editable dropdowns...
     retVal = object.editText;
  }
    else if (optionalIndex == "all")
    {
      retVal = list;
    }
    else if (optionalIndex == "multiple")
    {
      retVal = new Array();
      for (var i = 0; i < object.options.length; i++)
      {
        if (object.options[i].selected)
        {
          retVal.push(list[i]);
        }
      }
    }
    else if (optionalIndex > -1)
    {
      retVal = list[optionalIndex];
    }
  }
  
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   ListControl_getValue
//
// DESCRIPTION:
//   If no arguments are specified, returns the value of 
//     the currently selected item.
//   If an index is specfied, returns the value of that index.
//   If "all" is specified, returns an array of all the values.
//   If "multiple" is specified, returns an array of the selected 
//     values.
//
// ARGUMENTS:
//   optionalIndex - optional parameter, which can specify the index
//     of the item to return, the string "all", or the string "multiple"
//
//
// RETURNS:
//   <type and description>
//--------------------------------------------------------------------

function ListControl_getValue(optionalIndex)
{
  var retVal = "";  // return blank if all else fails
  
  with (this) 
  {
    index = object.selectedIndex; // get prior selection
    
    if (optionalIndex == null && index > -1)
    {
      retVal = valueList[index];
    }
  else if (optionalIndex == null && index == -1) 
  { //for editable dropdowns...
     retVal = object.editText;
  }
    else if (optionalIndex == "all")
    {
      retVal = valueList;
    }
    else if (optionalIndex == "multiple")
    {
      retVal = new Array();
      for (var i = 0; i < this.object.options.length; i++)
      {
        if (this.object.options[i].selected)
        {
          retVal.push(valueList[i]);
        }
      }
    }
    else if (optionalIndex > -1)
    {
      retVal = valueList[optionalIndex];
  }
  }
  
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   ListControl_getIndex
//
// DESCRIPTION:
//   Gets the list selection
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   integer - currently selected index
//--------------------------------------------------------------------

function ListControl_getIndex()
{
  this.index = this.object.selectedIndex; // get prior selection
  return this.index;
}


//--------------------------------------------------------------------
// FUNCTION:
//   ListControl_setIndex
//
// DESCRIPTION:
//   Sets the list selection to the given index
//
// ARGUMENTS:
//   theIndex - integer - the index to select within the list (zero based)
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function ListControl_setIndex(theIndex){
  var retVal = false;
  with (this){
    if (theIndex >= 0 && theIndex < list.length){  // if theIndex is between 0 and length
      object.selectedIndex = theIndex;
      index = theIndex;
      //wmc - just selecting is not enough for an editable, need to set the text region.
      if ((object.editable) && (object.editable == "true")){
        object.editText = get(index);
      }
      retVal = true;
    }else if ((object.editable) && (object.editable == "true")){ //must handle editable dropdowns
      object.selectedIndex = -1;
      index = -1;
      retVal = true;
    }
  }
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   ListControl_getLen
//
// DESCRIPTION:
//   Returns the length of the current list
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   integer - number of items displayed within the list
//--------------------------------------------------------------------

function ListControl_getLen()
{
  this.index = this.object.selectedIndex; // get prior selection
  return this.list.length
}


//--------------------------------------------------------------------
// FUNCTION:
//   ListControl_enable
//
// DESCRIPTION:
//   Enables the list control
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function ListControl_enable(enable)
{
  if ((enable != null) && !enable)
  {
    this.object.setAttribute("disabled", "true");
  }
  else
  {
    this.object.removeAttribute("disabled");
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   ListControl_disable
//
// DESCRIPTION:
//   Disables the list control
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function ListControl_disable()
{
  this.object.setAttribute("disabled","true");
}


//--------------------------------------------------------------------
// FUNCTION:
//   ListControl_set
//
// DESCRIPTION:
//   Replaces the list selection with the given value.
//
// ARGUMENTS:
//   newItemStr - string - the new display string
//   optionalIndex - integer - optional index of the item to set the
//     display string for.
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function ListControl_set(newItemStr, optionalIndex) 
{
  var retVal = false;
  
  with (this) 
  {
    index = object.selectedIndex;
    
    if (optionalIndex == null)
    {
      optionalIndex = index; // if not passed in, use selection
    }
    
    if (optionalIndex >= 0 && optionalIndex < list.length)   //  if selection in range
    {
      if (list[optionalIndex] != newItemStr)   // if text has been changed
      {
        list[optionalIndex] = newItemStr;  // replace text
        object.options[optionalIndex].text = newItemStr;
    //wmc - just selecting is not enough for an editable, need to set the text region.
    if ((object.editable) && (object.editable == "true"))
        object.editText = newItemStr;
      }
      retVal = true;
    }
  else //must handle settign editable text
  {
    if ((optionalIndex == -1) && //wmc - just selecting is not enough for an editable, need to set the text region.
       (object.editable) && (object.editable == "true"))
     {
      object.selectedIndex = -1;
      index = -1;
        object.editText = newItemStr;
      }
  }
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   ListControl_setValue
//
// DESCRIPTION:
//   Replaces the value list selection with the given value.
//
// ARGUMENTS:
//   newValue - anything - the new value to set
//   optionalIndex - integer - optional index of the item to set the
//     value for.
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function ListControl_setValue(newValue, optionalIndex)
{
  var retVal = false;
  
  with (this)
  {
    index = object.selectedIndex;
    if (optionalIndex == null)
    {
      optionalIndex = index; // if not passed in, use selection
    }
    
    if (optionalIndex >= 0 && optionalIndex < valueList.length)   //  if selection in range
    {
      if (valueList[optionalIndex] != newValue)  // if text has been changed
      {
        valueList[optionalIndex] = newValue;
        object.options[optionalIndex].value = newValue;
      }
      retVal = true;
    }
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   ListControl_add
//
// DESCRIPTION:
//   Adds a new, blank item after the currently selected item (or end of list).
//   If there is no selection, it replaces the first item.
//
// ARGUMENTS:
//   newItemStr - string - the new display string to add
//   newValue - anything - the new value to add
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function ListControl_add(newItemStr, newValue)
{
  var retVal = false;
  
  with (this) 
  {
    if (!newItemStr)
    {
      newItemStr = "";  // if no newItemStr, make it blank
    }
    
    if (!newValue)
    {
      newValue = "";
    }
    
    index = object.selectedIndex;
    
    if (index >= 0 || list.length == 0)   // if there is a selection or no list
    {
      index++;
      list.splice(index, 0, newItemStr);
      valueList.splice(index, 0, newValue);
      updateContents();
      object.selectedIndex =  index;
      retVal = true;
    }
  else if (object.editable == "true")
  { //editable dropdown when edit text area is selected.
    index = list.length; //make new item the last item in the list
    list.splice(index, 0, newItemStr);
      valueList.splice(index, 0, newValue);
      updateContents();
      object.selectedIndex =  index;
      retVal = true;
  }
  }

  return retVal
}


//--------------------------------------------------------------------
// FUNCTION:
//   ListControl_append
//
// DESCRIPTION:
//   Append a new, blank item to the end of the list.
//   If there is no selection, it replaces the first item.
//
// ARGUMENTS:
//   newItemStr - string - the new display string to append
//   newValue - anything - the new value to append
//
// RETURNS:
//   <type and description>
//--------------------------------------------------------------------

function ListControl_append(newItemStr, newValue)
{
  var retVal = false;
  
  with (this) 
  {
    if (!newItemStr)
    {
      newItemStr = "";  // if no newItemStr, make it blank
    }
    
    if (!newValue)
    {
      newValue = "";
    }
    
    index = list.length;
    list[index] = newItemStr;
    valueList[index] = newValue;
    updateContents();
    object.selectedIndex = index;
    retVal = true;
  }
  
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   ListControl_prepend
//
// DESCRIPTION:
//   Prepend a new, blank item to the start of the list.
//   If there is no selection, it replaces the first item.
//
// ARGUMENTS:
//   newItemStr - string - the new display string to prepend
//   newValue - anything - the new value to prepend
//
// RETURNS:
//   <type and description>
//--------------------------------------------------------------------

function ListControl_prepend(newItemStr, newValue)
{
  var retVal = false;
  
  with (this) 
  {
    if (!newItemStr)
    {
      newItemStr = "";  // if no newItemStr, make it blank
    }
    
    if (!newValue)
    {
      newValue = "";
    }
    
    list.unshift( newItemStr );
    valueList.unshift( newValue );
    updateContents();
	if( object.selectedIndex >= 0 )
		object.selectedIndex++;
    retVal = true;
  }
  
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   ListControl_del
//
// DESCRIPTION:
//   Deletes the currently selected item, and selects the one that followed it.
//   Exception: If the list is a multiple list and more than one item is 
//   selected, re-sets the selected index to be the first item
//   
// ARGUMENTS:
//   optionalIndex - integer - optional parameter to indicate which
//     item to delete.
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function ListControl_del(optionalIndex) 
{
  var retVal = false;
  var nDeleted = 0;
  var nItems = this.getLen();
  
  with (this) 
  {
    index = object.selectedIndex; // get prior selection

    if (!optionalIndex) // if using selection
    {
      var optionsArr = object.options;
      var i;
      
      for (i=nItems-1;i>=0;i--)
      {
        if (optionsArr[i].selected == true)
        {
          nDeleted++;
          list.splice(i,1);
          valueList.splice(i,1);
        }
      }
    }
    else if (optionalIndex >= 0 && optionalIndex < list.length) // if using argument
    {
      index = optionalIndex;
      nDeleted = 1;
      list.splice(index,1);
      valueList.splice(index,1);
    }
    
    // repopulate contents
    if (nDeleted > 0)
    {
      updateContents();
      retVal = true;
    }
    
    // re-set selection
    if (nDeleted == 1) // if one item was deleted
    {
      // set selection to previous selection or to last item
      object.selectedIndex = (index ==nItems-1)?--index:index;
    } 
    else if (nDeleted > 1) // if many items were deleted
    {
      // then select first item
      object.selectedIndex = index = 0;
    }
    
  }
  
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   ListControl_refresh
//
// DESCRIPTION:
//   Updates the index stored within the class
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function ListControl_refresh() 
{
  this.index = this.object.selectedIndex; // get prior selection
}


//--------------------------------------------------------------------
// FUNCTION:
//   ListControl_updateContents
//
// DESCRIPTION:
//   Sets the innerHTML of the lsit object based on the values
//   stored in the internal arrays.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function ListControl_updateContents()
{
  var optionArr = new Array();
  
  for (var i=0; i < this.list.length; i++) 
  {
    var listVal = this.list[i];
    if (listVal != "")
		listVal = dwscripts.entityNameEncode(listVal);
	if (this.valueList.length > i)
    {
      var value = this.valueList[i];
      if (value != "")
		value = dwscripts.entityNameEncode(value);
	  optionArr.push("<option" + ' value="' + value + '"' + ">" + listVal + "</option>");
    }
    else
    {
      optionArr.push("<option>" + listVal + "</option>");
    }
  }
  this.object.innerHTML = optionArr.join("");
}


//--------------------------------------------------------------------
// FUNCTION:
//   ListControl_focus
//
// DESCRIPTION:
//   Sets the focus to the list object
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function ListControl_focus(){
  this.object.focus();
}


//--------------------------------------------------------------------
// FUNCTION:
//   ListControl_isEditable
//
// DESCRIPTION:
//   Returns true if the list control is editable
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function ListControl_isEditable()
{
  return (this.object.editable && this.object.editable == "true");
}
