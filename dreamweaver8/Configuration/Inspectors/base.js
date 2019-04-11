// Copyright 2000, 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.
// *********** GLOBAL VARS *****************************

var helpDoc = MM.HELP_inspBase;

// ******************** API ****************************
function canInspectSelection(){
  return true;
}

//look at target
//if in list of targets, set to list item
//if not, add to bottom of list and set it


function inspectSelection(){
  var frameName,counter,frameList,listLen,counter,targetVal,bTargetFound=false;
  var dom = dw.getDocumentDOM();
  var baseObj = dom.getSelectedNode();

  if (!baseObj || !baseObj.getAttribute) return;

  var hrefVal = baseObj.getAttribute("href");
  var Href = document.Layer1.document.Href;
  var frameTarget = document.Layer1.document.frameTarget;
  var counter=5; //add frame names to picklist after standard frame targets
  //populate frame target picklist
  frameList=getObjectRefs("NS 4.0","parent","frame"); //get list of frames
  if (frameList && frameList.length>0) { //if frames
  //if the frame has a name, add name to target picklist
    for (i=0; i<frameList.length; i++) {
      if (frameList[i].indexOf('unnamed')==-1){ //if the frame has a name
        frameName=frameList[i].substring(frameList[i].indexOf("['")+2,frameList[i].indexOf("']"));
        frameTarget.options[counter++] = new Option(frameName); 
  }}}

  //if base target value exists and matches choice in target picklist, set it
  //otherwise, add to bottom of picklist and select it
  if (baseObj.getAttribute("target")){
     targetVal = baseObj.getAttribute("target");
	 for (i=0;i<counter&&!bTargetFound;i++){  //look for existing match in frame picklist
	   if (targetVal==frameTarget.options[i].text){
	     frameTarget.selectedIndex=i;
		 bTargetFound=true;
	   }
	 }
	 if (!bTargetFound){ //if no match found
	 //dynamically add the frame target value to bottom of picklist
	   frameTarget.options[counter] = new Option(targetVal);
	   frameTarget.selectedIndex = counter;
	 }
  }
  
  //fill in href value
  if (hrefVal)
    Href.value = hrefVal;
  else
    Href.value = "";

  showHideTranslated();
//  showHideTranslated( baseObj, 'tButtonSpan' );
    
}

// ******************** LOCAL FUNCTIONS ****************************

function setBaseTag(){
  var dom = dw.getDocumentDOM();
  var baseObj = dom.getSelectedNode();
  var Href = document.Layer1.document.Href.value;
  var frameTarget = document.Layer1.document.frameTarget;
  var frameIndex = frameTarget.selectedIndex;
  
  if (frameIndex!=0){
    baseObj.setAttribute("target",frameTarget.options[frameIndex].text);
  }else
    baseObj.removeAttribute("target");	
	
  if (Href)
    baseObj.setAttribute("href",Href);   
}

function browseForFile()
{
	var filePath = document.Layer1.document.Href.value;
	var fileName = dwscripts.browseFileWithPath(filePath);  //returns a local filename
  if (fileName) 
    document.Layer1.document.Href.value=fileName;
}

