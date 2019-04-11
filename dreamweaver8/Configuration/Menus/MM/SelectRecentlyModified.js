// Copyright 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

//*************** GLOBAL CONSTANTS *****************
var TEAM_ADMIN_DLG_DATES = "TeamAdminDlgDates.html";
var TEAM_ADMIN_DLG_DAYS = "TeamAdminDlgDays.html";
var WEEK_BACK = "7";
var helpDoc = MM.HELP_recentlyModifiedMC;

//*************** GLOBAL VARIABLES *****************
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
     CKDaysModified:''
  };
  PREF_OBJ = new Preferences(document.URL, CK_VALUES);

  MM.cmdArgument = new Array();

  var strModifiedBy = "";

  var fileArray = new Array();

//***************    LOCAL FUNCTIONS   ***************

//-------------------------------------------------------------------
// FUNCTION:
//   onChangeRadio()
//
// DESCRIPTION: Disables the fields associated with the unchecked Radio box 
//   
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   none
//--------------------------------------------------------------------
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
        document.myForm.toYear.removeAttribute("disabled")
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
//   initializeUI()
//
// DESCRIPTION: Configures the UI of a dialog.
// 
//   
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function initializeUI() 
{  
   //Radio object
   DAYS_MODIFIED_OBJ = new RadioGroup("optDaysModified");
       	
   //From fields
   FROM_DAY_OBJ = new ListControl("fromDay");
   FROM_MONTH_OBJ= new ListControl("fromMonth");
   FROM_YEAR_OBJ = new ListControl("fromYear");

   //To fields
   TO_DAY_OBJ = new ListControl("toDay");
   TO_MONTH_OBJ = new ListControl("toMonth");
   TO_YEAR_OBJ = new ListControl("toYear");

   setCurrentDate();      //getting current date
   var strDateWeek = addDays(new Date(),WEEK_BACK); 
   fromDay = strDateWeek.getDate();
   fromYear = strDateWeek.getFullYear();
   var monthValues = new Array (0,1,2,3,4,5,6,7,8,9,10, 11);
   FROM_MONTH_OBJ.setAll (ARR_FullMonths, monthValues);
   TO_MONTH_OBJ.setAll (ARR_FullMonths,monthValues );
   FROM_MONTH_OBJ.setIndex (fromMonth);
   var yearArray = new Array();

   for (var index = startYear; index <= endYear ; index++)
   {
     yearArray.push(fromYear - index);	
   } 
   
   FROM_YEAR_OBJ.setAll (yearArray, yearArray);
   TO_YEAR_OBJ.setAll (yearArray, yearArray);

   FROM_MONTH_OBJ.setIndex (fromMonth );
   TO_MONTH_OBJ.setIndex (toMonth);

   FROM_DAY_OBJ.pickValue (fromDay);
   TO_DAY_OBJ.pickValue (toDay);

   FROM_YEAR_OBJ.pickValue (fromYear);
   TO_YEAR_OBJ.pickValue (toYear); 
	
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
   
   PREF_OBJ.load();
 
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
    onChangeRadio();
	
    setDaysCombo(FROM_DAY_OBJ,fromMonth,fromYear,1);
    setDaysCombo(TO_DAY_OBJ,toMonth,toYear,1);
    FROM_DAY_OBJ.setIndex(fromDay-1);
    TO_DAY_OBJ.setIndex(toDay-1);
		     
    localDir = dw.getSiteRoot();

    if(DWfile.exists(localDir+CONTRIBUTE_FOLDER+dwscripts.FILE_SEP+CONTRIBUTE_FILE))
    {
       document.myForm.modifiedBy.removeAttribute("disabled"); 
       condition = true;
    }
	if (condition == false)
    {
      var myContributeObj = findObject("Contribute");
	  myContributeObj.innerHTML = MM.MSG_contribute;
  }	
}  
   
   
//-------------------------------------------------------------------
// FUNCTION:
//   applyParams()
//
// DESCRIPTION: Applies or takes action.
//  Uses the preferences object to set and save the current settings.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function applyParams() 
{
   // Get the current values from the UI and set the values.
   var bol = false;
   intNoofDays = document.myForm.numDays.value;
   if (document.myForm.optDaysModified[0].checked)
   {
      if (!validateInput())
        return;
   }
   var strFromMonth = FROM_MONTH_OBJ.get();
   var strToMonth = TO_MONTH_OBJ.get();
   var intFromDate = FROM_DAY_OBJ.get();
   var intToDate=TO_DAY_OBJ.get();
   var strFromYear = FROM_YEAR_OBJ.get();
   var strToYear =TO_YEAR_OBJ.get(); 
   var curDate =  new Date();
   var curMonth;
   var curDay;
   var curYear;   
   curDay = curDate.getDate();
   curYear = curDate.getFullYear();
   curMonth = curDate.getMonth() + 1;
    
   // This Total To date
   strToTotalDate = Date.parse(strToMonth + " " + intToDate + " " + strToYear);

   // This Total From date
   strFromTotalDate = Date.parse(strFromMonth + " " + intFromDate + " " + strFromYear);  

   // This current date 
   strCurrentDt = new Date(curMonth + "/" + curDay + "/" + curYear);
     
   // This is To date	 
   if (dreamweaver.appVersion && ((dreamweaver.appVersion.indexOf('ja') != -1) || (dreamweaver.appVersion.indexOf('zh') != -1)))
		strToTotalDateBetween = strToYear + "/" + strToMonth + "/" + intToDate;
   else
	    strToTotalDateBetween = strToMonth + " " + intToDate + "," + " " + strToYear;
  
   // This is From date
   if (dreamweaver.appVersion && ((dreamweaver.appVersion.indexOf('ja') != -1) || (dreamweaver.appVersion.indexOf('zh') != -1)))
		strFromTotalDateBetween = strFromYear + "/" + strFromMonth + "/" + intFromDate ;
   else
		strFromTotalDateBetween = strFromMonth + " " + intFromDate + "," + " " + strFromYear;
   

   var fromDate = new Date();
   var toDate = new Date ();

   //From fields 
   fromDate.setDate(FROM_DAY_OBJ.getValue());
   fromDate.setMonth(FROM_MONTH_OBJ.getValue());
   fromDate.setYear(FROM_YEAR_OBJ.getValue());

   //To fields 
   toDate.setDate(TO_DAY_OBJ.getValue());
   toDate.setMonth(TO_MONTH_OBJ.getValue());    
   toDate.setYear(TO_YEAR_OBJ.getValue());

   PREF_OBJ.set(); 
   PREF_OBJ.save();
      
   //calling search local site function 
   
   searchLocalSite();
   site.setSelection(fileArray);  

   if (DAYS_MODIFIED_OBJ.getSelectedIndex() == 1)  
   {	 
     if (fileArray == '')
	 {   
 	   dw.runCommand(TEAM_ADMIN_DLG_DATES, strFromTotalDateBetween, strToTotalDateBetween, strModifiedBy, condition);
	 } 
	 else
	 {
	   window.close(); 
	 }
	 bol = MM.cmdArgument.pop(bol);
	 if(bol)
	   window.close();
	 	 		
   }
   else
   {	
     if (fileArray == '')
     {   
       dw.runCommand(TEAM_ADMIN_DLG_DAYS, intNoofDays, strModifiedBy, condition);
	 } 
	 else
	 {
	   window.close(); 
	 }
	 bol = MM.cmdArgument.pop(bol);
	 if(bol)
	   window.close(); 
     
	} //end if loop
	 //setting the focus to site -> local
	site.setFocus("local");
}// end init 


