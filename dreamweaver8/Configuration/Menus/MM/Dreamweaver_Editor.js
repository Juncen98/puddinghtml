// Copyright 2000, 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

function receiveArguments()
{
	var fileList = site.getSelection();
	for (i=0; i < fileList.length; i++)
	{
		var fileName = fileList[i];
		
		// skip files we know we can't open (images,folders,etc...)
		if ( fileName.match( /[.]jpg$/i ) || fileName.match( /[.]jpeg$/i ) || fileName.match( /[.]gif$/i ) || fileName.match( /[.]png$/i ) )
			continue;
		if (DWfile.getAttributes(fileName) == "D")
			continue;
			
		dw.openDocument(fileName);
	}
	return true;
}

function canAcceptCommand()
{
	var fileList = site.getSelection();
	for (i=0; i < fileList.length; i++)
	{
		var fileName = fileList[i];
		
		// skip files we know we can't open (images,folders,etc...)
		if ( fileName.match( /[.]jpg$/i ) || fileName.match( /[.]jpeg$/i ) || fileName.match( /[.]gif$/i ) || fileName.match( /[.]png$/i ) )
			continue;
		if (DWfile.getAttributes(fileName) == "D")
			continue;
			
		return true;
	}
	return false; // havn't found anything we can open...
}
