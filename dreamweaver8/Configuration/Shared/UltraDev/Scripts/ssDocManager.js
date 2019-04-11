//SHARE-IN-MEMORY=true
// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.



//********* SERVER BEHAVIOR PATTERNS AND MASKS **********


//*-------------------------------------------------------------------
// FUNCTION:
//   getServerData
//
// DESCRIPTION:
//   Returns a server-model specific global variable.
//
//   Variables storing elements should use the following convention:
//   For ASP:       [PATT|MASK|<theType>]_Asp[Vb|Js]SpecificId
//   For JSP, CFML: [PATT|MASK|<theType>]_[Jsp|Cfml]SpecificId
//   For weights:   WGHT_[Asp|Jsp|Cfml]SpecificId
//
//   For example, PATT_AspVbFnMoveParams, WGHT_AspFnMoveParams
//
// ARGUMENTS:
//   theType - the type of variable to return ("patt", "mask", "wght", etc)
//   theId   - the specific id for the chunk
//
// RETURNS:
//   the value of the global
//--------------------------------------------------------------------
function getServerData(theType, theId) {
  var retVal = "", globalVar = "", sName="", sLang="";
  var dom = dw.getDocumentDOM();
  var serverName = dom.serverModel.getServerName()
  var serverLang = dom.serverModel.getServerLanguage();

  switch (serverName) {
    case "ASP": sName = "Asp"; break;
    case "JSP": sName = "Jsp"; break;
    case "Cold Fusion": sName = "Cfml"; break;
  }
  switch (serverLang) {
    case "JavaScript": sLang = "Js"; break;
    case "VBScript": sLang = "Vb"; break;
  }
  switch (theType.toUpperCase()) {
    case "PATT": globalVar = "PATT_"+sName+sLang; break;
    case "MASK": globalVar = "MASK_"+sName+sLang; break;
    case "WGHT": globalVar = "WGHT_"+sName; break;
    default:  globalVar = theType.toUpperCase() + "_" + sName + sLang; break;

  }
  globalVar += theId;
  if (window[globalVar]) retVal = window[globalVar];
  return retVal;
}


//*-------------------------------------------------------------------
// FUNCTION:
//   findSSrec
//
// DESCRIPTION:
//   Given a node and a type, locates and returns a matching SSRecord
//
// ARGUMENTS:
//   node - the node to located the SSRec for
//   type - the type of SSRec to search within
//
// RETURNS:
//   an SSRecord object
//--------------------------------------------------------------------
function findSSrec(node,type)
{
  ssRecs = dw.serverBehaviorInspector.getServerBehaviors();
  ssMatchRec = null;
  
  for (var j=0; j<ssRecs.length; j++) { //search all ssRecs
    ssRec = ssRecs[j];
    if ((ssRec.participants) && (ssRec.type == type)) {
      for (var k=0; k<ssRec.participants.length; k++) {    //scan ssRec participants
        if (ssRec.participants[k] == node) {
          ssMatchRec = ssRec;
        }
      }
    }
  }
  
  return ssMatchRec;
}



//******************* Cold Fusion CFOUTPUT functions ******************


//*-------------------------------------------------------------------
// FUNCTION:
//   isWithinCfoutput
//
// DESCRIPTION:
//   Detects if already within a larger <cfoutput>.
//   If a node argument is given, searchs outward from that node.
//   Otherwise searches outward from the selected node / insertion point.
//
// ARGUMENTS:
//   node - the node to check if it is within cfoutput tags
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------
function isWithinCfoutput(node,okIfInCell) {
  var dom = dw.getDocumentDOM();
  var isNested = false;
  var parentCount = 0;

  if (!node) {
    var selOffsets = dom.getSelection(true);
    node = dom.offsetsToNode(selOffsets[0],selOffsets[1]);
  }
  while (node.parentNode && node.parentNode.nodeType==Node.ELEMENT_NODE) { //ripple upward
    node = node.parentNode;
    parentCount++;
    if (node.tagName == "CFOUTPUT") { //if a parent tag is <cfoutput>
      isNested = true;
      break;
    }
  }
  if (isNested && okIfInCell && parentCount==2 && node.childNodes[0].tagName=="TR") { //if in <cfoutput><tr><td>
    isNested = false;
  }
  return isNested;
}

//*-------------------------------------------------------------------
// FUNCTION:
//   isWithinCfcookie
//
// DESCRIPTION:
//   Detects if within a <cfcookie>.
//   If a node argument is given, searchs outward from that node.
//   Otherwise searches outward from the selected node / insertion point.
//
// ARGUMENTS:
//   node - the node to check if it is within cfcookie tag
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------
function isWithinCfcookie(node,okIfInCell) {
  var dom = dw.getDocumentDOM();
  var isNested = false;

  if (!node) {
    var selOffsets = dom.getSelection(true);
    node = dom.offsetsToNode(selOffsets[0],selOffsets[1]);
  }

  if (node.tagName == "CFCOOKIE") { //if a parent tag is <cfoutput>
    isNested = true;
  }

  return isNested;
}


//*-------------------------------------------------------------------
// FUNCTION:
//   stripCfoutputIfNested
//
// DESCRIPTION:
//   Given a string, removes all <cfouput> tags if already within a larger <cfoutput>.
//   The second argument is given, searchs outward from that node. Otherwise searches
//   outward from the selected node / insertion point.
//
// ARGUMENTS:
//   theStr - the string to remove cfoutput tags from
//   optionalNode - (optional) the node to search from
//
// RETURNS:
//   the string, stripped of nested cfoutput tags
//--------------------------------------------------------------------
function stripCfoutputIfNested(theStr, optionalNode, force) {
  theStr = String(theStr);
  if (theStr && theStr.search(/<cfoutput>/i)!=-1) { //if contains <cfoutput>
    if (force || isWithinCfoutput(optionalNode)) {
      theStr = theStr.replace(/<cfoutput[^>]*>/gi,"");    //remove open tags
      theStr = theStr.replace(/<\/cfoutput[^>]*>/gi,"");  //remove close tags
    } else {
	  if(isWithinCfcookie(optionalNode)) {
        theStr = theStr.replace(/<cfoutput[^>]*>/gi,"");    //remove open tags	 
	    theStr = theStr.replace(/<\/cfoutput[^>]*>/gi,"");  //remove close tags
	  }
	}
  }
  return theStr;
}



//******************** LINK HANDLING FNCS **************************


//*-------------------------------------------------------------------
// FUNCTION:
//   stringCanBeLink
//
// DESCRIPTION:
//   Determines if the given string can be reasonably become a link. 
//   Some problems happen if things like form elements and tables are 
//   wrapped in A tags.
//
// ARGUMENTS:
//   selStr - the string to check for link worthiness
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------
function stringCanBeLink(selStr) {
  var illegalLinkTags = " TABLE INPUT FORM LAYER ILAYER ";
  var i, rootNode, node, tagName;
  var retVal = true;
  var tempFileDom, tempFilePath = dw.getConfigurationPath()+"/Shared/MM/Cache/empty.htm";

  if (DWfile.exists(tempFilePath)) {
    tempFileDom  = dw.getDocumentDOM(tempFilePath);
    tempFileDom.documentElement.outerHTML = "<HTML><BODY>"+selStr+"</BODY></HTML";
    rootNode = tempFileDom.body;
    if (rootNode.hasChildNodes()) { //nodes to check
      for (i=0; i<rootNode.childNodes.length; i++) {
        node = rootNode.childNodes[i];
        if (node.nodeType == Node.ELEMENT_NODE) {
          tagName = " " + node.tagName.toUpperCase() + " ";
          if (illegalLinkTags.indexOf(tagName) != -1) {
            retVal = false;
            //DEBUG alert("cant link this tag: "+tagName);
  } } } } }
  return retVal;
}


