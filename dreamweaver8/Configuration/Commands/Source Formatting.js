// Copyright 1998, 1999, 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.
//-----------------------------------------------------
//
// Source Formatting.js
//
// This file contains the implementation to fire off the Dreamweaver
// source formatter.

function canAcceptCommand()
{
  retVal = false;
  if (dw.getDocumentDOM() && (dw.getDocumentDOM().getParseMode() == 'html' || dw.getDocumentDOM().getParseMode() == 'xml') && (dw.getFocus() == 'document' || dw.getFocus(true) == 'html' || dw.getFocus() == 'textView')){
    retVal = true;
  }
  return retVal;
}

// formatSource()
//
// This routine kicks off the Dreamweaver source formatter
// on the entire document by "touching" the HTML child tag
// innerHTML properties.
// 
function formatSource(dom)
{
   if (dom) { 
      if (dom.getParseMode() == 'xml')
      	dom.synchronizeDocument();
   }
   else if (dw.getDocumentDOM("document").getParseMode() == 'xml')
      dw.getDocumentDOM("document").synchronizeDocument();
	  
   var root      = dom || dreamweaver.getDocumentDOM("document");
   var outerHTML = root.documentElement.outerHTML;

   root.formatRange(0, outerHTML.length);
   
   return;         
}
