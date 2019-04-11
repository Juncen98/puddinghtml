// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

//*-------------------------------------------------------------------
// FUNCTION:
//  getPrimitiveTypeSignature
//
// DESCRIPTION:
//	returns the signature for primitive types for that server model
//
// ARGUMENTS:
//	languageSignature : language signature string
//  aType             : Primitive type
//	
// RETURNS:
//   String
//--------------------------------------------------------------------

function getPrimitiveTypeSignature(languageSignature, aType)
{

  // do a lookup and return the language-specific string
  if(languageSignature && aType)
  {
    aDataType = languageSignature.PrimitiveTypes[aType];
    if(aDataType)
    {
      return aDataType;
    }
  }
  return "unknown";
}

//*-------------------------------------------------------------------
// FUNCTION:
//  getTypeSignature
//
// DESCRIPTION:
//	returns the type signature by evaluating it for that server model
//
// ARGUMENTS:
//	languageSignature       : language signature string
//  typeSignatureDescriptor : type descriptor string
//	
// RETURNS:
//   String
//--------------------------------------------------------------------

function getTypeSignature(languageSignature, typeSignatureDescriptor)
{
  var typeString;
  if (typeSignatureDescriptor)
  {
    if (typeSignatureDescriptor.hasChildNodes())
    {
      //check for indirection nodes;
      var indirectionsnodes = typeSignatureDescriptor.childNodes[0];
      if(indirectionsnodes != null)
      {
        var indirectionnodes  = indirectionsnodes.hasChildNodes();
        if(indirectionnodes)
        {
          for (var i=0; i < indirectionnodes.childNodes.length; i++)
          {
            // todo
          }
        }
      }
    }
    else
    {
      typeString = typeSignatureDescriptor.type;
      if (typeSignatureDescriptor.primitive == "true")
      {
        typeString = getPrimitiveTypeSignature(languageSignature,typeString);
      }
      if(typeSignatureDescriptor.array == "true")
      {
        var arraySignature = languageSignature.Array;
        var arrayPattern = /\$\$ARRAYNAME/g;
        arraySignature = arraySignature.replace(arrayPattern, typeString);
        if(typeSignatureDescriptor.rank)
        {
          var rank = parseInt(typeSignatureDescriptor.rank);
          if(rank > 1)
          {
            var arrayBracket = languageSignature.ArrayBracket;
            for(var i = 0; i < rank - 1; i++)
            {
                arraySignature = arraySignature + arrayBracket;
            }
          }
        }
        typeString = arraySignature;
      }
    }
  }
  return typeString;
}

//*-------------------------------------------------------------------
// FUNCTION:
//  getMethodTemplate
//
// DESCRIPTION:
//	returns the method template for that server model
//
// ARGUMENTS:
//	languageSignature : language signature string
//  isConstructor     : boolean to indicate whether the method is a 
//                      constructor or not
//	
// RETURNS:
//   String
//--------------------------------------------------------------------

function getMethodTemplate(languageSignature, isConstructor)
{
  if(languageSignature)
  {
    if(isConstructor)
    {
      return languageSignature.Constructor;
    }
    return languageSignature.Method;
  }
}

//*-------------------------------------------------------------------
// FUNCTION:
//  getDropMethodSignature
//
// DESCRIPTION:
//	returns the method signature that gets dropped for that server model
//
// ARGUMENTS:
//	languageSignature : language signature string
//  methodDescriptor  : method descriptor string
//	
// RETURNS:
//   String
//--------------------------------------------------------------------

