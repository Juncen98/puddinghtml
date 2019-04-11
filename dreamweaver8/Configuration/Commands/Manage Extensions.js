// Copyright 2002, 2003 Macromedia, Inc. All rights reserved.
//
// Command: Manage Exchange Packages
//
// **************** Commands API *****************
    
function canAcceptCommand()
{
	// First validate that DWEMLaunch.DLL has been loaded

	if ( typeof( DWEMLaunch ) == "undefined" )
		return( false );
		
	if (typeof(DWEMLaunch.mayLaunchExtensionManager) == "undefined")
		return ( false );

	return DWEMLaunch.mayLaunchExtensionManager();
}

function manageExtensions()
{
	return DWEMLaunch.launchExtensionManager(dw.appName);
}
