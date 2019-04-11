function canAcceptCommand()
{
  return ( dw.getFocus() == 'document' && dw.getDocumentDOM().canClipPasteHTML() );
}

function receiveArguments()
{
  MM.event.notify('','dw.clipPasteHTML()');
}

function setMenuText()
{
  if (dw.canPasteFormatted())
    return MENU_PasteFormatted;
  else
    return MENU_PasteHTML;
}
