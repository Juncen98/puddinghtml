// Copyright 2005 Macromedia, Inc. All rights reserved.

function receiveArguments()
{ 
  //open the attached template 
	dw.openDocument(getFullPath(dw.getDocumentDOM().getAttachedTemplate()));
}

function canAcceptCommand()
{
  var retVal = true;
	retVal = (dw.getFocus() != 'browser' && dw.getDocumentDOM() != null && dw.getFocus() != 'site' && dw.getDocumentDOM().getFocus() != 'frameset' && dw.getDocumentDOM().getAttachedTemplate().length > 0);
  return retVal;
}
