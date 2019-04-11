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

var theAlignmentsLRCap= new Array("�����","�Ҷ���");
var theAlignmentsImgCap= new Array("δ����","�����","�Ҷ���","����","����","�м�","�ײ�","�����м�","���Եײ�","�ı�����");
var theStandardAlignsCap= new Array("δ����","�����","���ж���","�Ҷ���","���˶���");
var theStandardFourAlignsCap= new Array("δ����","�����","���ж���","�Ҷ���");
var theStandardValignsCap= new Array("δ����","����","�м�","�ײ�");
var theStandardGridlinesCap= new Array("��","ˮƽ","��ֱ","����");

var theDirectionsCap= new Array("ˮƽ","��ֱ");

var theDisplaysCap= new Array("��","��̬","��̬");
var theDisplayModesVSCap= new Array("�б�","��Ŀ�б�","����");

var theLayoutsCap= new Array("��","��");

var theOperatorsCap= new Array("����","������","����","���ڵ���","С��","С�ڵ���","�������ͼ��");

var theRepeatDirRBLCap= new Array("ˮƽ","��ֱ");
var theRepeatLayRBLCap= new Array("�����","�Ҷ���");

var theSelectionsLBCap= new Array("����","���");
var theStylesCap= new Array("δ����","��","�㻮��","����","ʵ��","˫��","��״","��״","����","͹��");

var theTextModesCap= new Array("����","����","����");
var theTypesCap= new Array("�ַ���","����","˫����","����","����");

var theTargetVal= new Array("_top","_parent","_self","_blank");
var theRepeatDirectionListCap= new Array("ˮƽ","��ֱ");
var theRepeatLayoutListCap= new Array("��","��");

var theCalendarDayNameFormatCap= new Array("��","����ĸ","ǰ������ĸ");
var theCalendarNextPrevFormatCap= new Array("�Զ����ı�","���·�","�����·�");
var theCalendarSelectionModeCap= new Array("��","��","����","������");
var theCalendarTitleFormatCap= new Array("��","����");
var theCalendarFirstDayOfWeekCap= new Array("������","����һ","���ڶ�","������","������","������","������");

// custom MM tags
var theParameterTypeCap= new Array("BigInt","Boolean","Char","Currency","DBDate","DBTime","DBTimeStamp","Decimal","Double","Integer","Single","SmallInt","TinyInt","UnsignedBigInt","UnsignedInt","UnsignedSmallInt","UnsignedTinyInt","VarChar","VarWChar","VarNumeric");

//--------------- END LOCALIZEABLE   ---------------
