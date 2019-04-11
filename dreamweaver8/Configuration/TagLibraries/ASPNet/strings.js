// Copyright 2001, 2002, 2003, 2004 Macromedia, Inc. All rights reserved.
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

var theAlignmentsLRVal = new Array("left", "right");
var theAlignmentsImgVal = new Array("NotSet","Left","Right","Baseline","Top","Middle","Bottom","AbsMiddle","AbsBottom","Texttop"); 
var theStandardAlignsVal = new Array("NotSet","Left","Center","Right","Justify");
var theStandardFourAlignsVal = new Array("NotSet","Left","Center","Right");
var theStandardValignsVal = new Array("NotSet","Top","Middle","Bottom"); 
var theStandardGridlinesVal = new Array("None", "Horizontal", "Vertical", "Both"); 

var theDirectionsVal = new Array("horizontal", "vertical");

var theDisplayModesVSVal = new Array("List","BulletList","SingleParagraph");
var theDisplaysVal = new Array("None","Static","Dynamic"); 

var theLayoutsVal = new Array("table", "flow"); 

var theOperatorsVal = new Array("Equal","NotEqual","GreaterThan","GreaterThanEqual","LessThan","LessThanEqual","DataTypeCheck"); 

var theSelectionsLBVal = new Array("single", "multiple");
var theStylesVal = new Array("notset", "none", "dotted", "dashed","solid","double","groove","ridge","inset","outset"); 

var	theTextModesVal = new Array("SingleLine", "MultiLine", "Password"); 
var theTypesVal = new Array("String","Integer","Double","Date","Currency"); 

var theRepeatDirRBLVal = new Array("Horizontal","Vertical"); 
var theRepeatLayRBLVal = new Array("Left", "Right"); 

var theRepeatDirectionListVal = new Array("Horizontal","Vertical"); 
var theRepeatLayoutListVal = new Array("Table","Flow"); 

var theCalendarDayNameFormatVal = new Array("Short","FirstLetter","FirstTwoLetters"); 
var theCalendarNextPrevFormatVal = new Array("CustomText","ShortMonth","FullMonth"); 
var theCalendarSelectionModeVal = new Array("None","Day","DayWeek","DayWeekMonth"); 
var theCalendarTitleFormatVal = new Array("Month","MonthYear"); 
var theCalendarFirstDayOfWeekVal = new Array("Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"); 

var theButtonColumnButtonTypVal = new Array("LinkButton","PushButton"); 

// custom MM tags 
var theParameterDirectionVal = new Array("Input","InputOutput","Output","ReturnValue"); 
var theParameterTypeVal = new Array("BigInt","Boolean","Char","Currency","DBDate","DBTime","DBTimeStamp","Decimal","Double","Integer","Single","SmallInt","TinyInt","UnsignedBigInt","UnsignedInt","UnsignedSmallInt","UnsignedTinyInt","VarChar","VarWChar","VarNumeric"); 

