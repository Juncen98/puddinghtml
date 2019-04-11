// Copyright 2000, 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

function receiveArguments()
{
	dw.openWithExternalTextEditor();
}

function canAcceptCommand()
{
	return (dw.getFocus() == 'textView' || dw.getFocus(true) == 'html' || dw.getFocus() == 'document' && dw.getDocumentDOM().getFocus() != 'frameset');
}

function setMenuText()
{
	if (dreamweaver.appVersion && dreamweaver.appVersion.indexOf('zh') != -1) //Chinese versions?
		return dwscripts.sprintf(MENU_strLaunch, dw.getExternalTextEditor());
	else
		return MENU_strLaunch + dw.getExternalTextEditor();
}
