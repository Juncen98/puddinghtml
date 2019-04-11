//SHARE-IN-MEMORY=true
//
// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.
//
// docInfo.js
//
// Provides information about the user's document.
//
//--------------------------------------------------------------
//   
//
//getAllObjectRefs(browserType,tagName){
//getAllObjectTags(tagName){
//getSelectedObj(){
//createUniqueName(tagName,tagString,arrToSearch){ 
//makeUniqueName(tag, baseName) {


var REF_UNNAMED     = "unnamed <";     //this is what getObjectRefs() returns for unnamed objects;
var REF_CANNOT      = "cannot reference <"; //objects that cannot be referenced


//Passed a browser type and one or more tags, returns an array of object
//references for the tag(s) and browser type. If the document is in a
//frameset, returns references in all of the frames of the parent frameset.

function getAllObjectRefs(browserType,tagName){
  var refsArray = new Array(),theFrame,frameName,Tag,i,j;
  var frameList = dw.getObjectRefs("NS 4.0","parent","frame"); //get list of frames
  var numArgs = arguments.length;
  for (i=1;i<numArgs;i++){
    Tag = arguments[i]
    if (frameList && frameList.length>0) { //if frames
      for (j=0; j<frameList.length; j++) {
        if (frameList[j].indexOf(REF_UNNAMED) != -1) theFrame = "parent.frames[" + j + "]";
        else {
          //check for duplicately named frames by checking numer of ['s in name
          //for instance,parent.frames['name'][0] would have 2
          if (frameList[j].indexOf("[")!=frameList[j].lastIndexOf("["))
            frameList[j] = frameList[j].substring(0,frameList[j].indexOf("]") + 1)  
          theFrame = frameList[j];
        }  
        //if the frame is the current document, use simple ref
        if (dw.getDocumentDOM(theFrame) == dw.getDocumentDOM("document")) theFrame = "document";
        refsArray = refsArray.concat(dw.getObjectRefs(browserType,theFrame,Tag));
      }
    } else 
      refsArray = refsArray.concat(dw.getObjectRefs(browserType,"document",Tag)); 
  }
  return refsArray;
}


//Passed a tagName, returns an array of all tags of tagName. If the document is in a frameset,
//the array includes all of the tags in all of the frames of the document's parent.

function getAllObjectTags(tagName){
  var tagsArray = new Array(),theFrame,frameName,i;
  var frameList = dw.getObjectRefs("NS 4.0","parent","frame"); //get list of frames
  if (frameList && frameList.length>0) { //if frames
    for (i=0;i<frameList.length; i++){
      if (frameList[i].indexOf(REF_UNNAMED)!=-1) theFrame = "parent.frames["+i+"]";
      else {
        //check for duplicately named frames by checking numer of ['s in name
        //for instance,parent.frames['name'][0] would have 2
        if (frameList[i].indexOf("[")!=frameList[i].lastIndexOf("["))
          frameList[i] = frameList[i].substring(0,frameList[i].indexOf("]") + 1)  
        theFrame = frameList[i];
      }  
      tagsArray = tagsArray.concat(dw.getObjectTags(theFrame,tagName));  
    }  
  } else tagsArray = tagsArray.concat(dw.getObjectTags("document",tagName));
  return tagsArray;
}
  

//function: getSelectedObj
//description: returns the currently selected object
// IF YOU'RE DOING ANYTHING ELSE THAT INVOLVES THE DOM IN YOUR FUNCTION, YOU
// DON'T NEED getSelectedObj()! JUST CALL dw.getDocumentDOM().getSelectedNode() 
// DIRECTLY!

function getSelectedObj(){
   var dom = dw.getDocumentDOM();
   return dom.getSelectedNode();
}


