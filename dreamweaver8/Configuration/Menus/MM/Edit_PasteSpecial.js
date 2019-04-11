// Copyright 2005 Macromedia, Inc. All rights reserved.
// Menu Command API for Edit_PasteSpecial.htm

//******************** GLOBALS **************************

//********************** API ****************************
function isDOMRequired()
{
  return false;
}

function receiveArguments()
{
	dw.showPasteSpecialDialog();
}

function isCommandChecked()
{
	return false;
}

function canAcceptCommand()
{
  var weHaveFireworksHTML = false;
  var fwSource = dw.getClipboardText();
  if (fwSource && isFireworksHTML(fwSource))
  {
	  weHaveFireworksHTML = true;
  }
  return (dw.canPasteSpecial() && !weHaveFireworksHTML);
}
