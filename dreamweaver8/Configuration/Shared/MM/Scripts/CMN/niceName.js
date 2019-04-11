//SHARE-IN-MEMORY=true
//
// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.
//
//niceName.js
//
//given a full object reference, create a user friendly name
//
//--------------------------------------------------------------
//
//
//niceNames(objRefArray,objTypeStr) {
//nameReduce (objName) {


//Converts an array of JS object references to an array of nice names.
//For example, document.layers['layr1'].document.form1.img1 becomes
//             image "img1" in form "form1" in layer "layr1"
//Assumes all objects are of type objTypeStr, and the last token is the name
//Note: I reverse the array of tokens to simplify nesting.

function niceNames(objRefArray,objTypeStr) {
  var i, j, niceRef, tokens;
  var niceNameArray = new Array(objRefArray.length);
  for (i in objRefArray) {  //with object reference array
    tokens = getTokens(objRefArray[i],".").reverse();   //split ref into tokens and rev order
    if (tokens.length > 1) {
      niceRef = objTypeStr + ' ' + nameReduce(tokens[0]);  //start building str, ie: image "foo"
      if (tokens.length > 2) {  //reference includes some nesting...
        if (tokens[1] != "document" && tokens[2] == "document") //inside form, add form reference
          niceRef += ' ' + MM.TYPE_Separator + ' ' + MM.TYPE_Form + ' ' + nameReduce(tokens[1]);
        for (j=1; j<tokens.length-1; j++) if (tokens[j].indexOf("layers[") == 0)
            niceRef += ' ' + MM.TYPE_Separator + ' ' + MM.TYPE_Layer + ' ' + nameReduce(tokens[j]);
        if (tokens[j] != "document")  //if top, parent, or window, expect frame
          niceRef += ' ' + MM.TYPE_Separator + ' ' + MM.TYPE_Frame + ' ' + nameReduce(tokens[j-1]);
      }
    } else niceRef = objRefArray[i];
    niceNameArray[i] = niceRef;
  }
  return niceNameArray;
}



//Extracts a name or num from array string and quotes if necessary. So
// myImg         => "myImg"
// layers['foo'] => "foo"
// embeds[0]     => 0
// myImg[2]      => "myImg[2]"

function nameReduce (objName) {
  var retVal, arrayTokens, pos;

  retVal = '"' + objName + '"';  //default is object wrapped in quotes
  if ((pos=objName.indexOf("[")) > 0) {  //if it's an array
    arrayTokens = getTokens(objName,"[]\"'");  //break up tokens
    if (arrayTokens.length == 2) {  //if exactly two tokens
      if ("frames layers forms embeds links anchors all".indexOf(arrayTokens[0]) != -1) { //if legal
        if (arrayTokens[1] == ""+parseInt(arrayTokens[1])) //if a number
          retVal = arrayTokens[1];
        else                                               //else it's a string
          retVal = '"' + arrayTokens[1] + '"';
      } else { //move bracket number outside of quotes
        retVal = '"'+objName.substring(0,pos)+'"'+objName.substring(pos);  //image1[0] => "image1"[0]
      }
    }
  }
  return retVal;
}



