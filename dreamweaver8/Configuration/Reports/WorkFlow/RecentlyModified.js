// Copyright 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

//*************** GLOBAL CONSTANTS *****************

var helpDoc = MM.HELP_recentlyModifiedReport;
var WEEK_BACK = "7";

//*************** GLOBAL VARIABLES *****************

// other globals
var CK_VALUES = 
{
 // Default values - names,Days must match cooresponding object names.
  CKName:'',
  CKDays:'' ,
  CKToMonth:'',
  CKFromMonth:'',
  CKToDay:'',
  CKFromDay:'',
  CKToYear:'',
  CKFromYear:'',
  CKViewPath:'',
  CKLocation:'',
  CKDaysModified:''
 };
  
//For creating html file
var htmlcurDate ;
var htmlYear;
var htmlMonth;
var htmlDay;
var tmpDate;
var htmlHrs;
var htmlMins;
var htmlReportDate;
var scriptTag;
var metaTag ;
var header;
var footerTable;
var footerHtml;
var bodyHeader;
var bodyTitle;
var bodytext;
var htmlString = "";
var dateRange;

var fileCount = 0;
var notKnown="";
var testServer ="";
var FileExist ="";

var sortJSFile = "sortTable.js";
var upImage = "up.gif";
var downImage = "down.gif";
var spacerImage = "space.gif";

//For viewing file
var filePath ="";
PREF_OBJ = new Preferences(document.URL, CK_VALUES);


//******************* API **********************
//-------------------------------------------------------------------
// FUNCTION:
//   configureSettings()
//
// DESCRIPTION: Standard report API, used to initialize and load
// the default values. Does not initialize the UI.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   true : if settings are loaded without error
//   false: otherwise
//-----------------------------------------------------------------
function configureSettings() 
{ 
  // Load all the saved settings into the preferences object.
  PREF_OBJ.load();
  // initialize the reported file count
  fileCount = 0;
  return true;
}


//-------------------------------------------------------------------
// FUNCTION:
//   beginReporting()
//
// DESCRIPTION: Called at the start of the reporting process, before
// any reports are run. If the Report command returns false from this 
// function, the Report command is excluded from the report run. 
//
// ARGUMENTS:
//   none
//
//-----------------------------------------------------------------
function beginReporting()
{
  
  PREF_OBJ.load();
  modifiedBy = PREF_OBJ.values['CKName'];
  intNoofDays = PREF_OBJ.values['CKDays'];
  strToMonth= PREF_OBJ.values['CKToMonth'];
  strFromMonth = PREF_OBJ.values['CKFromMonth'];
  intToDate = PREF_OBJ.values['CKToDay'];
  intFromDate = PREF_OBJ.values['CKFromDay'];
  strToYear = PREF_OBJ.values['CKToYear'];
  strFromYear = PREF_OBJ.values['CKFromYear'];
  indexViewPath = PREF_OBJ.values['CKViewPath'];
  testServer = PREF_OBJ.values['CKLocation'];
  indexDaysModified = PREF_OBJ.values['CKDaysModified'];

  if (!intNoofDays && !strFromMonth)
    intNoofDays = 7;
    
  initializeVars();
  initializeHtml();
}

  
//-------------------------------------------------------------------
// FUNCTION:
//   processFile()
//
// DESCRIPTION: Report command api called during file processing.
//   
// ARGUMENTS:
//   url of file
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function processFile (fileURL) 
{
  var indexEnd = fileURL.lastIndexOf(dwscripts.FILE_SEP);
  var indexStart = fileURL.lastIndexOf(dwscripts.FILE_SEP, indexEnd-1);
  var parentFolder = fileURL.substring(indexStart+1, indexEnd);
 
  if(!checkArray(ignoreFolders, parentFolder))
  {
  	searchFile(fileURL);
  }
}


