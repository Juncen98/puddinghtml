// Copyright 2000, 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

  function canAcceptCommand(){
    var retVal = false;
    if (site.getCurrentSite() != ""){
      retVal = true;
    }
    return retVal;
  }

	function receiveArguments()
	{
		dw.assetPalette.addToFavoritesFromDocument();
   	}

   function setMenuText()
   {
	    var selection = dw.getSelection();
        var node      = dw.offsetsToNode( selection[0], selection[1] );
        var pluginSrc  = node.outerHTML;
		filename = pluginSrc.toLowerCase();
		if (filename.indexOf(".dcr") != -1 || 
			filename.indexOf(".dxr") != -1)
		{
			return MENU_Shockwave;
		} 
		else if (filename.indexOf(".flv") != -1 || 
				   filename.indexOf(".mov") != -1 || 
				   filename.indexOf(".rm") != -1 || 
				   filename.indexOf(".wmv") != -1 || 
				   filename.indexOf(".mpe") != -1 ||
				   filename.indexOf(".mpeg") != -1 ||
				   filename.indexOf(".mpg") != -1)
		{
			return MENU_Movie;
		} 
		else if (filename.indexOf(".swf") != -1 ||
				   filename.indexOf(".spl") != -1)
		{
			return MENU_Flash;
		}
		else
			return MENU_Movie;
  }
