// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

   function receiveArguments()
   {
	  // Rename or edit the nickname of the currently selected item
		 if ((arguments[0] == MENU_Rename) || (arguments[0] == MENU_Nickname))
		 	dw.assetPalette.renameNickname();
	  // Update Current Page
		 else if (arguments[0] == MENU_UpdatePage)
		 	dw.getDocumentDOM().updateCurrentPage()
	  // Update Site
		else if (arguments[0] == MENU_UpdateSite)
		{
			if (dw.assetPalette.getSelectedCategory() == 'templates')
			 	dw.updatePages('template');
			else
				dw.updatePages('library');
		}
	  // Add item(s) to the Favorites list 
		else if (arguments[0] == MENU_AddToFavorites)
		 	dw.assetPalette.addToFavoritesFromSiteAssets();
	  // Remove Item(s) from the Favorites list
		else if (arguments[0] == MENU_RemoveFromFavorites || arguments[0] == MENU_Delete)
		 	dw.assetPalette.removeFromFavorites();
   }

   function canAcceptCommand()
   {
  	  if (site.getSites().length <= 0)
	  	return false; 
		
      var category = dw.assetPalette.getSelectedCategory();
	  var view = dw.assetPalette.getSelectedView();
	  
	  if (arguments[0] == MENU_Rename)
	  {
	  	if ((category == 'templates') || (category == 'library'))
			return true;
		else
			return false;
	  }
	  else if (arguments[0] == MENU_Nickname)
	  {
	  	if (view == 'favorites')
			return true;
		else
			return false;
	  }
	  else if (arguments[0] == MENU_AddToFavorites)
	  {
	  	if (view == 'site')
			return true;
		else
			return false;
	  }
	  else if (arguments[0] == MENU_RemoveFromFavorites)
	  {
	  	if (view == 'favorites')
			return true;
		else
			return false;
	  }
	  else if (arguments[0] == MENU_Delete)
	  {
	  	if (category == 'templates' || category == 'library')
			return true;
		else
			return false;
	  }
	  else if (arguments[0] == MENU_UpdatePage)
	  {
	  	if (((category == 'templates') || (category == 'library')) && 
		    // sn 6/11/01: removing the getIsTemplateDocument check,
			// to support nested templates.
			(dw.getDocumentDOM() != null /*&& !dw.getDocumentDOM().getIsTemplateDocument()*/))
			return true;
		else
			return false;
	  }
	  else if (arguments[0] == MENU_UpdateSite)
	  {
	  	if ((category == 'templates') || (category == 'library'))
			return true;
		else
			return false;
	  }
	  else
	  {
	  	alert ("Nickname:canAcceptCommand() got menu id ", + arguments[0]);
	  	return false;
	  }
   }

   function getDynamicContent()
   {
		var view = dw.assetPalette.getSelectedView();
		var category = dw.assetPalette.getSelectedCategory();
		
		if ((category == 'templates') || (category == 'library'))
		{
			var menuItems = new Array(4);
			menuItems[0] = MENU_Rename + ";id='" + MENU_Rename + "'";;
			menuItems[1] = MENU_Delete + ";id='" + MENU_Delete + "'";;
			menuItems[2] = MENU_UpdatePage + ";id='" + MENU_UpdatePage + "'";
			menuItems[3] = MENU_UpdateSite + ";id='" + MENU_UpdateSite + "'";
			return menuItems;
		}
		else if (view == 'site')
		{
			var menuItems = new Array(1);
			menuItems[0] = MENU_AddToFavorites + ";id='" + MENU_AddToFavorites + "'";
		    return menuItems;
		}
		else //if (view == 'favorites')
		{
			var menuItems = new Array(2);
			menuItems[0] = MENU_Nickname + ";id='" + MENU_Nickname + "'";
			menuItems[1] = MENU_RemoveFromFavorites + ";id='" + MENU_RemoveFromFavorites + "'";
		    return menuItems;
		}
   }
