// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved

function objectTag()
{
	var cmdFile = dreamweaver.getConfigurationPath() + "/Commands/ServerVariable.htm";
	var cmdDOM = dreamweaver.getDocumentDOM(cmdFile);

	dreamweaver.popupCommand("ServerVariable.htm");
	
	var varStr = cmdDOM.parentWindow.getVarStr();

	var dom = dw.getDocumentDOM();
  	var theSel = dom.source.getSelection();
 
  	dom.source.replaceRange(theSel[0], theSel[1], varStr);
			
	// Just return -- insertion was handled above.

	return;
}
