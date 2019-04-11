// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.
//form field names:
//metaAttribute - drop down menu - name is [0] and http is [1]
//metaValue - text field
//metaContent - text field

// *********** GLOBAL VARS *****************************

var helpDoc = MM.HELP_inspMeta;

// ******************** API ****************************
function canInspectSelection(){
  var dom = dw.getDocumentDOM();
  var metaObj = dom.getSelectedNode();
  return (metaObj.tagName && metaObj.tagName=="META");
}

function inspectSelection(){
  var dom = dw.getDocumentDOM();
  var metaObj = dom.getSelectedNode();

  if (String(metaObj.tagName) == "undefined") return;
  
  var metaValue = findObject("metaValue");
  var metaAttribute = findObject("metaAttribute");
  var metaContent = findObject("metaContent");
  var metaImage = findObject("metaImage");
  
  var useNameAttr = metaObj.getAttribute("name") != null && metaObj.getAttribute("name") != undefined;
  var thisContent = metaObj.getAttribute("content");
  // Convert any returns in the Content to spaces before populating field.
  // If this replacement results in double spaces, convert to 
  // single spaces.
  // (This is just to be doubly-safe; we already strip returns when the
  // user inserts a Meta tag from the Insert bar.)
  if (thisContent && thisContent != undefined){
    thisContent = thisContent.replace(/[\n\r]/g," ");
    thisContent = thisContent.replace(/\s+/g, " ");
  }

  var thisAttribute;
  

 //fill in PI
  if (useNameAttr){
    metaAttribute.selectedIndex = 0;
  }else{
    metaAttribute.selectedIndex = 1;
  }
  
  if (useNameAttr){
    thisAttribute = metaObj.getAttribute("name");
	  metaImage.src="name.gif";
  }
  else{
    if (metaObj.getAttribute("http-equiv") != undefined){
      thisAttribute = metaObj.getAttribute("http-equiv");
    }else{
      thisAttribute = "";
    }
  	metaImage.src="http.gif";
  }	
	
  //fill in attribute value if present, otherwise fill text field with empty string	
  metaValue.value = thisAttribute;	
  //fill in meta content if present, otherwise fill text field with empty string
  metaContent.value = (thisContent != undefined && thisContent != null)?thisContent:"";
  showHideTranslated();	
}




// ******************** LOCAL FUNCTIONS ****************************

function setMetaTag(){
  var dom = dw.getDocumentDOM();
  var metaObj = dom.getSelectedNode();

  var metaValue = findObject("metaValue").value;
  var metaAttribute = findObject("metaAttribute");
  var metaContent = findObject("metaContent");
  var metaImage = findObject("metaImage");
 
  if (metaAttribute.selectedIndex == 0){
    metaObj.removeAttribute("http-equiv");
    metaObj.setAttribute("name",metaValue);
  } else {
    metaObj.removeAttribute("name");
    metaObj.setAttribute("http-equiv",metaValue);
  }
   //attribute is removed and then re-applied so that content attribute
   //always appears after name and http-equiv attributes
   metaObj.removeAttribute("content"); 
   metaObj.setAttribute("content",metaContent.value);

   // set to http-equiv  
   if (metaAttribute.selectedIndex == 1 && metaValue.toLowerCase() ==  "content-type"){
	   dom.setCharSet(metaContent.value);  // this causes dreamweaver to recognize the changes to the encoding and update the fonts in the code view
	} 
}





