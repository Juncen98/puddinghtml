// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

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
//
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
    if(superClass == "System.Web.Services.Protocols.SoapHttpClientProtocol")
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
    if (classDescriptor.superclass == "System.Enum")
    {
      theObject.type = "Enum";
      theObject.image = WEBSERVICE_ENUM_FILENAME;
      classInfo.push(theObject);
    }
    else if (classDescriptor.superclass == "System.Object")
    {
      theObject.type = "Class";
      theObject.image = WEBSERVICE_OBJECT_FILENAME;
      classInfo.push(theObject);      
    }
    else if (classDescriptor.superclass == "System.ValueType")
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
	return true;
}

function isSDKInstalled()
{
	if(!dwscripts.IS_WIN)
	{
		return false;
	}

	var sdkLocations = dw.getDotNetSDKInstallRoots();
	for (i = 0; i < sdkLocations.length; i++)
	{
		if (MM.createProcess(sdkLocations[i] + "bin\\wsdl.exe",	// application
			"",
			"-1",							// timeout
			true))							// bCreateNoWindow
		{
			return true;
		}
	}
	return false;
}
