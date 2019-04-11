//
// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved. 
// ----------------------------------------------------
//
// Other.js
//
// See Commands/InsertEnt.js for implementation of Character Entity 
// insertion.
//

//
// ---- Object API ---
//

function isDOMRequired() { 
	// Return false, indicating that this object is available in code view.
	return false;
}

function objectTag() 
{
   var insertEntCmdURL = dreamweaver.getConfigurationPath() + "/Commands/InsertEnt.htm";
   var entDOM = dreamweaver.getDocumentDOM(insertEntCmdURL);
   dreamweaver.popupCommand("InsertEnt.htm");
	 checkEncoding();
   return(entDOM.parentWindow.objectTag());
}

