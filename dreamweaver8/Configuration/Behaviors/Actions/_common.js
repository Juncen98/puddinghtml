//!!!!!!!! NOTICE: THIS FILE IS DEPRECATED IN DREAMWEAVER 3          !!!!!!!!
//!!!!!!!! Please use the common files found in Configuration/Shared !!!!!!!!

// Copyright 1998, 1999, 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

//*************** GLOBALS VARS *****************

var REF_UNNAMED = "unnamed <"; //this is what getObjectRefs() returns for unnamed objects;
var REF_CANNOT = "cannot reference <";

//**************** GENERIC FUNCTIONS ****************

//Given a function call, extracts the args and returns them in array
//Respects ', skips over stuff between quotes, and returns them dequoted.
//IMPORTANT: argArray[0] is the function call!! Actual args start at argArray[1].

function extractArgs(behFnCallStr){
  var i, theStr, lastPos, argArray;

  argArray = getTokens(behFnCallStr,"(),");
  for (i=0; i<argArray.length; i++) {
    theStr = unescQuotes(argArray[i]);
    lastPos = theStr.length-1;
    if (theStr.charAt(0) == "'" && lastPos > 0 && theStr.charAt(lastPos) == "'")
      argArray[i] = theStr.substring(1,lastPos);
  }
  return argArray
}



//Passed a string, finds special chars '"\ and escapes them with \

function escQuotes(theStr){
  var i, theChar, escStr = "";
  for(var i=0; i<theStr.length; i++) {
    theChar = theStr.charAt(i);
    escStr += (theChar=='"' || theChar=="'" || theChar=="\\")?("\\"+theChar):theChar;
  }
  return escStr;
}



//Passed a string, finds any escape chars \ and removes them

function unescQuotes(theStr){
  var strLen, i, theChar, unescStr = "";
  strLen = theStr.length;
  for(i=0; i<strLen; i++) {
    theChar = theStr.charAt(i);
    if (theChar == "\\" && i < strLen - 1) //if escape char and not end
      theChar = theStr.charAt(++i); //append next char and skip over
    unescStr += theChar;
  }
  return unescStr;
}



//Invokes dialog to allow user to select filename. Puts value in text input.

function browseFile(fieldToStoreURL){
  var fileName = "";
  fileName = browseForFileURL();  //returns a local filename
  if (fileName) fieldToStoreURL.value = fileName;
}



//Given a string "myObject  *" returns "myObject  *".

function stripStar(theStr) {
  var endPos;

  endPos = theStr.indexOf('  *');
  return ((endPos > 0)? theStr.substring(0,endPos) : theStr);
}



//Given a string "some property (value)" returns "some property".

function stripValue(theStr) {
  var endPos = theStr.indexOf(' (');
  return ((endPos > 0)? theStr.substring(0,endPos) : theStr);
}



//Given theSelect obj and an index, it appends a star
//and inserts the new string into the menu at position index.
//If the menu item was "layer[2]" it becomes "layer[2]  *".
//Existing "  *" values get stripped off first.

function addStarToMenuItem(theSelect,menuIndex) {
  var newMenuText;

  newMenuText = stripStar(theSelect.options[menuIndex].text); //remove if old star
  newMenuText += "  *";  //append "  *"
  theSelect.options[menuIndex]=new Option(newMenuText); //add new line to menu
}



//Given theSelect obj and an index and a value, it appends the value in parens
//and inserts the new string into the menu at position index.
//If the menu item was "layer[2]" and value is "show", it becomes "layer[2] (show)".
//Existing " (value)" values get stripped off first. If value is empty, strips all.

function addValueToMenuItem(theSelect,menuIndex,value) {
  var newMenuText = stripValue(theSelect.options[menuIndex].text); //remove old val
  if (value.length > 0) { //if valid value
    newMenuText += " (" + value + ")";  //append " (value)"
  }
  theSelect.options[menuIndex]=new Option(newMenuText); //add new line to menu
}



