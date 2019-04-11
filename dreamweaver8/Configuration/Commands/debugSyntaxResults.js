// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.
//*************** GLOBAL VARS  *****************


//******************* API **********************


function receiveArguments()
{
	// get the results win from the persistent global property
	var resultsWin = dw.constructor.MM_debuggerSyntaxResults;
	var cmd = arguments[0];
	if ( cmd == "init" )
	{
		var title = arguments[1];
		var buttonTitle = arguments[2];
		var colHeaders = arguments[3];
		var colWidths = arguments[4];

		if ( resultsWin ) {
			resultsWin.close();
			resultsWin = null;
		}

		resultsWin = dw.createResultsWindow(title, colHeaders);
		resultsWin.setColumnWidths(colWidths);
		resultsWin.setButtons(this, new Array(buttonTitle, "goToLine()"));
		
		// save the results win in a persistent global property
		dw.constructor.MM_debuggerSyntaxResults = resultsWin;
		//alert(dw.constructor.MM_debuggerSyntaxResults);
	}
	else if ( cmd == "addItem" )
	{
		var desc = arguments[1];
		var filePath = arguments[2];
		var off1 = arguments[3];
		var off2 = arguments[4];
		var cols = arguments[5];

		if ( resultsWin ) {
			resultsWin.addItem(this, "", desc, filePath, off1, off2, cols);

			if ( resultsWin.getItemCount() == 1 )
				resultsWin.setSelectedItem(0);
		}
	}
	else if ( cmd == "closeResults" )
	{
		if ( resultsWin ) {
			resultsWin.close();
			resultsWin = null;
		}
	}
}

function getResultsWin()
{
	// get the results win from the persistent global property
	var resultsWin = dw.constructor.MM_debuggerSyntaxResults;
	return resultsWin;
}

//***************** LOCAL FUNCTIONS  ******************

function onLoad()
{
	// do nothing since we did it all in receiveArguments
}

// this callback function is called when the user presses 
// Go To Line button in the results window
function goToLine()
{
	var resultsWin = dw.constructor.MM_debuggerSyntaxResults;
	//alert(resultsWin);
	var selItem = resultsWin.getSelectedItem();
	var itemVals = resultsWin.getItem(selItem);
	var icon = itemVals[0];
	var desc = itemVals[1];
	var filePath = itemVals[2];
	var off1 = new Number(itemVals[3]);
	var off2 = new Number(itemVals[4]);
	var cols = itemVals[5];
	var theDoc = dw.openDocument(filePath);

	if (theDoc.getView() == 'split' || theDoc.getView() == 'code' || theDoc.getView() == 'split code') 
	{
		dw.setFocus('textView');
	}
	else if (dw.getFloaterVisibility('html')) 
	{
		dw.setFocus('html');
	}
	else if ( theDoc.getView() == 'design' )
	{
		theDoc.setView('split')
		dw.setFocus('textView');
	}

	theDoc.source.setSelection(off1.valueOf(), off2.valueOf());
}

