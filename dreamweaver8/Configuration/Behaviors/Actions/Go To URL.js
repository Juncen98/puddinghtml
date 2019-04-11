
// Copyright 1998, 1999, 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.
//*************** GLOBAL VARS  *****************

var helpDoc = MM.HELP_behGoToURL;

//******************* BEHAVIOR FUNCTION **********************

//Causes the browser to go to a new URL, or can send multiple
//frames to new URLs.
//The function accepts a variable number of args, in pairs as follows:
//  objStr  - window or frame object reference (ex: window, parent.myFrame)
//  theURL  - URL, often a filename, URL encoded. (ex: file.htm, http://www.x.com/y.htm)
//
//With each pair of args, sets objStr.location = theURL. Normally, you would
//use a link, but this function can be used to send multiple frames to new locations.
//Returns "false" to prevent a link's HREF from overriding the change.

function MM_goToURL() { //v3.0
  var i, args=MM_goToURL.arguments; document.MM_returnValue = false;
  for (i=0; i<(args.length-1); i+=2) eval(args[i]+".location='"+args[i+1]+"'");
}

MM.VERSION_MM_goToURL = 3.0; //define latest version number for behavior inspector

//******************* API **********************


//Can be used with any tag and any event

function canAcceptBehavior(){
  return true;
}



//Returns a Javascript function to be inserted in HTML head with script tags.

function behaviorFunction(){
  return "MM_goToURL";
}



//Returns fn call to insert in HTML tag <TAG... onEvent='thisFn(arg)'>
//Gets list of URLs from doc property. With each URL, it gets the parallel
//frame name from select 'menu'. Each theURL & frameName are embedded as args,
//and the URLs are encoded w/ dw.doURLEncoding().

function applyBehavior() {
  var argList,numItems,i,theURL,frameName,bMain,bFrames;

  bMain = false; bFrames=false;
  argList = "";
  numItems = document.MM_myURLs.length;
  for (i=0; i<numItems; i++) {    //with each URL
    theURL = document.MM_myURLs[i];
    if (theURL) {      //if not empty
      frameName = document.MM_NS_REFS[i]; //get frame name from parallel prop

      if (frameName.indexOf(REF_UNNAMED) == 0)  //if unnamed reference
        return MSG_FrameUnnamed;

      if (i==0) {
        frameName = "parent"; //set first item correctly
        bMain = true;  //there's a Main URL
      } else bFrames = true;  //there's a frame URL
      if (argList) argList += ",";  //if stuff already in list, add comma
      argList += "'"+escQuotes(frameName)+"','"+dw.doURLEncoding(theURL)+"'";
    }
  }
  if (argList) {
    if (bMain && bFrames) //if user added URLs for MainWindow *and* frames (illegal)
         return MSG_FrameMixConflict;
    else {
      updateBehaviorFns("MM_goToURL");
      return "MM_goToURL("+argList+")";  //return fn call with args
    }
  } else return MSG_MissingURL;
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
  var argList, argArray, numArgGroups, i;

  argList = "";
  argArray = extractArgs(fnCallStr);
  numArgGroups = (argArray.length - 1) / 2; //args come in pairs
  for (i=0; i<numArgGroups; i++) {          //with each frame,URL pair
    argList += ((argList)?",":"")+"other,NAV";
  }
  return argList;
}



//Given the original function call, this parses out the args and updates
//the UI. First it calls initializeUI(). Then it gets new frame,URL pairs.
//If frame already present in menu, stuff URL name in URLarray. If frame
//doesn't exist, add to menu, and extend URLarray.

function inspectBehavior(upStr){
  var i, j, argArray, URLarray, found, numFrames, theFrame, theURL;

  URLarray = document.MM_myURLs; //get the prior list of URLs
  argArray = extractArgs(upStr); //get new list of frame,URL pairs
  numFrames = document.MM_NS_REFS.length;
  for (i=1; i<argArray.length; i+=2){ //with each frame,URL pair
    theFrame=argArray[i];
    if (theFrame.toUpperCase() == "PARENT") theFrame = MM.TYPE_MainWindow;
    theURL=unescape(argArray[i+1]);
    found = false;
    for (j=0; j<numFrames; j++){  //check if frame is in menu
      if (document.MM_NS_REFS[j] == theFrame) { //if frame there
        URLarray[j] = theURL;               //store URL at that pos
        if (theURL) addStarToMenuItem(document.theForm.menu,j); //mark with  *
        found = true;
        break;
      }
    }
    if (!found) alert(errMsg(MSG_FrameNotFound,theFrame,theURL)); //if frame name not found
  }
  document.MM_myURLs = URLarray; //save updated URL list
  displayURL();         //load the URL for selected frame
}



//***************** LOCAL FUNCTIONS  ******************


//Load the select menu with frame names.
//Also sets the global property MM_myURLs to the right num of items.

function initializeUI(){
  var i,frameArray;
  var URLarray = new Array;
  var nameArray = new Array;

  frameArray = getObjectRefs("NS 4.0","parent","FRAME"); //get NS frame refs (IE is same)
  nameArray[0] = MM.TYPE_MainWindow;
  for (i=0; i<frameArray.length; i++)   //copy array to append to MainWindow
    nameArray[i+1] = frameArray[i]; //add the frame names to the list
  document.MM_NS_REFS = nameArray; //store NS frame refs for later
  nameArray = niceNames(nameArray,MM.TYPE_Frame);  //convert to nice
  for (i=0; i<nameArray.length; i++){
    document.theForm.menu.options[i]=new Option(nameArray[i]); //add frames to menu
    URLarray[i] = "";  //create blank parallel array to store URLs
  }
  document.MM_myURLs = URLarray; //set global

  document.theForm.theURL.focus(); //set focus on textbox
  document.theForm.theURL.select(); //set insertion point into textbox
}



//Given URL in form, looks up the menu's selection number, and stores the
//new URL at that position in the global document property "MM_myURLs".

function storeURL(){
  var newURL, URLarray, menuIndex, newMenuText;

  newURL = document.theForm.theURL.value;
  URLarray = document.MM_myURLs; //get the prior list of URLs
  menuIndex = document.theForm.menu.selectedIndex; //get index to swap
  URLarray[menuIndex] = newURL;   //swap
  document.MM_myURLs = URLarray;   //rewrite list
  if (newURL.length > 0) {  //if non-empty, mark with  *
    addStarToMenuItem(document.theForm.menu, menuIndex);
  } else { //nothing to store, strip off any previous star
    newMenuText = stripStar(document.theForm.menu.options[menuIndex].text); //remove if old star
    document.theForm.menu.options[menuIndex]=new Option(newMenuText); //add new line to menu
  }
  document.theForm.menu.selectedIndex = menuIndex; //reset selection index BUG!: CAUSES BOMB!
}



//Looks at the menu of names, and returns the URL associated with the
//selected item. Example: if the 2nd menu item's selected, returns 2nd item
//stored in property "MM_myURLs".

function displayURL(){
  var URLarray = document.MM_myURLs; //get the list of URLs
  curFrameNum = document.theForm.menu.selectedIndex; //get index selected
  theURL = URLarray[curFrameNum];   //lookup URL
  document.theForm.theURL.value= theURL;    //write into text field
  document.theForm.menu.selectedIndex = curFrameNum; //WORKAROUND! resets the menu selection
}



//Invokes dialog to allow user to select filename. Puts value in text input.

function browseFileAndStore(){
  var fileName = "";
  fileName = browseForFileURL();  //returns a local filename
  if (fileName) {
    document.theForm.theURL.value = fileName;
    storeURL();
  }
}
