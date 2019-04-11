// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.
//CONTRIBUTE ALERT: NEED TO TURN ON THE setLinkHRef commands, etc. 

function makeOrChangeLink()
{
  var dom = dw.getDocumentDOM(); 

  if (typeof dom["setLinkHref"] != 'undefined') //CONTRIBUTE ALERT
    dom.setLinkHref();
}

function canAcceptCommand()
{
  var dom = dw.getDocumentDOM(); 

  if (dom == null || dom.getParseMode() != 'html')
    return false; 

  if (typeof dom["canSetLinkHref"] == 'undefined') //CONTRIBUTE ALERT
    return false; 

  return (dom.canSetLinkHref());
}
   
function setMenuText()
{
  var dom = dw.getDocumentDOM(); 

  if (dom == null || typeof dom["getLinkHref"] == 'undefined') //CONTRIBUTE ALERT
    return MENU_MakeLink; 

  if (dom.getLinkHref() != '')
    return MENU_ChangeLink;
  else
    return MENU_MakeLink;
}
