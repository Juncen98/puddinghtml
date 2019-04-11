//SHARE-IN-MEMORY=true
// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

//TabControl Class

//EVENT MODEL
//
//The TabControl class distributes events to the page classes by calling
//methods of the page class if they exist.
//The supported events are:
//
//  page.getTabLabel()  returns the tab label text for this page
//  page.canLoad()      returns true if this page can be loaded
//  page.load()         called when page visited
//  page.loaded         true if 1st call for wizard session, else false
//  page.update()       called when any UI element is changed
//  page.unload()       return true if this page can be unloaded
//  page.lastUnload()   called when finish() is called


//INTERFACE
//
//TabControl methods:
//
//  getPageNum(thePageName) returns integer
//    - returns the index in pageList of the given page (starting from 0, -1 if not found)
//
//  getCurPageNum() returns integer
//    - returns the index in pageList of the current page (starting from 1)
//
//  getTotalPages() returns integer
//    - returns the total number of pages in the current group
//
//  getPageObect(pageName) returns object
//    - returns the page object for the current page
//
//  start(startPage)
//    - initializes the tabs (startPage is optional page name to start on)
//
//  finish() returns string
//    - unloads the current page and returns its name
//    - sends the lastUnload event to each of the pages in the current group
//      
//  addGroup(theGroupName, theGroupArray) returns boolean
//    - add a group of pages to the list of possible groups
//    - (theGroupArray is an array of page names)
//
//  showGroup(theGroupName) returns boolean
//    - select a group to display (call refresh or showPage to view the new group)
//
//  addPage(thePageName, thePageObject) returns boolean
//    - add a page and its corresponding object to the list of possible pages
//    - (thePageName is the div id of the page)
//
//  showPage(thePageName) returns boolean
//    - show the page with the given name in the current group
//    - (calls the unload() method of the current page,
//    -  calls the canLoad() and load() methods of the new page)
//
//  showPageNum(thePageNum) return boolean
//    - show the page with the given index in the current group
//
//  nextPage() returns boolean
//    - show the next page in the current group
//
//  previousPage() returns boolean
//    - show the previous page in the current group
//
//  refresh() returns boolean
//    - refresh the tab display
//
//  insertPage(thePageName, insertBeforeName, allowDuplicates) returns boolean
//    - dynamically insert a page in the current group
//    - insertBeforeName specifies the page to insert after, null = insert at end
//    - (call refresh or showPage to view the new page)
//
//  removePage(thePageName) returns boolean
//    - dynamically remove a page from the current group
//    - (call refresh or showPage to remove the page from the display)
//
//  update(theItemName)       
//    - Calls the update() method in the page object for the current page


function TabControl(thePrefix) {
  // properties
  this.prefix = (thePrefix != null) ? thePrefix : 'Tab';  //tab layers prefix
  this.tabs = '';              //the array of tab objects
  this.p = new Array();        //page objects array  
  this.groups = new Array();   //page collection array
  
  this.group = '';             //the current group
  this.pageList = '';          //the current page list
  this.page = 0;               //the current page number
  this.pageName = '';          //the current page name
  this.oldPage = '';           //the previously displayed page
  this.obj = '';               //the current layer object
  this.pageListChanged = true; //the page list state
  
  this.groups['default'] = new Array();  // create the default group
}

// methods
TabControl.prototype.getPageNum = TabControl_getPageNum;
TabControl.prototype.start = TabControl_start;
TabControl.prototype.finish = TabControl_finish;
TabControl.prototype.addPage = TabControl_addPage;
TabControl.prototype.addGroup = TabControl_addGroup;
TabControl.prototype.showGroup = TabControl_showGroup;
TabControl.prototype.showPage = TabControl_showPage;
TabControl.prototype.showPageNum = TabControl_showPageNum;
TabControl.prototype.nextPage = TabControl_nextPage;
TabControl.prototype.previousPage = TabControl_previousPage;
TabControl.prototype.refresh = TabControl_refresh;
TabControl.prototype.insertPage = TabControl_insertPage;
TabControl.prototype.removePage = TabControl_removePage;
TabControl.prototype.update = TabControl_update;
TabControl.prototype.newTabs = TabControl_newTabs;
  
