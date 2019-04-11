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

var theLookAndFeelCap = new Array("主题","窗口","金属");
var theSubmissionMethodsCap = new Array("POST", "GET"); 
var theLoginStorageCap= new Array("Cookie","Session");
var theVericalAlignmentsCap = new Array("绝对底部", "绝对居中", "基线","底部", "左对齐","居中", "右对齐","文本顶端","顶端"); 
var theAlignmentsCatchCap = new Array("应用程序", "数据库", "模板","对象", "同步","缺少 Include", "表达式","锁定","任意");
var theAlignmentsColCap = new Array("左对齐", "右对齐", "居中对齐"); 
var theTypesContentCap = new Array("文本/html", "文本/plain", "应用程序/msword", "应用程序/msexcel", 
               "应用程序/poscript", "应用程序/x-zip-compressed", "应用程序/pdf", 
               "应用程序/rtf", "视频/x-msvideo", "视频/quicktime", "视频/x-mpeg2", "音频/x-pn/realaudio", 
               "音频/x-mpeg", "音频/x-waw", "音频/x-aiff", "音频/basic", "图像/tiff", 
               "图像/jpeg", "图像/gif", "图像/x-png", "图像/x-photo-cd", "图像/x-MS-bmp", 
               "图像/x-rgb", "图像/x-portable-pixmap", "图像/x-portable-greymap", "图像/x-portablebitmap"); 
               
var theExpiresCap = new Array("立即", "从不");        
var theLanCollectionCap = new Array("英语", "阿拉伯语", "博克马尔语", "保加利亚语", "中文", "捷克语", "丹麦语", "荷兰语", "芬兰语", "法语", "德语", "希腊语", "希伯来语", "匈牙利语", "韩文", "意大利语", "日语", "尼诺斯克语", "挪威语", "波兰语", "葡萄牙语", "俄语", "俄语2", "西班牙语", "瑞典语", "繁体中文", "土耳其语", "Unicode"); 
var theSelCollectionCap = new Array("List", "Create", "Delete",  "Map", "Optimize", "Repair", "CategoryList"); 
var theSelDirectoryCap = new Array("列表","创建","删除","重命名"); 
var theSelFileCap = new Array("上传", "复制", "移动", "重命名", "删除", "添加", "写入", "读取", "读二进制"); 
var theFileNameConflictCap = new Array("错误", "跳过", "覆盖", "使唯一"); 
var theSelectModeCap = new Array("浏览","列","编辑","行","单个"); 
var theGridDataAlignCap = new Array("左对齐","居中对齐","右对齐"); 
var theGridColTypeCap= new Array("IMAGE","NUMERIC","STRING_NOCASE","BOOLEAN","CURRENCY");
var theSelHeaderCap = new Array("标题", "状态");
var theSelCalendarCap = new Array("常规", "事件"); 
var theSelInvokeCap = new Array("组件","Web 服务"); 
var theHTTPMethodCap= new Array("GET","POST","HEAD","PUT","DELETE","OPTIONS","TRACE");
var theHTTPPARAMTypeCap= new Array("FORMFIELD","URL","COOKIE","FILE","CGI","HEADER","BODY");
var theTransactionActionCap= new Array("BEGIN","COMMIT","ROLLBACK");
var theObjectActionCap = new Array("创建","连接"); 
var theObjectCOMContextCap= new Array("Inproc","Local","Remote");
var theObjectCORBAContextCap= new Array("IOR","NameService");
var theSelObjectCap = new Array("组件","ComDCom", "Corba", "Java"); 
var theSearchTypeCap = new Array("简单", "明确", "自然", "互联网", "互联网（基本）"); 
var theServletparamTypeCap = new Array("布尔型", "日期", "双精度", "整数", "字符串"); 

var theRegistryGetSetTypeCap= new Array("String","DWord","Key");
var theRegistryGetAllTypeCap= new Array("String","Any","DWord","Key");

