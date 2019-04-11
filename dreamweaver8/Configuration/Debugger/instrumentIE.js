
// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.


//*************************API**************************


function getIncludeFiles()
{
   return new Array("MM_Debug.js", "MM_DebugIE.js", "MM_IEApplet.cab");
}

function getStepInstrument(lineNumber, offset)
{
   var line = blockLineStart + new Number(lineNumber);
   var off = blockOffsetStart + new Number(offset);
   // check !MM_bEval in case the user requests an value from the 
   // debugger that happens to call instrumented code
   var str = "MM_bD=true;while(MM_bD&&!MM_bInEval){try{MM_bD=MM_Debug(eval(MM_D),'";
   str += blockFileName +"',";
   str += line +",";
   str += off;
   str += ")}catch(e){MM_D='\\''+MM_debugError+'\\''};}";
   return str;
}

function getHeadInstrument()
{
   var strIndex = getMessageIndex();

   var str = "\n";

   str += "<script language=\"JavaScript1.2\" ID=\"Ex8\">\n";
   str += "<!--\n";

   str += getCommonHeadFunctions();

   str += "function MM_connectDbg()\n";
   str += "{\n";
   str += "   if ( MM_wasAlreadyLoaded() ) return;\n";
   str += "   var canceled = false;\n";
   str += "   if ( confirm(\""+MM.MSG_dbgStartDebugging[strIndex]+"\") ) {\n";
   str += "      while ( !document.MM_jsDebug || !document.MM_jsDebug.isLoaded )\n";
   str += "         if ( !confirm(\""+MM.MSG_dbgStartDebugging2[strIndex]+"\") )\n";
   str += "         {   canceled = true; break; }\n";
   str += "   } else { canceled = true; }\n";
   //       // exception occurs if user did not grant 
   //       // permission to the applet yet
   str += "   try {\n";
   str += "      document.MM_jsDebug.connectDbg();\n";
   //          // in case the user granted permission and 
   //          // also clicked Cancel
   str += "      if ( canceled )\n";
   str += "         document.MM_jsDebug.disconnectDbg();\n";
   str += "   }\n";
   str += "   catch (e) {  }\n";
   str += "}\n";

   str += "function MM_sendDbg(cmd)\n";
   str += "{\n";
   str += "   var ret;\n";
   //       // exception occurs if user did not grant 
   //       // permission to the applet
   str += "   try { ret = document.MM_jsDebug.sendDbg(cmd); }\n";
   str += "   catch (e) { ret = 'continue'; }\n";
   str += "   return ret;\n";
   str += "}\n";

   str += "function MM_disconnectDbg()\n";
   str += "{\n";
   //       // exception occurs if user did not grant 
   //       // permission to the applet
   str += "   try { document.MM_jsDebug.disconnectDbg(); }\n";
   str += "   catch (e) {  }\n";
   str += "}\n";

   str += "//--"; // split to next line because can't have closing HTML comment tag
   str += ">\n";
   str += "</"; // split to next line because can't have closing HTML comment tag
   str += "script>\n";
   str += "<script language=\"JavaScript\" src=\"MM_Debug.js\"></"; // split to next line because can't have closing HTML comment tag
   str += "script>\n";
   str += "<script language=\"JavaScript\" src=\"MM_DebugIE.js\"></"; // split to next line because can't have closing HTML comment tag
   str += "script>\n";
   
   return str;
}

function getBodyInstrument()
{
   var strIndex = getMessageIndex();

   var str = "\n";

   str += "<applet code=\"MM_IEApplet.class\" \n";
   str += "      width=\"1\" height=\"1\"\n";
   str += "      name=\"MM_jsDebug\">\n";
   str += "   <param name=\"cabbase\" value=\"MM_IEApplet.cab\">\n";
   str += "<p>\n";
   str += MM.MSG_dbgNoApplet[strIndex];
   str += "</p>\n";
   str += "</applet>\n";

   str += getCommonBodyInstrument();

   str += "<script language=\"JavaScript1.2\" id=\"Ex8\">\n";
   str += "<!--\n";
   str += "MM_connectDbg();\n";
   str += "//-"; // split to next line because can't have closing HTML comment tag
   str += "->\n";
   str += "</"; // split to next line because can't have closing HTML comment tag
   str += "script>\n";

   return str;
}
