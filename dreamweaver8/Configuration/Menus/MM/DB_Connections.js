// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.
// Menu Command API for SB_Context_ServerModel.htm

//******************** GLOBALS **************************
var CONNECTIONS = "/Connections/";

//********************** API ****************************
function isDOMRequired()
{
  return false;
}

function receiveArguments()
{
  MMDB.popupConnection(arguments[0]);
  dw.serverComponentsPalette.refresh();
}

function isCommandChecked()
{
	return false;
}

function canAcceptCommand()
{
	return true;
}

function getDynamicContent(itemID)
{
	//get a list of connectons for the sites' server models.
	var connectionList = new Array();
	var dom = dw.getDocumentDOM();

	if (dom != null && dom.serverModel != null)
	{
		var connDir = dw.getConfigurationPath() + CONNECTIONS + dom.serverModel.getFolderName();
		connDir += (navigator.platform == "Win32") ? "/Win" : "/Mac";

		var fileList = DWfile.listFolder(connDir + "/" + "*.htm","files");
		for (var i=0 ; i < fileList.length; i++)
		{	
			var connectionFileData = DWfile.read(connDir + "/" + fileList[i]);
			var connectionDom	= dw.getDocumentDOM(dw.getConfigurationPath() + '/Shared/MM/Cache/empty.htm');	
			connectionDom.documentElement.outerHTML = connectionFileData;

			//Initialize the uri field
			var titleNode		= connectionDom.getElementsByTagName("title");
			if (titleNode.length)
			{
				if (titleNode[0].innerHTML.length)
				{
					connectionList[i] = titleNode[0].innerHTML;
					connectionList[i] += ";id='" + fileList[i] + "'";
				}
			}
		}
	}

	return connectionList;
}