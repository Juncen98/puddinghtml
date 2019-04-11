//SHARE-IN-MEMORY=true//// Copyright 2000, 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.////string.js////Generic set of functions for manipulating and parsing text strings////------------------------------------------------------------------//////extractArgs(behFnCallStr){//escQuotes(theStr){//unescQuotes(theStr){//quoteMeta(theStr){//errMsg() {//badChars(theStr){//getParam(tagStr,param){//quote(textStr,quoteType){//stripSpaces(theStr) {//StripChars(theFilter,theString) //Strips all chars in theFilter out of theString and returns the result//AllInRange(x,y,theString) //Returns true if all of the chars in theString are in the range x,y (inclusive)//reformat (s) //tricky: see desc below//Trim(theString) //returns theString with white space trimmed of the front and back//createDisplayString(theStr, maxLen) //limits string size and appends ellipsis: fn("foo bar zoo",6) => "foo..."//entityNameEncode(origStr) //Given a string, returns the string with high-ASCII chars entity encoded.//entityNameDecode(origStr) //Given a string, returns the string with high-ASCII chars entity decoded.//stripAcceralator(theStr) // Strips Acceralator characters (_E) for Japanese//SPrintF(pattern, strings);  //SPrintF routine. accepts %s or %s1, etc...//Given a function call, extracts the args and returns them in array//Respects ', skips over stuff between quotes, and returns them dequoted.//IMPORTANT: argArray[0] is the function call!! Actual args start at argArray[1].function extractArgs(behFnCallStr){  var i, theStr, lastPos, argArray;  argArray = getTokens(behFnCallStr,"(),");  for (i=0; i<argArray.length; i++) {    theStr = stripSpaces(unescQuotes(argArray[i]));    lastPos = theStr.length-1;    if (theStr.charAt(0) == "'" && lastPos > 0 && theStr.charAt(lastPos) == "'")      argArray[i] = theStr.substring(1,lastPos);  }  return argArray}//Passed a string, finds special chars '"\ and escapes them with \function escQuotes(theStr){  return theStr.replace(/(["'\\])/g, "\\$1");}//Passed a string, finds any escape chars \ and removes themfunction unescQuotes(theStr){  return theStr.replace(/\\(.)/g, "$1");}//Passed a string, finds meta chars and escapes them with \function quoteMeta(theStr){  return theStr.replace(/([\\[{^])/g, "\\$1");}//Emulates printf("blah blah %s blah %s",str1,str2)//Used for concatenating error message for easier localization.//Returns assembled string.function errMsg() {var i,numArgs,errStr="",argNum=0,startPos;  numArgs = errMsg.arguments.length;  if (numArgs) {    theStr = errMsg.arguments[argNum++];    startPos = 0;  endPos = theStr.indexOf("%s",startPos);    if (endPos == -1) endPos = theStr.length;    while (startPos < theStr.length) {      errStr += theStr.substring(startPos,endPos);      if (argNum < numArgs) errStr += errMsg.arguments[argNum++];      startPos = endPos+2;  endPos = theStr.indexOf("%s",startPos);      if (endPos == -1) endPos = theStr.length;    }    if (!errStr) errStr = errMsg.arguments[0];  }  return errStr;}//Passed a string, returns true if it contains any "bad" charactersfunction badChars(theStr){  return theStr.search(/[ ~!@#$%^&*()_+|`\-=\\{}[\]:";'<>,.\/?]/) != -1;}//Accepts a pattern string and some substrings (or numbers). Inserts the strings into the pattern. //The pattern string can use %s or %s0, etc for the strings. You can mix them if you like - the %s //pattern will ignore the %s0 pattern as far as count. //That is: //SprintF("%s%s2%s", "a", "b", "c") will return "acb"////Note that you can only have 10 indexed strings. function SPrintF()	{	var argc = SPrintF.arguments.length; 	if (argc == 0)		return ""; 			if (argc == 1)		return SPrintF.arguments[0]; 			var resultString = "";	var nextIndString = 1; 	var splits = SPrintF.arguments[0].split("%s"); 		for (i=0; i<splits.length; i++)		{		//write out the split itself. 		var splitToWrite = splits[i]; 		if (splitToWrite.length > 0 && !isNaN(splitToWrite.charAt(0)))			resultString += splitToWrite.substring(1,splitToWrite.length-1);		else			resultString += splitToWrite; 					//Now write out the next string in the list. See if the next string was part of 		//an %s0 pattern, or was normal. 		if (i < splits.length-1)			{			if (splits[i+1].length > 0 && !isNaN(splits[i+1].charAt(0)))				{				//use the indexed strng. 				var stringIndex = parseInt(splits[i+1].charAt(0));				resultString += SPrintF.arguments[stringIndex]; 							}			else				{				//Pick the next string out of the array. 				resultString += SPrintF.arguments[nextIndString++]; 				}			}		}			return resultString; 		} //SPrintF//Custom non-Javascript code to extract tags and get object names.//Passed HTML tag (ie IMG), gets the current doc source//HTML and returns an array of names (empty if unnamed).//This argument is not case sensitive (can be LAYER, Layer, or layer).//For Example, given <IMG NAME="myPhoto"> <IMG><IMG name="bobsPhoto">//returns array: myPhoto,,bobsPhotofunction getParam(tagStr,param){  var j,tokenString;  var theName = "";  var tokenArray = new Array;  tokenArray = getTokens(tagStr," =<>");  for (j=0; j<(tokenArray.length - 1); j++) {    tokenString = tokenArray[j].toUpperCase(); //force UPPER CASE    if (tokenString.indexOf(param.toUpperCase()) == 0) {  //found name      theName = tokenArray[j+1];  //should return single quoted element in array      firstChar = theName.charAt(0);      lastChar = theName.charAt(theName.length - 1);      if ((firstChar == lastChar) && (firstChar == "'" || firstChar == "\""))        theName = theName.substring(1,theName.length - 1);      break;  } }  return theName;}//function: quote//description: wraps text string in single or double quotes//argument - textStr//           quote type - use 1 for single quotes and 2 for double quotesfunction quote(textStr,quoteType){   var quote = (quoteType == 1)?"'":'"';   return quote + textStr + quote;}//Removes any spaces at the beginning or end of the stringfunction stripSpaces(theStr) {  if (!theStr) theStr = "";  //ensure its not null  theStr = theStr.replace(/^\s*/,""); //strip leading  theStr = theStr.replace(/\s+$/,""); //strip trailing  return theStr;}//Given an object reference string, returns the object name. For ex://  objName = getNameFromRef("document.image1"); //returns "image1"//  objName = getNameFromRef("document.layers['image1']"); //returns "image1"////If given an object in a frame, returns the objName?frameNameOrNum://  objName = getNameFromRef("parent.frames['main'].document.image1"); //returns "image1?main"//This is an expected value for MM_findObj().function getNameFromRef(objRefStr) {  var c, startPos, objName=objRefStr, frameSearch;  var lastDot = objRefStr.lastIndexOf(".");  var lastBracket = objRefStr.lastIndexOf("]");    if (lastDot != -1 || lastBracket != -1) {    if (lastDot > lastBracket) { //name after a dot      objName = objRefStr.substring(lastDot+1);    } else {                     //name in brackets      while (lastBracket > 0 && ((c=objRefStr.charAt(lastBracket-1))=="'" || c=='"' || c=="\\"))        lastBracket--;           //skip ',",\      startPos = lastBracket-1;  //start at end of name      while (startPos > 0 && ((c=objRefStr.charAt(startPos))!="'" && c!='"' && c!="\\" && c!="["))        startPos--;              //seek ',",\,[      objName = objRefStr.substring(startPos+1,lastBracket);    }    frameSearch = objRefStr.match(/\.frames\[\\?['"]?([^'"\\]+)\\?['"]?\]/);   //find .frames['foo'] or .frames[3]    if (frameSearch && frameSearch[1]) { //if framename, add after a question mark      objName += "?"+frameSearch[1];    }  }  return objName;}function StripChars(theFilter,theString){	if (!theString)		theString = "";	/*	Returns theString with all occurrences of every char in theFilter	deleted:	Example:	var x = StripChars("lo!", "Hello World!")	alert(x) // x is now "He Wrd"	*/	var strOut,i,curChar	strOut = ""	for (i=0;i < theString.length; i++)	{				curChar = theString.charAt(i)		if (theFilter.indexOf(curChar) < 0)	// if it's not in the filter, send it thru			strOut += curChar			}		return strOut}function AllInRange(x,y,theString){	/*		Returns true if all characters in theString 		fall in the range x,y (inclusive)		Example:		AllInRange("0", "9", "848393874") is true		AllInRange("0", "9", "22Hello33") is false	*/	var i, curChar		for (i=0; i < theString.length; i++)	{		curChar = theString.charAt(i)		if (curChar < x || curChar > y) //the char is not in range			return false	}	return true}function reformat (s){	/*	reformat()	params: 	s - the string to be reformatted	Then alternating numbers and strings	Example:	var x = reformat("7604346267", 0, "(", 3, ")", 3, "-")	alert(x) // x is now (760)434-6267	*/    var arg;    var sPos = 0;    var resultString = "";    for (var i = 1; i < reformat.arguments.length; i++) {       arg = reformat.arguments[i];       if (i % 2 == 1)            resultString += arg;       else        {           resultString += s.substring(sPos, sPos + arg);           sPos += arg;       }    }    return resultString;}function Trim(theString){	/*		Returns theString with white space trimmed off the front and back	*/	var i,firstNonWhite	if (StripChars(" \n\r\t",theString).length == 0 ) return ""	i = -1	while (1)	{		i++		if (theString.charAt(i) != " ")			break		}	firstNonWhite = i	//Count the spaces at the end	i = theString.length	while (1)	{		i--		if (theString.charAt(i) != " ")			break		}		return theString.substring(firstNonWhite,i + 1)}function IsValidVarName(theName){	if (!MM.allowDotInName)	{		if (StripChars("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_",theName).length > 0)			return false;	}	else	{		if (StripChars("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_.",theName).length > 0)			return false;	}		if (theName.charAt(0) == "_" || theName.charAt(theName.length - 1) == "_")		return false;	if (MM.allowDotInName)	{		if (theName.charAt(0) == "." || theName.charAt(theName.length - 1) == ".")			return false;	}	if (AllInRange("0", "9", theName.substring(0,1)))		return false;	return true;}//Returns a single-line string with entities replaced.//If optional maxLen param is passed, returns string//no longer than maxLen chars. If it exceeds that length, it is//shortened and ... is appendend.function createDisplayString(theStr, maxLen) {  theStr = stripSpaces(theStr);  theStr = theStr.replace(/\s+/," "); //replace all newlines and whitespace with a single space  theStr = entityNameDecode(theStr);  if (maxLen && maxLen>3 && theStr.length>maxLen) theStr = theStr.substring(0,maxLen-3) + "...";  return theStr;}var ENTITY_MAP = new Array( "\x20", "&nbsp;", "\x22", "&quot;",   //Low-ASCII chars that should use entities "\x26", "&amp;", "\x3C", "&lt;", "\x3E", "&gt;", "\x80", "&euro;",   //Hi-ASCII chars "\xA1", "&iexcl;", "\xA2", "&cent;", "\xA3", "&pound;", "\xA4", "&curren;", "\xA5", "&yen;", "\xA6", "&brvbar;", "\xA7", "&sect;", "\xA8", "&uml;", "\xA9", "&copy;", "\xAA", "&ordf;", "\xAB", "&laquo;", "\xAC", "&not;", "\xAD", "&shy;", "\xAE", "&reg;", "\xAF", "&macr;", "\xB0", "&deg;", "\xB1", "&plusmn;", "\xB2", "&sup2;", "\xB3", "&sup3;", "\xB4", "&acute;", "\xB5", "&micro;", "\xB6", "&para;", "\xB7", "&middot;", "\xB8", "&cedil;", "\xB9", "&sup1;", "\xBA", "&ordm;", "\xBB", "&raquo;", "\xBC", "&frac14;", "\xBD", "&frac12;", "\xBE", "&frac34;", "\xBF", "&iquest;", "\xD7", "&times;", "\xF7", "&divide;", "\xC6", "&AElig;", "\xC1", "&Aacute;", "\xC2", "&Acirc;", "\xC0", "&Agrave;", "\xC5", "&Aring;", "\xC3", "&Atilde;", "\xC4", "&Auml;", "\xC7", "&Ccedil;", "\xD0", "&ETH;", "\xC9", "&Eacute;", "\xCA", "&Ecirc;", "\xC8", "&Egrave;", "\xCB", "&Euml;", "\xCD", "&Iacute;", "\xCE", "&Icirc;", "\xCC", "&Igrave;", "\xCF", "&Iuml;", "\xD1", "&Ntilde;", "\xD3", "&Oacute;", "\xD4", "&Ocirc;", "\xD2", "&Ograve;", "\xD8", "&Oslash;", "\xD5", "&Otilde;", "\xD6", "&Ouml;", "\xDE", "&THORN;", "\xDA", "&Uacute;", "\xDB", "&Ucirc;", "\xD9", "&Ugrave;", "\xDC", "&Uuml;", "\xDD", "&Yacute;", "\xE1", "&aacute;", "\xE2", "&acirc;", "\xE6", "&aelig;", "\xE0", "&agrave;", "\xE5", "&aring;", "\xE3", "&atilde;", "\xE4", "&auml;", "\xE7", "&ccedil;", "\xE9", "&eacute;", "\xEA", "&ecirc;", "\xE8", "&egrave;", "\xF0", "&eth;", "\xEB", "&euml;", "\xED", "&iacute;", "\xEE", "&icirc;", "\xEC", "&igrave;", "\xEF", "&iuml;", "\xF1", "&ntilde;", "\xF3", "&oacute;", "\xF4", "&ocirc;", "\xF2", "&ograve;", "\xF8", "&oslash;", "\xF5", "&otilde;", "\xF6", "&ouml;", "\xDF", "&szlig;", "\xFE", "&thorn;", "\xFA", "&uacute;", "\xFB", "&ucirc;", "\xF9", "&ugrave;", "\xFC", "&uuml;", "\xFD", "&yacute;", "\xFF", "&yuml;");//If a string has high-ASCII characters or low-ASCII that should be encoded, those characters//are converted to entities. For example, and accented "e" will become &egrave;.//Note that this does not affect low ascii chars that should be encoded like <>".//Uses the entity map above (ENTITY_MAP). If a high-ASCII char is not found in//the map, sets the char to &#nnn;, where nnn is the charCode.//Returns the encoded string.function entityNameEncode(origStr) { var i,j, retStr;    retStr = origStr;    var charCode, hasEntity = false;  for (i=0; i<retStr.length && !hasEntity; i++) {    charCode = retStr.charCodeAt(i);    // if  high-ASCII, ", &, <, or >    hasEntity = (charCode > 127 || charCode == "\x22" || charCode == "\x26" || charCode == "\x3C" || charCode == "\x3E");    //DEBUG: for Japanese, don't encode if high-ASCII. Need to modify the previous line for the J release.  }  if (hasEntity) {   // iff entity found, entity-encode string    oldStr = retStr;                     //copy string    retStr = "";                         //and build new one    for (i=0; i<oldStr.length; i++) {      charCode = oldStr.charCodeAt(i);      theChar = oldStr.charAt(i);      if (charCode > 127 || charCode == "\x22" || charCode == "\x26" || charCode == "\x3C" || charCode == "\x3E") {         for (j=0; j<ENTITY_MAP.length-1; j+=2) {  //search map          if (ENTITY_MAP[j] == theChar) { //if found            theChar = ENTITY_MAP[j+1];    //set theChar to matching entity            break;          }        }        if (j >= ENTITY_MAP.length) {     //if not found in map          theChar = '&#' + parseInt(charCode) + ';';  //set to integer        }      }      retStr += theChar;                  //append char to string    }  }  return retStr;}//If a string contains encoded strings like &quot; or &egrave;, they will be converted//to their character equivalents for proper display. Returns the decoded string.function entityNameDecode(origStr) {  var i, theEntity, retStr = origStr;  var entityPattern = /&\w+;/g;  while ((theEntity = entityPattern.exec(origStr)) != null) { //with each entity found    for (i=1; i<ENTITY_MAP.length; i+=2) {              //look up entity in map      if (ENTITY_MAP[i] == theEntity) {                 //when found        retStr = retStr.replace(RegExp(ENTITY_MAP[i]),(ENTITY_MAP[i-1])); //replace entity with value        break;      }    }  }  return retStr;}function stripAcceralator(theStr){	if (dreamweaver.appVersion && dreamweaver.appVersion.indexOf('Mac') != -1)	{		theStr = theStr.replace(/\(_\w+\)/,"");	}	return theStr;}function httpError(statusCode){	var statusMessage = "";	switch (statusCode)	{		case 200:		{			statusMessage = MM.MSG_HTTP200;			break;		}		case 400:		{			statusMessage = MM.MSG_HTTP400;			break;		}		case 404:		{			statusMessage = MM.MSG_HTTP404;			break;		}		case 405:		{			statusMessage = MM.MSG_HTTP405;			break;		}		case 500:		{			statusMessage = MM.MSG_HTTP500;			break;		}		case 503:			{			statusMessage = MM.MSG_HTTP503;			break;		}	}	return statusMessage;}