// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.


//*************** GLOBALS  *****************

var CMD_PATH = 'Clean Up Word HTML.htm';

//***************** API FUNCTIONS  ******************
function canAcceptCommand()
{
  return (dw.getDocumentDOM() && dw.getDocumentDOM().getParseMode() == 'html' && (dw.getFocus() == 'document' || dw.getFocus(true) == 'html' || dw.getFocus() == 'textView'));
}

//***************** LOCAL FUNCTIONS  ******************

function init() {
  var curDOM, newDOM;
  // Select the word file to be imported, don't show images, supress not in root warnings.
  var HTMLfileTypes = new Array("Word HTML Files (*.htm; *.html)|*.htm;*.html|TEXT|");
  var fileName = browseForFileURL("open", MSG_Word_Import, false, true, HTMLfileTypes);  //returns a local filename
  if (fileName) {
    // Check for name may not exist.
    curDOM = dw.getDocumentDOM(fileName);
    if (curDOM) {
      newDOM = dw.createDocument();
      if (newDOM) {
        newDOM.documentElement.outerHTML = curDOM.documentElement.outerHTML;
        
        dreamweaver.popupCommand(CMD_PATH); //launch the command
      }
    }
  }
}
