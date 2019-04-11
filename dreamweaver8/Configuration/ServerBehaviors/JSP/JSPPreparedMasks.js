// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

//---------------   GLOBAL VARIABLES   ---------------
var MASK_Prepared = "\n"+
"<%\n"+
"Driver Driver##stname## = (Driver)Class.forName(##drivername##).newInstance();\n" + 
"Connection Conn##stname## = DriverManager.getConnection(##theConnectionString##,##theUserName##,##theUserPass##);\n" + 
"PreparedStatement ##stname## = Conn##stname##.prepareStatement(##theSQL##);\n" + 
"##stname##.executeUpdate();\n"+ 
"%>";

var MASK_Param  = "\n"+
"String ##stname##__##pname## = null;\n" + 
"if(##rexpression## != null){ ##stname##__##pname## = (String)##rexpression##;}\n";


var MASK_SQLParam = "\"+ ##stname##__##pname## + \""

var MASK_JspPreparedClose = "\n" + 
"<%\n"+
"Conn##stname##.close();\n" + 
"%>";

