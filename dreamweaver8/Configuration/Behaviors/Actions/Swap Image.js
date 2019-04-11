// Copyright 2000, 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.
//*************** GLOBALS VARS *****************

var helpDoc = MM.HELP_behSwapImage;

var OLD_PRELOAD_ID;
var OLD_PRELOAD_ARRAY;

var DEBUG_FILE = dw.getConfigurationPath() + "/SWAPIMG_DEBUG.txt";

//******************* BEHAVIOR FUNCTIONS **********************

//Changes multiple images at once. Accepts a variable number of args in triplets as follows:
//  objStrNS - simple object name ('image1'), or object ref for Netscape (ex: document.layers['foo'].document.myImage)
//  x        - ignored (there for backward compatibility)
//  imgURL   - an image filename, URL encoded. (ex: file.gif, http://www.x.com/y.gif)
//
//Uses MM_findObj() to resolve object references for the two browsers.
//Sets the image src property to the new filename: document.myImage.src = file.gif.
//Fails gracefully on older browsers by ensuring the the object exists.
//If the image is in a layer, fixes the reference so it works. It doesn't hurt
//to set image.src in a browser (IE3) even if nothing changes.
//The rest of the code is to support another Action, Swap Image Restore.
//Builds an array of the original src values and saves it to a global property,
//in the form of theObj,theObj.src,.... Prevents overwriting these values if called
//repeatedly, to ensure we use the original src file set in the HTML.

function MM_swapImage() { //v3.0
  var i,j=0,x,a=MM_swapImage.arguments; document.MM_sr=new Array; for(i=0;i<(a.length-2);i+=3)
   if ((x=MM_findObj(a[i]))!=null){document.MM_sr[j++]=x; if(!x.oSrc) x.oSrc=x.src; x.src=a[i+2];}
}

MM.VERSION_MM_swapImage = 3.0; //define latest version number for behavior inspector

//******************* API **********************


//Checks for the existence of images.
//If none exist, returns false so this Action is grayed out.

function canAcceptBehavior(){
  var retVal = false;
  var domRefStyle = "NS 4.0";
  if( dw.getDocumentDOM() && dw.getDocumentDOM().getIsXHTMLStrictDocument() )
    domRefStyle = "W3C DOM Level 1";
  if (getAllObjectRefs(domRefStyle,"IMG").length)
    retVal = "onMouseOver,(onMouseOver),onClick,(onClick)";
  return retVal;
}



//Returns Javascript functions to be inserted in HTML head with script tags.

function behaviorFunction(){
  return "MM_preloadImages,MM_swapImgRestore,MM_findObj,MM_swapImage"
}



//Returns fn call to insert in HTML tag <TAG... onEvent='thisFn(arg)'>
//Gets list of imgSrcs from doc attribute. With each imgSrc, it gets the parallel
//img name from select 'menu'. Each imgSrc & imgObj are embedded as args.

