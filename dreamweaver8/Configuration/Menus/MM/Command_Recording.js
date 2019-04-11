// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

function toggleRecording()
{
	if ( dw.isRecording() )
		dw.stopRecording();
	else
		dw.startRecording();
}

function canAcceptCommand()
{
   return dw.getFocus() == 'document' && dw.getDocumentDOM().getFocus() != 'frameset';
}

function setMenuText()
{
   if ( dw.isRecording() )
      return MENU_StopRecording;
   else
      return MENU_StartRecording;
}
