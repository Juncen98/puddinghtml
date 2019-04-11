// Copyright 2001 Macromedia, Inc. All rights reserved.

//*************************API**************************

//*************** GLOBALS VARS *****************

var helpDoc         = MM.HELP_ssServerModelList;


<!--Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.-->

function commandButtons()
{
  return new Array(MM.BTN_OK,     "okClicked()",
    MM.BTN_Cancel,"cancelClicked()",
    MM.BTN_Help,"displayHelp()");
}



//*******************LOCAL FUNCTIONS*********************

function initializeUI()
{

  var path = dw.getConfigurationPath() + "/ServerModels";
  var urlArray = DWfile.listFolder(path, "files");
  var selServerName = dw.getDocumentDOM().serverModel.getDisplayName();
  var dom, i, titleTags, serverNames, serverName, optionArr;

  // Get the list of server models by iterating through files in
  // the Configuration/ServerModels folder.
  // From this list, produce a list of Server Names, for use
  // in this dialog.
  serverNames = new Array();
  for (i = 0; i < urlArray.length; i++)
  {
    dom = dw.getDocumentDOM(path + "/" + urlArray[i]);
    if (dom && dom.parentWindow.getServerModelDisplayName != null)
    {
      serverInfo = dom.parentWindow.getServerModelDisplayName();
      if (serverInfo)
      {
        for (var j=0; j < serverNames.length; j++)
        {
          if (serverInfo== serverNames[j]) break;
        }
        if (j >= serverNames.length)
        {
          serverNames.push(serverInfo);
        }
      }
    }
  }

  serverNames = serverNames.sort();
  // Populate the drop-down menu with all the server models and "None"
  optionArr = new Array();
  for (i = 0; i < serverNames.length; i++)
  {
    serverName = serverNames[i];

    optionArr.push("<option value=\"");
    optionArr.push(serverName);
    optionArr.push("\"");

    // Select the currently active server model
    if (serverName == selServerName)
      optionArr.push(" selected");

    optionArr.push(">");
    optionArr.push(serverName);
    optionArr.push("</option>");
  }

  document.theForm.serverModels.innerHTML = optionArr.join("");

}

function cancelClicked()
{
  MM.commandReturnValue = "";
  window.close();
}

function okClicked()
{
  var retArr = new Array();
  var selectedList = document.theForm.serverModels;

  if ( selectedList.selectedIndex == -1 )
  {
    retArr = ""
  }
  else
  {
    var i;

    for (i=0;i<selectedList.options.length;i++)
    {
      if (selectedList.options[i].selected == true)
      {
        retArr.push(selectedList.options[i].text);
      }
    }
  }

  MM.commandReturnValue = retArr;
  window.close();
}
