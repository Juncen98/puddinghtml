//-- Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved. --


// Overview:
//  Framesets saved as the HTML for the selected object.
//  Depending upon the current selection a new frameset is created with
//    a single call into the new Dreamweaver splitframe command.
//


//---------------     API FUNCTIONS    ---------------


function objectTag() {
  // Return the html tag that should be inserted

  var curDOM = dreamweaver.getDocumentDOM('document');
  var pDOM = dreamweaver.getDocumentDOM('parent');

  // Check to see if current document is a frameset.
  if (curDOM.body.tagName.toUpperCase() == 'FRAMESET') {
	  var curOffsets = curDOM.getSelection();
	  var curNode = curDOM.offsetsToNode(curOffsets[0], curOffsets[1]);
    // Wrap current selection with new Frameset.

    wrapFrame(curDOM, curNode, getFrameSpec());
  // Otherwise, check if there is a parent frameset.
  } else  if (pDOM == null) {
    // No parent, create new frameset and wrap current document
    newFrame(curDOM, getFrameSpec());
  } else {
    // Wrap current Frameset with new Frameset.
    if (!pDOM) {return;} // Check for invalid DOM.
    wrapFrame(pDOM, activeFrameNode(), getFrameSpec());
  }
  pDOM = dreamweaver.getDocumentDOM('parent');
  curDOM = dreamweaver.getDocumentDOM('document');
  if (pDOM){
    dreamweaver.setActiveWindow(pDOM, true);
    if (pDOM.body)
      pDOM.setSelectedNode(pDOM.body)
  }
  else if(curDOM.body)
    curDOM.setSelectedNode(curDOM.body);

  // if the original doc was XHTML, convert the frameset doc to XHTML,
  // to clean up the syntax
  if (curDOM.getIsXHTMLDocument())
    dreamweaver.getDocumentDOM().convertToXHTML();

  // Finally return nothing. No values actually inserted.

	prefsAccessibilityOption = dw.getPreferenceString("Accessibility", "Accessibility Frame Options", "");
	if (prefsAccessibilityOption =='TRUE') {

	   var cmdFile = dreamweaver.getConfigurationPath() + "/Commands/FrameOptions.htm";
	   var cmdDOM = dreamweaver.getDocumentDOM(cmdFile);
   
       if (pDOM) {cmdDOM.parentWindow.setFormItem(pDOM);}
	   else {cmdDOM.parentWindow.setFormItem(curDOM);}
	   dreamweaver.popupCommand("FrameOptions.htm");
   }
}


//---------------    LOCAL FUNCTIONS   ---------------


// Function: wrapFrame
// Description: Wraps the passed template Frameset DOM around the current
//  selection (this may either be a document or frameset).
// Arguments:
//   curDOM - the current DOM
//   curNode - the currently "selected" node in the current DOM
//   newFSDOM - DOM for new Frameset template (one frame should be named mm_target).
function wrapFrame (curDOM, curNode, tfsDOM) {
  var newFrameStr = '';
  var targetSelection = curDOM.nodeToOffsets(curNode);
  var cArr, tArr;

  // Target frame specifies the content for the new frame.
  if (!tfsDOM.mm_target) {return;} // Check for no target defined.

  // Modify the current frameset to include new frames.
  newFrameStr += curDOM.documentElement.outerHTML.substring(0,targetSelection[0]);

  // Insert the curNode into the mm_target frame of the new frameset DOM.
  var curNodeHTM = curNode.outerHTML;
  var tfsTargetOffsets = tfsDOM.nodeToOffsets(tfsDOM.mm_target);
  var tfsHTM = tfsDOM.documentElement.outerHTML;
  var tfsBodyOffsets = tfsDOM.nodeToOffsets(tfsDOM.body);

  newFrameStr += tfsHTM.substring(tfsBodyOffsets[0],tfsTargetOffsets[0]) +
                 curNodeHTM +
                 tfsHTM.substring(tfsTargetOffsets[1],tfsBodyOffsets[1]);

  // Add the remaining new frame.
  newFrameStr += curDOM.documentElement.outerHTML.substring(targetSelection[1]);

  // Set the current document.
  curDOM.documentElement.outerHTML = newFrameStr;
}


// Function: childNodeNum
// Description: Determine the number of the given childNode.
function childNodeNum(cNode) {
  var curNum = 0;
  var rtnNum = null;

  if (cNode.parentNode) {
    var numChildren = cNode.parentNode.childNodes.length;
    for (curNum = 0; curNum < numChildren; curNum++) {
      if (cNode.parentNode.childNodes[curNum] == cNode) {
        rtnNum = curNum;
        break;
  } } }
  return rtnNum;
}

// Function: getListItem
// Description: Returns numbered item in list.
function getListItem(inList, itemNum) {
  var curArr = inList.split(',');
  return curArr[itemNum];
}