function getDropMethodSignature(languageSignature, methodDescriptor, objectName)
{
  var methodInfo = "";
  var methodCall = "";
  var throwsCall = "";
  var argumentsString="";
  var exceptionsString = "";
  var bConstructor = false;
  var bPublic = false;

  if(languageSignature && methodDescriptor)
  {
    // get the method template
	var isConstructor = methodDescriptor.getAttribute("constructor");
	if(isConstructor && isConstructor == "true")
	{
		bConstructor = true;
	}
	else
	{
		bConstructor = false;
	}
      
    methodTemplate = getMethodTemplate(languageSignature, bConstructor);

    // get the throwsSignature
    throwsCall = languageSignature.Throws;

    // get info about the method template
    var signatureInfo = getMethodSignatureInfo(methodTemplate);
	var methodCall = null;
	if(bConstructor)
	{
		methodCall = languageSignature.ConstructorDropcode;
	}
	else
	{
		// is there a return value
		var hasReturnValue = false;
		if(methodDescriptor.hasChildNodes())
		{
			var aReturnType = methodDescriptor.getElementsByTagName("returntype");
			if(aReturnType && aReturnType.length)
			{
				var aReturnTypeSig = aReturnType[0].getElementsByTagName("typesignaturedescriptor");
				if(aReturnTypeSig && aReturnTypeSig.length)
				{
					if(aReturnTypeSig[0].type != "VOID")
					{
						hasReturnValue = true;
					}
				}
			}
		}
		if(hasReturnValue)
		{
			methodCall = languageSignature.Dropcode;
		}
		else
		{
			methodCall = languageSignature.VoidDropcode;
		}
	}

    // replace $$METHODNAME token with the type
    var methodNamePattern = /\$\$METHODNAME/g;
    var methodName = methodDescriptor.name;
    methodCall = methodCall.replace(methodNamePattern, methodName);

	// replace $$OBJECTNAME token with object name
	if(methodCall.indexOf("$$OBJECTNAME") >= 0)
	{
		if(!objectName || !objectName.length)
		{
			objectName = "anObject";
		}
	    var objectNamePattern = /\$\$OBJECTNAME/g;
		methodCall = methodCall.replace(objectNamePattern, objectName);
	}

	if(bConstructor)
	{
		// replace $$RETURNVALUE token with split type
        var returnPattern = /\$\$RETURNVALUE/g;
		var returnType = methodName.split(".");
		returnType = returnType[returnType.length - 1];
        methodCall = methodCall.replace(returnPattern, returnType);
	}

    if(methodDescriptor.hasChildNodes())
    {
	    // iterate through child nodes
      for(var i = 0;i < methodDescriptor.childNodes.length; i++)
      {
        if(methodDescriptor.childNodes[i].tagName == "RETURNTYPE")
        {
            // replace $$RETURNTYPE token with the type
            var returnPattern = /\$\$RETURNTYPE/g;
            var returnType = getTypeSignature(languageSignature, methodDescriptor.childNodes[i].childNodes[0]);
            methodCall = methodCall.replace(returnPattern, returnType);

			// replace $$RETURNVALUE token with split type
			if(methodName.indexOf("get") == 0)
			{
				returnType = methodName.slice(3);
			}
			else
			{
				returnType = returnType.split(".");
				returnType = returnType[returnType.length - 1];
			}
            returnPattern = /\$\$RETURNVALUE/g;
            methodCall = methodCall.replace(returnPattern, returnType);
        }
        else if (methodDescriptor.childNodes[i].tagName == "ARGUMENTS")
        {
          if(signatureInfo.hasArgs)
          {
			var BeginBlockComment = languageSignature.BeginBlockComment;
			var EndBlockComment = languageSignature.EndBlockComment;
			var doBlockComment = BeginBlockComment != null &&
									BeginBlockComment.length &&
									EndBlockComment != null &&
									EndBlockComment.length;
            var argNodes = methodDescriptor.childNodes[i].childNodes;
            for(var j = 0; j < argNodes.length; j++)
            {
              var argNode = argNodes[j];
              if(argNode.hasChildNodes())
              {
                var argsType = getTypeSignature(languageSignature, argNode.childNodes[0]);
                if (argumentsString.length)
                {
                  argumentsString += signatureInfo.argSeparator;
                }
                if(doBlockComment)
			    {
				  argumentsString += BeginBlockComment;
			    }
                argumentsString += argsType;
              }
              var argAttrLen = argNode.attributes.length;
              for (var k=0 ; k < argAttrLen; k++)
              {
                if (argNode.attributes[k].name == "name")
                {
                  argumentsString += " ";
                  argumentsString += argNode.attributes[k].value;
                  break;
                }
              }
			  if(doBlockComment)
			  {
				argumentsString += EndBlockComment + MM.MSG_CFC_PleasePutAValueHere;
			  }
            }
          }
        }
        else if (methodDescriptor.childNodes[i].tagName == "EXCEPTIONS")
        {
/*
          if(signatureInfo.hasExceptions)
          {
            var exceptionNodes = methodDescriptor.childNodes[i].childNodes;
            for(var j = 0; j < exceptionNodes.length; j++)
            {
              var exceptionType = exceptionNodes[j].name;
              if (exceptionsString && exceptionsString.length)
              {
                exceptionsString += signatureInfo.exceptionSeparator;
              }
              exceptionsString+= exceptionType;
            }
          }
*/
        }
      }

      if(signatureInfo.hasArgs)
      {
        // replace $$ARGUMENT tokens
        var firstArgIndex = methodCall.indexOf("$$ARGUMENT");
        var lastArgIndex = methodCall.lastIndexOf("$$ARGUMENT");
        if(argumentsString && argumentsString.length)
        {
          var tempstr = methodCall.substring(0,firstArgIndex);
          tempstr += argumentsString;
          tempstr += methodCall.substring(lastArgIndex + 10, methodCall.length);
          methodCall = tempstr;
        }
        else
        {
          var tempstr = methodCall.substring(0,firstArgIndex);
          tempstr += methodCall.substring(lastArgIndex + 10, methodCall.length);
          methodCall = tempstr;
        }
      }

      if(signatureInfo.hasExceptions)
      {
/*
        // replace $$EXCEPTION tokens
        var firstExceptionIndex = methodCall.indexOf("$$EXCEPTION");
        var lastExceptionIndex = methodCall.lastIndexOf("$$EXCEPTION");
        var tempstr = methodCall.substring(0, firstExceptionIndex -  1);
        tempstr += methodCall.substring(lastExceptionIndex + 11, methodCall.length);
        methodCall = tempstr;
        // replace $$THROWS token with the type
        var throwPattern = / \$\$THROWS/g;
        methodCall = methodCall.replace(throwPattern, "");
*/
      }
    }
    else
    {
      // replace $$ARGUMENT tokens
      if(signatureInfo.hasArgs)
      {
        var firstArgIndex = methodCall.indexOf("$$ARGUMENT");
        var lastArgIndex = methodCall.lastIndexOf("$$ARGUMENT");
        var tempstr = methodCall.substring(0,firstArgIndex);
        tempstr += methodCall.substring(lastArgIndex + 10, methodCall.length);
        methodCall = tempstr;
      }

      if(signatureInfo.hasExceptions)
      {
/*
        // replace $$EXCEPTION tokens
        var firstExceptionIndex = methodCall.indexOf("$$EXCEPTION");
        var lastExceptionIndex = methodCall.lastIndexOf("$$EXCEPTION");
        var tempstr = methodCall.substring(0, firstExceptionIndex - 1);
        tempstr += methodCall.substring(lastExceptionIndex + 11, methodCall.length);
        methodCall = tempstr;
        // replace $$THROWS token with the type
        var throwPattern = / \$\$THROWS/g;
        methodCall = methodCall.replace(throwPattern, "");
*/
      }
    }
  }
  return dwscripts.trim(methodCall);
}

