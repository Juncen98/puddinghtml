// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.
// ******************** GLOBALS ****************************

var helpDoc = MM.HELP_inspDate;

// ******************** API ****************************

function canInspectSelection() {
  var dom = dw.getDocumentDOM();
  var lockObj = dom.getSelectedNode();
  if (lockObj.type && lockObj.type == "mmdate")
     return true;
    return false;
} 



// ******************** API ****************************

//function: editDateFormat
//description: called from Edit button, brings up original date command
//dialog so that format can be edited

function editDateFormat(){
  var dom = dw.getDocumentDOM();
  var lockObj = dom.getSelectedNode();
  var origFormat = lockObj.format;
  var dateInfoArr = decipherDateID(origFormat);
  
  var dayFormat = dateInfoArr[0];
  var dateFormat = dateInfoArr[1];
  var timeFormat = dateInfoArr[2];
  
  //pop up date dialog and return the date string and date ID
  var dateDialogArr= showDateDialog(dayFormat,dateFormat,timeFormat)
   
  //if user clicks Cancel from Date dialog, return
  if (!dateDialogArr[0])
     return;
    
  var newDateStr = dateDialogArr[0];
  var newFormat  = dateDialogArr[1];
   
  //if nothing has changed, return
  if (origFormat == newFormat)
     return;
  
  var openComment = '<!-- #BeginDate format:' + newFormat + ' -->';
  var closeComment = '<!-- #EndDate -->';
  newDateStr = openComment + newDateStr + closeComment;
  var docElement = dom.documentElement;
  var allText = docElement.outerHTML;
  var lockOffsets = dom.nodeToOffsets(lockObj);
  allText = allText.substring(0,lockOffsets[0]) + newDateStr +
            allText.substring(lockOffsets[1]);
  docElement.outerHTML = allText;

  // reset selection
  dom.setSelection(lockOffsets[0],lockOffsets[0]+newDateStr.length);
}



//function: showDateDialog
//description: displays the date dialog
//returns an array of two items:
//1.a date string using the chosen format
//2.a date ID which shows the type of format, e.g.: "fcAm1"
//means a full day, followed by a comma, followed by the American 1 format

function showDateDialog(dayFormat,dateFormat,timeFormat){
   var cmdFile = dw.getConfigurationPath() + "/Commands/Date.htm";
   var cmdDOM = dw.getDocumentDOM(cmdFile);
   var cmdWin = cmdDOM.parentWindow;
   
   var theForm = cmdDOM.forms[0];
   var dayMenu = theForm.DayFormats;
   var dateMenu = theForm.DateFormats;
   var timeMenu = theForm.TimeFormats;
   
   //popup the date window, but first -- remove the "Update Automatically" option
   //and change title to be "Edit Date Format"
   cmdDOM.getElementsByTagName("mmtag").item(0).innerHTML = "";
   cmdDOM.getElementsByTagName("title").item(0).innerHTML = TITLE_EditDateFormat;
   
   //next, select the correct day format, date format, and time format.
   cmdWin.initializeUI(); //populate the menus
   selectMenuOption(dayMenu,"value",dayFormat); 
   selectMenuOption(dateMenu,"value",dateFormat);
   selectMenuOption(timeMenu,"value",timeFormat);
   
   dw.popupCommand("Date.htm");

   return new Array(   cmdWin.getDateStr(),
                       cmdWin.getDateID()   );
}



//function: selectMenuOption
//description: given a select widget object, attribute, and value,
//selects the option where attribute=value
//for instance, given selObj,text,"my field", selects the option
//with text equalling "my field"

function selectMenuOption(selObj,attr,val){
   
   var selInd = -1;
   for (var i=0;i<selObj.options.length;i++){
   
      if ( selObj.options[i][attr] == [val]){
       selInd = i;
     break; 
    }
   }   
   if (selInd!=-1)
      selObj.selectedIndex = selInd;
      
}