//Creates a unique name for objs of tagName, using tagString
//for instance: if tagString = Image, returns a name like Image1
function createUniqueName(tagName,tagString,arrToSearch){ 
  var frameListSize,dupe=true,counter=1;
  var objsArray=(createUniqueName.arguments.length == 3)?arrToSearch:
          dreamweaver.getDocumentDOM('document').getElementsByTagName(tagName);
  var objsArrayLen = objsArray.length;
  var objName = tagString + counter;
  
  while (dupe==true){ //check new name against name of all other tagName objs
    dupe=false;
    objName = tagString + counter++; 
    //iterates through possible names: tagName1, then tagName2, etc.
    for (i=0;dupe==false && i<objsArrayLen;i++){
      //if another object of this type has the same name
      if (objsArray[i].getAttribute("name") == objName) 
        dupe=true; //then repeat the loop, trying a new name
    }
  }
  return objName; //return new name 
	
}

//Given a tag and a base name (or id), generates a unique name.
//For ex: makeUniqueName("IMG","myImage") returns myImage1, myImage2 etc.

function makeUniqueName(tag, baseName) {
  var objArray,tagCounter=1,i,possName,name,DOM,nameList="";

  possName = baseName + tagCounter++;
  DOM = dreamweaver.getDocumentDOM("document");
  objArray = DOM.body.getElementsByTagName(tag.toUpperCase());
  if (objArray.length > 0) { //other images, check
    for (i=0; i<objArray.length; i++) { //create list of all img names
      name = objArray[i].getAttribute("name"); if (name) nameList += " " + name + " ";
      name = objArray[i].getAttribute("id"); if (name) nameList += " " + name + " ";
    }
    while (nameList.indexOf(possName) != -1) possName = baseName+tagCounter++; //find 1st avail
  }
  return possName;
}


// Searches for a tag wrapping the current selection.
// Returns true if the tag found. False if not found.
function selectionInsideTag (tagName) {
  var rtnBool = false;
  var curObj = dw.getDocumentDOM('document').getSelectedNode();
  
  if (curObj.nodeType == Node.TEXT_NODE) {
    curObj = curObj.parentNode; // Check the tag wrapping the current tag.
  }
  
  // Look up the tree of tags (will be element nodes until document reached.
  while (curObj.nodeType == Node.ELEMENT_NODE) {
    if (curObj.tagName.toUpperCase() == tagName.toUpperCase()) {
      rtnBool = true; // Found the tag, set return value true.
      break; // No need to look further.
    }
    curObj = curObj.parentNode; // Check the tag wrapping the current tag.
  }
  return rtnBool;
}


// checks if a table contains a show region, repeat region
// or dynamic text server behavior.
// note: this fn needs to be included in this file (as opposed to an UltraDev file)
// because commands like Sort Table need it,and the Sort Table.htm file
// (which needs to include a file that contains this function), should be
// the same for both products
// argument: includeDynamicData -- if true, looks for dynamic data as well
// as the region server behaviors


function hasServerBehaviorApplied(tableObj,includeDynamicData) {
  var dom = dw.getDocumentDOM();
  var tableOffsets = dom.nodeToOffsets(tableObj);
  var regionApplied = false;
  var sbArr = dw.sbi.getServerBehaviors();
  var nItems = sbArr.length, i, sbType, sbRec, regionOffsets;
  
  for (i=0;i<nItems;i++) {
    sbType = sbArr[i].type;
    if (sbType == "repeatedRegion" || sbType.indexOf("showRegion") != -1 ||
       (includeDynamicData && sbType == "dynamicContent")) {
      sbRec = sbArr[i];
      regionOffsets = dom.nodeToOffsets(sbRec.selectedNode);
      
      // if the starting offset or if the ending offset is contained within the
      // table offsets, then assume, for the sake of this function, 
      // that the server behavior code is applied to the table
      if ( (regionOffsets[0] > tableOffsets[0] && regionOffsets[0] < tableOffsets[1]) ||
           (regionOffsets[1] > tableOffsets[0] && regionOffsets[1] < tableOffsets[1]) ) {
           
           regionApplied = true;
           break;
       }
    }
  }
  
  return regionApplied;

}

function isUltraDev() {
  return (dw.appName == "Dreamweaver UltraDev");
}