//*-------------------------------------------------------------------
// FUNCTION:
//  getMethodSignatureInfo
//
// DESCRIPTION:
//	returns the actual method signature after substituting all the
//  required tokens that are present
//
// ARGUMENTS:
//	methodTemplate : method template string
//	
// RETURNS:
//   String
//--------------------------------------------------------------------

function getMethodSignatureInfo(methodTemplate)
{
  SignatureInfo = new Object();
  SignatureInfo.hasReturn = false;
  SignatureInfo.hasExceptions = false;
  SignatureInfo.exceptionSeparator = "";
  SignatureInfo.hasArgs = false;
  SignatureInfo.beforeArg = "";
  SignatureInfo.betweenArg = "";
  SignatureInfo.afterArg = "";

  // determine whether template has a return value
  if(methodTemplate.indexOf("$$RETURNTYPE") >= 0)
  {
    SignatureInfo.hasReturn = true;
  }

  // determine whether template has exceptions
  var firstExceptionIndex = methodTemplate.indexOf("$$EXCEPTION");
  if(firstExceptionIndex >= 0)
  {
    SignatureInfo.hasExceptions = true;
    // get the exception separator string
    var lastExceptionIndex = methodTemplate.lastIndexOf("$$EXCEPTION");
    if(lastExceptionIndex >= 0)
    {
      SignatureInfo.exceptionSeparator = methodTemplate.substring(firstExceptionIndex + 11, lastExceptionIndex);
    }
  }

  // determine whether template has args
  var firstArgIndex = methodTemplate.indexOf("$$ARGUMENT");
  if(firstArgIndex >= 0)
  {
    SignatureInfo.hasArgs = true;
    // get the arg separator stirng
    var lastArgIndex = methodTemplate.lastIndexOf("$$ARGUMENT");
    SignatureInfo.argSeparator = methodTemplate.substring(firstArgIndex + 10, lastArgIndex);
  }
  return SignatureInfo;
}

