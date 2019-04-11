//Copyright 2000, 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

var helpDoc = MM.HELP_piASPNETCheckBoxList;

var CBOX_AUTOPOST;
var CBOX_ENABLED;
var TEXT_ID;
var TEXT_AKEY;
var TEXT_TABIX;
var TEXT_WIDTH;
var TEXT_HEIGHT;
var TEXT_TTIP;
var TEXT_CELLPAD;
var TEXT_CELLSPACE;
var TEXT_REPEATCOLS;
var BU_LISTITEMS;
var LIST_REPEATDIR;
var LIST_REPEATLAYOUT;
var LIST_ALIGN;

var LAST_ID = "";

// the values on the right side of the = come from loc_strings.js
// and strings.js, which live in the TagLibraries/ASPNet folder.
// iow, we're using the same strings in the object dialogs that we 
// use in the tag dialogs. 
var repeatDirNames = theRepeatDirRBLCap;
var repeatDirVals = theRepeatDirRBLVal;
repeatDirNames.unshift("");
repeatDirVals.unshift("");

var repeatLayoutNames = theLayoutsCap;
var repeatLayoutVals = theLayoutsVal;
repeatLayoutNames.unshift("");
repeatLayoutVals.unshift("");

var textAlignNames = theAlignmentsLRCap;
var textAlignVals = theAlignmentsLRVal;
textAlignNames.unshift("");
textAlignVals.unshift("");

// ********************* API FUNCTIONS ***************************


function canInspectSelection() {
  return true; //comments in html file limit us to just one tag
}


function initializeUI() {
  TEXT_ID = dwscripts.findDOMObject("listID");
  BU_LISTITEMS = dwscripts.findDOMObject("listValues");
  CBOX_ENABLED = dwscripts.findDOMObject("enabled");
  CBOX_AUTOPOST = dwscripts.findDOMObject("autopost");
  TEXT_AKEY = dwscripts.findDOMObject("akey");
  TEXT_TABIX = dwscripts.findDOMObject("tabix");
  TEXT_WIDTH = dwscripts.findDOMObject("widthField");
  TEXT_HEIGHT = dwscripts.findDOMObject("heightField");
  TEXT_TTIP = dwscripts.findDOMObject("toolTip");
  TEXT_CELLPAD = dwscripts.findDOMObject("cellPad");
  TEXT_CELLSPACE = dwscripts.findDOMObject("cellSpace");
  TEXT_REPEATCOLS = dwscripts.findDOMObject("repeatCols");

  LIST_REPEATDIR = new ListControl("repeatDir");
  LIST_REPEATDIR.setAll(repeatDirNames,repeatDirVals);
  LIST_REPEATDIR.pickValue("");

  LIST_REPEATLAYOUT = new ListControl("repeatLayout");
  LIST_REPEATLAYOUT.setAll(repeatLayoutNames,repeatLayoutVals);
  LIST_REPEATLAYOUT.pickValue("");

  LIST_ALIGN = new ListControl("textAlign");
  LIST_ALIGN.setAll(textAlignNames,textAlignVals);
  LIST_ALIGN.pickValue("");
  
  // reposition form elements for Windows
  if (navigator.platform.charAt(0)=="W" && findObject("bottomLayer")) {
    // Make layers less wide on Windows.
    document.layers["topLayer"].width = 400;
    document.layers["bottomLayer"].width = 523;
    
    // Move icon into position
    document.layers["image"].top = 2;
    document.layers["image"].left = 4;
    document.layers["idBoxLayer"].top = 2;
    document.layers["idBoxLayer"].left = 43;

    // Adjust font size of idbox label
    dwscripts.findDOMObject("idLabel").setAttribute("style","font-size:98%");
  }

  TEXT_ID.value = "";
  CBOX_ENABLED.checked = true;
  CBOX_AUTOPOST.checked = false;
  TEXT_AKEY.value = "";
  TEXT_TABIX.value = "";
  TEXT_WIDTH.value = "";
  TEXT_HEIGHT.value = "";
  TEXT_TTIP.value = "";
  TEXT_CELLPAD.value = "";
  TEXT_CELLSPACE.value = "";
  TEXT_REPEATCOLS.value = "";
}


