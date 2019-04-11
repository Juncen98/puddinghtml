// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

//*************** GLOBALS  *****************

var helpDoc = MM.HELP_cmdDesignNotes;

var KEY_STATUS = "status";
var KEY_NOTES  = "notes";
var KEY_OPEN   = "showOnOpen";
var PAIR_SEP   = " = ";
var DEFAULT_STATUS = 0;

var T = ''; //TabControl object
var DATA;
var FILE_PTR = 0;

var FILE_IS_WRITEABLE;

//******************* API **********************

function commandButtons(){
  var btns;

  //if launched but not writable, don't show OK button
  if (MMNotes.FileInfo_isWriteable != null && MMNotes.FileInfo_isWriteable == false) {
    btns = new Array(MM.BTN_Cancel, "cancelClicked()", MM.BTN_Help, "displayHelp()");
  } else {
    btns = new Array(MM.BTN_OK,     "okClicked()", MM.BTN_Cancel, "cancelClicked()", MM.BTN_Help, "displayHelp()");
  }
  return btns
}

//***************** LOCAL FUNCTIONS  ******************

function initializeUI() {
  var fullPath, fileName, filePath, origPathLen, result;

  //get selection and path
  var fullPath = MMNotes.FileInfo_filePath; //grab global, set by launcher
  if (fullPath) {
    readMetafile(fullPath);
    if (FILE_PTR) {
      FILE_IS_WRITEABLE = true;
      if (MMNotes.FileInfo_isWriteable != null && MMNotes.FileInfo_isWriteable == false) FILE_IS_WRITEABLE = false;
      fileName = getFileName(fullPath);
      filePath = getFilePathOnly(fullPath);
      origPathLen = filePath.length;
      while (filePath.length > 60){
        filePath = filePath.substring(1);
      }
      if (origPathLen != filePath.length){
        filePath = "..." + filePath;
      }

      var tab0 = findObject("Tab0");
      var tab1 = findObject("Tab1");

      //Use appropriate background & tabs for Mac OS X.
      if (dw.isOSX()) {
        findObject("tabBgWin").src = "../Shared/MM/Images/tabBgOSX435x334.gif";    
        var oldMulti = RegExp.multiline;
        RegExp.multiline = true;
        var pat1 = /tabBg\.gif/;
        tab0.innerHTML = tab0.innerHTML.replace(pat1, "tabBgOSX.gif");
	      tab1.innerHTML = tab1.innerHTML.replace(pat1, "tabBgOSX.gif");
        var pat2 = /tabBgSel\.gif/;
        tab0.innerHTML = tab0.innerHTML.replace(pat2, "tabBgSelOSX.gif");
	      tab1.innerHTML = tab1.innerHTML.replace(pat2, "tabBgSelOSX.gif");
	      RegExp.multiline = oldMulti;
      // Use appropriate background & tabs for WinXP with themes  
      } else if (dw.isXPThemed()) {	
        findObject("tabBgWin").src = "../Shared/MM/Images/tabBgWinXP.gif";
        var oldMulti = RegExp.multiline;
        RegExp.multiline = true;
        var pat1 = /tabBg\.gif/;
        tab0.innerHTML = tab0.innerHTML.replace(pat1, "tabBgXP.gif");
	      tab1.innerHTML = tab1.innerHTML.replace(pat1, "tabBgXP.gif");
        var pat2 = /tabBgSel\.gif/;
        tab0.innerHTML = tab0.innerHTML.replace(pat2, "tabBgSelXP.gif");
	      tab1.innerHTML = tab1.innerHTML.replace(pat2, "tabBgSelXP.gif");
	      RegExp.multiline = oldMulti;
      // Use standard background  
      } else {	
        findObject("tabBgWin").src = "../Shared/MM/Images/tabBgWin.gif";
      }

      //Initialize the TabControl.  (Pass in the prefix used for the tab layers)
      T = new TabControl('Tab');
      //Add tab pages.   (Pass the layer name, and the page object)
      T.addPage('mainLayer', new Pg1(LABEL_BasicInfo,fileName,filePath));
      T.addPage('allLayer', new Pg2(LABEL_AllInfo,fileName,filePath));
      //Initialize and display the tabs.  (Could pass the name of a page to start on)
      T.start();
    }
  } else {
    cancelClicked();
  }
}



function okClicked() {
  T.finish();
  if (FILE_PTR)
  	writeMetafile();
  window.close();

  //update design notes columns in local file list in site window
  if (MMNotes.UpdateSite == true)
	site.refresh("local");
}

function cancelClicked() {
  if (FILE_PTR)
  	MMNotes.close(FILE_PTR);
  window.close();
}

function readMetafile(fullPath) {
  var i, keys, temp;
  FILE_PTR = MMNotes.open(fullPath); //open, or create metafile
  if (FILE_PTR) {
    DATA = new NameValuePair();
    keys = MMNotes.getKeys(FILE_PTR); 
    for (i=0; i<keys.length; i++) {
      temp = MMNotes.get(FILE_PTR,keys[i]);
      DATA.set(keys[i], temp);
  } }
}

