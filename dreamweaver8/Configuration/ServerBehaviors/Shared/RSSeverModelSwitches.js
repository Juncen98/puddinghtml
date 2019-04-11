// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

function CreateNewName()
{
  var num = 0;
  var dom = dw.getDocumentDOM();
  var nodes;
  var rsName = "";
  

  switch(dw.getDocumentDOM().serverModel.getServerLanguage())
  {
    case "JavaScript":
    case "VBScript":
      var nodes = dom.getElementsByTagName("MM_RECORDSET");
      break;
    case "CFML":
      var nodes = dom.getElementsByTagName("CFQUERY");
      break;   
    case "Java":
      var nodes = dom.getElementsByTagName("MM_RECORDSET");
      break; 
    case "C#":
    case "VB":
	  var nodes = dom.getElementsByTagName("MM_RECORDSET");
	  break;
  }
  
  if (nodes) {
    var newNameFound = false

    while (!newNameFound) {
      num++;
      rsName = "Recordset" + num;
      newNameFound = true;
      for (var i = 0; i < nodes.length; i++) {
        var theName = (nodes[i].getAttribute("NAME")? nodes[i].getAttribute("NAME") : "");
        if (theName.toLowerCase() == rsName.toLowerCase()) {
          newNameFound = false;
          break;
        }
      }
    }
  }
    

  return rsName;
}
 
function StripASPTags(inStr)
{
  var theStr = String(inStr);
  theStr = theStr.replace(/(<%=)*/gi,"");    //remove open tags	 
  theStr = theStr.replace(/(%>)*/gi,"");  //remove close tags
  return theStr;
}

function GetParamTypeArray()
{
  // the array definitions are in Commands\SimpleRecordset.js

  switch(dw.getDocumentDOM().serverModel.getServerLanguage())
  {
    case "JavaScript":
    case "VBScript":
      outArray = MM.LABEL_ASP_Param_Types
      break
    case "CFML":
      outArray = MM.LABEL_CF_Param_Types
      break
    case "Java":
      outArray = MM.LABEL_JSP_Param_Types
      break
    case "C#":
    case "VB":
	  outArray = MM.LABEL_ASPNET_Param_Types
      break
  }

  return outArray
}


function IsLiteralValue(index)
{
  switch(dw.getDocumentDOM().serverModel.getServerLanguage())
  {
    case "JavaScript":
    case "VBScript":
    case "CFML":
    case "C#":
    case "VB":
      if (index == 5)
      {
        return true
      }
      break
    case "Java":
      if (index == 2)
      {
        return true
      }
      break
  }

  return false
}


function GetParamObject(paramType, paramVal, rsName)
{
  var runtimeVal = "MM_Error: Could not create runtime value."
  var defaultVal = "1"
  var theName = gSimpleParamName
  switch(dw.getDocumentDOM().serverModel.getServerLanguage())
  {
    case "JavaScript":
    case "VBScript":
    case "C#":
    case "VB":
	  paramVal = StripASPTags(paramVal);
      switch(paramType)
      {
        case 0:
          runtimeVal = "Request.QueryString(\"" + paramVal + "\")"
          break
        case 1:
          runtimeVal = "Request.Form(\"" + paramVal + "\")"
          break
        case 2:
          runtimeVal = "Request.Cookies(\"" + paramVal + "\")"
          break
        case 3:
          runtimeVal = "Session(\"" + paramVal + "\")"
          break
        case 4:
          runtimeVal = "Application(\"" + paramVal + "\")"
          break
        case 5:
          runtimeVal = "Request(\"MM_EmptyValue\")"
          defaultVal = paramVal;
          break
      }
      break

    case "CFML":

      switch(paramType)
      {
        case 0:
          runtimeVal = "#URL." + paramVal + "#"
          break
        case 1:
          runtimeVal = "#FORM." + paramVal + "#"
          break
        case 2:
          runtimeVal = "#Cookie." + paramVal + "#"
          break
        case 3:
          runtimeVal = "#Session." + paramVal + "#"
          break
        case 4:
          runtimeVal = "#Application." + paramVal + "#"
          break
        case 5:
          runtimeVal = "#" + rsName + "_Literal#"
          defaultVal = paramVal
          break
      }
      break

    case "Java":

      switch(paramType)
      {
        case 0:
          runtimeVal = "request.getParameter(\"" + paramVal + "\")"
          break
        case 1:
          runtimeVal = "session.getValue(\"" + paramVal + "\")"
          break
        case 2:
          runtimeVal = "request.getParameter(\"MM_EmptyValue\")"
          defaultVal = paramVal
          break
      }

      break
  }

  

  var outObj = new Object()

  outObj.name = theName
  outObj.defaultVal = defaultVal
  outObj.runtimeVal = runtimeVal

  return outObj
}


