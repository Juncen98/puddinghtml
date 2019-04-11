// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

	function receiveArguments()
	{
		dw.assetPalette.addToFavoritesFromDocument();
   	}

   function canAcceptCommand()
   {
	    var selection = dw.getSelection();
        var node      = dw.offsetsToNode( selection[0], selection[1] );
		var curNode;
		var isComplexSelection = false;
		var i=0;
		while (node.childNodes[i])
		{
			curNode = node.childNodes[i];
//			alert(curNode.tagName);
			if (curNode.nodeType == Node.ELEMENT_NODE && curNode.tagName != "A" && curNode.tagName != "FONT"
				&& curNode.tagName != "BODY" && curNode.tagName != "TD" && curNode.tagName != "P" 
				&& curNode.tagName != "DIV" && curNode.tagName != "SPAN")
			{
				isComplexSelection = true;
				break;
			}
//			curNode = curNode.childNode;
			i = i+1;
		}

		if (!isComplexSelection && site.getCurrentSite() != "")
			return true;
		else
			return false;
   }
   
   function setMenuText()
   {
	    var selection = dw.getSelection();
        var node      = dw.offsetsToNode( selection[0], selection[1] );
		var curNode;
		var isComplexSelection = false;
		var i=0;
		while (node.childNodes[i])
		{
			curNode = node.childNodes[i];
//			alert(curNode.tagName);
			if (curNode.nodeType == Node.ELEMENT_NODE && curNode.tagName != "A" && curNode.tagName != "FONT"
				&& curNode.tagName != "BODY" && curNode.tagName != "TD" && curNode.tagName != "P" 
				&& curNode.tagName != "DIV" && curNode.tagName != "SPAN")
			{
				isComplexSelection = true;
				break;
			}
//			curNode = curNode.childNode;
			i = i+1;
		}
		// if we're more than just text, return generic and disable it
        if (isComplexSelection)
			return MENU_Generic;
		// if we're a link, return Add to URL Favorites
		else if ((node.nodeType == Node.ELEMENT_NODE && node.tagName == "A") ||
				 (node.parentNode && node.parentNode.nodeType == Node.ELEMENT_NODE 
				  && node.parentNode.tagName == "A") ||
				dw.getDocumentDOM().getLinkHref().length > 0)
		{
			return MENU_URL;
		}
		// if we're just a color, return Add to Color Favorites
		else 
			return MENU_Color;
  }