function writeMetafile() {
  var i, names, keys, dataToWrite=false;

  //remove old keys
  keys = MMNotes.getKeys(FILE_PTR); 
  for (i=0; i<keys.length; i++) {
    if (DATA.get(keys[i])==null) MMNotes.remove(FILE_PTR,keys[i]); //if not in local list, remove
  }
  MMNotes.remove(FILE_PTR,KEY_STATUS); //clear out the old KEYS
  MMNotes.remove(FILE_PTR,KEY_NOTES);
  MMNotes.remove(FILE_PTR,KEY_OPEN);

  names = DATA.getNames();
  for (i=0; i<names.length; i++)  {  //with each local, non-null key
    MMNotes.set(FILE_PTR,names[i],DATA.get(names[i]));  //set it in the file
  }

  MMNotes.close(FILE_PTR);
}


function getFileName(fullPath) {
  var filePath = MMNotes.localURLToFilePath(fullPath);
  var endPos = filePath.lastIndexOf("\\");
  if (endPos == -1) endPos = filePath.lastIndexOf(":");
  return filePath.substring(endPos+1);
}


function getFilePathOnly(fullPath) {
  var filePath = MMNotes.localURLToFilePath(fullPath);
  var endPos = filePath.lastIndexOf("\\");
  if (endPos == -1) endPos = filePath.lastIndexOf(":");
  return filePath.substring(0,endPos);
}


