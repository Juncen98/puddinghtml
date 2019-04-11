// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

//*************** GLOBALS  *****************

var OBJECT_TAG = '';

var CMD_PATH = dreamweaver.getConfigurationPath() + "/Commands/Insert Nav Bar.htm";

var NAVBAR_DATA = '';
var NAVBAR_VIEW = '';

var INSERT = false;
var OBJECT_INSERT = false;


//******************* API **********************

function commandButtons()
{
   return new Array( MM.BTN_OK,     "setObjectTag()",
                     MM.BTN_Cancel, "cancelObjectTag()",
                     MM.BTN_Help,   "displayHelp()");
}


function canAcceptCommand() {
  var retVal = false;
  if (dw.getFocus() == 'document') {
    var docDOM = dw.getDocumentDOM('document');
    if (docDOM)
      retVal = (docDOM.body.outerHTML.indexOf("MM_nbGroup") != -1);
  }
  return retVal;
}

function getObjectTag() {
  return OBJECT_TAG;
}

function setObjectTag() {
  if (!NAVBAR_DATA.isComplete()) {

    alert(MSG_NeedNameAndImg + MSG_InsertBar);

  } else {
    if (INSERT) {
      // on creation, set the OBJECT_TAG variable
      OBJECT_TAG = NAVBAR_DATA.getObjectTag();

      //store the layout and table settings
      NAVBAR_VIEW.storeOptions(CMD_PATH);

    } else {
      // on re-edit, update the page.
      NAVBAR_DATA.updateDocument();
    }

    window.close();
  }
}

function cancelObjectTag() {
  OBJECT_TAG = '';
  window.close();
}

//***************** LOCAL FUNCTIONS  ******************

function initializeUI() {
  var nbExists = false;

  INSERT = OBJECT_INSERT;

  NAVBAR_DATA = new NavBar('document');
  nbExists = NAVBAR_DATA.setFromDocument();
  if (!nbExists) {
    NAVBAR_DATA.addElem();
  }

  NAVBAR_VIEW = new NavBarView(document, NAVBAR_DATA);
  if (INSERT) NAVBAR_VIEW.restoreOptions(CMD_PATH);
  NAVBAR_VIEW.display();
}


function updateUI(itemName) {
  NAVBAR_VIEW.update(itemName);
}


function browseFile(itemName, isImage) {
  var item = findObject(itemName);
  if (item != null) {
    var result = dw.browseForFileURL('select', (isImage) ? LABEL_getImage : LABEL_getURL, isImage);
    if (result) {
      item.value = result;
      updateUI(itemName);
  } }
}
