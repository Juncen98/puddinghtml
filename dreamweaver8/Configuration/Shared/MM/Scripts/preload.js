// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.
//
// preload.js
//
// Service for adding and deleting preload calls to
// the BODY/onLoad MM_preloadImages handler.
//
// Call from applyBehavior() and deleteBehavior(). There may be prior calls where some can be
// removed and new ones added.
//
//--------------------------------------------------------------
//   
// preloadUpdate(newImagesToPreload, oldImagesPreloaded, preDeleteFlag);
// -------------
//    newImagesToPreload    - an array of images that may need adding to the preload call
//    oldImagesPreloaded    - an array of images that may exist in preload call that should be
///                           deleted if not in newImagesToPreload array
//    preDeleteFlag         - true if pre-delete (I expect there to be 1 user of this image)
//                            false if post-delete (I expect there to be no users of this image)
// Usage
// -----
//   preloadUpdate(imgArray)                  //adds images to preloader
//   preloadUpdate(newImgArray,oldImgArray,1) //for applyBehavior, removes old, adds new, delete if 1 user
//   preloadUpdate("",oldImgArray,0)          //for deleteBehavior, removes old, delete if 0 users
//


function preloadUpdate(newArray,oldArray,preDelete) {
  if (!newArray) newArray = new Array();
  if (!oldArray) oldArray = new Array();
  var imgsToDel = new Array();
  var i, j;

  for (i=0; i<oldArray.length; i++) { //build up images to delete
    for (j=0; j<newArray.length && newArray[j]!=oldArray[i]; j++);
    if (j==newArray.length) imgsToDel.push(oldArray[i]);
  }
  if (imgsToDel.length){
    preloadDel(imgsToDel,preDelete);
  }
  if (newArray.length){
    preloadAdd(newArray);
  }
}



function preloadAdd(imgArr){
  var i, bodyNode = dw.getDocumentDOM().body;

  for (i=0;i<imgArr.length;i++) {
    if (!preloadImagePreloaded(bodyNode.onLoad,imgArr[i]) ){
      bodyNode.onload = preloadAddImgToHandler(bodyNode.onLoad,imgArr[i]);
    }
  }
}

function preloadDel(imgArr,preDelete){
   var bodyNode = dw.getDocumentDOM().body;
   var entireDoc = dw.getDocumentDOM().documentElement.innerHTML;
   var i, currImg, users;
   
   preDelete = (preDelete)? 1 : 0;
   for (i=0;i<imgArr.length;i++){
     currImg = imgArr[i];

     //find MM_????(???? 'imagename' ???1);
     pattPreloadUsers = new RegExp("MM_\\w+\\([^)]*'" +currImg.replace(/\|/g,"\\\|")+ "'[^)]*,1\\)","g");

     if (preloadImagePreloaded(bodyNode.onload,currImg) ){ //if already there
       users = entireDoc.match(pattPreloadUsers);
       if (!users || users.length <= preDelete) {    //if zero or one user of this preload (me)
         var newOnLoad = preloadDelImgFromHandler(bodyNode.onload,currImg);
         if (newOnLoad) {
           bodyNode.onload = newOnLoad;
         } else { //nothing there, so remove it
           delHandler(bodyNode,'onLoad','MM_preloadImages');
         }
       }
     }
   }
}



// description: determine if image is already preloaded in the onload event
// of the body tag

function preloadImagePreloaded(onLoadVal,imgName){
   // If file hasn't been saved, imgName will start with file:///, followed by,
   // in Windows, the drive letter and a pipe. This pipe is significant in 
   // regular expressions, so we have to escape it before performing the search,
   // or the exec will match the wrong thing and only one image will be added
   // to the preload (even if there are many to be added).
   imgName = imgName.replace(/\|/,'\\|');
   var fnPatt = new RegExp(imgName);
   return ( fnPatt.exec(onLoadVal) != null );
}


function preloadAddImgToHandler(onLoadVal,imgName){
   var fnCalls, endPoint, i, currCall, bFoundPreloadCall, imgNameQuoted = "'"+imgName+"'";

   if ( onLoadVal ) fnCalls = dw.getTokens(onLoadVal,";");
   if ( !fnCalls ) fnCalls = new Array();
   
   // go through function calls in body onload handler, and add
   // the image to the first MM_preloadImages call that doesn't
   // have a preload ID in it. Not adding the image
   // to a function with a preload ID ensures backward compatibility
   
   for (i=0;i<fnCalls.length;i++){
     bFoundPreloadCall = false;
     currCall = fnCalls[i]; 
     if ( currCall.indexOf("MM_preload") != -1 && currCall.indexOf("#") == -1  ){ // if call exists & no preload ID
       if (currCall.indexOf(imgNameQuoted)==-1) { //if img not already there
         //add img to this function call
         endPoint = currCall.lastIndexOf(")"); // index of last )
         if (endPoint != -1) {
           currCall = currCall.substring(0,endPoint) + "," + imgNameQuoted + currCall.substring(endPoint);
           fnCalls[i] = currCall;
       } }
       bFoundPreloadCall = true;
       break;
   } }
   if ( !bFoundPreloadCall ){
     fnCalls[fnCalls.length] = "MM_preloadImages(" + imgNameQuoted + ")";
   }
   return fnCalls.join(";");
}



function preloadDelImgFromHandler(onLoadVal,imgName){
   var fnCalls, retVal;
   var fnArgs, patt, i, currCall, imgNameQuoted = "'"+imgName+"'";

   if ( onLoadVal ) fnCalls = dw.getTokens(onLoadVal,";");
   if ( !fnCalls ) fnCalls = new Array();
   
   for (i=0;i<fnCalls.length;i++){
     bFoundPreloadCall = false;
     currCall = fnCalls[i]; 
     if ( currCall.indexOf("MM_preloadImages") != -1 && currCall.indexOf("#") == -1  ){ // if call exists & no preload ID
       if (currCall.indexOf(imgNameQuoted)!=-1) { //if img already there
         patt = new RegExp(""+imgNameQuoted.replace(/\|/g,"\\\|")+"");
         currCall = currCall.replace(patt,"");           //remove call
         currCall = currCall.replace(/\,{2,}/, "\,");    //remove extra commas
         currCall = currCall.replace(/\(\s*\,/, "\(");   //remove (,
         currCall = currCall.replace(/\,\s*\)/, "\)");   //remove ,)
         currCall = currCall.replace(/\s*MM_preloadImages\s*\(\s*\)\s*/, ""); //if last arg, remove function
         fnCalls[i] = currCall;
         break;
       }
     }
   }
   retVal = fnCalls.join(";");
   retVal = retVal.replace(/;{2,}/, ";"); //remove extra ;
   return retVal
}
