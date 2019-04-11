// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

function receiveArguments()
{
/*
SES 12.12.01 - UI review decided to remove this dialog, as unnecessary. 
if (!AskIfNoEditableAreas(dw.getDocumentDOM()))	
	return; 
*/
	
var dom = dw.getDocumentDOM();

//Always check if we are saving as template
if (dom)
	{
	if (dom.checkTemplateSyntax())
		CheckFunkyTemplateNesting();
	}

dw.saveDocumentAsTemplate(dw.getDocumentDOM());
}

function canAcceptCommand()
{
	return (dw.getFocus() == 'textView' || dw.getFocus(true) == 'html' || dw.getFocus() == 'document') && dw.getDocumentDOM() && dw.canSaveDocumentAsTemplate(dw.getDocumentDOM()) && dw.getDocumentDOM().getParseMode() == 'html' && dw.getDocumentDOM().getFocus() != 'frameset';
}

function setMenuText()
{
	var dom = dw.getDocumentDOM();

    // Can't save a frameset as a template, so just show
    // "Save as Template", but gray it out.
	if (dom && dom.getFocus() == 'frameset')
		return MENU_SaveAsTemplate;
    else if (dom && dom.isDocumentInFrame())
		return MENU_SaveFrameAsTemplate;
	else
		return MENU_SaveAsTemplate;
}
