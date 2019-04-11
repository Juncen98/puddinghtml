// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.
var codeNavCheckedItem = "-1";
var gNumItems = 0;

function isDOMRequired()
{
  return false;
}

function haveCodeNavTarget()
{	
	return dw.getFocus() == 'textView' || dw.getFocus("true") == 'html';
}

function receiveArguments()
{
	var theDOM = dw.getDocumentDOM();
	if (theDOM == null)
		return;
		
	theDOM.source.doCodeNavItem(arguments[0]);
}

function canAcceptCommand()
{
	if (dw.getDocumentDOM() == null)
		return false;
		
	if (gNumItems < 1)
		return false;
	
	return haveCodeNavTarget();
}

function navCompareFunc(a, b) 
{
	if (a.toLowerCase() < b.toLowerCase())
		return -1
	if (a.toLowerCase() > b.toLowerCase())
		return 1
	return 0
}

function isCommandChecked()
{
    var what = arguments[0];
    
    if (what == -1 || codeNavCheckedItem == -1)
    	return false;
    
    return codeNavCheckedItem == what;
}

function getDynamicContent(itemID)
{
	var doSort = "0";
	var theDOM = dw.getDocumentDOM();
	var newList = new Array();
	if (theDOM == null)
		return newList;
	var navList = theDOM.source.getCodeNavList();
	var i;
	var j=0;
	gNumItems = navList.length;
	
	codeNavCheckedItem = -1;
	
	for (i=0; i<navList.length - 2; i++)
	{
		// newList[i] = navList[i] + ";id='"+escQuotes(i)+"'";
		newList[i] = navList[i] + ";id='"+ i +"'";
	}
	
	if (navList.length > 0)
	{
		// the last item in the array is the sort flag
		// which can be "0" for no sort or "1" for sort.
		doSort = navList[navList.length - 2];
		
		codeNavCheckedItem = navList[navList.length - 1];
	}
	
	if (doSort != "0")
		newList.sort(navCompareFunc);
	
	return newList;
}