//*-------------------------------------------------------------------
// FUNCTION:
//  getMethodSignature
//
// DESCRIPTION:
//	returns the final method signature for that method descriptor
//
// ARGUMENTS:
//	languageSignature : language signature string
//  methodDescriptor  : method descriptor string
//	
// RETURNS:
//   String
//--------------------------------------------------------------------

function getMethodSignature(languageSignature, methodDescriptor)
{
  var methodInfo = "";
  var methodCall = "";
  var throwsCall = "";
  var argumentsString="";
  var exceptionsString = "";
  var bConstructor = false;
  var bPublic = false;

  if(languageSignature && methodDescriptor)
  {
    // get the method template
    for (var i=0 ; i < methodDescriptor.attributes.length; i++)
    {
      if (methodDescriptor.attributes[i].name == "constructor")
      {
        if (methodDescriptor.attributes[i].value == "true")
        {
          bConstructor = true;
        }
        else
        {
          bConstructor = false;
        }
      }
      else if (methodDescriptor.attributes[i].name == "public")
      {
        if (methodDescriptor.attributes[i].value == "true")
        {
          bPublic = true;
        }
      }      
    }

    // we are only interested in showing public methods...
    if(bPublic == false)
      return methodInfo;
      
    methodCall = getMethodTemplate(languageSignature, bConstructor);
    // get the throwsSignature
    throwsCall = languageSignature.Throws;

    // get info about the method template
    var signatureInfo = getMethodSignatureInfo(methodCall);

    // replace $$METHODNAME token with the type
    var methodNamePattern = /\$\$METHODNAME/g;
    var methodName = methodDescriptor.name;
    methodCall = methodCall.replace(methodNamePattern, methodName);

    // iterate through child nodes
    if(methodDescriptor.hasChildNodes())
    {
      for(var i = 0;i < methodDescriptor.childNodes.length; i++)
      {
        if(methodDescriptor.childNodes[i].tagName == "RETURNTYPE")
        {
          if(signatureInfo.hasReturn)
          {
            // replace $$RETURNTYPE token with the type
            var returnTypePattern = /\$\$RETURNTYPE/g;
            var returnType = getTypeSignature(languageSignature, methodDescriptor.childNodes[i].childNodes[0]);
            methodCall = methodCall.replace(returnTypePattern, returnType);
          }
        }
        else if (methodDescriptor.childNodes[i].tagName == "ARGUMENTS")
        {
          if(signatureInfo.hasArgs)
          {
            var argNodes = methodDescriptor.childNodes[i].childNodes;
            for(var j = 0; j < argNodes.length; j++)
            {
              var argNode = argNodes[j];
              if(argNode.hasChildNodes())
              {
                var argsType = getTypeSignature(languageSignature, argNode.childNodes[0]);
                if (argumentsString.length)
                {
                  argumentsString += signatureInfo.argSeparator;
                }
                argumentsString += argsType;
              }
              var argAttrLen = argNode.attributes.length;
              for (var k=0 ; k < argAttrLen; k++)
              {
                if (argNode.attributes[k].name == "name")
                {
                  argumentsString += " ";
                  argumentsString += argNode.attributes[k].value;
                  break;
                }
              }
            }
          }
        }
        else if (methodDescriptor.childNodes[i].tagName == "EXCEPTIONS")
        {
          if(signatureInfo.hasExceptions)
          {
            var exceptionNodes = methodDescriptor.childNodes[i].childNodes;
            for(var j = 0; j < exceptionNodes.length; j++)
            {
              var exceptionType = exceptionNodes[j].name;
              if (exceptionsString && exceptionsString.length)
              {
                exceptionsString += signatureInfo.exceptionSeparator;
              }
              exceptionsString+= exceptionType;
            }
          }
        }
      }

      if(signatureInfo.hasArgs)
      {
        // replace $$ARGUMENT tokens
        var firstArgIndex = methodCall.indexOf("$$ARGUMENT");
        var lastArgIndex = methodCall.lastIndexOf("$$ARGUMENT");
        if(argumentsString && argumentsString.length)
        {
          var tempstr = methodCall.substring(0,firstArgIndex);
          tempstr += argumentsString;
          tempstr += methodCall.substring(lastArgIndex + 10, methodCall.length);
          methodCall = tempstr;
        }
        else
        {
          var tempstr = methodCall.substring(0,firstArgIndex);
          tempstr += methodCall.substring(lastArgIndex + 10, methodCall.length);
          methodCall = tempstr;
        }
      }

      if(signatureInfo.hasExceptions)
      {
        // replace $$EXCEPTION tokens
        var firstExceptionIndex = methodCall.indexOf("$$EXCEPTION");
        var lastExceptionIndex = methodCall.lastIndexOf("$$EXCEPTION");
        if(exceptionsString && exceptionsString.length)
        {
          var tempstr = methodCall.substring(0,firstExceptionIndex);
          tempstr += exceptionsString;
          tempstr += methodCall.substring(lastExceptionIndex + 11, methodCall.length);
          methodCall = tempstr;
          var throwPattern = /\$\$THROWS/g;
          methodCall = methodCall.replace(throwPattern, throwsCall);
        }
        else
        {
          var tempstr = methodCall.substring(0, firstExceptionIndex - 1);
          tempstr += methodCall.substring(lastExceptionIndex + 11, methodCall.length);
          methodCall = tempstr;
          // replace $$THROWS token with the type
          var throwPattern = / \$\$THROWS/g;
          methodCall = methodCall.replace(throwPattern, "");
        }
      }
    }
    else
    {
      // replace $$ARGUMENT tokens
      if(signatureInfo.hasArgs)
      {
        var firstArgIndex = methodCall.indexOf("$$ARGUMENT");
        var lastArgIndex = methodCall.lastIndexOf("$$ARGUMENT");
        var tempstr = methodCall.substring(0,firstArgIndex);
        tempstr += methodCall.substring(lastArgIndex + 10, methodCall.length);
        methodCall = tempstr;
      }

      if(signatureInfo.hasExceptions)
      {
        // replace $$EXCEPTION tokens
        var firstExceptionIndex = methodCall.indexOf("$$EXCEPTION");
        var lastExceptionIndex = methodCall.lastIndexOf("$$EXCEPTION");
        var tempstr = methodCall.substring(0, firstExceptionIndex - 1);
        tempstr += methodCall.substring(lastExceptionIndex + 11, methodCall.length);
        methodCall = tempstr;
        // replace $$THROWS token with the type
        var throwPattern = / \$\$THROWS/g;
        methodCall = methodCall.replace(throwPattern, "");
        //return methodCall;
      }
    }
  }

  if(bPublic)
    methodInfo = "public ";
  methodInfo += methodCall;  
  return methodInfo;
}

