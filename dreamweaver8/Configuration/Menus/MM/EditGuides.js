// Copyright 2005 Macromedia, Inc. All rights reserved.

var shouldClearAllGuides = false;
var didHideGuides = false;
var helpDoc = MM.HELP_mnuEditGuides;

function canAcceptCommand()
{
  var retVal = dw.getFocus() == 'document' 
  			|| (dw.getFocus() == 'textView' 
			&& dw.getDocumentDOM() != null 
			&& dw.getDocumentDOM().getView() == 'split');

  return retVal;
}

function commandButtons(){
  return new Array(MM.BTN_OK,     "editGuidesOK()",
                   MM.BTN_Cancel, "window.close()",
				   MM.BTN_Help,		"displayHelp()");
}

function editGuidesOK(){
	var dom = dw.getDocumentDOM();

	// First go through and set all the settings
	var guideColor = dwscripts.findDOMObject('guideColor');
	dom.guidesColor = guideColor.value;
	
	var distanceColor = dwscripts.findDOMObject('distanceColor');
	dom.guidesDistanceColor = distanceColor.value;

	var showGuides = dwscripts.findDOMObject('showGuides');
	dom.guidesVisible = showGuides.checked;
	
	var guidesDoSnap = dwscripts.findDOMObject('guidesDoSnap');
	dom.snapToGuides = guidesDoSnap.checked;
	
	var lockGuides = dwscripts.findDOMObject('lockGuides');
	dom.guidesLocked = lockGuides.checked;

	var elementsTheGuidesSnapTo = dwscripts.findDOMObject('elementsTheGuidesSnapTo');
	dom.guidesSnapToElements = elementsTheGuidesSnapTo.checked;

	// If they wanted to clear the guides, do that now
	if( shouldClearAllGuides )
		dom.clearGuides();	
		
	window.close();
}

function takeDownUI() {
	var dom = dw.getDocumentDOM();

	// If we hid the guides temporarily, show them
	//	again
	if( didHideGuides )
		dom.guidesVisible = true;	
}

function onClearAllGuides() {
	var dom = dw.getDocumentDOM();

	// if they've already hit the button once, ignore it
	if( !shouldClearAllGuides )
	{
		// We want to give them the illusion that clearing the guides
		//	worked immediately, but still give them the option of
		//	cancelling. So just hide the guides temporarily.
		if( dom.guidesVisible )
		{
			dom.guidesVisible = false;
			didHideGuides = true;
		}
		
		// If they hit OK, then clear all the guides
		shouldClearAllGuides = true;
	}
}

function initUI(){
	// Initialiaze our "globals"
	shouldClearAllGuides = false;
	didHideGuides = false;

	// Now Initialize our UI
	var dom = dw.getDocumentDOM();

	var guideColor = dwscripts.findDOMObject('guideColor');
	var guideColorText = dwscripts.findDOMObject('guideColorText');
	guideColor.value = dom.guidesColor;
	guideColorText.value = dom.guidesColor;
	
	var distanceColor = dwscripts.findDOMObject('distanceColor');
	var distanceColorText = dwscripts.findDOMObject('distanceColorText');
	distanceColor.value = dom.guidesDistanceColor;
	distanceColorText.value = dom.guidesDistanceColor;

	var showGuides = dwscripts.findDOMObject('showGuides');
	showGuides.checked = dom.guidesVisible;
	
	var guidesDoSnap = dwscripts.findDOMObject('guidesDoSnap');
	guidesDoSnap.checked = dom.snapToGuides;
	
	var lockGuides = dwscripts.findDOMObject('lockGuides');
	lockGuides.checked = dom.guidesLocked;
	
	var elementsTheGuidesSnapTo = dwscripts.findDOMObject('elementsTheGuidesSnapTo');
	elementsTheGuidesSnapTo.checked = dom.guidesSnapToElements;
}

function onGuideColorChanged() {
	var guideColor = dwscripts.findDOMObject('guideColor');
	var guideColorText = dwscripts.findDOMObject('guideColorText');

	guideColorText.value = guideColor.value;
}

function onGuideColorBlur() {
	var guideColor = dwscripts.findDOMObject('guideColor');
	var guideColorText = dwscripts.findDOMObject('guideColorText');

	guideColor.value = guideColorText.value;
}

function onDistanceColorChanged() {
	var distanceColor = dwscripts.findDOMObject('distanceColor');
	var distanceColorText = dwscripts.findDOMObject('distanceColorText');
	
	distanceColorText.value = distanceColor.value;
}

function onDistanceColorBlur() {
	var distanceColor = dwscripts.findDOMObject('distanceColor');
	var distanceColorText = dwscripts.findDOMObject('distanceColorText');
	
	distanceColor.value = distanceColorText.value;
}


