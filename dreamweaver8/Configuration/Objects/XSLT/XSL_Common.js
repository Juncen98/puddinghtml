// Copyright 2005 Macromedia, Inc. All rights reserved.

//--------------------------------------------------------------------
// FUNCTION:
//   wrapXSLTObject
//
// DESCRIPTION:
//	 replaces the current selection with xslt tag around it.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function wrapXSLTObject(retCode)
{
		var sel = dom.source.getSelection(true);
		var docHTML = dom.documentElement.outerHTML;
		var preCode  = docHTML.substring(0,sel[0]);
		var postCode = docHTML.substring(sel[sel.length-1]);
		var newDocHTML = preCode + retCode + postCode;
		dom.documentElement.outerHTML = newDocHTML;
}
