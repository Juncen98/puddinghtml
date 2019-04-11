// Copyright 2000, 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

function receiveArguments()
{
	var itemID = arguments[0];

	if (itemID == "paste")
	{
		dw.clipPaste();
	}
	else if (itemID == "duplicate")
	{
		dw.clipCopy();
		dw.clipPaste();
	}
	else if (itemID == "delete")
	{
		dw.deleteSelection();
	}
}

function canAcceptCommand()
{
	var itemID = arguments[0];

	if (itemID == "paste")
	{
		return dw.canClipPaste();
	}
	else if (itemID == "duplicate")
	{
		return (dw.canClipCopy() && ((site.getFocus() != 'remote') || !site.serverActivity()));
	}
	else if (itemID == "delete")
	{
		return (dw.canDeleteSelection() && ((site.getFocus() != 'remote') || !site.serverActivity()));
	}

	return true;
}