//*-------------------------------------------------------------------
// FUNCTION:
//   buildUpLinkMenu
//
// DESCRIPTION:
//   Creates a menu of links. There are three types: existing links (A tags), a selection
//   a new link from the selection (if valid selection), and a brand new link.
//
//   The display will be
//      newLinkStr (whatever you pass in)  *or*
//      selLinkStr "actual selection.."
//      "link1 contents..."
//      "link2 contents..."
//
//   Requires several function declared in:
//     string.js, DOM.js, classListControl.js, ss*.js
//   including:
//     fixUpSelection(), getSelectionLink(), stringCanBeLink(), createDisplayString()
//
// ARGUMENTS: 
//   menuName   - the actual HTML name of the SELECT tag
//   newLinkStr - the string to display if a "new link" item is to be added
//   selLinkStr - the string to display if the selection can be a link
//   listControlCons - constructor function for the list control class. An instance
//     of this class is created as the return object.
//     (Note: this is required because a function in a shareInMemory file cannot
//     call out to a non-shareInMemory function. There are multiple implementations
//     of the list control class, so it is no longer shareInMemory).
//
// RETURNS:
//   an object of type listControlCons
//--------------------------------------------------------------------
function buildUpLinkMenu(menuName, newLinkStr, selLinkStr, listControlCons) 
{
  var i, selNode, selStr, offsets, listObj;
  var linkNiceNames=new Array(), linkNames=new Array();
  var dom = dw.getDocumentDOM();

  selStr = stripSpaces(fixUpSelection(dom,false,true));
  selNode = getSelectionLink();
  if (selNode) { //if selection is inside link, select the entire link
    offsets = dw.nodeToOffsets(selNode);
    dw.setSelection(offsets[0],offsets[1]); 
  } else if (selStr) { //not link selection, ensure selection is linkable
    if (!stringCanBeLink(selStr)) {
      offsets = dom.getSelection();
      dw.setSelection(offsets[1],offsets[1]);  //move the insertion point after the selection
      selStr = "";
    }
  }
  if (selNode || !selStr) {  //if sel is link, or no valid selection
    linkNiceNames.push(newLinkStr);  //add generic new link item to menu
    linkNames.push("");
  } else {                   //else selection could be converted to link, so add it
    linkNiceNames.push(selLinkStr+' "'+createDisplayString(selStr)+'"');
    linkNames.push(selStr);
  }

  //Add all other links to menu
  var linkNodes = dom.getElementsByTagName("A");
  for (i=0; i<linkNodes.length; i++) {                   //build list of simple names: foo
    linkNiceNames.push('"'+createDisplayString(linkNodes[i].innerHTML)+'"');
    linkNames.push(linkNodes[i]);
  }
  listObj = new listControlCons(menuName);
  listObj.setAll(linkNiceNames, linkNames); //build list

  //If link currently selected, pick it in the list
  if (selNode) listObj.pickValue(selNode);
  return listObj;
}



//***************** PREFERENCE STORAGE ***************************


//*-------------------------------------------------------------------
// FUNCTION:
//   addValueToNote
//
// DESCRIPTION:
//   adds the given value to a list within a design note.
//
// ARGUMENTS:
//   fileURL - the design note to add the value to
//   countvar - the variable within the design note, which contains
//              a count of the number of items for the given name
//   name - the prefix for the list of items
//   value - the value to add to the list
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function addValueToNote(fileURL,countvar,name,value) {
  if (fileURL.length) {

    // Make sure the variable names begin with "UD_"
    if (countvar.length < 3 || countvar.substr(0, 3) != "UD_") {
      countvar = "UD_" + countvar;
    }
    if (name.length < 3 || name.substr(0, 3) != "UD_") {
      name = "UD_" + name;
    }

    var noteHandle = MMNotes.open(fileURL,true);

    if (noteHandle) {
      var count = MMNotes.get(noteHandle,countvar);
      if (parseInt(count) != count){
        count=0;  
      }
      count = parseInt(count);
      var bFound = false;
      for (var i=1; i <= count;i++) {
        var reqvalue = MMNotes.get(noteHandle,name+i);  
        if (reqvalue == value) {
          bFound = true;  
          break;
        }
      }
    
      if (!bFound) {
        if (IsValidVarName(value)) {
          count++;
          MMNotes.set(noteHandle,name+count,value); 
          MMNotes.set(noteHandle,countvar,count);
        } else {
         alert(value + " " + MM.MSG_InvalidParamName);
        }
      } else {
        alert(errMsg(MM.MSG_ParamNameAlreadyExists,value));
      }
      MMNotes.close(noteHandle);
    }

	// Clear the cache (see code in getValuesFromNote)
    MMNotes["cache|" + fileURL + "|" + name] = null;
  }
}


//*-------------------------------------------------------------------
// FUNCTION:
//   deleteValueFromNote
//
// DESCRIPTION:
//   removes the given value from a list within a design note.
//
// ARGUMENTS:
//   fileURL - the design note to remove the value from
//   countvar - the variable within the design note, which contains
//              a count of the number of items for the given name
//   name - the prefix for the list of items
//   value - the value to remove from the list
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function deleteValueFromNote(fileURL,countvar,name,value) {
  if (fileURL.length) {

    // Make sure the variable names begin with "UD_"
    if (countvar.length < 3 || countvar.substr(0, 3) != "UD_") {
      countvar = "UD_" + countvar;
    }
    if (name.length < 3 || name.substr(0, 3) != "UD_") {
      name = "UD_" + name;
    }

    var noteHandle = MMNotes.open(fileURL, true);

    if (noteHandle) {
      var count = MMNotes.get(noteHandle,countvar);
      count = parseInt(count);
      var tempArray = new Array();
      for (var i=1; i <= count;i++)
        tempArray[i-1] = MMNotes.get(noteHandle,name+i);
      MMNotes.remove(noteHandle,name+count);

      count=0;
      for (var i=0; i < tempArray.length ;i++) {
        if (tempArray[i] != value) {
          count++;
          MMNotes.set(noteHandle,name+count,tempArray[i]);
        }
      }
      MMNotes.set(noteHandle,countvar,count); 
      MMNotes.close(noteHandle);
    }

	// Clear the cache (see code in getValuesFromNote)
    MMNotes["cache|" + fileURL + "|" + name] = null;
  }
}


