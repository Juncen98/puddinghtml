// Copyright 2000, 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

/* ----------------------------------------------------------------------*/
//Shortcut List Class

// This class represents an xml file used to store a set of shortcut keys.
// This class uses the file class
// The paths are represented by URL's for cross platform compatibility.
// example path = file:///C|/Program Files/Dreamweaver 3/Configuration/Menus/Custom Sets/test set.xml

//INTERFACE
//
//Shortcut List methods:
//  readFromShortcutXML(theURL)
//  writeToShortcutXML(theURL)
//  getKeyByID(id)
//  writeToMenusXML
//  locateById
//  changeById
//  addShortcut
//  deleteShortcut


//Constructor function
//
function ShortcutList()
{
  // properties
  this.shortcutListName = "";
  this.idKeyPairList = new Array(); // Array of objects with two properties = .id and .keysArray
  this.changeList = new Object();

  // initialization
  // this.readFromShortcutXM(theURL);
}

// static properties
ShortcutList.SHORTCUTLIST_TAG = 'SHORTCUTSET';
ShortcutList.SHORTCUT_TAG = 'SHORTCUT';

// static methods


// methods
ShortcutList.prototype.readFromShortcutXML = ShortcutList_readFromShortcutXML;
ShortcutList.prototype.writeToShortcutXML = ShortcutList_writeToShortcutXML;
ShortcutList.prototype.getKeyByID = ShortcutList_getKeyByID;
ShortcutList.prototype.getIdByKey = ShortcutList_getIdByKey;
ShortcutList.prototype.addShortcut = ShortcutList_addShortcut;
//ShortcutList.prototype.compare = ShortcutList_compare;
ShortcutList.prototype.getIndexByID = ShortcutList_getIndexByID;
ShortcutList.prototype.del = ShortcutList_del;
ShortcutList.prototype.update = ShortcutList_update;
ShortcutList.prototype.compareUpdate = ShortcutList_compareUpdate;
ShortcutList.prototype.clearShortcutList = ShortcutList_clearShortcutList;
ShortcutList.prototype.length = ShortcutList_length;
ShortcutList.prototype.changeListLength = ShortcutList_changeListLength;

// reads in the data from a shortcuts.xml file to generate a shortcut list.
function ShortcutList_readFromShortcutXML(theURL)
{
  var shortcutDOM, theShortcutSet,i, shortcutFile ;
  shortcutDOM = dreamweaver.getDocumentDOM(theURL);
  theShortcutSet = shortcutDOM.getElementsByTagName(ShortcutList.SHORTCUTLIST_TAG);
  this.clearShortcutList();
  this.shortcutListName = shortcutDOM.getElementsByTagName('SHORTCUTSET')[0].getAttribute('name');
  theShortcuts = theShortcutSet[0].getElementsByTagName(ShortcutList.SHORTCUT_TAG);
  for (i=0;i<theShortcuts.length;i++)
  {
    this.addShortcut(theShortcuts[i].getAttribute("ID"), theShortcuts[i].getAttribute("keys"));
  }
}

// writes out data to shortcuts.xml file from shortcut list (blows away old file). Returns true if successfull
function ShortcutList_writeToShortcutXML(theURL,listName)
{
  var theContents = new Array(), tempStr = "", retVal;
  var shortcutSetFile, i;
  if (getExtension(theURL) !="xml")
    theURL += ".xml";
  this.shortcutListName = listName;
  theContents.push('<' + ShortcutList.SHORTCUTLIST_TAG + ' name="' + this.shortcutListName + '">\n');
  for(i=0;i<this.idKeyPairList.length;i++)
  {
    tempStr = '  ' + '<' + ShortcutList.SHORTCUT_TAG + ' ID="' + this.idKeyPairList[i].id;
	tempStr += '"  keys="' + this.idKeyPairList[i].keysArray.join(",") + '"/>\n';
	theContents.push(tempStr);
  }
  theContents.push('</' +ShortcutList.SHORTCUTLIST_TAG + '>' );
  shortcutSetFile = new File(theURL);
  retVal = shortcutSetFile.setContents(theContents.join(""));
  return retVal;
}

// Returns the key(s) for a given id. If the id doesn't exist, returns ""
function ShortcutList_getKeyByID(id)
{
  var returnKey="", i;
  for(i=0;i<this.idKeyPairList.length;i++)
  {
    if (this.idKeyPairList[i].id == id)
    {
      returnKey = this.idKeyPairList[i].keysArray.join(",");
	  break
	}
  }
  return returnKey;
}


function ShortcutList_addShortcut(id, keyStr)
{
  var tempObj = new Object();
  tempObj.id = id;
  tempObj.keysArray = (keyStr) ? keyStr.split(",") : new Array();
  this.idKeyPairList.push(tempObj);
}

// takes in two ShortcutLists and compares them. Returns true if
/*function ShortcutList_compare(shortcutListA)
{
  var retVal = true, i;
  if (this.idKeyPairList.length == shortcutListA.idList.length)
  {
    for (i=0;(i<this.idKeyPairList.length) && (retVal==true); i++)
	{
	  index = shortcutListA.getIndexByID(this.idList[i])
	  if (this.idKeyPairList[i].keys != shortcutListA.idKeyPairList[index].keys)
	    retVal = false;
	}
  }
  else
    retVal = false;
  return retVal;
}
*/
function idOrder (a,b)
{
  if (a.id == b.id)
    return 0;
  else if (a.id > b.id)
    return 1;
  else
    return -1;
}