//-------------------------------------------------------------------
// FUNCTION:
//   endReporting()
//
// DESCRIPTION: Called at the end of the Report process.
//   
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function endReporting()
{
  var fileName = "TMPTeamAdmin" + getRandom() + ".html";
  var outputPath = dwscripts.filePathToLocalURL(dw.getConfigurationPath() 
                 + dwscripts.FILE_SEP + "Reports" + dwscripts.FILE_SEP + "Workflow" 
			     + dwscripts.FILE_SEP + "Output" + dwscripts.FILE_SEP);
  var inputScriptPath = dwscripts.filePathToLocalURL(dw.getConfigurationPath() 
               + dwscripts.FILE_SEP + "Shared" + dwscripts.FILE_SEP + "MM" 
			   + dwscripts.FILE_SEP + "Scripts" + dwscripts.FILE_SEP);
  
  var inputImagePath = dwscripts.filePathToLocalURL(dw.getConfigurationPath() 
               + dwscripts.FILE_SEP + "Shared" + dwscripts.FILE_SEP + "MM" 
			   + dwscripts.FILE_SEP + "Images" + dwscripts.FILE_SEP);
  var htmlFile = dwscripts.filePathToLocalURL(dw.getConfigurationPath() 
               + dwscripts.FILE_SEP + "Reports" + dwscripts.FILE_SEP + "Workflow" 
			   + dwscripts.FILE_SEP + "Output" + dwscripts.FILE_SEP + fileName);

  bodyTitle = "  <h3 align=\"center\">" + MM.Lable_recentlyModified + "</h3>" + "\r\n" 
            + "  <table border=\"0\" align=\"center\" width=\"75%\">" + "\r\n" 
            + "    <tr>" + "\r\n"
			+ "      <td>" + "\r\n"
            + "        <table width=\"100%\" border=\"0\" align=\"center\">" + "\r\n" 
			+ "          <tr valign=\"baseline\">" + "\r\n"
            + "            <td align=\"left\" valign=\"baseline\" nowrap>" + MM.MSG_ReportDt +" " + htmlReportDate + "</td>" + "\r\n" 
			+ "          </tr>" + "\r\n" 
    	    + "          <tr valign=\"baseline\">" + "\r\n" 
			+ "            <td align=\"left\" valign=\"baseline\" nowrap>" + MM.MSG_DateRange + " " + dateRange + "</td>"  + "\r\n" 
			+ "          </tr>" + "\r\n" 
			+ "          <tr valign=\"baseline\">" + "\r\n" 
			+ "            <td align=\"left\" valign=\"baseline\" nowrap>" + MM.MSG_TotalFiles + " " + fileCount + "</td>"  + "\r\n" 
			+ "          </tr>" + "\r\n"  
			+ "          <tr valign=\"baseline\">" + "\r\n" 
			+ "            <td align=\"left\" valign=\"baseline\" nowrap>" + "&nbsp;" + "</td>"  + "\r\n" 
			+ "          </tr>" + "\r\n" 
			+ "        </table>" + "\r\n"
			+ "      </td>" + "\r\n"
			+ "    </tr>" + "\r\n";

  if (notKnown != '')
  {
    htmlString = htmlString = header + bodyHeader + bodyTitle + bodytext + "\r\n";
    htmlString += footerTable + "\r\n" 
	           + "    <tr>" + "\r\n"
			   + "      <td>" + "\r\n"
	           + "        <table width=\"100%\" border=\"0\" align=\"center\">" + "\r\n"
			   + "          <tr>" + "\r\n" 
			   + "            <td>"  + "\r\n"
			   + "              &nbsp;" + "\r\n"
			   + "            </td>" + "\r\n" 
			   + "          </tr>" + "\r\n" 
			   + "          <tr>" + "\r\n" 
			   + "            <td>"  + "\r\n"
			   + "              <p align =\"left\">" + "\r\n"
			   + notKnown + "\r\n"
			   + "              </p>" + "\r\n"
			   + "            </td>" + "\r\n" 
			   + "          </tr>" + "\r\n" 
			   + "        </table>"  + "\r\n"
			   + "      </td>" + "\r\n"
			   + "    </tr>" + "\r\n"
			   + "  </table>" + "\r\n"
			   + footerHtml;
  }
  else
  {
    htmlString = header + bodyHeader + bodyTitle + bodytext + "\r\n";
    htmlString += footerTable + "\r\n" 
			   + "  </table>" + "\r\n"
			   + footerHtml;
  }
  DWfile.write(htmlFile, htmlString);
  if(!DWfile.exists(outputPath+sortJSFile))
  {
    dwscripts.copyFileTo(inputScriptPath+sortJSFile, outputPath+sortJSFile, true);
  }
  if(!DWfile.exists(outputPath+upImage))
  {
    dwscripts.copyFileTo(inputImagePath+upImage, outputPath+upImage, true);
  }
  
  if(!DWfile.exists(outputPath+downImage))
  {
    dwscripts.copyFileTo(inputImagePath+downImage, outputPath+downImage, true);
  }
  
  if(!DWfile.exists(outputPath+spacerImage))
  {
    dwscripts.copyFileTo(inputImagePath+spacerImage, outputPath+spacerImage, true);
  }
  
  if(FileExist != '')
    dreamweaver.browseDocument(htmlFile); 
}

