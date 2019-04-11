// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

//NOTE: This code would normally be part of my specific server behavior *.js file, but these
//particular globals will be used by several server behaviors that need to insert the same stuff.
//To use file, include it in your *.htm, and call function getServerData() to retrieve blocks.

//Weights for participants (model specific, but not language specific)

//*************** ASP GLOBALS *****************

var WGHT_AspDeclareStats = "aboveHTML+70"; //70;
var WGHT_AspCountRecords = "aboveHTML+75"; //75;

//*************** ASP - JAVASCRIPT GLOBALS *****************

var PREP_AspJsDeclareStats = "@@rs@@_total";
var PATT_AspJsDeclareStats = "@@rs@@_total\\s*=\\s*@@rs@@\\.RecordCount";
var TYPE_AspJsDeclareStats = "multiple";
var MASK_AspJsDeclareStats = "\n"+
"<%\n"+
"// *** Recordset Stats, Move To Record, and Go To Record: declare stats variables\n"+
"\n"+
"// set the record count\n"+
"var @@rs@@_total = @@rs@@.RecordCount;\n"+
"\n"+
"// set the number of rows displayed on this page\n"+
"if (@@rs@@_numRows < 0) {            // if repeat region set to all records\n"+
"  @@rs@@_numRows = @@rs@@_total;\n"+
"} else if (@@rs@@_numRows == 0) {    // if no repeat regions\n"+
"  @@rs@@_numRows = 1;\n"+
"}\n"+
"\n"+
"// set the first and last displayed record\n"+
"var @@rs@@_first = 1;\n"+
"var @@rs@@_last  = @@rs@@_first + @@rs@@_numRows - 1;\n"+
"\n"+
"// if we have the correct record count, check the other stats\n"+
"if (@@rs@@_total != -1) {\n"+
"  @@rs@@_numRows = Math.min(@@rs@@_numRows, @@rs@@_total);\n"+
"  @@rs@@_first   = Math.min(@@rs@@_first, @@rs@@_total);\n"+
"  @@rs@@_last    = Math.min(@@rs@@_last, @@rs@@_total);\n"+
"}\n"+
"%>\n";
var SUB1_AspJsDeclareStats = new Array("rs", /(\W)\w+(_total|_first|_last|_numRows|\.RecordCount)/g);
var TOK1_AspJsDeclareStats = new Array("rs", /@@rs@@/g);


var PREP_AspJsCountRecords = "@@rs@@_total";
var PATT_AspJsCountRecords = "@@rs@@_total\\+\\+;";
var TYPE_AspJsCountRecords = "multiple";
var MASK_AspJsCountRecords = "\n"+
"<%\n"+
"// *** Recordset Stats: if we don't know the record count, manually count them\n"+
"\n"+
"if (@@rs@@_total == -1) {\n"+
"\n"+
"  // count the total records by iterating through the recordset\n"+
"  for (@@rs@@_total=0; !@@rs@@.EOF; @@rs@@.MoveNext()) {\n"+
"    @@rs@@_total++;\n"+
"  }\n"+
"\n"+
"  // reset the cursor to the beginning\n"+
"  if (@@rs@@.CursorType > 0) {\n"+
"    if (!@@rs@@.BOF) @@rs@@.MoveFirst();\n"+
"  } else {\n"+
"    @@rs@@.Requery();\n"+
"  }\n"+
"\n"+
"  // set the number of rows displayed on this page\n"+
"  if (@@rs@@_numRows < 0 || @@rs@@_numRows > @@rs@@_total) {\n"+
"    @@rs@@_numRows = @@rs@@_total;\n"+
"  }\n"+
"\n"+
"  // set the first and last displayed record\n"+
"  @@rs@@_last  = Math.min(@@rs@@_first + @@rs@@_numRows - 1, @@rs@@_total);\n"+
"  @@rs@@_first = Math.min(@@rs@@_first, @@rs@@_total);\n"+
"}\n"+
"%>\n";
var SUB1_AspJsCountRecords = new Array("rs", /(\W)\w+(_total|_numRows|_first|_last|\.EOF|\.MoveNext|\.MoveFirst|\.CursorType|\.Requery)/g);
var TOK1_AspJsCountRecords = new Array("rs", /@@rs@@/g);


//*************** ASP - VBSCRIPT GLOBALS *****************

