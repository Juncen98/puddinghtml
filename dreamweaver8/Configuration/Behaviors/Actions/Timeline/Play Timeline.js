//*************** GLOBALS VARS *****************

var helpDoc = MM.HELP_behPlayTimeline;

//******************* BEHAVIOR FUNCTION **********************

//Starts a timeline playing from the current frame.
//Accepts the following arguments:
//  tmLnName - the name of the timeline to play (ex: Timeline1)
//
//Designed to work in conjunction with Dreamweaver's Timeline Inspector.
//The Timeline Inspector creates a JS function called MM_initTimelines(),
//which puts all the timeline settings in a multidimensional array, saved
//into a document property called document.MM_Time.
//
//My function initializes the timeline by calling MM_initTimelines.
//Next it starts a timer using setTimeout(), which recursively calls this
//again after the elapsed time. I use myID to identify recursive calls.
//Then it checks the data arrays and sets all sprites to their new positions
//and sets other properties. For behavior sprites it evals the behavior call.

function MM_timelinePlay(tmLnName, myID) { //v1.2
  //Copyright 1998, 1999, 2000, 2001, 2002, 2003, 2004 Macromedia, Inc. All rights reserved.
  var i,j,tmLn,props,keyFrm,sprite,numKeyFr,firstKeyFr,propNum,theObj,firstTime=false;
  if (document.MM_Time == null) MM_initTimelines(); //if *very* 1st time
  tmLn = document.MM_Time[tmLnName];
  if (myID == null) { myID = ++tmLn.ID; firstTime=true;}//if new call, incr ID
  if (myID == tmLn.ID) { //if Im newest
    setTimeout('MM_timelinePlay("'+tmLnName+'",'+myID+')',tmLn.delay);
    fNew = ++tmLn.curFrame;
    for (i=0; i<tmLn.length; i++) {
      sprite = tmLn[i];
      if (sprite.charAt(0) == 's') {
        if (sprite.obj) {
          numKeyFr = sprite.keyFrames.length; firstKeyFr = sprite.keyFrames[0];
          if (fNew >= firstKeyFr && fNew <= sprite.keyFrames[numKeyFr-1]) {//in range
            keyFrm=1;
            for (j=0; j<sprite.values.length; j++) {
              props = sprite.values[j]; 
              if (numKeyFr != props.length) {
                if (props.prop2 == null) sprite.obj[props.prop] = props[fNew-firstKeyFr];
                else        sprite.obj[props.prop2][props.prop] = props[fNew-firstKeyFr];
              } else {
                while (keyFrm<numKeyFr && fNew>=sprite.keyFrames[keyFrm]) keyFrm++;
                if (firstTime || fNew==sprite.keyFrames[keyFrm-1]) {
                  if (props.prop2 == null) sprite.obj[props.prop] = props[keyFrm-1];
                  else        sprite.obj[props.prop2][props.prop] = props[keyFrm-1];
        } } } } }
      } else if (sprite.charAt(0)=='b' && fNew == sprite.frame) eval(sprite.value);
      if (fNew > tmLn.lastFrame) tmLn.ID = 0;
  } }
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
  return "MM_timelinePlay";
}



//Returns fn call to insert in HTML tag <TAG... onEvent='thisFn(arg)'>
//Returns one arg: the selected timeline name.

function applyBehavior() {
  menuIndex = document.theForm.menu.selectedIndex;  //get menu selection index
  timelineName = document.theForm.menu.options[menuIndex].text; //gets selected string
  return "MM_timelinePlay('"+timelineName+"')";
}



//Passed the function call above, extracts the args and reloads the UI.
//With arg timelineName, scans the menu for a matching item, and selects it.
//If the name is not found, it gives an error msg.

function inspectBehavior(upStr){
  var timelineName,menuLength,i;
  var argArray = new Array;
  var found = false;

  argArray = extractArgs(upStr); //get args
  if (argArray.length == 2) {  //should be exactly 2 arg (first arg is fn name)
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
}
