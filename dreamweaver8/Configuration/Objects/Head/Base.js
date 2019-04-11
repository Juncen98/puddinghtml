// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.


//---------------   GLOBAL VARIABLES   ---------------

var helpDoc = MM.HELP_objBase;


//---------------     API FUNCTIONS    ---------------

function isDOMRequired() { 
	// Return false, indicating that this object is available in code view.
	return false;
}

function objectTag(){
  var Form=document.forms[0];
  var Attributes='';
  var href=Form.hrefFileName.value;
  var frameTarget=Form.frameTarget.selectedIndex;
  Attributes+='href="' + href + '" ';
  if (frameTarget!=-1)
    Attributes+='target="' + Form.frameTarget.options[frameTarget].text + '"';
	
  if (Attributes.charAt(Attributes.length-1)==' ') {//if there is an extra space, kill it
    Attributes = Attributes.substring(0,Attributes.length-2);	
  }
			
  return '<base ' + Attributes + '>';
}

//---------------    LOCAL FUNCTIONS   ---------------

function browseFile(){
  var fileName = browseForFileURL();  //returns a local filename
  if (fileName) document.forms[0].hrefFileName.value = fileName;
}

function initializeUI(){
  var frameName,counter,frameList;
  var counter=5;
  frameList=getObjectRefs("NS 4.0","parent","frame"); //get list of frames
  if (frameList && frameList.length>0) { //if frames
    for (i=0; i<frameList.length; i++) {
      if (frameList[i].indexOf('unnamed') == -1){
        frameName=frameList[i].substring(frameList[i].indexOf("['") + 2,frameList[i].indexOf("']"));
        document.forms[0].frameTarget.options[counter++] = new Option(frameName); 
      }
    }
  }
}


