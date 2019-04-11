// Copyright 1999, 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.
//
// Command: Manage Extensions
//
// **************** Commands API *****************
    
function canAcceptCommand()
{
	// First validate that EMLaunch.DLL has been loaded

	if ( typeof( DWEMLaunch ) == "undefined" )
		return( false );
     
	if ( typeof( DWEMLaunch.mayLaunchExtensionHelp ) == "undefined" )
		return( false );

	return DWEMLaunch.mayLaunchExtensionHelp();
}

function extensionHelp()
{
	var rc = DWEMLaunch.launchExtensionHelp();
	return;         
}
