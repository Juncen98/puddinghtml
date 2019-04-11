// Copyright 2000, 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.


//form field names:
//Title - text field

// *********** GLOBAL VARS *****************************

var helpDoc = MM.HELP_inspTitle;
var TEXT_TITLE;

// ******************** API ****************************
function canInspectSelection(){
  var dom = dw.getDocumentDOM();
  var titleObj = dom.getSelectedNode();

  //accept if the selected node is text or if it is the title tag 
  return (titleObj.nodeType==Node.TEXT_NODE || (titleObj.nodeType=Node.ELEMENT_NODE && titleObj.tagName=="TITLE"));
}

function inspectSelection(){
  var dom = dw.getDocumentDOM();
  var titleObj = dom.getSelectedNode();
 
  while (titleObj.nodeType!=Node.ELEMENT_NODE ) //while an element node (the title one) is not selected
    titleObj=titleObj.parentNode; //traverse up the tree
    	
  TEXT_TITLE = findObject("Title");
  TEXT_TITLE.value = dwscripts.entityNameDecode(titleObj.innerHTML);
  showHideTranslated();
}


// ******************** LOCAL FUNCTIONS ****************************

function setTitleTag(){
  var dom = dw.getDocumentDOM();
  var titleObj = dom.getSelectedNode();

//while an element node (the title one) is not selected
  while (titleObj.nodeType!=Node.ELEMENT_NODE ) 
    titleObj=titleObj.parentNode; //traverse up the tree
  
  if (titleObj.innerHTML != TEXT_TITLE.value){
    titleObj.innerHTML = dwscripts.entityNameEncode(TEXT_TITLE.value);   
  }	
}


