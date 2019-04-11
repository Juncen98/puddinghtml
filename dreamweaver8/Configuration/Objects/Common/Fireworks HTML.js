//
// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.
// ----------------------------------------------------
//
// Fireworks.js
//
// See Commands/Fireworks.js for implementation of
// Insert Fireworks HTML object
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
   var fireworksCmdURL = dreamweaver.getConfigurationPath() + "/Commands/Fireworks HTML.htm";
   var fireworksDoc    = dreamweaver.getDocumentDOM( fireworksCmdURL );
   dreamweaver.popupCommand( "Fireworks HTML.htm" );
   return( fireworksDoc.parentWindow.getObjectTag() );
}