//***************    LOCAL FUNCTIONS   ***************
//-------------------------------------------------------------------
// FUNCTION:
//   initializeUI()
//
// DESCRIPTION: Configures the UI of a dialog.
//--------------------------------------------------------------------
function initializeUI() 
{  
  // start init
  //Radio Objects
  DAYS_MODIFIED_OBJ = new RadioGroup("optDaysModified");
  VIEW_PATH_OBJ = new RadioGroup("ViewPath");    
  
  //From fields
  FROM_DAY_OBJ = new ListControl("fromDay");
  FROM_MONTH_OBJ= new ListControl("fromMonth");
  FROM_YEAR_OBJ = new ListControl("fromYear");

  //To fields
  TO_DAY_OBJ = new ListControl("toDay");
  TO_MONTH_OBJ = new ListControl("toMonth");
  TO_YEAR_OBJ = new ListControl("toYear");
  
  setCurrentDate();  
  var myContributeObj;
  var strDateWeek = addDays(new Date(),WEEK_BACK); 
  fromDay = strDateWeek.getDate();
  fromYear = strDateWeek.getFullYear();
  var now = new Date();
  toYear = now.getFullYear();
  
  var monthValues = new Array (0,1,2,3,4,5,6,7,8,9,10, 11);
  FROM_MONTH_OBJ.setAll (ARR_FullMonths, monthValues);
  TO_MONTH_OBJ.setAll (ARR_FullMonths,monthValues );
  FROM_MONTH_OBJ.setIndex (fromMonth);
  var yearArray = new Array();

  for (var index = startYear; index <= endYear ; index++)
  {
    yearArray.push(toYear - index);	
  } 

  FROM_DAY_OBJ.pickValue (fromDay);
  TO_DAY_OBJ.pickValue (toDay);
    
  FROM_YEAR_OBJ.pickValue (fromYear);
  TO_YEAR_OBJ.pickValue (toYear); 

  FROM_YEAR_OBJ.setAll (yearArray, yearArray);
  TO_YEAR_OBJ.setAll (yearArray, yearArray);

  FROM_MONTH_OBJ.setIndex (fromMonth);
  TO_MONTH_OBJ.setIndex (toMonth);
  
  var intMonths = strDateWeek.getMonth();
  var strMonths = ARR_FullMonths[intMonths];
  var fullMonth = ARR_FullMonths;

  for (var i = 0; i < ARR_FullMonths.length; i++)
  {
    if (ARR_FullMonths[i] == strMonths)
    {
      FROM_MONTH_OBJ.setIndex(intMonths);
    }		
  } 
   
  setDaysCombo(FROM_DAY_OBJ,fromMonth,fromYear,0);
  setDaysCombo(TO_DAY_OBJ,toMonth,toYear,0);
  FROM_DAY_OBJ.setIndex(fromDay-1);
  TO_DAY_OBJ.setIndex(toDay-1);
  
  PREF_OBJ.initialize (
  {
    CKName : new PrefField(findObject('modifiedBy')),
    CKDays : new PrefField(findObject('numDays')),
    CKToMonth : new PrefSelectClass(TO_MONTH_OBJ),
    CKFromMonth : new PrefSelectClass(FROM_MONTH_OBJ),
    CKToDay : new PrefSelectClass(TO_DAY_OBJ),
    CKFromDay : new PrefSelectClass(FROM_DAY_OBJ),
    CKToYear : new PrefSelectClass(TO_YEAR_OBJ),
    CKFromYear : new PrefSelectClass(FROM_YEAR_OBJ),
    CKViewPath : new PrefField(findObject('viewPathhid')),
    CKLocation : new PrefField(findObject('otherLocation')),
    CKDaysModified : new PrefField(findObject('daysModifiedhid'))
   })
   
  fromMonth = FROM_MONTH_OBJ.getValue();
  toMonth = TO_MONTH_OBJ.getValue();
    
  fromYear = FROM_YEAR_OBJ.getValue();
  toYear = TO_YEAR_OBJ.getValue();
  
  toDay = TO_DAY_OBJ.getValue();
  fromDay = FROM_DAY_OBJ.getValue();
   
  var index = document.myForm.daysModifiedhid.value;
  DAYS_MODIFIED_OBJ.setSelectedIndex(index);
  var index1 = document.myForm.viewPathhid.value;
  VIEW_PATH_OBJ.setSelectedIndex(index1);
  onChangeRadio();
  onChangeView();
  setDaysCombo(FROM_DAY_OBJ,fromMonth,fromYear,1);
  setDaysCombo(TO_DAY_OBJ,toMonth,toYear,1);
  FROM_DAY_OBJ.setIndex(fromDay-1);
  TO_DAY_OBJ.setIndex(toDay-1);
  
  localDir = dw.getSiteRoot();
  
  //To get Testing server
  testServer = dw.getPreferenceString(siteSection, "URL Prefix");
  
  //modifiedBy text box is disabled initially if site is not a contribute site

  if(DWfile.exists(localDir+CONTRIBUTE_FOLDER+dwscripts.FILE_SEP+CONTRIBUTE_FILE))
  {
    document.myForm.modifiedBy.removeAttribute("disabled"); 
	if (condition == true)
	{
 	  var myContributeObj = findObject("Contribute");
	  myContributeObj.innerHTML = '';
	}	
    condition = true;
  }

  //Display testing server in th UI
  if(testServer !='') 
  {
	document.otherLocation.value = testServer; 
  }
  
  //if not contribute site
  if (condition == false)
  {
    var myContributeObj = findObject("Contribute");
	myContributeObj.innerHTML = MM.MSG_contribute;
  }	
}  
//-------------------------------------------------------------------
// FUNCTION:
//   getRandom()
//
// DESCRIPTION: Generates Random number.
// ARGUMENTS:
//   none
//RETURNS:
//   a Random number
//--------------------------------------------------------------------
function getRandom()
{
   return (Math.round(Math.random()*(10000-1000)))+1000;
}


//-------------------------------------------------------------------
// FUNCTION:
//   validateTestServer()
//
// DESCRIPTION: Validate if the testing server is defined or not
//   
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   false : if testing server is not defined
//   true : if testing server is defined
//--------------------------------------------------------------------
function validateTestServer()
{
   var retValue = true;
   if(testServer =='http://' || testServer =='') 
   { 
     alert(MM.MSG_noTestServerDefined);
     retValue = false;	
   }
   return retValue;
}


//-------------------------------------------------------------------
// FUNCTION:
//   applyParams()
//
// DESCRIPTION: Applies or takes action.
//  Uses the preferences object to set and save the current settings.
//--------------------------------------------------------------------
function applyParams() 
{
  // Get the current values from the UI and set the values.
  intNoofDays = document.myForm.numDays.value;
  // Get the current values from the UI and set the values. 
  testServer = document.myForm.otherLocation.value;
  
  //Validate the inputs
  if (DAYS_MODIFIED_OBJ.getSelectedIndex() == 0)
  {
    if (!validateInput())
      return;
  }
  
  //Validate Testing Server
  if (document.myForm.ViewPath[1].checked)
  {
    if (!validateTestServer())
	{    	
      document.myForm.otherLocation.select();
	  document.myForm.otherLocation.focus();
	  return;	
	}
  }

  PREF_OBJ.set(); 
  PREF_OBJ.save(); 
  window.close();
}  


//-------------------------------------------------------------------
// FUNCTION:
//   initializeVars()
//
// DESCRIPTION: Initializes all the variables required for reporting.
//   
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function initializeVars()
{
  var curDate =  new Date();
  var curMonth;
  var curDay;
  var curYear;   
  curDay = curDate.getDate();
  curYear = curDate.getFullYear();
  curMonth = curDate.getMonth() + 1;  

  var tempToDate = new Date(70, 1, 1);
  tempToDate.setMonth(strToMonth);
  tempToDate.setDate(intToDate);
  tempToDate.setFullYear(strToYear);
  strToTotalDate = tempToDate.getTime(); 

  var tempFromDate = new Date(70, 1, 1);
  tempFromDate.setMonth(strFromMonth);
  tempFromDate.setDate(intFromDate);
  tempFromDate.setFullYear(strFromYear);
  strFromTotalDate = tempFromDate.getTime();

  strCurrentDt = new Date(curMonth + "/" + curDay + "/" + curYear);	
   
  var fromDate = new Date();
  var toDate = new Date ();
    
  //From fields 
  fromDate.setDate(intFromDate);
  fromDate.setMonth(strFromMonth);
  fromDate.setYear(strFromYear);
  //To fields 
  toDate.setDate(intToDate);
  toDate.setMonth(strToMonth);    
  toDate.setYear(strToYear);
  
  // This is To date
  strToMonth = ARR_FullMonths[strToMonth];
  strToTotalDateBetween =strToMonth + " " + intToDate + "," + " " + strToYear;
  
  // This is From date
  strFromMonth = ARR_FullMonths[strFromMonth];
  strFromTotalDateBetween = strFromMonth + " " + intFromDate + "," + " " + strFromYear;
}


