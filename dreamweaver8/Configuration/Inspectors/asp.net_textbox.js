//Copyright 2000, 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

var helpDoc = MM.HELP_piASPNETTextBox;

var CBOX_AUTOPOST;
var CBOX_READONLY;
var CBOX_WRAP;
var LIST_MODE;
var TEXT_ID;
var TEXT_MAXLEN;
var TEXT_TTIP;
var TEXT_COLS;
var TEXT_ROWS;
var TEXT_TEXT;
var TEXT_TABIX;

var LAST_ID = "";

var textModeNames = theTextModesCap;
var textModeVals = theTextModesVal;
textModeNames.unshift("");
textModeVals.unshift("");


// ********************* API FUNCTIONS ***************************


function canInspectSelection() {
  return true; //comments in html file limit us to just one tag
}


function initializeUI() {
  TEXT_ID = dwscripts.findDOMObject("textboxID");
  CBOX_READONLY = dwscripts.findDOMObject("readOnly");
  CBOX_AUTOPOST = dwscripts.findDOMObject("autopost");
  TEXT_MAXLEN = dwscripts.findDOMObject("maxLength");
  TEXT_TTIP = dwscripts.findDOMObject("tooltip");
  TEXT_COLS = dwscripts.findDOMObject("cols");
  TEXT_ROWS = dwscripts.findDOMObject("rows");
  TEXT_TEXT = dwscripts.findDOMObject("text");
  TEXT_TABIX = dwscripts.findDOMObject("tabix");
  CBOX_WRAP = dwscripts.findDOMObject("wrap");
  
  LIST_MODE = new ListControl("textMode");
  LIST_MODE.setAll(textModeNames,textModeVals);
  LIST_MODE.pickValue("");
    
// reposition form elements for Windows
  if (navigator.platform.charAt(0)=="W"){
    // Move icon into position
    document.layers["image"].top = 2;
    document.layers["image"].left = 4;
    document.layers["idBoxLayer"].top = 2;
    document.layers["idBoxLayer"].left = 43;
  }

  TEXT_ID.value = "";
  TEXT_TEXT.value = "";
  CBOX_READONLY.checked = false;
  CBOX_AUTOPOST.checked = false;
  CBOX_WRAP.checked = false;
  TEXT_MAXLEN.value = "";
  TEXT_COLS.value = "";
  TEXT_ROWS.value = "";
  TEXT_TABIX.value = "";
  TEXT_TTIP.value = "";
}