function makeValidKey(theStr) {
  theStr = theStr.replace(/(\")/g,""); //disallow "
  theStr = theStr.replace(/(\')/g,""); //disallow '
  return theStr;
}

function getSimpleDate() {
  return createDateFromMask(DATE_Mask);
}

//*************** Pg1 Class *****************

function Pg1(theTabLabel, theFileName, theFilePath) {
  this.tabLabel    = theTabLabel;
  this.fileName    = theFileName;
  this.filePath    = theFilePath;

  this.listObj     = new ListControl("statusMenu");
  this.notesObj    = findObject("notesField");
  this.openObj     = findObject("openChbx");
}


//***** methods *****

Pg1.prototype.getTabLabel = Pg1_getTabLabel; //required
Pg1.prototype.canLoad = Pg1_canLoad;
Pg1.prototype.load = Pg1_load;
Pg1.prototype.update = Pg1_update;
Pg1.prototype.unload = Pg1_unload;
Pg1.prototype.drawFilename = Pg1_drawFilename;
Pg1.prototype.drawFilepath = Pg1_drawFilepath;


function Pg1_getTabLabel() {
  return this.tabLabel;
}


//Called to check if a page can be loaded
//
function Pg1_canLoad() {
  this.drawFilename();
  this.drawFilepath();
  return true;
}


//Called when the layer for this page is displayed.
// Use this call to initialize controls.

function Pg1_load() {
  var i;

  with (this) {
    listObj.setAll(STATUS_ITEMS); //load select menu

    //get status
    temp = stripSpaces(DATA.get(KEY_STATUS));
    if (!temp) listObj.setIndex(DEFAULT_STATUS);
    else {
      for (i=0; i<listObj.getLen(); i++) { //look for status in menu
        if (listObj.get(i) == temp) {
          listObj.setIndex(i);
          break;
      } }
      if (i == listObj.getLen()) listObj.append(temp); //if nonexistent, add it
    }

    //get notes
    temp = DATA.get(KEY_NOTES);
    notesObj.value = temp || "";

    //get open flag
    temp = DATA.get(KEY_OPEN);
    if (temp != null) openObj.checked = (temp.toString().toLowerCase() == "true");
  }
}


//Called when another page is about to be shown, or finish() is called on
// the tabControl.  Use this call to perform any finishing tasks.

function Pg1_unload() {
  return true;
}


//Called when one of the page controls calls the tabControl update function.
// Use this call to respond to user input.
function Pg1_update(theItemName) {

  if (FILE_PTR && FILE_IS_WRITEABLE) with (this) {
      if (theItemName == "insertDate") {
        var theDate = getSimpleDate() + ": \n";
        notesObj.value = theDate + notesObj.value;
        DATA.set(KEY_NOTES,notesObj.value || null); //save notes

      } else if (theItemName == "statusMenu") {
        DATA.set(KEY_STATUS,listObj.get() || null); //save status

      } else if (theItemName == "notesField") {
        DATA.set(KEY_NOTES,notesObj.value || null); //save notes

      } else if (theItemName == "openChbx") {
        DATA.set(KEY_OPEN,openObj.checked || null); //save open flag
    }

  } else {
    alert(MSG_ReadOnlyFile);
  }
}

function Pg1_drawFilename() {
  var fNameObj = findObject("fileName1");
  if (fNameObj) {
    fNameObj.innerHTML = this.fileName;
  }
}


function Pg1_drawFilepath() {
  var fPathObj = findObject("filePath1");
  if (fPathObj) {
    fPathObj.innerHTML = this.filePath;
  }
}



//***************** Pg2 Class ******************

function Pg2(theTabLabel, theFileName, theFilePath) {
  this.tabLabel    = theTabLabel;
  this.fileName    = theFileName;
  this.filePath    = theFilePath;

  this.listObj     = new ListControl("allItems");
  this.nameObj     = findObject("itemName")
  this.valueObj    = findObject("itemValue")
  this.keys        = new Array();
}


//***** methods *****

Pg2.prototype.getTabLabel = Pg2_getTabLabel;
Pg2.prototype.canLoad = Pg2_canLoad;
Pg2.prototype.load = Pg2_load;
Pg2.prototype.update = Pg2_update;
Pg2.prototype.unload = Pg2_unload;
Pg2.prototype.drawList = Pg2_drawList;
Pg2.prototype.drawSelection = Pg2_drawSelection;
Pg2.prototype.drawFilename = Pg2_drawFilename;
Pg2.prototype.drawFilepath = Pg2_drawFilepath;



function Pg2_getTabLabel() {
  return this.tabLabel;
}



//Called to check if a page can be loaded
//
function Pg2_canLoad() {
  this.drawFilename();
  this.drawFilepath();
  return true;
}



//Called when the layer for this page is displayed.
// Use this call to initialize controls.
//
function Pg2_load() {
  with (this) {
    drawList();
    listObj.setIndex(0); //select first item
    drawSelection()
  }
}



//Called when another page is about to be shown, or finish() is called on
// the tabControl.  Use this call to perform any finishing tasks.
function Pg2_unload() {
  return true;
}



//Called when one of the page controls calls the tabControl update function.
// Use this call to respond to user input.
function Pg2_update(theItemName) {
  var i, temp, temp2;

  if (theItemName == "allItems") with (this) {
    drawSelection();

  } else if (FILE_IS_WRITEABLE) {

    if (theItemName == "addItem") with (this) {
      listObj.append();
      valueObj.value = "";
      nameObj.value  = "";
      nameObj.focus();
      nameObj.select();
  
    } else if (theItemName == "delItem") with (this) {
      DATA.del(listObj.getIndex());
      listObj.del();
      drawSelection();
  
    } else if (theItemName == "itemName" || theItemName == "itemValue") with (this) {
      temp = nameObj.value;
      temp2 = (valueObj.value);
      if (temp) { //if valid name
        temp = stripSpaces(makeValidKey(temp));
        if (temp) { //if valid name
          if (listObj.get()) { //if selection is not blank (not new item)
            var oldName = DATA.getName(listObj.getIndex()); //get prior name
            if (temp != oldName) DATA.changeName(oldName,temp); //if name changed, update it
          }
          DATA.set(temp,temp2);
          drawList();
        } else {
          alert(MSG_InvalidName);
    } } }

  } else { //file is not writable
    alert(MSG_ReadOnlyFile);
  }
}


//Called when the layer for this page is displayed.
// Use this call to initialize controls.
//
function Pg2_drawList() {
  var i, allItems;

  with (this) {
    listObj.setAll(DATA.getAll());       //clear out the old list
    if (listObj.getLen() > 0) {
      drawSelection();                      //display stuff in fields
    }
  }
}


function Pg2_drawSelection() {
  var name, value;

  with (this) {
    name = DATA.getName(listObj.getIndex()); //get the name for the current selection
    name = name || ""; //make blank if null
    nameObj.value = name;
    value = DATA.get(name);
    value = value || ""; //make blank if null
    valueObj.value = value;
  }
}


function Pg2_drawFilename() {
  var fNameObj = findObject("fileName2");
  if (fNameObj) {
    fNameObj.innerHTML = this.fileName;
  }
}


function Pg2_drawFilepath() {
  var fPathObj = findObject("filePath2");
  if (fPathObj) {
    fPathObj.innerHTML = this.filePath;
  }
}

//***************** End of Pg2 Class ******************

//***************** Generic Functions *****************


//Renders date (numbers only) as needed. Accepts the following tokens:
//M or MM, D or DD, YY or YYYY. MM means pad with zero. Tokens can be mixed with any punctuation.
//Examples: M/D/YY => 6/25/99  or  YYYY.MM.DD => 1999.06.25

//This is only temporarily in the localized code. Should be moved
//to Shared/MM/Scripts/CMN/dateID.js for the next release.

function createDateFromMask(dateStr) {
  var today = new Date();
  var theYear  = String(today.getFullYear());
  var theMonth = String(Number(today.getMonth())+1);
  var theDate  = String(today.getDate());


  //Replace Year
  dateStr = dateStr.replace(/YYYY/g,theYear);
  dateStr = dateStr.replace(/YY/g,theYear.substring(2));

  //Replace Month
  dateStr = dateStr.replace(/MM/g,((Number(theMonth)<10)?"0":"")+theMonth);
  dateStr = dateStr.replace(/M/g,theMonth);

  //Replace Date
  dateStr = dateStr.replace(/DD/g,((Number(theDate)<10)?"0":"")+theDate);
  dateStr = dateStr.replace(/D/g,theDate);

  return dateStr;
}