//-------------------------------------------------------------------
// FUNCTION:
//   initializeHtml()
//
// DESCRIPTION: Initailizes html file.
// ARGUMENTS:
//   none
//RETURNS:
//   none
//--------------------------------------------------------------------
function initializeHtml()
{
   //initialize html file
   htmlcurDate = new Date();
   htmlYear = htmlcurDate.getFullYear();
   htmlMonth = htmlcurDate.getMonth();
   htmlDay = htmlcurDate.getDate();
   tmpDate = new Date(htmlYear, htmlMonth, htmlDay,0,0,0,0);
   htmlHrs = parseInt((htmlcurDate-tmpDate)/(1000*60*60));
   htmlMins = parseInt(((htmlcurDate-tmpDate)-(htmlHrs*60*60*1000))/(1000*60));

   if (htmlMins <= 9)
     htmlMins = "0" + htmlMins;
   if (parseInt(htmlHrs) > 12)
   {
     htmlHrs = parseInt(htmlHrs) - 12;
     htmlReportDate = localizeReportDateStr(htmlMonth,htmlDay,htmlYear,htmlHrs,htmlMins,"PM");
   }
   else	 
   {
	  htmlReportDate = localizeReportDateStr(htmlMonth,htmlDay,htmlYear,htmlHrs,htmlMins,"AM");
   } 
   scriptTag = "<script src=\"" + sortJSFile +"\"></script>" + "\r\n" ;
   metaTag = "<meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\">";
   styleTag = "<style>" + "\r\n" + "  body," + " " + "th," + " " + "tr," + " " + "td " + "{font-family: Verdana}" + "\r\n" + "</style>" ;
   header= "<html>" + "\r\n" + "<head>" +  "\r\n" + "<title>" + MM.Lable_recentlyModified + "</title>" + "\r\n" + metaTag + "\r\n" + styleTag +  "\r\n" + scriptTag + "</head>" +"\r\n";
   footerTable = "          </tbody>" + "\r\n" 
               + "        </table>" + "\r\n"
			   + "      </td>" + "\r\n"
			   + "    </tr>"; 
   footerHtml  = "</form>" +"\r\n" + "</body>" + "\r\n" +  "</html>" ;
   bodyHeader = "<body onLoad='sortTable(\"1\",\"table0\");'>" + "\r\n" + "<form name=\"sortFile\" id=\"sortFile\" >" + "\r\n";
   bodytext =    "    <tr>" + "\r\n"
               + "      <td>" + "\r\n"
               + "        <table id=\"table0\" border=\"1\" align=\"center\"  width=\"100%\">" + "\r\n" 
               + "          <tbody>" + "\r\n" 
			   + "            <tr>" + "\r\n"
			   + "              <th align=\"left\" scope=\"col\" nowrap>" + "\r\n"
			   + "                <script language = \"javascript\">" + "\r\n"
               + "                if (typeof(checkBrowser) != \"undefined\" && checkBrowser())" + "\r\n" 
               + "                  document.write(\"<A href=\\\"#\\\" onClick='sortTable(\\\"0\\\",\\\"table0\\\");'>" + MM.MSG_FileName + "</A>\");" + "\r\n" 
			   + "                else" + "\r\n"
			   + "                  document.write(\"" + MM.MSG_FileName + "\");"  + "\r\n"
			   + "                </script>" + "\r\n"
			   + "                &nbsp;" + "<img name=\"sortOrder\" src=\"" + spacerImage + "\" width=\"13\" height=\"16\" align=\"absbottom\">"  + "\r\n"
			   + "              </th>" + "\r\n"
               + "              <th align=\"left\" scope=\"col\" nowrap>" + "\r\n"
			   + "                <script language = \"javascript\">" + "\r\n" 
               + "                if (typeof(checkBrowser) != \"undefined\" && checkBrowser())" + "\r\n" 
               + "                  document.write(\"<A href=\\\"#\\\" onClick='sortTable(\\\"1\\\",\\\"table0\\\");'>" + MM.MSG_Modified + "</A>\");" + "\r\n"
			   + "                else" +	"\r\n" 
			   + "                  document.write(\"" + MM.MSG_Modified + "\");" + "\r\n"
			   + "                </script>" + "\r\n"
			   + "                &nbsp;" + "<img name=\"sortOrder\" src=\"" + spacerImage + "\" width=\"13\" height=\"16\" align=\"absbottom\" >"  + "\r\n"
			   + "              </th>" + "\r\n" 
               + "              <th align=\"left\" scope=\"col\" nowrap>"  + "\r\n"
			   + "                <script language = \"javascript\">" + "\r\n" 
               + "                if (typeof(checkBrowser) != \"undefined\" && checkBrowser())" + "\r\n" 
               + "                  document.write(\"<A href=\\\"#\\\" onClick='sortTable(\\\"2\\\",\\\"table0\\\");'>" + MM.MSG_ModifiedBy + "</A>\");" + "\r\n"
			   + "                else" + "\r\n" 
			   + "                  document.write(\"" + MM.MSG_ModifiedBy + "\");" + "\r\n"
			   + "                </script>" + "\r\n"
			   + "                &nbsp;" + "<img name=\"sortOrder\" src=\"" + spacerImage + "\" width=\"13\" height=\"16\" align=\"absbottom\" >"  + "\r\n"
			   + "              </th>" + "\r\n" 
			   + "              <th scope=\"col\">&nbsp;</th>"  + "\r\n"
			   + "            </tr>" + "\r\n";
}
//-------------------------------------------------------------------
// FUNCTION:
//   onChangeRadio()
//
// DESCRIPTION: Disables the fields associated with the unchecked Radio box
//   
//----------------------------------------------------------------
function onChangeRadio()
{
  document.myForm.daysModifiedhid.value = DAYS_MODIFIED_OBJ.getSelectedIndex();
  if(DAYS_MODIFIED_OBJ.getSelectedIndex() == 1)
  {
    document.myForm.fromMonth.removeAttribute("disabled");
    document.myForm.fromDay.removeAttribute("disabled");
    document.myForm.fromYear.removeAttribute("disabled");
    document.myForm.toMonth.removeAttribute("disabled");
    document.myForm.toDay.removeAttribute("disabled");
    document.myForm.toYear.removeAttribute("disabled");
    document.myForm.numDays.disabled = true;
  }
  else if(DAYS_MODIFIED_OBJ.getSelectedIndex() == 0)
  {
    document.myForm.fromMonth.disabled = true;
    document.myForm.fromDay.disabled = true;
    document.myForm.fromYear.disabled = true;
    document.myForm.toMonth.disabled = true;
    document.myForm.toDay.disabled = true;
    document.myForm.toYear.disabled = true;
    document.myForm.numDays.removeAttribute("disabled");
  }
}
  
