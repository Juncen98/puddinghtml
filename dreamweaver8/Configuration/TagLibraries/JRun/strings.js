// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.
/* strings.js
*
* strings.js and loc_strings.js contain arrays for populating select lists 
* in tag dialogs. Both files use the naming convention arrayNameCap for the
* option labels (i.e., text that will be shown to the user) and arrayNameVal
* for the option values(i.e., the code that will be inserted into the document).
* 
* for obvious reasons, loc_strings.js mainly contains the Cap arrays, and
* strings.js mainly contains the Val arrays. only loc_strings.js should be
* localized.  
*
* note: where the labels should not be localized, select lists are intialized
* using the Val array for both the labels and the values.
* 
*/

var theInputTypesVal = new Array("checkbox", "creditcard", "date", "eurodate", "float", "integer", "password", "phone", "radio", "ssc", "text", "time", "zipcode"); 

var theJRunFormMethodsVal = new Array("get", "post");

var theSelJNDIVal = new Array("lookup", "list", "attribute", "search");
var theSelmailparamVal = new Array("attachments", "headers"); 
var theSelSelectVal = new Array("hashtable","columns");
var theSelSQLVal = new Array("jdbconnection", "j2eedatasource", "jdbcdriver"); 
var theSelXSLTVal = new Array("input","empty");
var theMailTypesVal = new Array("mailserver","javamail");
var theSQLTypesVal = new Array("ARRAY","BIGINT","BINARY","BIT","BLOB","CHAR","CLOB","DATE","DECIMAL","DISTINCT","DOUBLE",
                         "FLOAT","INTEGER","JAVA_OBJECT","LONGVARBINARY","NULL","NUMERIC","OTHER","REAL","REF","SMALLINT","STRUCT",
                         "TIME","TIMESTAMP","TINYINT","VARBINARY","VARCHAR"); 


