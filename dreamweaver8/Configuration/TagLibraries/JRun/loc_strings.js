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

var theInputTypesCap= new Array("复选框","信用卡","日期","欧洲日期","浮点型","整数","密码","电话","单选按钮","ssc","文本","时间","邮政编码");

var theJRunFormMethodsCap= new Array("get","post");

var theSelJNDICap= new Array("查找","列表","属性","搜索");
var theSelmailparamCap= new Array("附件","标题");
var theSelSelectCap= new Array("哈希表","列");
var theSelXSLTCap= new Array("输入","空");
var theMailTypesCap= new Array("邮件服务器","JavaMail");

//--------------- END LOCALIZEABLE   ---------------
