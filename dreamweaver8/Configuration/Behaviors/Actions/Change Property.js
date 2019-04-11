// Copyright 1998, 1999, 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

//*************** GLOBAL VARS  *****************
var DEBUG_FILE = dw.getConfigurationPath() + '/CHANGEPROP_DEBUG.txt';

var LIST_OBJTYPE;
var LIST_BROWSERS;
var LIST_PROPS;
var LIST_OBJS;

var TAGTYPES;
var PROP;
var USENSREFS;

var helpDoc = MM.HELP_behChangeProperty;

function initGlobals() {
  var x,y;

  TAGTYPES = new Array("LAYER","DIV","SPAN","IMG","FORM","INPUT/CHECKBOX","INPUT/RADIO",
                         "INPUT/TEXT","TEXTAREA","INPUT/PASSWORD","SELECT");
  PROP = new Array();
  //Create array for each tagname, which we can access with PROP[browser][tag]
  for (x=0; x<BROWSERS.length; x++) {
    PROP[x] = new Array();
    for (y=0; y<TAGNAMES.length; y++) PROP[x][y] = new Array();
  }

  //This table provides a dynamic way add properties to the picklist. There are are 4
  //groups, one for each browser/version (see BROWSERS array above).
  //You can add writeable properties, comma-separated, between the first pair of quotes.
  //To add another tag, extend the TAGNAMES and TAGTYPES arrays above, then add another
  //array element to each group below.

  //Netscape 3 Writable Properties
  PROP[0][ 0] = "".split(",");//layer
  PROP[0][ 1] = "".split(",");//div
  PROP[0][ 2] = "".split(",");//span
  PROP[0][ 3] = "src".split(",");//image
  PROP[0][ 4] = "action".split(",");//form
  PROP[0][ 5] = "checked".split(",");//checkbox
  PROP[0][ 6] = "checked".split(",");//radio
  PROP[0][ 7] = "value".split(",");//text
  PROP[0][ 8] = "value".split(",");//textarea
  PROP[0][ 9] = "value".split(",");//password
  PROP[0][10] = "selectedIndex".split(",");//select

  //IE 3 Writable Properties
  PROP[1][ 0] = "".split(",");//layer
  PROP[1][ 1] = "".split(",");//div
  PROP[1][ 2] = "".split(",");//span
  PROP[1][ 3] = "".split(",");//image
  PROP[1][ 4] = "action".split(",");//form
  PROP[1][ 5] = "checked".split(",");//checkbox
  PROP[1][ 6] = "checked".split(",");//radio
  PROP[1][ 7] = "value".split(",");//text
  PROP[1][ 8] = "value".split(",");//textarea
  PROP[1][ 9] = "value".split(",");//password
  PROP[1][10] = "selectedIndex".split(",");//select

  //Netscape 4 Writable Properties
  PROP[2][ 0] = "top,left,zIndex,clip,visibility,document.bgColor,document.background".split(",");//layer
  PROP[2][ 1] = "".split(",");//div
  PROP[2][ 2] = "".split(",");//span
  PROP[2][ 3] = "src".split(",");//image
  PROP[2][ 4] = "action".split(",");//form
  PROP[2][ 5] = "checked".split(",");//checkbox
  PROP[2][ 6] = "checked".split(",");//radio
  PROP[2][ 7] = "value".split(",");//text
  PROP[2][ 8] = "value".split(",");//textarea
  PROP[2][ 9] = "value".split(",");//password
  PROP[2][10] = "selectedIndex".split(",");//select

  //IE 4 Writable Properties
  PROP[3][ 0] = ("style.top,style.left,style.width,style.height,style.zIndex,style.clip,style.visibility,"+
                 "style.backgroundColor,style.backgroundImage,style.filter").split(",");//layer
  PROP[3][ 1] = ("style.fontFamily,style.fontStyle,style.fontWeight,style.fontSize,style.color,"+
                "style.borderStyle,style.borderWidth,style.borderColor,style.backgroundColor,"+
                "style.backgroundImage,style.filter,innerHTML,innerText").split(",");//div
  PROP[3][ 2] = ("style.fontFamily,style.fontStyle,style.fontWeight,style.fontSize,style.color,"+
                "style.borderStyle,style.borderWidth,style.borderColor,style.backgroundColor,"+
                "style.backgroundImage,style.filter,innerHTML,innerText").split(",");//span
  PROP[3][ 3] = "src".split(",");//image
  PROP[3][ 4] = "action".split(",");//form
  PROP[3][ 5] = "checked".split(",");//checkbox
  PROP[3][ 6] = "checked".split(",");//radio
  PROP[3][ 7] = "value".split(",");//text
  PROP[3][ 8] = "value".split(",");//textarea
  PROP[3][ 9] = "value".split(",");//password
  PROP[3][10] = "selectedIndex".split(",");//select
}



