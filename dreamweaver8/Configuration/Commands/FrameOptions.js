//
// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.
// ----------------------------------------------------
//
// FrameOptions.js
//
// This command returns a frame title to mm_frameset.js
// when preferences are set for prompting for accessibility 
// frame options. The title is added to the <frame> tag as
// an attribute.
//
// Version 1.0
// 
// ----------------------------------------------------


var frameNameList=  new Array();
var frameTitleList= new Array();
var globalFormDom= '';
var helpDoc = MM.HELP_objFrameAccessOptions;

function commandButtons() {
   return new Array(MM.BTN_OK,         "setAccessibilityStr();window.close()",
                    MM.BTN_Cancel,     "window.close()",
                    MM.BTN_Help,       "displayHelp()"    );


}


function isDOMRequired() { 
	// Return false, indicating that this object is available in code view.
	return false;
}

function setFormItem(formDom) {
	globalFormDom = formDom;

}

function setAccessibilityStr()
{
    arrayFrames= globalFormDom.getElementsByTagName('FRAME');
	numFrames= arrayFrames.length; 

	for (i=0; i < numFrames; i++){
		if (frameTitleList[i] != '') {arrayFrames[i].setAttribute('title', frameTitleList[i]);}
	}

}



///////////////////////////////////////////////////////////////
// functions
//////////////////////////////////////////////////////////////

function initializeUI(){

   var cmdFile = dreamweaver.getConfigurationPath() + "/Commands/FrameOptions.htm";
   var cmdDOM = dreamweaver.getDocumentDOM(cmdFile);

    arrayFrames= globalFormDom.getElementsByTagName('FRAME');
	numFrames= arrayFrames.length; 

	for (i=0; i < numFrames; i++){
		
		frameName = arrayFrames[i].getAttribute('name');
		FRAME_LIST.add(frameName);
		frameNameList[i]= frameName;

		if (arrayFrames[i].getAttribute('title') == null) 
		 {frameTitleList[i]= frameName;}
		else {frameTitleList[i]= arrayFrames[i].getAttribute('title');}
				
	}

	FRAME_LIST.setIndex(i-1);
	document.theForm.frameTitle.value= frameTitleList[i-1];
}


function updateUI() {

	currIndex=FRAME_LIST.getIndex();
	document.theForm.frameTitle.value= frameTitleList[currIndex];
}

function updateTitle() {

	var currFrameTitle= document.theForm.frameTitle.value;
	var currIndex= FRAME_LIST.getIndex();
	frameTitleList[currIndex]= currFrameTitle;
}
