//*************** GLOBALS VARS *****************

var helpDoc = MM.HELP_behGoToTimelineFrame;

//******************* BEHAVIOR FUNCTION **********************

//Jumps a timeline to a new frame.
//Accepts the following arguments:
//  tmLnName - the name of the timeline (ex: Timeline1)
//  fNew     - the frame number to jump to
//  numGotos - (optional) the number of times to jump there
//
//Designed to work in conjunction with Dreamweaver's Timeline Inspector.
//The Timeline Inspector creates a JS function called MM_initTimelines(),
//which puts all the timeline settings in a multidimensional array, saved
//into a document property called document.MM_Time.
//
//My function initializes the timeline by calling MM_initTimelines.
//Then it checks the data arrays and sets all sprites to their new positions
//and sets other properties. For behavior sprites it evals the behavior call.
//If numGotos is set, this function will disable itself. For example, if you call:
//  MM_timelineGoto("Timeline1", "1", "3");
//this function will work the first and second time, but not the third, so
//that the timeline can continue after "3" loops.

function MM_timelineGoto(tmLnName, fNew, numGotos) { //v2.0
  //Copyright 1998, 1999, 2000, 2001, 2002, 2003, 2004 Macromedia, Inc. All rights reserved.
  var i,j,tmLn,props,keyFrm,sprite,numKeyFr,firstKeyFr,lastKeyFr,propNum,theObj;
  if (document.MM_Time == null) MM_initTimelines(); //if *very* 1st time
  tmLn = document.MM_Time[tmLnName];
  if (numGotos != null)
    if (tmLn.gotoCount == null) tmLn.gotoCount = 1;
    else if (tmLn.gotoCount++ >= numGotos) {tmLn.gotoCount=0; return}
  jmpFwd = (fNew > tmLn.curFrame);
  for (i = 0; i < tmLn.length; i++) {
    sprite = (jmpFwd)? tmLn[i] : tmLn[(tmLn.length-1)-i]; //count bkwds if jumping back
    if (sprite.charAt(0) == "s") {
      numKeyFr = sprite.keyFrames.length;
      firstKeyFr = sprite.keyFrames[0];
      lastKeyFr = sprite.keyFrames[numKeyFr - 1];
      if ((jmpFwd && fNew<firstKeyFr) || (!jmpFwd && lastKeyFr<fNew)) continue; //skip if untouchd
      for (keyFrm=1; keyFrm<numKeyFr && fNew>=sprite.keyFrames[keyFrm]; keyFrm++);
      for (j=0; j<sprite.values.length; j++) {
        props = sprite.values[j];
        if (numKeyFr == props.length) propNum = keyFrm-1 //keyframes only
        else propNum = Math.min(Math.max(0,fNew-firstKeyFr),props.length-1); //or keep in legal range
        if (sprite.obj != null) {
          if (props.prop2 == null) sprite.obj[props.prop] = props[propNum];
          else        sprite.obj[props.prop2][props.prop] = props[propNum];
      } }
    } else if (sprite.charAt(0)=='b' && fNew == sprite.frame) eval(sprite.value);
  }
  tmLn.curFrame = fNew;
  if (tmLn.ID == 0) eval('MM_timelinePlay(tmLnName)');
}


//******************* API **********************


//Checks for the existence of timelines.
//If none exist, returns false so this Action is grayed out.

function canAcceptBehavior(){
  var allScripts,i,theScript,timelineExists;

  timelineExists = false;
  allScripts = getObjectTags("document","script");
  for (i in allScripts) {
    theScript = ""+allScripts[i];
    if (theScript.indexOf("function MM_initTimelines") != -1) {
      timelineExists = true;
      break;
  } }
  return (timelineExists);
}



//Returns a Javascript function to be inserted in HTML head with script tags.

function behaviorFunction(){
  return "MM_timelineGoto";
}



