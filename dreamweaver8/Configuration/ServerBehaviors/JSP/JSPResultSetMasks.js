// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

//---------------   GLOBAL VARIABLES   ---------------
var MASK_JspJSResultset = "\n"+
"<%\n"+
"Driver Driver##rsname## = (Driver)Class.forName(##drivername##).newInstance();\n" + 
"Connection Conn##rsname## = DriverManager.getConnection(##theConnectionString##,##theUserName##,##theUserPass##);\n" + 
"PreparedStatement Statement##rsname## = Conn##rsname##.prepareStatement(##theSQL##);\n" + 
"ResultSet ##rsname## = Statement##rsname##.executeQuery();\n" + 
"boolean ##rsname##_isEmpty = !##rsname##.next();\n" +
"boolean ##rsname##_hasData = !##rsname##_isEmpty;\n" +
"Object ##rsname##_data;\n" +
"int ##rsname##_numRows = 0;\n" +
"%>";

var MASK_JspJSResultsetClose = "\n" + 
"<%\n"+
"##rsname##.close();\n" + 
"Conn##rsname##.close();\n" + 
"%>";


var MASK_SQLJSParam = "\"+ ##rsname##__##pname## + \""

var MASK_JSParam  = "\n"+
"String ##objectname##__##pname## = ##pvalue##;\n" +
"if (##rexpression## !=null) {##objectname##__##pname## = (String)##rexpression##;}\n";
