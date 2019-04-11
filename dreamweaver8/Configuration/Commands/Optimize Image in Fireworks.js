// Copyright 1998, 1999, 2000, 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.
//
// Command: Optimize Image in Fireworks
//
// This formless command attempts to find and launch 
// a Fireworks optimization session on a selected image
// within dw.
//
// Most of the work to do this is implemented in the
// extension DLL FWLaunch.DLL.
//
// **************** Commands API *****************
    
function canAcceptCommand()
{
  var retVal = false;
  // First validate that there's a document
  var dom = dw.getDocumentDOM();
  if (dom) {
    // Don't bother to check if a valid version of Fireworks is installed, 
  	// because we'll alert the user later about where they can download
  	// Fireworks for a free trial if they don't have it installed. 
    // return TRUE if an image is selected
    var node = dom.getSelectedNode();
    if (node != null && node.nodeType == Node.ELEMENT && node.tagName  == "IMG"  && node.getAttribute( "src" )){
	  var src = node.getAttribute( "src" );
//	  if ( dom.IsImageLocked( src ) == false )
		retVal = true;
    }
  }
  return retVal;
}
   
//---------------    LOCAL FUNCTIONS   ---------------

   function optimizeImage()
   {
      var dom = dw.getDocumentDOM();

      // If we can't find the FWLaunch extension, abort.
      if (typeof( FWLaunch ) == "undefined")
      {
        alert( MSG_Err_FireworksDllNotInstalled );
        return;
      }
	  
	  // Dreamweaver now keeps an preference referencing the
	  //	version of Fireworks the user wants to use. Get
	  //	that and tell FWLaunch about it.
	  var fireworksPath = dw.getFireworksPath();
	  if( fireworksPath != null ) 
	  {
		  FWLaunch.setFireworksPath(fireworksPath[1]);
	  }
	  // else if null, things are probably about to go south
	  //	Might want to put up an alert at this point

   	  // If they don't have Fireworks 2 or greater installed, give them 
      // the link to the Macromedia site so they can get a free trial version.
      if ( !FWLaunch.validateFireworks(2.0) )
      {
        alert( MSG_Err_FireworksNotInstalled );
        return;
      }
	  
      // First check to see if we may launch a session; this
      // currently always returns TRUE for windows, but may
      // return FALSE on the Mac if there's already an 
      // optimization session in progress
      //
      if ( !FWLaunch.mayLaunchFireworks() )
      {
         alert( MSG_Err_MayNotLaunch );
         return;
      }
   
      // Make sure the file has been saved to disk first so
      // we know the document path (which the DLL uses, 
      // among other things, to resolve doc-relative urls
      // and determine working directory (on windows)).
      //
      if (dom.URL == "" ) {
         if (confirm(MSG_Err_FileNotSaved) && dw.canSaveDocument(dom)) {
           dw.saveDocument(dom);
         }
         if (dom.URL == "" )
           return;
         //otherwise file saved, so continue
      }
      // canAcceptCommand() should have validated that the 
      // selection is an image node; go no further if we
      // don't have a valid SRC attribute
      //
      var node      = dom.getSelectedNode();
      var imageSrc  = node.getAttribute( "src" );
      var width     = node.getAttribute( "width" );
      var height    = node.getAttribute( "height" );

      if ( !imageSrc )
      {
         alert( MSG_Err_InvalidUsage );
         return;
      }
      
      // Force width and height to invalid state if they're
      // not defined
      //
      if ( !width )
         width = -1;
         
      if ( !height )
         height = -1;
      
      // Fix up site relative URLs here...
      //
      var siteRoot = dw.getSiteRoot();
      if ( siteRoot )
      {
         if ( imageSrc.indexOf( '/' ) == 0 )
				 {
				    //remove the leading site url prefix				    
					  imageSrc = dw.getDocumentDOM().siteRelativeToLocalPath(imageSrc);
					  imageSrc = MMNotes.filePathToLocalURL(imageSrc);
				 }
      }

	  dw.fireworksCheckout( imageSrc );

      // Now invoke FWLaunch and process the return code
      //
      var rc = FWLaunch.optimizeInFireworks( unescape( dom.URL )
                                           , unescape( imageSrc ) 
                                           , width
                                           , height );
      switch( rc )
      {
         case 0:
            break; // success!
         
         case 1:
            alert( MSG_Err_InvalidUsage );
            break;
            
         case 2:
            alert( MSG_Err_ResponseFile );
            break;
            
         case 3:
            alert( MSG_Err_Dreamweaver );
            break;
         
         case 4:
            alert( MSG_Err_Fireworks );
            break;
            
         default:
            alert( MSG_Err_UnrecognizedRC + rc );
            break;
      }

      return;         
   }
