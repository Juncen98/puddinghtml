// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.
//*-------------------------------------------------------------------
// FUNCTION:
//   getIntrospectorList
//
// DESCRIPTION:
//   get the list of available introspectors
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   an array of introspector names(title) 
//--------------------------------------------------------------------

function getIntrospectorList()
{
	//walk thru the introspectors directories.
	//load each introspector and get it's tile.


	var introspectorFolderName = dw.getConfigurationPath() + "/WebServices/Introspectors/";
	var list = DWfile.listFolder(introspectorFolderName,"files");
	var introspectornames = new Array();

	for (var i=0 ; i < list.length ; i++)
	{
		var filename = introspectorFolderName + list[i];

		var extIndex		= filename.lastIndexOf(".");
		if (extIndex != -1)
		{
			var extension = filename.substring(extIndex+1);
			if (extension != "htm")
			{
				continue;
			}
		}

		var filedom = dw.getDocumentDOM(filename);
		if (filedom)
		{
			var titletag = 	filedom.getElementsByTagName("TITLE");
			if (titletag.length)
			{
				var theObject = new Object();
				theObject.name = titletag[0].innerHTML;
				theObject.classname = filedom.parentWindow.getIntrospectorClass();
				theObject.extensions = filedom.parentWindow.getExtensions();
				theObject.serverModels = filedom.parentWindow.getServerModels();
				introspectornames.push(theObject);		
			}
		}
	}

	return introspectornames;
}

