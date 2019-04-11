// Copyright 2000, 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

   function receiveArguments()
   {
      var selItems = site.getSelection();
	  if (selItems.length > 1)
	  {
	  	site.open();
		return true;
	  }
      else if (dw.constructor.gPrimaryEditorURL != "" && dw.constructor.gPrimaryEditorURL != undefined)
	  {
		var fileName = site.getSelection().toString();
		if ( fileName.match( /[.]jpg$/i ) || fileName.match( /[.]jpeg$/i ) || fileName.match( /[.]gif$/i ) || fileName.match( /[.]png$/i ) )
		{
			dw.fireworksCheckout( fileName );
		}
		dw.openWithApp( site.getSelection().toString(), dw.constructor.gPrimaryEditorURL );
		return true;
	  }
	  else
	  {
	     site.open();
		 return true;
	  }
   }

   function canAcceptCommand()
   {
      return true;
   }

   function setMenuText()
   {
	  var selItems = site.getSelection();
	  if (selItems.length > 1 || selItems.length == 0)
	     return "";

	// get the primary external editor for the selected item	
	  var primaryEditorArray = dw.getPrimaryExtensionEditor(selItems[0]);
	  if (primaryEditorArray.length == 1)
	  {
	  	 dw.constructor.gPrimaryEditorName = "";
	  	 dw.constructor.gPrimaryEditorURL = "";
 	  	 return MENU_Open;
	  }
	  else
	  {
	  	dw.constructor.gPrimaryEditorName = primaryEditorArray[0];
	  	dw.constructor.gPrimaryEditorURL = primaryEditorArray[1];
      return MENU_OpenWith + " " + primaryEditorArray[0];
	  }
   }
