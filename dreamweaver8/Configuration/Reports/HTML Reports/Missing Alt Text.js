// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

// include ../reports.js

//***************        GLOBALS       ***************

var helpDoc = MM.HELP_cmdMyExtension; //??? Specific help for report command.


//***************          API         ***************

//---------------
// Function: configureSettings
// Description: Standard report API, used to initialize and load
//  the default values. Does not initialize the UI.
//
function configureSettings() {
  return false;
}


//---------------
// Function: processFile
// Description: Report command api called during file processing.
//
function processFile (fileURL) {
  if (!isHTMLType(fileURL))
    return;
  var curDOM = dw.getDocumentDOM(fileURL);
  var tagList = curDOM.getElementsByTagName('img');
  var curAttr;
  for (var i=0; i < tagList.length; i++) {
    curAttr = tagList[i].getAttribute('alt');
    if (curAttr == null) { // Missing alt
      reportItem(REP_ITEM_WARNING, fileURL, REPORT_ALT_NONE, curDOM.nodeToSourceViewOffsets(tagList[i]));
    }
  }
}