//-------------------------------------------------------------------
// FUNCTION:
//   onChangeView()
//
// DESCRIPTION: Disables the fields associated with the unchecked Radio box
//   
//--------------------------------------------------------------------
function onChangeView()
{
  document.myForm.viewPathhid.value = VIEW_PATH_OBJ.getSelectedIndex();
  if(document.myForm.ViewPath[0].checked)
  {
    document.myForm.otherLocation.disabled = true; 
  }
  else if(document.myForm.ViewPath[1].checked)
  { 
    document.myForm.otherLocation.disabled = false;  
  }
}

//------------------------------------------------------------------- 
// FUNCTION:
//   hexToDec()
//
// DESCRIPTION: If pass hexadecimal, it will convert to seconds.
//     
//   
//
// ARGUMENTS:
//   strVal
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function hexToDec(strVal)
{
  return parseInt(strVal,16);
}
 
//------------------------------------------------------------------- 
// FUNCTION:
//   checkModifiedByNotNull()
//
// DESCRIPTION: Finds the files satisfying the criteria with Modified By: field as not null and 
//      generates the result in the result window in a separate html file 
//   
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function checkModifiedByNotNull()
{    
  var strModifiedBy = "";
  var strLastDate;
  var fromTotalDate;
  var toTotalDate;
  var fileDate;
  var retStr;
  var noteHandle;
  var theKeys;              
  var theValue;
  var REPORT_STR = new Array();
  var siteRootLen = 0;
  var fileRelPath = ""; 
  var theFile = fileName.substr(fileName.lastIndexOf(dwscripts.FILE_SEP)+1);
  var strFileDate = DWfile.getModificationDateObj(fileName);

  strLastDate = addDays(new Date(),intNoofDays-1);
  strLastDate = new Date(strLastDate.getFullYear(),strLastDate.getMonth(),strLastDate.getDate(),0,0,0,0);
  retStr="";
  theValue="";
  noteHandle = MMNotes.open(fileName);
  if (noteHandle > 0)
  {
    theKeys = MMNotes.getKeys(noteHandle);              
  
    for(var j=0; j< theKeys.length; j++)
    {
      if (theKeys[j] == 'ccLastSubmitter')
      {  
         theValue = MMNotes.get(noteHandle, theKeys[j]);
         strModifiedBy = theValue;
      }
    } // end for loop
  }//end if 

  if (indexDaysModified == 0)    
  { 
     if ((strLastDate <= strFileDate) && (modifiedBy.toLowerCase() == strModifiedBy.toLowerCase().match(modifiedBy, "i")))            
     { 
	    var intLastMonth = strLastDate.getMonth();
		var intLastDate = strLastDate.getDate();
		var intLastYear = strLastDate.getFullYear();
		
		strLastDate = localizeDateStr(intLastMonth,intLastDate,intLastYear); 

        var intFileMonth = strFileDate.getMonth();
        var intFileDate = strFileDate.getDate();
        var intFileYear = strFileDate.getFullYear();
	  
	    var fileTime = (strFileDate - new Date(intFileYear,intFileMonth,intFileDate,0,0,0,0)); //in milliseconds
	    var fileHrs = parseInt((fileTime)/(1000*60*60));
	    var fileMins = parseInt(((fileTime)-(fileHrs*60*60*1000))/(1000*60));

            strFileDate = localizeDateStr(intFileMonth,intFileDate,intFileYear); 
 
		
		dateRange = strLastDate + " " + MM.MSG_To + " " + localizeDateStr(htmlMonth,htmlDay,htmlYear);
	    if (fileMins <= 9)
	      fileMins = "0" + fileMins;
	   
	    if (parseInt(fileHrs) > 12)
        {
          fileHrs = parseInt(fileHrs) - 12;

          var strTime = localizeTimeStr(fileHrs,fileMins,"PM");
        }
	    else if(parseInt(fileHrs) == 12)
		{
		  var strTime = localizeTimeStr(fileHrs,fileMins,"PM");
		}
		else	 
        {
          var strTime = localizeTimeStr(fileHrs,fileMins,"AM");
        }  
        fileDate = strFileDate + " " + strTime;

		filePath = "";		
		filePath = fileName.substr(0,(fileName.lastIndexOf(dwscripts.FILE_SEP)+1));
		siteRootLen = dreamweaver.getSiteRoot().length;
		fileRelPath =  filePath.substr(siteRootLen); 	  		        
        if(indexViewPath == 0)
	    {
	      filePath = filePath.replace("|",":"); 
	    }// end if
        else if(indexViewPath == 1) 
	    {
	      filePath = testServer + fileRelPath;
		}   
	  
      REPORT_STR.push( MM.MSG_ModifiedBy + "= " + strModifiedBy + "  ");          
      retStr += REPORT_STR.join(", ");
	  fileCount++;
      var viewPath = "\"" + filePath + theFile +"\"" ;
	  bodytext += "\r\n";
	  bodytext += "            <tr>" + "\r\n";
      bodytext += "              <td nowrap>" + theFile + "</td>" + "\r\n";
      bodytext += "              <td nowrap>" + fileDate + "</td>" + "\r\n" ;
      bodytext += "              <td nowrap>" + theValue + "</td>" + "\r\n";
      bodytext += "              <td nowrap>" + "<a href=" + viewPath+ ">" + MM.Column_View + "</a>" + "</td>" + "\r\n";
      bodytext += "            </tr>" + "\r\n";
	  if (theValue == MM.Column_NotKnown) 
	  {
	     notKnown = MM.MSG_Notknown + " " + MM.MSG_NotContribute +  "\r\n";
	  }        
      retStr += MM.MSG_ModifiedDt + "= " + strFileDate + " " ;
      FileExist += retStr;
      reportItem(REP_ITEM_CUSTOM, fileName, retStr,0,REP_ICON_NOTE);
      } 
    }  
    else
    {  
      if (strToTotalDate <= strFromTotalDate) 
      {
        fromTotalDate = strToTotalDate;
        toTotalDate = strFromTotalDate;
      }
      else
      {
        fromTotalDate = strFromTotalDate;
        toTotalDate = strToTotalDate;
      }  
	// add 1 day to include the toTotalDate date
	toTotalDate = new Date(toTotalDate + (24*60*60*1000-1));  
	if ((fromTotalDate <= strFileDate) && (strFileDate <= toTotalDate) && (modifiedBy.toLowerCase()  == strModifiedBy.toLowerCase().match(modifiedBy, "i")))    
    { 
	   fromTotalDate = new Date(fromTotalDate);
           var fromTotalMonth = fromTotalDate.getMonth(); 
	   var fromTotalDay = fromTotalDate.getDate();
	   var fromTotalYear = fromTotalDate.getFullYear();
	   var toTotalMonth = toTotalDate.getMonth(); 
	   var toTotalDay = toTotalDate.getDate();
	   var toTotalYear = toTotalDate.getFullYear();

           var intFileMonth = strFileDate.getMonth();
           var intFileDate = strFileDate.getDate();
           var intFileYear = strFileDate.getFullYear();
	   var fileTime = (strFileDate - new Date(intFileYear,intFileMonth,intFileDate,0,0,0,0)); //in milliseconds
	   var fileHrs = parseInt((fileTime)/(1000*60*60));
	   var fileMins = parseInt(((fileTime)-(fileHrs*60*60*1000))/(1000*60));

	   toTotalDate = localizeDateStr(toTotalMonth,toTotalDay,toTotalYear); 
	   fromTotalDate = localizeDateStr(fromTotalMonth,fromTotalDay,fromTotalYear);
	   strFileDate = localizeDateStr(intFileMonth,intFileDate,intFileYear); 
	   dateRange = fromTotalDate + " " + MM.MSG_To + " " + toTotalDate;


	   if (fileMins <= 9)
	     fileMins = "0" + fileMins;
	   	 		   		   
	     if (parseInt(fileHrs) > 12)
         {
           fileHrs = parseInt(fileHrs) - 12;
           var strTime = localizeTimeStr(fileHrs,fileMins,"PM");
         }
		 else if(parseInt(fileHrs) == 12)
		 {
		    var strTime = localizeTimeStr(fileHrs,fileMins,"PM");
		 }
         else	 
         {
            var strTime = localizeTimeStr(fileHrs,fileMins,"AM");
         } 

         fileDate = strFileDate + " " + strTime;
   
 		 filePath = "";		
		 filePath = fileName.substr(0,(fileName.lastIndexOf(dwscripts.FILE_SEP)+1));
		 siteRootLen = dreamweaver.getSiteRoot().length;
		 fileRelPath =  filePath.substr(siteRootLen); 	  		        
         if(indexViewPath == 0)
	     {
	       filePath = filePath.replace("|",":"); 
	     }// end if
         else if(indexViewPath == 1) 
	     {
	       filePath = testServer + fileRelPath;
		 }
		
         REPORT_STR.push( MM.MSG_ModifiedBy + "= " + strModifiedBy + " ");          
         retStr += REPORT_STR.join(", ");
		 fileCount++;
         var viewPath = "\"" + filePath + theFile + "\"";
	     bodytext += "\r\n";
		 bodytext += "            <tr>" + "\r\n";
         bodytext += "              <td nowrap>" + theFile + "</td>" + "\r\n";
         bodytext += "              <td nowrap>" + fileDate + "</td>" + "\r\n" ;
         bodytext += "              <td nowrap>" + theValue + "</td>" + "\r\n";
         bodytext += "              <td nowrap>" + "<a href=" + viewPath+ ">" + MM.Column_View + "</a>" + "</td>" + "\r\n";
         bodytext += "            </tr>" + "\r\n";

	     if (theValue == MM.Column_NotKnown) 
	     {
	        notKnown = MM.MSG_Notknown + " " + MM.MSG_NotContribute + "\r\n";
	     }
         retStr += MM.MSG_ModifiedDt + "= " + strFileDate + " " ;
         FileExist += retStr;
         reportItem(REP_ITEM_CUSTOM, fileName, retStr,0,REP_ICON_NOTE);
      }          
    } 
  }


