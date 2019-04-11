// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

//*************** GLOBALS  *****************

var CMD_PATH = dreamweaver.getConfigurationPath() + "/Commands/Insert Nav Bar.htm";


//******************* API **********************

function objectTag(){
  var cmdWin, objectTag = '';

  if (navBarExists()) {

    if (confirm(MSG_NavBarExists))
      dw.popupCommand("Modify Nav Bar.htm");

  } else {

    cmdWin = dw.getDocumentDOM(CMD_PATH).parentWindow;

    cmdWin.OBJECT_INSERT = true; // indicate that we are inserting

    dreamweaver.popupCommand("Insert Nav Bar.htm");

    objectTag = cmdWin.getObjectTag();

  }

  return objectTag;
}

function navBarExists() {
  var retVal = false;
  var docDOM = dw.getDocumentDOM('document');
  retVal = (docDOM.body.outerHTML.indexOf("MM_nbGroup") != -1)
  return retVal;
}

