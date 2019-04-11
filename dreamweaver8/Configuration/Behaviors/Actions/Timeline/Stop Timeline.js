//*************** GLOBALS VARS *****************

var helpDoc = MM.HELP_behStopTimeline;

//******************* BEHAVIOR FUNCTION **********************

//Stops one or all timelines if they are currently playing.
//Accepts the following arguments:
//  tmLnName - (optional) the name of the timeline to stop (ex: Timeline1)
//             if no timeline name is passed, stops all timelines
//
//Designed to work in conjunction with Dreamweaver's Timeline Inspector.
//The Timeline Inspector creates a JS function called MM_initTimelines(),
//which puts all the timeline settings in a multidimensional array, saved
//into a document property called document.MM_Time.
//
//My function stops one or all by setting their IDs to null. Play Timeline
//always checks ID after each iteration, so any outstanding timers will
//stop with the next function call.

function MM_timelineStop(tmLnName) { //v1.2
  //Copyright 1998, 1999, 2000, 2001, 2002, 2003, 2004 Macromedia, Inc. All rights reserved.
  if (document.MM_Time == null) MM_initTimelines(); //if *very* 1st time
  if (tmLnName == null)  //stop all
    for (var i=0; i<document.MM_Time.length; i++) document.MM_Time[i].ID = null;
  else document.MM_Time[tmLnName].ID = null; //stop one
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
  return "MM_timelineStop";
}



//Returns fn call to insert in HTML tag <TAG... onEvent='thisFn(arg)'>
//Returns one arg: the selected timeline name. If ** ALL TIMELINES **
//was selected, returns no arguments.

function applyBehavior() {
  menuIndex = document.theForm.menu.selectedIndex;  //get menu selection index
  if (menuIndex == 0) { //stop ALL timelines, return no arg
    return "MM_timelineStop()";
  } else {
    timelineName = document.theForm.menu.options[menuIndex].text; //gets selection
    return "MM_timelineStop('"+timelineName+"')";
  }
}



//Passed the function call above, extracts the args and reloads the UI.
//With arg timelineName, scans the menu for a matching item, and selects it.
//If the name is not found, it gives an error msg.

function inspectBehavior(upStr){
  var timelineName,menuLength,i;
  var argArray = new Array;
  var found = false;

  argArray = extractArgs(upStr); //get args
  if (argArray.length == 2) {  //should be exactly 2 args
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
  var i,j,startPos,endPos,theScript;
  var theName="";
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
          if (theName=="") //first one, insert ALL option
            document.theForm.menu.options[menuIndex++] = new Option("** "+MENUITEM_AllTimelines+" **");
          theName = theScript.substring(startPos,endPos);
          document.theForm.menu.options[menuIndex++] = new Option(theName);
        }
        j = theScript.indexOf('].MM_Name',j+1);
      }
    }
  }
}
