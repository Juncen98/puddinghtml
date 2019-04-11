//SHARE-IN-MEMORY=true
//
// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.
//
//handler.js
//
//Correctly handle the getting, setting, and deleting of function calls
//in event handlers
//
//--------------------------------------------------------------
//
//
//getHandler(obj,eventName,fnName, optStr) 
//setHandler(obj,eventName,fnCall, optStr) {
//delHandler(obj,eventName,fnName, optStr) {


//Returns a function call if exists in event handler.
//  obj       - DOM object, such as dreamweaver.getDocumentDOM().body
//  eventName - "onLoad", "onClick" etc (not case sensitive)
//  fnName    - "MM_preloadImages" etc.
//  optStr    - (optional) function call must contain this string to be found
//Given <TAG onEvent="aaa();bbb();ccc()">,
//calling getHandler(tagObj,'onEvent','bbb') will
//return "bbb()". Returns empty if event or fn don't exist.

function getHandler(obj,eventName,fnName, optStr) {
  var eventStr,fnArray,i,theChunk,retVal = "";
  eventStr = obj.getAttribute(eventName);
  if (eventStr) { //find previous call, or add it
    fnArray = dreamweaver.getTokens(eventStr,";");
    for (i=0; i<fnArray.length; i++) { //look at each code chunk
      if (fnArray[i].indexOf(fnName+'(') != -1 && (!optStr ||  //fn call found
          fnArray[i].indexOf(optStr) != -1)) {
        retVal = fnArray[i]; break;
    } }
  }
  return retVal
}



//Replaces or adds a fn call to an event handler
//  obj       - DOM object, such as dreamweaver.getDocumentDOM().body
//  eventName - "onLoad", "onClick" etc (not case sensitive)
//  fnCall    - "myFun('arg1','arg2')" etc.
//  optStr    - (optional) function call must contain this string to be found
//Given <TAG onEvent="aaa();bbb();ccc()">,
//calling setHandler(tagObj,'onEvent','bbb(1,2)') will
//replace "bbb()" with the altered fn call. If the event
//does not exist, adds it. It fn didn't exist, adds it to the
//end of the list.

function setHandler(obj,eventName,fnCall, optStr) {
  var eventStr,fnName,fnArray=new Array(),i=0;
  eventStr = obj.getAttribute(eventName);
  if (eventStr) { //if event exists
    fnName = fnCall.substring(0,fnCall.indexOf("("));
    fnArray = dreamweaver.getTokens(eventStr,";");
    for (i; i<fnArray.length; i++) //search for fnName
      if (fnArray[i].indexOf(fnName+'(') != -1 && (!optStr ||  //fn call found
          fnArray[i].indexOf(optStr) != -1)) break;
  }
  //if last item is "return value;", insert before that
  if (fnArray.length>0 && i==fnArray.length && fnArray[i-1].toLowerCase().indexOf("return ")==0) {
    fnArray[i] = fnArray[i-1]; //shift last value over one
    i--; //set it to add new value in second-to-last position
  }
  fnArray[i] = fnCall; //adds fn to the end
  obj.setAttribute(eventName,fnArray.join(";"));
  return true
}



//Deletes a fn call from an event handler
//  obj       - DOM object, such as dreamweaver.getDocumentDOM().body
//  eventName - "onLoad", "onClick" etc (not case sensitive)
//  fnName    - "MM_preloadImages" etc.
//  optStr    - (optional) function call must contain this string to be found
//Given <TAG onEvent="aaa();bbb();ccc()">,
//calling delHandler(tagObj,'onEvent','bbb') will
//remove "bbb();". If it is the last fn in the handler,
//removes the event entirely.

function delHandler(obj,eventName,fnName, optStr) {
  var eventStr,fnArray=new Array(),i=0,j;
  eventStr = obj.getAttribute(eventName);
  if (eventStr) { //if event exists
    fnArray = dreamweaver.getTokens(eventStr,";");
    for (i; i<fnArray.length; i++) { //look at each code chunk
      if (fnArray[i].indexOf(fnName+'(') != -1 && (!optStr ||  //fn call found
          fnArray[i].indexOf(optStr) != -1)) { //and, if given, optStr exists
        if (fnArray.length == 1) { //if last one, remove attribute
          obj.removeAttribute(eventName);
        } else { //pull out
          for (j=i; j<fnArray.length; j++) fnArray[j] = fnArray[j+1]; //shift array
          fnArray.length--;
          obj.setAttribute(eventName,fnArray.join(';'));
        }
        break;
    } }
  }
  return true
}
