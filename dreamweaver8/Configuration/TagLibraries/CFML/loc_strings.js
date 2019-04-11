// Copyright 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.
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

var theLookAndFeelCap = new Array("����","����","����");
var theSubmissionMethodsCap = new Array("POST", "GET"); 
var theLoginStorageCap= new Array("Cookie","Session");
var theVericalAlignmentsCap = new Array("���Եײ�", "���Ծ���", "����","�ײ�", "�����","����", "�Ҷ���","�ı�����","����"); 
var theAlignmentsCatchCap = new Array("Ӧ�ó���", "���ݿ�", "ģ��","����", "ͬ��","ȱ�� Include", "���ʽ","����","����");
var theAlignmentsColCap = new Array("�����", "�Ҷ���", "���ж���"); 
var theTypesContentCap = new Array("�ı�/html", "�ı�/plain", "Ӧ�ó���/msword", "Ӧ�ó���/msexcel", 
               "Ӧ�ó���/poscript", "Ӧ�ó���/x-zip-compressed", "Ӧ�ó���/pdf", 
               "Ӧ�ó���/rtf", "��Ƶ/x-msvideo", "��Ƶ/quicktime", "��Ƶ/x-mpeg2", "��Ƶ/x-pn/realaudio", 
               "��Ƶ/x-mpeg", "��Ƶ/x-waw", "��Ƶ/x-aiff", "��Ƶ/basic", "ͼ��/tiff", 
               "ͼ��/jpeg", "ͼ��/gif", "ͼ��/x-png", "ͼ��/x-photo-cd", "ͼ��/x-MS-bmp", 
               "ͼ��/x-rgb", "ͼ��/x-portable-pixmap", "ͼ��/x-portable-greymap", "ͼ��/x-portablebitmap"); 
               
var theExpiresCap = new Array("����", "�Ӳ�");        
var theLanCollectionCap = new Array("Ӣ��", "��������", "���������", "����������", "����", "�ݿ���", "������", "������", "������", "����", "����", "ϣ����", "ϣ������", "��������", "����", "�������", "����", "��ŵ˹����", "Ų����", "������", "��������", "����", "����2", "��������", "�����", "��������", "��������", "Unicode"); 
var theSelCollectionCap = new Array("List", "Create", "Delete",  "Map", "Optimize", "Repair", "CategoryList"); 
var theSelDirectoryCap = new Array("�б�","����","ɾ��","������"); 
var theSelFileCap = new Array("�ϴ�", "����", "�ƶ�", "������", "ɾ��", "���", "д��", "��ȡ", "��������"); 
var theFileNameConflictCap = new Array("����", "����", "����", "ʹΨһ"); 
var theSelectModeCap = new Array("���","��","�༭","��","����"); 
var theGridDataAlignCap = new Array("�����","���ж���","�Ҷ���"); 
var theGridColTypeCap= new Array("IMAGE","NUMERIC","STRING_NOCASE","BOOLEAN","CURRENCY");
var theSelHeaderCap = new Array("����", "״̬");
var theSelCalendarCap = new Array("����", "�¼�"); 
var theSelInvokeCap = new Array("���","Web ����"); 
var theHTTPMethodCap= new Array("GET","POST","HEAD","PUT","DELETE","OPTIONS","TRACE");
var theHTTPPARAMTypeCap= new Array("FORMFIELD","URL","COOKIE","FILE","CGI","HEADER","BODY");
var theTransactionActionCap= new Array("BEGIN","COMMIT","ROLLBACK");
var theObjectActionCap = new Array("����","����"); 
var theObjectCOMContextCap= new Array("Inproc","Local","Remote");
var theObjectCORBAContextCap= new Array("IOR","NameService");
var theSelObjectCap = new Array("���","ComDCom", "Corba", "Java"); 
var theSearchTypeCap = new Array("��", "��ȷ", "��Ȼ", "������", "��������������"); 
var theServletparamTypeCap = new Array("������", "����", "˫����", "����", "�ַ���"); 

var theRegistryGetSetTypeCap= new Array("String","DWord","Key");
var theRegistryGetAllTypeCap= new Array("String","Any","DWord","Key");

