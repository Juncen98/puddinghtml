// Copyright 2002, 2003 Macromedia, Inc. All rights reserved.
//*************** GLOBAL CONSTANTS *****************
var helpDoc = MM.HELP_objASPNETImageButton;
var gDialogShown = false;

//*************** GLOBAL VARIABLES *****************
// UI Elements
var TEXT_ID, TEXT_URL, TEXT_WIDTH, TEXT_HEIGHT, TEXT_TTIP, TEXT_CMDNAME, TEXT_CMDARG, TEXT_ALT, TEXT_AKEY;

var LAST_WIDTH = "";
var LAST_HEIGHT = "";
var LAST_ID = "";

var formNode = null;
var TAG = "";

//---------------     API FUNCTIONS    ---------------

// Add function to do the form TAG stuff

function isDOMRequired() {
  return false;
}

function objectTag() {
  // If the user turned off the Show Dialogs When Inserting Objects
  // preference, the dialog wasn't shown, the initializeUI() function
  // wasn't called, and the global variables weren't initialized.
  // If that's the case, initialize the variables now.
  if (!gDialogShown){
    TEXT_ID = document.theForm.idField;
    TEXT_URL = document.theForm.imgURL;
    TEXT_ALT = document.theForm.altText;
    TEXT_TTIP = document.theForm.toolTip;
    TEXT_CMDNAME = document.theForm.commandName;
    TEXT_CMDARG = document.theForm.commandArg;
    TEXT_WIDTH = document.theForm.widthField;
    TEXT_HEIGHT = document.theForm.heightField;
    TEXT_AKEY = document.theForm.aKey;
    TEXT_ID.value = dotNetUtils.generateUniqueID("ImageButton");
  }

  var dom = dw.getDocumentDOM();
  var offsets = dom.getSelection();
	var currSel = dom.offsetsToNode(offsets[0], offsets[1]);
    
  // Create an object on which we can store some information
  // about whether we're inside a form.
  var infoObj = new dotNetUtils.formInfo();
	formNode = dotNetUtils.isInsideForm(currSel);
  dotNetUtils.checkFormTags(MM.LABEL_TitleASPImageButton,infoObj);

	if (!formNode){
      infoObj.addForm = true;
      TAG += dotNetUtils.FORM_OPEN;
	}
   
  TAG += '<asp:ImageButton';
  
  if (TEXT_ID.value != "")
    TAG += ' id="'+ TEXT_ID.value+'"';
  else
    // If the ID field is blank, automatically generate a unique ID
    // (because the ID attribute is required).
    TAG += ' id="' + dotNetUtils.generateUniqueID("ImageButton") + '"';
    
  if (TEXT_ALT.value != "")
    TAG += ' AlternateText="' + TEXT_ALT.value + '"';
  if (TEXT_URL.value != "")
    TAG += ' ImageUrl="' + TEXT_URL.value + '"';
  if (TEXT_WIDTH.value != "")
    TAG += ' Width="'+ TEXT_WIDTH.value + '"';
  if (TEXT_HEIGHT.value != "")
    TAG += ' Height="'+ TEXT_HEIGHT.value + '"';
  if (TEXT_TTIP.value != "")
    TAG += ' ToolTip="'+ TEXT_TTIP.value + '"';
  if (TEXT_CMDARG.value != "")
    TAG += ' CommandArgument="'+ TEXT_CMDARG.value + '"';
  if (TEXT_CMDNAME.value != "")
    TAG += ' CommandName="'+ TEXT_CMDNAME.value + '"';
  if (TEXT_AKEY.value != "")
    TAG += ' AccessKey="'+ TEXT_AKEY.value + '"';
  TAG += ' runat="server" />';
  
  if (infoObj.addForm)
    TAG += dotNetUtils.FORM_CLOSE;
  else if (infoObj.setRunat)
    formNode.setAttribute("runat", "server");

  gDialogShown = false; // Reset show dialog global.

  return TAG;
}

//---------------    LOCAL FUNCTIONS   ---------------



function initializeUI()
{
  // set UI Globals
  TEXT_ID = document.theForm.idField;
  TEXT_URL = document.theForm.imgURL;
  TEXT_ALT = document.theForm.altText;
  TEXT_TTIP = document.theForm.toolTip;
  TEXT_CMDNAME = document.theForm.commandName;
  TEXT_CMDARG = document.theForm.commandArg;
  TEXT_WIDTH = document.theForm.width;
  TEXT_HEIGHT = document.theForm.height;
  TEXT_AKEY = document.theForm.aKey;
  TEXT_ID.value = dotNetUtils.generateUniqueID("ImageButton");
  LAST_ID = TEXT_ID.value;
  TEXT_ID.focus();
  TEXT_ID.select();
  gDialogShown = true;
}


function updateUI(itemName){
  switch(itemName){
    case "idField":
      // If the ID value is not unique, warn the user and then revert
      // to the last known unique ID.
      if (TEXT_ID.value != "" && !dotNetUtils.isUniqueID(TEXT_ID.value)){
        var msg = MM.MSG_NeedUniqueID;
        msg = msg.replace(/%s/,TEXT_ID.value);
        alert(msg);
        TEXT_ID.value = LAST_ID;
      // Otherwise, if the ID value is not a valid variable name, warn the
      // user and then revert to the last known valid ID.
      }else if (TEXT_ID.value != "" && !dwscripts.isValidVarName(TEXT_ID.value)){
        alert(MM.MSG_InvalidIDAutoFix);
        TEXT_ID.value = LAST_ID;
      // If everything's OK, set LAST_ID to the current value of the ID field; this
      // is the value we'll revert to if the user later types an invalid or non-
      // unique ID.
      }else{ 
        LAST_ID = TEXT_ID.value;
      }
      break;

      case "folderIcon":
        var oldVal = TEXT_URL.value;
        var newVal = dw.browseForFileURL();
        if (newVal){
          TEXT_URL.value = newVal;
        }else{
          TEXT_URL.value = oldVal;
        }
        break;
        
    case "width":
      if (TEXT_WIDTH.value != "" && !isInteger(TEXT_WIDTH.value) && !parseInt(TEXT_WIDTH.value) >= 0){
        alert(MM.MSG_ValueGreaterThanOrEqualToZero);
        TEXT_WIDTH.value = LAST_WIDTH;
      }else
        LAST_WIDTH = TEXT_WIDTH.value
      break;

    case "height":
      if (TEXT_HEIGHT.value != "" && !isInteger(TEXT_HEIGHT.value) && !parseInt(TEXT_HEIGHT.value) >= 0){
        alert(MM.MSG_ValueGreaterThanOrEqualToZero);
        TEXT_HEIGHT.value = LAST_HEIGHT;
      }else
        LAST_HEIGHT = TEXT_HEIGHT.value
      break;
  }
}