//Returns fn call to insert in HTML tag <TAG... onEvent='thisFn(arg)'>
//Returns two args: the selected timeline name, and the frmNum to goto.

function applyBehavior(x,y,theEvent) {
  var menuIndex, timelineName, frmNum, numGotos, curFrm;
  var eventFromTI = "onFrame";  //event prefix passed to applyBehavior from Timeline Inspector

  menuIndex = document.theForm.menu.selectedIndex;  //get menu selection index
  timelineName = document.theForm.menu.options[menuIndex].text; //gets selected string
  frmNum = parseInt(document.theForm.frmNum.value); //try and get frame num
  if ((document.theForm.frmNum.value != ""+frmNum) ||  //if not a number
      (frmNum < 1))                                    //or if < 1
    return MSG_NegFrameNum;
  else
    if (document.theForm.numGotos.value) { //if not empty
      numGotos = parseInt(document.theForm.numGotos.value); //try and get numGotos
      if ((document.theForm.numGotos.value != ""+numGotos) || //if not a number
          (numGotos < 1))                                     //or if < 1
           return MSG_NegGotoNum;

      else { //user entered a Loop value
        if (theEvent.indexOf(eventFromTI) == -1) { //if event is not from Timeline Inspector
          document.theForm.numGotos.value == ""; //clear loop value
          return MSG_LoopNotFromTI;
        }
        curFrm = parseInt(theEvent.substring(eventFromTI.length,theEvent.length)); //get frame #
        if (frmNum > curFrm) { //if not jumping backward
          document.theForm.numGotos.value == ""; //clear loop value
          return MSG_LoopNotBackward;
        } 
        else { //everything's okay, allow loop value
          return "MM_timelineGoto('"+timelineName+"','"+frmNum+"','"+(numGotos-1)+"')";
        }
      }
    }
    else return "MM_timelineGoto('"+timelineName+"','"+frmNum+"')";
}



//Passed the function call above, extracts the args and reloads the UI.
//With arg timelineName, scans the menu for a matching item, and selects it.
//If the name is not found, it gives an error msg.
//With arg frmNum, stores in text input.

function inspectBehavior(upStr){
  var timelineName,menuLength,i;
  var argArray = new Array;
  var found = false;

  argArray = extractArgs(upStr); //get args
  if (argArray.length > 2) {  //should be 3 or 4 args (first arg is fn call, ignored)
    timelineName = argArray[1];
    menuLength = document.theForm.menu.options.length;
    for (var i=0; i<menuLength; i++) {  //search menu for matching timeline name
      if (document.theForm.menu.options[i].text == timelineName) { //if found
        document.theForm.menu.selectedIndex = i;  //make it selected
        found = true;
        break;
      }
    }
    if (!found) alert(errMsg(MSG_TimelineNotFound,timelineName));
    document.theForm.frmNum.value = argArray[2];
    if (argArray.length > 3) document.theForm.numGotos.value = parseInt(argArray[3])+1;
  }
}



//***************** LOCAL FUNCTIONS  ******************


//Load the select menu with timeline names.

function initializeUI(){
  var i,j,startPos,endPos,theName,theScript;
  var menuIndex = 0;
  var allScripts = new Array;

  allScripts = getObjectTags("document","script");
  for (i in allScripts) {
    theScript = ""+allScripts[i];
    if (theScript.indexOf("function MM_initTimelines") != -1) {
      j = theScript.indexOf('].MM_Name');
      while (j != -1) {
        startPos = theScript.indexOf('"',++j);
        endPos = theScript.indexOf('"',++startPos);
        if (0 < startPos && startPos < endPos) {
          theName = theScript.substring(startPos,endPos);
          document.theForm.menu.options[menuIndex++] = new Option(theName);
        }
        j = theScript.indexOf('].MM_Name',j+1);
      }
    }
  }

  document.theForm.frmNum.focus(); //set focus on textbox
  document.theForm.frmNum.select(); //set insertion point into textbox
}
