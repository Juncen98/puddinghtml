//
// Copyright 2000, 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.
// ----------------------------------------------------
//
// Insert_Excel.js

function canAcceptCommand()
{	
	return (dw.getDocumentDOM() != null && dw.getFocus() == 'document' && dw.getDocumentDOM().getParseMode() == 'html' && dw.canImportExcel() > 0);
}

function go()
{
   var fName = dw.getExcelDocument();
   if ( fName != null && fName.length > 0 )
      insertOfficeDoc( fName, null, false, -1 );

   return "";
}
