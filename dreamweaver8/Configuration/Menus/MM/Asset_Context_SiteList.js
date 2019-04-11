// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

   var gCurrentSite;
   
   function receiveArguments()
   {
		if (arguments[0] != gCurrentSite)
			dw.assetPalette.copyToSite(arguments[0]);
   }

   function canAcceptCommand()
   {
		// can't copy to a site if there are no sites
		if (site.getSites().length <= 0)
			return false;	// disable all if we have no sites (shouldn't get here ever)
		else if (arguments[0] == gCurrentSite)
			return false;	// disable the current site
		else
			return true;	// enable all other sites
   }

   function getDynamicContent()
   {
		var sites = null;
		sites = new Array();
		var siteList = site.getSites();
		var i;

		gCurrentSite = "";
		if (siteList.length > 0)
		{
			var curDocSiteRoot = dw.getSiteRoot();	// gets us the site root of the current doc
			for (i=0; i<siteList.length; i++)
			{
				if (site.getLocalRootURL(siteList[i]) == curDocSiteRoot)
					gCurrentSite = siteList[i];

				sites[i] = new String(siteList[i]);
				
				// Don't escape the quotes, as all Menu items will be escapted by default.
				// sites[i] += ";id='"+escQuotes(siteList[i])+"'"; // site names must be unique, so we'll use them for IDs.

				sites[i] += ";id='"+siteList[i]+"'"; // site names must be unique, so we'll use them for IDs.
			}
		}
		return sites;
	}
