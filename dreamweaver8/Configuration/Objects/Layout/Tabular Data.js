// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

//---------------     API FUNCTIONS    ---------------

function isDOMRequired() { 
	// Return false, indicating that this object is available in code view.
	// This means this object/command is guaranteed to not use the DOM of the current document,
	// except for dw.getDocumentDOM().source...
	return false;
}

function objectTag(){
   var importCommand = dreamweaver.getConfigurationPath() + "/Commands/Tabular Data.htm";
   var importCommandDOM = dreamweaver.getDocumentDOM(importCommand);
   
   importCommandDOM.getElementsByTagName("TITLE").item(0).innerHTML = 
      TITLE_Insert_Tabular_Data;
   
   dreamweaver.popupCommand("Tabular Data.htm");
   return '';
}