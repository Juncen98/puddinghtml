// Copyright 2005 Macromedia, Inc. All rights reserved.

// *************** GLOBALS VARS *****************
var helpDoc = MM.HELP_cmdDeclMissingEntities;

// ******************* API **********************

function commandButtons()
{
  return new Array(MM.BTN_OK, "clickedOK()", MM.BTN_Help, "displayHelp()"); 
}

//***************** LOCAL FUNCTIONS  ******************

function initializeUI()
{
  //set the entity name
	var entityNameObj = findObject('entityname');
	if (entityNameObj != null)
	{
		entityNameObj.innerHTML = MM.missingEntityName;
	}

	//set the xslt file name
	var xsltFileNameObj = findObject('xslfile');
	if (xsltFileNameObj != null)
	{
		xsltFileNameObj.innerHTML = MM.xsltFileName;
	}
}

function updateUI(itemName)
{
}

function clickedOK()
{
	window.close();
}