function applyBehavior() {
  var retVal="",i,j,argList="",imgList="",fnArray,imgSrcArray,imgSrc,imgObj,newName;
  var preloadArray = new Array(),imgObjsArray=document.MM_imgObjsArray;
  var preload = document.theForm.preload.checked;
  var endsWithAnyNum  = /\[\d+\]$/; //ref ends with num: [1], [2] etc.
  var proceed = null;

  if (dw.isReapplyingBehaviors()) document.SILENT_MODE = true;

  imgSrcArray = document.MM_myImgSrcs;      //get global list of imgSrcs
  for (i=0; i<imgSrcArray.length; i++) {    //with each imgSrc
    imgSrc = imgSrcArray[i];
    if (imgSrc) {      //if not empty
      if (argList) argList += ",";    //if stuff already in list, add comma

      imgObjNS = document.MM_NS_REFS[i]; //get NS ref

      if (imgObjNS.indexOf(".")==-1 || endsWithAnyNum.test(imgObjNS)) { //found rename item, prompt user & fixup
        newName = "";  //may need a new or unique name
        if (imgObjNS.indexOf(REF_UNNAMED)==0) {                 //if the image is unnamed
          newName = getUniqueName("IMG","Image",imgObjsArray);    //generate unique name
        } else if (proceed==null) { //if first dupe, prompt user if the want renames
          if (document.SILENT_MODE) proceed = true;
          else {
            proceed = confirm(MSG_ImagesMustBeRenamed); //ask user if they want to proceed
            if (!proceed) return "";  //cancel applyBehavior
        } }
        if (endsWithAnyNum.test(imgObjNS)) {                //if ends with number > 0: foo[1], use name gen new one
          newName = getUniqueName("IMG",imgObjsArray[i].getAttribute("id"),imgObjsArray);
        }
        if (newName) {  //if the image should be renamed
		  //only change the name if there's already a name on the image, we always set the id
		  imgObjsArray[i].setAttribute("id",newName);
          if( imgObjsArray[i].getAttribute("name") )
		  	imgObjsArray[i].setAttribute("name",newName); //rename image in document
          createObjRefs(); //re-create refs based on new image name
          imgObjNS = document.MM_NS_REFS[i]; //get NS ref
        }
      }
      argList += "'"+getNameFromRef(imgObjNS)+"','','"+dw.doURLEncoding(imgSrc)+"'";
      if (preload) preloadArray.push(dw.doURLEncoding(imgSrc)); //add string to list
    }
  }

  if (!argList) retVal = MSG_NoImgsSrc;
  else { //OK

    //Add or remove MM_swapImgRestore() based on checkbox setting
    selObj = dw.getBehaviorElement();
    if (!selObj) selObj = dw.getDocumentDOM().getSelectedNode()
    if (selObj && document.theForm.restore) {
      if (document.theForm.restore.checked) { //add restore to onMouseOut handler
        setHandler(selObj,'onMouseOut','MM_swapImgRestore()');
      } else { //remove it
        delHandler(selObj,'onMouseOut','MM_swapImgRestore');
      }
    }

    //if existing swap function outdated, update them and all calls on page
    updateBehaviorFns("MM_findObj","MM_swapImgRestore","MM_preloadImages","MM_swapImage");

    if (OLD_PRELOAD_ID && OLD_PRELOAD_ARRAY) {            //if previously preloaded, remove DW2 preloads
      if (OLD_PRELOAD_ID.toString().indexOf("#") != -1) { //DW2 preload call, remove it
        delHandler(dw.getDocumentDOM().body,"onLoad","MM_preloadImages",OLD_PRELOAD_ID);
    } }
    argList += ("," + ((preload)?1:0));    //1 means preload, 0 means don't preload
    preloadUpdate(preloadArray,OLD_PRELOAD_ARRAY,1); //add and delete preload calls to onLoad handler

    retVal = "MM_swapImage("+argList+")";  //create correct function call
  }
  return retVal
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
  numArgGroups = Math.floor((argArray.length - 1) / 3); //args come in triplets
  for (i=0; i<numArgGroups; i++) {          //with each NSobj,IEobj,URL triplet
    if (argList) argList += ",";
    //if no dot in the name, return simple name; else, return NS/IE refs
    argList += (argArray[3*i+1].indexOf(".")==-1)? "objName,other,DEP":"NS4.0ref,IE4.0ref,DEP";
  }
  return argList;
}



//Given the original function call, this parses out the args and updates
//the UI. Loops through each imgObj,imgSrc pair.
//If imgObj already present in menu, stuff imgSrc in imgSrcArray. If imgObj
//doesn't exist, add to menu, and extend imgSrcArray.