//*-------------------------------------------------------------------
// FUNCTION:
//   getValuesFromNote
//
// DESCRIPTION:
//   Gets an array of values from within a design note.
//   Once we've gotten the array of values from disk once,
//   we store them as a property of the MMNotes object.
//   That way, we don't hit the disk every time that this
//   function is called.
//
// ARGUMENTS:
//   fileURL - the design note to get the values from
//   outarray - the returned array of values
//   name - the prefix for the list of items
//   countvar - the variable within the design note, which contains
//              a count of the number of items for the given name
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function getValuesFromNote(fileURL,outarray,name,countvar)
{
  var noteHandle, cacheKey, cachedArray, i, count;

  // Make sure the variable names begin with "UD_"
  if (countvar.length < 3 || countvar.substr(0, 3) != "UD_") {
    countvar = "UD_" + countvar;
  }
  if (name.length < 3 || name.substr(0, 3) != "UD_") {
    name = "UD_" + name;
  }

  // If we've stored a cached array, copy cached values into outarray
  cacheKey = "cache|" + fileURL + "|" + name;
  cachedArray = MMNotes[cacheKey];
  if (cachedArray != null)
  {
    count = cachedArray.length;
    for (i=0; i < count; i++)
	    outarray[i] = cachedArray[i];
	  return;
  }

  noteHandle = MMNotes.open(fileURL, true);
  var outarraySet = false;
  if (noteHandle){
    var count = MMNotes.get(noteHandle,countvar);
    if (parseInt(count) != count) {
      count=0;  
    }
    count = parseInt(count);
    for (i=1; i <= count;i++) {
      var reqvalue = MMNotes.get(noteHandle,name+i);  
      outarray[i-1] = reqvalue;
      outarraySet = true;
    }
    MMNotes.close(noteHandle);
  }

  // Cache this array for next time
  //  NOTE: Only use the outarray if an item was added.
  //        Some code passes the same array to this call
  //        if no items were found, which causes multiple
  //        cache items to point to the same array. When
  //        and if this array is updated, these pointers
  //        all point to the same array.
  
  if (outarraySet)
  {
    MMNotes[cacheKey] = outarray;
  }
  else
  {
    MMNotes[cacheKey] = new Array();
  }
}


//********************** COMMON SELECTION CODE *********************
           
                           
//*-------------------------------------------------------------------
// FUNCTION:
//   fixUpSelection
//
// DESCRIPTION:
//   Fixes up the selection so that it is "clean", e.g.:
//   expands <a href="foo">[begin selection] some text</a>[end selection]
//   to be [begin selection]<a href="foo">some text</a>[end selection]
//   Also expands table cell selections of more than one cell to be the entire row,
//   and if the selection is not in the body, places cursor at end of body
//
// ARGUMENTS:
//   dom - the dom containing the selection to fix
//   bLeaveHeadSelection - leave the selection in the head
//   bCollapseParagraphs - 
//   bReturnOffsets - if set to true, the function returns the offsets,
//                    rather than the selected string
//
// RETURNS:
//   the text string of the new and improved balanced selection or, if
//   bReturnOffsets is true, returns the offsets of the balanced selection.
//--------------------------------------------------------------------
function fixUpSelection(dom,bLeaveHeadSelection, bCollapseParagraphs, bReturnOffsets){
   var newOffsets, offsets = new Array();
   var allText = dom.documentElement.outerHTML;
   var selObj = dom.getSelectedNode();
   var currText,selStr, selNode, nodeText;
   var pattern, result, chunk;
   var selectionIsBalanced = false;

   if (  !bLeaveHeadSelection && !selectionIsInBody(selObj) ){
      moveCursorToEndOfBody(allText);
   } else {  // selection is in body, and we need to balance it to prevent invalid html markup
      
      if (bCollapseParagraphs) tweakSelectionIfInsideOfEmptyTableCell()
      offsets = dw.getSelection(false);
      if (offsets[0] != offsets[1]) { // if there is a selection instead of an IP
      
        // shortcut: if selecting for a link, and selection is only text, 
        // set selectionIsBalanced to true
        if ( bCollapseParagraphs ){
          selStr = allText.substring(offsets[0],offsets[1]);
          if ( selStr.indexOf("<") == -1 ){
             selectionIsBalanced = true;
          }
        }
   
        // special case table check - if more than one cell in a row is selected,
        // expand selection to be the table row
        if ( !selectionIsBalanced && !bCollapseParagraphs ){
          newOffsets = getSelTableRowOffsets();
          if (newOffsets) offsets = newOffsets;
        }
        

       // balance the selection - don't bother if its a table tag because we know
       // that it is already balanced  
       
       selNode = dom.getSelectedNode(); 
       if (  !selectionIsBalanced && selNode.tagName 
             && !selectedNodeIsATableNode(dom,offsets,selNode)  ){

         // account for simple case where cursor is put to the left of one
         // line; the actual selection is inside of any block tags and needs
         // to be expanded to include the block tags

         var selText = allText.substring(offsets[0],offsets[1]);
         if (!bCollapseParagraphs && 
            ( stripWhiteSpace(selText) == stripWhiteSpace(selNode.innerHTML)) ) {
                
                // expand selection to include any block tags
                // -- otherwise known as "container tags" -- that surround it
                if ( !bCollapseParagraphs && isOKToBubbleThroughTag(selNode.tagName) ){
                  offsets = getOffsetsAfterBubblingUpTree(selNode);
                }

                  selectionIsBalanced = true;
         } 
        
         if (!selectionIsBalanced) // the selection hasn't been balanced yet
           offsets = getOffsetsAfterAccountingForSomeSpecialSelectionCases(allText,offsets);
           
        // start balancing selection
        dw.setSelection(offsets[0],offsets[1]); // needed to get selNode var
        
        // get currently selected node. Note that this method returns a node that contains
        // the complete selection. Therefore the outerHTML of selNode is often greater
        // than the actual selection.
        
        selNode = dom.getSelectedNode();
        nodeText = selNode.outerHTML ? selNode.outerHTML : selNode.data;
        currText = allText.substring(offsets[0],offsets[1]);
  
        if (stripWhiteSpace(nodeText) == stripWhiteSpace(currText) || 
            currText.indexOf("<") == -1) {
              if (  !bCollapseParagraphs && isOKToBubbleThroughTag(selNode.tagName) &&
                    stripWhiteSpace(nodeText) == stripWhiteSpace(currText)  ){
                offsets = getOffsetsAfterBubblingUpTree(selNode);
              }
              selectionIsBalanced = true;
        }
        
        if (!selectionIsBalanced){  // selection is not balanced so balance it
          //first, look for a simple common case where only one endtag is selected, e.g.:
          // |<a>text|</a>, or
          // <a>|text</a>|,
          // Select the end tag, opening or closing, that is not yet selected
          
          var bracketMatch = /</g;
          if ( currText.match(bracketMatch).length == 1){
            if (currText.indexOf("<") == 0)
              currText = currText.substring(currText.indexOf(">")+1);
             else if (currText.indexOf(">") == (currText.length-1))
              currText = currText.substring(0,currText.indexOf("<"));
            if (currText == selNode.innerHTML){
              offsets = dw.nodeToOffsets(selNode)
              selectionIsBalanced = true;
            }
          }
        }
    
        if (!selectionIsBalanced){
          // the simple cases didn't work out, so we are expanding the selection
          // in a more involved fashion - get the objects represented by the first
          // and last offsets. Then expand selection from first offset of first
          // object to last offset of second object. 

          var offset1Obj = dw.offsetsToNode(offsets[0],offsets[0]);
          var offset2Obj = dw.offsetsToNode(offsets[1]-1,offsets[1]-1);
          
          // expand selection so that it is balanced
          
          obj1Offsets = getOffsetsAfterClimbingTree(offset1Obj,offsets);
          obj2Offsets = getOffsetsAfterClimbingTree(offset2Obj,offsets);
          
          // check that the second offset of the first node is less than or
          // equal to the second offset of the second node, and that the
          // first offset of first node is less than or equal to the first offset
          // of the second node. 
          // It is unlikely that this would occur, but altogether possible, and if it
          // does, the selection is expanded so that invalid html will not occur
          // (while this may not be ideal solution and the user may wish the selection 
          // was not expected, it is a rare case and better than creating invalid HTML).
          
          var newOffsetStart = Math.min(obj1Offsets[0],obj2Offsets[0]);
          var newOffsetEnd   = Math.max(obj2Offsets[1],obj2Offsets[1]);
          offsets = new Array(newOffsetStart,newOffsetEnd);
        }

         //if selecting for links,remove outer tags if they exist.
         // Examples: <a>one</a>         --> one
         //           <a><b>two</b></a>  --> two
         //           <p>three</p>       --> three

         if (bCollapseParagraphs) {
           offsets = getOffsetsAfterStrippingWhiteSpace(allText,offsets[0],offsets[1]);
           selStr = allText.substring(offsets[0],offsets[1]);
           if (selStr.indexOf("<") == 0 && selStr.lastIndexOf(">") == (selStr.length-1)){
             var openPattern = /^<([^>]*)>/;
             var closePattern = /<\/([^>]*)>$/;
             var openResult = selStr.match(openPattern);
             var closeResult = selStr.match(closePattern);

             if ( openResult != null && closeResult !=null && 
                  openResult[1].toUpperCase() == closeResult[1].toUpperCase() &&
                  openResult[1].toUpperCase().indexOf("CF")!=0) { //don't collapse Cold Fusion tags
               offsets[0] +=  openResult[0].length;
               offsets[1] -=  closeResult[0].length;
             }
           }
         }
         // check for cases where for whatever reason, the entire body got selected
         offsets = getOffsetsAfterCheckingForBodySelection(allText,offsets);
       
         // set selection based on new offsets
         dw.setSelection(offsets[0],offsets[1]);
       }
     }
   }

   if (bReturnOffsets){
     return offsets;
   } else {
     return allText.substring(offsets[0],offsets[1]);
   }
}


