// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

//****************** GLOBAL VARS ***************

var helpDoc = MM.HELP_behControlShockwave;

function initGlobals() {
  FLASHSTOP = "StopPlay";
  DIRSTOP   = "Stop";  //default
  CMDARRAY  = new Array("Play",DIRSTOP,"Rewind","GotoFrame");

  //use to check EMBEDs for Shockwave
  FLASH_EXTNS  = new Array(".swf",".spl");
  DIR_EXTNS    = new Array(".dir",".dcr");

  //use to check OBJECTs for Shockwave
  FLASHCLASSID = "CLSID:D27CDB6E-AE6D-11CF-96B8-444553540000"; //must be all caps
  DIRCLASSID   = "CLSID:166B1BCA-3F9C-11CF-8075-444553540000"; //must be all caps
}

var FLASHSTOP;
var DIRSTOP;
var CMDARRAY;
var FLASH_EXTNS;
var DIR_EXTNS;
var FLASHCLASSID;
var DIRCLASSID;

//******************* BEHAVIOR FUNCTION **********************

//Causes a Shockwave object to play, stop, rewind, or go to a frame.
//Accepts the following arguments:
//  objStr   - name of shockwave object (full objRefs ok too)
//  x        - not used (here for backward compatibility)
//  cmdName  - method to invoke: Play(), Rewind(), GotoFrame(frameNum),
//             StopPlay() for a Flash Movie, Stop() for Director
//  frameNum - (optional) frame number, only used with GotoFrame method
//
//Tries to find the object, which only succeeds if the plugin is there.
//Evals the concatenated pieces to call the method, for ex: document.myShock.Play()

function MM_controlShockwave(objStr,x,cmdName,frameNum) { //v3.0
  var obj=MM_findObj(objStr);
  if (obj) eval('obj.'+cmdName+'('+((cmdName=='GotoFrame')?frameNum:'')+')');
}

MM.VERSION_MM_controlShockwave = 3.0; //define latest version number for behavior inspector

//******************* API **********************


//Checks for the existence of Shockwave movie.
//If none exist, returns false so this Action is grayed out.

function canAcceptBehavior(){
  if (!FLASH_EXTNS) initGlobals();
  var i,j,theTag,swSrc,classId;
  var tagArray = new Array;
  var refArray = new Array;

  //Find all EMBED calls that contain Shockwave objects in SRC
  tagArray = getAllObjectTags("embed");
  refArray = getAllObjectRefs("NS 4.0","embed");
  for (i in tagArray) {  //with each EMBED tag
    theTag = tagArray[i];
    swSrc = unescQuotes(getParam(theTag,"src"));  //get the SRC value
    for (j=0; j<FLASH_EXTNS.length; j++) if (swSrc.toLowerCase().indexOf(FLASH_EXTNS[j])>0) return true;
    for (j=0; j<DIR_EXTNS.length;   j++) if (swSrc.toLowerCase().indexOf(DIR_EXTNS[j])>0) return true;
  }

  //Find all OBJECT calls that contain Shockwave objects in ClassID
  //Add each unique name to the menu
  tagArray = getAllObjectTags("object");
  refArray = getAllObjectRefs("NS 4.0","object");
  for (i in tagArray) {
    theTag = tagArray[i];
    classId = unescQuotes(getParam(theTag,"classid"));
    if (classId) {
      if (classId.toUpperCase().indexOf(FLASHCLASSID) == 0) return true;
      if (classId.toUpperCase().indexOf(DIRCLASSID)   == 0) return true;
    }
  }
  return false;  //if none of the tests above returned "true"
}



//Returns a Javascript function to be inserted in HTML head with script tags.

function behaviorFunction() {
  return "MM_findObj,MM_controlShockwave";
}



//Returns fn call to insert in HTML tag <TAG... onEvent='thisFn(arg)'>
//Calls escQuotes to find embedded quotes and precede them with \

