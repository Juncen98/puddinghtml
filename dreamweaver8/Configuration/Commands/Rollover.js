//
// Copyright 1998, 1999, 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved. 
// ----------------------------------------------------
//
// Rollover.js
//
// Implementation of Rollover Image object
//

//********************* GLOBALS **************************

var helpDoc = MM.HELP_objRolloverImage;

//********************* API **************************
    
function commandButtons()
{
   return new Array( MM.BTN_OK,     "setRolloverTag()" 
                   , MM.BTN_Cancel, "cancelRolloverTag()"
                   , MM.BTN_Help,   "displayHelp()");
}


//**************** LOCAL FUNCTIONS *******************

// initializeUI()
//
// Called from rollover body onload
//
function initializeUI()
{
  document.rolloverForm.tbImageName.value = getUniqueImgName();
  document.rolloverForm.tbImageName.focus();
  document.rolloverForm.tbImageName.select();
}


function setRolloverTag() {
   with( document.rolloverForm ) {
      // Validate that we at least have an original 
      // and a rollover image
      //
      if ( tbRolloverImage.value == "" ||
           tbOriginalImage.value == "" )
      {           
         alert( MSG_NoImagesToInsert );
         return;
      }

      // We require a unique image name; the form was initialized 
      // with one; if the user has deleted it or has chosen a non
      // unique name, warn and regenerate one
      //      
      if ( tbImageName.value == "" )
      {
         alert( MSG_NoImageName );
         tbImageName.value = getUniqueImgName();
         return;      
      }
      else
      if ( !validateUniqueImgName( tbImageName.value ) )
      {
         alert( MM_format( MSG_NameNotUnique, tbImageName.value ) );
         tbImageName.value = getUniqueImgName();
         return;      
      }

      // Build an image tag with a unique name for the original image
      //
      var imgTagFmt     = "<img name=\"%s\" border=\"0\" src=\"%s\"%s>";
      var altText       = (tbAltText.value == "")?"":" alt=\"" + tbAltText.value + "\""
      var imgName       = tbImageName.value;
      var imgTag        = MM_format( imgTagFmt
                                   , imgName
                                   , dw.doURLEncoding( tbOriginalImage.value )
                                   , altText );
                                   
      // Quote note: the final behavior string will be applied
      // by swap image applyBehavior(), which will escape URLs
      // and escape-quote references.  The string we generate 
      // here is passed directly to inspectBehavior(), and our
      // image references must match the image references as it
      // loads them in it's initializeUI.  We don't need to escape
      // all quotes here to make this match, but we do on imgName
      // as *unbalanced* single quotes will throw off getTokens()
      // which is used by inspectBehavior() to parse this argument
      // string.
      //                                   

      //For DW3, we simplified calls to MM_swapImage(), just pass simple name
      //var nsImageRef    = getFullImgRef( "NS 4.0", imgName );
      //var ieImageRef    = getFullImgRef( "IE 4.0", imgName );

      var nsImageRef    = imgName;
      var ieImageRef    = "";
      
      // Now build the wrapper anchor tag with the swap image
      // event handlers around this image to return
      //
      var anchorTagFmt    = "<a href=\"%s\" onMouseOut=\"%s\" onMouseOver=\"%s\">%s</a>";
      var gotoURL         = (tbURL.value == "")? "#" : dw.doURLEncoding( tbURL.value );
      var swapImageFnCall = null;

      // Note that a preload flag of 1
      // tells inspectBehavior() to install the proper
      // preload call in the documents onload handler
      //
      var swapImageFmt = "MM_swapImage('%s','%s','%s',%s)";
      var preloadFlag = ( cbPreloadImages.checked )? "1" : "0";
      swapImageFnCall  = MM_format( swapImageFmt
                                  , nsImageRef
                                  , ieImageRef
                                  , dw.doURLEncoding( tbRolloverImage.value )
                                  , preloadFlag );
      
      MM.commandReturnValue = MM_format( anchorTagFmt
                             , gotoURL
                             , "MM_swapImgRestore()"
                             , swapImageFnCall
                             , imgTag );
      window.close();                             
   }
}

function cancelRolloverTag()
{
   MM.commandReturnValue = "";
   window.close()
}

//
// --------- Local Rollover functions ---------
//