//*-------------------------------------------------------------------
// FUNCTION:
//   fixUpInsertionPoint
//
// DESCRIPTION:
//   moves the cursor to a place where a "safe" insertion is possible,
//   note: only call this function if inserting a table, layer, or form into the document
//   in any extension that is not an object. (In the case of objects, the selection
//   is automatically fixed. Other cases don't need the selection fixed up.)
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function fixUpInsertionPoint() {
  moveIPToOutsideOfParagraphToPreventInvalidHTML();
  backUpCursorIfAfterNonBreakingSpaceInTableCell();
}


//*-------------------------------------------------------------------
// FUNCTION:
//   moveCursorToEndOfBody
//
// DESCRIPTION:
//   Changes the selection to be just before the close body tag
//
// ARGUMENTS:
//   entireDocStr - (optional) a string containing the text of the document
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function moveCursorToEndOfBody(entireDocStr) {
  var allText = (entireDocStr)?entireDocStr:dw.getDocumentDOM().documentElement.outerHTML;
  var closeBodyTagInd = allText.lastIndexOf("</BODY>");
  var offsets = new Array(2);
  
  if (closeBodyTagInd == -1) {
    closeBodyTagInd = allText.lastIndexOf("</body>");
    if (closeBodyTagInd != -1) {
      offsets[0] = closeBodyTagInd-2; 
      offsets[1] = closeBodyTagInd-2;
      dw.setSelection(offsets[0],offsets[1]);
    }
  }
  
}


//*-------------------------------------------------------------------
// FUNCTION:
//   selectionIsInBody
//
// DESCRIPTION:
//   Returns true if the current selection is within the body tag
//
// ARGUMENTS: 
//   selObj - the object to check if it is within the body
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------
function selectionIsInBody(selObj) {
   var bInBody = (selObj.tagName && selObj.tagName == "BODY")?true:false;
   while (!bInBody && selObj.parentNode) {
     selObj = selObj.parentNode;
     if (selObj.tagName == "BODY") 
       bInBody = true;
     if (selObj.tagName == "HTML" || selObj.tagName == "HEAD") 
       break;
   }
   return bInBody;
}


//*-------------------------------------------------------------------
// FUNCTION:
//   tweakSelectionIfInsideOfEmptyTableCell
//
// DESCRIPTION:
//   If "&nbsp;" is manually selected in table cell, than tweaks the selection
//   so that the selection is an insertion point at the beginning of the table cell
//
// ARGUMENTS: 
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function tweakSelectionIfInsideOfEmptyTableCell() {
  var dom = dw.getDocumentDOM();
  var offsets = dom.getSelection(true); // gets pairs of offsets if multiple selections
  var selNode = dom.offsetsToNode(offsets[0],offsets[1]);
  
  if (selNode.tagName && (selNode.tagName == "TD" || selNode.tagName == "TH")) {
    var cellContents = selNode.innerHTML;
    // Previously, innerHTML was "" if only an &nbsp; was in the table cell.
    //   Now, we return "&nbsp;" and not the empty string.
    if (cellContents == "&nbsp;") 
    { 
      var nbspInd = selNode.outerHTML.indexOf("&nbsp");
      var startOfCellOffset = nbspInd + offsets[0];
      dom.setSelection(startOfCellOffset,startOfCellOffset);
    }
  }
}



//**************** SELECTION INTERNAL FUNCTIONS *******************


//*-------------------------------------------------------------------
// FUNCTION:
//   getOffsetsAfterClimbingTree
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------
function getOffsetsAfterClimbingTree(theObj,currOffs){
  var currObj = theObj;
  var objParent, parentOffs;
  var climbTree = true;

  while ( climbTree && currObj.parentNode ){
    objParent = currObj.parentNode;
    parentOffs = dw.nodeToOffsets(objParent);
    if ( (parentOffs[0] < currOffs[0] && parentOffs[1] < currOffs[1]) ||
         (parentOffs[0] > currOffs[0] && parentOffs[1] > currOffs[1]) ){
      currObj = objParent;
    } else {
      climbTree = false;
    }
  }
  return ( dw.nodeToOffsets(currObj) );
}


//*-------------------------------------------------------------------
// FUNCTION:
//   getOffsetsAfterAccountingForSomeSpecialSelectionCases
//
// DESCRIPTION:
//   like the title says
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------
function getOffsetsAfterAccountingForSomeSpecialSelectionCases(allText, offsets) {
  var newOffs = oldOffs = offsets;
  
 // strip leading and trailing white space
 newOffs = getOffsetsAfterStrippingWhiteSpace(allText,newOffs[0],newOffs[1]);
  
 //remove trailing &nbsp; tag if there
 // this can happen if a user shift down-clicks and the following line
 // is empty; dw expands the selection to include the "<p>nbsp;"
 // on the next line
 var selStr = allText.substring(newOffs[0],newOffs[1]);
 var chunk = "&nbsp;";
 var chunkPos = selStr.lastIndexOf(chunk);
 if (chunkPos!=-1 && chunkPos == (selStr.length - chunk.length)) 
   newOffs[1] -= chunk.length;

 // remove last tag if it is an opening block tag
 // this can happen if a user shift down-clicks; dw selects the
 // opening block tag on the next paragraph, resulting in a selection like:
 //    <p>|some text</p>
 //    <p>|more text</p>
 selStr = allText.substring(newOffs[0], newOffs[1]);
 var pattern = /<([^>]*)>$/;
 var result = selStr.match(pattern);
 if (result != null){
   if ( isAContainerTag(result[1]) ){
     newOffs[1] -= result[0].length;
   }
 }

 // if selection starts with a closing block tag, remove it
 // this can happen if a user puts the mouse at the end of a line and
 // presses shift-up-arrow to select it
 selStr = allText.substring(newOffs[0],newOffs[1]);
 pattern = /^<\/([^>]*)>/;
 result = selStr.match(pattern);
 if (result != null){
   if ( isAContainerTag(result[1]) ){
     newOffs[0] += result[0].length;
   }
 }

  // strip leading and trailing white space if offsets have changed
  if (newOffs != oldOffs){
    newOffs = getOffsetsAfterStrippingWhiteSpace(allText,newOffs[0],newOffs[1]);
    oldOffs = newOffs;
  }

  // account for special list case: selecting the first item in a list
  // can select the opening <ol> or <ul> as well. Strip it.
  newOffs = getOffsetsAfterListCheck(allText,newOffs[0],newOffs[1]);

  // strip leading and trailing white space if offsets have changed
  if (newOffs != oldOffs){
    newOffs = getOffsetsAfterStrippingWhiteSpace(allText,newOffs[0],newOffs[1]);
  }
  
  return newOffs;

}


