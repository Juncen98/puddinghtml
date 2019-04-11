// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

function editTag()
{
   dw.popupEditTagDialog();
}

function canAcceptCommand()
{
if (typeof dw["canPopupEditTagDialog"] == 'undefined')
	return false; 
	
   return dw.canPopupEditTagDialog() != null;
}

function isDOMRequired()
{
   return false;
}

function setMenuText()
{
	if (typeof dw["canPopupEditTagDialog"] == 'undefined')
		return MENU_EditTag; 

   var tagName = dw.canPopupEditTagDialog();

   if (tagName == null)
      return MENU_EditTag + " ...";
   else
      return MENU_EditTag + " <" + tagName.toLowerCase() + ">...";
}
