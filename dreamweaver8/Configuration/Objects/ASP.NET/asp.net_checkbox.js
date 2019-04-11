// Copyright 2002, 2003 Macromedia, Inc. All rights reserved.
//*************** GLOBAL CONSTANTS *****************
var helpDoc = MM.HELP_objASPNETCheckBox;
var gDialogShown = false;

//*************** GLOBAL VARIABLES *****************
// UI Elements
var TEXT_ID, TEXT_TEXT, LIST_ALIGN, TEXT_TTIP, CBOX_POSTBACK, TEXT_AKEY;

var LAST_ID = "";

var formNode = null;
var TAG = "";

// theAlignmentsLRCap and theAlignmentsLRVal come from loc_strings.js
// and strings.js, which live in the TagLibraries/ASPNet folder.
// iow, we're using the same strings in the object dialogs that we 
// use in the tag dialogs. 
var textAlignLabels = theAlignmentsLRCap;
var textAlignValues = theAlignmentsLRVal;
textAlignLabels.unshift("");
textAlignValues.unshift("");

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
    TEXT_TEXT = document.theForm.textField;
    TEXT_TTIP = document.theForm.toolTip;
    TEXT_AKEY = document.theForm.aKey;
    CBOX_POSTBACK = document.theForm.postBack;
    LIST_ALIGN = new ListControl("textAlign");

    LIST_ALIGN.setAll(textAlignLabels,textAlignValues);
    LIST_ALIGN.pickValue("");
    TEXT_ID.value = dotNetUtils.generateUniqueID("CheckBox");
  }

  var dom = dw.getDocumentDOM();
  var offsets = dom.getSelection();
	var currSel = dom.offsetsToNode(offsets[0], offsets[1]);
    
  // Create an object on which we can store some information
  // about whether we're inside a form.
  var infoObj = new dotNetUtils.formInfo();
	formNode = dotNetUtils.isInsideForm(currSel);
  dotNetUtils.checkFormTags(MM.LABEL_TitleASPCheckbox,infoObj);

	if (!formNode){
      infoObj.addForm = true;
      TAG += dotNetUtils.FORM_OPEN;
	}
   
  TAG += '<asp:CheckBox';
  
  if (TEXT_ID.value != "")
    TAG += ' id="'+ TEXT_ID.value+'"';
  else
    // If the ID field is blank, automatically generate a unique ID
    // (because the ID attribute is required).
    TAG += ' id="' + dotNetUtils.generateUniqueID("CheckBox") + '"';
    
  if (TEXT_TEXT.value != ""){
    if (TEXT_TEXT.value.indexOf('<') != -1){
      TAG += " Text='" + TEXT_TEXT.value + "'";
    }else{
      TAG += ' Text="' + TEXT_TEXT.value + '"';
    }
  }
  if (TEXT_AKEY.value != "")
    TAG += ' AccessKey="'+ TEXT_AKEY.value + '"';
  if (TEXT_TTIP.value != "")
    TAG += ' ToolTip="'+ TEXT_TTIP.value + '"';
  if (CBOX_POSTBACK.checked == true)
    TAG += ' AutoPostBack="true"';
  if (LIST_ALIGN.getValue() != "")
    TAG += ' TextAlign="'+ LIST_ALIGN.getValue() + '"';
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
  TEXT_TEXT = document.theForm.textField;
  TEXT_TTIP = document.theForm.toolTip;
  TEXT_AKEY = document.theForm.aKey;
  CBOX_POSTBACK = document.theForm.postBack;
  LIST_ALIGN = new ListControl("textAlign");

  LIST_ALIGN.setAll(textAlignLabels,textAlignValues);
  LIST_ALIGN.pickValue("");
  TEXT_ID.value = dotNetUtils.generateUniqueID("CheckBox");
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
  }
}
