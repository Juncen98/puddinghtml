// Copyright 2000, 2001, 2002, 2003, 2004 Macromedia, Inc. All rights reserved.

// include ../reports.js

//***************        GLOBALS       ***************

var helpDoc = MM.HELP_cmdMyExtension; //??? Specific help for report command.


var UNTITLED_LIST = new Array(
       'Welcome to GoLive CyberStudio',
       'Welcome to Adobe GoLive',
       'New Page ',
       'Untitled Document'
       );

       
loadDefaultTitle();     // Include the current Default.html document title.   

//??? Any browser differences on how multiple title tags are shown or used.
//???  is the last ever shown or is it always the first.

//***************          API         ***************


//---------------
// Function: configureSettings
// Description: Standard report API, used to initialize and load
//  the default values. Does not initialize the UI.
//
function configureSettings() {
  return false; // No settings to configure
}


//---------------
// Function: commandButtons
// Description: Standard report API, like commands the return value
//  controls the display of command buttons in the settings dialog.
//
function commandButtons() {
  return new Array(
        MM.BTN_Process,  "processFile(dw.getDocumentDOM().URL)", //??? 
        MM.BTN_Cancel,   "cleanupUI()"
    );
}


//---------------
// Function: processFile
// Description: Report command api called during file processing.
//
function processFile (fileURL) {
  if (!isHTMLType(fileURL))
    return;

  var curDOM = dw.getDocumentDOM(fileURL);

  // Library items don't have TITLE tags, and it's perfectly normal for a Template file
  // to be Unititled, so don't bother reporting on .lbi and .dwt files.
  if (curDOM.getIsLibraryDocument() || curDOM.getIsTemplateDocument())
    return;
  
  var frameList = curDOM.getElementsByTagName('title');
  
  if (frameList.length > 1) {
    reportItem(REP_ITEM_WARNING, fileURL, REPORT_TITLE_MULTIPLE, curDOM.nodeToSourceViewOffsets(frameList[1]));
  }
  // Report the redundant tag.
  //??? Might be helpful to have a list of errors so that other commands would
  //???  not report the same errors that had already been reported for a file.


  // The first title is the title that will be used. There should only be one, 
  //  so determine which is possibly a good title if there is one and recommend deleting the rest.
  //??? Where is the dw default? Localization.
  if (frameList.length < 1) {
    reportItem(REP_ITEM_WARNING, fileURL, REPORT_TITLE_NONE, null);
  } else if (isAllWhite(frameList[0].innerHTML)) { // We have at least one title
    reportItem(REP_ITEM_WARNING, fileURL, REPORT_TITLE_EMPTY, 
               curDOM.nodeToSourceViewOffsets(frameList[0]));
  } else if (isDefaultName(frameList[0].innerHTML)) {
    reportItem(REP_ITEM_WARNING, fileURL, 
               printString(REPORT_TITLE_DEFAULT, frameList[0].innerHTML),
               curDOM.nodeToSourceViewOffsets(frameList[0]));
  }
}


//***************    LOCAL FUNCTIONS   ***************


//---------------
// Function: isDefaultName
// Description: Comparison of untitled documents.
// Note: This function refers to a global array of untitled document names.
//  This includes a list of known file types as well as the untitled document
//  from the Dreamweaver file template.
//
function isDefaultName (titleText) {
  var rtnBool = false;
//??? Possible issue here with document titles encoded in a double byte language.
//??? Scotts work with UTF8 may resolve the issue. 
  if (UNTITLED_LIST) { 
    for (var i=0; i < UNTITLED_LIST.length && !rtnBool; i++) {
      if (titleText.indexOf(UNTITLED_LIST[i]) > -1) { rtnBool = true }
    }
  }
  return rtnBool;
}


//---------------
// Function: loadDefaultTitle
// Description: Adds the title from Dreaweaver template document to global
//  list of untitled document names.
//
function loadDefaultTitle() {
  //??? Assumes that there is a default document will always have a title tag.
  var curDOM = dw.getDocumentDOM('../../DocumentTypes/NewDocuments/Default.html');
  var titles;
  
  if (curDOM) {
    titles = curDOM.getElementsByTagName('title');
    if (titles.length > 0) {
      // Set global variable.
      UNTITLED_LIST.push(titles[0].innerHTML);
    }
  }
}



//---------------
//
function cleanupUI() {
  window.close();
}



//---------------
//
function isWhite( c )
{
   return( c == ' ' || c == '\t' || c == '\n' || c == '\r' );
}



//---------------
//
function isAllWhite( str )
{
   for( var i = 0; i < str.length; i++ )
   {
      if ( !isWhite( str.charAt( i ) ) )
         return( false );
   }
   
   return( true ); 
}
