
// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.


//*************************GLOBALS**************************


var didInitResults = false;

var blockFileName = 'none';
var blockLineStart = 1;
var blockOffsetStart = 0;


//*************************API**************************


function startBlock(fileName, lineNumber, offset)
{
   blockFileName = fileName;
   blockLineStart = new Number(lineNumber);
   blockLineStart = blockLineStart.valueOf();
   blockOffsetStart = new Number(offset);
   blockOffsetStart = blockOffsetStart.valueOf();
}

function getStartFunctionInstrument(lineNumber, offset, isInFunction)
{
   return "{MM_Depth++}";
}

function getEndFunctionInstrument(lineNumber, offset, isInFunction)
{
   return "{MM_Depth--}";
}

function getOnUnloadInstrument()
{
   var str = "MM_disconnectDbg();";
   return str;
}

function reportWarning(filePath, fileName, errorNumber, strDesc, lineNumber, offset)
{
   initResultsWin();

   var type = MM.MSG_dbgTypeWarning + ' ' + errorNumber;

   var args = processReportItemArgs(type, filePath, fileName, errorNumber, strDesc, lineNumber, offset);

   dw.runCommand("debugSyntaxResults.htm", "addItem", args[0], args[1], args[2], args[3], args[4]);
}

function reportError(filePath, fileName, errorNumber, strDesc, lineNumber, offset)
{
   initResultsWin();

   var type = MM.MSG_dbgTypeError + ' ' + errorNumber;

   var args = processReportItemArgs(type, filePath, fileName, errorNumber, strDesc, lineNumber, offset);

   dw.runCommand("debugSyntaxResults.htm", "addItem", args[0], args[1], args[2], args[3], args[4]);
   //dw.runCommand("debugSyntaxResults.htm", "addItem", desc, filePath, off1, off2, new Array(fileName, line, type, strDesc));
   //resultsWin.addItem(this, '', desc, filePath, off1, off2, new Array(fileName, line, type, strDesc));
   //resultsWin.addItem('', desc, off1, off2, fileName, line, type, strDesc);
   /*
   ///////// old way to do it
   dw.results.addResultItem(filePath, 
               '', //strIcon - path to icon to use. If a number between 1 and 10, use the built-in icon for that number (these will be specified later). 
               fileName, // string to display to user in first column (usually file name) 
               strDesc, // description to go along with entry 
               line,
               off1,
               off2);

   ///////// really really old way to do it
   dw.results.addResultItem(fileName, 
               '', //strIcon - path to icon to use. If a number between 1 and 10, use the built-in icon for that number (these will be specified later). 
               strDesc, // string to display to user in first column (usually file name) 
               strDesc, // description to go along with entry 
               lineNumber + blockLineStart,
               offset + blockOffsetStart,
               offset + blockOffsetStart+1);
   /////////
   alert("warning: line "+lineNumber+" of "+fileName+": "+strDesc);
   */
}



//*******************LOCAL FUNCTIONS*********************


function initResultsWin()
{
   // new way is in the debugSyntaxResults.htm command
   if ( !didInitResults ) {
      dw.runCommand("debugSyntaxResults.htm", "init", 
         MM.MSG_dbgResultsTitle, MM.MSG_dbgButtonGoTo, 
         new Array(MM.MSG_dbgColHeadFile, MM.MSG_dbgColHeadLine, MM.MSG_dbgColHeadType, MM.MSG_dbgColHeadDescription), 
         new Array(120, 40, 80, 330));
      didInitResults = true;
   }
   /*
   ///////// old way to do it
   var didInitResults = false;
   if ( !resultsWin ) {
      resultsWin = dw.createResultsWindow(MM.MSG_dbgResultsTitle, 
                     new Array(MM.MSG_dbgColHeadFile, MM.MSG_dbgColHeadLine, MM.MSG_dbgColHeadType, MM.MSG_dbgColHeadDescription));
      resultsWin.setColumnWidths(74, 40, 60, 330);
      resultsWin.setButtons(this, new Array(MM.MSG_dbgButtonGoTo, "goToLine()"));
      didInitResults = true;
   }
   ///////// really really old way to do it
   if ( !didInitResultsWin ) {
      dw.createResultsWindow();
      didInitResultsWin = true;
   }
   */
}


function processReportItemArgs(type, filePath, fileName, errorNumber, strDesc, lineNumber, offset)
{
   var desc = type + ' ' + strDesc;
   var line = new Number(lineNumber);
   line = line.valueOf() + blockLineStart;
   var off1 = new Number(offset);
   off1 = off1.valueOf() + blockOffsetStart;
   var off2 = new Number(offset);
   off2 = off2.valueOf() + blockOffsetStart + 1;
   // extend selection to end of line (off2 includes the next linefeed)
   var doc = dw.getDocumentDOM(filePath);
   if ( doc ) {
      var off2Char = doc.source.getText(off2, off2+1);
      while ( off2Char.length == 1 && off2Char != '\r' && off2Char != '\n' ) {
         off2++;
         off2Char = doc.source.getText(off2, off2+1);
	  }
	  // sn 7/13/01: I'm tweaking this to match both characters of a CRLF,
	  // otherwise we would try to select just the CR, which would throw
	  // an assertion in the text engine.  (This problem was caused by my
	  // recent change to make the document.source API layer reflect the
	  // true line break style in use, even if it's CRLF.)
	  if (off2Char == '\r' && doc.source.getText(off2+1, off2+2) == '\n')
	      off2++;
      off2++;
   }

   // chop off after the \n in the list item description
   var n = strDesc.indexOf('\n');
   if ( n >= 0 && n < strDesc.length-1 ) {
      strDesc = strDesc.substring(0, n);
   }

   // (windows only) 
   // replace the \n with \r\n in the full item description
   if (navigator.platform != "MacPPC")
   {
      n = desc.indexOf('\n');
      if ( n >= 0 && n < desc.length-1 ) {
         desc = desc.substring(0, n) + "\r\n" + desc.substring(n+1, desc.length);
      }
   }

   // return the args list for the call to dw.runCommand
   return new Array(desc, filePath, off1, off2, new Array(fileName, line, type, strDesc));
}

