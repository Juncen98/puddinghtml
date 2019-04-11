//Copyright 2000, 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

var helpDoc = MM.HELP_piASPNETDropDownList;

var CBOX_AUTOPOST;
var CBOX_ENABLED;
var TEXT_ID;
var TEXT_AKEY;
var TEXT_TABIX;
var TEXT_WIDTH;
var TEXT_HEIGHT;
var BU_LISTITEMS;

var LAST_ID = "";

// ********************* API FUNCTIONS ***************************


function canInspectSelection() {
  return true; //comments in html file limit us to just one tag
}


function initializeUI() {
  TEXT_ID = dwscripts.findDOMObject("listID");
  CBOX_ENABLED = dwscripts.findDOMObject("enabled");
  CBOX_AUTOPOST = dwscripts.findDOMObject("autopost");
  TEXT_AKEY = dwscripts.findDOMObject("akey");
  TEXT_TABIX = dwscripts.findDOMObject("tabix");
  TEXT_WIDTH = dwscripts.findDOMObject("widthField");
  TEXT_HEIGHT = dwscripts.findDOMObject("heightField");
  BU_LISTITEMS = dwscripts.findDOMObject("listValues");
  
  // reposition form elements for Windows
  if (navigator.platform.charAt(0)=="W") {
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
}


function inspectSelection() {
  var dom = dw.getDocumentDOM();
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
  if (theObj.getAttribute("AutoPostBack")){
    CBOX_AUTOPOST.checked = (theObj.getAttribute("AutoPostBack").toLowerCase() == "true")?true:false;
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
          if (TEXT_ID.value != "" && !dotNetUtils.isUniqueID(TEXT_ID.value)){
            var msg = MM.MSG_NeedUniqueID;
            msg = msg.replace(/%s/,TEXT_ID.value);
            alert(msg);
            TEXT_ID.value = LAST_ID;
          }else if (TEXT_ID.value != "" && !dwscripts.isValidVarName(TEXT_ID.value)){
            alert(MM.MSG_InvalidIDAutoFix);
            TEXT_ID.value = LAST_ID;
          }else{ 
            var sel = dom.getSelection();
            var wholeDoc = dom.documentElement.outerHTML;
            var start = 0;

            // If the dropdownlist has listitems defined, either statically or dynamically...
            if ((theObj.getInnerHTML() != null && theObj.getInnerHTML().indexOf('<asp:listitem') != -1) || theObj.getAttribute("DataSource")){
              // Search backwards from the current selection to find the string of dynamic code above 
              // the dropdownlist that tells which item should be selected. We'll need to change the ID
              // in this code as well as in the asp:dropdownlist tag.
              start = wholeDoc.lastIndexOf('<%',sel[0]);
              var selectStr = wholeDoc.substring(start,wholeDoc.indexOf('%>',start));
              if (selectStr.indexOf('FindByValue(') != -1){
                var id = selectStr.match(/<%\s*([^\.]+)\.SelectedIndex/);
                if (id[1] == LAST_ID){
                  var re = new RegExp(id[1],"g");
                  selectStr = selectStr.replace(re,TEXT_ID.value) + '%>';
                  theObj.setAttribute("id",TEXT_ID.value);
                  var newDocumentContents = wholeDoc.substr(0, start);
                  newDocumentContents += selectStr + theObj.getOuterHTML();
                  newDocumentContents += wholeDoc.substr(sel[1]);
                  dom.documentElement.outerHTML = newDocumentContents;
    
                  var index = (selectStr + theObj.getOuterHTML()).toLowerCase().indexOf('<asp:dropdownlist');
                  // Add 5 or 6 to allow for line breaks and put the selection inside the 
                  // asp:dropdownlist tag.
                  dom.setSelection(start+index+5,start+index+6);
                }
              }else{
                theObj.setAttribute("id",TEXT_ID.value);
                editOccurred = true;
                LAST_ID = TEXT_ID.value;
              }
            }else{
              theObj.setAttribute("id",TEXT_ID.value);
              editOccurred = true;
              LAST_ID = TEXT_ID.value;
            }
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
    }

    // Only change the document if the editOccurred flag has been set (which we
    // set if a change to the TagEdit object occurred).
    if (editOccurred){
      theObj.setAttribute("runat","server");
      dotNetUtils.replaceSel(theObj.getOuterHTML());
    }
  }  
}