//-------------------------------------------------------------------
// FUNCTION:
//   checkModifiedByNull()
//
// DESCRIPTION: Finds the files satisfying the criteria with Modified By: field as null  and 
//      generates the result in the result window in a separate html file 
//   
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function checkModifiedByNull()
{
  var strLastDate;
  var fromTotalDate;
  var toTotalDate;
  var strSplit;
  var limit;
  var fileDate;
  var noteHandle;          
  var theKeys;
  var theValue;
  var retStr;
  var REPORT_STR = new Array();
  var siteRootLen = 0;
  var fileRelPath = ""; 

  var theFile = fileName.substr(fileName.lastIndexOf(dwscripts.FILE_SEP)+1);
  var strFileDate = DWfile.getModificationDateObj(fileName);
  strLastDate = addDays(new Date(),intNoofDays-1);
  strLastDate = new Date(strLastDate.getFullYear(),strLastDate.getMonth(),strLastDate.getDate(),0,0,0,0);

  if (indexDaysModified == 0)
    {   
      if ((strLastDate <= strFileDate))              
      { 
	    var intLastMonth = strLastDate.getMonth();
	    var intLastDate = strLastDate.getDate();
	    var intLastYear = strLastDate.getFullYear();

	strLastDate = localizeDateStr(intLastMonth,intLastDate,intLastYear);

	    var intFileMonth = strFileDate.getMonth();
            var intFileDate = strFileDate.getDate();
            var intFileYear = strFileDate.getFullYear();
 	    var fileTime = (strFileDate - new Date(intFileYear,intFileMonth,intFileDate,0,0,0,0)); //in milliseconds
	    var fileHrs = parseInt((fileTime)/(1000*60*60));
	    var fileMins = parseInt(((fileTime)-(fileHrs*60*60*1000))/(1000*60));

        strFileDate = localizeDateStr(intFileMonth,intFileDate,intFileYear);    	       
	dateRange = strLastDate + " " + MM.MSG_To + " " + localizeDateStr(htmlMonth,htmlDay,htmlYear);

	    if (fileMins <= 9)
	      fileMins = "0" + fileMins;
		   
	    if (parseInt(fileHrs) > 12)
        {
          fileHrs = parseInt(fileHrs) - 12;
          var strTime = localizeTimeStr(fileHrs,fileMins,"PM");
        }
		else if(parseInt(fileHrs) == 12)
		{
		  var strTime = localizeTimeStr(fileHrs,fileMins,"PM");
		}
        else	 
        {
          var strTime = localizeTimeStr(fileHrs,fileMins,"AM");
        } 
	    fileDate = strFileDate + " " + strTime;
		
	    filePath = "";		
	    filePath = fileName.substr(0,(fileName.lastIndexOf(dwscripts.FILE_SEP)+1));
	    siteRootLen = dreamweaver.getSiteRoot().length;
	    fileRelPath =  filePath.substr(siteRootLen); 	  		        
        if(indexViewPath == 0)
	    {
	      filePath = filePath.replace("|",":"); 
	    }// end if
        else if(indexViewPath == 1) 
	    {
	      filePath = testServer + fileRelPath;
		}

        retStr="";   
        theValue="";   
		
        noteHandle = MMNotes.open(fileName);
	if (noteHandle > 0) 
	{
          theKeys = MMNotes.getKeys(noteHandle);	    
          for(var j=0; j< theKeys.length; j++)
          {
             if (theKeys[j] == 'ccLastSubmitter')
             {
	            theValue = MMNotes.get(noteHandle, theKeys[j]);
                REPORT_STR.push( MM.MSG_ModifiedBy + "= " + theValue + " "); 
             }
           } // end for loop
	 } // end if 
				 
		 retStr += REPORT_STR.join(", ");
         if(theValue == '')
         {
            theValue = MM.Column_NotKnown;
         }
		 fileCount++;
         var viewPath = "\"" + filePath + theFile + "\"";
	     bodytext += "\r\n";
		 bodytext += "            <tr>" + "\r\n";
         bodytext += "              <td nowrap>" + theFile + "</td>" + "\r\n";
         bodytext += "              <td nowrap>" + fileDate + "</td>" + "\r\n" ;
         bodytext += "              <td nowrap>" + theValue + "</td>" + "\r\n";
         bodytext += "              <td nowrap>" + "<a href=" + viewPath+ ">" + MM.Column_View + "</a>" + "</td>" + "\r\n";
         bodytext += "            </tr>" + "\r\n";
	     if (theValue == MM.Column_NotKnown) 
	     {
	       notKnown = MM.MSG_Notknown + " " + MM.MSG_NotContribute + "\r\n";
	     }
	     retStr += MM.MSG_ModifiedDt + "= " + strFileDate + " " ;
         FileExist += retStr;
         reportItem(REP_ITEM_CUSTOM, fileName, retStr,0,REP_ICON_NOTE);            
        } 
     }    
     else
     {  
	   if (strToTotalDate <= strFromTotalDate) 
       {
         fromTotalDate = strToTotalDate;
         toTotalDate = strFromTotalDate;
       }
       else
       {
         fromTotalDate = strFromTotalDate;
         toTotalDate = strToTotalDate;
       }  
   	   // add 1 day to include the toTotalDate date
	   toTotalDate = new Date(toTotalDate + (24*60*60*1000-1)); 
	   if ((fromTotalDate <= strFileDate) && (strFileDate <= toTotalDate))          
       {
	     fromTotalDate = new Date(fromTotalDate);
         var fromTotalMonth = fromTotalDate.getMonth(); 
	     var fromTotalDay = fromTotalDate.getDate();
	     var fromTotalYear = fromTotalDate.getFullYear();
		 var toTotalMonth = toTotalDate.getMonth(); 
	     var toTotalDay = toTotalDate.getDate();
	     var toTotalYear = toTotalDate.getFullYear();

	     toTotalDate = localizeDateStr(toTotalMonth,toTotalDay,toTotalYear); 
	     fromTotalDate = localizeDateStr(fromTotalMonth,fromTotalDay,fromTotalYear);

		 var intFileMonth = strFileDate.getMonth();
         var intFileDate = strFileDate.getDate();
         var intFileYear = strFileDate.getFullYear();	   
         var fileTime = (strFileDate - new Date(intFileYear,intFileMonth,intFileDate,0,0,0,0)); //in milliseconds
         var fileHrs = parseInt((fileTime)/(1000*60*60));
         var fileMins = parseInt(((fileTime)-(fileHrs*60*60*1000))/(1000*60));

         dateRange = fromTotalDate + " " + MM.MSG_To + " " + toTotalDate;   
         strFileDate = localizeDateStr(intFileMonth, intFileDate, intFileYear);


         if (fileMins <= 9)
           fileMins = "0" + fileMins;
 		   		   
         if (parseInt(fileHrs) > 12)
         {
            fileHrs = parseInt(fileHrs) - 12;
            var strTime = localizeTimeStr(fileHrs,fileMins,"PM");
          }
		  else if(parseInt(fileHrs) == 12)
		  {
		    var strTime = localizeTimeStr(fileHrs,fileMins,"PM");
		  }
          else	 
          { 
            var strTime = localizeTimeStr(fileHrs,fileMins,"AM");
          } 
          fileDate = strFileDate + " " + strTime; 
		  
	  filePath = "";		
	  filePath = fileName.substr(0,(fileName.lastIndexOf(dwscripts.FILE_SEP)+1));
	  siteRootLen = dreamweaver.getSiteRoot().length;
	  fileRelPath =  filePath.substr(siteRootLen); 	  		        
          if(indexViewPath == 0)
	      {
	        filePath = filePath.replace("|",":"); 
	      }// end if
          else if(indexViewPath == 1) 
	      {
	        filePath = testServer + fileRelPath;
		  }
		  
          retStr="";
          theValue="";
          noteHandle = MMNotes.open(fileName);
		  
          if (noteHandle > 0) 
		  {
             theKeys = MMNotes.getKeys(noteHandle);	    
             for(var j=0; j< theKeys.length; j++)
             {
                if (theKeys[j] == 'ccLastSubmitter')
                {
	               theValue = MMNotes.get(noteHandle, theKeys[j]);
                   REPORT_STR.push( MM.MSG_ModifiedBy + "= " + theValue + " "); 
                }
            } // end for loop
	     }// end if
		
         retStr += REPORT_STR.join(", ");
         if(theValue == '')
         {
           theValue = MM.Column_NotKnown;
         }
		 fileCount++;
         var viewPath = "\"" + filePath + theFile + "\"" ;
	     bodytext += "\r\n";
		 bodytext += "            <tr>" + "\r\n";
         bodytext += "              <td nowrap>" + theFile + "</td>" + "\r\n";
         bodytext += "              <td nowrap>" + fileDate + "</td>" + "\r\n" ;
         bodytext += "              <td nowrap>" + theValue + "</td>" + "\r\n";
         bodytext += "              <td nowrap>" + "<a href=" + viewPath+ ">" + MM.Column_View + "</a>" + "</td>" + "\r\n";
         bodytext += "            </tr>" + "\r\n";
         if (theValue == MM.Column_NotKnown) 
         {
           notKnown = MM.MSG_Notknown + " " + MM.MSG_NotContribute + "\r\n";
         }          
         retStr += MM.MSG_ModifiedDt + "= " + strFileDate + " " ;
         FileExist += retStr;
         reportItem(REP_ITEM_CUSTOM, fileName, retStr,0,REP_ICON_NOTE);
      } 
    } 
  } 

