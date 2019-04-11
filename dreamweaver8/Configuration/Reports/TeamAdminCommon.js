// Copyright 2003, 2004 Macromedia, Inc. All rights reserved.

//*************** GLOBAL CONSTANTS *****************
var CONTRIBUTE_FOLDER = "_mm";
var CONTRIBUTE_FILE = "contribute.xml";

//*************** GLOBAL VARIABLES *****************
var PREF_OBJ;
var condition = false;

var ignoreFolders = new Array("_baks", "_mm", "_mmserverscripts", "_notes");
var ignoreFiles = new Array(".lck",".mno");

//Radio Objects
var DAYS_MODIFIED_OBJ;
  
// From fileds
var FROM_DAY_OBJ;
var FROM_MONTH_OBJ;
var FROM_YEAR_OBJ;

// To fileds
var TO_DAY_OBJ;
var TO_MONTH_OBJ;
var TO_YEAR_OBJ;

var strToTotalDate;
var strFromTotalDate;
var fromMonth;
var fromYear;
var toDay;  
var toMonth;
var toYear;
var strToTotalDateBetween;
var strFromTotalDateBetween;
var strCurrentDt;
var currentSite;
var intNoofDays;
var sitenumber; 
var siteSection;
var dir; 
var localDir;
var fileName;

var indexViewPath;
var indexDaysModified;
var modifiedBy;

//------------------------------------------------------------------------
// FUNCTION:
//  isFolder()
//
// DESCRIPTION:
//   Checks if file exists and it is a folder or not
//
// ARGUMENTS:
//  fileURL
//
// RETURNS:
//  true : if file exists and not a folder
//  false: if file does not exists and if its a folder
//--------------------------------------------------------------------
function isFolder(fileURL)
{
  var retVal = false;
  if (fileURL && DWfile.exists(fileURL))
    retVal = (DWfile.getAttributes(fileURL).indexOf('D') != -1);
    return retVal;
}
  
//-------------------------------------------------------------------
// FUNCTION:
//   commandButtons()
//
// DESCRIPTION:Standard report API, like commands the return value
//   controls the display of command buttons in the settings dialog.
// 
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function commandButtons() 
{
  return new Array
  (
    MM.BTN_OK,     "applyParams()",      
    MM.BTN_Cancel, "window.close()",
    MM.BTN_Help,   "displayHelp();"
  );
}

//-------------------------------------------------------------------
// FUNCTION:
//   getTotalNumberOfSites()
//
// DESCRIPTION: Gets total number of sites
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   number of sites
//--------------------------------------------------------------------
function getTotalNumberOfSites()
{
  siteSection = "Sites\\-Summary";
  var i = dw.getPreferenceInt(siteSection, "Number of Sites", 0);
  return i;
}
  
//-------------------------------------------------------------------
// FUNCTION:
//   getNumberOfTestSite()
//
// DESCRIPTION: Gets the number of testing server sites
//
// ARGUMENTS:
//   name of the site
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function getNumberOfTestSite(name)
{
   var lastIndex = getTotalNumberOfSites();
   var i = 0;
   while (true)
   {
     siteSection = "Sites\\-Site" + i;
     // get name of site0
     siteName = dw.getPreferenceString(siteSection, "Site Name");
     if(siteName == name)// if the name == siteName, then return i
       return i;
     else if (i == lastIndex)// if at the end of the loop, then return i
       return i;
     else 
       i++;
   }
}
  
//-------------------------------------------------------------------
// FUNCTION:
//   onChnageFromMonth()
//
// DESCRIPTION: Populate the fromMonth and fromYear Dropdown
//   
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function onChangeFromMonth()
{
   fromMonth = FROM_MONTH_OBJ.getValue();
   fromYear = FROM_YEAR_OBJ.getValue();
   fromDay = FROM_DAY_OBJ.getValue();
   setDaysCombo(FROM_DAY_OBJ,fromMonth,fromYear,1);
   FROM_DAY_OBJ.setIndex(fromDay-1);
   FROM_MONTH_OBJ.focus();
}

//-------------------------------------------------------------------
// FUNCTION:
//   setDaysCombo()
//
// DESCRIPTION: set the days based on selection.
//   
//
// ARGUMENTS:
//   0 : if initialize with max index
//   1 : to initalize for the given date
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function  setDaysCombo(obj,mon,year,val)
{
   var noOfDaysinMon = 0;
   if (val == 0) 
     noOfDaysinMon = 31;
   else
     noOfDaysinMon = getDaysInMonth(mon,year);

   daysArray = new Array();
   if (obj.getLen() != noOfDaysinMon)
   {
     for (var index =0; index < noOfDaysinMon; index++)
       daysArray.push(index+1);     
     obj.setAll(daysArray, daysArray); 
   }
}

//-------------------------------------------------------------------
// FUNCTION:
//   setCurrentDate()
//
// DESCRIPTION: Extracts month, year and day from date
//   
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function setCurrentDate()
{  
   var now = new Date();     
   toDay = now.getDate();
   toYear = 1900 + now.getYear();
   toMonth = now.getMonth();     
}

//-------------------------------------------------------------------
// FUNCTION:
//  onChnageToMonth()
// 
// DESCRIPTION: Populate the toMonth and toYear Dropdown
//
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function onChangeToMonth()
{
   toMonth = TO_MONTH_OBJ.getValue();
   toYear = TO_YEAR_OBJ.getValue();
   toDay = TO_DAY_OBJ.getValue();
   setDaysCombo(TO_DAY_OBJ,toMonth,toYear,1);
   TO_DAY_OBJ.setIndex(toDay-1); 
   TO_MONTH_OBJ.focus();
}

