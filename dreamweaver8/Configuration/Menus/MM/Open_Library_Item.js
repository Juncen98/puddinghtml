// Copyright 2005 Macromedia, Inc. All rights reserved.

function receiveArguments()
{ 
  //open the attached template 
	dw.openDocument(getFullPath(dw.getDocumentDOM().getSelectedNode().src));
}

function canAcceptCommand()
{
  var retVal = true;
  return retVal;
}