//*-------------------------------------------------------------------
// FUNCTION:
//  getPropertySignature
//
// DESCRIPTION:
//	returns the final Property signature for that descriptor
//
// ARGUMENTS:
//	languageSignature   : language signature string
//  propertyDescriptor  : Property descriptor string
//	
// RETURNS:
//   String
//--------------------------------------------------------------------

function getPropertySignature(languageSignature, propertyDescriptor)
{
  var propertySignature = "";
  var type = "";

  if (languageSignature && propertyDescriptor)
  {
      var typeSignatureDescriptor = propertyDescriptor.childNodes[0].childNodes[0];
      if (typeSignatureDescriptor)
      {
        type += getTypeSignature(languageSignature, typeSignatureDescriptor);
      }

    if (propertyDescriptor) 
    {
      var bPublic = false;
      for (var i=0 ; i < propertyDescriptor.attributes.length; i++)
      {
        if (propertyDescriptor.attributes[i].name == "public")
        {
          // we are only interested in showing public properties
          if (propertyDescriptor.attributes[i].value == "true")
          {
            bPublic = true;
          }
          break;
        }
      }

    
      if(bPublic == true)
        propertySignature += "public";
      else
        return propertySignature;

      if(propertyDescriptor.name)
        propertySignature += " " + propertyDescriptor.name;
      if(type)
          propertySignature += ", " + type;  
          
      //if(propertyDescriptor.value)
      //  propertySignature += "=" + propertyDescriptor.value;  
    }  
  }  

  return propertySignature;
}