//-------------------------------------------------------------------
// FUNCTION:
//   canAcceptCommand()
//
// DESCRIPTION: Determines whether the menu item should be active or dimmed. 
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   Boolean value that indicates whether the item should be enabled.
//--------------------------------------------------------------------
function canAcceptCommand()
{
    return (site.getCurrentSite() != '');
}


//-------------------------------------------------------------------
// FUNCTION:
//   searchLocalSite()
//
// DESCRIPTION: Search if the site is a Contribute site or not and if the Modified By: text box is null or not
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function searchLocalSite()
{
   searchFolder(localDir);
   strModifiedBy = document.myForm.modifiedBy.value;
}
 
 
//-------------------------------------------------------------------
// FUNCTION:
//   searchFolder()
//
// DESCRIPTION: Search if the folder is existing in the selected site.
//
// ARGUMENTS:
//   folder
//
// RETURNS:
//   nothing
//-------------------------------------------------------------------- 
function searchFolder(folder)
{
	var separator = "";
	var listFiles = DWfile.listFolder(folder);

	for (var i = 0; i < listFiles.length; i++)
	{
		var tmpListItem = listFiles[i];

		if (folder != localDir)
			separator = dwscripts.FILE_SEP;

	    var listItem = folder + separator + listFiles[i];
		
		//if (isFolder(listItem))
		if (DWfile.getAttributes(listItem).indexOf('D') != (-1))
		{    
	    	// listItem is a folder
	    	
	    	if (!checkArray(ignoreFolders,tmpListItem))
	    		searchFolder(listItem);
	    } 
	    else
	    {
			// listItem is a file

			searchFile(listItem);
		}
	}
}

