//SHARE-IN-MEMORY=true
// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.
//
//insert.js
//
//Insert a text string at the current IP.
//Similar in functionality to the objectTag() function.
//One difference is that if more than one element is inserted, 
//only first one is selected.
//insertIntoDocument is not as robust as objectTag, and 
//should only be used when objectTag is not
//available, e.g.:in a Command file.
//
//-------------------------------------------------------------
//
//
//insertIntoDocument(textStr,bBlockTag){
//getHigherBlockTag(offset){


//function: insertIntoDocument
//description: inserts a text string at the current insertion point
//objectTag() can be used to insert text at the IP in objects,
//however, it is not available in other extension types.
//This function can be called in other extension types (Commands, etc.)
//While it is similar to objectTags(), it does not emulate it in all 
//situations, such as if textStr contains multiple tags
//
//Arguments:
//textStr - text string to insert into document at current IP.
//bBlockTag  - set this to true if the element that is being inserted is
//a span layer,div layer,layer,ilayer, table, heading, or form, or any other
//"block level" element
//
//Notes: If there is a current selection, inserts text string after the current selection.
//This function is robust enough to correctly handle inserting multiple elements -
//will insert them fine, but only select the first item

function insertIntoDocument(textStr,bBlockTag){
   var textStrToInsert = textStr;
   var currDOM = dw.getDocumentDOM();
   var docStr = currDOM.documentElement.outerHTML;
   var currSel = currDOM.getSelection();
 
   var startOffset = currSel[1];
   var bHigherBlockTag = false;
   
   //if we are inserting certain block elements, such as a table
   //we need to close any open block tags or invalid html will be 
   //generated. For instance, inserting a table in the middle
   //of a paragraph generates an invalid </P> tag.
   //To prevent this, we close off the block element before
   //inserting textStr and reopen it after textStr.
   if (bBlockTag){
      var higherBlockTag = getHigherBlockTag(startOffset);
      if (higherBlockTag){
         var openBlockTag = "<" + higherBlockTag.tagName + ">";
         var closeBlockTag = "<\/" + higherBlockTag.tagName + ">";
		 bHigherBlockTag = true;
	     textStrToInsert = closeBlockTag + textStrToInsert + openBlockTag;
      }
   }
                                                   
   //create a new document text str that includes textStrToInsert
   docStr = docStr.substring(0,startOffset) + textStrToInsert + 
            docStr.substring(startOffset);
			
   //replace the current document with this new text string
   currDOM.documentElement.outerHTML = docStr;
   
   //select the element that was just inserted
   //not yet robust enough to handle inserting multiple elements -
   //will only select the first one
   //handle selection slightly differently if we had to close
   //off a block tag
   //first, create a selection that is part of the just-inserted object
   if (bHigherBlockTag){ //if have closed a block tag before adding the element
      var addToOffset = docStr.substring(startOffset).indexOf(textStr);
	  startOffset = startOffset + addToOffset+2;
   } else {
      startOffset = startOffset+2;
   }
	
   //from this information, determine selection offsets of entire object	
   var objOffsets;			   
   currObj = currDOM.offsetsToNode(startOffset,startOffset);
   objOffsets = currDOM.nodeToOffsets(currObj);
   
   //select the element
   currDOM.setSelection(objOffsets[0]+1,objOffsets[0]+1);
  
}


//function:getHigherBlockTag
//description: called by insertIntoDocument to get the next
//highest blockTag, as defined in the blockTags array
function getHigherBlockTag(offset){
   var blockTags = new Array("P", "H1", "H2", "H3", "H4", "H5", "H6");
   var stopClimbingTreeTags = new Array("SPAN",  "DIV",  "LAYER","TABLE",  "BODY");
   var currObj = dreamweaver.offsetsToNode(offset,offset); 
   var retVal = "";
   var curTagName = "";
   
    while (currObj.parentNode){
	   //if this isn't an element node, go up one node
	   
	   if (!currObj.tagName){
	      currObj = currObj.parentNode;
		  continue;
	   }
	   
	   curTagName = currObj.tagName.toUpperCase();
	   
	   //if we have reached a block tag, assign it to retVal
       if (  arrContains(blockTags,curTagName)  ){
	      retVal = currObj; 
		  break;  
	   //break if we have reached a tag that a block tag cannot be a parent
	   //of, for instance, TABLE. retVal then equals an empty tag
	   } else if (  arrContains(stopClimbingTreeTags,curTagName)  ){
	        break;
	   //if not a block tag or a stop climbing tag, go up one level and repeat
	   }  else {
	      currObj = currObj.parentNode;
	   }
	}
	
	return retVal;

}

function arrContains(arr,itemToFind){
   var retVal = false;
   var nItems = arr.length;
   for (i=0;i<nItems;i++){
      if ( arr[i] == itemToFind ){
	     retVal = true;
	     break;
	  }
   }
   return retVal;
}
