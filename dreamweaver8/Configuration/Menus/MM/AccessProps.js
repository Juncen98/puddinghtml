// Copyright 2005 Macromedia, Inc. All rights reserved.

function canAcceptCommand()
{
	var numSelected = site.getSelection().length;
	var localInFocus = (site.getFocus() == "local");
	if (localInFocus)
	{
		//see if a siteless server file is selected
		var fileList = site.getSelection();
		var serverPrefix = "file:///%%SERVER%%";
		for (i = 0; i < numSelected; i++)
		{
			var nextFile = fileList[i];
      		if (nextFile.indexOf(serverPrefix) == 0)
				return true;
		}
		return false;
	}
	else
	{
		var remoteInFocus = (site.getFocus() == "remote");
		var remoteFileSelected = (remoteInFocus && (numSelected > 0));
		return remoteFileSelected;
	}
}

//******************* API ********************** 
function commandButtons()
{ 
	return new Array(MM.BTN_OK, "okClicked()", MM.BTN_Cancel, "cancelClicked()"); 
} 

function calculateValue()
{
	var total = 0;
	
	//read permissions checked by user and calculate corresponding
	//number to send to the FTP server to let it know what the
	//file's permissions should be
	if (document.OwnerRead.checked) total += 400;
	if (document.OwnerWrite.checked) total += 200;
	if (document.OwnerExecute.checked) total += 100;
	if (document.UserRead.checked) total += 40;
	if (document.UserWrite.checked) total += 20;
	if (document.UserExecute.checked) total += 10; 
	if (document.EveryRead.checked) total += 4;
	if (document.EveryWrite.checked) total += 2;
	if (document.EveryExecute.checked) total += 1;

	document.Permissions.value = total;
}

function valueChanged(checkValue)
{
	var total = document.Permissions.value;
	if (checkValue && ((total < 0) || (total > 777)))
	{
		alert(MSG_BadValue);
		document.Permissions.focus(); //set focus on textbox
		document.Permissions.select(); //set insertion point into textbox
		return false;
	}
	if (total >= 400)
	{
		total -= 400;
		document.OwnerRead.checked = true;
	}
	else
		document.OwnerRead.checked = false;

	if (total >= 200)
	{
		total -= 200;
		document.OwnerWrite.checked = true;
	}
	else
		document.OwnerWrite.checked = false;

	if (total >= 100)
	{
		total -= 100;
		document.OwnerExecute.checked = true;
	}
	else
		document.OwnerExecute.checked = false;

	if (total >= 40)
	{
		total -= 40;
		document.UserRead.checked = true;
	}
	else
		document.UserRead.checked = false;

	if (total >= 20)
	{
		total -= 20;
		document.UserWrite.checked = true;
	}
	else
		document.UserWrite.checked = false;

	if (total >= 10)
	{
		total -= 10;
		document.UserExecute.checked = true;
	}
	else
		document.UserExecute.checked = false;

	if (total >= 4)
	{
		total -= 4;
		document.EveryRead.checked = true;
	}
	else
		document.EveryRead.checked = false;

	if (total >= 2)
	{
		total -= 2;
		document.EveryWrite.checked = true;
	}
	else
		document.EveryWrite.checked = false;

	if (total >= 1)
		document.EveryExecute.checked = true;
	else
		document.EveryExecute.checked = false;

	return true;
}


function setPermissions(buttonClicked)
{	
	switch (buttonClicked){
		case "AllRead":
			document.OwnerRead.checked = true;
			document.UserRead.checked = true;
			document.EveryRead.checked = true;
			break;
	
		case "AllWrite":
			document.OwnerWrite.checked = true;
			document.UserWrite.checked = true;
			document.EveryWrite.checked = true;
			break;
		
		case "AllExecute":
			document.OwnerExecute.checked = true;
			document.UserExecute.checked = true;
			document.EveryExecute.checked = true;
			break;
	}

	calculateValue();
}

function finishUp(numSelected, numSucceeded, numFailed)
{
	if (numSelected > 1 || numSucceeded == 1)
	{
		if (numFailed == 0)
			; //alert(okMsg);
		else if (numSucceeded == 0)
			alert(MSG_NoneSet);
		else
			alert(MSG_SomeNotSet);
	}
	window.close();
}

function okClicked() 
{ 
	var total = document.Permissions.value;
	var sendError = 0;
	var remoteDirectory = site.getRemoteRoot();
	if (remoteDirectory == "" || remoteDirectory[remoteDirectory.length-1] != "/")
		remoteDirectory += "/";
	
	if (!valueChanged(true))
		return;

	var localInFocus = (site.getFocus() == "local");
	var remoteFileList;

	if (localInFocus)
		remoteFileList = site.getSelection();
	else
	{
		//make sure we're connected
		site.setConnectionState(true);
		site.setFocus("remote");
		
		//iterate through each file/folder in the selection
		//and set the access permissions for each
		remoteFileList = site.getRemoteSelection();
	}

	var numSelected = remoteFileList.length;
	var numSucceeded = 0;
	var numFailed = 0;
 	for (i=0; i<numSelected; i++)
	{
		var thisFile = remoteFileList[i];
		if (localInFocus)
      		thisFile = site.getRelativeRemotePathFromSFEPath(thisFile);

		sendError = site.setPermissions(remoteDirectory + thisFile, total);

		//we only support FTP servers that have already had a connection established
		if (typeof sendError == 'undefined')
		{
			alert(MSG_NotFTPSite);
			window.close();
			return;
		}
		else if (sendError >= 400)
		{
			//an error occurred, let user cancel out of this process
			numFailed++;
			if (i == numSelected-1)
			{
				alert(MSG_AccessPropsFailed+thisFile+MSG_CheckLogStr);
				finishUp(numSelected, numSucceeded, numFailed);
				return;
			}
			else
			{
				if (!confirm(MSG_AccessPropsFailed+thisFile+MSG_CheckLogStr))
				{
					finishUp(numSelected, numSucceeded, numFailed);
					return;
				}
			}
		}
		else
			numSucceeded++;
	}
	finishUp(numSelected, numSucceeded, numFailed);
}

function cancelClicked()
{
	window.close();
}

function initializeUI()
// populate dialog attributes if defined
{
	var curPermissions = 0;
	var remoteFileList = site.getSelection();
	var numSelected = remoteFileList.length;

	//display current permissions in dialog if only 1 item is selected
	if( numSelected == 1 )
		curPermissions = site.getPermissions('site');
	
	if (curPermissions <= 777)
		document.Permissions.value = curPermissions;
	else //invalid permission
		document.Permissions.value = 0;

	valueChanged(false);
}