//*-------------------------------------------------------------------
// FUNCTION:
//   isAContainerTag
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------
function isAContainerTag(theTagName){
 if ( !theTagName )
   return false;
   
 var tag = " " + theTagName.toUpperCase() + " ";
 var containerTags = " P H1 H2 H3 H4 H5 H6 LI LAYER DIV TD TABLE FORM PRE BLOCKQUOTE OL UL PRE BODY ";

 return ( containerTags.indexOf(tag) != -1);
}


//*-------------------------------------------------------------------
// FUNCTION:
//   cursorIsInsideOfTableCell
//
// DESCRIPTION:
//   special case handling if the selected node comes back as TD or TH
//   Determine whether the selection is inside of the cell or if the
//   entire cell is selected
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------
function cursorIsInsideOfTableCell(dom, offsets, cellNode){
  var isInsideOfCell = true;
  var allText = dom.documentElement.outerHTML;
  var cellOuterHTML = cellNode.outerHTML;
  var selStr = allText.substring(offsets[0],offsets[1]);
  
  if ( stripWhiteSpace(selStr) == stripWhiteSpace(cellOuterHTML) ){
    isInsideOfCell = false;
  }

   return isInsideOfCell;
}


//*-------------------------------------------------------------------
// FUNCTION:
//   selectedNodeIsATableNode
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------
function selectedNodeIsATableNode(dom,offsets,selNode){
  var retVal = false;

  switch (selNode.tagName){

    case "TABLE":
    case "TR":
      retVal = true;
      break;
     case "TD":
     case "TH":
       if ( !cursorIsInsideOfTableCell(dom,offsets,selNode) ){
         retVal = true;
         break;
       }
      default:
        break;

   }

    return retVal;

}


//*-------------------------------------------------------------------
// FUNCTION:
//   getSelTableRowOffsets
//
// DESCRIPTION:
//   If the selection includes TD or TH tags, corrects the selection 
//   to include the entire row(s)
//   If only one TD is selected, does not select the entire row
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------
function getSelTableRowOffsets() {
   var retVal="";
   var start=0,end=0;
   var DOM = dw.getDocumentDOM();
   var offsets = DOM.getSelection(true); // gets pairs of offsets if multiple selections
   var node = DOM.offsetsToNode(offsets[0],offsets[1]);

   if (node.nodeType==Node.ELEMENT_NODE && (node.tagName == "TD" || node.tagName == "TH") ){
     if (offsets.length == 2  && (tableHasOnlyOneColumn(node) || cursorIsInsideOfTableCell(DOM,offsets,node))){
       retVal = new Array(offsets[0],offsets[1]);
     } else {
       // start var equals first offset of first table row
       node = node.parentNode;
       if (node.tagName == "FORM") node = node.parentNode;  //special case if <TR><FORM><TD>, skip form
       start = DOM.nodeToOffsets(node)[0];
       // end var equals last offset of last table row
       node = DOM.offsetsToNode(offsets[offsets.length-2],offsets[offsets.length-1]);
       if (node.nodeType==Node.ELEMENT_NODE && (node.tagName == "TD" || node.tagName == "TH") ){
          node = node.parentNode;
          if (node.tagName == "FORM") node = node.parentNode;  //special case if <TR><FORM><TD>, skip form
          end = DOM.nodeToOffsets(node)[1];
       }
     }
   }
   if (start && end)
      retVal = new Array(start,end);

   return retVal;
}

//*-------------------------------------------------------------------
// FUNCTION:
//   tableHasOnlyOneColumn
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------
function tableHasOnlyOneColumn(cellNode){
   var rowNode = cellNode.parentNode;
   var nCols = rowNode.getElementsByTagName("TD").length + rowNode.getElementsByTagName("TH").length;
   return ( nCols < 2 && !rowNode.colspan)
}


//*-------------------------------------------------------------------
// FUNCTION:
//   getOffsetsAfterStrippingWhiteSpace
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------
function getOffsetsAfterStrippingWhiteSpace(allText,currOffset1,currOffset2){
  var newOffset1 = currOffset1;
  var newOffset2 = currOffset2;
  var selStr = allText.substring(newOffset1,newOffset2);
  var firstNonSpace = selStr.search(/[^\s]/);
  
  if (firstNonSpace>0) newOffset1 += firstNonSpace;
  while (newOffset2 > newOffset1 && allText.charAt(newOffset2-1).search(/\s/)==0) 
    newOffset2--; 
  
  return new Array(newOffset1,newOffset2);
}


//*-------------------------------------------------------------------
// FUNCTION:
//   getOffsetsAfterListCheck
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------
function getOffsetsAfterListCheck(docStr,offset1,offset2){
  var newOffset1 = offset1;
  var newOffset2 = offset2;
  var openListItems = new Array("<ol>","<OL>","<ul>","<UL>");
  var i, nItems = openListItems.length, closeListItem1, closeListItem2, currItem;
  var selStr = docStr.substring(offset1,offset2);
 
  for (i=0;i<nItems;i++){
    if (selStr.indexOf(openListItems[i]) == 0){
      currItem = openListItems[i];
      closeListItem1 = "</" + currItem.toLowerCase().substring(1);
      closeListItem2 = "</" + currItem.toUpperCase().substring(1);
 
      if ( selStr.indexOf(closeListItem1) == -1 && selStr.indexOf(closeListItem2) == -1){
        newOffset1 += currItem.length;
      }
    }  
  }
  return new Array(newOffset1,newOffset2);
}
     

//*-------------------------------------------------------------------
// FUNCTION:
//   getOffsetsAfterCheckingForBodySelection
//
// DESCRIPTION:
//   check for cases where for whatever reason, the entire body got selected.
//   If this is the case, fix offsets to be inside of the body
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------
function getOffsetsAfterCheckingForBodySelection(allText,currOffs){
  var offsets = currOffs;
  var selStr = allText.substring(offsets[0],offsets[1]);
  var newStartOff = currOffs[0];
  var newEndOff   = currOffs[1];
  var openBracketInd,closeBracketInd,nOpenBrackets,nCloseBrackets;
  var ind;
  
  if (  selStr.indexOf("<BODY") == 0 || selStr.indexOf("<body") == 0 ){
    nOpenBrackets = 1;
    nCloseBrackets = 0;
    closeBracketInd = 0; // index of closing bracket of </body>
    ind=1;
    
    while ( !closeBracketInd && selStr.charAt(ind) ) {
      if ( selStr.charAt(ind) == "<" ){
        nOpenBrackets++;
      } else if (selStr.charAt(ind) == ">" ){
        nCloseBrackets++;
        if( nOpenBrackets == nCloseBrackets ){
          closeBracketInd = ind;
        }
      }
      ind++;
    }
    
    // get first non-newline character inside of the body tag
    newStartOff = closeBracketInd + 1;
    while ( selStr.charAt(newStartOff) == "\n" ||
            selStr.charAt(newStartOff) == "\r"  ) {
             newStartOff++;
    }
    
    // get last non-newline character inside of the body tag
    openBracketInd = selStr.lastIndexOf("<"); // open bracket index of </body>
    newEndOff = openBracketInd - 1;
    while ( selStr.charAt(newEndOff) == "\n" ||
            selStr.charAt(newEndOff) == "\r"  ) {
              newEndOff--;
    }
    
    // add 1 because selection actually goes to newEndOff minus one
    newEndOff++;

    newStartOff += currOffs[0];
    newEndOff   += currOffs[0];
  }

  return new Array(newStartOff,newEndOff);       
}


