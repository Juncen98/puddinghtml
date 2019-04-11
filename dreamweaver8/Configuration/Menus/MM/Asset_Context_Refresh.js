// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

   function receiveArguments()
   {
	  // Refresh Site List
		 if (arguments[0] == MENU_Refresh)
		 	dw.assetPalette.refreshSiteAssets();
	  // Recreate Site Cache (equivalent to ctrl-refresh)
		 else if (arguments[0] == MENU_Recreate)
			dw.assetPalette.refreshSiteAssets(true);
	  // New Folder
		 else if (arguments[0] == MENU_NewFolder)
		 	dw.assetPalette.newFolder();
	  // New Item
		else if (arguments[0] == MENU_New)
		 	dw.assetPalette.newAsset();
	  // New from Template
		else if (arguments[0] == MENU_NewFromTemplate)
		{
			var selItems = dw.assetPalette.getSelectedItems();
			
			if (selItems.length < 3)
				return;
			
			for (i=0; i < (selItems.length/3); i++)
			{
			if (selItems[i*3+2] == 'templates')
				{
					dw.newFromTemplate(selItems[i*3+1]);
				}
			}
		}
   }

   function canAcceptCommand()
   {
  	  if (site.getSites().length <= 0)
	  	return false; 
		
      var category = dw.assetPalette.getSelectedCategory();
	  var view = dw.assetPalette.getSelectedView();
	  
	  if (arguments[0] == MENU_NewFromTemplate)
	  {
	  	if (category == 'templates')
			return true;
		else
			return false;
	  }
	  else if ((category == 'templates') || (category == 'library'))
	  {
	    if (arguments[0] == MENU_NewFolder)
		  return false;
		else
	  	  return true;
	  }
   	  else if (arguments[0] == MENU_Refresh ||
			   arguments[0] == MENU_Recreate )
	  {
	      if (view == 'site')
			return true;
		  else 
		  	return false;
	  }
	  else if (arguments[0] == MENU_NewFolder)
	  {
		  if (view == 'favorites')
			return true;
		  else 
		    return false;
	  }
	  else if (arguments[0] == MENU_New)
	  {
		  if ((view == 'favorites') &&
		 	 ((category == 'colors') || (category == 'urls')))
		 	return true;
		  else 
		    return false;
	  }
	  else 
	  {
	    // error, should never happen
//	  	alert('Refresh:canAcceptCommand() got menu id ' + arguments[0]);
		return false;	
	  }
   }

   function getDynamicContent()
   {
		var view = dw.assetPalette.getSelectedView();
		var category = dw.assetPalette.getSelectedCategory();
		var newAsset = "";
		
		if (category == 'templates')
		{
			newAsset = ASSET_NewTemplate;

			var menuItems = new Array(5);
			menuItems[0] = MENU_Refresh + ";id='" + MENU_Refresh + "'";
			menuItems[1] = MENU_Recreate + ";id='" + MENU_Recreate + "'";
			menuItems[2] = "-";
			menuItems[3] = newAsset + ";id='" + MENU_New + "'";
			menuItems[4] = MENU_NewFromTemplate + ";id='" + MENU_NewFromTemplate + "'";
			return menuItems;
		}
		else if (category == 'library')
		{
			newAsset = ASSET_NewLibrary;

			var menuItems = new Array(4);
			menuItems[0] = MENU_Refresh + ";id='" + MENU_Refresh + "'";
			menuItems[1] = MENU_Recreate + ";id='" + MENU_Recreate + "'";
			menuItems[2] = "-";
			menuItems[3] = newAsset + ";id='" + MENU_New + "'";
			return menuItems;
		}
		else if (view == 'site')
		{
			var menuItems = new Array(3);
			menuItems[0] = MENU_Refresh + ";id='" + MENU_Refresh + "'";
			menuItems[1] = MENU_Recreate + ";id='" + MENU_Recreate + "'";
			menuItems[2] = "-";
			return menuItems;
		}
		else// if (view == 'favorites')
		{
			if (category == 'colors')
				newAsset = ASSET_NewColor;
			else if (category == 'urls')
				newAsset = ASSET_NewURL;
			else
				newAsset = MENU_New;

			var menuItems = new Array(2);
			menuItems[0] = MENU_NewFolder + ";id='" + MENU_NewFolder + "'";
			menuItems[1] = newAsset + ";id='" + MENU_New + "'";
			return menuItems;
		}
   }
