//Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

// *********** GLOBAL VARS *****************************

var helpDoc = MM.HELP_inspGeneric;

// ******************** API ****************************
function canInspectSelection(){

    var dom = dw.getDocumentDOM();
    var theObj = dom.getSelectedNode();

	var translatorClass;
	var lockType;

	if ( theObj.nodeType != Node.ELEMENT_NODE )
	{
		return false; 
	}

	translatorClass = theObj.getAttribute("translatorClass");
	if ( translatorClass != "MM_ASPSCRIPT" )
	{
		return false;
	}

	lockType = theObj.getAttribute("type");
	if ( lockType != "script")
	{
		return false;
	}
	
	return true;
}

function inspectSelection(){
  showHideTranslated();
}


// ******************** LOCAL FUNCTIONS ****************************

function launchASPEditDialog(){
  var dom = dw.getDocumentDOM();
  var theObj = dom.getSelectedNode();
  origAttr		= theObj.getAttribute("ORIG");
  aspStr			= unescape( origAttr );
  MM.editContents=aspStr;
  dw.popupCommand("EditContent");
  if (MM.retVal == "OK"){
  //update the node in the dom.
	curSelection	= dreamweaver.getSelection();
	dw.editLockedRegions(curSelection);
	theObj.setAttribute("ORIG",escape(MM.editContents));
  }
}


