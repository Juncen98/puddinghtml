
// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

//*********************GLOBAL VARS**********************

var dataFieldSelectObj = null;
var helpDoc = MM.HELP_ssAddDataFieldDlgAspNet;

//*************************API**************************

function commandButtons()
{
  return new Array(MM.BTN_OK,		"okClicked()",
                   MM.BTN_Cancel,	"cancelClicked()",
                   MM.BTN_Help,		"displayHelp()" );
}

//*******************LOCAL FUNCTIONS*********************

function initializeUI()
{
	dataFieldSelectObj = new ListControl("DataFieldSelect");

	// Populate data fields

	var recordsetName = dwscripts.getCommandArguments();

	if (recordsetName)
	{
		dataFieldSelectObj.setAll(dwscripts.getFieldNames(recordsetName));
	}
}

function cancelClicked()
{
	dwscripts.setCommandReturnValue("");
	window.close();
}

function okClicked()
{
	var recordsetName = dwscripts.getCommandArguments();
	if (recordsetName)
	{
		var expr = "<%# @@recordsetname@@.FieldValue(\"@@property@@\", Container) %>\r";
		expr = expr.replace("@@recordsetname@@", recordsetName);
		expr = expr.replace("@@property@@", dataFieldSelectObj.get());
		dwscripts.setCommandReturnValue(expr);
	}
	window.close();
}
