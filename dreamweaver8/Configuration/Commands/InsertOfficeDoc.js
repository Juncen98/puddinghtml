//=========================================================================================================
//
// Copyright 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.
//
// Feature: Paste Fix
// Author:  JDH
// Module:  InsertOfficeDoc.js
// Purpose:	Insert Office Document menu item handler.
// Updates:
//	8/1/02 - Started file control
//
//=========================================================================================================

	// The threshold where we should warn the user they are importing a big file

MM.od_WarnThreshold = 100000;

	// The threshold where we should not allow the user to import the file.

MM.od_MaxThreshold = 200000;

// insertOfficeDoc - Inserts the given file name into the current document.

function insertOfficeDoc( file, retArray, allowLink, pasteType, cleanupWordPars )
{
	// Switch on Excel or Word.  Use one of those to open up the file, and
	// to save the contents as HTML and return it.

	var usedWord = false;

	var result;
	if ( file.match( /[.]xls/i ) )
	{
		result = dw.excelSaveAsHTML( file );
	}
	else
	{
		result = dw.wordSaveAsHTML( file );
		usedWord = true;
	}

	// Get the text and the base URL

	var text = result[ 0 ];
	var url = result[ 1 ];

	// Go through a bunch of logic to warn or alert the user to large files,
	// and either insert it or not

// alert( text.length );

	if ( text != null && text.length > 0 )
	{
		if ( text.length < MM.od_WarnThreshold )
		{
			dw.getDocumentDOM().pasteInHTML( text, url, pasteType, cleanupWordPars );
		}
		else if ( text.length < MM.od_MaxThreshold )
		{
			if ( allowLink )
			{
				var retVal = confirm( MM.MSG_odWarnWithLink );

				if ( retVal == true )
					dw.getDocumentDOM().pasteInHTML( text, url, pasteType, cleanupWordPars );
				else
					retArray[ 0 ] = false;
			}
			else
			{
				if ( confirm( MM.MSG_odWarn ) )
					dw.getDocumentDOM().pasteInHTML( text, url, pasteType, cleanupWordPars );
			}
		}
		else
		{
			if ( allowLink )
			{
				alert( MM.MSG_odStopWithLink );
				retArray[ 0 ] = false;
			}
			else
			{
				alert( MM.MSG_odStop );
			}
		}
	}
	else
	{
		if ( usedWord )
		{
			alert( MM.MSG_odWordUnableToSaveAs );
		}
		else
		{
			alert( MM.MSG_odExcelUnableToSaveAs );
		}
	}
}
