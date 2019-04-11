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

var theAlignCaptionCap= new Array("����","�ײ�","�����","�Ҷ���");
var theAlignImgCap= new Array("����","����","����","�ײ�","�ı�����","���Ծ���","���Եײ�","�����","�Ҷ���");
var theAlignLegendCap= new Array("�����","�Ҷ���","���ж��� - �������� MSIE 4+");
var theAlignObjectCap= new Array("����","�ײ�","����","�����","�Ҷ���");
var theAlignsHRCap= new Array("�����","���ж��루Ĭ�ϣ�","�Ҷ���");
var theAlignStandardFourCap= new Array("�����","���ж���","�Ҷ���","���˶��� - �������ڵ� 4 �������");
var theAlignTableCap= new Array("Ĭ��","�����","�Ҷ���","���ж���");
var theAreaShapesCap= new Array("Ĭ��","����","Բ��","�����");

var theCellScopesCap= new Array("��","����","��","����");
var theClearBRCap= new Array("�ޣ�Ĭ�ϣ�","�����","�Ҷ���","ȫ��");

var theDirectionCap= new Array("��������","��������");

var theFontSizesFontCap= new Array("��","1","2","3","4","5","6","+1","+2","+3","+4","+5","+6","-1","-2","-3","-4","-5","-6");
var theFrameScrollingCap= new Array("�Զ���Ĭ�ϣ�","��","��");


var theHAlignCap= new Array("�����","���ж���","�Ҷ���","���˶��� - �������ڵ� 4 �������");
var theHTTPMetaCap= new Array("��","��������","ˢ��","����","����","�ؼ���","�ظ���","PICS ��ǩ");

var theImgAltCap= new Array("[���ַ���]");
var theImgStartCap= new Array("fileopen (default)","mouseover");
var theInputTypesCap= new Array("�ı�","����","��ѡ��ť","��ѡ��","ͼ��","�ļ�","����","��ť","�ύ","����");

var theLanguagesCap= new Array("af �ϷǺ�����","sq ������������","ar ���������Ҫ�����ͣ�","eu ��˹����","br ����������","bg ����������","be �׶���˹��","ca ��̩��������","zh ���ģ���Ҫ�����ͣ�","hr ���޵�����","cs �ݿ���","da ������","nl �������׼��","en Ӣ��","et ��ɳ������","fo ������","fa ��˹��","fi ������","fr �����׼��","gd �Ƕ���ո�����","de �����׼��","el ϣ����","he ϣ������","hi ӡ����","hu ��������","is ������","id ӡ����������","it ��������׼��","ja ����","ko ������","lv ����ά����","lt ��������","mk �������","ms ����������","mt �������","no Ų����������/��ŵ˹�ˣ�","pl ������","pt ���������׼��","rm ����-������","ro ����������","ru ����","sz ��Ħ˹��������","sr ����ά����������/�����","tn ����������","sk ˹�工����","sl ˹����������","es ���������������","sx ��ͼ��","sv �����","th ̩��","ts �ϼ���","tr ��������","uk �ڿ�����","ur �ڶ�����","vi Խ����","xh ������","yi �������","zu ��³��");















var theTypesParamCap= new Array("text/html","text/plain","application/msword","application/msexcel","application/postscript","application/postscript","application/x-zip-compressed","application/x-zip-compressed","application/pdf","application/rtf","video/x-msvideo","video/quicktime","video/quicktime","video/x-mpeg2","audio/x-pn/realaudio","audio/x-mpeg","audio/x-waw","audio/x-aiff","audio/basic","image/tiff","image/jpeg","image/gif","image/x-png","image/x-photo-cd","image/x-MS-bmp","image/x-rgb","image/x-portable-pixmap","image/x-portable-greymap","image/x-portablebitmap");
var theTypeScriptCap= new Array("text/javascript","text/jscript","text/vbscript","text/livescript","text/php","text/tcl");

var theListTypesCap= new Array("����б�","��Ŀ�б�");
var theLoopsBGSoundCap= new Array("���� (-1)");

var theTableRulesCap= new Array("��","��","��","��","����");

var theMIMETypesCap= new Array("text/html","text/plain","application/msword","application/msexcel","application/postscript","application/x-zip-compressed","application/pdf","application/rtf","video/x-msvideo","video/quicktime","video/x-mpeg2","audio/x-pn/realaudio","audio/x-mpeg","audio/x-waw","audio/x-aiff","audio/basic","image/tiff","image/jpeg","image/gif","image/x-png","image/x-photo-cd","image/x-MS-bmp","image/x-rgb","image/x-portable-pixmap","image/x-portable-greymap","image/x-portablebitmap");


var theNameMetaCap= new Array("��","����","�ؼ���","����","�ظ���","PICS ��ǩ");

var theOLTypesCap= new Array("1. ��������ĸ��Ĭ�ϣ�","a. Сдϣ����ĸ","A. ��дϣ����ĸ","i. Сд������ĸ","I. ��д������ĸ");

var theTypeButtonCap= new Array("�ύ��HTML 4.1 Ĭ�ϣ�","����","��ť��IE Ĭ�ϣ�");

var theULTypesCap= new Array("��Ĭ�ϣ�","Բ��","Բ��","������");
var theVAlignStandardFourCap= new Array("����","����","�ײ�","����");

var theValueTypesParamCap= new Array("���� - Ĭ��","�ο�","����");

var theWrapTACap= new Array("Ĭ��","��","����","ʵ��");

//--------------- END LOCALIZEABLE   ---------------
