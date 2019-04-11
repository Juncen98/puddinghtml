// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

//---------------   GLOBAL VARIABLES   ---------------

//---------------   JavaScript Masks   ---------------

var MASK_AspJsDynamicOptionStart = "\r\n"+
"<%\r\n" + 
"while (!##primaryrsname##.EOF)\r\n" +
"{\r\n" + 
"%>\r\n";
var MASK_AspJsDynamicOptionEnd = "\r\n<%\r\n"+
"  ##primaryrsname##.MoveNext();\r\n" + 
"}\r\n" + 
"if (##primaryrsname##.CursorType > 0) {\r\n" +
"  if (!##primaryrsname##.BOF) ##primaryrsname##.MoveFirst();\r\n" +
"} else {\r\n" +
"  ##primaryrsname##.Requery();\r\n" +
"}\r\n" +
"%>\r\n";


var MASK_AspJsSelection = "<%=((##expression2## == ##expression1##)?\"SELECTED\":\"\")%>";
var PATT_AspJsRSValue   = '(\\w+)\\.Fields\\.Item\\("([^"]*)"\\)\\.Value';


//---------------   VBScript Masks   ---------------

var MASK_AspVbDynamicOptionStart = "\r\n"+
"<%\r\n" + 
"While (NOT ##primaryrsname##.EOF)\r\n" + 
"%>\r\n";
var MASK_AspVbDynamicOptionEnd = "\r\n"+
"<%\r\n" + 
"  ##primaryrsname##.MoveNext()\r\n" + 
"Wend\r\n" + 
"If (##primaryrsname##.CursorType > 0) Then\r\n" +
"  ##primaryrsname##.MoveFirst\r\n" +
"Else\r\n" +
"  ##primaryrsname##.Requery\r\n" +
"End If\r\n" +
"%>\r\n";

var MASK_AspVbSelection = "<%if (CStr(##expression2##) = CStr(##expression1##)) then Response.Write(\"SELECTED\") : Response.Write(\"\")%>";
var PATT_AspVbRSValue   = '(\\w+)\\.Fields\\.Item\\("([^"]*)"\\)\\.Value';



//---------------   Cold Fusion Masks   ---------------

var MASK_CfmlDynamicOptionStart = '<cfloop query="##primaryrsname##">';
var MASK_CfmlDynamicOptionEnd = '</cfloop>';

var MASK_CfmlSelection = "<cfif (##expression2## EQ ##expression1##)>SELECTED</cfif>";
var PATT_CfmlRSValue   = "#([\\w+]+).([\\w+]+)#";


//---------------   JSP Masks   ---------------

var MASK_JspDynamicOptionStart = "\r\n"+
"<%\r\n" + 
"while (##primaryrsname##_hasData) {\r\n" +
"%>\r\n";
var MASK_JspDynamicOptionEnd = "\r\n<%\r\n"+
"  ##primaryrsname##_hasData = ##primaryrsname##.next();\r\n" + 
"}\r\n" +
"##primaryrsname##.close();\r\n" +
"##primaryrsname## = Statement##primaryrsname##.executeQuery();\r\n" +
"##primaryrsname##_hasData = ##primaryrsname##.next();\r\n" +
"##primaryrsname##_isEmpty = !##primaryrsname##_hasData;\r\n" +
"%>\r\n";


var MASK_JspSelection = "<%=((##expression2##.toString().equals((##expression1##).toString()))?\"SELECTED\":\"\")%>";
var PATT_JspRSValue   = "(\\w+)\\.getObject\\(\"([^\"]*)\"\\)";
