// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

function toggleBreakpoint()
{
   var doc = dw.getDocumentDOM('document');
   if (doc)
   {
      var line = doc.getLineFromOffset(doc.source.getSelection()[0]);
      doc.setBreakpoint(line, !doc.getBreakpoint(line));
   }
}

function canAcceptCommand()
{
   return dw.getFocus() == 'textView' ||
			(dw.getFocus() == 'none' && dw.getDocumentDOM() != null && dw.getDocumentDOM('document').getFocus() != 'frameset');
}

function setMenuText()
{
   var doc = dw.getDocumentDOM('document');
   if (doc)
   {
      var line = doc.getLineFromOffset(doc.source.getSelection()[0]);
      if ( !doc.getBreakpoint(line) )
         return MENU_SetBreakpoint;
      else
         return MENU_RemoveBreakpoint;
   }
   else
      return MENU_SetBreakpoint;
}
