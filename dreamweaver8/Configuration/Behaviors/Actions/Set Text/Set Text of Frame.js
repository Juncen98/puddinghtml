// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

//*************** GLOBALS VARS *****************

var helpDoc = MM.HELP_behSetTextOfFrame;

//******************* BEHAVIOR FUNCTION **********************

//Passed a frame references and a string, replaces frame HTML
//If the preserveBg flag is set, preserves BGCOLOR and TEXT attributes.

function MM_setTextOfFrame(frameRef,newHTML,preserveBg) { //v3.0
  var bodyAttr="", frameObj=eval(frameRef);
  if (frameObj) with (frameObj.document) { //if frame found
    if (preserveBg) bodyAttr = " BGCOLOR='"+bgColor+"' TEXT='"+fgColor+"'";
    write("<HTML><BODY"+bodyAttr+">"+unescape(newHTML)+"</BODY></HTML>");
    close();
  }
}


//******************* API **********************


//Can be used with any tag and any event

function canAcceptBehavior(){
  var retVal = false;
  var nameArray = getObjectRefs("NS 4.0","parent","FRAME");  //get frame names
  if (nameArray.length > 0) retVal = "onMouseOver,(onMouseOver),onClick,(onClick)";
  return retVal;
}



//Returns a Javascript function to be inserted in HTML head with script tags.

function behaviorFunction(){
  return "MM_setTextOfFrame";
}



//Returns fn call to insert in HTML tag <TAG... onEvent='thisFn(arg)'>
//Calls escQuotes to find embedded quotes and precede them with \

function applyBehavior() {
  var index,frameObj,presBg,msgStr="",retVal="";
  with (document.theForm) {
    index = menu.selectedIndex;
    frameObj = escQuotes(document.MM_FRAME_REFS[index]); //get frame name from list
    msgStr = message.value.replace(/[^\x00]*\<html\>\s*([^\x00]*)\s*\<\/html\>[^\x00]*/i,"$1"); //remove any HTML tags
    msgStr = escExprStr(msgStr,true);
    presBg = preserveBg.checked;
  }
  if (frameObj.indexOf(REF_UNNAMED) == 0) retVal = MSG_UnnamedFrame;
  else if (msgStr == null) retVal = MSG_BadBraces;
  else retVal = "MM_setTextOfFrame('"+frameObj+"','"+msgStr+"',"+presBg+")";
  return retVal
}



//Passed the function call above, takes prior arguments and reloads the UI.
//Removes any escape characters "\"

function inspectBehavior(fnStr){
  var argArray,found,numLayers,i;
  var frameObj,startStr,endStr,msgStr;
 
  argArray = extractExprStr(fnStr);
  if (argArray.length == 3) { //expect 3 args
    frameObj=argArray[0];
    found = false;
    numLayers = document.MM_FRAME_REFS.length;
    for (i=0; i<numLayers; i++){  //check if frame is in menu
      if (document.MM_FRAME_REFS[i] == frameObj) { //if frame there
        document.theForm.menu.selectedIndex = i;
        found = true;
        break;
      }
    }
    if (!found) alert(errMsg(MSG_FrameNotFound,frameObj));

    //set text, converting all string expressions to {expression} etc.
    document.theForm.message.value = unescExprStr(argArray[1],true);

    document.theForm.preserveBg.checked = eval(argArray[2]); //check "preserve background" checkbox
  }
}



//***************** LOCAL FUNCTIONS  ******************


//Load up the frames, set the insertion point

function initializeUI(){
  var i,frameObjArray;

  frameObjArray  = getObjectRefs("NS 4.0","parent","FRAME"); //get frame refs (IE is same)

  //fix unnamed frames to be numbered
  for (i=0; i<frameObjArray.length; i++){
    if (frameObjArray[i].indexOf(REF_UNNAMED) == 0)
      frameObjArray[i] = "parent.frames["+i+"]";
  }
  
  document.MM_FRAME_REFS = frameObjArray; //store frame refs for later
  frameObjArray = niceNames(frameObjArray,MM.TYPE_Frame);  //convert to nice
  for (i=0; i<frameObjArray.length; i++){
    document.theForm.menu.options[i]=new Option(frameObjArray[i]); //add frames to menu
  }

  //Select the second frame
  document.theForm.menu.selectedIndex = 1;

  document.theForm.message.focus(); //set focus on textbox
  document.theForm.message.select(); //set insertion point into textbox
}



//Gets the BODY HTML from the selected frame and loads it into the textarea.

function loadFrameContent() {
  itemNum = document.theForm.menu.selectedIndex;
  var DOM = dreamweaver.getDocumentDOM("parent.frames["+itemNum+"]");
  var theBody = stripSpaces(DOM.body.innerHTML);
  document.theForm.message.value = theBody;
}