//Converts an array of JS object references to an array of nice names.
//For example, document.layers['layr1'].document.form1.img1 becomes
//             image "img1" in form "form1" in layer "layr1"
//Assumes all objects are of type objTypeStr, and the last token is the name
//Note: I reverse the array of tokens to simplify nesting.

function niceNames(objRefArray,objTypeStr) {
  var i, j, niceRef, tokens;
  var niceNameArray = new Array(objRefArray.length);

  for (i in objRefArray) {  //with object reference array
    tokens = getTokens(objRefArray[i],".").reverse();   //split ref into tokens and rev order
    if (tokens.length > 1) {
      niceRef = objTypeStr + ' ' + nameReduce(tokens[0]);  //start building str, ie: image "foo"
      if (tokens.length > 2) {  //reference includes some nesting...
        if (tokens[1] != "document" && tokens[2] == "document") //inside form, add form reference
          niceRef += ' ' + TYPE_Separator + ' ' + TYPE_Form + ' ' + nameReduce(tokens[1]);
        for (j=1; j<tokens.length-1; j++) if (tokens[j].indexOf("layers[") == 0)
            niceRef += ' ' + TYPE_Separator + ' ' + TYPE_Layer + ' ' + nameReduce(tokens[j]);
        if (tokens[j] != "document")  //if top, parent, or window, expect frame
          niceRef += ' ' + TYPE_Separator + ' ' + TYPE_Frame + ' ' + nameReduce(tokens[j-1]);
      }
    } else niceRef = objRefArray[i];
    niceNameArray[i] = niceRef;
  }
  return niceNameArray;
}



//Extracts a name or num from array string and quotes if necessary. So
// myImg         => "myImg"
// layers['foo'] => "foo"
// embeds[0]     => 0
// myImg[2]      => "myImg[2]"

function nameReduce (objName) {
  var retVal, arrayTokens;

  retVal = '"' + objName + '"';  //default is object wrapped in quotes
  if (objName.indexOf("[") > 0) {  //if it's an array
    arrayTokens = getTokens(objName,"[]\"'");  //break up tokens
    if (arrayTokens.length == 2) {  //if exactly two tokens
      if ("frames layers forms embeds links anchors all".indexOf(arrayTokens[0]) != -1) { //if legal
        if (arrayTokens[1] == ""+parseInt(arrayTokens[1])) //if a number
          retVal = arrayTokens[1];
        else                                               //else it's a string
          retVal = '"' + arrayTokens[1] + '"';
      }
    }
  }
  return retVal;
}



//Emulates printf("blah blah %s blah %s",str1,str2)
//Used for concatenating error message for easier localization.
//Returns assembled string.

function errMsg() {
var i,numArgs,errStr="",argNum=0,startPos;

  numArgs = errMsg.arguments.length;
  if (numArgs) {
    theStr = errMsg.arguments[argNum++];
    startPos = 0;  endPos = theStr.indexOf("%s",startPos);
    if (endPos == -1) endPos = theStr.length;
    while (startPos < theStr.length) {
      errStr += theStr.substring(startPos,endPos);
      if (argNum < numArgs) errStr += errMsg.arguments[argNum++];
      startPos = endPos+2;  endPos = theStr.indexOf("%s",startPos);
      if (endPos == -1) endPos = theStr.length;
    }
    if (!errStr) errStr = errMsg.arguments[0];
  }
  return errStr;
}



function findObject(objName,  parentObj) {
  var i,tempObj="",found=false,curObj = "";
  var NS = (navigator.appName.indexOf("Netscape") != -1);
  if (!NS && document.all) curObj = document.all[objName]; //IE4
  else {
    parentObj = (parentObj != null)? parentObj.document : document;
    if (parentObj[objName] != null) curObj = parentObj[objName]; //at top level
    else { //if in form
      if (parentObj.forms) for (i=0; i<parentObj.forms.length; i++) {  //search level for form object
        if (parentObj.forms[i][objName]) {
          curObj = parentObj.forms[i][objName];
          found = true; break;
      } }
      if (!found && NS && parentObj.layers && parentObj.layers.length > 0) {
        parentObj = parentObj.layers;
        for (i=0; i<parentObj.length; i++) { //else search for child layers
          tempObj = findObject(objName,parentObj[i]); //recurse
          if (tempObj) { curObj = tempObj; break;} //if found, done
  } } } }
  return curObj;
}



