// Copyright 2005 Macromedia, Inc. All rights reserved.

// *************** GLOBALS VARS *****************
var helpDoc;
var AVAILABLE_OBJECTS_LIST; 
var FAVORITE_OBJECTS_LIST; 
var myCustomizeFavorites; 

// ******************* API **********************

function commandButtons()
{
  return new Array(MM.BTN_OK, "clickedOK()", MM.BTN_Cancel, "clickedCancel()", MM.BTN_Help, "displayHelp()"); 
}

//***************** LOCAL FUNCTIONS  ******************

function receiveArguments(HELP_DOC)
{
  helpDoc = HELP_DOC;
}

function initializeUI()
{
	MM.XSLT_ConditionValue = "";
}

function updateUI(itemName)
{
}

function clickedOK()
{
  if (findObject('expression').value.length != 0)
  {
  	MM.XSLT_ConditionValue = findObject('expression').value;
	//encode the characters, pass in true for bXMLEncode
	MM.XSLT_ConditionValue = dwscripts.minEntityNameEncode(MM.XSLT_ConditionValue,true);
	window.close();
  }
  else 
	{
		alert (dw.loadString("xslt/expressionCannotBeEmpty"));
	}
}

function clickedCancel()
{
  	if (findObject('expression').value.length == 0)
		MM.XSLT_ConditionValue = findObject('expression').value = "";

	window.close();
}

function updateCommon(valueToUpdate)
{
	if (valueToUpdate.length != 0)
	{
		findObject('expression').value = valueToUpdate;
		// update the template object attribute
		//doTextEdit();
	}
}
