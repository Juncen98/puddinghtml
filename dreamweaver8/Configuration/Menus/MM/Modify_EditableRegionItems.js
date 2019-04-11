// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

var idOpen="DWContext_Text_OpenAttachedTemplate";
var idNew="DWContext_Text_NewEditableRegion";
var idOptional="DWContext_Text_NewOptionalRegion";
var idRepeating="DWContext_Text_NewRepeatingRegion";
var idRemove="DWContext_Text_RemoveEditableRegion";

function receiveArguments()
{
  if ( arguments[0] == idOpen ) 
    dw.openDocument(dw.getSiteRoot().substring(0,dw.getSiteRoot().length-1) + dw.getDocumentDOM().getAttachedTemplate());
  else if ( arguments[0] == idNew ) 
  	 dw.runCommand("InsertEditableRegion.htm", null, "useSelectedNode");  
  else if ( arguments[0] == idRemove ) 
  	 dw.runCommand("DeleteEditableRegion.htm", null); 
  else if ( arguments[0] == idOptional ) 
  	 dw.runCommand("InsertConditionalContent.htm", null, "useSelectedNode"); 
  else if ( arguments[0] == idRepeating ) 
  	 dw.runCommand("InsertRepeatingContent.htm", null, "useSelectedNode"); 
}

function canAcceptCommand()
{
  if ( dw.getFocus() != 'document' )
    return false;

  if ( arguments[0] == idOpen ) {
    if (dw.getDocumentDOM().getAttachedTemplate())
      return true;
    else
      return false;
  }
  else if ( arguments[0] == idNew || arguments[0] == idOptional || arguments[0] == idRepeating )
  {
     // these don't get even added unless they're enabled
     return true;
  }
  else if ( arguments[0] == idRemove )
     return (canDeleteEditableRegion(dw.getDocumentDOM()));
  else
    return false; // should not happen!!!
}

function isCommandChecked()
{
  return false;
}

// getDynamicContent returns the contents of a dynamically generated menu.
// returns an array of strings to be placed in the menu, with a unique
// identifier for each item separated from the menu string by a semicolon.
//
// return null from this routine to indicate that you are not adding any
// items to the menu
function getDynamicContent(itemID)
{
  var itemList = null;
  if (dw.getDocumentDOM() != null)
  {
    itemList = new Array();
    
    //Always push this, even though it might be disabled, otherwise the menu looks funny. 
    itemList.push(new String(MENU_OpenAttachedTemplate + ";id='"+idOpen+"'"));

	var result = new Object();

	if (canMakeTemplateContent("editable", dw.getDocumentDOM(), result))
   	itemList.push(new String(MENU_NewEditableRegion + ";id='"+idNew+"'"));
   	
   	if (canMakeTemplateContent("optional", dw.getDocumentDOM(), result))
   	itemList.push(new String(MENU_NewOptionalRegion + ";id='"+idOptional+"'"));
   	
   	if (canMakeTemplateContent("repeating", dw.getDocumentDOM(), result))
   	itemList.push(new String(MENU_NewRepeatingRegion + ";id='"+idRepeating+"'"));

  }
  return itemList;
}
