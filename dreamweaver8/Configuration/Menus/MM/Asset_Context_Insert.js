// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

   function receiveArguments()
   {
   	// insert or apply current selected item(s)
	 	dw.assetPalette.insertOrApply();
		return true;
   }

   function canAcceptCommand()
   {
		return (site.getSites().length > 0) && dw.assetPalette.canInsertOrApply();
   }

   function setMenuText()
   {
   		var category = dw.assetPalette.getSelectedCategory();
   		if (category == 'templates' || category == 'colors')
			return MENU_Apply;
		else if (category == 'urls')
		{
		   var selection = dw.getSelection();
    	   // We have an IP.  Return "Insert"
		   if (selection[0] == selection[1])
			   return MENU_Insert;
		   else 
		   	   return MENU_Apply;
		}
		else
			return MENU_Insert;
   }
