// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.
//*************** GLOBAL CONSTANTS *****************
var helpDoc = MM.HELP_objImgPlaceholder;
var gDialogShown = false;
var DEFAULT_WIDTH = 32;
var DEFAULT_HEIGTH = 32;
//*************** GLOBAL VARIABLES *****************
// UI Elements
var TEXT_NAME, TEXT_WIDTH, TEXT_HEIGHT;
var COLORP_COLOR, TEXT_COLOR;

// other globals
var LAST_WIDTH=DEFAULT_WIDTH;
var LAST_HEIGHT=DEFAULT_HEIGTH;
var LAST_NAME="";
//---------------     API FUNCTIONS    ---------------

function isDOMRequired() {
  return false;
}

function objectTag() {
  if (!gDialogShown)
  {
    COLORP_COLOR = document.theForm.colorPicker;
    TEXT_COLOR = document.theForm.colorField;
    TEXT_NAME = document.theForm.nameField;
    TEXT_WIDTH = document.theForm.widthField;
    TEXT_HEIGHT = document.theForm.heightField;
    TEXT_ALT = document.theForm.altField;
  }
  var name = TEXT_NAME.value;
  var width = TEXT_WIDTH.value;
  var height = TEXT_HEIGHT.value;
  var color = TEXT_COLOR.value;
  var alt = TEXT_ALT.value;

  var imgTag = '<img';
  imgTag += ' name="'+ name+'"';
  imgTag += ' src=""';
  imgTag += ' width="'+ width + '"';
  imgTag += ' height="'+ height + '"';
  imgTag += ' alt="' + alt + '"';
  if (color)
    imgTag += ' style="background-color: ' + color + '"';
  imgTag += '>';

  gDialogShown = false; // Reset show dialog global.

  return imgTag;
}

//---------------    LOCAL FUNCTIONS   ---------------



function initializeUI()
{
  // set UI Globals
  COLORP_COLOR = document.theForm.colorPicker;
  TEXT_COLOR = document.theForm.colorField;
  TEXT_NAME = document.theForm.nameField;
  TEXT_WIDTH = document.theForm.widthField;
  TEXT_HEIGHT = document.theForm.heightField;
  TEXT_ALT = document.theForm.altField;
  TEXT_NAME.focus();
  TEXT_NAME.select();
  gDialogShown = true;
}


function updateUI(itemName)
{
  var styleAttribute, replacementStr,browseURL, pattern, theLink, fontStyles,theFont;
  switch(itemName)
  {
    case "nameField":
    {
      if(TEXT_NAME.value!="" && ! dwscripts.isValidVarName(TEXT_NAME.value))
      {
        alert(MSG_InvalidName);
        TEXT_NAME.value = LAST_NAME;
      }
      else
         LAST_NAME = TEXT_NAME.value;
      break;
    }
    case "widthField":
    {
      //chop off "%" if it exists before checking if it is an integer
      var widthStr = TEXT_WIDTH.value;
      if (widthStr.charAt(widthStr.length-1) == '%')
        widthStr = widthStr.slice(0,widthStr.length-1);
      if (!isInteger(widthStr))
        TEXT_WIDTH.value = LAST_WIDTH;
      else
        LAST_WIDTH = TEXT_WIDTH.value
      break;
    }
    case "heightField":
    {
      //chop off "%" if it exists before checking if it is an integer
      var heightStr = TEXT_HEIGHT.value;
      if (heightStr.charAt(heightStr.length-1) == '%')
        heightStr = heightStr.slice(0,heightStr.length-1);
      if (!isInteger(heightStr))
        TEXT_HEIGHT.value = LAST_HEIGHT;
      else
        LAST_HEIGHT = TEXT_HEIGHT.value
      break;
    }
    case "colorField":
    {
      updateColorPicker("colorField", COLORP_COLOR, TEXT_COLOR);
    }
    case "colorPicker":
    {
      updateColorPicker("colorPicker", COLORP_COLOR, TEXT_COLOR);
    }
  }
}
