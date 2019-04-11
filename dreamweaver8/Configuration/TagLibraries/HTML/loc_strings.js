// Copyright 2001 Macromedia, Inc. All rights reserved.
/* loc_strings.js
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

//--------------- LOCALIZEABLE GLOBALS---------------

var theAlignCaptionCap= new Array("顶端","底部","左对齐","右对齐");
var theAlignImgCap= new Array("基线","顶端","居中","底部","文本顶端","绝对居中","绝对底部","左对齐","右对齐");
var theAlignLegendCap= new Array("左对齐","右对齐","居中对齐 - 仅适用于 MSIE 4+");
var theAlignObjectCap= new Array("顶端","底部","居中","左对齐","右对齐");
var theAlignsHRCap= new Array("左对齐","居中对齐（默认）","右对齐");
var theAlignStandardFourCap= new Array("左对齐","居中对齐","右对齐","两端对齐 - 仅适用于第 4 版浏览器");
var theAlignTableCap= new Array("默认","左对齐","右对齐","居中对齐");
var theAreaShapesCap= new Array("默认","矩形","圆形","多边形");

var theCellScopesCap= new Array("列","列组","行","行组");
var theClearBRCap= new Array("无（默认）","左对齐","右对齐","全部");

var theDirectionCap= new Array("从左至右","从右至左");

var theFontSizesFontCap= new Array("无","1","2","3","4","5","6","+1","+2","+3","+4","+5","+6","-1","-2","-3","-4","-5","-6");
var theFrameScrollingCap= new Array("自动（默认）","是","否");


var theHAlignCap= new Array("左对齐","居中对齐","右对齐","两端对齐 - 仅适用于第 4 版浏览器");
var theHTTPMetaCap= new Array("无","内容类型","刷新","过期","描述","关键字","回复给","PICS 标签");

var theImgAltCap= new Array("[空字符串]");
var theImgStartCap= new Array("fileopen (default)","mouseover");
var theInputTypesCap= new Array("文本","密码","单选按钮","复选框","图像","文件","隐藏","按钮","提交","重置");

var theLanguagesCap= new Array("af 南非荷兰语","sq 阿尔巴尼亚语","ar 阿拉伯语（需要子类型）","eu 巴斯克语","br 布列塔尼语","bg 保加利亚语","be 白俄罗斯语","ca 加泰罗尼亚语","zh 中文（需要子类型）","hr 克罗地亚语","cs 捷克语","da 丹麦语","nl 荷兰语（标准）","en 英语","et 爱沙尼亚语","fo 法罗语","fa 波斯语","fi 芬兰语","fr 法语（标准）","gd 盖尔语（苏格兰）","de 德语（标准）","el 希腊语","he 希伯来语","hi 印地语","hu 匈牙利语","is 冰岛语","id 印度尼西亚语","it 意大利语（标准）","ja 日语","ko 朝鲜语","lv 拉托维亚语","lt 立陶宛语","mk 马其顿语","ms 马来西亚语","mt 马耳他语","no 挪威语（博克马尔/尼诺斯克）","pl 波兰语","pt 葡萄牙语（标准）","rm 拉托-罗马语","ro 罗马尼亚语","ru 俄语","sz 萨摩斯语（拉普兰语）","sr 塞尔维亚语（西里尔语/拉丁语）","tn 博茨瓦纳语","sk 斯洛伐克语","sl 斯洛文尼亚语","es 西班牙语（西班牙）","sx 苏图语","sv 瑞典语","th 泰语","ts 聪加语","tr 土耳其语","uk 乌克兰语","ur 乌尔都语","vi 越南语","xh 科萨语","yi 意第绪语","zu 祖鲁语");















var theTypesParamCap= new Array("text/html","text/plain","application/msword","application/msexcel","application/postscript","application/postscript","application/x-zip-compressed","application/x-zip-compressed","application/pdf","application/rtf","video/x-msvideo","video/quicktime","video/quicktime","video/x-mpeg2","audio/x-pn/realaudio","audio/x-mpeg","audio/x-waw","audio/x-aiff","audio/basic","image/tiff","image/jpeg","image/gif","image/x-png","image/x-photo-cd","image/x-MS-bmp","image/x-rgb","image/x-portable-pixmap","image/x-portable-greymap","image/x-portablebitmap");
var theTypeScriptCap= new Array("text/javascript","text/jscript","text/vbscript","text/livescript","text/php","text/tcl");

var theListTypesCap= new Array("编号列表","项目列表");
var theLoopsBGSoundCap= new Array("无限 (-1)");

var theTableRulesCap= new Array("无","组","行","列","所有");

var theMIMETypesCap= new Array("text/html","text/plain","application/msword","application/msexcel","application/postscript","application/x-zip-compressed","application/pdf","application/rtf","video/x-msvideo","video/quicktime","video/x-mpeg2","audio/x-pn/realaudio","audio/x-mpeg","audio/x-waw","audio/x-aiff","audio/basic","image/tiff","image/jpeg","image/gif","image/x-png","image/x-photo-cd","image/x-MS-bmp","image/x-rgb","image/x-portable-pixmap","image/x-portable-greymap","image/x-portablebitmap");


var theNameMetaCap= new Array("无","描述","关键字","过期","回复给","PICS 标签");

var theOLTypesCap= new Array("1. 阿拉伯字母（默认）","a. 小写希腊字母","A. 大写希腊字母","i. 小写罗马字母","I. 大写罗马字母");

var theTypeButtonCap= new Array("提交（HTML 4.1 默认）","重置","按钮（IE 默认）");

var theULTypesCap= new Array("（默认）","圆盘","圆形","正方形");
var theVAlignStandardFourCap= new Array("顶端","居中","底部","基线");

var theValueTypesParamCap= new Array("数据 - 默认","参考","对象");

var theWrapTACap= new Array("默认","关","虚拟","实体");

//--------------- END LOCALIZEABLE   ---------------
