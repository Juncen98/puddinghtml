// Copyright 2000, 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

function isDOMRequired()
{
	return false;
}

function receiveArguments()
{
	dw.setHideAllFloaters(!dw.getHideAllFloaters());
}

function canAcceptCommand()
{
	// we only enable the Hide Floaters menu item if at least one floater is available.
	if (!dw.getHideAllFloaters())
		return dw.getFloatersVisible();
	else
		return true;
}

// setMenuText is called by Dreamweaver to set the text of
// a menu item. We do this when our menu item is dynamic
// only in that the text changes, rather than having to
// write a full-blown dynamic menu.
function setMenuText()
{
	if (!dw.getHideAllFloaters())
		return MENU_HideFloatingPalettes;
	else
		return MENU_ShowFloatingPalettes;
}
