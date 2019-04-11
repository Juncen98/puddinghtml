// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.
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
  var allScripts = findLockedScriptNodes(dom);
  var fnPatt = new RegExp("public\\s.*" + fnName + "\\s*\\(.+");
 
  for (var i=0; i<allScripts.length; i++)
  {
	  aScript = unescape(allScripts[i].orig);
      startPos = aScript.search(fnPatt);
      if (startPos != -1)
      {
		deleteLockedNode(allScripts[i]);
		break;
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
    str = str.substr(i);
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


//Used by server formats to see if format function already exists on the page, and
//if so, what version it is. Given a function name, returns the version (if
//it exists on the first line as //v3.123) or 0 if no version. Returns -1 if
//the function is not found on the page. For example, given function
//       function myFunction() { //v2.0
//Calling getServerFunctionVersion("myFunction") returns 2. Given function
//       function myFunction() {
//Calling getServerFunctionVersion("myFunction") returns 0.
//Searches dom if passed, else searches active document.
//Does not search included src files (use dom to do this).
//
//Arguments: fnName, dom (optional). If no dom, searches current page
//Returns -1 if function not found, 0 if found without version number.

function getServerFunctionVersion(fnName) 
{

  var i, aScript, result, version=-1;
  dom = dreamweaver.getDocumentDOM("document");
  var allScripts = findLockedScriptNodes(dom);
  var fnPatt = new RegExp("public.*" + fnName + "\\s*\\(.+$"); //find function fnName(...);  ...\n
  var verPatt = new RegExp("\\/\\/v(\\d+\\.?\\d*)","i");           //find //v3.123

  for (i=0; i<allScripts.length; i++) 
  {
    aScript = unescape(allScripts[i].orig); //read script tag
    RegExp.multiline = true;        //required so that $ stops at the end of the line
    result = aScript.match(fnPatt);
    RegExp.multiline = false;       //reset the value
	if (result) 
	{
		return result;
	}
  }
  return -1;
}