//******************* BEHAVIOR FUNCTION **********************

//Sets a property of an object to a new value.
//Accepts the following arguments:
//  objName  - simple obj name or Javascript object ref for Netscape (ex: document.layers['foo'].document.myImage)
//  x        - ignored (for backward compatibility)
//  theProp  - the property to change (ex: value, style.fontFace)
//  theValue - the new value (ex: sans-serif)

function MM_changeProp(objName,x,theProp,theValue) { //v6.0
  var obj = MM_findObj(objName);
  if (obj && (theProp.indexOf("style.")==-1 || obj.style)){
    if (theValue == true || theValue == false)
      eval("obj."+theProp+"="+theValue);
    else eval("obj."+theProp+"='"+theValue+"'");
  }
}

MM.VERSION_MM_changeProp = 6.0; //define latest version number for behavior inspector

//******************* API **********************


//Can be used with any tag and any event

function canAcceptBehavior(){
  return true;
}



//Returns a Javascript function to be inserted in HTML head with script tags.

function behaviorFunction(){
  return "MM_findObj,MM_changeProp";
}



//Returns fn call to insert in HTML tag <TAG... onEvent='thisFn(arg)'>
//Gets values from the UI and adds them as params to the function call.

function applyBehavior() {
  var theObjNS;
  var theProp="";

  //read all values from UI
  var menuIndex = LIST_OBJS.getIndex(); //get index selected
  if (LIST_OBJS.getValue().indexOf("*") == -1) {
    if (USENSREFS){
      theObjNS   = escQuotes(document.MM_NS_REFS[menuIndex]);
    }else{
      theObjNS   = escQuotes(document.MM_IE_REFS[menuIndex]);
    }
    var theValue = escQuotes(TEXT_VALUE.value);
    var theTag   = LIST_OBJTYPE.getValue();

    if (document.theForm.theRadio[0].checked) { //get property from menu
      theProp = LIST_PROPS.getValue();
    } else { //get from textfield
      theProp  = TEXT_PROP.value;
    }

    if (theObjNS.indexOf(REF_UNNAMED) == 0)  //if unnamed reference
      return MSG_UnnamedObj;
    else {
      theObjNS = getNameFromRef(theObjNS);
  } }

  if (!theProp) {
    return MSG_NoSelection;
  } else {
    updateBehaviorFns("MM_findObj","MM_changeProp");
    if (theValue == 'true' || theValue == 'false'){
      return "MM_changeProp('"+theObjNS+"','','"+theProp+"',"+theValue+",'"+theTag+"')"; //fn call w/args
    }else{  
      return "MM_changeProp('"+theObjNS+"','','"+theProp+"','"+theValue+"','"+theTag+"')"; //fn call w/args
    }
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
//  other...: argument is ignored (I add a descriptive word for future generations)
//  objName : simple name used by MM_findObj, such as "image1"

function identifyBehaviorArguments(fnCallStr) {
  var argArray, retVal = "";
  argArray = extractArgs(fnCallStr);
  if (argArray.length == 6)
    retVal = (argArray[1].indexOf(".")==-1)? "objName,other,other,other,other" : "NS4.0ref,IE4.0ref,other,other,other";
  return retVal;
}



//Given the original function call, this parses out the args and updates
//the UI.

function inspectBehavior(fnCallStr){
  var numObjs = new Array();
  var found = false;
  var theObjNS, theProp, theValue, theTag;

  //get previous args
  var argArray = extractArgs(fnCallStr);
  if (argArray.length > 5) {
    theObjNS = unescQuotes(argArray[1]);
    theProp = argArray[3];
    theValue = unescQuotes(argArray[4]);
    theTag = argArray[5];

    //select tag in tag list
    found = LIST_OBJTYPE.pickValue(theTag);
    if (!found) alert(errMsg(MSG_TagNotFound,theTag));
    else {
      loadAllMenus();  //simulate tag being selected

      //select obj in menu
      found = false;
      numObjs = document.MM_NS_REFS.length;
      for (i=0; i<numObjs; i++) { //check if theObjNS is in menu
        if (theObjNS == document.MM_NS_REFS[i] || theObjNS == getNameFromRef(document.MM_NS_REFS[i])) { //if found
          LIST_OBJS.setIndex(i);
          found = true;
          break;
        }else if (theObjNS == document.MM_IE_REFS[i] || theObjNS == getNameFromRef(document.MM_IE_REFS[i])) {
          LIST_OBJS.setIndex(i);
          found = true;
          break;
        }          
      }
      if (!found) alert(errMsg(MSG_ObjNotFound,theObjNS));
      else {
        var propIndex = -1;
        var tagIndex = dwscripts.findInArray(TAGTYPES,theTag);
        for (var p=BROWSERS.length-1; p >= 0; p--){
          if ((propIndex = dwscripts.findInArray(PROP[p][tagIndex],theProp)) > -1){
            LIST_BROWSERS.setIndex(p);
            LIST_PROPS.setIndex(propIndex);
            break;
          }
        }
        if (propIndex == -1){
          TEXT_PROP.value = theProp;
          selectRadio(1);
        }
        TEXT_VALUE.value = theValue;
      }
    }

  }
}



//***************** LOCAL FUNCTIONS  ******************


//Load the typeOfObj menu with tag names, the browser menu,
//and initialize the object menu.

function initializeUI(){
  initGlobals();
  
  LIST_OBJTYPE = new ListControl("typeOfObj");
  LIST_BROWSERS = new ListControl("browserMenu");
  LIST_PROPS = new ListControl("propMenu");
  LIST_OBJS = new ListControl("namedObjs");
  TEXT_PROP = document.theForm.theProp;
  TEXT_VALUE = document.theForm.theValue;
  //load TAGS picklist
  LIST_OBJTYPE.setAll(TAGTYPES,TAGTYPES);

  //load browser picklist
  LIST_BROWSERS.setAll(BROWSERS,BROWSERS);
  LIST_BROWSERS.setIndex(DEFAULT_BROWSER);

  LIST_OBJS.add("*** "+MENUITEM_NoTypeSelected+" **","************");
  LIST_OBJS.setIndex(0);
  
  document.theForm.typeOfObj.focus(); //set focus on type of object for accessibility
}



//Loads the new objects, and a list of useful properties.

function loadAllMenus() {
  loadObjectMenu();
  loadPropMenu();
}



//Loads a list of useful properties from the data array PROP.

function loadPropMenu() {
  //get browser selection
  var brIndex = LIST_BROWSERS.getIndex();

  //get tag selection
  var tagIndex = LIST_OBJTYPE.getIndex();

  if (brIndex > -1 && tagIndex > -1) {
    LIST_PROPS.setAll(PROP[brIndex][tagIndex],PROP[brIndex][tagIndex]);
    LIST_PROPS.setIndex(0);
  }
}



//Load the select menu with object references.

function loadObjectMenu() {
  var nameArray = new Array();

/*
  //put up a temporary msg while user is waiting  (not currently seen)
  document.theForm.namedObjs.options[0]=new Option("*** "+MENUITEM_Searching+" ***"); //temporary msg
  document.theForm.namedObjs.selectedIndex = 0; //reselect the menu item
*/

  //get list of objects
  var tagIndex = LIST_OBJTYPE.getIndex();
  var tagStr = LIST_OBJTYPE.getValue();
  document.MM_NS_REFS = getAllObjectRefs("NS 4.0",tagStr); //store parallel NS refs
  document.MM_IE_REFS = getAllObjectRefs("IE 4.0",tagStr); //store parallel IE refs
  var niceNameSrcArray = document.MM_NS_REFS;
  USENSREFS = true;

  //Search for unreferenceable objects. <DIV id="foo"> is IE only, <LAYER> is NS only.
  //if REF_CANNOT found, return empty string, and use IE refs for nice namelist.
  for (i=0; i<document.MM_NS_REFS.length; i++) {
    if (document.MM_IE_REFS[i].indexOf(REF_CANNOT) == 0) {
      document.MM_IE_REFS[i] = ""; //blank it out
    }
    if (document.MM_NS_REFS[i].indexOf(REF_CANNOT) == 0) {
      document.MM_NS_REFS[i] = ""; //blank it out
      niceNameSrcArray = document.MM_IE_REFS; //use the IE list
	  USENSREFS = false;
    }
  }
  nameArray = niceNames(niceNameSrcArray,TAGNAMES[tagIndex]);

  //load menu with object names
  if (nameArray.length == 0) {  //if nothing to display...
    LIST_OBJS.add("*** "+errMsg(MENUITEM_ItemsNotFnd,tagStr)+" ***","************"); //clear menu
  } else { //something there, load the menu
    LIST_OBJS.setAll(nameArray,nameArray);
  }
  
//  LIST_OBJTYPE.setIndex(tagIndex); //reselect the menu item
}



//Passed a number, selects that radio.

function selectRadio(num) {
  document.theForm.theRadio[0].checked = (num==0)?true:false;
  document.theForm.theRadio[1].checked = (num==1)?true:false;
}
