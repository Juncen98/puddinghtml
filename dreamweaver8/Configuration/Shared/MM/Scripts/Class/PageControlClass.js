//SHARE-IN-MEMORY=true
// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

//PageControl Class

//This is an example of a page class to be used with the TabControl.
//Uncomment the alert() calls to display the various events as they occur.

function PageControl(theTabLabel) {
  this.tabLabel = theTabLabel;
}

PageControl.prototype.getTabLabel = PageControl_getTabLabel;
PageControl.prototype.canLoad = PageControl_canLoad;
PageControl.prototype.load = PageControl_load;
PageControl.prototype.update = PageControl_update;
PageControl.prototype.unload = PageControl_unload;
PageControl.prototype.lastUnload = PageControl_lastUnload;

function PageControl_getTabLabel() {
  return this.tabLabel;
}

//Called to check if a page can be loaded
//
function PageControl_canLoad() {
  //alert("canLoad() called " + this.tabLabel);
  return true;
}

//Called when the layer for this page is displayed.
// Use this call to initialize controls.
//
function PageControl_load() {
  //alert("load() called " + this.tabLabel + " (loaded = " + this.loaded + ")");
}

//Called when one of the page controls calls the tabControl update function.
// Use this call to respond to user input.
//
function PageControl_update(theItemName) {
  //alert("update() called for " + theItemName + " on " + this.tabLabel);
}

//Called when another page is about to be shown, or finish() is called on
// the tabControl.  Use this call to perform any finishing tasks.
//
function PageControl_unload() {
  //alert("unload() called " + this.tabLabel);
  return true;
}

//Called when finish() is called on the tabControl.
// Use this call to perform any last minute page updates.
//
function PageControl_lastUnload() {
  //alert("lastUnload() called " + this.tabLabel);
  return true;
}
