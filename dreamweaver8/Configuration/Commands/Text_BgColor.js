// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved

//---------------    LOCAL FUNCTIONS   ---------------
// Helper functions for Menu Command and toolbars Text_BgColor
// handleTable checks to see if colors that we want to apply (or detect) are
// relevant to table cells and not just chunks of text.  The rules are:
//
// 1) If the cursor is an insertion point and is inside a cell then the
//    color applies to the cell, unless there is another containing block of
//    color between the insertion point and the cell.
// 2) If the user has selected a cell or a group of cells then the color applies
//    to that group.

function handleTable( objHandler, userData )
{
	var nodes = [];

	// First make the rough cut of whether or not we are in a table.

	if (!dw.getDocumentDOM()) return false;

	if ( dw.getDocumentDOM().isInsideTable() && !dw.getDocumentDOM().isTableLocked() )
	{
		// If we are then get the first selected node.  (We don't get
		// the whole complex selection here--it's expensive to get the
		// selection as offsets, so we first get the main selection as
		// offsets, then get the complex selection later on.)
		var dom = dw.getDocumentDOM();
		var selection = dom.getSelection( false );
		if (selection.length >= 2)
		{
			// Deduce whether we are an insertion point or not

			var isAnInsertionPoint = ( selection[ 0 ] == selection[ 1 ] ) ? true : false;

			// Now apply the rules to see whether we apply to the current
			// selection
			// Here, we get the entire complex selection (if any) as
			// object nodes.  This is faster than getting it as offsets
			// and then using offsetsToNode().
			var selectedNodes = dom.getSelectedNode(true, true);
			selObj = selectedNodes[0];

			if ( selectedNodes.length > 1 ||
			     selObj.nodeType != Node.TEXT_NODE ||
				 ( selObj.nodeType == Node.TEXT_NODE && isAnInsertionPoint ) )
			{
				// If we do then iterate through the selection points and
				// apply the logic.  It's possible that in some cases we could
				// get this far and still not apply or detect the color. In
				// particular if we are insertion point within a span within a
				// cell.

				var sets = ( selectedNodes.length );
			
				for( var set = 0; set < sets; set++ )
				{
					// Get the selection for this set

					selObj = selectedNodes[set];

					// Crawl back up through the object lineage to the TD

					while ( selObj != null )
					{

            //if exactly one block tag was selected, and not TD/TH tag, don't bubble up to table cell
            if (sets==1 && !isAnInsertionPoint && selObj.tagName && !(selObj.tagName=="TD" || selObj.tagName=="TH"))
            {
              break;
            }

						// If we have hit the row or the table just stop

						if ( selObj.tagName == "TABLE" || selObj.tagName == "TR" )
							break;

						// If we have a TD then we should apply the function
						// to it

						if ( selObj.tagName == "TD" || selObj.tagName == "TH" )
						{
							nodes.push( selObj );
							break;
						}

						// Otherwise keep crawling up
						selObj = selObj.parentNode;
					}
				}
			}
		}
	}

	// Apple the function to the nodes

	if ( objHandler && nodes.length > 0 )
	{
		for( var index in nodes )
			objHandler( nodes[ index ], userData );
	}

	// Return true if we have actually applied the handler to the 
	// current selection

	return ( nodes.length > 0 ) ? true : false;
}

// setBgColor is used by handleTable to set the background color of
// the selected TD objects

function setBgColor( obj, bgcolor )
{
	obj.setAttribute( "bgcolor", bgcolor );
}

// getBgColor is used by handleTable to get the background color of 
// the selected TD objects

function getBgColor( objHandle, userData )
{
	var curColor = objHandle.getAttribute( "bgcolor" );
	if (userData.textColor != "" && userData.textColor != curColor)
	{
		// We must have a mixed selection.
		userData.textColor = '*';
	}
	else
		userData.textColor = curColor;
}

// getCurrentValue() is used by receiveArguments for both command and toolbar
// versions of setting the bg color. 
// Get the current bg color value from the dom - either for the node,
// or if not found there, from the doc. Includes special handling for tables. ie., If
// the selection is a cell or IP in a cell, return the cell's value.
function getCurrentValue(){
	var textColor = '';
	var dom = dw.getDocumentDOM();

	var userData = {};
	userData.textColor = "";

	var handled = handleTable( getBgColor, userData );

	if ( handled )
		textColor = userData.textColor;

	if ( dw.getFocus() == 'document' && !handled ) {
  		textColor = dom.getCSSStyleProperties(true).backgroundColor;
	}

	return textColor;
}

