// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.
// Specifies tag to use when applying font changes.
// Return either "font" or "span".
function getFontTag(){
	var dom = dw.getDocumentDOM();

	return dom.getCCSharedSetting_FontsEmitFontOrSpan();
}

// Specifes units when font changes are applied with SPAN tags 
// (ignored if getFontTag() returns "font"). Return either
// "pixels" or "points".
function getFontUnits(){
	var dom = dw.getDocumentDOM();

	return dom.getCCSharedSetting_FontsEmitFontUnits();
}

// Defines list of default fonts. Enclose multiple-word font names in single quotes.
function getFontList()
{
	return dw.getFontList();
}

// Specifies whether to show the Font and Size menus
// in the toolbar. Return either true or false (no quotation marks).
function getShowFontsAndSizes(){
	var dom = dw.getDocumentDOM();

	return dom.getCCSharedSetting_FontsLetUserChange();
}


// NOTE: If both of the following functions return false, then
// the Style pop-up menu will not appear in the toolbar. In addition,
// if getShowHeadings() is false and there are no styles defined for
// the document, the pop-up menu will also not appear. It will reappear
// if a document containing styles is opened.

// Specifies whether to show H1, H2, P, etc. in Styles list. 
// Return either true or false (no quotation marks).
function getShowHeadings(){
	var dom = dw.getDocumentDOM();

	return dom.getCCSharedSetting_StyleHTMLHeadings();
}

// Specifies whether to show CSS Styles in Styles list. 
// Return either true or false (no quotation marks).
function getShowStyles(){
	var dom = dw.getDocumentDOM();

	return dom.getCCSharedSetting_StyleCSS();
}

// True/False: does the selected tag make sense to FONT or B (bold) or I (italisize), etc.
function isSelectionTextuallyModifiable(dom){
	var ret = true;

	// Hack to get around the fact that dw.getSelectedNode() thinks
	// an <img> is selected if the caret is an IP before it.  We
	// just assume all IPs are okay for the purposes of this function.
	var selection = dom.getSelection();
	if (selection && selection[0] != selection[1])
	{
		var node = dom.offsetsToNode(selection[0], selection[1]);
		if (node && node.tagName)
		{
			var tag = node.tagName;
			//  Hmmmm.  Should the following be in this list, too?
			//		DIV
			//		P
			//		H1 - H6
			//		BLOCKQUOTE
			//		UL
			//		OL
			//		LI
			//		DT
			//		DD
			//		TABLE
			//		FORM
			//      (various server-side tags)
			if (
				(tag == 'HTML')		||
				(tag == 'HEAD')		||
				(tag == 'TITLE')		||
				(tag == 'HR')			||
				(tag == 'IMG')		||
				(tag == 'MAP')		||
				(tag == 'AREA')		||
				(tag == 'FRAMESET')	||
				(tag == 'FRAME')		||
				(tag == 'BASE')		||
				(tag == 'NOFRAMES')	||
				(tag == 'META')		||
				(tag == 'STYLE')		||
				(tag == 'LINK')
			   )
			{
				ret = false;
			}
		}
	}

	return ret;
}