//Custom non-Javascript code to extract tags and get object names.
//Passed HTML tag (ie IMG), gets the current doc source
//HTML and returns an array of names (empty if unnamed).
//This argument is not case sensitive (can be LAYER, Layer, or layer).
//For Example, given <IMG NAME="myPhoto"> <IMG><IMG name="bobsPhoto">
//returns array: myPhoto,,bobsPhoto

function getParam(tagStr,param){
  var j,tokenString;
  var theName = "";
  var tokenArray = new Array;
  tokenArray = getTokens(tagStr," =<>");
  for (j=0; j<(tokenArray.length - 1); j++) {
    tokenString = tokenArray[j].toUpperCase(); //force UPPER CASE
    if (tokenString.indexOf(param.toUpperCase()) == 0) {  //found name
      theName = tokenArray[j+1];  //should return single quoted element in array
      firstChar = theName.charAt(0);
      lastChar = theName.charAt(theName.length - 1);
      if ((firstChar == lastChar) && (firstChar == "'" || firstChar == "\""))
        theName = theName.substring(1,theName.length - 1);
      break;
  } }
  return theName;
}

//Passed a string, returns true if it contains any "bad" characters

function badChars(theStr){
  return theStr.search(/[ ~!@#$%^&*()_+|`\-=\\{}[\]:";'<>,.\/?]/) != -1;
}

//Passed a browser type and one or more tags, returns an array of object
//references for the tag(s) and browser type. If the document is in a
//frameset, returns references in all of the frames of the parent frameset.

function getAllObjectRefs(browserType,tagName){
  var refsArray = new Array(),theFrame,frameName,Tag,i,j;
  var frameList = getObjectRefs("NS 4.0","parent","frame"); //get list of frames
  var numArgs = arguments.length;
  for (i=1;i<numArgs;i++){
    Tag = arguments[i]
    if (frameList && frameList.length>0) { //if frames
      for (j=0; j<frameList.length; j++) {
	    if (frameList[j].indexOf(REF_UNNAMED) != -1)
	      theFrame = "parent.frames[" + j + "]";
	    else {
		  //check for duplicately named frames by checking numer of ['s in name
		  //for instance,parent.frames['name'][0] would have 2
		  if (frameList[j].indexOf("[")!=frameList[j].lastIndexOf("["))
		    frameList[j] = frameList[j].substring(0,frameList[j].indexOf("]") + 1)  
		  theFrame = frameList[j];
		  //alert("after generating new ref, it is " + theFrame);	  
		}  
		refsArray = refsArray.concat(getObjectRefs(browserType,theFrame,Tag));
      }
    } else 
      refsArray = refsArray.concat(getObjectRefs(browserType,"document",Tag)); 
  }
  return refsArray;
}

//Passed a tagName, returns an array of all tags of tagName. If the document is in a frameset,
//the array includes all of the tags in all of the frames of the document's parent.

function getAllObjectTags(tagName){
  var tagsArray = new Array(),theFrame,frameName,i;
  var frameList = getObjectRefs("NS 4.0","parent","frame"); //get list of frames
  if (frameList && frameList.length>0) { //if frames
    for (i=0;i<frameList.length; i++){
	  if (frameList[i].indexOf(REF_UNNAMED)!=-1)
        theFrame = "parent.frames["+i+"]";
	  else
	    theFrame = frameList[i];
	tagsArray = tagsArray.concat(getObjectTags(theFrame,tagName));  
	}  
  } else
   tagsArray = tagsArray.concat(getObjectTags("document",tagName));	
   return tagsArray;
}
  
//*************** GENERIC DOM MANIPULATION FNS *****************

//Returns a function call if exists in event handler.
//  obj       - DOM object, such as dreamweaver.getDocumentDOM().body
//  eventName - "onLoad", "onClick" etc (not case sensitive)
//  fnName    - "MM_preloadImages" etc.
//  optStr    - (optional) function call must contain this string to be found
//Given <TAG onEvent="aaa();bbb();ccc()">,
//calling getHandler(tagObj,'onEvent','bbb') will
//return "bbb()". Returns empty if event or fn don't exist.

function getHandler(obj,eventName,fnName, optStr) {
  var eventStr,fnArray,i,theChunk,retVal = "";
  eventStr = obj.getAttribute(eventName);
  if (eventStr) { //find previous call, or add it
    fnArray = dreamweaver.getTokens(eventStr,";");
    for (i=0; i<fnArray.length; i++) { //look at each code chunk
      if (fnArray[i].indexOf(fnName+'(') != -1 && (!optStr ||  //fn call found
          fnArray[i].indexOf(optStr) != -1)) {
        retVal = fnArray[i]; break;
    } }
  }
  return retVal
}



//Replaces or adds a fn call to an event handler
//  obj       - DOM object, such as dreamweaver.getDocumentDOM().body
//  eventName - "onLoad", "onClick" etc (not case sensitive)
//  fnCall    - "myFun('arg1','arg2')" etc.
//  optStr    - (optional) function call must contain this string to be found
//Given <TAG onEvent="aaa();bbb();ccc()">,
//calling setHandler(tagObj,'onEvent','bbb(1,2)') will
//replace "bbb()" with the altered fn call. If the event
//does not exist, adds it. It fn didn't exist, adds it to the
//end of the list.

function setHandler(obj,eventName,fnCall, optStr) {
  var eventStr,fnName,fnArray=new Array(),i=0;
  eventStr = obj.getAttribute(eventName);
  if (eventStr) { //if event exists
    fnName = fnCall.substring(0,fnCall.indexOf("("));
    fnArray = dreamweaver.getTokens(eventStr,";");
    for (i; i<fnArray.length; i++) //search for fnName
      if (fnArray[i].indexOf(fnName+'(') != -1 && (!optStr ||  //fn call found
          fnArray[i].indexOf(optStr) != -1)) break;
  }
  fnArray[i] = fnCall;
  obj.setAttribute(eventName,fnArray.join(";"));
  return true
}



//Deletes a fn call from an event handler
//  obj       - DOM object, such as dreamweaver.getDocumentDOM().body
//  eventName - "onLoad", "onClick" etc (not case sensitive)
//  fnName    - "MM_preloadImages" etc.
//  optStr    - (optional) function call must contain this string to be found
//Given <TAG onEvent="aaa();bbb();ccc()">,
//calling delHandler(tagObj,'onEvent','bbb') will
//remove "bbb();". If it is the last fn in the handler,
//removes the event entirely.

function delHandler(obj,eventName,fnName, optStr) {
  var eventStr,fnArray=new Array(),i=0,j;
  eventStr = obj.getAttribute(eventName);
  if (eventStr) { //if event exists
    fnArray = dreamweaver.getTokens(eventStr,";");
    for (i; i<fnArray.length; i++) { //look at each code chunk
      if (fnArray[i].indexOf(fnName+'(') != -1 && (!optStr ||  //fn call found
          fnArray[i].indexOf(optStr) != -1)) { //and, if given, optStr exists
        if (fnArray.length == 1) { //if last one, remove attribute
          obj.removeAttribute(eventName);
        } else { //pull out
          for (j=i; j<fnArray.length; j++) fnArray[j] = fnArray[j+1]; //shift array
          fnArray.length--;
          obj.setAttribute(eventName,fnArray.join(';'));
        }
        break;
    } }
  }
  return true
}

///END OF GENERIC DOM MANIPULATION FUNCTIONS  

