//Copyright 2000, 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

var helpDoc = MM.HELP_piASPNETImageButton;

var TEXT_ID;
var TEXT_ALT;
var TEXT_URL;
var TEXT_CMD;
var TEXT_CMDARG;
var TEXT_HEIGHT;
var TEXT_WIDTH;
var CP_BDRCOLOR;
var TEXT_BDRCOLOR;
var TEXT_BORDER;
var TEXT_TABIX;
var TEXT_AKEY;
var TEXT_TTIP;
var LIST_BDRSTYLE;

var LAST_ID = "";

var borderStyleNames = theStylesCap;
var borderStyleVals = theStylesVal;
borderStyleNames.unshift("");
borderStyleVals.unshift("");


// ********************* API FUNCTIONS ***************************


function canInspectSelection() {
  return true; //comments in html file limit us to just one tag
}


function initializeUI() {
  TEXT_ID = dwscripts.findDOMObject("buttonID");
  TEXT_ALT = dwscripts.findDOMObject("altText");
  TEXT_URL = dwscripts.findDOMObject("imgURL");
  TEXT_CMD = dwscripts.findDOMObject("cmd");
  TEXT_CMDARG = dwscripts.findDOMObject("cmdArg");
  TEXT_HEIGHT = dwscripts.findDOMObject("buttonHeight");
  TEXT_WIDTH = dwscripts.findDOMObject("buttonWidth");
  CP_BDRCOLOR = dwscripts.findDOMObject("bdrColor");
  TEXT_BDRCOLOR = dwscripts.findDOMObject("bdrColorField");
  TEXT_BORDER = dwscripts.findDOMObject("border");
  TEXT_TABIX = dwscripts.findDOMObject("tabix");
  TEXT_AKEY = dwscripts.findDOMObject("akey");
  TEXT_TTIP = dwscripts.findDOMObject("tooltip");
  LIST_BDRSTYLE = new ListControl("borderStyle");
    
  LIST_BDRSTYLE.setAll(borderStyleNames,borderStyleVals);
  LIST_BDRSTYLE.pickValue("");
  
  CP_BDRCOLOR.value = "";
  TEXT_BDRCOLOR.value = ""; 
  TEXT_ID.value = "";
  TEXT_URL.value = "";
  TEXT_ALT.value = "";
  TEXT_CMD.value = "";
  TEXT_CMDARG.value = "";
  TEXT_HEIGHT.value = "";
  TEXT_WIDTH.value = "";
  TEXT_BORDER.value = "";
  TEXT_TABIX.value = "";
  TEXT_AKEY.value = "";
  TEXT_TTIP.value = "";

    
  // reposition form elements for Windows
  if (navigator.platform.charAt(0)=="W") {
  // Move icon into position
  document.layers["image"].top = 2;
  document.layers["image"].left = 4;
  document.layers["idBoxLayer"].top = 2;
  document.layers["idBoxLayer"].left = 43;
  }
}