//*-------------------------------------------------------------------
// FUNCTION:
//   getOffsetsAfterBubblingUpTree
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------
function getOffsetsAfterBubblingUpTree(currNode) {
  
  // special case for dynamic elements
  if (currNode.parentNode && isPartOfLockedContent(currNode) &&
      isOKToBubbleThroughTag(currNode.parentNode.tagName)) {
              currNode = currNode.parentNode;
  }
                      
  // climb up to top character style -- otherwise selection could be unbalanced
  while (currNode.parentNode && currNode.parentNode.childNodes.length == 1 &&
         isOKToBubbleThroughTag(currNode.parentNode.tagName)) {
               currNode = currNode.parentNode;
  }
  
  return dw.nodeToOffsets(currNode);
}


//*-------------------------------------------------------------------
// FUNCTION:
//   isPartOfLockedContent
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------
function isPartOfLockedContent(currNode){
  return (currNode.parentNode && currNode.parentNode.childNodes.length == 3 
          && currNode.parentNode.childNodes[0].tagName == "MM:BEGINLOCK");
}


//*-------------------------------------------------------------------
// FUNCTION:
//   isOKToBubbleThroughTag
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------
function isOKToBubbleThroughTag(tag){
  // this shouldn't happen, but if "undefined" is passed in, its because
  // the node doesn't have a tagName property, which means it is a text or comment node
  if ( !tag )
    return true;
    
  var bubbleThroughTags = 
  " P H1 H2 H3 H4 H5 H6 LI A FONT I B U MM:BEGINLOCK STRIKE BIG SMALL SUB SUP EM STRONG DFN CODE SAMP KBD VAR CITE XMP TT ADDRESS ";
  var tagWithSpaces = " " + tag.toUpperCase() + " ";
  var isColdFusionTag = tag.indexOf("cf") == 0 || tag.indexOf("CF") == 0;

  return ( bubbleThroughTags.indexOf(tagWithSpaces) != -1 || isColdFusionTag );
}
  
  
//*-------------------------------------------------------------------
// FUNCTION:
//   stripWhiteSpace
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------
  function stripWhiteSpace(inStr){
    var spaceChars = " \n\r\t";
    var startPos = 0;
    while (startPos < inStr.length && spaceChars.indexOf(inStr[startPos]) != -1){
      startPos++;
    }
    var endPos = inStr.length;
    while (endPos-1 > 0 && spaceChars.indexOf(inStr[endPos-1]) != -1){
      endPos--;
    }
    
    return inStr.substring(startPos,endPos);
}


//*-------------------------------------------------------------------
// FUNCTION:
//   moveIPToOutsideOfParagraphToPreventInvalidHTML
//
// DESCRIPTION:
//   moves insertion point to outside of the paragraph
//   use this function when inserting elements that control the document
//   layout, specifically tables, forms, and layers
//   do not use when inserting text, elements that control text formatting,
//   or anchors.
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------
function moveIPToOutsideOfParagraphToPreventInvalidHTML(){
  var pObj = "";
  var dom = dw.getDocumentDOM();
  var selObj = dom.getSelectedNode();

  while (pObj=="" && selObj.parentNode){
    if (selObj.tagName && selObj.tagName=="P") {
      pObj = selObj;
    } else {
      selObj = selObj.parentNode;
    }
  }

  
  // if the selection is inside of a paragraph tag, then reset the selection to be after
  // the paragraph, to prevent invalid html when inserting a form, table, or
  // other tags that control the document flow

  if (pObj) {
    var pOffsets = dom.nodeToOffsets(pObj);
    dom.setSelection(pOffsets[1],pOffsets[1]);
  }

}


//*-------------------------------------------------------------------
// FUNCTION:
//   backUpCursorIfAfterNonBreakingSpaceInTableCell
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------
function backUpCursorIfAfterNonBreakingSpaceInTableCell()
{
  var dom = dw.getDocumentDOM();
  var selNode = dom.getSelectedNode();
  if (selNode.tagName && selNode.tagName == "TD" && selNode.outerHTML.indexOf("&nbsp") != -1 
     && selNode.innerHTML == "&nbsp;") 
  {
    var selArr = dom.nodeToOffsets(selNode);
    var cellOuterHTML = selNode.outerHTML;
    var nbspInd = cellOuterHTML.indexOf("&nbsp");
    var newIP = selArr[0] + nbspInd - 1;
    dom.setSelection(newIP,newIP);
  }

}



//***************** CODE FOR MANAGING INSERTION OF TAGS ***************************


//*-------------------------------------------------------------------
// FUNCTION:
//   insertBeforeHTMLTag
//
// DESCRIPTION:
//   Inserts the given text before the html tag.
//   Used by the server formats to insert functions above the html tag
//
// ARGUMENTS:
//   theText - the text to insert
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function insertBeforeHTMLTag(theText)
{
	var dom = dw.getDocumentDOM();
	var allSrc = dom.documentElement.outerHTML;
	var lastHTML = allSrc.lastIndexOf("<html>");

	if (lastHTML == (-1))
	{
		lastHTML = allSrc.lastIndexOf("<HTML>");

		if (lastHTML == (-1))
		{
			// For XHTML docs, the html tag has attributes (but should always be lower-case)

			lastHTML = allSrc.lastIndexOf("<html ");
		}
	}

	dom.documentElement.outerHTML = allSrc.substring(0, lastHTML) + theText + allSrc.substring(lastHTML);
}

//*-------------------------------------------------------------------
// FUNCTION:
//   getOrigForLockedNode
//
// DESCRIPTION:
//   Returns the string located between the locked nodes associated with
//   the given node
//
// ARGUMENTS:
//   node - the node get the original source for
//
// RETURNS:
//   string
//--------------------------------------------------------------------
function getOrigForLockedNode(node) {

  var i, index, start, end,allSrc,section,beginLock,endLock;
  var DOM = dw.getDocumentDOM();

  beginLock = getMyBeginLock(node);
  endLock = getMyEndLock(node);

  if (beginLock && endLock)  {
    start = dw.nodeToOffsets(beginLock)[0];
    end = dw.nodeToOffsets(endLock)[1];
    allSrc = DOM.documentElement.outerHTML;
    section = allSrc.substring(start,end);
  }

  return section;
}


//*-------------------------------------------------------------------
// FUNCTION:
//   deleteLockedNode
//
// DESCRIPTION:
//   Removes locked node associated with the given node
//
// ARGUMENTS:
//   node - the node to delete the locked nodes for
//   replaceText - (optional) the text to insert in place of the locked nodes
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function deleteLockedNode(node, replaceText) {
  var i, index, start, end, startParent, endParent, allSrc,beginLock,endLock;
  var DOM = dw.getDocumentDOM();


  beginLock = getMyBeginLock(node);
  endLock = getMyEndLock(node);

  if (beginLock && endLock)
  {
    start = dw.nodeToOffsets(beginLock)[0];
    end = dw.nodeToOffsets(endLock)[1];
    if (!replaceText) replaceText = "";
    allSrc = DOM.documentElement.outerHTML;
    DOM.documentElement.outerHTML = allSrc.substring(0,start) + replaceText + allSrc.substring(end);
  }
}


