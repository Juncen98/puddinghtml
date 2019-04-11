//SHARE-IN-MEMORY=true
//
// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.
//
//menuItem.js
//
//Adds stars or values to a listed menu item.
//
//--------------------------------------------------------------
//
//
//addStarToMenuItem(theSelect,menuIndex) {
//addValueToMenuItem(theSelect,menuIndex,value) {
//stripStar(theStr) {
//stripValue(theStr) {


//Given theSelect obj and an index, it appends a star
//and inserts the new string into the menu at position index.
//If the menu item was "layer[2]" it becomes "layer[2]  *".
//Existing "  *" values get stripped off first.

function addStarToMenuItem(theSelect,menuIndex) {
  var newMenuText;

  newMenuText = stripStar(theSelect.options[menuIndex].text); //remove if old star
  newMenuText += "  *";  //append "  *"
  theSelect.options[menuIndex]=new Option(newMenuText); //add new line to menu
}



//Given theSelect obj and an index and a value, it appends the value in parens
//and inserts the new string into the menu at position index.
//If the menu item was "layer[2]" and value is "show", it becomes "layer[2] (show)".
//Existing " (value)" values get stripped off first. If value is empty, strips all.

function addValueToMenuItem(theSelect,menuIndex,value) {
  var newMenuText = stripValue(theSelect.options[menuIndex].text); //remove old val
  if (value.length > 0) { //if valid value
    newMenuText += " (" + value + ")";  //append " (value)"
  }
  theSelect.options[menuIndex]=new Option(newMenuText); //add new line to menu
}

//Given a string "myObject  *" returns "myObject  *".

function stripStar(theStr) {
  var endPos;

  endPos = theStr.indexOf('  *');
  return ((endPos > 0)? theStr.substring(0,endPos) : theStr);
}



//Given a string "some property (value)" returns "some property".

function stripValue(theStr) {
  var endPos = theStr.indexOf(' (');
  return ((endPos > 0)? theStr.substring(0,endPos) : theStr);
}