// getFullImgRef()
//
// Return a full object name reference for the given 
// image name in the given browser.  The object name
// returned must match the object names for images
// expected by the swap image behavior
//
function getFullImgRef( browser, imgName )
{
   var framePrefix = "";
   var objectName  = "document." + escQuotes( imgName ); // see quote note

   // Always use a frame prefix even when image is in current
   // frame to match swap image behavior naming expectations   
   //
   var frameset = dw.getDocumentDOM( "parent" );
   if ( frameset )
   {
      var i;
      var current = dw.getDocumentDOM( "document" );                
      var frames  = frameset.getElementsByTagName( "frame" );
      for( i = 0; i < frames.length; i++ )
      {
         if ( current == dw.getDocumentDOM( "parent.frames[" + i + "]" ) )
         {
            var frameName = frames[i].getAttribute( "name" );
            if ( !frameName )
               framePrefix = "parent.frames[" + i + "].";
            else
               framePrefix = "parent.frames['" + frameName + "'].";
               
            break;                  
         }
      }
   }
   
   // Netscape considers layers in its hierarchical
   // containment/naming -- build an encompassing
   // layer refs string if any around our insertion 
   // point for the image
   //   
   if ( browser.indexOf( "NS" ) != -1 )
   {
      var dom        = dw.getDocumentDOM();
      var selArr     = dom.getSelection();
      var layerRefs  = new Array();
      
      buildNSLayerRefs( dom.layers, selArr[1], layerRefs );
      
      if ( layerRefs.length > 0 )
         return( framePrefix + layerRefs.join(".") + "." + objectName );
   }
   
   // else IE reference, or no NS layers
   return( framePrefix + objectName );
}

// buildNSLayerRefs()
//
// Given a dreamweaver document.layers array
// and an insertion point offset, recurse 
// encompassing layers, pushing layer references
// along the way into the given array
//
function buildNSLayerRefs( layers, ip, layerRefs )
{
   var layerOffsets;
   
   for( var i = 0; i < layers.length; i++ )
   {
      layerOffsets = dw.nodeToOffsets( layers[i] );
      
      // ips on boundaries are not within scope of tag
      if ( (ip > layerOffsets[0]) && (ip < layerOffsets[1]) )
      {                                                      
         // Push this layer reference; prefer ID to NAME to index
         var layerRef;
         var layerName = layers[i].getAttribute( "id" );
         
         if ( !layerName )
            layerName = layers[i].getAttribute( "name" );
            
         if ( layerName )
            layerRef = "document.layers['" + layerName + "']";
         else
            layerRef = "document.layers[" + i + "]";
         
         layerRefs.push( layerRef );

         // Dive into this layer's layers if there are any         
         if ( layers[i].document.layers )
            buildNSLayerRefs( layers[i].document.layers, ip, layerRefs );
            
         break;               
      }
   }
}

// getUniqueImgName()
//
// This guy returns a unique image name that
// doesn't exist as yet in the user's document.
// 
function getUniqueImgName()
{
   var frameset      = dw.getDocumentDOM( "parent" );
   var existingImgs  = new Array();
   var i;
   
   if ( frameset )
   {
      var nFrames = frameset.getElementsByTagName( "frame" ).length;
      for( i = 0; i < nFrames; i++ )
         existingImgs = existingImgs.concat( dw.getDocumentDOM( "parent.frames[" + i + "]" ).getElementsByTagName( "IMG" ) );
   }
   else
   {
      existingImgs = dw.getDocumentDOM( "document" ).getElementsByTagName( "IMG" );
   }
   
   var   namePrefix = "Image";
   var   nameIdx    = existingImgs.length + 1;
   var   imgName    = namePrefix + nameIdx++;
   var   bExists    = false;
   
   while( true )
   {
      bExists = false;
      for( i = 0; i < existingImgs.length; i++ )
      {
         if ( existingImgs[i].getAttribute( "name" ) == imgName )
         {
            bExists = true;
            break;
         }
      }
      
      if ( !bExists )
         break;
      
      imgName = namePrefix + nameIdx++;
   }

   return imgName;
}

// validateUniqueImgName()
//
// Given an image name, return true if it is unique, 
// false otherwise
//
function validateUniqueImgName( imgName )
{
   var frameset      = dw.getDocumentDOM( "parent" );
   var existingImgs  = new Array();
   var i;
   
   if ( frameset )
   {
      var nFrames = frameset.getElementsByTagName( "frame" ).length;
      for( i = 0; i < nFrames; i++ )
         existingImgs = existingImgs.concat( dw.getDocumentDOM( "parent.frames[" + i + "]" ).getElementsByTagName( "IMG" ) );
   }
   else
   {
      existingImgs = dw.getDocumentDOM( "document" ).getElementsByTagName( "IMG" );
   }
   
   for( i = 0; i < existingImgs.length; i++ )
      if ( existingImgs[i].getAttribute( "name" ) == imgName )
         return( false ); // name is not unique
      
   return( true );
}