// Function: sizeRelOr
// Description: Returns true if the child frame node size is relative
//   and the frameset is either a row or col, but not both.
function sizeRelOr(cNode) {
  var fsCols = cNode.parentNode.cols;
  var fsRows = cNode.parentNode.rows;
  var rtnBool = false;
  if ((fsCols != null) && (fsRows != null)) { // Exclusive OR
    rtnBool = false;
  } else {
    if (fsCols) {
      if (getListItem(fsCols, childNodeNum(cNode)) == "*") {
        rtnBool = true;
      }
    } else {
      if (getListItem(fsRows, childNodeNum(cNode)) == "*") {
        rtnBool = true;
  } } }
  return rtnBool;
}


// Function: newFrame
// Description: Create a new frameset document and place the existing document into new Frameset.
// Arguments:
//  inDOM -
//  newFSDOM -
function newFrame (inDOM, newFSDOM) {
  if (!(typeof inDOM.splitFrame == 'function')) {return;} // Function not defined.
  if (!dw.getDocumentDOM().canSplitFrame()) {return;} // Not a valid selection.

  var frameStr = '';

  // Create a new frameset
  //  Note: Original document refereced below as childNodes[1]
  inDOM.splitFrame('right');

  // Get new frameset document DOM (frameset should be the
  //  active document after split command)
  var curDOM = dreamweaver.getDocumentDOM('document');
  if (!curDOM) {return;} // Check for invalid DOM.

  // Target frame specifies the content for the new frame.
  if (newFSDOM) {
    var newSrc = curDOM.body.childNodes[1].src;
    // Replace the entire frameset with the template frameset.
    newFSDOM.mm_target.src = newSrc;
    newFSDOM.mm_target.name = 'mainFrame';
	
	curDOM.body.outerHTML = newFSDOM.body.outerHTML;

  } // else if target not found, do nothing.
}


// Function: activeFrameOffsets
// Description: Return the node into the frameset for the currently
//  selected frame. If no frame is selected return the offset for
//  the entire frameset.
function activeFrameNode () {
  var curDOM = dreamweaver.getDocumentDOM('document');
  var pDOM = dreamweaver.getDocumentDOM('parent');
  var frameNodeList = pDOM.getElementsByTagName('frame');
  var numberOfFrames = frameNodeList.length;
  var returnNode = pDOM.body;

  for (var i = 0; i < numberOfFrames; i++) {
    if (dreamweaver.getDocumentDOM('parent.frames['+i+']') == curDOM) {
      returnNode = frameNodeList[i];
      break;
  } }
  return returnNode;
}


// Function: cleanFrameset
// Description: Remove any extranious data in the current frameset template and
//  give all the frames a unique name.
// Arguments:
function cleanFrameset(fsDOM) {
  //  Remove existing src attributes.
  if (fsDOM != null) {
    var frameNodeList = fsDOM.getElementsByTagName('frame');
    var numberOfFrames = frameNodeList.length;
    var oldName = 'FrameName'; // Default frame name if none specified.

    for (var curFrame = 0; curFrame < numberOfFrames; curFrame++) {
      if (frameNodeList[curFrame].name) // Check that the frame has a name.
	      oldName = frameNodeList[curFrame].name;
      if (oldName != "mm_target") { // Set a unique name and cleanup frame tag.
        frameNodeList[curFrame].name = makeUniqueFrameName(oldName);

        // Remove the invalid src attribute.
        frameNodeList[curFrame].removeAttribute("src");
  } } }

  return fsDOM;
}


// Function: getFrameSpec
// Description: Returns the object frame specification.
function getFrameSpec () {
  // The frameset *is* the object's HTML.
  var rtnDOM = cleanFrameset(document);
  // Return frameset specification it.
  return rtnDOM;
}


// Create a unique frame name.
// For ex: makeUniqueFrameName("leftFrame") returns leftFrame, leftFrame1, leftFrame2, etc.

function makeUniqueFrameName(baseName) {
  var objArray,tagCounter=1,i,possName,name,DOM,nameList="";

  possName = baseName;
  DOM = dreamweaver.getDocumentDOM("parent");
  if (!DOM) DOM = dreamweaver.getDocumentDOM("document");
  objArray = DOM.body.getElementsByTagName('FRAME');
  if (objArray.length > 0) { //other images, check
    for (i=0; i<objArray.length; i++) { //create list of all img names
      name = objArray[i].getAttribute("name"); if (name) nameList += " " + name + " ";
      name = objArray[i].getAttribute("id"); if (name) nameList += " " + name + " ";
    }
    while (nameList.indexOf(possName) != -1) possName = baseName+tagCounter++; //find 1st avail
  }
  return possName
}


