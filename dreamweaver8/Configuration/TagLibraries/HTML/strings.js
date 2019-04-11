// Copyright 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.
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

var theAlignCaptionVal = new Array("top", "bottom", "left", "right");
var theAlignImgVal = new Array("baseline", "top", "middle", "bottom","textop","absmiddle","absbottom","left","right");
var theAlignLegendVal = new Array("left", "right", "center"); 
var theAlignObjectVal = new Array("top","bottom","middle","left","right");
var theAlignsHRVal = new Array("left","center","right");                                 
var theAlignStandardFourVal = new Array("left", "center", "right","justify");
var theAlignTableVal = new Array("", "left", "right", "center"); 
var theAreaShapesVal = new Array("default","rect","circle","poly");

var theCellScopesVal = new Array("col","colgroup","row","rowgroup");
var theCharsetsVal = new Array("ISO-8859-1","ISO-8859-2","ISO-8859-3","ISO-8859-4","ISO-8859-9","ISO-8859-10","ISO-8859-15","ISO-8859-5","ISO-8859-6","ISO-8859-7","ISO-8859-8","ISO-10646","ISO-10646-UCS-2","ISO-10646-UCS-4","UTF-7","UTF-8","US-ASCII","KOI8-R","ISO-2022-jp","EUC-JP","Shift_JIS","EUC-CN","GB2312","GBK","Big5","UHC","VISCII","windows-1250","windows-1251","windows-1252","windows-1253","windows-1254","windows-1255","windows-1256","windows-1257","windows-1258");
var theClearBRVal = new Array("", "left", "right", "all"); 
                      
var theDirectionVal = new Array("ltr","rtl"); 

var theFontSizesBFVal = new Array("1","2","3","4","5","6"); 
var theFontSizesFontVal = new Array("","1","2","3","4","5","6","+1","+2","+3","+4","+5","+6","-1","-2","-3","-4","-5","-6"); 
var theFormEncTypeGetVal = new Array("application/x-www-form-urlencoded");
var theFormEncTypePostVal = new Array("application/x-www-form-urlencoded","multipart/form-data");
var theFrameScrollingVal = new Array("auto","yes","no");

var theHAlignVal = new Array("left", "center", "right", "justify");

var theImgAltVal = new Array(" "); 
var theImgStartVal = new Array("fileopen","mouseover");
var theInputTypesVal = new Array("text","password","radio","checkbox","image","file","hidden","button","submit","reset");

var theHTTPMetaVal = new Array("", "Content-Type", "Refresh", "Expires", "Description", "Keywords", "Reply-to", "PICS-Label"); 

var theLanguagesVal = new Array("af","sq","ar","eu","br","bg","be","ca","zh","hr","cs","da", 
                                 "nl","en","et","fo","fa","fi","fr","gd","de","el","he","hi",
                                 "hu","is","id","it","ja","ko","lv","lt","mk","ms","mt","no",
                                 "pl","pt","rm","ro","ru","sz","sr","tn","sk","sl","es","sx", 
                                 "sv","th","ts","tr","uk","ur","vi","xh","yi","zu"); 
                                    
var theLanguageScriptVal = new Array("JavaScript","JavaScript1.1", "JavaScript1.2", "JavaScript1.3", "JavaScript1.4", "JavaScript1.5", "JScript","VBScript","LiveScript","php");
var theLinkTypesVal = new Array("text/css","text/javascript");
var theListTypesVal = new Array("ol","ul");
var theLoopsBGSoundVal = new Array("-1"); 

var theMethodTypesVal = new Array("get","post");
var theMIMETypesVal =  new Array("text/html", "text/plain", "application/msword", "application/msexcel", "application/postscript", "application/x-zip-compressed", "application/pdf", "application/rtf", "video/x-msvideo", "video/quicktime", "video/x-mpeg2", "audio/x-pn/realaudio", "audio/x-mpeg", "audio/x-waw", "audio/x-aiff", "audio/basic", "image/tiff", "image/jpeg", "image/gif", "image/x-png", "image/x-photo-cd", "image/x-MS-bmp", "image/x-rgb", "image/x-portable-pixmap", "image/x-portable-greymap", "image/x-portablebitmap"); 

var theNameMetaVal = new Array("", "Description", "Keywords", "Expires","Reply-to","PICS-Label"); 

var theOLTypesVal = new Array("","a","A","i","I");


var theTableFrameVal = new Array("void","above","below","hsides","lhs","rhs","vsides","box","border");
var theTableRulesVal = new Array("none","groups","rows","cols","all");
var theTargetVal = new Array("_top","_parent","_self","_blank"); 
var theTypeScriptVal = new Array("text/javascript", "text/jscript", "text/vbscript", "text/livescript", "text/php", "text/tcl"); 
var theTypeButtonVal = new Array("submit", "reset", "button"); 
var theTypesParamVal = new Array("text/html", "text/plain", "application/msword", "application/msexcel", "application/postscript", "application/postscript",  "application/x-zip-compressed", "application/x-zip-compressed", "application/pdf", "application/rtf", "video/x-msvideo", "video/quicktime", "video/quicktime", "video/x-mpeg2", "audio/x-pn/realaudio", "audio/x-mpeg", "audio/x-waw", "audio/x-aiff", "audio/basic", "image/tiff", "image/jpeg", "image/gif", "image/x-png", "image/x-photo-cd", "image/x-MS-bmp", "image/x-rgb", "image/x-portable-pixmap", "image/x-portable-greymap", "image/x-portablebitmap");

var theULTypesVal = new Array("","disc","circle","square");
var theVAlignStandardFourVal = new Array("top", "middle", "bottom","baseline"); 
var theValueTypesParamVal = new Array("data", "ref", "object"); 

var theWrapTAVal = new Array("", "off","virtual","physical");