function ShortcutList_compare(shortcutListA)
{
  var retVal = true;
  if (shortcutListA.idKeyPairList.length == this.idKeyPairList.length)
  {
    shortcutListA.idKeyPairList.sort(idOrder);
    this.idKeyPairList.sort(idOrder);
    for (var i=0; i<this.idKeyPairList.length; i++)
	{
	  if (shortcutListA.idKeyPairList[i].id != this.idKeyPairList[i].id)
	  {
	    retVal=false;
		break;
	  }
	}
  }
  else
    retVal = false;
  return retVal;
}

function ShortcutList_getIndexByID(id)
{
  var i, found = false;
  for (i=0;(i < this.idKeyPairList.length) && !found; i++)
  {
    if (this.idKeyPairList[i].id == id)
	{
	  found=true;
	  break;
	}
  }
  return (found)? (i):-1;
}

// returns the number of changes made to the shortcut list
function ShortcutList_update(id, newKey, oldKey)
{
  var i, retVal=0, indexOldKey, idFound=false, theId;
  for (i=0;i<this.idKeyPairList.length;i++)
  {
    theId = this.idKeyPairList[i].id;
    if (theId == id)
    {
      indexOldKey = getKeyIndex(this.idKeyPairList[i].keysArray, oldKey);
      if (indexOldKey == -1 && PLATFORM == "Win32")
      {
        if (oldKey.indexOf("Cmd") != -1)
           oldKey = oldKey.replace(/Cmd/,"Ctrl");       
        indexOldKey = getKeyIndex(this.idKeyPairList[i].keysArray, oldKey);
      }
      if (theId == id)
		idFound=true;
      if (indexOldKey == -1 && newKey)
		this.idKeyPairList[i].keysArray.push(newKey);
      else if (newKey && indexOldKey != -1)
		this.idKeyPairList[i].keysArray[indexOldKey] = newKey;
      else if (indexOldKey != -1)
		this.idKeyPairList[i].keysArray.splice(indexOldKey,1);
	
      this.changeList[theId] = true;
      retVal++;
    }
  }
//  if (!idFound && newKey) removing the check for new key so that updates are made for snippet shortcuts when deleting keys
  if (!idFound)
  {
    this.addShortcut(id, newKey);
    this.changeList[id] = true;
	retVal++;
  }
  return retVal;
}


function ShortcutList_del(id)
{
  var index;
  index = this.getIndexByID(id);
  this.idKeyPairList.splice(index,1);
}

function ShortcutList_clearShortcutList()
{
  this.shortcutListName ="";
  this.idKeyPairList = new Array();
}

function ShortcutList_getIdByKey(theKey)
{
  var i,x, retVal="", found = false;
  for (i=0;i<this.idKeyPairList.length && !found;i++)
  {
    if (this.idKeyPairList[i].keysArray[0])
	{
	  for (x=0; x<this.idKeyPairList[i].keysArray.length; x++)
	  {
	    if (this.idKeyPairList[i].keysArray[x] == theKey)
		{
		  retVal = this.idKeyPairList[i].id;
		  found = true;
		  break;
		}
	  }
	}
  }
  return retVal;
}

function ShortcutList_compareUpdate(shortcutListA){
  var index, newKeys, oldKeys;
  this.shortcutListName = shortcutListA.shortcutListName
  for (var i=0; i<shortcutListA.length(); i++){
    index = this.getIndexByID(shortcutListA.idKeyPairList[i].id);
    if (index != -1){
      oldKeys = this.idKeyPairList[index].keysArray;
      newKeys = shortcutListA.idKeyPairList[i].keysArray;
      if (oldKeys.toString() != newKeys.toString()){
        this.idKeyPairList[index].keysArray = shortcutListA.idKeyPairList[i].keysArray;
        this.changeList[shortcutListA.idKeyPairList[i].id] = true;
      }
    }
    else if (shortcutListA.idKeyPairList[i].id.indexOf("Snippets") == 0) {
      // Found a new snippet shortcut that is not in this set yet, So add a new entry.
      this.addShortcut(shortcutListA.idKeyPairList[i].id, shortcutListA.idKeyPairList[i].keysArray.join(","));
      this.changeList[shortcutListA.idKeyPairList[i].id] = true;
    }
  }
  
  // Update snippet shortcuts already in this set but not in the new set by clearing their keys array.
  for (var i=0; i<this.length(); i++){
    if (this.idKeyPairList[i].id.indexOf("Snippets") == 0) {
      index = shortcutListA.getIndexByID(this.idKeyPairList[i].id);
      if (index == -1){  // not found in the new set
        this.idKeyPairList[i].keysArray = new Array();  // clear the shortcut keys array
        this.changeList[this.idKeyPairList[i].id] = true;
      }
    }
  }
}


function getExtension(fileName)
{
  var retVal = "", index;

  index = fileName.lastIndexOf(".");
  if (index != -1)
    retVal = fileName.substring(index+1);
  return retVal;
}

function getSimpleName(fileName)
{
  var index; retVal = fileName;

  index = fileName.lastIndexOf(".");
  if (index != -1)
    retVal = fileName.substring(0,index);
  return retVal;
}

// returns -1 if the key is not in the array
function getKeyIndex(theKeyArray, theKey)
{
  var i, retVal=-1;
  if (theKeyArray)
  {
    for (i=0;i<theKeyArray.length;i++)
    {
      if (theKeyArray[i]==theKey)
	  {
	    retVal=i;
	    break;
	  }
    }
  }
  return retVal;
}

function ShortcutList_length()
{
  return this.idKeyPairList.length
}

function ShortcutList_changeListLength()
{
  var retVal = 0;
  for(var i in this.changeList)
    retVal++;
  return retVal;
}
