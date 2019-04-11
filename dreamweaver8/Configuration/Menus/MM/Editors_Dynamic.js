// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

	function receiveArguments()
	{
		var editorURL="";
		var menuItem = arguments[0];

		for (i=0; i < dw.constructor.gMenuIDs.length-1; i++)
		{
			if (menuItem == dw.constructor.gMenuIDs[i])
				editorURL = dw.constructor.gExternalEditors[i*2 + 1];		
		}

		if (editorURL != "")
		{
			dw.openWithApp(site.getSelection(), editorURL);
			return true;
		}
		else
		{
			dw.openWithBrowseDialog(site.getSelection());
			return true;
		}
	}

	function canAcceptCommand()
	{
		var selItems = site.getSelection();
		var siteName = site.getCurrentSite();
		if (selItems.length > 1 || selItems.length == 0 || (siteName != "" && !DWfile.exists(selItems[0])))
			return false;
		else
			return (DWfile.getAttributes(selItems[0]) != "D");
	}

   function getDynamicContent()
   {
	  var selItems = site.getSelection();
	  if (selItems.length > 1 || selItems.length == 0)
	     return "";

	// get the primary external editor for the selected item	
	  var primaryEditorArray = dw.getPrimaryExtensionEditor(selItems[0]);
	  if (primaryEditorArray.length == 1)
	  {
	  	dw.constructor.gPrimaryEditorName = "";
	  	dw.constructor.gPrimaryEditorURL = "";
	  }
	  else
	  {
	  	dw.constructor.gPrimaryEditorName = primaryEditorArray[0];
	  	dw.constructor.gPrimaryEditorURL = primaryEditorArray[1];
	  }
	// get the external editors for the selected item	
	  var externalEditorArray = dw.getExtensionEditorList(selItems[0]);
	  if (externalEditorArray.length <= 1)
	  	dw.constructor.gExternalEditors = new Array("");	  
	  else if (externalEditorArray.length == 2 && dw.constructor.gPrimaryEditorName != "")
	  	dw.constructor.gExternalEditors = new Array("");
	  else
	  {
	    dw.constructor.gExternalEditors = new Array(externalEditorArray.length-2);
		var index=0;
	  	for (i=0; i < externalEditorArray.length; i++)
	  	{
			// don't add the primary editor to the list of editors
		    if (externalEditorArray[i+1] == dw.constructor.gPrimaryEditorURL)
			   i++;
			else
				dw.constructor.gExternalEditors[index++] = externalEditorArray[i];
	  	}
	  }
	  
	// put the names of the editors in the menu
	  var menuItems;
	  var i;
	  if (dw.constructor.gExternalEditors.length == 1)
	  {
	    // we should have pairs... if we don't then just add Browse... to the list
		menuItems = new Array(1);
		dw.constructor.gMenuIDs = new Array(1);
		i=0;
	  }
	  else
	  {
	  	// we have pairs of editor names and editor paths
		// put the names in the menu and remember the paths
		menuItems = new Array(dw.constructor.gExternalEditors.length/2 + 1);
	    dw.constructor.gMenuIDs = new Array(dw.constructor.gExternalEditors.length/2 + 1);
		for (i=0; i < dw.constructor.gExternalEditors.length/2; i++)
		{
			// add non-primary editors to the list of editors
			dw.constructor.gMenuIDs[i] = "Editor" + i;
			menuItems[i] = dw.constructor.gExternalEditors[i*2] + ";id='" + escQuotes(dw.constructor.gMenuIDs[i]) + "'";
		}
	  }
      
	  // always add Browse... to the bottom of the list
	  dw.constructor.gMenuIDs[i] = "ExtEd:Browse";
	  menuItems[i] = MENU_Browse + ";id='" + escQuotes(dw.constructor.gMenuIDs[i]) + "'";

	  return menuItems;
   }