function inspectBehavior(behFnCallStr){
  var argArray,imgSrcArray,found,numImgs,i,j,k,imgObj,imgSrc,imgObjNum,itemRef,pos;
  var endsWithZero = /\[0\]$/;        //ref ends with [0]

  if (dw.isReapplyingBehaviors()) document.SILENT_MODE = true;

  argArray = extractArgs(behFnCallStr);//get new list of imgObj,imgSrc pairs
  imgSrcArray = document.MM_myImgSrcs; //get the prior list of imgSrcs
  numImgs = document.MM_NS_REFS.length;
  for (i=1; i<(argArray.length-2); i+=3){ //with each imgObj,imgSrc pair
    imgObj=getNameFromRef(unescQuotes(argArray[i]));
    OLD_PRELOAD_ARRAY.push(argArray[i+2]);
    imgSrc=unescape(argArray[i+2]);
    found = false;
    for (j=0; j<numImgs; j++){  //check if imgObj is in ref list (lop off [0] if there)
      itemRef = document.MM_NS_REFS[j];
      if (!document.SILENT_MODE) itemRef = itemRef.replace(endsWithZero,""); //if not silent, select first occurence
      if (imgObj == getNameFromRef(itemRef)) { //if found
        imgSrcArray[j] = imgSrc;              //store imgSrc at that pos
        if (imgSrc) addStarToMenuItem(document.theForm.menu,j);//if non-empty, mark with  *
        found = true; break;
    } }
    if (!found && (pos=imgObj.indexOf("?"))!=-1) { //if didn't find, and includes frame
      imgObj = imgObj.substring(0,pos); //remove framename, look on local page
      for (j=0; j<numImgs; j++){  //check if imgObj is in ref list
        if (imgObj == getNameFromRef(document.MM_NS_REFS[j])) { //if found
          imgSrcArray[j] = imgSrc;              //store imgSrc at that pos
          if (imgSrc) addStarToMenuItem(document.theForm.menu,j);//if non-empty, mark with  *
          found = true; break;
    } } }

    //Special code in case object name appears twice on the page. Only run if silently
    //reapplying (such as a copy/paste).
    //Searches within the behavior selection for an image of the expected name.
    //If found, and others found with same name, converts name to imageName[n],
    //and checks if that version is in our list of images. If so, selects the right one.

    if (!found && dw.isReapplyingBehaviors()) { //if failed because it's a silent copy/paste
      var selNode = dw.getBehaviorElement();
      //if the behavior selection is an image, or contains an image, with the same name
      if (selNode) {
        //search within selection for IMG with that name
        for (k=0; selNode.hasChildNodes() && k<selNode.childNodes.length; k++) with (selNode.childNodes[k]) {
          if (nodeType==Node.ELEMENT_NODE && tagName=="IMG" && (getAttribute("id")==imgObj || getAttribute("NAME")==imgObj))
            { selNode = selNode.childNodes[k]; break; } }
        if (selNode.nodeType==Node.ELEMENT_NODE && selNode.tagName=="IMG" && (selNode.getAttribute("id")==imgObj || selNode.getAttribute("NAME")==imgObj)) {
          var DOM = dw.getDocumentDOM();
          var allImages = DOM.getElementsByTagName("IMG");
          for (k=0; k<allImages.length && allImages[k]!=selNode; k++);  //search for myself in list
          if (allImages[k]==selNode) { //if found my image in list
            j=0;
            for (k--; k>=0; k--) if (allImages[k].getAttribute("id") == imgObj || allImages[k].getAttribute("name") == imgObj) j++; //count all w/ same name
            itemRef = "."+imgObj+"["+j+"]";
            for (j=0; j<numImgs; j++) {  //check if itemRef is in ref list
              if (document.MM_NS_REFS[j].indexOf(itemRef)!=-1) {   //if found
                document.MM_NS_REFS[j] = imgObj+"[999]"; //mark for renaming
                imgSrcArray[j] = imgSrc;              //store imgSrc at that pos
                found = true; break;
    } } } } } }

    if (!found && !document.SILENT_MODE) {
      alert(errMsg(MSG_ImgNotFound,imgObj,imgSrc)); //if image name not found
  } }
  document.MM_myImgSrcs = imgSrcArray; //save updated imageSrc list
  displayImgSrc();         //load the imageSrc for selected image

  //Determine if preloading, get id
  OLD_PRELOAD_ID = (i < argArray.length)? argArray[i] : 0;  //if no former ID, OLD_PRELOAD_ID = 0
  document.theForm.preload.checked = (OLD_PRELOAD_ID != 0); //set preload checkbox
  if (OLD_PRELOAD_ID == 0) OLD_PRELOAD_ARRAY = new Array();      //if flag not set, forget about OLD_PRELOAD_ARRAY

  //If restore checkbox is available, see if MM_swapImgRestore() exists, and check the box
  var theObj = dwscripts.findDOMObject("restoreOption");
  if (theObj) { //restore checkbox is a possibility
    var selObj=dw.getBehaviorElement();
    var checkRestore = getHandler(selObj,'onMouseOut','MM_swapImgRestore');
    // if handler not found on selected object, check surrounding A tag
    // as well.
    if (!checkRestore && selObj.parentNode.tagName == 'A'){
      checkRestore = getHandler(selObj.parentNode,'onMouseOut','MM_swapImgRestore');
    }
    if (document.theForm.restore) {
      document.theForm.restore.checked = checkRestore;
    }
  }
}



