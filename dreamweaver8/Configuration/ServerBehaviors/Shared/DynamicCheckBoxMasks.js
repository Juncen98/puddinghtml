// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

//---------------   GLOBAL VARIABLES   ---------------

//---------------   JavaScript Masks   ---------------

var MASK_AspJsSelection = "<%=((##expression1## == ##expression2##)?\"CHECKED\":\"\")%>";
var PATT_AspJsSelection = '\\(\\((.+)\\s*==\\s*(.+)\\)\\?\\s*"CHECKED"';
var PATT_AspJsRSValue  = '(\\w+)\\.Fields\\.Item\\("([^"]*)"\\)\\.Value';


//---------------   VBScript Masks   ---------------

var MASK_AspVbSelection = "<%If (##expression1## = ##expression2##) Then Response.Write(\"CHECKED\") : Response.Write(\"\")%>";
var PATT_AspVbSelection = 'If\\s*\\((.+)\\s*=\\s*(.+)\\)\\s*Then\\s*Response\\.Write\\("CHECKED"';
var PATT_AspVbRSValue  = '(\\w+)\\.Fields\\.Item\\("([^"]*)"\\)\\.Value';


//---------------   Cold Fusion Masks   ---------------

var MASK_CfmlSelection = "<cfif (##expression1## EQ ##expression2##)>CHECKED</cfif>";
var PATT_CfmlSelection = "<cfif\\s*\\((.+)\\s*EQ\\s*(.+)\\s*\\)>";
var PATT_CfmlRSValue = "([\\w+]+).([\\w+]+)";


//---------------   JSP Masks   ---------------

var MASK_JspSelection = "<%=((##expression1##.toString().equals(##expression2##))?\"CHECKED\":\"\")%>";
var PATT_JspSelection = "\\(\\((.+)\\.toString\\(\\)\\.equals\\((.+)\\)\\)\\?";
var PATT_JspRSValue = "(\\w+)\\.getObject\\(\"([^\"]*)\"\\)";
