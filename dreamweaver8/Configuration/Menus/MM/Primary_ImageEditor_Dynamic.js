// Copyright 2000, 2001, 2002, 2003, 2004, 2005 Macromedia,	Inc. All rights	reserved.

function	receiveArguments()
{
	var selection	= dw.getSelection();
	var node		= dw.offsetsToNode(	selection[0], selection[1] );
	var imageSrc	= node.getAttribute( "src" );
	var fullPath	= getFullPath(imageSrc);

	if ( fullPath	&&
		( fullPath.match( /[.]jpg$/i )	||
		  fullPath.match( /[.]jpeg$/i ) ||	
		  fullPath.match( /[.]gif$/i )	||
		  fullPath.match( /[.]png$/i )	)
		)
	{
		dw.fireworksCheckout( fullPath );
	}

	if (fullPath == "" && dw.constructor.gPlaceholderEditorURL != "")
		dw.openWithImageEditor(fullPath, dw.constructor.gPlaceholderEditorURL);
	else if (dw.constructor.gPrimaryEditorURL	!= "")
		dw.openWithImageEditor(fullPath, dw.constructor.gPrimaryEditorURL);
	return true;
}

function	canAcceptCommand()
{
	var	selection	= dw.getSelection();
	var node		= dw.offsetsToNode(	selection[0], selection[1] );
	var imageSrc	= node.getAttribute( "src" );

	var	bFW6installed = false;
	if (dw.appName.match( /dreamweaver/i ) )
		bFW6installed = FWLaunch.validateFireworks(6.0);

	// check for placeholder first
	if (!imageSrc && bFW6installed)
		return true;

	if (selection && node && imageSrc)
	{
		var primaryEditorArray = dw.getPrimaryExtensionEditor(imageSrc);
		if (primaryEditorArray.length >	1)
			return true;
		else
			return false;
	}
	else
		return false;
}

function	setMenuText()
{
	var	selection	= dw.getSelection();
	var node		= dw.offsetsToNode(	selection[0], selection[1] );
	var imageSrc	= node.getAttribute( "src" );
	var	fullPath	= getFullPath(imageSrc);

	// check if we are editing a image placeholder
	if (!imageSrc)
	{
		var	bFW6installed = false;
		if (dw.appName.match( /dreamweaver/i ) )
			bFW6installed = FWLaunch.validateFireworks(6.0);

		if (bFW6installed)
		{
			var placeholderArray = dw.getFireworksPath();
			dw.constructor.gPlaceholderEditorName = placeholderArray[0];
			dw.constructor.gPlaceholderEditorURL = placeholderArray[1];
			return MENU_CreateImageIn + " " + placeholderArray[0];
		}
	}

	// get the primary external editor for the selected item
	var	primaryEditorArray = dw.getPrimaryExtensionEditor(fullPath);
	if (primaryEditorArray.length == 1)
		return MENU_EditImage;
	else
	{
		dw.constructor.gPrimaryEditorName = primaryEditorArray[0];
		dw.constructor.gPrimaryEditorURL = primaryEditorArray[1];
		return MENU_EditWith + " " + primaryEditorArray[0];
	}
}

