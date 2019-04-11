// Copyright 2000, 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.
//form field names:
//Description - text field

// *********** GLOBAL VARS *****************************

var helpDoc = MM.HELP_inspDescription;

// ******************** API ****************************
function canInspectSelection(){
  var dom = dw.getDocumentDOM();
  var metaObj = dom.getSelectedNode();
  if (!metaObj || !metaObj.getAttribute) return false;

  return (metaObj.tagName && metaObj.tagName == "META" &&
          metaObj.getTranslatedAttribute("name") && 
          metaObj.getTranslatedAttribute("name").toLowerCase()=="description");
}

function inspectSelection(){
  var dom = dw.getDocumentDOM();
  var metaObj = dom.getSelectedNode();
  if (!metaObj || !metaObj.getAttribute) return;
  
  var inspectorState = arguments[0],currKeyVal;
  var description = findObject("Description");
  var contentLayer = findObject("contentField");
  var contentCell = contentLayer.getElementsByTagName("TD").item(0);
  var minText= '<textarea name="Description" onBlur="setMetaTag()" '
  + 'style="width:350px;height:32px" rows="2" wrap="virtual"></textarea>'
  var maxText='<textarea name="Description" onBlur="setMetaTag()" '+
  'style="width:350px;height:76px" rows="4" wrap="virtual"></textarea>';
  //change inspector state if needed
  //the rows=X check determines whether current state is min or max
  if (inspectorState=="min"&& (findString('rows="4"',contentCell.innerHTML)||contentCell.innerHTML=="")){
    currKeyVal = description.value;
    contentCell.innerHTML = minText;
    // re-find the Description field (because it has just been replaced) before
    // setting its value.
    description = findObject("Description");
    description.value = currKeyVal;
  }	
  else if (inspectorState=="max" && (findString('rows="2"',contentCell.innerHTML)||contentCell.innerHTML=="")){
    currKeyVal = description.value; 
    contentCell.innerHTML = maxText; 
    // re-find the Description field (because it has just been replaced) before
    // setting its value.
    description = findObject("Description");
    description.value = currKeyVal;
  }
  if (metaObj.getAttribute("content"))	 
    description.value = metaObj.getAttribute("content");
  else
    description.value="";	

  showHideTranslated();
}

function findString(stringToFind,stringToLookIn){
  if (stringToLookIn.indexOf(stringToFind)==-1)
    return false;
  return true;	
}


// ******************** LOCAL FUNCTIONS ****************************

function setMetaTag(){
  dw.getDocumentDOM().getSelectedNode().setAttribute("content",findObject("Description").value);
}



