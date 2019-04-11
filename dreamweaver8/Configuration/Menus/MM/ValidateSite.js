// Copyright 2000, 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

function receiveArguments()
{
	site.runValidation(arguments[0]);	// either 'site' or 'selection'
}

function canAcceptCommand()
{
	return (dw.getFocus() != 'browser' && site.getCurrentSite() != '');
}