var theParamTypeCap = new Array("����","����","������","������","���ÿ�","����","�����ʼ�","ŷ������","������","GUID","����","��ֵ","��ѯ","��Χ","RegEx","�ַ���","�ṹ","SSN","�绰","ʱ��","URL","UUID","��������","��������"); 
var theLockTypeCap= new Array("EXCLUSIVE","READONLY");
var theLockScopeCap= new Array("SESSION","APPLICATION","SERVER");
var theProcparamTypeCap= new Array("In","Out","InOut");
var theSelMailparamCap = new Array("����","�ļ�");                                          
var theIndexTypeCap = new Array("�ļ�", "·��", "�Զ���"); 
var theSelIndexCap = new Array("����", "ˢ��", "ɾ��", "���"); 
var theSelInputCap = new Array("�ı�", "��ѡ", "��ѡ��", "����"); 
var theTextInputValidateCap = new Array("���ÿ�","����","ŷ������","������","����","SSN","�绰","ʱ��","��������"); 
var theInputValidateCap = new Array("������","���ÿ�","����","�����ʼ�","ŷ������","������","GUID","����","��󳤶�","�޿հ�","��Χ","RegEx","SSN","һ�����ύ","�绰","ʱ��","URL","��������","UUID","��������"); 
var theMailTypeCap = new Array("���ı�","HTML"); 
var theMailPartTypeCap= new Array("HTML","Plain","Text");
var theCharSetCap = new Array("big5","euc-cn","euc-jp","euc-kr","hz-gb-2312","iso-2022-jp","iso-2022-kr","iso-8859-1","iso-8859-2","iso-8859-3","iso-8859-4","iso-8859-5","iso-8859-6","iso-8859-7","iso-8859-8","iso-8859-9","shift_jis","us-ascii","utf-16","utf-8","GB2312"); 
var theQueryDBTypeCap = new Array("��̬","��ѯ","ODBC","OLEDB","Oracle73","Oracle80","Sybase11","DB2","Informix73"); 
var theSelCacheCap = new Array("����", "���", "�ͻ��˻���", "���Ż�"); 
var theErrorTypesCap = new Array("�쳣", "��ʾ��", "����", "��֤");
var theScopeCfldapCap= new Array("ONELEVEL","BASE","SUBTREE");
var theModifyTypeCfldapCap= new Array("ADD","DELETE","REPLACE");
var theSelCfscheduleCap = new Array("����","ɾ��","����"); 
var theLogLogCap = new Array("Ӧ�ó���","�ƻ�����"); 
var theTypeLogCap = new Array("��Ϣ", "����", "����", "��������"); 
var theSelGraphCap = new Array("����","����","����");
var theFileFormatGraphCap = new Array("Flash","jpg","png"); 
var theShowValueLabelGraphCap = new Array("��","��","�任"); 
var theValueLabelFontGraphCap = new Array("Arial","Courier","Times"); 
var theItemLabelFontGraphCap = new Array("Arial","Courier","Times"); 
var theTitleFontGraphCap = new Array("Arial","Courier","Times"); 
var theShowLegendGraphCap = new Array("��","��","��","��","��"); 
var theValueLocationPieCap= new Array("�ڲ�","�ⲿ");
var theItemLabelOrientationGraphCap = new Array("ˮƽ","��ֱ"); 
var theShowLegendGraphCap = new Array("��", "��", "��", "��", "��"); 
var theLegendFontGraphCap = new Array("Arial","Courier","Times"); 
var theGetAsBinaryCap= new Array("No","Yes","Auto");
var theReportTypeCap= new Array("Standard","Netscape","Microsoft");
var theReportFormatCap = new Array("Flashpaper","PDF");
var theFormFormatCap = new Array("HTML","Flash", "XML");
var theGridFormatCap = new Array("Applet" , "Flash" , "XML");
var theTreeFormatCap = new Array("Applet" , "Flash" , "XML" , "����" );
var theSkinListCap = new Array("��ɫ����","��ɫ����" , "��ɫ����", "��ɫ����");
var theXMLSkinListCap = new Array("����ɫ","����ɫ","BasicCSS","��ɫ","��ɫ","����ɫ","Ĭ��ɫ","ǳ��ɫ","��ɫ","��ɫ");


// CFC strings to localize 
var theTypesCap  = new Array("����","����","������","������","����","��ֵ","��ѯ","�ַ���","�ṹ","UUID","��������","��Ч", "XML");
var theAccessCap = new Array("˽��","��","����","Զ��"); 
var theTraceTypeCap = new Array("��Ϣ","����","����","��������"); 
var theObjectcacheActionCap = new Array("���"); 
var theChartSeriesTypeCap = new Array("���","����","ˮƽ��","׶��","����","Բ����","����","����","��׶��","ɢ��","����"); 
var theChartSeriesPaintStyleCap = new Array("ƽ��","͹��","��Ӱ","����"); 

var theChartFormatCap = new Array("Flash","JPG","PNG"); 
var theChartSeriesplacementCap = new Array("Ĭ��","��״","�ѻ�","�ٷֱ�"); 
var theChartLabelformatCap = new Array("����","����","�ٷֱ�","����"); 
var theChartPieSliceStyleCap = new Array("ʵ��","��Ƭ"); 
var theDataLabelStyleCap = new Array("��", "ֵ", "�б�ǩ", "�б�ǩ", "ģʽ");
var theSelTimerCap = new Array("����", "����", "���", "ע��");
var theSelDocumentItemCap = new Array("��ҳ","ҳü","ҳ��");
var theSelFormItemCap = new Array("hrule" , "vrule" , "���" , "html" , "�ı�");
var theSelFormGroupCap = new Array("�ֶμ�","accordion","hbox","hdividedbox","ˮƽ", "ҳ��", "���", "�ظ�", "tabnavigator", "ƽ��", "vbox", "vdividedbox", "��ֱ");
var theTextAreaCap = new Array("OnSubmit", "OnServer", "OnBlur");
var theDocumentFormatCap = new Array("FlashPaper", "PDF");
var theDocumentPageTypeCap = new Array("Legal", "Letter", "A4", "A5", "B4" , "B4-JIIS" , "B5", "B5-JIIS", "�Զ���");
var theDocumentUnitsCap = new Array("Ӣ��", "����");
var theDocumentEncryptionCap = new Array("��", "128 λ", "48 λ");
var theDocumentPermissionsCap = new Array("�����ӡ", "�����޸�����", "������", "�����޸�", "�������", "����ʹ����Ļ�Ķ���", "�������", "����ͷֱ��ʴ�ӡ");
var theDocumentOrientationCap = new Array("����", "����");
var theComponentStyleCap = new Array("RPC","�ĵ�");
var theMailparamTypeCap = new Array("���ı�","�ı�","html");
var theReportPDFEncryptionCap = new Array("��","128 λ","40 λ");
var theReportPDFPermissionsCap = new Array("�����ӡ","�����޸�����","������","�����޸���ע","�������","����ʹ����Ļ�Ķ���", "�������","����ͷֱ��ʴ�ӡ");
var theDelimeterCap = new Array("����","�Ʊ��","�ո�","���з�");
//--------------- END LOCALIZEABLE   ---------------
