// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

function getDocServerLanguage()
{
  var retVal = "";

  if (dreamweaver.getDocumentDOM().serverModel.getServerName() == "ASP")
  {
    var dom = dreamweaver.getDocumentDOM();
    var langTag="", langTags = dom.getElementsByTagName("MM_SCRIPT_LANGUAGE");

    if (langTags.length)
    {
      //  There is at least one language tag on the page.
      retVal = langTags[0].getAttribute("name").toUpperCase();

    }
    else
    {
      //  Use the default language for the site.
      retVal = dreamweaver.getDocumentDOM().serverModel.getServerLanguage().toUpperCase();
    }
  }

  return retVal;
}

function isVBScript_DocServerLanguage()
{
  var retVal = false;
  if (getDocServerLanguage() == "VBSCRIPT")
  {
    retVal = true;
  }

  return retVal;
}

function isJScript_DocServerLanguage()
{
  var retVal = false;
  if ((getDocServerLanguage() == "JSCRIPT") || (getDocServerLanguage() == "JAVASCRIPT"))
  {
    retVal = true;
  }

  return retVal;
}

function getIndexOfEqualsForResponseWrite(str)
{
  var retVal = -1;
  var fnPatt = new RegExp("<%\\s*=");
  var iSearch = str.search(fnPatt);
  if (iSearch != -1)
  {
    retVal = str.indexOf("=");
  }

  return retVal;
}

function deleteWholeScriptContainingFunction(fnName)
{
  dom = dreamweaver.getDocumentDOM("document");
  var i, j, aScript, startPos, retVal=false;
  var allScripts = dom.getElementsByTagName("SCRIPT");
  var fnPatt = new RegExp("function\\s+" + fnName + "\\s*\\(.+");
 
  for (i=0; i<allScripts.length; i++)
  {
    if (allScripts[i].hasChildNodes()) 
    {
      aScript = allScripts[i].childNodes[0].data;
      startPos = aScript.search(fnPatt);
      if (startPos != -1)
      {
        allScripts[i].outerHTML = '';
      }
    }
  }

  return 1;
}

function numFormatFunctionInvokations(fnName, nMax)
{
  dom = dreamweaver.getDocumentDOM("document");
  var fnPatt = new RegExp("<%\\s*=\\s*" + fnName + "\\s*\\(.*\\)\\s*%>");

  var str = dom.documentElement.outerHTML;
  nRet = 0;

  while (str.length > 0)
  {
    var i = str.search(fnPatt);
    if (i == -1)
    {
      break;
    }

    nRet = nRet + 1;
    if (nRet >= nMax)
    {
      break;
    }
    str = str.substr(i + 1);
  }

  return nRet;
}

function selectOption(selObj, val)
{
	var selInd = -1;
	for (var i=0; i<selObj.options.length; i++)
	{
		if (selObj.options[i].value == val)
		{
			selInd = i;
			break;
		}
	}

	if (selInd != -1)
	{
		selObj.selectedIndex = selInd;
	}
}
