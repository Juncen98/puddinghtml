
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
	return "ReflectJava";
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
  extensions.push(".class");
	return extensions;
//	return ".class";
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
	serverModels.push("JSP");
	serverModels.push("UD4 - JSP");
	return serverModels;
}