function inspectSelection() {
  var dom = dw.getDocumentDOM();
  if ( !dom )
	return;
  var theObj = new TagEdit(dom.getSelectedNode().outerHTML);
  initializeUI();
    
  if (theObj.getAttribute("ID")){
    TEXT_ID.value = theObj.getAttribute("ID");
    LAST_ID = TEXT_ID.value;
  }  
  if (theObj.getAttribute("TabIndex")){
    TEXT_TABIX.value = theObj.getAttribute("TabIndex");
  }
  if (theObj.getAttribute("Width")){
    TEXT_WIDTH.value = theObj.getAttribute("Width");
  }
  if (theObj.getAttribute("Height")){
    TEXT_HEIGHT.value = theObj.getAttribute("Height");
  }
  if (theObj.getAttribute("AccessKey")){
    TEXT_AKEY.value = theObj.getAttribute("AccessKey");
  }
  if (theObj.getAttribute("CellPadding")){
    TEXT_CELLPAD.value = theObj.getAttribute("CellPadding");
  }
  if (theObj.getAttribute("CellSpacing")){
    TEXT_CELLSPACE.value = theObj.getAttribute("CellSpacing");
  }
  if (theObj.getAttribute("RepeatColumns")){
    TEXT_REPEATCOLS.value = theObj.getAttribute("RepeatColumns");
  }
  if (theObj.getAttribute("ToolTip")){
    TEXT_TTIP.value = theObj.getAttribute("ToolTip");
  }
  if (theObj.getAttribute("AutoPostBack")){
    CBOX_AUTOPOST.checked = (theObj.getAttribute("AutoPostBack").toLowerCase() == "true")?true:false;
  }
  if (theObj.getAttribute("Enabled")){
    CBOX_ENABLED.checked = (theObj.getAttribute("Enabled").toLowerCase() == "false")?false:true;
  }
  if (theObj.getAttribute("TextAlign")){
    LIST_ALIGN.pickValue(theObj.getAttribute("TextAlign"),new Function("val,attVal", "return (val.toLowerCase() == attVal.toLowerCase());"));
  }
  if (theObj.getAttribute("RepeatDirection")){
    LIST_REPEATDIR.pickValue(theObj.getAttribute("RepeatDirection"),new Function("val,attVal", "return (val.toLowerCase() == attVal.toLowerCase());"));
  }
  if (theObj.getAttribute("RepeatLayout")){
    LIST_REPEATLAYOUT.pickValue(theObj.getAttribute("RepeatLayout"),new Function("val,attVal", "return (val.toLowerCase() == attVal.toLowerCase());"));
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
          if (TEXT_ID.value != "" && !dotNetUtils.isUniqueID(TEXT_ID.value)){
            var msg = MM.MSG_NeedUniqueID;
            msg = msg.replace(/%s/,TEXT_ID.value);
            alert(msg);
            TEXT_ID.value = LAST_ID;
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
    
      case "autoPost":
        if (theObj.getAttribute("AutoPostBack") && CBOX_AUTOPOST.checked == false){
          theObj.removeAttribute("AutoPostBack");
          editOccurred = true;
        }else if (CBOX_AUTOPOST.checked == true){
          theObj.setAttribute("AutoPostBack","true");
          editOccurred = true;
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

      case "akey":
        if (theObj.getAttribute("AccessKey") != TEXT_AKEY.value && TEXT_AKEY.value != ""){
          theObj.setAttribute("AccessKey",TEXT_AKEY.value);
          editOccurred = true;
        }else if (theObj.getAttribute("AccessKey") && TEXT_AKEY.value == ""){
          theObj.removeAttribute("AccessKey");
          editOccurred = true;
        }
        break;
        
      case "toolTip":
        if (theObj.getAttribute("ToolTip") != TEXT_TTIP.value && TEXT_TTIP.value != ""){
          theObj.setAttribute("ToolTip",TEXT_TTIP.value);
          editOccurred = true;
        }else if (theObj.getAttribute("ToolTip") && TEXT_TTIP.value == ""){
          theObj.removeAttribute("ToolTip");
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

      case "cellPad":
        if (TEXT_CELLPAD.value != ""){
          if (TEXT_CELLPAD.value != parseInt(TEXT_CELLPAD.value) || parseInt(TEXT_CELLPAD.value) < 0){
            alert(MM.MSG_ValueGreaterThanOrEqualToZero);
            if (theObj.getAttribute("CellPadding"))
              TEXT_CELLPAD.value = theObj.getAttribute("CellPadding");
            else
              TEXT_CELLPAD.value = "";            
          }else if (theObj.getAttribute("CellPadding") != TEXT_CELLPAD.value){
            theObj.setAttribute("CellPadding",TEXT_CELLPAD.value);
            editOccurred = true;
          }
        }else if (theObj.getAttribute("CellPadding")){
          theObj.removeAttribute("CellPadding");
          editOccurred = true;
        }
        break;

      case "cellSpace":
        if (TEXT_CELLSPACE.value != ""){
          if (TEXT_CELLSPACE.value != parseInt(TEXT_CELLSPACE.value) || parseInt(TEXT_CELLSPACE.value) < 0){
            alert(MM.MSG_ValueGreaterThanOrEqualToZero);
            if (theObj.getAttribute("CellSpacing"))
              TEXT_CELLSPACE.value = theObj.getAttribute("CellSpacing");
            else
              TEXT_CELLSPACE.value = "";            
          }else if (theObj.getAttribute("CellSpacing") != TEXT_CELLSPACE.value){
            theObj.setAttribute("CellSpacing",TEXT_CELLSPACE.value);
            editOccurred = true;
          }
        }else if (theObj.getAttribute("CellSpacing")){
          theObj.removeAttribute("CellSpacing");
          editOccurred = true;
        }
        break;

      case "repeatCols":
        if (TEXT_REPEATCOLS.value != ""){
          if (TEXT_REPEATCOLS.value != parseInt(TEXT_REPEATCOLS.value) || parseInt(TEXT_REPEATCOLS.value) < 0){
            alert(MM.MSG_ValueGreaterThanOrEqualToZero);
            if (theObj.getAttribute("RepeatColumns"))
              TEXT_REPEATCOLS.value = theObj.getAttribute("RepeatColumns");
            else
              TEXT_REPEATCOLS.value = "";            
          }else if (theObj.getAttribute("RepeatColumns") != TEXT_REPEATCOLS.value){
            theObj.setAttribute("RepeatColumns",TEXT_REPEATCOLS.value);
            editOccurred = true;
          }
        }else if (theObj.getAttribute("RepeatColumns")){
          theObj.removeAttribute("RepeatColumns");
          editOccurred = true;
        }
        break;

      case "textAlign":
        if (theObj.getAttribute("TextAlign") != LIST_ALIGN.getValue() && LIST_ALIGN.getValue() != ""){
         theObj.setAttribute("TextAlign",LIST_ALIGN.getValue());
          editOccurred = true;
		    }else if (theObj.getAttribute("TextAlign") && LIST_ALIGN.getValue() == ""){
		      theObj.removeAttribute("TextAlign");  
          editOccurred = true;
        }
        break;

      case "repeatDir":
        if (theObj.getAttribute("RepeatDirection") != LIST_REPEATDIR.getValue() && LIST_REPEATDIR.getValue() != ""){
         theObj.setAttribute("RepeatDirection",LIST_REPEATDIR.getValue());
          editOccurred = true;
		    }else if (theObj.getAttribute("RepeatDirection") && LIST_REPEATDIR.getValue() == ""){
		      theObj.removeAttribute("RepeatDirection");  
          editOccurred = true;
        }
        break;

      case "repeatLayout":
        if (theObj.getAttribute("RepeatLayout") != LIST_REPEATLAYOUT.getValue() && LIST_REPEATLAYOUT.getValue() != ""){
         theObj.setAttribute("RepeatLayout",LIST_REPEATLAYOUT.getValue());
          editOccurred = true;
		    }else if (theObj.getAttribute("RepeatLayout") && LIST_REPEATLAYOUT.getValue() == ""){
		      theObj.removeAttribute("RepeatLayout");  
          editOccurred = true;
        }
        break;
    }

    if (editOccurred){
      theObj.setAttribute("runat","server");
      dotNetUtils.replaceSel(theObj.getOuterHTML());
    }
  }  
}

function getSBObj(theTagObj){
  var sbObjs = dw.sbi.getServerBehaviors();
  var sbObj = null;
  var theName = (theTagObj.getAttribute("groupname"))?theTagObj.getAttribute("groupname"):theTagObj.getAttribute("id");
  for (var i=0; i < sbObjs.length; i++){
    if (sbObjs[i].getTitle() == MM.LABEL_DynamicRadioGroupTitle + " (" + theName + ")"){
      sbObj = sbObjs[i];
      break;
    }
  }
  return sbObj; 
}