var theParamTypeCap = new Array("任意","数组","布尔型","二进制","信用卡","日期","电子邮件","欧洲日期","浮点型","GUID","整数","数值","查询","范围","RegEx","字符串","结构","SSN","电话","时间","URL","UUID","变量名称","邮政编码"); 
var theLockTypeCap= new Array("EXCLUSIVE","READONLY");
var theLockScopeCap= new Array("SESSION","APPLICATION","SERVER");
var theProcparamTypeCap= new Array("In","Out","InOut");
var theSelMailparamCap = new Array("标题","文件");                                          
var theIndexTypeCap = new Array("文件", "路径", "自定义"); 
var theSelIndexCap = new Array("更新", "刷新", "删除", "清除"); 
var theSelInputCap = new Array("文本", "单选", "复选框", "密码"); 
var theTextInputValidateCap = new Array("信用卡","日期","欧洲日期","浮点型","整数","SSN","电话","时间","邮政编码"); 
var theInputValidateCap = new Array("布尔型","信用卡","日期","电子邮件","欧洲日期","浮点型","GUID","整数","最大长度","无空白","范围","RegEx","SSN","一次性提交","电话","时间","URL","美国日期","UUID","邮政编码"); 
var theMailTypeCap = new Array("纯文本","HTML"); 
var theMailPartTypeCap= new Array("HTML","Plain","Text");
var theCharSetCap = new Array("big5","euc-cn","euc-jp","euc-kr","hz-gb-2312","iso-2022-jp","iso-2022-kr","iso-8859-1","iso-8859-2","iso-8859-3","iso-8859-4","iso-8859-5","iso-8859-6","iso-8859-7","iso-8859-8","iso-8859-9","shift_jis","us-ascii","utf-16","utf-8","GB2312"); 
var theQueryDBTypeCap = new Array("动态","查询","ODBC","OLEDB","Oracle73","Oracle80","Sybase11","DB2","Informix73"); 
var theSelCacheCap = new Array("缓存", "清除", "客户端缓存", "最优化"); 
var theErrorTypesCap = new Array("异常", "显示器", "请求", "验证");
var theScopeCfldapCap= new Array("ONELEVEL","BASE","SUBTREE");
var theModifyTypeCfldapCap= new Array("ADD","DELETE","REPLACE");
var theSelCfscheduleCap = new Array("更新","删除","运行"); 
var theLogLogCap = new Array("应用程序","计划程序"); 
var theTypeLogCap = new Array("信息", "警告", "错误", "致命错误"); 
var theSelGraphCap = new Array("条形","折线","饼形");
var theFileFormatGraphCap = new Array("Flash","jpg","png"); 
var theShowValueLabelGraphCap = new Array("是","否","变换"); 
var theValueLabelFontGraphCap = new Array("Arial","Courier","Times"); 
var theItemLabelFontGraphCap = new Array("Arial","Courier","Times"); 
var theTitleFontGraphCap = new Array("Arial","Courier","Times"); 
var theShowLegendGraphCap = new Array("上","下","左","右","无"); 
var theValueLocationPieCap= new Array("内部","外部");
var theItemLabelOrientationGraphCap = new Array("水平","垂直"); 
var theShowLegendGraphCap = new Array("上", "下", "左", "右", "无"); 
var theLegendFontGraphCap = new Array("Arial","Courier","Times"); 
var theGetAsBinaryCap= new Array("No","Yes","Auto");
var theReportTypeCap= new Array("Standard","Netscape","Microsoft");
var theReportFormatCap = new Array("Flashpaper","PDF");
var theFormFormatCap = new Array("HTML","Flash", "XML");
var theGridFormatCap = new Array("Applet" , "Flash" , "XML");
var theTreeFormatCap = new Array("Applet" , "Flash" , "XML" , "对象" );
var theSkinListCap = new Array("蓝色光晕","绿色光晕" , "橙色光晕", "银色光晕");
var theXMLSkinListCap = new Array("无颜色","基本色","BasicCSS","米色","蓝色","蓝灰色","默认色","浅灰色","红色","银色");


// CFC strings to localize 
var theTypesCap  = new Array("任意","数组","二进制","布尔型","日期","数值","查询","字符串","结构","UUID","变量名称","无效", "XML");
var theAccessCap = new Array("私有","包","公共","远程"); 
var theTraceTypeCap = new Array("信息","警告","错误","致命错误"); 
var theObjectcacheActionCap = new Array("清除"); 
var theChartSeriesTypeCap = new Array("面积","条形","水平条","锥形","曲线","圆柱体","折线","饼形","棱锥形","散点","步长"); 
var theChartSeriesPaintStyleCap = new Array("平面","凸起","阴影","发光"); 

var theChartFormatCap = new Array("Flash","JPG","PNG"); 
var theChartSeriesplacementCap = new Array("默认","簇状","堆积","百分比"); 
var theChartLabelformatCap = new Array("数字","货币","百分比","日期"); 
var theChartPieSliceStyleCap = new Array("实线","切片"); 
var theDataLabelStyleCap = new Array("无", "值", "行标签", "列标签", "模式");
var theSelTimerCap = new Array("调试", "成行", "外框", "注释");
var theSelDocumentItemCap = new Array("分页","页眉","页脚");
var theSelFormItemCap = new Array("hrule" , "vrule" , "间隔" , "html" , "文本");
var theSelFormGroupCap = new Array("字段集","accordion","hbox","hdividedbox","水平", "页面", "面板", "重复", "tabnavigator", "平铺", "vbox", "vdividedbox", "垂直");
var theTextAreaCap = new Array("OnSubmit", "OnServer", "OnBlur");
var theDocumentFormatCap = new Array("FlashPaper", "PDF");
var theDocumentPageTypeCap = new Array("Legal", "Letter", "A4", "A5", "B4" , "B4-JIIS" , "B5", "B5-JIIS", "自定义");
var theDocumentUnitsCap = new Array("英寸", "厘米");
var theDocumentEncryptionCap = new Array("无", "128 位", "48 位");
var theDocumentPermissionsCap = new Array("允许打印", "允许修改内容", "允许复制", "允许修改", "允许填充", "允许使用屏幕阅读器", "允许组合", "允许低分辨率打印");
var theDocumentOrientationCap = new Array("纵向", "横向");
var theComponentStyleCap = new Array("RPC","文档");
var theMailparamTypeCap = new Array("纯文本","文本","html");
var theReportPDFEncryptionCap = new Array("无","128 位","40 位");
var theReportPDFPermissionsCap = new Array("允许打印","允许修改内容","允许复制","允许修改批注","允许填充","允许使用屏幕阅读器", "允许组合","允许低分辨率打印");
var theDelimeterCap = new Array("逗号","制表符","空格","换行符");
//--------------- END LOCALIZEABLE   ---------------