//-------------------------------------------------------------------
// FUNCTION:
//   localizeDateStr(Month,Date,Year)
//
// DESCRIPTION: Localizes the strFileDate according to country conventions for representing date and time.
//   
//
// ARGUMENTS:
//   Month,Date,Year
//
// RETURNS:
//   string containig localized format for the date to appear in the html report.
//--------------------------------------------------------------------

function localizeDateStr(Month,Date,Year)
{

	var rtnString = "";
	rtnString = (Month + 1) + '/' + Date + '/' + Year;

	if (dreamweaver.appVersion && (dreamweaver.appVersion.indexOf('fr') != -1 || dreamweaver.appVersion.indexOf('es') != -1 || dreamweaver.appVersion.indexOf('it') != -1))
	{rtnString =  Date + '/' + (Month + 1) + '/' + Year;}

	if (dreamweaver.appVersion && dreamweaver.appVersion.indexOf('de') != -1)
	{rtnString =  Date + '.' + (Month + 1) + '.' + Year;}
	
	if (dreamweaver.appVersion && dreamweaver.appVersion.indexOf('ko') != -1)
	{rtnString =  Year + '.' + (Month + 1) + '.' + Date;}
	
	return rtnString;

}

//-------------------------------------------------------------------
// FUNCTION:
//   localizeTimeStr(Hrs,Mins,AMPM)
//
// DESCRIPTION: Localizes the strTime according to country conventions for representing date and time.
//   
//
// ARGUMENTS:
//   Hrs,Mins,AMPM
//
// RETURNS:
//   string containig localized format for the date to appear in the html report.
//--------------------------------------------------------------------
function localizeTimeStr(Hrs,Mins,AMPM)
{

	var rtnString = "";
	var militaryTime = 0;
	
	rtnString = Hrs + ":" + Mins + "  " + AMPM;
	
	if (dreamweaver.appVersion && (dreamweaver.appVersion.indexOf('fr') != -1 || dreamweaver.appVersion.indexOf('de') != -1 || dreamweaver.appVersion.indexOf('it') != -1 || dreamweaver.appVersion.indexOf('es') != -1))
	{
		militaryTime = Hrs;
		
		if (AMPM == "PM")
		{
			militaryTime = militaryTime + 12;
		}

		rtnString = militaryTime + ":" + Mins;
	}
	
	return rtnString;

}

//-------------------------------------------------------------------
// FUNCTION:
//   localizeReportDateStr(Month,Day,Year,Hrs,Mins,AMPM)
//
// DESCRIPTION: Localizes the ReportDate according to country conventions for representing date and time.
//   
//
// ARGUMENTS:
//   Month,Day,Year,Hrs,Mins,AMPM
//
// RETURNS:
//   string containing localized format for the date to appear in the html report.
//--------------------------------------------------------------------
function localizeReportDateStr(Month,Day,Year,Hrs,Mins,AMPM)
{

	var rtnString = "";
	rtnString = localizeDateStr(Month,Day,Year) + " " + localizeTimeStr(Hrs,Mins,AMPM);

	if (dreamweaver.appVersion && (dreamweaver.appVersion.indexOf('fr') != -1 || dreamweaver.appVersion.indexOf('it') != -1 || dreamweaver.appVersion.indexOf('es') != -1) )
	{rtnString = localizeDateStr(Month,Day,Year) + " " + localizeTimeStr(Hrs,Mins,AMPM);}

	return rtnString;

}
