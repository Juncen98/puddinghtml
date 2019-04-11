// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

//---------------   GLOBAL VARIABLES   ---------------

//---------------   JavaScript Masks   ---------------
var MASK_AspJSCommand_CreateObject = "var ##cdname## = Server.CreateObject(\"ADODB.Command\");\n";
var MASK_AspJSCommand_ActiveConnection = "##cdname##.ActiveConnection = ##theConnection##;\n";
var MASK_AspJSCommand_CommandText = "##cdname##.CommandText = ##theCommandText##;\n";
var MASK_AspJSCommand_CommandType = "##cdname##.CommandType = ##theCommandType##;\n";
var MASK_AspJSCommand_CommandTimeout = "##cdname##.CommandTimeout = ##theCommandTimeout##;\n";
var MASK_AspJSCommand_Prepared = "##cdname##.Prepared = ##thePrepared##;";

var MASK_AspJSCommand = "\n" +
MASK_AspJSCommand_CreateObject + 
MASK_AspJSCommand_ActiveConnection + 
MASK_AspJSCommand_CommandText + 
MASK_AspJSCommand_CommandType + 
MASK_AspJSCommand_CommandTimeout + 
MASK_AspJSCommand_Prepared;

var MASK_AspJSCommandExec	= "\n"+ "##cdname##.Execute();\n";
var MASK_AspJSRSCommand = "\n"+ "var ##rsname## = ##cdname##.Execute();\n";
var MASK_AspJSCommand_NumRows = "var ##rsname##_numRows = 0;\n";
var PATT_AspJSCommand_NumRows = "var\\s+(\\w+)_numRows\\s*=\\s*0;[\\r]?[\\n]?";

var MASK_AspJSParam  = "\n"+
"var ##cdname##__##pname## = ##pvalue##;\n" + 
"if(String(##rexpression##) != \"undefined\"){ ##cdname##__##pname## = String(##rexpression##);}\n";

var MASK_AspJSActionParam  = "\n"+
"if(String(##rexpression##) != \"undefined\"){ ##cdname##__##pname## = String(##rexpression##);}\n";

var MASK_AspSQLJSParam = "\"+ ##cdname##__##pname##.replace(/'/g, \"''\") + \""

//---------------   VBScript Masks   ---------------
var MASK_AspVBCommand_CreateObject = "set ##cdname## = Server.CreateObject(\"ADODB.Command\")\n";
var MASK_AspVBCommand_ActiveConnection = "##cdname##.ActiveConnection = ##theConnection##\n";
var MASK_AspVBCommand_CommandText = "##cdname##.CommandText = ##theCommandText##\n";
var MASK_AspVBCommand_CommandType = "##cdname##.CommandType = ##theCommandType##\n";
var MASK_AspVBCommand_CommandTimeout = "##cdname##.CommandTimeout = ##theCommandTimeout##\n";
var MASK_AspVBCommand_Prepared = "##cdname##.Prepared = ##thePrepared##";

var MASK_AspVBCommand = "\n" +
MASK_AspVBCommand_CreateObject + 
MASK_AspVBCommand_ActiveConnection + 
MASK_AspVBCommand_CommandText + 
MASK_AspVBCommand_CommandType + 
MASK_AspVBCommand_CommandTimeout + 
MASK_AspVBCommand_Prepared;

var MASK_AspVBCommandExec	= "\n"+ "##cdname##.Execute()\n";
var MASK_AspVBRSCommand		= "\n"+ "set ##rsname## = ##cdname##.Execute\n";
var MASK_AspVBCommand_NumRows = "##rsname##_numRows = 0\n";
var PATT_AspVBCommand_NumRows = "(\\w+)_numRows\\s*=\\s*0[\\r]?[\\n]?";

var MASK_AspVBParam  = "\n"+
"Dim ##cdname##__##pname##\n" + 
"##cdname##__##pname## = ##pvalue##\n" + 
"if(##rexpression## <> \"\") then ##cdname##__##pname## = ##rexpression##\n";

var MASK_AspVBActionParam  = "\n"+
"if(##rexpression## <> \"\") then ##cdname##__##pname## = ##rexpression##\n";

var MASK_AspSQLVBParam = "\" + Replace(##cdname##__##pname##, \"'\", \"''\") + \""

var MASK_ConnectionString = ""+
"\"dsn=##dsn##;uid=##uid##;pwd=##pwd##\"";

var MASK_AspSQLCallParam = "\n"+
"##cdname##.Parameters.Append ##cdname##.CreateParameter(\"##pname##\", ##type##, ##direction##,##size##,##cdname##__##pname##)"

var MASK_AspSQLVBCallInParam = "\n"+
"##cdname##.Parameters.Append ##cdname##.CreateParameter(\"##origpname##\", ##type##, ##direction##,##size##,##cdname##__##pname##)"

var MASK_AspSQLVBCallParam = "\n"+
"##cdname##.Parameters.Append ##cdname##.CreateParameter(\"##origpname##\", ##type##, ##direction##)"

var MASK_AspSQLVBCallWithSizeParam = "\n"+
"##cdname##.Parameters.Append ##cdname##.CreateParameter(\"##origpname##\", ##type##, ##direction##,##size##)"

var MASK_AspSQLJSCallInParam = "\n"+
"##cdname##.Parameters.Append(##cdname##.CreateParameter(\"##origpname##\", ##type##, ##direction##,##size##,##cdname##__##pname##));"

var MASK_AspSQLJSCallWithSizeParam = "\n"+
"##cdname##.Parameters.Append(##cdname##.CreateParameter(\"##origpname##\", ##type##, ##direction##,##size##));"

var MASK_AspSQLJSCallParam = "\n"+
"##cdname##.Parameters.Append(##cdname##.CreateParameter(\"##origpname##\", ##type##, ##direction##));"