//Given the original function call, this parses out the args and updates
//the code. If there's a preload id at the end of the arglist, deletes
//the preload handler. If there's a swap restore call, deletes that.

function deleteBehavior(behFnCallStr){
  var i,argArray,obj,selArr,selObj,preloadImgs = new Array();

  //Maybe remove swap restore handler
  if (!selObj) selObj = dw.getDocumentDOM().getSelectedNode()
  if (selObj && selObj.tagName != "A") selObj = selObj.parentNode; //move out to A tag if needed
  if (selObj && selObj.tagName == "A") if (selObj.outerHTML.indexOf("MM_swapImage(") == -1) {
    delHandler(selObj,'onMouseOut','MM_swapImgRestore');
  }

  //Maybe remove preload handler
  argArray = extractArgs(behFnCallStr);//get new list of imgObj,imgSrc pairs
  for (i=1; i<(argArray.length-2); i+=3){ //with each imgObj,imgSrc pair, build list of img srcs
    imgSrc=unescape(argArray[i+2]);
    if (imgSrc) preloadImgs.push(argArray[i+2]);
  }
  preloadFlag = (i < argArray.length)? argArray[i] : 0;  //if no former ID, preloadFlag = 0
  if (preloadFlag && preloadImgs) {          //if previously preloaded, remove old preloads
    if (preloadFlag.toString().indexOf("#") != -1) { //old preload call, remove it
      delHandler(dw.getDocumentDOM().body,"onLoad","MM_preloadImages",preloadFlag);
    } else { //previously preloaded, remove before adding new calls
      preloadUpdate("",preloadImgs,0); //remove preload iff there are 0 users
  } }
}



//***************** LOCAL FUNCTIONS  ******************

//Load the select menu with image names.
//Also sets the global property MM_myImgSrcs to the right num of items.