//*-------------------------------------------------------------------
// FUNCTION:
//   deleteLockedNodes
//
// DESCRIPTION:
//   This function differs from deleteLockedNode() in that it can handle multiple updates.
//   Additionally, this function expects an array of translated replacementTexts and works off
//   on the translated document so as not to cause an retranslation of the entire document
//   (provided that translator is set to by expression <%).  DeleteLockedNode on the other hand
//   works on the untranslated document, and the replaceText should not be translated.
//
// ARGUMENTS:
//   nodes - an array nodes to delete
//   replaceTexts - an array of strings to insert in place of the nodes
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function deleteLockedNodes(nodes, replaceTexts) {
  var start, end, startParent, endParent, allSrc;
  dw.useTranslatedSource(true);
  var dom  = dw.getDocumentDOM();
  var curSelection = dom.getSelection();
  var allSrc = dom.documentElement.outerHTML;
  var newSrc = "";
  var cont = 0;
  var z;
  var selText = "";

  for (z = 0; z < nodes.length; z++)
  {
    //Rip out my node, plus the node above and below me
    starts       = getMyBeginLock(nodes[z]);
    ends         = getMyEndLock(nodes[z]);

    if (starts && ends)
    {
      startsoffset = dom.nodeToOffsets(starts)[0];
      endsoffset   = dom.nodeToOffsets(ends)[1];

      if (!replaceTexts[z])
      {
        replaceTexts[z] = "";
      }
      if (newSrc.length)
      {
        newSrc = newSrc + allSrc.substring(cont, startsoffset) + replaceTexts[z];
        cont = endsoffset;
      }
      else
      {
        newSrc = allSrc.substring(0, startsoffset) + replaceTexts[z];
        cont = endsoffset;
      }
      if (startsoffset == curSelection[0])
      {
        if (replaceTexts[z].length)
        {
          var pattern = "orig\s*=\s*\"([^\"]+)\"";
          var re = new RegExp(pattern, "i");
          if (replaceTexts[z].search(re) != 1)
          {
            selText = RegExp.$1;
            selText = unescape(selText);
          }
        }
      }
    }
  }
  newSrc = newSrc + allSrc.substring(cont);
  dw.getDocumentDOM().documentElement.outerHTML = newSrc;
  // update the selection
  if (selText && (selText.length > 0))
  {
    dw.useTranslatedSource(false);
    var str = dom.documentElement.outerHTML;
    // don't know if this will work on MAC /LLT
    selText = selText.replace(/([^\r])\n/g, "$1\r\n");
    var index = str.indexOf(selText);
    if (index != -1)
    {
      dw.setSelection(index, index + selText.length);
    }
  }
  dw.serverBehaviorInspector.findAllServerBehaviors();
}



//**************** DEPRECATED FUNCTIONS ******************


//*-------------------------------------------------------------------
// FUNCTION:
//   getPriorNode
//
// DESCRIPTION:
//   Checks an ssRecord to see if a specific nodeType exists. 
//   Returns a pointer to that node iff there are no other users of that node.
//   This is used by buildSSEdits to decide whether we can change a shared node.
//
// ARGUMENTS: 
//   ssRec  - an ssRecord (usually priorRec)
//   nodeId - the node identifier, such as "Counter"
//
// RETURNS:
//   pointer to the node iff we are the only user of that node
//--------------------------------------------------------------------
function getPriorNode(ssRec, nodeId) {
  priorNode = false;
  if (ssRec) { //if already there, only replace it if nobody else is using it
    for (var i=0; i<ssRec.types.length; i++) if (ssRec.types[i] == nodeId) { //has counter
      if (numberOfDependencies(ssRec.participants[i],true) <= 1) //I'm only parent, OK to change node
        priorNode = ssRec.participants[i];
      break;
  } }
  return priorNode;
  
}


//*-------------------------------------------------------------------
// FUNCTION:
//   getScriptNodes
//
// DESCRIPTION:
// This function returns a list of all the script nodes on the page and
// their corresponding string representation.  For ASP and JSP, this is 
// all items surrounded by <% and %>.  For CFML, this is all items surrounded 
// by <cfscript> and </cfscript>.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   an array of script nodes
//--------------------------------------------------------------------
function getScriptNodes() {
  var retList = new Array();
  var tagStr, node;
  var dom = dw.getDocumentDOM();
  
  var nodes = findNodes(dom,"CFSCRIPT");
  for (var i=0; i < nodes.length; i++) {
    tagStr = nodes[i].getAttribute("ORIG");
    if (tagStr) {
      tagStr = unescape(tagStr);
    } else {
      tagStr = nodes[i].outerHTML;
    }
    node = new Object();
    node.obj = nodes[i];
    node.tagStr = tagStr;
    retList.push(node);
  }
  
  return retList;
}



//*-------------------------------------------------------------------
// FUNCTION:
//   findParticipant
//
// DESCRIPTION:
//   This function attempts to locate a given script participant within a
//   list of script nodes. If found, the corresponding node in the scriptNodes
//   array is returned.
//
// ARGUMENTS: 
//   participantType -  the name of the patterns and masks to use for this participant
//   scriptNodes - a list of nodes returned by getScriptNodes()
//   infoRec - an object which has any extra data needed to match a participant
//
// RETURNS:
//   a script node
//--------------------------------------------------------------------
function findParticipant(participantType, scriptNodes, infoRec) {
  var retVal = "";
  var tagStr, findPattern, pattern;
  
  // get the pre-pattern and the main pattern
  prePattern = getServerData("prep",participantType);
  pattern = getServerData("patt",participantType);

  // if we have a record, make replacements in the patterns
  if (infoRec != null) {
    for (var j=1; j < 10; j++) {
      var paramInfo = getServerData("tok" + j ,participantType);
      if (paramInfo != null && paramInfo.length > 1) {
        prePattern = prePattern.replace(paramInfo[1], infoRec[paramInfo[0]]);
        pattern = pattern.replace(paramInfo[1], infoRec[paramInfo[0]]);
      } else {
        break;  // no more parameter information
      }
    }
  }

  // walk the nodes, searching for a match
  for (var i=0; i < scriptNodes.length; i++) {
    tagStr = scriptNodes[i].tagStr;
    //DEBUG alert("checking: \n" + tagStr);
    
    // if we have a match, return the node
    if (tagStr.indexOf(prePattern) != -1 && tagStr.match(RegExp(pattern)) ) {
      retVal = scriptNodes[i];
      break;
    }
  }
  
  return retVal;
}


//*-------------------------------------------------------------------
// FUNCTION:
//   findScriptParticipants
//
// DESCRIPTION:
//   This function is called to find the script participants within the
//   participant list, and add them to the ssRec.  It returns the number 
//   of expected participants, which can be used to check for completeness.
//
// ARGUMENTS: 
//   ssRec - the record to add the participants to
//   participantList - an array of participant names that we are looking for
//   scriptNodes - the list of nodes returned by getScriptNodes()
//
// RETURNS:
//--------------------------------------------------------------------
function findScriptParticipants(ssRec, participantList, scriptNodes) {
  var expectedParticipants = 0;
  
  // calculate the expected participants, and attempt to locate them
  for (var i=0; i < participantList.length; i++) {
    var participantType = participantList[i];

    // if a pattern exists, find the participant
    if (getServerData("patt", participantType)) {
      expectedParticipants++;

      // search the list of script nodes
      scriptNode = findParticipant(participantType, scriptNodes, ssRec);
      if (scriptNode != "") { // we have a match

        // add this participant to the record
        ssRec.participants.push(scriptNode.obj);
        ssRec.types.push(participantType);
        ssRec.weights.push(getServerData("wght",participantType));

        // now locate other information about this participant
        // use 'VAL#' globals to locate this information
        for (var j=1; j < 10; j++) {
          var paramInfo = getServerData("val" + j ,participantType);
          if (paramInfo != null && paramInfo.length > 1) {
            tagStr = scriptNode.tagStr;
            parameters = tagStr.match(paramInfo[1]);
            if (parameters && parameters.length > 1) {
              ssRec[paramInfo[0]] = parameters[1];
            } else {
              //DEBUG alert("Error parsing " + participantType + ": parameter '" + paramInfo[0] + "' not found");
            }
          } else {
            break; // no more parameter information
          }
        }
      } else {
        //DEBUG alert("can't find participant: " + participantType);
      }
    }
  }
  
  return expectedParticipants;
}


