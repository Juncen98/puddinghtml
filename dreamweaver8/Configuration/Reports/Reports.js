// Copyright 2000, 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

//***************        GLOBALS       ***************

// Available Icons 
var REP_ICON_NONE     = 0; 
var REP_ICON_DOC      = 1;
var REP_ICON_MULTIDOC = 2;
var REP_ICON_FOLDER   = 3;
var REP_ICON_IMAGE    = 4;
var REP_ICON_CHECK    = 5;
var REP_ICON_X        = 6;
var REP_ICON_QUESTION = 7;
var REP_ICON_NOTE     = 8;
var REP_ICON_YIELD    = 9;
var REP_ICON_STOP     = 10;

// Report Item Types -- NOT LOCALIZABLE (strings are used in switch/case below)
var REP_ITEM_WARNING  = "Warning";
var REP_ITEM_NOTE     = "Note";
var REP_ITEM_ERROR    = "Error";
var REP_ITEM_CUSTOM   = "Custom";

// for backwards compatibility...
var LEVEL_NOTE		  = REP_ITEM_NOTE;
var LEVEL_ALERT		  = REP_ITEM_NOTE;  // we don't really have "alert" anymore, so note is the closest match
var LEVEL_WARNING	  = REP_ITEM_WARNING;
var LEVEL_ERROR		  = REP_ITEM_ERROR;

var ARRAY_EXTENSION = new Array("HTM","HTML","SHTM","SHTML","STM","XML","LBI","DWT","ASP","CFM","CFML","PHP","PHP3","LASSO","JSP","ASPX","ASCX");

//***************    LOCAL FUNCTIONS   ***************

//---------------
function getFileName(url) {
  var index = url.lastIndexOf('/');
  if (index != -1) retVal = url.substring(index + 1);
  else retVal = fileURL;
  return retVal;
}

//---------------
function reportItem(repItemType, fileURL, strDesc, offsets, argIconNum) {
  var iconNum = REP_ICON_NONE;
  var iStartSel = (offsets) ? offsets[0] : 0;
  var iEndSel = (offsets) ? offsets[1] : 0;
  var iLineNo = 0;  // With iLineNo = 0, results dialog will show no line number.
  var siteRelativePath = dwscripts.getSiteRelativePath(fileURL);
  
  if (offsets)
  {
    var dom = dw.getDocumentDOM(fileURL);
    iLineNo = dom.source.getLineFromOffset(iStartSel);
  }

  switch (repItemType) {  
    case "Note":
      iconNum = REP_ICON_NOTE;
      strDesc = MM.MSG_noteColon + strDesc;
      break;
    case "Error":
      iconNum = REP_ICON_STOP;
      strDesc = MM.MSG_errorColon + strDesc;
      break;
    case "Warning":
      iconNum = REP_ICON_YIELD;
      strDesc = MM.MSG_warningColon + strDesc;
      break;
    case "Custom":
      iconNum = (argIconNum) ? argIconNum : REP_ICON_NONE;
      break;
    default:
      break;
  }

  dw.resultsPalette.siteReports.addResultItem(this, fileURL, iconNum, siteRelativePath, strDesc, iLineNo, iStartSel, iEndSel);
}


//---------------
// Emulates printf("blah blah %s blah %s",str1,str2)
// Used for concatenating report messages for easier localization.
// Returns assembled string.
//
function printString(formatStr) {
  var inArr = formatStr.split('%s');
  var outArr = new Array(inArr[0]);
  
  for (var i=1; i<inArr.length; i++) {
    outArr.push(arguments[i]);
    outArr.push(inArr[i]);
  }
  return outArr.join(''); // Convert Array to string for output.
}

//---------------
// Reads in the extension in Configuration/Extensions.txt and creates an array of extensions
//
// 
//
function isHTMLType(filename)
{
  var index,theExt, retVal=false;
  index = filename.lastIndexOf(".");
  if (index != -1)
  {
    theExt = filename.substring(index+1).toUpperCase();
    for (var i=0; i < ARRAY_EXTENSION.length; i++)
    {
      if (theExt == ARRAY_EXTENSION[i])
	  {
	    retVal=true;
	    break;
	  }
    }
  }
  return retVal;
}
