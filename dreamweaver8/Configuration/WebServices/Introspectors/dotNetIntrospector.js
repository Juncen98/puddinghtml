// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.
var DEBUG = false;

//*************** GLOBALS VARS *****************

//*******************  INTROSPECTION GENERATION API **********************
//*-------------------------------------------------------------------
// FUNCTION:
//   getIntrospectorClass
//
// DESCRIPTION:
//
// ARGUMENTS:
//	
// RETURNS:
//   the name of extension dll to invoke.
//
//--------------------------------------------------------------------
function getIntrospectorClass()
{
	return "ReflectDotNet";
}

//*-------------------------------------------------------------------
// FUNCTION:
//   getExtensions
//
// DESCRIPTION:
//
// ARGUMENTS:
//	
// RETURNS:
//   an array of the extensions that the class can introspect.
//
//--------------------------------------------------------------------
function getExtensions()
{
  var extensions = new Array();
  extensions.push(".dll");
  extensions.push(".exe");
	return extensions;
//	return ".dll";
}


//*-------------------------------------------------------------------
// FUNCTION:
//   getServerModels
//
// DESCRIPTION:
//
// ARGUMENTS:
//	
// RETURNS:
//   returns the list of server models.
//
//--------------------------------------------------------------------
function getServerModels()
{
	var serverModels = new Array();
	serverModels.push("ASP.NET C#");
	serverModels.push("ASP.NET VB");
	return serverModels;
}