var PREP_AspVbDeclareStats = "@@rs@@_total";
var PATT_AspVbDeclareStats = "@@rs@@_total\\s*=\\s*@@rs@@\\.RecordCount";
var TYPE_AspVbDeclareStats = "multiple";
var MASK_AspVbDeclareStats = "\n"+
"<%\n"+
"'  *** Recordset Stats, Move To Record, and Go To Record: declare stats variables\n"+
"\n"+
"' set the record count\n"+
"@@rs@@_total = @@rs@@.RecordCount\n"+
"\n"+
"' set the number of rows displayed on this page\n"+
"If (@@rs@@_numRows < 0) Then\n"+
"  @@rs@@_numRows = @@rs@@_total\n"+
"Elseif (@@rs@@_numRows = 0) Then\n"+
"  @@rs@@_numRows = 1\n"+
"End If\n"+
"\n"+
"' set the first and last displayed record\n"+
"@@rs@@_first = 1\n"+
"@@rs@@_last  = @@rs@@_first + @@rs@@_numRows - 1\n"+
"\n"+
"' if we have the correct record count, check the other stats\n"+
"If (@@rs@@_total <> -1) Then\n"+
"  If (@@rs@@_first > @@rs@@_total) Then @@rs@@_first = @@rs@@_total\n"+
"  If (@@rs@@_last > @@rs@@_total) Then @@rs@@_last = @@rs@@_total\n"+
"  If (@@rs@@_numRows > @@rs@@_total) Then @@rs@@_numRows = @@rs@@_total\n"+
"End If\n"+
"%>\n";
var SUB1_AspVbDeclareStats = new Array("rs", /(\W)\w+(_total|_first|_last|_numRows|\.RecordCount)/g);
var TOK1_AspVbDeclareStats = new Array("rs", /@@rs@@/g);


var PREP_AspVbCountRecords = "@@rs@@_total";
var PATT_AspVbCountRecords = "@@rs@@_total\\s*=\\s*@@rs@@_total\\s*\\+\\s*1";
var TYPE_AspVbDeclareStats = "multiple";
var MASK_AspVbCountRecords = "\n"+
"<%\n"+
"' *** Recordset Stats: if we don't know the record count, manually count them\n"+
"\n"+
"If (@@rs@@_total = -1) Then\n"+
"\n"+
"  ' count the total records by iterating through the recordset\n"+
"  @@rs@@_total=0\n"+
"  While (Not @@rs@@.EOF)\n"+
"    @@rs@@_total = @@rs@@_total + 1\n"+
"    @@rs@@.MoveNext\n"+
"  Wend\n"+
"\n"+
"  ' reset the cursor to the beginning\n"+
"  If (@@rs@@.CursorType > 0) Then\n"+
"    @@rs@@.MoveFirst\n"+
"  Else\n"+
"    @@rs@@.Requery\n"+
"  End If\n"+
"\n"+
"  ' set the number of rows displayed on this page\n"+
"  If (@@rs@@_numRows < 0 Or @@rs@@_numRows > @@rs@@_total) Then\n"+
"    @@rs@@_numRows = @@rs@@_total\n"+
"  End If\n"+
"\n"+
"  ' set the first and last displayed record\n"+
"  @@rs@@_first = 1\n"+
"  @@rs@@_last = @@rs@@_first + @@rs@@_numRows - 1\n"+
"  If (@@rs@@_first > @@rs@@_total) Then @@rs@@_first = @@rs@@_total\n"+
"  If (@@rs@@_last > @@rs@@_total) Then @@rs@@_last = @@rs@@_total\n"+
"\n"+
"End If\n"+
"%>\n";
var SUB1_AspVbCountRecords = new Array("rs", /(\W)\w+(_total|_numRows|_first|_last|\.EOF|\.MoveNext|\.MoveFirst|\.CursorType|\.Requery)/g);
var TOK1_AspVbCountRecords = new Array("rs", /@@rs@@/g);


//*************** Cold Fusion GLOBALS *****************

var WGHT_CfmlDeclareStats = WGHT_AspDeclareStats;

