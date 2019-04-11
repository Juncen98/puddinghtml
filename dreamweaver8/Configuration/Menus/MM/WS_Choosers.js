// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.
// Menu Command API for SB_Context_ServerModel.htm

//******************** GLOBALS **************************

//********************** API ****************************
function isDOMRequired()
{
  return false;
}

function receiveArguments()
{
  if(arguments[0] == WebServicesChooser)
  {
    // create a dummy wsRec object...
    var wsRec = new Object();
	  MMWS.showWebServicesDialog(MM.LABEL_AddUsingWSDLName, wsRec);
	  dw.serverComponentsPalette.refresh();
  }
  else if(arguments[0] == ProxyChooser)
  {
	  dw.popupCommand("ProxyChooser.htm");
  }
}

function isCommandChecked()
{
	return false;
}

function canAcceptCommand()
{
  if(!dwscripts.IS_WIN)
  {
    return false;
  }
  return true;
}

function getDynamicContent(itemID)
{
  var wsChooserMenu = new Array();

  wsChooserMenu[0] = WebServicesChooser
  wsChooserMenu[0] += ";id='" + WebServicesChooser + "'";

  wsChooserMenu[1] = ProxyChooser
  wsChooserMenu[1] += ";id='" + ProxyChooser + "'";

  return wsChooserMenu;
}

