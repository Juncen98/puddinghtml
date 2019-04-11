// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

//---------------   GLOBAL VARIABLES   ---------------

//---------------   JavaScript Masks   ---------------

var MASK_AspJsSelection = "<%=((##expression1## == \"##expression2##\")?\"CHECKED\":\"\")%>";
var PATT_AspJsSelection = '\\(\\((.+)\\s*==\\s*(.+)\\s*\\)\\?\\s*"CHECKED"';
var PATT_AspJsRSValue   = '([a-z0-9_]+)\\.Fields\\.Item\\("([^"]*)"\\)\\.Value';


//---------------   VBScript Masks   ---------------

var MASK_AspVbSelection = "<%if (##expression1## = \"##expression2##\") then Response.Write(\"CHECKED\") : Response.Write(\"\")%>";
var PATT_AspVbSelection = 'if\\s*\\((.+)\\s*=\\s*(.+)\\s*\\)\\s*then\\s*Response\\.Write\\("CHECKED"';
var PATT_AspVbRSValue   = '([a-z0-9_]+)\\.Fields\\.Item\\("([^"]*)"\\)\\.Value';


//---------------   Cold Fusion Masks   ---------------

var MASK_CfmlSelection = "<cfif (##expression1## EQ \"##expression2##\")>CHECKED</cfif>";
var PATT_CfmlSelection = "<\\s*cfif\\s*\\((.+)\\s*EQ\\s*(.+)\\s*\\)";
var PATT_CfmlRSValue   = "(\\w+).(\\w+)";

//---------------   JSP Masks   ---------------

var MASK_JspSelection = "<%=((##expression1##.toString().equals(\"##expression2##\"))?\"CHECKED\":\"\")%>";
var PATT_JspSelection = "=\\s*\\(\\(([^%]*)\\.toString\\(\\)\\.equals\\(\\s*(.+)\\s*\\)\\s*";
var PATT_JspRSValue   = "(\\w+)\\.getObject\\(\"([^\"]*)\"\\)";