//*-------------------------------------------------------------------
// FUNCTION:
//   editScriptParticipants
//
// DESCRIPTION:
//   This function is used to create the edit list for the script participants
//   identified in the participant list.
//
// ARGUMENTS: 
//   editList - the list to add the edits to
//   participantList - the list of participant names to update
//   priorRec - the information about any existing participants
//   rec - the information about the new participants
//
// RETURNS:
//--------------------------------------------------------------------
function editScriptParticipants(editList, participantList, priorRec, rec) {  
  var scriptNodes = getScriptNodes();
  
  // loop through the participant list, and handle each accordingly
  for (var i=0; i < participantList.length; i++) {
    var addParticipant = true;
    var participantType = participantList[i];
    
    // ignore this participant if a mask is not defined
    mask = getServerData("mask", participantType);
    if (!mask) {
      addParticipant = false;
    }
    
    // check if another behavior has already added the correct participant
    if (addParticipant) {
      
      // call getPriorNode to determine if this participant has any
      // dependents.  this will return null if other scripts depend on
      // this participant.
      priorNode = getPriorNode(priorRec, participantType);
      
      // search for the participant in the script nodes
      scriptNode = findParticipant(participantType, scriptNodes, rec);
      if (scriptNode) {  // we found it
        
        tagStr = scriptNode.tagStr;
        origStr = tagStr;

        // update the values for this participant using regular expressions
        // the expressions are located in the "SUB#" globals
        for (var j=1; j < 11; j++) {
          var paramInfo = getServerData("sub" + ((j != 10) ? j : 0) , participantType);
          if (paramInfo != null && paramInfo.length > 1) {

            //DEBUG alert("original source:\n" + tagStr);
            while ((result = paramInfo[1].exec(tagStr)) != null) {
              if (rec[paramInfo[0]] != null) {
                tagStr = tagStr.substring(0, result.index) + 
                         result[1] + rec[paramInfo[0]] + result[2] + 
                         tagStr.substring(result.index + result[0].length);
              }
            }
            //DEBUG alert("edited source:\n" + tagStr);
          } else {
            break;
          }
        }
        
        // if this participant can have multiple copies, be careful editing it
        if (getServerData("type", participantType) == "multiple") {

          if (origStr != tagStr) { // edit needed
            if (priorNode && priorNode == scriptNode.obj) {  // no dependents, edit it
              //DEBUG alert("editing:\n\n" + tagStr);
              editList.add(tagStr,priorNode,getServerData("wght", participantType));
              addParticipant = false;
            }
          } else { // no edit needed
            addParticipant = false;
          }

        } else { // standard edit

          // if any changes were made, re-insert this block
          if (origStr != tagStr) {
            //DEBUG alert("editing:\n\n" + tagStr);
            editList.add(tagStr,scriptNode.obj,getServerData("wght", participantType));
          }
          addParticipant = false;
        }
          
      }
      
      // check if we need to delete the priorNode
      if (priorNode && (!scriptNode || scriptNode.obj != priorNode)) {
        //DEBUG alert("deleting node: " + participantType);
        editList.add("",priorNode,getServerData("wght",participantType)); // delete
      }
    }
    
    // if it wasn't found already, add this participant to the page
    // replace any parameters within the mask with the relevant data
    if (addParticipant) {
      for (var j=1; j < 10; j++) {
        var paramInfo = getServerData("tok" + j ,participantList[i]);
        if (paramInfo != null && paramInfo.length > 1) {
          var newVal = rec[paramInfo[0]];
          if (newVal == null) {
            newVal = "";
          }
          mask = mask.replace(paramInfo[1], newVal);
        }
      }
      //DEBUG alert("adding:\n\n" + mask);

      editList.add(mask,false,getServerData("wght",participantList[i]));
    }
    
  }
}


//*-------------------------------------------------------------------
// FUNCTION:
//   checkIfScriptExists
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------
function checkIfScriptExists(theId, cfTag, aPatt, aVal, bPatt, bVal) {
  var dom = dw.getDocumentDOM();
  var retVal = false;
  var patt = getServerData("patt",theId);
  if (aPatt) patt = patt.replace(RegExp(aPatt,"g"),aVal);
  if (bPatt) patt = patt.replace(RegExp(bPatt,"g"),bVal);
  nodes = findNodes(dom, cfTag);
  for (i=0; i<nodes.length; i++) {
    tagStr = nodes[i].getAttribute("ORIG");
    if (tagStr) tagStr = unescape(tagStr);
    else tagStr = nodes[i].innerHTML;
    if (tagStr.match(patt)) {
      retVal = true;
      break; //only finding one thing, so exit
    }
  }
  return retVal;
}


//*-------------------------------------------------------------------
// FUNCTION:
//   getParentBlockTag
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------
function getParentBlockTag(node) {
   var retNode = node;
   var bClimbTree = true;
   
   // if current tag is HR, just return it
   if (retNode.tagName && retNode.tagName == "HR") {
     bClimbTree = false;
   }
   
   // if current tag is a container tag, just return it
   if ( bClimbTree && retNode.tagName && isAContainerTag(retNode.tagName) ){
     bClimbTree = false;
   }
   
   // else, walk up the tree until we get to a container tag, 
   // most usually a paragraph
   if ( bClimbTree ){
     retNode = retNode.parentNode;
     while ( !isAContainerTag(retNode.tagName) ){
       retNode = retNode.parentNode;
     } 
   }
   
   return retNode;
}


//*-------------------------------------------------------------------
// FUNCTION:
//   removeAllSpaces
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------
function removeAllSpaces(textStr){
  var retVal = "";
  var strLen = textStr.length;
  var i;
  for (i=0;i<strLen;i++){
    if ( textStr.charAt(i) != "\n" && textStr.charAt(i) != "\r" &&
         textStr.charAt(i) != "\t")
      retVal += textStr.charAt(i);
  }
  return retVal;

}
  
  
//*-------------------------------------------------------------------
// FUNCTION:
//   containsBlockTags
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------
function containsBlockTags(currText){
  var hasBlockTag = false;
  var patt = /<[\/]*(\w+)>/g;
  var result, theTag

  while ( (result = patt.exec(currText)) != null ){
    theTag = result[1].toUpperCase();
    if ( isAContainerTag(theTag) ){
      hasBlockTag = true;
      break;
    }
  }
  patt.lastIndex = 0;
  return hasBlockTag;
}


//*-------------------------------------------------------------------
// FUNCTION:
//   arrContains
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------
function arrContains(arr,item){
  var nItems = arr.length;
  var retVal = false, i;

  for (i=0;i<nItems;i++) {
    if (arr[i] == item) {
      retVal = true; 
      break;
    }
  }
  
  return retVal;
}