//------------------------------------------------------------------- 
// FUNCTION:
//   hexToDec()
//
// DESCRIPTION: If pass hexadecimal, it will convert to seconds.
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
//   generates the result in the result window in a separate html file  
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function checkModifiedByNotNull()
{ 
   var strLastDate;

   var fromTotalDate;
   var toTotalDate;
   var fileDate;
   var noteHandle;
   var theKeys;  
   var theValue;
   var strFileDate = DWfile.getModificationDateObj(fileName);
   
   strLastDate = addDays(new Date(),intNoofDays-1);
   strLastDate = new Date(strLastDate.getFullYear(),strLastDate.getMonth(),strLastDate.getDate(),0,0,0,0);

   var intFileMonth = strFileDate.getMonth() + 1;
   var intFileDate = strFileDate.getDate();
   var intFileYear = strFileDate.getFullYear();
	  
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
     } //end for loop
    } // end if	
   
   if (DAYS_MODIFIED_OBJ.getSelectedIndex() == 0)    
   {  
	   
      if ((strLastDate <= strFileDate) && (document.myForm.modifiedBy.value.toLowerCase()  == strModifiedBy.toLowerCase().match(document.myForm.modifiedBy.value, "i")))           
      {  
        fileArray.push(fileName);    
	    strModifiedBy = "";
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
	   
       if ((fromTotalDate <= strFileDate) && (strFileDate <= toTotalDate) && (document.myForm.modifiedBy.value.toLowerCase()  == strModifiedBy.toLowerCase().match(document.myForm.modifiedBy.value, "i")))
       {   
	      fileArray.push(fileName);
	      strModifiedBy = "";
       }  
    } // end if  
    //site.setSelection(fileArray) ;  
}  


//-------------------------------------------------------------------
// FUNCTION:
//   checkModifiedByNull()
//
// DESCRIPTION: Finds the files satisfying the criteria with Modified By: field as null  and 
//      generates the result in the result window in a separate html file 
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
   var fileDate; 
   var strFileDate = DWfile.getModificationDateObj(fileName);

   strLastDate = addDays(new Date(),intNoofDays-1);
   strLastDate = new Date(strLastDate.getFullYear(),strLastDate.getMonth(),strLastDate.getDate(),0,0,0,0);
   var intFileMonth = strFileDate.getMonth() + 1;
   var intFileDate = strFileDate.getDate();
   var intFileYear = strFileDate.getFullYear();
   
   if (DAYS_MODIFIED_OBJ.getSelectedIndex() == 0)
   {    
      if ((strLastDate <= strFileDate))
      {    
         fileArray.push(fileName);  
	 	     strModifiedBy = "";
      } 
   }  //end if
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
          fileArray.push(fileName);
	      strModifiedBy = "";
       } 
   } //else if  
   //site.setSelection(fileArray) ;   
} 