function applyBehavior(uniqueName) {
  var menuIndex,swObjNS,swObjIE,theRadio,i;
  var cmdName="";
  var theFrame="";

  //get shockwaveObject ID
  menuIndex = document.theForm.menu.selectedIndex;
  swObjNS = document.MM_NS_REFS[menuIndex];
  swObjIE = document.MM_IE_REFS[menuIndex];
  if (swObjNS.indexOf(REF_CANNOT)==0) {
    swObjNS = "";
    alert(MSG_NoNSRef)
  }
  if (swObjIE.indexOf(REF_CANNOT)==0) {
    swObjIE = "";
    alert(MSG_NoIERef);
  }

  //get selected command from radio buttons
  for (i=0; i<document.theForm.theCmd.length; i++) {
    theRadio = document.theForm.theCmd[i];
    if (theRadio.checked) {
      cmdName = CMDARRAY[i];
      if (cmdName == "GotoFrame") {  //get frame if GotoFrame
        theFrame = document.theForm.frameNum.value;
        if (theFrame != ''+parseInt(theFrame))
          return MSG_InvalidFrameNum;
        else if (parseInt(theFrame) < 0)
          return MSG_NegFrameNum;
        else if (document.MM_shockwaveTypelist[menuIndex] == "FLASH") {
          (theFrame == '1') ? theFrame = '0' : theFrame--;
        }
      }
      else if (cmdName == DIRSTOP) {  //Ensure it's correct stop cmd for Director/Flash
        cmdName = (document.MM_shockwaveTypelist[menuIndex] == "FLASH")? FLASHSTOP : DIRSTOP;
      }
      break;
    }
  }

  if (swObjNS.indexOf(REF_UNNAMED) == 0)  //if unnamed reference
    return MSG_UnnamedObj;

  if (swObjNS) enableFlashScripting( swObjNS );

  if (swObjNS && cmdName) {
    swObjNS = getNameFromRef(swObjNS);
    updateBehaviorFns("MM_findObj","MM_controlShockwave");
    return "MM_controlShockwave('"+swObjNS+"','','"+cmdName+((theFrame != "")?"','"+theFrame:"")+"')";
  } else {
    return MSG_NoSelection;
  }
}


//Returns a dummy function call to inform Dreamweaver the type of certain behavior
//call arguments. This information is used by DW to fixup behavior args when the
//document is moved or changed.
//
//It is passed an actual function call string generated by applyBehavior(), which
//may have a variable list of arguments, and this should return a matching mask.
//
//The return values are:
//  URL     : argument could be a file path, which DW will update during Save As...
//  NS4.0ref: arg is an object ref that may be changed by Convert Tables to Layers
//  IE4.0ref: arg is an object ref that may be changed by Convert Tables to Layers
//  other...: argument is ignored

function identifyBehaviorArguments(fnCallStr) {
  var argArray, retVal="", fullObjRef;;

  argArray = extractArgs(fnCallStr);
  fullObjRef = (argArray[1].indexOf(".")!=-1);
  if (argArray.length == 4) {
    retVal = (fullObjRef)?"NS4.0ref,IE4.0ref,other" : "objName,other,other";
  } else if (argArray.length == 5) {
    retVal = (fullObjRef)?"NS4.0ref,IE4.0ref,other,other" : "objName,other,other,other";
  }
  return retVal;
}



//Passed the function call above, takes prior arguments and reloads the UI.
//Removes any escape characters "\"

function inspectBehavior(argStr){
  var swName,menuLength,i,theFrame,menuIndex;
  var argArray = new Array;
  var found = false;

  argArray = extractArgs(argStr); //get args
  if (argArray.length > 3) {  //should be 4 or 5 args (0 and 2 ignored)

    //select shockwaveId
    swName = unescQuotes(argArray[1]);
    menuLength = document.MM_NS_REFS.length;
    for (i=0; i<menuLength; i++) { //search menu for matching shockwave name
      if (swName == document.MM_NS_REFS[i] || swName == getNameFromRef(document.MM_NS_REFS[i])) { //if found
        document.theForm.menu.selectedIndex = i;  //make it selected
        found = true;
        break;
      }
    }
    if (!found) alert(errMsg(MSG_ShockwaveNotFound,swName));

    //select appropriate radio button
    cmdName = argArray[3];
    if (cmdName == FLASHSTOP) cmdName = DIRSTOP;
    for (i=0; i<document.theForm.theCmd.length; i++)
      document.theForm.theCmd[i].checked = (cmdName == CMDARRAY[i]);

    //stuff frame num if there
    if (argArray.length > 4) {
      theFrame = argArray[4];
      menuIndex = document.theForm.menu.selectedIndex;
      if (menuIndex >= 0 && document.MM_shockwaveTypelist[menuIndex] == "FLASH") theFrame++;
      document.theForm.frameNum.value = theFrame;
    }
  }
}



//***************** LOCAL FUNCTIONS  ******************


//Searches for all Shockwave EMBEDs and OBJECTs on the page,
//eliminating duplicates, and adding them to the menu.

