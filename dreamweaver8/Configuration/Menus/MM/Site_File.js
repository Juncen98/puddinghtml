// Copyright 2000, 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

	function receiveArguments()
	{		
		var itemID = arguments[0];
		var scope = arguments[1];
		var docPath;

		if (scope == 'site') 
		{
			docPath = "site";
		}
		else if (scope == 'document')
		{
			docPath = dw.getDocumentPath('document');
		}
		else if (scope == 'docSelection')
		{
			if (dw.getDocumentDOM())
			{
				docPath = dw.getDocumentDOM().getSelectionSrc();
			}
			else
			{
				return;
			}
		}

		if (itemID == "unlock")
		{
			if (scope == 'document')
			{
				dw.getDocumentDOM().makeEditable();
			}
			else
			{
				site.makeEditable();
			}
		}
		else if (itemID == "connect")
		{
			site.setConnectionState(!site.getConnectionState());
		}
		else if (itemID == "sethomepage")
		{
			site.setAsHomePage();
		}
		else if (itemID == "put")
		{
			if (site.canPut(docPath))
				site.put(docPath);
		}
		else if (itemID == "get")
		{
			if (site.canGet(docPath))
				site.get(docPath);
		}
		else if (itemID == "checkout")
		{
			if (site.canCheckOut(docPath))
				site.checkOut(docPath);
		}
		else if (itemID == "checkin")
		{
			if (site.canCheckIn(docPath))
				site.checkIn(docPath);
		}
		else if (itemID == "undocheckout")
		{
			if (site.canUndoCheckOut(docPath))
				site.undoCheckOut(docPath);
		}
		else if (itemID == "checkedoutby")
		{
			if (site.canShowCheckedOutBy(docPath))
				site.showCheckedOutBy(docPath);
		}
		else if (itemID == "findlocal")
		{
			site.locateInSite("local", docPath);
		}
		else if (itemID == "findremote")
		{
			site.locateInSite("remote", docPath);
		}
		else if (itemID == "findlocalremote")
		{
			site.locateInSite(site.getFocus(), docPath);
		}
		else if (itemID == "togglemap")
		{
			dw.toggleFloater('site map');
		}
		else if (itemID == "togglehidden")
		{
			site.toggleHiddenFiles();
		}
		else if (itemID == "compare")
		{
			site.compareFiles(docPath)
		}
		else if (itemID == "sync")
		{
			site.synchronize(scope);
		}
		else if (itemID == "selectnewer")
		{
			site.selectNewer(scope);
		}
		else if (itemID == "selectcheckedout")
		{
			site.selectCheckedOutFiles();
		}
		else if (itemID == "open")
		{
			if ((scope != "shortcutkey") || site.canOpen())
				site.open();
		}
		else if (itemID == "refresh")
		{
			site.refresh(scope);
		}
		else if (itemID == "deploysupportfiles")
		{
			site.showTestingServerBinDeployDialog();
		}
		else if (itemID == "newfile")
		{
			if (scope == "shortcut")
			{
				if (dw.getFocus() == 'site')
				{
					if ((site.getFocus() == 'site map') && site.canAddLink())
					{
						site.addLinkToNewFile()
					}
					else if ((site.getFocus() != 'site map') && site.canMakeNewFile())
					{
						site.makeNewDreamweaverFile();
					}
				}
				else
				{
					site.makeNewDreamweaverFile();
				}
			}
			else
			{	
				site.makeNewDreamweaverFile();
			}
		}
		else if (itemID == "newfolder")
		{
			site.makeNewFolder();
		}
		else if (itemID == "definesites")
		{
			site.defineSites();
		}
		else if (itemID == "removeconnectionscripts")
		{
			alert(MMDB.removeConnectionScripts());
		}
		else if (itemID == "reports")
		{
			MM.CheckOutError = 0;
			dw.showReportsDialog();
		}
   }

   function canAcceptCommand()
   {   		
		var itemID = arguments[0];
		var scope = arguments[1];
		var docPath;

		if (scope == 'site') 
		{
			docPath = "site";
		}
		else if (scope == 'document')
		{
			docPath = dw.getDocumentPath('document');
		}
		else if (scope == 'docSelection')
		{
			if (dw.getDocumentDOM())
			{
				docPath = dw.getDocumentDOM().getSelectionSrc();
			}
			else
			{
				return false;
			}
		}

		if (itemID == "unlock")
		{
			if (scope == 'document')
			{
				return dw.getDocumentDOM().canMakeEditable();
			}
			else
			{
				return site.canMakeEditable();
			}
		}
		else if (itemID == "connect")
		{
			return ((scope != 'document') && site.canConnect());
		}
		else if (itemID == "sethomepage")
		{
			if (site.getSelection().length == 1)
			{
				var urlPrefix = "file:///";
				var strTemp = site.getSelection()[0].substr(urlPrefix.length);
				
				if (strTemp.indexOf("/") == (-1))
					return false;
				
				if ((DWfile.getAttributes(site.getSelection()[0]) == null) ||
					(DWfile.getAttributes(site.getSelection()[0]).indexOf('D') == (-1)))
				{
					return true;
				}
			}
			
			return false;
		}
		else if (itemID == "put")
		{
			return site.canPut(docPath);
		}
		else if (itemID == "get")
		{
			return site.canGet(docPath);
		}
		else if (itemID == "checkout")
		{
			return site.canCheckOut(docPath);
		}
		else if (itemID == "checkin")
		{
			return site.canCheckIn(docPath);
		}
		else if (itemID == "undocheckout")
		{
			return site.canUndoCheckOut(docPath);
		}
		else if (itemID == "checkedoutby")
		{
			return site.canShowCheckedOutBy(docPath);
		}
		else if (itemID == "findlocal")
		{
			return site.canLocateInSite("local", docPath);
		}
		else if (itemID == "findremote")
		{
			return site.canLocateInSite("remote", docPath);
		}
		else if (itemID == "findlocalremote")
		{
			return site.canLocateInSite(site.getFocus(), docPath);
		}
		else if (itemID == "compare")
		{
			return site.canCompareFiles(docPath);
		}
		else if (itemID == "sync")
		{
			return site.canSynchronize();
		} 
		else if (itemID == "selectnewer")
		{
			return site.canSelectNewer(scope);
		}
		else if (itemID == "selectcheckedout")
		{
			return site.canSelectCheckedOutFiles();
		}
		else if (itemID == "open")
		{
			return site.canOpen();
		}
		else if (itemID == "refresh")
		{
			if (scope == "local")
			{
				return ((dw.getFocus(true) == 'site') && site.canRefresh('local'));
			}
			else if (scope == "remote")
			{
				return ((dw.getFocus(true) == 'site') && site.canRefresh('remote'));
			}
			else if (scope == "all")
			{
				return (site.canRefresh('local') || site.canRefresh('remote'));
			}
		}
		else if (itemID == "deploysupportfiles")
		{
			return (!site.serverActivity() &&
					((site.getServerModelNameForSite().indexOf('.NET') >= 0) ||
						(((dw.getFocus() == 'document') || (dw.getFocus() == 'textView')) &&
						(dw.getDocumentDOM().serverModel.getServerName().indexOf('.NET') >= 0))));
		}
		else if (itemID == "newfile")
		{
			return site.canMakeNewFile();
		}
		else if (itemID == "newfolder")
		{
			return site.canMakeNewFolder();
		}
		else if (itemID == "removeconnectionscripts")
		{
			return (!site.serverActivity() && (site.getCurrentSite() != ''));
		}
		else if (itemID == "reports")
		{
			return (dw.getFocus() != "browser");
		}
		
		return true;
   }

   function setMenuText()
   {
		var itemID = arguments[0];
		var scope = arguments[1];
 		
 		if (itemID == "connect")
		{
			if (site.getConnectionState() == true)
			{
				return MENU_Disconnect;
			}
			else
			{
				return MENU_Connect;
			}
		}
		else if (itemID == "togglemap")
		{
			if (dw.getFloaterVisibility("site map"))
			{
				return MENU_SiteFiles;
			}
			else
			{
				return MENU_SiteMap;
			}
		}
		else if (itemID == "compare")
		{
			if (scope == "document")
			{
   				if (site.isTestingServerSelected())
   					return MENU_CompareWithTesting;
   				else
   					return MENU_CompareWithRemote;
			}
			else
			{
   				if (site.canCompareFiles(scope))
   				{
   					var numSelectedFiles = site.getSelection().length
   					if (!site.isSiteMode())
   					{
   						return MENU_Compare;
   					}
   					else if (site.getFocus() == 'remote')
   					{
   						if (numSelectedFiles == 2)
   						{
   							if (site.isTestingServerSelected())
   								return MENU_CompareTesting;
   							else
   								return MENU_CompareRemote;
   						}
   						else
   							return MENU_CompareWithLocal;
   					}
   					else
   					{
   						if (numSelectedFiles == 2)
   							return MENU_CompareLocal;
   						else
   						{
   							if (site.isTestingServerSelected())
   								return MENU_CompareWithTesting;
   							else
   								return MENU_CompareWithRemote;
   						}
   					}
   				}
   				else 
   				{
   					if (!site.isSiteMode())
   						return MENU_Compare;
    				else if (site.isTestingServerSelected())
   						return MENU_CompareWithTesting;
   					else
   						return MENU_CompareWithRemote;
  				}
			}
		}
		
		return "";
   }
   
   function isCommandChecked()
   {
		var itemID = arguments[0];
		
  		if (itemID == "togglehidden")
		{
			return site.hiddenFilesShowing();
		}
		
		return false;
   }
   