//-------------------------------------------------------------------
// FUNCTION:
//   addDays()
//
// DESCRIPTION: Finds the current date minus the number of days
//   
//
// ARGUMENTS:
//   myDate,days
//
// RETURNS:
//   Date
//--------------------------------------------------------------------

function addDays(myDate,days) 
{
   return new Date(myDate.getTime() - days*24*60*60*1000);
}

//-------------------------------------------------------------------
// FUNCTION:
//   Help()
//
// DESCRIPTION: Dispaly the Help Dialog
//   
//--------------------------------------------------------------------
function Help()
{
   //dwscripts.DWHelp(HELP_DOC);
   var myHelpFile = dwscripts.filePathToLocalURL(dw.getConfigurationPath() 
                    + dwscripts.FILE_SEP + "ExtensionsHelp" 
        			+ dwscripts.FILE_SEP  + "Macromedia" 
					+ dwscripts.FILE_SEP + "TeamAdministration" + dwscripts.FILE_SEP + "team_extensions_1.html" );
   dw.browseDocument(myHelpFile);
}

//-------------------------------------------------------------------
// FUNCTION:
//   validateInput()
//
// DESCRIPTION: Validate if the input entered is correct
//   
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   false : if input is not valid
//   true : if input is valid
//--------------------------------------------------------------------
function validateInput()
{
   var retValue = true;
   if (!isNaN(intNoofDays))
   {
      if (!((parseInt(intNoofDays) > 0) && (parseInt(intNoofDays) <= 999))) 
      {
         alert(MM.MSG_enterNumberBetween);
		 document.myForm.numDays.select();
	     document.myForm.numDays.focus();
         retValue = false;
       }
    }
    else
    {
       alert(MM.MSG_enterNumberBetween);
	   document.myForm.numDays.select();
       document.myForm.numDays.focus();
       retValue = false;
    }
    return retValue;
}


//-------------------------------------------------------------------
// FUNCTION:
//   getDaysInMonth()
//
// DESCRIPTION:
//   return number of dayes based on the month and year selection
//
// ARGUMENTS:
//   mondays - month number
//   yesr - year 
// RETURNS:
//   integer - number of days in the month (30 or 31 or 28 or 29)
//--------------------------------------------------------------------
function getDaysInMonth(mondays, year)
{
   if (mondays == 0 || mondays == 2 || mondays == 4 || mondays == 6 || mondays == 7 || mondays == 9 || mondays == 11)
     noOfDaysinMon = 31;
   else
   {
      //Include condition for leap year
      if (mondays == 1)
      {
         if (year%4 != 0)
           noOfDaysinMon = 28;
         else
         {
            if (year%400 == 0)
            noOfDaysinMon = 29;
         else
         {
            if (year%100 == 0)
              noOfDaysinMon = 28;
            else
              noOfDaysinMon = 29;
         }      
       }            
    } 
    else
      noOfDaysinMon = 30;
    }
    return noOfDaysinMon;
}
 

 //-------------------------------------------------------------------
 // FUNCTION:
 //   onChangeFromYear()
 //
 // DESCRIPTION:
 //     Event handler triggerd when  month is changed
 //
 // ARGUMENTS:
 //   none
 //
 // RETURNS:
 //   nothing
 //--------------------------------------------------------------------
 function onChangeFromYear()
 {
    fromMonth = FROM_MONTH_OBJ.getValue();
    fromYear = FROM_YEAR_OBJ.getValue();
	fromDay = FROM_DAY_OBJ.getValue();
    setDaysCombo(FROM_DAY_OBJ,fromMonth,fromYear,1);
	FROM_DAY_OBJ.setIndex(fromDay-1);
    FROM_YEAR_OBJ.focus();
 }


//-------------------------------------------------------------------
// FUNCTION:
//   onChangeToYear()
//
// DESCRIPTION:
//   Event handler triggerd when  year is changed
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function onChangeToYear()
{
   toMonth = TO_MONTH_OBJ.getValue();
   toYear = TO_YEAR_OBJ.getValue();
   toDay = TO_DAY_OBJ.getValue();
   setDaysCombo(TO_DAY_OBJ,toMonth,toYear,1); 
   TO_DAY_OBJ.setIndex(toDay-1);
   TO_YEAR_OBJ.focus();
}


//-------------------------------------------------------------------
// FUNCTION:
//   checkArray()
//
// DESCRIPTION: passing array values with type document.
//
// ARGUMENTS:
//   arr,obj
//
// RETURNS:
//   true or false
//-------------------------------------------------------------------- 
function checkArray(arr,obj)
{
   var retVal = false;
   for(var i=0; i<arr.length; i++)
   {
      if(arr[i] == obj.toLowerCase())
        retVal = true;
   }
   return retVal;
}

//-------------------------------------------------------------------
// FUNCTION:
//   searchFile()
//
// DESCRIPTION: Search if the file is existing in the particular folder.
//
// ARGUMENTS:
//   fileItem
//
// RETURNS:
//   nothing
//-------------------------------------------------------------------- 
function searchFile(fileItem)
{
   // check for .LCK file; fetch last 4 characters
   var fileExt = fileItem.substr(fileItem.length-4);

   if(!checkArray(ignoreFiles,fileExt))
   {
      fileName = fileItem;
      if(condition)
      {  
         //if contribute site
         if ((document.myForm.modifiedBy.value) != '')
         {
            // Checking the contribute site name if name is provided
            checkModifiedByNotNull();
         }
         else
         {
	        // Checking the contribute site name but no name specified.
            checkModifiedByNull();
         }      
      } // end if
      else
      {
         //If not contribute site 
         checkModifiedByNull();        
       }        
    } // end if-loop
}
