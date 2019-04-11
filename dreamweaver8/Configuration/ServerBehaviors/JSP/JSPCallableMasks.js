// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

//---------------   GLOBAL VARIABLES   ---------------
var MASK_Callable = "\n"+
"Driver Driver##stname## = (Driver)Class.forName(##drivername##).newInstance();\n" + 
"Connection Conn##stname## = DriverManager.getConnection(##theConnectionString##,##theUserName##,##theUserPass##);\n" + 
"CallableStatement ##stname## = Conn##stname##.prepareCall(##theSQL##);\n" +
"Object ##stname##_data;";

var MASK_CallableExec = "\n"+ "##stname##.execute();";


var MASK_RSCallable = "\n"+ "ResultSet ##rsname## = ##stname##.getResultSet();\n" + 
"boolean ##rsname##_isEmpty = !##rsname##.next();\n" +
"boolean ##rsname##_hasData = !##rsname##_isEmpty;\n" + 
"Object ##rsname##_data;\n" +
"int ##rsname##_numRows = 0;\n";

var MASK_Param  = "\n"+
"String ##stname##__##pname## = ##pvalue##;\n" + 
"if(##rexpression## != null){ ##stname##__##pname## = (String)##rexpression##;}\n";

var MASK_SQLCallInParam = "\n"+
"##stname##.setString(##pindex##,##stname##__##pname##);"

var MASK_SQLCallOutParam = "\n"+
"##stname##.registerOutParameter(##pindex##,Types.LONGVARCHAR);"

var MASK_CallableClose = "\n" + 
"<%\n"+
"Conn##stname##.close();\n" + 
"%>";

var MASK_SQLCallRefCurOutParam = "\n"+
"##stname##.registerOutParameter(##pindex##,-10/*OracleTypes.Cursor*/);"

var MASK_RSRefCursorParam = "\n"+ "ResultSet ##pname## = (ResultSet)##stname##.getObject(##pindex##);\n" +
"boolean ##pname##_isEmpty = !##pname##.next();\n" +
"boolean ##pname##_hasData = !##pname##_isEmpty;\n" + 
"Object ##pname##_data;\n" +
"int ##pname##_numRows = 0;\n";

