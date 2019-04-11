// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

//*************** GLOBALS VARS *****************

var WEBSERVICE_ENUM_FILENAME = "Components/Common/WebServicesEnum.gif";
var WEBSERVICE_OBJECT_FILENAME = "Components/Common/WebServicesObject.gif";

//*-------------------------------------------------------------------
// FUNCTION:
//  isProxyClass
//
// DESCRIPTION:
//  Checks if the class inherits from a Web Service class or not and
//  returns true or false accordingly 
//
// ARGUMENTS:
//   classDescriptor: the description of the class
//	
// RETURNS:
//  boolean
//--------------------------------------------------------------------

function isProxyClass(classDescriptor)
{
  var isProxyClass = false;
  var superClass;
  
  if(classDescriptor && classDescriptor.superclass)
  {
    superClass = classDescriptor.superclass;  
    if(superClass == "java.lang.Object")
      isProxyClass = true; 
  }
  
  return isProxyClass;
}

//*-------------------------------------------------------------------
// FUNCTION:
//  isProxyClass
//
// DESCRIPTION:
//  returns information about the class from the descriptor 
//
// ARGUMENTS:
//
//   classDescriptor: the description of the class
//	
// RETURNS:
//  classInfo : an array that contains the information about
//  the Class
//--------------------------------------------------------------------

function getClassInfo(classDescriptor)
{
  var classInfo = new Array();
  var theObject = new Object();
  if (classDescriptor && classDescriptor.superclass)
  {
    if (classDescriptor.superclass == "java.lang.Object")
    {
      theObject.type = "Class";
      theObject.image = WEBSERVICE_OBJECT_FILENAME;
      classInfo.push(theObject);      
    }
  }
  return classInfo;
}

function needsSDKInstalled()
{
	return false;
}

function isSDKInstalled()
{
	return true;
}
