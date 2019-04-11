// Copyright 2000, 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.


//form field names:
//Keywords - text field

// *********** GLOBAL VARS *****************

var helpDoc = MM.HELP_inspKeywords;


// ******************** API ****************************
function canInspectSelection(){
  var dom = dw.getDocumentDOM();
  var metaObj = dom.getSelectedNode();

  if (!metaObj || !metaObj.getAttribute) return false;

  return (metaObj.tagName && metaObj.tagName=="META" &&
          metaObj.getTranslatedAttribute("name") && 
          metaObj.getTranslatedAttribute("name").toLowerCase()=="keywords");
}

function inspectSelection(){
  var dom = dw.getDocumentDOM();
  var selObj = dom.getSelectedNode();
  if (!selObj || !selObj.getAttribute) return;

  var inspectorState = arguments[0],currKeyVal;
  var contentLayer = findObject("contentField");
  var contentCell = contentLayer.getElementsByTagName("TD").item(0);
  var minText= '<textarea name="Keywords" onBlur="setMetaTag()" '
  + 'style="width:350px;height:32px" rows="2" wrap="virtual"></textarea>'
  var maxText='<textarea name="Keywords" onBlur="setMetaTag()" '
  + 'style="width:350px;height:76px" rows="4" wrap="virtual"></textarea>';
  //change inspector state if needed
  //the rows=2 and rows=4 check determines whether current state is min or max
  if (inspectorState=="min"&& (findString('rows="4"',contentCell.innerHTML)||contentCell.innerHTML=="")){
    currKeyVal = findObject("Keywords").value;
    contentCell.innerHTML=minText;
	findObject("Keywords").value = currKeyVal;
  }	
  else if (inspectorState=="max" && (findString('rows="2"',contentCell.innerHTML)||contentCell.innerHTML=="")){
    currKeyVal = findObject("Keywords").value; 
    contentCell.innerHTML=maxText; 
	findObject("Keywords").value = currKeyVal;
  }	   

  if (selObj.getAttribute("content"))	 
    findObject("Keywords").value= selObj.getAttribute("content");
  else
    findObject("Keywords").value="";
  showHideTranslated();
}

function findString(stringToFind,stringToLookIn){
  if (stringToLookIn.indexOf(stringToFind)==-1)
    return false;
  return true;	
}


// ******************** LOCAL FUNCTIONS ****************************

function setMetaTag(){
  dw.getDocumentDOM().getSelectedNode().setAttribute("content",findObject("Keywords").value);
}