function getCommonHeadFunctions()
{
   var str = "";
   str += "function MM_wasAlreadyLoaded() {\n";
   str += "   var cData = unescape(document.cookie);\n";
   str += "   var name = \"MM_debugDocURL\";\n";
   str += "   var nStart = cData.indexOf(name);\n";
   str += "   var value='';\n";
   str += "   var vStart;\n";
   str += "   var vLength = unescape(document.URL).length;\n";
   str += "   var nameValue = name + \"=\" + unescape(document.URL);\n";
   str += "   if (nStart != -1)\n";
   str += "   {\n";
   str += "      vStart = nStart + \"MM_debugDocURL\".length + 1;\n";
   str += "      value = cData.substring(vStart, vStart + vLength);\n";
   str += "   }\n";
   str += "   if (value != unescape(document.URL))\n";
   str += "      document.cookie = nameValue;\n";
   str += "   return (value == unescape(document.URL));\n";
   str += "}\n";

   // jschang 31752 - add the member function reverseFind to the Array object
   // for use by the built-in instrumentation for MM_localVars
   str += "function MM_Array_reverseFind(str) {\n";
   str += "   var i = this.length-1;\n";
   str += "   while(i>=0){\n";
   str += "      if(this[i]==str){break;}\n";
   str += "      else {i--;}\n";
   str += "   }\n";
   str += "   return i;\n";
   str += "}\n";
   str += "Array.prototype.reverseFind = MM_Array_reverseFind;\n";
   return str;
}

function getCommonBodyInstrument()
{
   var strIndex = getMessageIndex();

   var str = "";
   str += "<noscript> \n";
   str += "<p>\n";
   str += MM.MSG_dbgNoScript[strIndex];
   str += "</p>\n";
   str += "</noscript> \n";
   return str;
}

function getIE4NetscapeHeadFunctions()
{
   str = "";
   str += "document.MM_debugLocalVars = new String('the debug eval context');\n";
   return str;
}

function getIE4NetscapeStepInstrument(lineNumber, offset, isInFunction)
{
   var line = blockLineStart + new Number(lineNumber);
   var off = blockOffsetStart + new Number(offset);
   // check !MM_bEval in case the user requests an value from the 
   // debugger that happens to call instrumented code
   var str = "";
	//"{"
   if ( isInFunction == "true" ) {
		str += "MM_bD=true;";
		str += "while(MM_bD&&!MM_bInEval){";
		//"}"
		str += 	"var MM_evalCtxt=eval('document.MM_debugLocalVars'),MM_bArg=false;";
		str += 	"if(!MM_bArg&&MM_D.length>0)";
		str += 	"{";
		str += 		"MM_evalCtxt.length=0;";
		str += 		"MM_bArg=true;";
		str += 		"for(MM_p=0;MM_p<MM_localVars.length;MM_p++){";
		str += 			"eval('MM_evalCtxt.'+MM_localVars[MM_p]+'='+MM_localVars[MM_p]);";
		str += 			"eval('MM_evalCtxt.'+MM_localVars[MM_p]);";
		str += 		"}";
		str += 		"MM_bArg=true;";
		str += 	"}";
		str += 	"var MM_didEval=(MM_D.length>0);";
		str += 	"MM_bD=MM_Debug(MM_evalDbg(MM_evalCtxt,MM_D),'";
	}
   else {
		str += "MM_bD=true;";
		str += "while(MM_bD&&!MM_bInEval){";
		str += 	"MM_bD=MM_Debug(MM_evalDbg(this,MM_D),'";
		//"}"
	}

   str +=								blockFileName +"',";
   str +=								line +",";
   str +=								off;
   str +=							");";

   if ( isInFunction == "true" ) {
		str += 	"if(MM_didEval){";
		str += 		"for(MM_p=0;MM_p<MM_localVars.length;MM_p++){";
		str += 			"eval(MM_localVars[MM_p]+'=MM_evalCtxt.'+MM_localVars[MM_p]);";
		str += 		"}";
		str += 	"}";
	}
   str += "}";
   return str;
}

function getMessageIndex() {
   var charSet = dw.getDocumentDOM().getCharSet().toLowerCase();
   var messageIndex;
   // if the encoding is either "shift_jis" or "x-sjis" 
   // put up Japanese messages.
   if (charSet == "shift_jis" || charSet == "x-sjis" || charSet == "euc-kr" || charSet == "big5" || charSet == "gb2312") 
		messageIndex = 1;
   else 
		messageIndex = 0;

   return messageIndex;
}
