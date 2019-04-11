// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.
// Menu Command API for SB_Context_ServerModel.htm

//******************** GLOBALS **************************

//********************** API ****************************

function receiveArguments()
{
	var doc = dw.getDocumentDOM();
	var showResults = (arguments[0] == 'showresults' ? true : false);
	var errors = null;
	
	if ( showResults )
	{
		// if it is show all results and it is already showing, then we toggle it off
		if ( dw.getFloaterVisibility('btc') )
		{
			dw.toggleFloater('btc');
		}
		// else if the floater is not on, 
		// then we'll toggle the floater on and select the error item that 
		// the selection is on or the first error item if it is not on one
		else {
			// get errors either at the cursor, or else if the caret is not on an
			// error then get the first error in the doc
			if ( doc ) {
				errors = doc.source.getValidationErrorsForOffset(doc.source.getSelection()[0]);
			}
			if ( errors && errors.length > 0 )
			 	dw.showResults(errors[0].floaterName,errors[0].floaterIndex);
			else
			 	dw.showResults('btc', (doc ? doc.URL : null));
		}		 
	}
	// otherwise it is the next or previous error, so we just show the next 
	// or previous error in the code view
	else {
		errors = searchForErrors(arguments[0]);
		if ( doc && errors && errors.length > 0 )
		{
			// set the document to split view if it is in design view or site
			if ( doc.getView() == 'design' )
				doc.setView('split');
			doc.source.setSelection(errors[0].start, errors[0].end);
			
			dw.setFocus('textView');
		}
	}
}

function canAcceptCommand()
{
	var errors = (arguments[0] == 'showresults' ? true : searchForErrors(arguments[0]));
	if ( errors )
		return true;
	else
		return false;
}

function isCommandChecked()
{
	if ( arguments[0] == 'showresults' )
		return dw.getFloaterVisibility('btc');
	else
		return false;
}

function searchForErrors(direction)
{
	var doc = dw.getDocumentDOM();
	if ( !doc )
		return null;

	var sel = doc.source.getSelection();
	var startOffset;
	if ( direction == 'back')
		startOffset = sel[0];
	else
		startOffset = sel[1];

	return doc.source.getValidationErrorsForOffset(startOffset, direction);
}
