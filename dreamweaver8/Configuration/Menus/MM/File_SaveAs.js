// Copyright 2000, 2001, 2002, 2003, 2004 Macromedia, Inc. All rights reserved.

function receiveArguments()
{
	var dom = dw.getDocumentDOM();
	if (dom && dom.getFocus() == 'frameset')
		dw.saveFramesetAs(dw.getDocumentDOM())
	else
		{
		if (dom && dom.getFocus() == 'none' && dw.getFocus() != 'textView')
			dw.setFocus('document');
			
		if (dom && dom.getIsTemplateDocument())
			{
			if (dom.checkTemplateSyntax())
				CheckFunkyTemplateNesting();
			}
			

		dw.saveDocumentAs(dw.getDocumentDOM());
		}
}

function canAcceptCommand()
{
	var dom = dw.getDocumentDOM();
	if (dom && dom.getFocus() == 'frameset')
		return (dw.getFocus(true) == 'html' || dw.getFocus() == 'textView' || dw.getFocus() == 'document') && dw.canSaveFramesetAs(dw.getDocumentDOM());
	else if (dom)
		return  !dw.getDocumentDOM().getEditNoFramesContent();
	else
		return (dw.getFocus() == 'textView' || dw.getFocus() == 'document');
}

function setMenuText()
{
	var dom = dw.getDocumentDOM();
	if (dom && dom.getFocus() == 'frameset')
		return MENU_SaveFramesetAs;
    else if (dom && dom.isDocumentInFrame())
		return MENU_SaveFrameAs;
	else
		return MENU_SaveAs;
}
