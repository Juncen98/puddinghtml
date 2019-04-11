// Copyright 2000, 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

	function receiveArguments()
	{
		var currSite = site.getCurrentSite();
		if(currSite.length == 0)
			site.tryDefineOrEditSite("add favorites");
		else
			dw.assetPalette.addToFavoritesFromSiteWindow();
   	}

	function isLegalURL(str)
	{
		var bRet = false;
		
		if (!DWfile.exists(str) && str.lastIndexOf(":/") > 0)
		{
			bRet = true;

			//  This MIGHT be a legal URL.  However, we only allow
			//  file:// URLs if your focus in the site map.

			if ((site.getFocus() != "site map") && (str.indexOf("file:/") == 0))
			{
				bRet = false;
			}
		}

		return bRet;
	}

   function canAcceptCommand()
   {
   		var selItems  = site.getSelection();
		if (selItems.length == 0)
			return false;

		var currSite = site.getCurrentSite();
		var enableIt = false;		
		for (i=0; i < selItems.length; i++)
		{
			if ((currSite.length > 0) && (site.getSiteForURL(selItems[i]) != currSite && (site.getFocus() != "site map")))
			{
				enableIt = false;
				break;
			}

			//  Look for URLs.  These are selections that aren't files and have
			//  something like http:// or ftp:// or gopher:// and so on.

			if (isLegalURL(selItems[i]))
				enableIt = true;

			//  Look for non-directories that have file extensions that we can handle.

			else if (DWfile.getAttributes(selItems[i]) != "D")
			{
				filename = selItems[i].toLowerCase();
				if ((filename.lastIndexOf(".gif") > 0) ||
					(filename.lastIndexOf(".jpe") > 0) ||
					(filename.lastIndexOf(".jpg") > 0) ||
					(filename.lastIndexOf(".jpeg") > 0) ||
					(filename.lastIndexOf(".png") > 0) ||
					(filename.lastIndexOf(".dcr") > 0) ||
					(filename.lastIndexOf(".dxr") > 0) ||
					(filename.lastIndexOf(".swf") > 0) ||
					(filename.lastIndexOf(".spl") > 0) ||
					(filename.lastIndexOf(".flv") > 0) ||
					(filename.lastIndexOf(".mov") > 0) ||
					(filename.lastIndexOf(".rm") > 0) ||
					(filename.lastIndexOf(".wmv") > 0) ||
					(filename.lastIndexOf(".mpe") > 0) ||
					(filename.lastIndexOf(".mpg") > 0) ||
					(filename.lastIndexOf(".mpeg") > 0) ||
					(filename.lastIndexOf(".js") > 0) ||
					(filename.lastIndexOf(".vbs") > 0))
				{
					enableIt = true;
				}
			}
		}
		return enableIt;
   }

   function setMenuText()
   {
   		var selItems  = site.getSelection();
		if (selItems.length == 0)
			return MENU_Generic;

		var isImage = false;
		var isShockwave = false;
		var isFlash = false;
		var isMovie = false;
		var isScript = false;
		var isURL = false;
		for (i=0; i < selItems.length; i++)
		{
			if (isLegalURL(selItems[i]))
			{
				isURL = true;
			}
	 		else if (DWfile.getAttributes(selItems[i]) != "D")
			{
				filename = selItems[i].toLowerCase();
				if ((filename.lastIndexOf(".gif") > 0) ||
					(filename.lastIndexOf(".png") > 0) ||
					(filename.lastIndexOf(".jpe") > 0) ||
					(filename.lastIndexOf(".jpg") > 0) ||
					(filename.lastIndexOf(".jpeg") > 0))
				{
					isImage = true;
				}
				if ((filename.lastIndexOf(".dcr") > 0) ||
					(filename.lastIndexOf(".dxr") > 0))
				{
					isShockwave = true;
				}
				if ((filename.lastIndexOf(".swf") > 0) ||
					(filename.lastIndexOf(".spl") > 0))
				{
					isFlash = true;
				}
				if ((filename.lastIndexOf(".flv") > 0) ||
					(filename.lastIndexOf(".mov") > 0) ||
					(filename.lastIndexOf(".rm") > 0) ||
					(filename.lastIndexOf(".wmv") > 0) ||
					(filename.lastIndexOf(".mpe") > 0) ||
					(filename.lastIndexOf(".mpg") > 0) ||
					(filename.lastIndexOf(".mpeg") > 0))
				{
					isMovie = true;
				}
				if ((filename.lastIndexOf(".js") > 0) ||
					(filename.lastIndexOf(".vbs") > 0))
				{
					isScript = true;
				}
			}
		}

		if (isImage && !isShockwave && !isFlash && !isMovie && !isScript && !isURL)
			return MENU_Image;
		else if (!isImage && isShockwave && !isFlash && !isMovie && !isScript && !isURL)
			return MENU_Shockwave;
		else if (!isImage && !isShockwave && isFlash && !isMovie && !isScript && !isURL)
			return MENU_Flash;
		else if (!isImage && !isShockwave && !isFlash && isMovie && !isScript && !isURL)
			return MENU_Movie;
		else if (!isImage && !isShockwave && !isFlash && !isMovie && isScript && !isURL)
			return MENU_Script;
		else if (!isImage && !isShockwave && !isFlash && !isMovie && !isScript && isURL)
			return MENU_URL;
		else
			return MENU_Generic;
  }
