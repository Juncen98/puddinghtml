//=========================================================================================================
//
// Copyright 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.
//
// Feature: Paste Fix
// Author:  JDH
// Module:  DropOffice.js
// Purpose:	Called by the drag and drop mechanism in response to a file drop.
// Updates:
//	8/1/02 - Started file control
//	7/13/04 - VM - added paste types
//
//=========================================================================================================

var helpDoc = MM.HELP_objDropOffice;

var g_file = null;
var g_textFile = false;
var g_returnArray = null;
var g_oldCleanupVal = "false";
var g_excelFile = false;

function receiveArguments()
{
	g_file = arguments[0];
	g_textFile = arguments[1];
	g_returnArray = arguments[2];

	if ( g_file.match( /[.]xls/i ) )
		g_excelFile = true;
}

function commandButtons()
{
   return new Array("PutButtonsOnBottom", "OkButton defaultButton", MM.BTN_OK, "run(); window.close()",
                    "PutButtonOnLeft", MM.BTN_Help, "displayHelp()",
                    "CancelButton", MM.BTN_Cancel, "window.close()" );
}

function disableCleanup(disVal)
{
	var wasDisabled;
	if (document.theForm.cleanup.getAttribute("disabled") == "true")
		wasDisabled = true;
	else
		wasDisabled = false;

	if (g_excelFile || g_textFile)
		disVal = "true";
		
	if (disVal == "true")
 	{
 		if (!wasDisabled)
 		{
			g_oldCleanupVal = document.theForm.cleanup.checked;
			document.theForm.cleanup.removeAttribute("checked");
		}
	}
	else if (wasDisabled)
	{
		if (g_oldCleanupVal.toString() == "true")
			document.theForm.cleanup.setAttribute("checked", "true");
		else
			document.theForm.cleanup.removeAttribute("checked");
	}
	else
	{
		// remember the value in case it changed
		g_oldCleanupVal = document.theForm.cleanup.checked;
	}
	
	document.theForm.cleanup.setAttribute("disabled", disVal);
}

function disableTypes(disVal)
{
	document.theForm.pastetype[0].setAttribute("disabled", disVal);
	document.theForm.pastetype[1].setAttribute("disabled", disVal);

	if (g_textFile)
	{
		document.theForm.pastetype[2].setAttribute("disabled", "true");
		document.theForm.pastetype[3].setAttribute("disabled", "true");
	}
	else
	{
		document.theForm.pastetype[2].setAttribute("disabled", disVal);
		document.theForm.pastetype[3].setAttribute("disabled", disVal);
	}

	if (g_textFile || g_excelFile)
		document.theForm.cleanup.setAttribute("disabled", true);
	else if (document.theForm.pastetype[0].checked || document.theForm.pastetype[3].checked)
		document.theForm.cleanup.setAttribute("disabled", true);
	else
		document.theForm.cleanup.setAttribute("disabled", disVal);

}

function initializeUI()
{
	var defVal = dw.getPreferenceString( "General Preferences", "Drop Office Default", "0" );

	document.theForm.opmode[ defVal ].checked = true;
	document.theForm.opmode[ defVal ].focus();

	defVal = dw.getPreferenceString( "General Preferences", "Drop Office Default Type", "2" );
	document.theForm.pastetype[ defVal ].checked = true;
	
	if (defVal == 1)
		disableTypes("true");
	else
		disableTypes("false");

	var cleanupWordPars = dw.getPreferenceString( "General Preferences",
		"Drop Office Default Cleanup Word Par Spacing", "true" );

	if (cleanupWordPars == "true")
		document.theForm.cleanup.setAttribute("checked", "true");
	else
		document.theForm.cleanup.removeAttribute("checked");

	g_oldCleanupVal = cleanupWordPars;

	if (g_textFile)
	{
		if (defVal > 1)
			document.theForm.pastetype[ 1 ].checked = true;
	}

	// disable cleanup word if excel file, or text only, or full formatting
	if ( g_excelFile || g_textFile )
		document.theForm.cleanup.removeAttribute("checked");
	if ( g_excelFile || g_textFile || defVal == 0 || defVal == 3)
		disableCleanup(true);
	
}

function run()
{
	if ( document.theForm.opmode[ 0 ].checked )
	{
		dw.setPreferenceString( "General Preferences", "Drop Office Default", "0" );

		var pasteType;
		var cleanupWordPars = false;
		
		if (document.theForm.pastetype[0].checked)
			pasteType = 0;
		else if (document.theForm.pastetype[1].checked)
			pasteType = 1;
		else if (document.theForm.pastetype[2].checked)
			pasteType = 2;
		else
			pasteType = 3;

		if (document.theForm.cleanup.checked)
			cleanupWordPars = true;

		dw.setPreferenceString( "General Preferences", "Drop Office Default Type", pasteType );
		dw.setPreferenceString( "General Preferences", "Drop Office Default Cleanup Word Par Spacing", cleanupWordPars );

		var ret = insertOfficeDoc( g_file, g_returnArray, true, pasteType, cleanupWordPars );
	}
	else
	{
		if ( g_returnArray )
			g_returnArray[ 0 ] = false;
		dw.setPreferenceString( "General Preferences", "Drop Office Default", "1" );
	}
}