TabControl.prototype.getCurPageNum = TabControl_getCurPageNum;
TabControl.prototype.getTotalPages = TabControl_getTotalPages;
TabControl.prototype.getPageObject = TabControl_getPageObject;

//****************************************************************************************

function TabControl_getPageNum(thePageName) {
  var i, retVal = -1;
  for (i=0; i < this.pageList.length; i++) {
    if (this.pageList[i] == thePageName) {
      retVal = i;
      break;
  } }
  return retVal;
}

function TabControl_getCurPageNum() {
  return (this.page + 1);
}

function TabControl_getTotalPages() {
  return (this.pageList.length);
}

function TabControl_getPageObject(aPageName) {
  return (this.p[aPageName]);
}

function TabControl_start(startPage) {
  var i;

  with (this) {
    if (!group) showGroup('default');
    
    for (i in p) p[i].loaded = false; //mark pages as not loaded
    
    pageListChanged = true;
    
    // show the last page, if it exists
    page = 0;
    pageName = '';
    if (startPage) {
      page = getPageNum(startPage);
      if (page == -1) page = 0;  // show first page on error
    }
    showPage(pageList[page],true); //show prior page or first page
  }
}

function TabControl_finish() {
  var i;
  with (this) {
    if (p[pageList[page]].unload != null) p[pageList[page]].unload(); //unload current page
    for (i=0; i < pageList.length; i++) { //give each class a last chance
      if (pageList[i] && (p[pageList[i]].lastUnload != null)) {
        p[pageList[i]].lastUnload();
  } } }
  return this.pageList[this.page];
}

function TabControl_addGroup(theGroupName, theGroupArray) {
  var retVal = false;
  if (this.groups[theGroupName] == null) {
    this.groups[theGroupName] = theGroupArray;
    retVal = true;
  }
  return retVal;
}

function TabControl_showGroup(theGroupName) {
  var i, retVal = false;
  if (this.groups[theGroupName] != null) with (this) { //if group is known
    group = theGroupName;
    pageList = new Array();
    for (i=0; i < groups[group].length; i++) //copy the group array to pageList
      pageList[i] = groups[group][i];        // so dynamic adds won't change the group
    pageListChanged = true;
    retVal = true;
  }
  return retVal;
}

function TabControl_addPage(thePageName, thePageObject) {
  var retVal = false;
  if (this.p[thePageName] == null) with (this) {
    p[thePageName] = thePageObject;
    groups['default'].push(thePageName);
    retVal = true;
  }
  return retVal;
}

function TabControl_showPage(thePageName, dontUnloadCurPg) {
  var i, loadOk=true, unloadOk=true, retVal=false;
  if (thePageName && this.p[thePageName] != null && 
      this.getPageNum(thePageName) != -1) with (this) {
    if (thePageName == pageName) {  // if same page
      oldPage = page;  //remember previous for faster tabbing
      page = getPageNum(thePageName);  //get number in case page was inserted
      if (oldPage == page) oldPage = null;
      newTabs();  
      retVal = true;      
    } else {
      if (p[thePageName].canLoad != null)  //call canLoad() method if it exists
        loadOk = p[thePageName].canLoad();
      if (loadOk) {
        if (!dontUnloadCurPg) { //if not silently visiting
          if (pageName && p[pageName].unload != null) //tell prior pg to unload
            unloadOk = p[pageName].unload();
        }
        if (unloadOk) { //if prior page agreed to go down (or didn't answer), continue
          oldPage = page;  //remember previous for faster tabbing
          page = getPageNum(thePageName);
          pageName = thePageName; //change pageName
          if (obj) obj.visibility = "hidden"; //hide old pg
          obj = findObject(pageName);
          if (obj) obj.visibility = "visible"; //show new page
          if (p[pageName].load != null) {
            p[pageName].load(); //tell page to load itself
            p[pageName].loaded = true; //mark page as having been loaded this wizard session
          }
          newTabs();  
          retVal = true;
  } } } }
  return retVal;
}

