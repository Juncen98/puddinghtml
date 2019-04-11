// Copyright 2005 Macromedia, Inc. All rights reserved.
// Menu Command API for Edit_Paste.htm

//******************** GLOBALS **************************

//********************** API ****************************
function isDOMRequired()
{
  return false;
}

function receiveArguments()
{
	MM.event.notify('','dw.clipPaste()');
}

function isCommandChecked()
{
	return false;
}

function canAcceptCommand()
{
  return ((dw.getFocus() != 'browser') || (dw.getFocus(true) == 'site')) && dw.canClipPaste();
}

function getDynamicContent(itemID)
{
  var menuName = new Array();
  var fwSource = dw.getClipboardText();
  if (fwSource && isFireworksHTML(fwSource))
	{
		menuName[0] = PASTE_FIREWORKS_HTML ;
	}
	else
	{
		menuName[0] = PASTE;
	}
  menuName[0]  += "\tCmd+V";
  menuName[0]  += ";id='" + "DWMenu_Edit_Paste" + "'";

  return menuName;
}
