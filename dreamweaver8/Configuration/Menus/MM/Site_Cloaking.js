// Copyright 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

	function receiveArguments()
	{
		var itemID = arguments[0];
		var docPath = dw.getDocumentPath('document');
		
		if (itemID == "enable")
		{
			site.setCloakingEnabled( site.getCloakingEnabled() ? false : true );
		}
		if (itemID == "uncloakall")
		{
			site.uncloakAll(docPath);
		}
		if (itemID == "uncloak")
		{
			if (dw.getFocus(true) == 'site')
				site.uncloak("site");
			else
				site.uncloak(docPath);
		}
		if (itemID == "cloak")
		{
			if (dw.getFocus(true) == 'site')
				site.cloak("site");
			else
				site.cloak(docPath);
		}
   }

   function canAcceptCommand()
   {
		var itemID = arguments[0];
		var docPath = dw.getDocumentPath('document');
		
		if (itemID == "cloak")
		{
			if (dw.getFocus(true) == 'site')
				return site.canCloak("site");
			else
				return site.canCloak(docPath);
		}
		if (itemID == "uncloak")
		{
			if (dw.getFocus(true) == 'site')
				return site.canUncloak("site");
			else
				return site.canUncloak(docPath);
		}
		if (itemID == "uncloakall")
		{
			return (site.getCloakingEnabled() && !site.serverActivity());
		}
		if (itemID == "enable")
		{
			return (site.getCurrentSite().length > 0);
		}
		
		return true;
   }

   function isCommandChecked()
   {
		var itemID = arguments[0];
		if( itemID == "enable" )
     		return (site.getCloakingEnabled());
     	else
     		return false;
   }
