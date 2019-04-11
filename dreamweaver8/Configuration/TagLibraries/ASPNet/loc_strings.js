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

var theAlignmentsLRCap= new Array("左对齐","右对齐");
var theAlignmentsImgCap= new Array("未设置","左对齐","右对齐","基线","顶端","中间","底部","绝对中间","绝对底部","文本顶端");
var theStandardAlignsCap= new Array("未设置","左对齐","居中对齐","右对齐","两端对齐");
var theStandardFourAlignsCap= new Array("未设置","左对齐","居中对齐","右对齐");
var theStandardValignsCap= new Array("未设置","顶端","中间","底部");
var theStandardGridlinesCap= new Array("无","水平","垂直","两者");

var theDirectionsCap= new Array("水平","垂直");

var theDisplaysCap= new Array("无","静态","动态");
var theDisplayModesVSCap= new Array("列表","项目列表","单段");

var theLayoutsCap= new Array("表","流");

var theOperatorsCap= new Array("等于","不等于","大于","大于等于","小于","小于等于","数据类型检查");

var theRepeatDirRBLCap= new Array("水平","垂直");
var theRepeatLayRBLCap= new Array("左对齐","右对齐");

var theSelectionsLBCap= new Array("单个","多个");
var theStylesCap= new Array("未设置","无","点划线","虚线","实线","双线","槽状","脊状","凹入","凸出");

var theTextModesCap= new Array("单行","多行","密码");
var theTypesCap= new Array("字符串","整数","双精度","日期","货币");

var theTargetVal= new Array("_top","_parent","_self","_blank");
var theRepeatDirectionListCap= new Array("水平","垂直");
var theRepeatLayoutListCap= new Array("表","流");

var theCalendarDayNameFormatCap= new Array("短","首字母","前两个字母");
var theCalendarNextPrevFormatCap= new Array("自定义文本","短月份","完整月份");
var theCalendarSelectionModeCap= new Array("无","日","日周","日周月");
var theCalendarTitleFormatCap= new Array("月","月年");
var theCalendarFirstDayOfWeekCap= new Array("星期日","星期一","星期二","星期三","星期四","星期五","星期六");

// custom MM tags
var theParameterTypeCap= new Array("BigInt","Boolean","Char","Currency","DBDate","DBTime","DBTimeStamp","Decimal","Double","Integer","Single","SmallInt","TinyInt","UnsignedBigInt","UnsignedInt","UnsignedSmallInt","UnsignedTinyInt","VarChar","VarWChar","VarNumeric");

//--------------- END LOCALIZEABLE   ---------------
