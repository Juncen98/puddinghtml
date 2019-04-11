//
// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.
// ----------------------------------------------------
//
// Insert_Word.js

function isDOMRequired() { return false; }

function objectTag()
{
   var fName = dw.getWordDocument();
   if ( fName != null && fName.length > 0 )
      insertOfficeDoc( fName, null, false );

   return "";
}