function TabControl_showPageNum(pageNumber) {
  var retVal = false;
  if (pageNumber >= 0 && pageNumber < this.pageList.length)
    retVal = this.showPage(this.pageList[pageNumber]);
  return retVal;
}

function TabControl_nextPage() {
  var newPage=this.page+1, retVal = false;;
  if (newPage < this.pageList.length)
    retVal = this.showPage(this.pageList[newPage]);
  return retVal;
}

function TabControl_previousPage() {
  var newPage=this.page-1, retVal = false;
  if (newPage >= 0)
    retVal = this.showPage(this.pageList[newPage]);
  return retVal;
}

function TabControl_refresh() {
  var curPage, retVal = false;
  with (this) {
    curPage = getPageNum(pageName);
    if (curPage > -1) retVal = showPageNum(curPage);
    else if (page < pageList.length) retVal = showPageNum(page);
    else if (pageList.length > 0) retVal = showPageNum(pageList.length-1);
  }
  return retVal;
}

function TabControl_insertPage(thePageName, insertBeforeName, allowDuplicate) {
  var i, retVal = false, insertItem = this.pageList.length;
  with (this) {
    if (insertBeforeName)
      insertItem = this.getPageNum(insertBeforeName);
    if (insertItem != -1 && (allowDuplicate || this.getPageNum(thePageName) == -1)) {
      pageList.splice(insertItem, 0, thePageName);
      pageListChanged = true;
      retVal = true;
  } }
  return retVal;
}

function TabControl_removePage(thePageName) {
  var i , retVal = false, removeItem = -1;
  with (this) {
    removeItem = getPageNum(thePageName);
    if (removeItem != -1) {
      pageList.splice(removeItem, 1);
      pageListChanged = true;
      retVal = true;
  } }
  return retVal;
}

function TabControl_update(theItemName) {
  if (this.p[this.pageName] != null && this.p[this.pageName].update != null)
    this.p[this.pageName].update(theItemName);
}

function TabControl_newTabs() {
  var i, tabObj, tabLabel;
  with (this) {
    //Create tab data structure
    if (!tabs) {
      tabs = new Array();
      for(i=0,tabObj=findObject(prefix+i); tabObj; i++,tabObj=findObject(prefix+i)) {
        tabs[i] = new Array();
        tabs[i].tab      = tabObj;
        tabs[i].tabSel   = findObject(prefix+i+"Sel");    //find bg object
        tabs[i].tabLabel = findObject(prefix+i+"Label"); //find Label object
    } }

    if (tabs.length && !pageListChanged) { //if only switching tabs
      if (oldPage != null) //hide old selection
        tabs[oldPage].tabSel.visibility = "hidden";
      tabs[page].tabSel.visibility = "inherit"; //show new selection

    } else for (i=0; i < tabs.length; i++) { //refresh pagelist and all tabs
      if (i < pageList.length && pageList[i]) {

        //show the tab before setting the src: bug in DW2
        if (tabs[i].tab.visibility == "hidden")  //show tab if hidden
          tabs[i].tab.visibility = "visible";

        //set tab label
        tabLabel = "";
        if (p[pageList[i]] != null && p[pageList[i]].getTabLabel != null)
          tabLabel = p[pageList[i]].getTabLabel();
        if (tabs[i].tabLabel.innerHTML != tabLabel) //change label if diff
          tabs[i].tabLabel.innerHTML = tabLabel;

        //set selected
        if (page == i) { //show selected tab
          if (tabs[i].tabSel.visibility == "hidden") //show selected tab
            tabs[i].tabSel.visibility = "inherit";
        } else if (tabs[i].tabSel.visibility != "hidden") {//hide unselected tab
            tabs[i].tabSel.visibility = "hidden";
        }

      } else if (tabs[i].tab.visibility != "hidden") //hide tab if not hidden
        tabs[i].tab.visibility = "hidden";
    }
    pageListChanged = false;
  }
}
