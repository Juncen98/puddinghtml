// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

//*************** GLOBALS VARS *****************

var helpDoc = MM.HELP_behHidePopupMenu;

//******************* BEHAVIOR FUNCTION **********************

//Included from file MM_hidePopupMenu.js

//******************* API **********************


// Can only be used on IMGs, AREAs, and links.
function canAcceptBehavior(HTMLelement){
	var retVal;
	if (HTMLelement == "IMG" || HTMLelement == "AREA" || HTMLelement == "A"){
		retVal = "onMouseOver,(onMouseOver)";
	}else{
		retVal = false;
	}
	return retVal;
}




//Returns a Javascript function to be inserted in HTML head with script tags.

function behaviorFunction(){
  return "MM_startTimeout";
}



function applyBehavior() {
  return "MM_startTimeout()";
}



//Passed the function call above, does nothing (no args to handle)
function inspectBehavior(){
}

function deleteBehavior(){

}