var PREP_CfmlDeclareStats = "@@rs@@_total";
var PATT_CfmlDeclareStats = "@@rs@@_total\\s*=\\s*@@rs@@\\.RecordCount";
var TYPE_CfmlDeclareStats = "multiple";
var MASK_CfmlDeclareStats = "\n"+
"<cfscript>\n"+
"// *** Recordset Stats, Move To Record, and Go To Record: set stats variables\n"+
"\n"+
"// set the record count\n"+
"@@rs@@_total = @@rs@@.RecordCount;\n"+
"\n"+
"// set the number of rows displayed on this page\n"+
"If (@@rs@@_NumRows LT 0  OR  @@rs@@_NumRows GT @@rs@@_total) {\n"+
"  @@rs@@_NumRows = @@rs@@_total;\n"+
"} Else If (@@rs@@_NumRows EQ 0) {\n"+
"  @@rs@@_NumRows = 1;\n"+
"}\n"+
"\n"+
"// set the first and last displayed record\n"+
"@@rs@@_first = Min(1, @@rs@@_total);\n"+
"@@rs@@_last  = Min(@@rs@@_NumRows, @@rs@@_total);\n"+
"</cfscript>\n";
var SUB1_CfmlDeclareStats = new Array("rs", /(\W)\w+(_total|_first|_last|_NumRows|\.RecordCount)/g);
var TOK1_CfmlDeclareStats = new Array("rs", /@@rs@@/g);

//*************** JAVA SERVER PAGE GLOBALS *****************

var WGHT_JspDeclareStats = WGHT_AspDeclareStats;
var WGHT_JspCountRecords = WGHT_AspCountRecords;


var PREP_JspDeclareStats = "@@rs@@_total";
var PATT_JspDeclareStats = "@@rs@@_total\\s*=\\s*-1";
var TYPE_JspDeclareStats = "multiple";
var MASK_JspDeclareStats = "\n"+
"<%\n"+
"// *** Recordset Stats, Move To Record, and Go To Record: declare stats variables\n"+
"\n"+
"int @@rs@@_first = 1;\n"+
"int @@rs@@_last  = 1;\n"+
"int @@rs@@_total = -1;\n"+
"\n"+
"if (@@rs@@_isEmpty) {\n"+
"  @@rs@@_total = @@rs@@_first = @@rs@@_last = 0;\n"+
"}\n"+
"\n"+
"//set the number of rows displayed on this page\n"+
"if (@@rs@@_numRows == 0) {\n"+
"  @@rs@@_numRows = 1;\n"+
"}\n"+
"%>\n";
var SUB1_JspDeclareStats = new Array("rs", /(\W)\w+(_total|_first|_last|_numRows|_isEmpty)/g);
var TOK1_JspDeclareStats = new Array("rs", /@@rs@@/g);


var PREP_JspCountRecords = "@@rs@@_total++";
var PATT_JspCountRecords = "@@rs@@_total\\+\\+";
var TYPE_JspDeclareStats = "multiple";
var MASK_JspCountRecords = "\n"+
"<%\n"+
"// *** Recordset Stats: if we don't know the record count, manually count them\n"+
"\n"+
"if (@@rs@@_total == -1) {\n"+
"\n"+
"  // count the total records by iterating through the recordset\n"+
"    for (@@rs@@_total = 1; @@rs@@.next(); @@rs@@_total++);\n"+
"\n"+
"  // reset the cursor to the beginning\n"+
"  @@rs@@.close();\n"+
"  @@rs@@ = Statement@@rs@@.executeQuery();\n"+
"  @@rs@@_hasData = @@rs@@.next();\n"+
"\n"+
"  // set the number of rows displayed on this page\n"+
"  if (@@rs@@_numRows < 0 || @@rs@@_numRows > @@rs@@_total) {\n"+
"    @@rs@@_numRows = @@rs@@_total;\n"+
"  }\n"+
"\n"+
"  // set the first and last displayed record\n"+
"  @@rs@@_first = Math.min(@@rs@@_first, @@rs@@_total);\n"+
"  @@rs@@_last  = Math.min(@@rs@@_first + @@rs@@_numRows - 1, @@rs@@_total);\n"+
"}\n"+
"%>\n";
var SUB1_JspCountRecords = new Array("rs", /(\W)\w+(_total|_numRows|_first|_last|_hasData|\.next|\.close)/g);
var SUB2_JspCountRecords = new Array("rs", /(Statement)\w+(.executeQuery)/g);
var TOK1_JspCountRecords = new Array("rs", /@@rs@@/g);
