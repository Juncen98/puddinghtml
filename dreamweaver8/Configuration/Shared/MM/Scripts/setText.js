// Copyright 2000, 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.


//**************** GENERIC FUNCTIONS ****************

function escExprStr(theStr,isHTML){
  var isMac = (navigator.platform != "Win32");
  var newline = (isMac)? "\x0D" : "\x0D\x0A";
  var i, theChar="", inStr=true, braceCtr=0, escStr="";
  for (i=0; i<theStr.length; i++) {
    theChar = ""+theStr.charAt(i); //get char, convert to string
    if ((theChar == "{" || theChar == "}") && (i==0 || theStr.charAt(i-1) != "\\")) { //if switching modes
      inStr = (theChar == "}"); //set inStr to false when entering {region}
      braceCtr += (inStr)? -1 : 1;
      if (braceCtr<0 || braceCtr>1) break; //bad braces, bail out
      theChar = (inStr)? ")+'" : "'+(";
    } else if (inStr) { //only if in a string
      if (theChar == "\\" && i<theStr.length-1 && (theStr.charAt(i+1)=="{" || theStr.charAt(i+1)=="}"))
        theChar = ""; //skip escapes for {} (show literal brace)
      if (isHTML) {
		if (theChar != " ") theChar = dwscripts.minEntityNameEncode(theChar); //entity-encode the char if needed
      } else if (theStr.substring(i,theStr.length).indexOf(newline) == 0) { //find \r\n or \n (mac)
        theChar = "\\"+"r"; //make \r for JS
        i += newline.length - 1;
      } else { //normal, non-html
        theChar = theChar.replace(/\\/,"\\\\"); //escape \
      }
      //escape quotes, requires 2 calls due to RegExp bug
      theChar = theChar.replace(/\'/,"\\'");  //escape '
      theChar = theChar.replace(/\"/,"\\\""); //escape "
    } else { //in expression
      theChar = theChar.replace(/[\x0A\x0D]/g,""); //remove newlines
    }
    escStr += theChar; //add to new string
  }
  if (braceCtr!=0) escStr = null; //bad braces, return error code null
  else escStr = escStr.replace(/\'\+\(\)\+\'/g,""); //remove any empty expressions
  return escStr;
}


function unescExprStr(theStr,isHTML){
  var isMac = (navigator.platform != "Win32");
  var newline = (isMac)? "\x0D" : "\x0D\x0A";
  if (!theStr) theStr="";
  else theStr = dwscripts.minEntityNameDecode(theStr);
  if (isHTML) { //re-escape all literal braces { or }
    theStr = theStr.replace(/\%7B/g,"\\{");
    theStr = theStr.replace(/\%7D/g,"\\}");
  } else {
    theStr = theStr.replace(/\{/g,"\\{");
    theStr = theStr.replace(/\}/g,"\\}");
  }
  theStr = theStr.replace(/['"]\s*\+\s*\(/g,"{"); //replace any '+( or "+( with {
  theStr = theStr.replace(/\)\s*\+\s*['"]/g,"}"); //replace any )+' or )+" with }
  theStr = theStr.replace(/\\(['"\x5C])/g,"$1");  //unescape all ',",\
  if (isHTML) {
    theStr = unescape(theStr);
  } else {
    theStr = theStr.replace(/\\r/g,newline); //convert \r back to \r\n
  }
  return (theStr);
}


function extractExprStr(behFnCallStr){
  var i, theStr, lastPos, argArray;

  behFnCallStr = behFnCallStr.replace(/^[^\(]+\(/, ""); //remove outer fn call stuff "fn("
  behFnCallStr = behFnCallStr.replace(/\);?$/, "");        //remove outer fn call stuff ")"
  argArray = dreamweaver.getTokens(behFnCallStr,",");
  for (i=0; i<argArray.length; i++) {
    argArray[i] = argArray[i].replace(/\\(['"])/g,"$1"); //unescape quotes
    argArray[i] = argArray[i].replace(/^\s*['"]/,""); //remove leading quote
    argArray[i] = argArray[i].replace(/['"]\s*$/,""); //remove trailing quote
  }
  return argArray
}