//*-------------------------------------------------------------------
// FUNCTION:
//  getFieldSignature
//
// DESCRIPTION:
//	returns the final Field signature for that descriptor
//
// ARGUMENTS:
//	languageSignature : language signature string
//  fieldDescriptor   : field descriptor string
//	
// RETURNS:
//   String
//--------------------------------------------------------------------

function getFieldSignature(languageSignature, fieldDescriptor)
{
  var fieldSignature = "";
  var type = "";

  if (languageSignature && fieldDescriptor)
  {
      var typeSignatureDescriptor = fieldDescriptor.childNodes[0].childNodes[0];
      if (typeSignatureDescriptor)
      {
        type += getTypeSignature(languageSignature, typeSignatureDescriptor);
      }

    if (fieldDescriptor) 
    {
      var bPublic = false;
      for (var i=0 ; i < fieldDescriptor.attributes.length; i++)
      {
        if (fieldDescriptor.attributes[i].name == "public")
        {
          if (fieldDescriptor.attributes[i].value == "true")
          {
            bPublic = true;
          }
          break;
        }
      }
 
      // we are only interested in showing public fields...    
      if(bPublic == true)
        fieldSignature += "public";
      else
        return fieldSignature;  
      if(fieldDescriptor.name)
        fieldSignature += " " + fieldDescriptor.name;
      if(type)
          fieldSignature += ", " + type;  
        
      //if(fieldDescriptor.value)
      //  fieldSignature += "=" + fieldDescriptor.value;  
    }  
  }  

  return fieldSignature;
}
