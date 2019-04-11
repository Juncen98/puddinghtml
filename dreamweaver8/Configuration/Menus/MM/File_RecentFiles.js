// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.
function receiveArguments()
{
	var recentFiles = null;
	var i;
	var menuItem = arguments[0];

	i=parseInt(menuItem);
	recentFiles = dw.getRecentFileList();
	dw.openDocument(recentFiles[i], "true");
}

function canAcceptCommand()
{
	var recentFiles = null;
	recentFiles = dw.getRecentFileList();
	return (recentFiles && recentFiles.length > 0 && arguments[0] != 'dummy');
}

function getDynamicContent(itemID)
{
	var recentFiles = null;
	var i = 0;
	var separatorChar = '/';
	var recentFilesList = dw.getRecentFileList();
  
	if (recentFilesList.length > 0)
	{
	  recentFiles = new Array(recentFilesList.length);
		for (i = 0; i < recentFilesList.length; i++)
		{
			recentFiles[i] = new String(recentFilesList[i].substring(recentFilesList[i].lastIndexOf(separatorChar)+1));
			recentFiles[i] += ";id='"+i+"'";

			// if the filename contains an underscore, we need to put a % sign
			// in front of it so that it doesn't get removed.
			recentFiles[i] = recentFiles[i].replace(/_/g,"%_");
		}
	}
	else 
	{
	  recentFiles = new Array(1);
		recentFiles[0] = new String(MENU_RecentFile);
		recentFiles[0] += ";id='dummy'";
	}
	
	// On windows, prefix the items with underscored numbers
	if (navigator.platform == "Win32")
	{
		for (i = 0; i < recentFilesList.length; i++)
		{
			if (i < 9)
				recentFiles[i] = "_"+(i+1)+" " + recentFiles[i];
			else
			{
				// for item 10 and above, underscore the second digit
				// (so "1" uses 1, but "10" uses 0, so the first 10 are all unique)
				var num = i+1;
				recentFiles[i] = ((num - num%10)/10) + "_"+ (num%10) +" " + recentFiles[i];
			}
		}
	}

	return recentFiles;
}
