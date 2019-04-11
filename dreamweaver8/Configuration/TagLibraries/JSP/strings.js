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

var thePluginTypesVal = new Array("bean", "applet"); 
var theAlignmentsVal = new Array("bottom", "top", "middle", "left", "right"); 
var theBeanTypesVal = new Array("page", "request", "session", "application"); 