function inspectSelection() {
  var dom = dw.getDocumentDOM();
  var theObj = new TagEdit(dom.getSelectedNode().outerHTML);
  // Call initializeUI() here; it's how the global variables get
  // initialized. The onLoad event on the body tag is never triggered
  // in inspectors.
  initializeUI();
    
  if (theObj.getAttribute("TextMode")){
    LIST_MODE.pickValue(theObj.getAttribute("TextMode"), new Function("a,b", "return (a.toLowerCase() == b.toLowerCase());"));
    if (LIST_MODE.getValue() == 'MultiLine'){
      TEXT_ROWS.removeAttribute("disabled");
    }
  }
  if (theObj.getAttribute("ID")){
    TEXT_ID.value = theObj.getAttribute("ID");
    LAST_ID = TEXT_ID.value;
  }  
  if (theObj.getAttribute("MaxLength")){
    TEXT_MAXLEN.value = theObj.getAttribute("MaxLength");
  }  
  if (theObj.getAttribute("TabIndex")){
    TEXT_TABIX.value = theObj.getAttribute("TabIndex");
  }  
  if (theObj.getAttribute("Text")){
    TEXT_TEXT.value = theObj.getAttribute("Text");
  }  
  if (theObj.getAttribute("Columns")){
    TEXT_COLS.value = theObj.getAttribute("Columns");
  }  
  if (theObj.getAttribute("Rows")){
    TEXT_ROWS.value = theObj.getAttribute("Rows");
  }
  if (theObj.getAttribute("ToolTip")){
    TEXT_TTIP.value = theObj.getAttribute("ToolTip");
  }
  if (theObj.getAttribute("AutoPostBack")){
    CBOX_AUTOPOST.checked = (theObj.getAttribute("AutoPostBack").toLowerCase() == "true")?true:false;
  }else{
    CBOX_AUTOPOST.checked = false;
  }
  if (theObj.getAttribute("ReadOnly")){
    CBOX_READONLY.checked = (theObj.getAttribute("ReadOnly").toLowerCase() == "true")?true:false;
  }else{
    CBOX_READONLY.checked = false;
  }
  if (theObj.getAttribute("Wrap")){
    CBOX_WRAP.checked = (theObj.getAttribute("Wrap").toLowerCase() == "true")?true:false;
  }else{
    CBOX_WRAP.checked = true;
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
    
      case "cols":
        if (TEXT_COLS.value != ""){
          if (TEXT_COLS.value != parseInt(TEXT_COLS.value) || parseInt(TEXT_COLS.value) <= 0){
            alert(MM.MSG_ValueGreaterThanZero);
            if (theObj.getAttribute("Columns"))
              TEXT_COLS.value = theObj.getAttribute("Columns");
            else
              TEXT_COLS.value = "";            
          }else if (theObj.getAttribute("Columns") != TEXT_COLS.value){
            theObj.setAttribute("Columns",TEXT_COLS.value);
            editOccurred = true;
          }
        }else if (theObj.getAttribute("Columns")){
          theObj.removeAttribute("Columns");
          editOccurred = true;
        }
        break;
        
      case "rows":
        if (TEXT_ROWS.value != ""){
          if (TEXT_ROWS.value != parseInt(TEXT_ROWS.value) || parseInt(TEXT_ROWS.value) <= 0){
            alert(MM.MSG_ValueGreaterThanZero);
            if (theObj.getAttribute("Rows"))
              TEXT_ROWS.value = theObj.getAttribute("Rows");
            else
              TEXT_ROWS.value = "";            
          }else if (theObj.getAttribute("Rows") != TEXT_ROWS.value){
            theObj.setAttribute("Rows",TEXT_ROWS.value);
            editOccurred = true;
          }
        }else if (theObj.getAttribute("Rows")){
          theObj.removeAttribute("Rows");
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
        
      case "maxLength":
        if (TEXT_MAXLEN.value != ""){
          if (TEXT_MAXLEN.value != parseInt(TEXT_MAXLEN.value) || parseInt(TEXT_MAXLEN.value) <= 0){
            alert(MM.MSG_ValueGreaterThanZero);
            if (theObj.getAttribute("MaxLength"))
              TEXT_MAXLEN.value = theObj.getAttribute("MaxLength");
            else
              TEXT_MAXLEN.value = "";            
          }else if (theObj.getAttribute("MaxLength") != TEXT_MAXLEN.value){
            theObj.setAttribute("MaxLength",TEXT_MAXLEN.value);
            editOccurred = true;
          }
        }else if (theObj.getAttribute("MaxLength")){
          theObj.removeAttribute("MaxLength");
          editOccurred = true;
        }
        break;
        
      case "autoPost":
        if (theObj.getAttribute("AutoPostBack") && CBOX_AUTOPOST.checked == false){
          theObj.removeAttribute("AutoPostBack");
          editOccurred = true;
        }else if (CBOX_AUTOPOST.checked == true){
          theObj.setAttribute("AutoPostBack","true");
          editOccurred = true;
        }
        break;
        
      case "readOnly":
        if (theObj.getAttribute("ReadOnly") && CBOX_READONLY.checked == false){
          theObj.removeAttribute("ReadOnly");
          editOccurred = true;
        }else if (CBOX_READONLY.checked == true){
          theObj.setAttribute("ReadOnly","true");
          editOccurred = true;
        }
        break;
        
      case "wrap":
        if (theObj.getAttribute("Wrap") && CBOX_WRAP.checked == true){
          theObj.removeAttribute("Wrap");
          editOccurred = true;
        }else if (CBOX_WRAP.checked == false){
          theObj.setAttribute("Wrap","false");
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
                
      case "tabIndex":
        if (TEXT_TABIX.value != ""){
          if (TEXT_TABIX.value != parseInt(TEXT_TABIX.value) || parseInt(TEXT_TABIX.value) < 0){
            alert(MM.MSG_ValueGreaterThanOrEqualToZero);
            if (theObj.getAttribute("TabIndex"))
              TEXT_TABIX.value = theObj.getAttribute("TabIndex");
            else
              TEXT_TABIX.value = "";            
          }else if (theObj.getAttribute("TabIndex") != TEXT_TABIX.value){
            theObj.setAttribute("TabIndex",TEXT_TABIX.value);
            editOccurred = true;
          }
        }else if (theObj.getAttribute("TabIndex")){
          theObj.removeAttribute("TabIndex");
          editOccurred = true;
        }
        break;
        
      case "textMode":
        if (theObj.getAttribute("TextMode") != LIST_MODE.getValue() && LIST_MODE.getValue() != ""){
          theObj.setAttribute("TextMode",LIST_MODE.getValue());
          editOccurred = true;
        }else if (theObj.getAttribute("TextMode") && LIST_MODE.getValue() == ""){
          theObj.removeAttribute("TextMode");
          editOccurred = true;
        }
        if (LIST_MODE.getValue().toLowerCase() == 'multiline'){
          TEXT_ROWS.removeAttribute("disabled");
        }else{
          TEXT_ROWS.setAttribute("disabled","true");
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