function GetParamTypeAndName(inParam, rsName)
{

  var runtimeVal = inParam.runtimeVal

  var outObj = new Object()
  var paramType = -1
  var paramName = ""
  switch(dw.getDocumentDOM().serverModel.getServerLanguage())
  {
    case "JavaScript":
    case "VBScript":
    case "C#":
    case "VB":
      
      if (runtimeVal.search(/\s*Request\.QueryString\("([^"]*)"\)\s*/) != -1)
      {
        paramType = 0
      }
      else if (runtimeVal.search(/\s*Request\.Form\("([^"]*)"\)\s*/) != -1)
      {
        paramType = 1
      }
      else if (runtimeVal.search(/\s*Request\.Cookies\("([^"]*)"\)\s*/) != -1)
      {
        paramType = 2
      }
      else if (runtimeVal.search(/\s*Session\("([^"]*)"\)\s*/) != -1)
      {
        paramType = 3
      } 
      else if (runtimeVal.search(/\s*Application\("([^"]*)"\)\s*/) != -1)
      {
        paramType = 4
      } 
      else if (runtimeVal.search(/\s*Request\("MM_EmptyValue"\)\s*/) != -1)
      {
        paramType = 5
      }

      if (paramType == 5)
      {
        paramName = inParam.defaultVal
      }
      else
      {
        paramName = RegExp.$1
      }
                
      break

    case "CFML":
      if (runtimeVal.search(/\s*#url\.([^"]*)#\s*/i) != -1)
      {
        paramType = 0
      }
      else if (runtimeVal.search(/\s*#form\.([^"]*)#\s*/i) != -1)
      {
        paramType = 1
      }
      else if (runtimeVal.search(/\s*#cookie\.([^"]*)#\s*/i) != -1)
      {
        paramType = 2
      }
      else if (runtimeVal.search(/\s*#session\.([^"]*)#\s*/i) != -1)
      {
        paramType = 3
      } 
      else if (runtimeVal.search(/\s*#application\.([^"]*)#\s*/i) != -1)
      {
        paramType = 4
      } 
      else
      {

        var re = new RegExp(rsName + "_Literal")
        if (runtimeVal.search(re) != -1)
        {
          paramType = 5
        }
      }

      if (paramType == 5)
      {
        paramName = inParam.defaultVal
      }
      else
      {
        paramName = RegExp.$1
      }
    
      break


    case "Java":
      
      if (runtimeVal.search(/\s*request\.getParameter\("MM_EmptyValue"\)\s*/) != -1)
      {
        paramType = 2
      }
      else if (runtimeVal.search(/\s*request\.getParameter\("([^"]*)"\)\s*/) != -1)
      {
        paramType = 0
      }
      else if (runtimeVal.search(/\s*session\.getValue\("([^"]*)"\)\s*/) != -1)
      {
        paramType = 1
      }
    

      if (paramType == 2)
      {
        paramName = inParam.defaultVal
      }
      else
      {
        paramName = RegExp.$1
      }
                
      break
  }


  if (paramType != -1)
  {
    outObj.paramType = paramType
    outObj.paramName = paramName
    return outObj
  }
  else
  {
    return false
  }
}