function initializeUI(){
  var niceNameSrcArray=new Array(), nameArray, i, selTag="";
  var imgSrcArray = new Array();
  var endsWithZero = /\[0\]$/;        //ref ends with [0]
  //Determine if RESTORE is an option. If not, remove UI for it
  //the dw.getBehaviorTag() check ensures the checkbox
  //is not available if a behavior is attached to a timeline

  var removeCheckbox = false;
  if (!dw.getBehaviorTag() )  //if behavior is in a timeline
    removeCheckbox = true;
  else {
    if (dw.getBehaviorElement()) selTag = dw.getBehaviorElement().tagName;
    if (!selTag) selTag = getSelectionTag();
    if (selTag!="A" && selTag!="IMG" && selTag!="AREA")  //if sel not A or IMG
      removeCheckbox = true;
  }
  if (removeCheckbox){
    var theObj = dwscripts.findDOMObject("restoreOption");
    if (theObj) theObj.outerHTML = ""; //remove restoreOption checkbox
  }

  //Default preload flag is 1 (preload);
  OLD_PRELOAD_ID = 1;
  OLD_PRELOAD_ARRAY = new Array();
  document.theForm.preload.checked = (OLD_PRELOAD_ID != 0);

  createObjRefs();
  //Search for unreferenceable objects. <DIV id="foo"> is IE only, <LAYER> is NS only.
  //if REF_CANNOT found, return empty string, and use IE refs for nice namelist.
  for (i=0; i<document.MM_NS_REFS.length; i++) {
    if (document.MM_NS_REFS[i].indexOf(REF_CANNOT) == 0) document.MM_NS_REFS[i] = ""; //blank it out
    niceNameSrcArray[i] = document.MM_NS_REFS[i].replace(endsWithZero,""); //if foo[0], display as foo
  }
  nameArray = niceNames(niceNameSrcArray,MM.TYPE_Image);
  for (i=0; i<nameArray.length; i++){
    document.theForm.menu.options[i]=new Option(nameArray[i]); //load menu
    imgSrcArray[i] = "";
  }
  pickSelectedImage(); //if an image is selected, selects it in the picklist
  document.MM_myImgSrcs = imgSrcArray; //set global

  document.theForm.imgSrc.focus(); //set focus on textbox
  document.theForm.imgSrc.select(); //set insertion point into textbox
}



//Creates arrays of all images, including those in other frames.
//Ensure that ones with duplicate names (per frame) are followed by an index.
//If none found, returns false.

function createObjRefs(){
  var i,j,lastDot,imageName,myFrame,index,refs;
  var endsWithAnyNum  = /\[\d+\]$/; //ref ends with num: [1], [2] etc.
  var unnamed = /unnamed/;

  var domRefStyle = "NS 4.0";
  if( dw.getDocumentDOM() && dw.getDocumentDOM().getIsXHTMLStrictDocument() )
    domRefStyle = "W3C DOM Level 1";
  refs = getAllObjectRefs(domRefStyle,"IMG");

  for (i=0; i<refs.length; i++) { //strip off all indexing
    refs[i] = refs[i].replace(endsWithAnyNum,""); //remove num
	  refs[i] = refs[i].replace(unnamed,LABEL_Unnamed); // localize the "unnamed" string
  }
  for (i=0; i<refs.length; i++) {
    lastDot = refs[i].lastIndexOf(".");
    if (lastDot != -1) {
      imageName = refs[i].substring(lastDot+1);     //grab image name
      if (refs[i].indexOf("document.")==0) myFrame = "document.";
      else myFrame = refs[i].substring(0,refs[i].indexOf("]")+1);
      index = 0;
      for (j=i+1; j<refs.length; j++) if (refs[j].indexOf(myFrame)==0) { //if same frame, scan forward
        lastDot = refs[j].lastIndexOf(".");
        if (lastDot != -1 && refs[j].substring(lastDot+1)==imageName) { //if same name
          refs[j] += "["+(++index)+"]";             //uniquely number it
      } }
      if (index) refs[i] += "[0]";                  //if anything numbered, number the first one
  } }
  document.MM_NS_REFS = refs;

  return (refs.length >0)
}


 
var gLastIndex = 0;

function setImageSwapSource(){
   if (document.MM_myImgSrcs[gLastIndex])
      addStarToMenuItem(document.theForm.menu,gLastIndex); //if non-empty, mark with  *
   else
      document.theForm.menu.options[gLastIndex].text = stripStar(document.theForm.menu.options[gLastIndex].text);	
}


//Given imageSrc in form, looks up the menu's selection number, and stores the
//new imageSrc at that position in the global document property "MM_myImgSrcs".

function storeImgSrc(){
  var newImgSrc, imgSrcArray, menuIndex, newMenuText;

  newImgSrc = document.theForm.imgSrc.value;
  imgSrcArray = document.MM_myImgSrcs; //get the prior list of imgSrcs
  menuIndex = document.theForm.menu.selectedIndex; //get index to swap

  //if nothing has changed, bail
  if (newImgSrc == imgSrcArray[menuIndex])
    return;

  imgSrcArray[menuIndex] = newImgSrc;   //swap
  document.MM_myImgSrcs = imgSrcArray;   //rewrite list
  
  gLastIndex = menuIndex;
  
  setTimeout('setImageSwapSource()',500);
}