function initializeUI(){
  initGlobals();
  var i,j,k,theTag,swSrc,swName,classId,notInMenu;
  var tagArray = new Array;
  var NSrefArray = new Array;
  var IErefArray = new Array;
  var paramArray = new Array;
  var mIndex=0;
  var isFlash, isDir;
  var shockwaveTypelist = new Array;
  var IErefs = new Array;
  var NSrefs = new Array;
  var niceNameArray = new Array;

  //Find all EMBED calls that contain ShockWave objects in SRC
  //Add each unique name to the menu list
  tagArray = getAllObjectTags("embed"); //get the tags to search
  NSrefArray = getAllObjectRefs("NS 4.0","embed"); //get parallel EMBED obj refs
  IErefArray = getAllObjectRefs("IE 4.0","embed");
  for (i in tagArray) {  //with each EMBED tag
    theTag = tagArray[i];
    isFlash = false;  isDir = false;  //search for Flash or Director suffixes
    swSrc = unescQuotes(getParam(theTag,"src"));  //get the SRC value
    if (swSrc) {
      for (j=0; j<FLASH_EXTNS.length; j++) if (swSrc.toLowerCase().indexOf(FLASH_EXTNS[j])>-1) isFlash=true;
      for (j=0; j<DIR_EXTNS.length;   j++) if (swSrc.toLowerCase().indexOf(DIR_EXTNS[j])  >-1) isDir  =true;
      if (isFlash || isDir) {  //if found Flash or Director file suffix
        swName = IErefArray[i];
        if (swName.indexOf(REF_CANNOT)==0) swName=NSrefArray[i]; //if invalid IE ref, use NS ref
        if (swName) {
          IErefs[mIndex] = IErefArray[i];   //store IE ref into parallel array
          NSrefs[mIndex] = NSrefArray[i];   //store NS ref into parallel array
          shockwaveTypelist[mIndex] = (isFlash)?"FLASH":"DIR";
          niceNameArray[mIndex++] = swName;
        }
      }
    }
  }

  //Find all OBJECT calls that contain ShockWave classId
  //Add each unique name to the menu
  tagArray = getAllObjectTags("object");
  NSrefArray = getAllObjectRefs("NS 4.0","object");
  IErefArray = getAllObjectRefs("IE 4.0","object");
  for (i in tagArray) {
    theTag = tagArray[i];
    isFlash = false;  isDir = false;  //search for Flash or Director suffixes
    classId = unescQuotes(getParam(theTag,"classid"));
    if (classId) {
      if (classId.toUpperCase().indexOf(FLASHCLASSID) == 0) isFlash = true;
      if (classId.toUpperCase().indexOf(DIRCLASSID)   == 0) isDir   = true;
      if (isFlash || isDir) {
        swName = IErefArray[i];
        if (swName.indexOf(REF_CANNOT)==0) swName=NSrefArray[i]; //if invalid IE ref, use NS ref
        if (swName) {
          notInMenu = true;
          for (k in niceNameArray) { //check if already in menu list
            if (swName == niceNameArray[k]) { //if already in menu list
              notInMenu=false;        //set flag
              break;
            }
          }
          if (notInMenu) {
            IErefs[mIndex] = IErefArray[i];   //store IE ref into parallel array
            NSrefs[mIndex] = NSrefArray[i];   //store NS ref into parallel array
            shockwaveTypelist[mIndex] = (isFlash)?"FLASH":"DIR";
            niceNameArray[mIndex++] = swName;
          }
        }
      }
    }
  }
  niceNameArray = niceNames(niceNameArray,MM.TYPE_Shockwave); //convert list to nice names
  for (i=0; i<niceNameArray.length; i++) { //write to SELECT
    document.theForm.menu.options[i]=new Option(niceNameArray[i]); //load menu
  }

  document.MM_IE_REFS = IErefs; //store parallel IE refs
  document.MM_NS_REFS = NSrefs; //store parallel NS refs
  document.MM_shockwaveTypelist = shockwaveTypelist;  //store types of each flash item
  document.theForm.menu.selectedIndex = 0;
}

// enableFlashScripting()
//
// As of Flash 3, the swliveconnect attribute must be enabled
// on the Flash object in order to use it's scripting interface
// in Netscape.  The option tells Netscape to preload Live
// Connect and the appropriate underlying Java classes.
//
function enableFlashScripting( nsObjRef )
{
   var userDoc = dreamweaver.getDocumentDOM( "document" );
   var tagArr  = userDoc.getElementsByTagName( "embed" );

   tagArr = tagArr.concat( userDoc.getElementsByTagName( "object" ) );
   for( var i = 0; i < tagArr.length; i++ ) {
      if ( nsObjRef == dreamweaver.getElementRef( "NS 4.0", tagArr[i] ) ) {
         tagArr[i].setAttribute( "swliveconnect", true );
         return;
   } }
}
