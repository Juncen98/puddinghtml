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

//*************** Pg1 Class *****************

function Pg1(theTabLabel) {
  this.tabLabel    = theTabLabel;

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


function Pg1_getTabLabel() {
  return this.tabLabel;
}


//Called to check if a page can be loaded
//
function Pg1_canLoad() {
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

  with (this) {
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
  }
}




//***************** Pg2 Class ******************

function Pg2(theTabLabel) {
  this.tabLabel    = theTabLabel;

  this.listObj     = new ListControl("allItems");
  this.nameObj     = findObject("itemName");
  this.valueObj    = findObject("itemValue");
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



function Pg2_getTabLabel() {
  return this.tabLabel;
}



//Called to check if a page can be loaded
//
function Pg2_canLoad() {
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

  } else {

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

      if (temp.toLowerCase() == "design notes credits") {
        valueObj.value = unescape("%42%72%6F%75%67%68%74 %74%6F %79%6F%75 %62%79...\n%48%65%69%64%69, %4B%65%6E,"+
                                  " %53%74%65%70%68%61%6E%69%65, %61%6E%64 %4A%61%6B%65!\n%59%65%65-%68%61%77!");
      }

      temp2 = (valueObj.value);
      if (temp) { //if valid name
        temp = stripSpaces(makeValidKey(temp));
        if (temp) { //if valid name
          if (listObj.get()) { //if selection is not blank (not new item)
            var oldName = DATA.getName(listObj.getIndex()); //get prior name
            if (temp != oldName) DATA.changeName(oldName,temp); //if name changed, update it
          }
          DATA.set(temp,temp2 || null);
          drawList();
        } else {
          alert(MSG_InvalidName);
        }	 
	  }
    }
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


//***************** End of Pg2 Class ******************

//******************* API **********************

function commandButtons(){
  var btns;

  btns = new Array(MM.BTN_OK,     "okClicked()", MM.BTN_Cancel, "cancelClicked()", MM.BTN_Help, "displayHelp()");
  return btns
}

//***************** LOCAL FUNCTIONS  ******************

function initializeUI() {
  var result;

  DATA = new NameValuePair();

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

  T = new TabControl('Tab');
  //Add tab pages.   (Pass the layer name, and the page object)
  T.addPage('mainLayer', new Pg1(LABEL_BasicInfo));
  T.addPage('allLayer', new Pg2(LABEL_AllInfo));
  //Initialize and display the tabs.  (Could pass the name of a page to start on)
  T.start();
}



function okClicked() {
  T.finish();
  writeMetafiles();
  window.close();

  //update design notes columns in local file list in site window
  if (MMNotes.UpdateSite == true)
	site.refresh("local");
}

function cancelClicked() {
  window.close();
}


function writeMetafiles() {
  var i, names;

  site.setFocus("local");

  //iterate through each file/folder in the selection
  //and set the access permissions for each
  var localFileList = site.getSelection();
  var numSelected = localFileList.length;
  for (file=0; file<numSelected; file++) {
	  //for each file write out new note
	  FILE_PTR = MMNotes.open(localFileList[file]);
	  names = DATA.getNames();
	  for (i=0; i<names.length; i++)  {  //with each local, non-null key
		MMNotes.set(FILE_PTR,names[i],DATA.get(names[i]));  //set it in the file
	  }
	  MMNotes.close(FILE_PTR);
  }
}



function makeValidKey(theStr) {
  theStr = theStr.replace(/(\")/g,""); //disallow "
  theStr = theStr.replace(/(\')/g,""); //disallow '
  return theStr;
}

function getSimpleDate() {
  var today = new Date();
  var dateStr = today.toLocaleString();
  dateStr = dateStr.replace(/\S+\s+(\S+\s+\S+\s+\S+)[^\x00]*/,"$1"); //get 2nd-4th words of date
  return dateStr;
}