//Looks at the menu of names, and returns the imgSrc associated with the
//selected item. Example: if the 2nd menu item's selected, returns 2nd item
//stored in property "MM_myImgSrcs".

function displayImgSrc(){
  var imgSrcArray, curImageSrcNum, imgSrc;

  imgSrcArray = document.MM_myImgSrcs; //get the list of imgSrcs
  curImageSrcNum = document.theForm.menu.selectedIndex; //get index selected
  imgSrc = imgSrcArray[curImageSrcNum];   //lookup imgSrc
  document.theForm.imgSrc.value= imgSrc;    //write into text field
}



//Invokes dialog to allow user to select filename. Puts value in text input.

function browseFileAndStore(){
  var fileName;
  fileName = browseForFileURL("select", "", true);  //returns a local filename
  if (fileName) {
    document.theForm.imgSrc.value = fileName;
    storeImgSrc();
  }
}


function pickSelectedImage(){
  var dom = dw.getDocumentDOM();
  var imgsArray = document.MM_imgObjsArray = createObjsArray("IMG");
  var arrLen = imgsArray.length;
  var selObj = dom.getSelectedNode();

  for (i=0;i<arrLen;i++){
    if (imgsArray[i]==selObj)
      document.theForm.menu.selectedIndex=i;
  }
}



//Creates a unique name for objs of tagName, using tagString
//for instance: if tagString = Image, returns a name like Image1
function getUniqueName(tagName,tagString,tagNameObjsArray){
  var frameListSize,objName,dupe=true,counter=1;
  var objsArray=arguments[2],objsArrayLen = objsArray.length;

    while (dupe==true){ //check new name against name of all other tagName objs
        dupe=false;
        objName = tagString + counter++;
		//iterates through possible names: tagName1, then tagName2, etc.
        for (i=0;dupe==false && i<objsArrayLen;i++){
		  //if another object of this type has the same name
          if (objsArray[i].getAttribute("id") == objName || objsArray[i].getAttribute("name") == objName)
            dupe=true; //then repeat the loop, trying a new name
        }
    }
    return objName; //return new name

}

//Returns an array of objects of tagName
//If doc is in a frameset, searches all frames in parent
function createObjsArray(tagName){
  var frameListLen,objsArray=new Array(),thisFrame;
  if (dw.getDocumentDOM('parent')){//if frames
    frameListLen = dw.getDocumentDOM('parent').getElementsByTagName('frame').length;
    for (i=0;i<frameListLen;i++){
      thisFrame = 'parent.frames[' + i + ']';
      objsArray = objsArray.concat(dw.getDocumentDOM(thisFrame).getElementsByTagName(tagName));
    }
  } else //if no frames
    objsArray = dw.getDocumentDOM("document").getElementsByTagName(tagName);
  return objsArray;
}


//Returns the tag for the current selection, such as
//IMG, A, DIV etc. Always uppercase.

function getSelectionTag() {
  var retVal = "";
  var selObj = dw.getDocumentDOM().getSelectedNode();
  if (selObj && selObj.nodeType == Node.ELEMENT_NODE) retVal = selObj.tagName;
  return retVal
}


//Called by Attain to silently update behavior calls
//Returns new call if ok, otherwise returns empty string

function reapplyBehavior(oldBehaviorCall) {
  var newBehaviorCall = "";
  var behName = "MM_swapImage";

  document.SILENT_MODE = true;
  initializeUI();
  inspectBehavior(oldBehaviorCall);
  newBehaviorCall = applyBehavior();
  if (newBehaviorCall.indexOf(behName) == -1) newBehaviorCall=""; //if not fn call, return ""
  document.SILENT_MODE = false;

  return newBehaviorCall;
}