function inspectSelection() {
  var dom = dw.getDocumentDOM();
  var theObj = new TagEdit(dom.getSelectedNode().outerHTML);
  // Call initializeUI() here; it's how the global variables get
  // initialized. The onLoad event on the body tag is never triggered
  // in inspectors.
  initializeUI();
  
  if (theObj.getAttribute("BorderColor")){
    TEXT_BDRCOLOR.value = theObj.getAttribute("BorderColor");
    CP_BDRCOLOR.value = TEXT_BDRCOLOR.value;
  }    
  if (theObj.getAttribute("BorderWidth")){
    TEXT_BORDER.value = theObj.getAttribute("BorderWidth");
  }  
  if (theObj.getAttribute("CommandArgument")){
    TEXT_CMDARG.value = theObj.getAttribute("CommandArgument");
  }  
  if (theObj.getAttribute("CommandName")){
    TEXT_CMD.value = theObj.getAttribute("CommandName");
  }  
  if (theObj.getAttribute("Height")){
    TEXT_HEIGHT.value = theObj.getAttribute("Height");
  }  
  if (theObj.getAttribute("Width")){
    TEXT_WIDTH.value = theObj.getAttribute("Width");
  }  
  if (theObj.getAttribute("ID")){
    TEXT_ID.value = theObj.getAttribute("ID");
    LAST_ID = TEXT_ID.value;
  }  
  if (theObj.getAttribute("AlternateText")){
    TEXT_ALT.value = theObj.getAttribute("AlternateText");
  }  
  if (theObj.getAttribute("ImageUrl")){
    TEXT_URL.value = theObj.getAttribute("ImageUrl");
  }  
  if (theObj.getAttribute("TabIndex")){
    TEXT_TABIX.value = theObj.getAttribute("TabIndex");
  }  
  if (theObj.getAttribute("AccessKey")){
    TEXT_AKEY.value = theObj.getAttribute("AccessKey");
  }
  if (theObj.getAttribute("ToolTip")){
    TEXT_TTIP.value = theObj.getAttribute("ToolTip");
  }
  if (theObj.getAttribute("borderstyle")){
    LIST_BDRSTYLE.pickValue(theObj.getAttribute("borderstyle"), new Function("a,b", "return (a.toLowerCase() == b.toLowerCase());"));
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
    
      case "imgURL":
        if (theObj.getAttribute("imageUrl") != TEXT_URL.value && TEXT_URL.value != ""){
          theObj.setAttribute("ImageUrl",TEXT_URL.value);
          editOccurred = true;
        }else if (theObj.getAttribute("imageUrl") && TEXT_URL.value == ""){
          theObj.removeAttribute("imageUrl");
          editOccurred = true;
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
        updateTag("imgURL");
        break;
        
      case "borderColor":
        if (theObj.getAttribute("BorderColor") != TEXT_BDRCOLOR.value && TEXT_BDRCOLOR.value != ""){
          theObj.setAttribute("BorderColor",TEXT_BDRCOLOR.value);
          editOccurred = true;
        }else if (theObj.getAttribute("BorderColor") && TEXT_BDRCOLOR.value == ""){
          theObj.removeAttribute("BorderColor");
          editOccurred = true;
        }
        break;
        
      case "border":
        if (TEXT_BORDER.value != ""){
          if (TEXT_BORDER.value != parseInt(TEXT_BORDER.value) || parseInt(TEXT_BORDER.value) < 0){
            alert(MM.MSG_ValueGreaterThanOrEqualToZero);
            if (theObj.getAttribute("BorderWidth"))
              TEXT_BORDER.value = theObj.getAttribute("BorderWidth");
            else
              TEXT_BORDER.value = "";            
          }else if (theObj.getAttribute("BorderWidth") != TEXT_BORDER.value){
            theObj.setAttribute("BorderWidth",TEXT_BORDER.value);
            editOccurred = true;
          }
        }else if (theObj.getAttribute("BorderWidth")){
          theObj.removeAttribute("BorderWidth");
          editOccurred = true;
        }
        break;
        
      case "commandArgument":
        if (theObj.getAttribute("CommandArgument") != TEXT_CMDARG.value && TEXT_CMDARG.value != ""){
          theObj.setAttribute("CommandArgument",TEXT_CMDARG.value);
          editOccurred = true;
        }else if (theObj.getAttribute("CommandArgument") && TEXT_CMDARG.value == ""){
          theObj.removeAttribute("CommandArgument");
          editOccurred = true;
        }
        break;
        
      case "commandName":
        if (theObj.getAttribute("CommandName") != TEXT_CMD.value && TEXT_CMD.value != ""){
          theObj.setAttribute("CommandName",TEXT_CMD.value);
          editOccurred = true;
        }else if (theObj.getAttribute("CommandName") && TEXT_CMD.value == ""){
          theObj.removeAttribute("CommandName");
          editOccurred = true;
        }
        break;
        
     case "height":
        if (TEXT_HEIGHT.value != ""){
          if (TEXT_HEIGHT.value != parseInt(TEXT_HEIGHT.value) || parseInt(TEXT_HEIGHT.value) < 0){
            alert(MM.MSG_ValueGreaterThanOrEqualToZero);
            if (theObj.getAttribute("Height"))
              TEXT_HEIGHT.value = theObj.getAttribute("Height");
            else
              TEXT_HEIGHT.value = "";            
          }else if (theObj.getAttribute("Height") != TEXT_HEIGHT.value){
            theObj.setAttribute("Height",TEXT_HEIGHT.value);
            editOccurred = true;
          }
        }else if (theObj.getAttribute("Height")){
          theObj.removeAttribute("Height");
          editOccurred = true;
        }
        break;
        
      case "width":
        if (TEXT_WIDTH.value != ""){
          if (TEXT_WIDTH.value != parseInt(TEXT_WIDTH.value) || parseInt(TEXT_WIDTH.value) < 0){
            alert(MM.MSG_ValueGreaterThanOrEqualToZero);
            if (theObj.getAttribute("Width"))
              TEXT_WIDTH.value = theObj.getAttribute("Width");
            else
              TEXT_WIDTH.value = "";            
          }else if (theObj.getAttribute("Width") != TEXT_WIDTH.value){
            theObj.setAttribute("Width",TEXT_WIDTH.value);
            editOccurred = true;
          }
        }else if (theObj.getAttribute("Width")){
          theObj.removeAttribute("Width");
          editOccurred = true;
        }
        break;
        
      case "altText":
        if (theObj.getAttribute("alternateText") != TEXT_ALT.value && TEXT_ALT.value != ""){
          theObj.setAttribute("AlternateText",TEXT_ALT.value);
          editOccurred = true;
        }else if (theObj.getAttribute("alternateText") && TEXT_ALT.value == ""){
          theObj.removeAttribute("alternateText");
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
        
      case "accessKey":
        if (theObj.getAttribute("AccessKey") != TEXT_AKEY.value && TEXT_AKEY.value != ""){
          theObj.setAttribute("AccessKey",TEXT_AKEY.value);
          editOccurred = true;
        }else if (theObj.getAttribute("AccessKey") && TEXT_AKEY.value == ""){
          theObj.removeAttribute("AccessKey");
          editOccurred = true;
        }
        break;
        
      case "borderStyle":
        if (theObj.getAttribute("BorderStyle") != LIST_BDRSTYLE.getValue() && LIST_BDRSTYLE.getValue() != ""){
          theObj.setAttribute("BorderStyle",LIST_BDRSTYLE.getValue());
          editOccurred = true;
        }else if (theObj.getAttribute("BorderStyle") && LIST_BDRSTYLE.getValue() == ""){
          theObj.removeAttribute("BorderStyle");
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


