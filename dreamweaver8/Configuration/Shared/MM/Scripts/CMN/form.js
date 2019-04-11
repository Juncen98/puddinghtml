//SHARE-IN-MEMORY=true
//
// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.
//
//form.js
//
//Add a form around a given text string if a form does
//not alreay exist in the current document or layer
//
//--------------------------------------------------------------
//   
//IPIsInsideOfForm(){
//isLayer(obj){
//checkForFormTag(formItemStr){


//function: checkForFormTag
//description: given a text string, wraps form tags around it
//if there is not already a form in the current document or layer
function checkForFormTag(formItemStr){
   var uniqueFormName;
   var retVal = formItemStr;
   
   if ( !IPIsInsideOfForm()  ){
      uniqueFormName = createUniqueName("FORM","form");
	  retVal = '<FORM name="'+ uniqueFormName + '">' + formItemStr + '</form>';   
   }

   return retVal;
}


//function: IPisInsideOfForm
//description: determines if the cursor is inside of a form
//             If the selected object is inside of a layer,
//             does not search past the layer, because
//            forms must be inside of layers in Netscape.        
//returns: boolean

function IPIsInsideOfForm(){
   var isInsideOfForm = false;
   var objName;
   
   //get selected object
   var selObj = dw.getDocumentDOM().getSelectedNode();
   
   //climb up the tree, and look for a form tag
   //if a layer, html, or body tag is found, then stop looking
   //and return false
   while ( selObj ){
      
	  //if the tag doesn't have a name (text or comments), climb up the tree
	  if (!selObj.tagName){
	     selObj = selObj.parentNode;
		 continue;
	  }
	    objName = selObj.tagName;
		
	  //if its a form, return true
      if (objName == "FORM"){
	     isInsideOfForm = true;
		 break;
	  }
	  
	  //if we hit a body, html, or layer tag, return false
	  if (  isLayer(selObj) || objName == "BODY" || objName.tagName == "HTML")
         break;
	   
	  //climb up the tree...
	  selObj = selObj.parentNode;
   }

   return isInsideOfForm;
}


//function: isLayer
//description: given an object, determines whether it is a layer

function isLayer(obj){

   var isLayer = false;
   var objName = obj.tagName.toLowerCase();
   var pattern;
   
   switch (objName){
      case "layer":
	  case "ilayer":
	     isLayer = true;
		 break;
		 
	  case "span":
	  case "div":
	     pattern = /position[\W]*[:][\W]*absolute/i;
		 if (   obj.style && pattern.exec(obj.style)!= null  )
		    isLayer = true;
		 break;
		 
	  default:
	     break;  
  }
  return isLayer;
}

