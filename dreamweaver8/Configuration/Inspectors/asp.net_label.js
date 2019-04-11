//Copyright 2000, 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

var helpDoc = MM.HELP_piASPNETLabel;

var CBOX_ENABLED;
var TEXT_ID;
var TEXT_TTIP;
var TEXT_TEXT;
var TEXT_AKEY;

var LAST_ID = "";

// ********************* API FUNCTIONS ***************************


function canInspectSelection() {
  return true; //comments in html file limit us to just one tag
}


function initializeUI() {
  TEXT_ID = dwscripts.findDOMObject("labelID");
  CBOX_ENABLED = dwscripts.findDOMObject("enabled");
  TEXT_TTIP = dwscripts.findDOMObject("tooltip");
  TEXT_TEXT = dwscripts.findDOMObject("text");
  TEXT_AKEY = dwscripts.findDOMObject("akey");
  
  // reposition form elements for Windows
  if (navigator.platform.charAt(0)=="W") {
    // Move icon into position
    document.layers["image"].top = 2;
    document.layers["image"].left = 4;
    document.layers["idBoxLayer"].top = 2;
    document.layers["idBoxLayer"].left = 43;
  }
  TEXT_ID.value = "";
  TEXT_TEXT.value = "";
  CBOX_ENABLED.checked = true;
  TEXT_AKEY.value = "";
  TEXT_TTIP.value = "";
}


function inspectSelection() {
  var dom = dw.getDocumentDOM();
  var theObj = new TagEdit(dom.getSelectedNode().outerHTML);
  // Call initializeUI() here; it's how the global variables get
  // initialized. The onLoad event on the body tag is never triggered
  // in inspectors.
  initializeUI();
  
  if (theObj.getAttribute("ID")){
    TEXT_ID.value = theObj.getAttribute("ID");
    LAST_ID = TEXT_ID.value;
  }  
  if (theObj.getAttribute("ToolTip")){
    TEXT_TTIP.value = theObj.getAttribute("ToolTip");
  }
  if (theObj.getAttribute("Text")){
    TEXT_TEXT.value = theObj.getAttribute("Text");
  }
  if (theObj.getAttribute("AccessKey")){
    TEXT_AKEY.value = theObj.getAttribute("AccessKey");
  }
  if (theObj.getAttribute("Enabled")){
    CBOX_ENABLED.checked = (theObj.getAttribute("Enabled").toLowerCase() == "false")?false:true;
  }
}


function updateTag(attrib){
  var dom = dw.getDocumentDOM();
  var theObj = new TagEdit(dom.getSelectedNode().outerHTML);
  var editOccurred = false;
  
  if (attrib) {
    switch (attrib){
      case "id":
        if (theObj.getAttribute("id") != TEXT_ID.value){
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
          }else{ 
            theObj.setAttribute("id",TEXT_ID.value);
            editOccurred = true;
            LAST_ID = TEXT_ID.value;
          }
        }
        break;

      case "enabled":
        if (theObj.getAttribute("Enabled") && CBOX_ENABLED.checked == true){
          theObj.removeAttribute("Enabled");
          editOccurred = true;
        }else if (CBOX_ENABLED.checked == false){
          theObj.setAttribute("Enabled","false");
          editOccurred = true;
        }
        break;
        
      case "aKey":
        if (theObj.getAttribute("AccessKey") != TEXT_AKEY.value && TEXT_AKEY.value != ""){
          theObj.setAttribute("AccessKey",TEXT_AKEY.value);
          editOccurred = true;
        }else if (theObj.getAttribute("AccessKey") && TEXT_AKEY.value == ""){
          theObj.removeAttribute("AccessKey");
          editOccurred = true;
        }
        break;
        
      case "toolTip":
        if (theObj.getAttribute("tooltip") != TEXT_TTIP.value && TEXT_TTIP.value != ""){
          theObj.setAttribute("ToolTip",TEXT_TTIP.value);
          editOccurred = true;
        }else if (theObj.getAttribute("tooltip") && TEXT_TTIP.value == ""){
          theObj.removeAttribute("tooltip");
          editOccurred = true;
        }
        break;
        
      case "text":
        if (theObj.getAttribute("Text") != TEXT_TEXT.value && TEXT_TEXT.value != ""){
          theObj.setAttribute("Text",TEXT_TEXT.value,true);
          editOccurred = true;
        }else if (theObj.getAttribute("Text") && TEXT_TEXT.value == ""){
          theObj.removeAttribute("Text");
          editOccurred = true;
        }
        break;
        
    }

    // Only change the document if the editOccurred flag has been set (which we
    // set if a change to the TagEdit object occurred).
    if (editOccurred){
      theObj.setAttribute("runat","server");
      dotNetUtils.replaceSel(theObj.getOuterHTML());
    }
  }  
}


