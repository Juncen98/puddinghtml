// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

function receiveArguments()
{
	var itemID = arguments[0];
	var dom = dw.getDocumentDOM();
	if (dom)
	{
		dom.setToolbarVisibility(itemID, !dom.getToolbarVisibility(itemID));
	}
}

function canAcceptCommand()
{
  var retVal = false;
  if (dw.getDocumentDOM()){
    retVal = true;
  }
  return retVal;

}

function getDynamicContent()
{
	var dom = dw.getDocumentDOM();
	if (dom)
	{
		var toolbars = dom.getToolbarIdArray("document");
		var items = new Array;
		var i;
		var x = 0;
    
		for (i = 0; i < toolbars.length; i++)
		{
		  if (toolbars[i] != 'Browser_Toolbar')
		  {
		    // add the build_toolbar for Windows 2000/XP platforms that can compile files
		    if ((toolbars[i] == 'Build_Toolbar' && !dwscripts.IS_WIN_98 && !dwscripts.IS_WIN_NT && !dwscripts.IS_MAC))
		    {
		      items[x] = dom.getToolbarLabel(toolbars[i]) + ";id='" + toolbars[i] + "'";
		      x++
		    } 
		    else if (toolbars[i] == 'Build_Toolbar' && (dwscripts.IS_WIN_98 || dwscripts.IS_WIN_NT || dwscripts.IS_MAC))
		    {
		      // don't add the buildtoolbar for NT and 98 platforms 
		    } 
		    else 
		    {
		      items[x] = dom.getToolbarLabel(toolbars[i]) + ";id='" + toolbars[i] + "'";
		      x++        
		    }
		  }      
		}
		return items;
	}
	return null;
}

function isCommandChecked()
{
	var itemID = arguments[0];
	var dom = dw.getDocumentDOM();
	if (dom)
	{
		return dom.getToolbarVisibility(itemID);
	}
	return false;
}
