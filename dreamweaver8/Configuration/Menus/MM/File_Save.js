// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.


// For the sake of speed, we say we don't need the DOM.  Later on, if it turns
// out we actually do need it, then we will call dom.synchronizeDocument().
function isDOMRequired()
{
  return false;
}


//If the given document has template tags in it (MMTemplate:Editable, MMTemplate:If, MMTemplate:Expr
// or MMTemplate:Repeat) return true, otherwise return false
function documentHasTemplateFeatures(targetDOM)
{
  var curDOM = (targetDOM == null) ? dw.getDocumentDOM('document') : targetDOM;
  if (curDOM == null)
    return false;

  // Do a quick, cheap check to see if there's anything that looks vaguely like
  // a template feature.  If there isn't, we can bail.
  if (!curDOM.isDesignViewUpdated() && curDOM.source)
  {
    var text = curDOM.source.getText().toLowerCase();
    // indexOf() is significantly faster than a regular expression search
    if (text.indexOf("templatebegineditable") == -1 &&
        text.indexOf("templatebeginif") == -1 &&
        text.indexOf("templateexpr") == -1 &&
        text.indexOf("templatebeginrepeat") == -1)
    {
      return false;
    }
  }

  // There MAY be template features in this document.  Let's go through the somewhat
  // expensive step of synchronizing the document, and then do a real check for
  // template features.
  curDOM.synchronizeDocument();

  return ( curDOM.getElementsByTagName("MMTemplate:Editable").length != 0 ||
           curDOM.getElementsByTagName("MMTemplate:If").length != 0       ||
           curDOM.getElementsByTagName("MMTemplate:Expr").length != 0     ||
           curDOM.getElementsByTagName("MMTemplate:Repeat").length != 0 );
} //documentHasTemplateFeatures



function receiveArguments()
{
  var dom = dw.getDocumentDOM();
  if (dom && dom.getFocus() == 'frameset')
    dw.saveFrameset(dw.getDocumentDOM());
  else
  {
    if (dom && dom.getFocus() == 'none' && dw.getFocus() != 'textView')
      dw.setFocus('document');

    //SES 12.12.01 - we used to check here, now we just always save as template, and if the user doesn't want that, they
    //can use SaveAs.
    //here's the old code:
    //if (AskSaveAsTemplate(dw.getDocumentDOM()))

    if (!dom.getIsTemplateDocument() && dw.canSaveDocumentAsTemplate(dom) && documentHasTemplateFeatures(dom))
      dw.saveDocumentAsTemplate(dw.getDocumentDOM());
    else
    {
      if (dom && dom.getIsTemplateDocument())
      {
        if (dom.checkTemplateSyntax())
          CheckFunkyTemplateNesting();
      }

      if (dw.canSaveDocument(dw.getDocumentDOM()))
      {
        dw.saveDocument(dw.getDocumentDOM());
      }
    }
  }
}

function canAcceptCommand()
{
  if (!(dw.getFocus(true) == 'html' || dw.getFocus() == 'textView' || dw.getFocus() == 'document'))
    return false;

  var dom = dw.getDocumentDOM();
  if (dom && dom.getFocus() == 'frameset')
    return dw.canSaveFrameset(dom);
  else if (dom)
    return dw.canSaveDocument(dom);
  else
   	return false;
}

function setMenuText()
{
  var dom = dw.getDocumentDOM();

  if (dom && dom.getFocus() == 'frameset')
    return MENU_SaveFrameset;
  else if (dom && dom.isDocumentInFrame())
    return MENU_SaveFrame;
  else
    return MENU_Save;
}
