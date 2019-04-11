// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.
// include ../reports.js
//*************** GLOBAL CONSTANTS *****************
var selectValueArray = new Array('contains','notcontain','is','isnot','regex');
var selectListArray = new Array(LABEL_Contains,LABEL_NotContain,LABEL_Is,LABEL_IsNot,LABEL_MatchesRegex);
//*************** GLOBAL VARIABLES *****************
// UI Elements
var MENU_DN1, MENU_DN2,MENU_DN3;
// other globals
var DN_VALUES = 
  { // Default values - names must match cooresponding object names.
	  DNName1  :'',
    DNComparison1  :LABEL_Contains,
    DNValue1 :'',
		DNName2  :'',
    DNComparison2  :LABEL_Contains,
    DNValue2  :'',
		DNName3  :'',
    DNComparison3  :LABEL_Contains,
    DNValue3  :''
  };
var PREF_OBJ = new Preferences(document.URL, DN_VALUES);
// var REPORT_STR = "Design Note Info: ";
var REPORT_STR = new Array();
//******************* API **********************

//---------------
// Function: configureSettings
// Description: Standard report API, used to initialize and load
//  the default values. Does not initialize the UI.
//
function configureSettings() {
  // Load all the saved settings into the preferences object.
  PREF_OBJ.load();
  return true;
}
//---------------
// Function: commandButtons
// Description: Standard report API, like commands the return value
//  controls the display of command buttons in the settings dialog.
//
function commandButtons() 
{
  return new Array(
            MM.BTN_OK,         "applyParams()",
            MM.BTN_Cancel,     "window.close();"
            );
}

// Function: processFile
// Description: Report command api called during file processing.
function processFile (fileURL) 
{
  // Check if this is actually a folder
	var retStr = LABEL_DesignNoteInfo;
	REPORT_STR = new Array();
	var conditionsDN = new Array
      (
        {name:DN_VALUES['DNName1'], operator:DN_VALUES['DNComparison1'], value:DN_VALUES['DNValue1']}, 
        {name:DN_VALUES['DNName2'], operator:DN_VALUES['DNComparison2'], value:DN_VALUES['DNValue2']},
				{name:DN_VALUES['DNName3'], operator:DN_VALUES['DNComparison3'], value:DN_VALUES['DNValue3']} 
      )
  if (!isFolder(fileURL)) 
	{
    if (matchesDesignNote(fileURL, conditionsDN)) // Matches design note condition
   //   resultsItem(LIST_FILES[INDEX_FILE].url, strDesc);
	  {
		  if (noDNSearch(conditionsDN))
			  retStr += getNameValuePairStr(fileURL).join(", ");
			else
		    retStr += REPORT_STR.join(", ");
			reportItem(REP_ITEM_CUSTOM, fileURL, retStr,0,REP_ICON_NOTE);
	  }
  }
}
//***************    LOCAL FUNCTIONS   ***************

//---------------
// Function: initialize
// Description: Configures the UI of a dialog.
//
function initializeUI() 
{
  MENU_DN1 = new ListControl('DNComparison');
  MENU_DN2 = new ListControl('DNComparison2');
	MENU_DN3 = new ListControl('DNComparison3');
	MENU_DN1.setAll(selectListArray,selectValueArray);
	MENU_DN2.setAll(selectListArray,selectValueArray);
	MENU_DN3.setAll(selectListArray,selectValueArray);
	
	PREF_OBJ.initialize(
    { // In line declaration of objects associative array.
		  DNName1 : new PrefField(findObject('DNName')),
      DNComparison1 : new PrefSelectClass(MENU_DN1),
      DNValue1: new PrefField(findObject('DNValue')),
			DNName2 : new PrefField(findObject('DNName2')),
      DNComparison2 : new PrefSelectClass(MENU_DN2),
      DNValue2 : new PrefField(findObject('DNValue2')),
			DNName3 : new PrefField(findObject('DNName3')),
      DNComparison3 : new PrefSelectClass(MENU_DN3),
      DNValue3 : new PrefField(findObject('DNValue3')) 
    }
  )
}

//---------------
// Function: isFolder
// Description: 
//
function isFolder(fileURL) {
  var retVal = false;
  if (fileURL && DWfile.exists(fileURL))
    retVal = (DWfile.getAttributes(fileURL).indexOf('D') != -1);
  return retVal;
}

//---------------
// Function: matchesDesignNote
// Description: 
//   There must be only one key exactly matching a DesignNote name.
//
function matchesDesignNote (fileURL, dnConditions)
{
  var rtnBool = true;
  var filePtr; // Design note file to be opened for this file.
  var dnName, dnValue;
  var i, keys, tValue;
  var continueSearch = true;
  var regExCond;

  //??? Check for dnFile exisitence prior to open (Design notes optimization).  
  //??? Check the type of search, will it search for all Design Notes?
  //???  if so get them all up front.

  filePtr = MMNotes.open(fileURL); // Open metafile
     //??? Currently always creates file, better to just do nothing because we are only looking.
     //??? Note that some conditions may still succeed because condition checking for empty note etc..
  if (filePtr==0 || MMNotes.getKeyCount(filePtr) == 0) 
  {
  	if (filePtr)
  		MMNotes.close(filePtr);
  	return false;
  }
  if (noDNSearch(dnConditions)) 
  {
  	if (filePtr)
  		MMNotes.close(filePtr);
  	return true; 
  }
  	
  if (!filePtr) { // Could not open Design Notes - Can not search them so fail.
    rtnBool = false;  //??? check conditions and should include can not use dn error message.
  } else { 
    keys = MMNotes.getKeys(filePtr);  // Get the keys for files design note.
  }

  // For each condition, check to see if operation fails (&& each condition).
  for (curCond = 0; (curCond < dnConditions.length) && rtnBool; curCond++)
  {
    dnName = dnConditions[curCond].name; // Get conditions for this dn.
    dnValue = dnConditions[curCond].value;
    regExCond = '';  // Reset regular expression condition.
    
    if ( dnName == '' ) { // No name, search all Design Notes for maching value.
      for (i=0; i < keys.length ; i++) {
        tValue = MMNotes.get( filePtr, keys[i] );
        rtnBool = matchesDesignNoteValue(dnConditions[curCond].operator, dnValue, tValue);
        if (rtnBool && dnValue !="") 
				{
				  REPORT_STR.push( keys[i] + "=" + tValue + " ");
				  break;
				} 
      }
      if (keys.length==0) { // There was nothing to match, check the empty condition.
        rtnBool = matchesDesignNoteValue(dnConditions[curCond].operator, dnValue, '');
				if (rtnBool) REPORT_STR.push(keys[i] + "=" + tValue + " ");
      }
    } else { // Get Design note information for the matching key.
      tValue = '';
      rtnBool = false;
      for (i=0; i < keys.length ; i++) {
        if ( keys[i] == dnName ) { // Design Note name matched.
            tValue = MMNotes.get( filePtr, keys[i] );
            rtnBool = matchesDesignNoteValue(dnConditions[curCond].operator, dnValue, tValue);
						if (rtnBool) REPORT_STR.push(keys[i] + "=" + tValue + " ");
            break;
        }
      }
    }
  }
  if (filePtr) MMNotes.close(filePtr);
  return rtnBool;
}

//---------------
// Function: noDNSearch
// Description: 
//
function noDNSearch (dnConditions) {
  var rtnBool = true;
  var curCond = 0;
  
  // First check if there is nothing to match (no values and contains).
  for (curCond = 0; (curCond < dnConditions.length) && rtnBool ; curCond++) {
    if ((dnConditions[curCond].operator == 'contains') &&
        ((dnConditions[curCond].name == '') && (dnConditions[curCond].value == ''))) {
    } else {
      rtnBool = false;
    }
  }
  return rtnBool;
}


//---------------
// Function: matchesDesignNoteValue
// Description: 
//
function matchesDesignNoteValue (dnOperator, dnValue, tValue)
{
  var rtnBool = false;
    // With matching name, check if the value matches
  switch (dnOperator) {
    case 'contains' : // If contains value, return true
      rtnBool = ( (dnValue == '') || (tValue.indexOf(dnValue) != -1) );
      break;
    case 'notcontain' : // If contains value, return false
      if ( tValue.indexOf(dnValue) >= 0 ) {
        rtnBool = false;
      } else {
        rtnBool = true;
      }
      break;
    case 'is' : // If is value, return true
      rtnBool = ( tValue == dnValue );
      break;
    case 'isnot' : // If is value, return false
      rtnBool = ( tValue != dnValue );
      break;
    case 'regex' : // If matches, return true
      var regExCond = new RegExp(dnValue);
      rtnBool = (regExCond.test(tValue));
      break;
    default :
      // Unknown condition in Design Note comparison - returning false.
      break;
  }
  return rtnBool;
}

//---------------
// Function: applyParams
// Description: Applies or takes action.
//  Uses the preferences object to set and save the current settings.
//
function applyParams() {
  // Get the current values from the UI and set the values.
  PREF_OBJ.set();
  
  PREF_OBJ.save();
  window.close();
}

function getNameValuePairStr(fileURL)
{
  var nameList = new Array();
	var fileHandle = MMNotes.open(fileURL);
	var retVal = new Array();
	var name, tempStr;
	nameList = MMNotes.getKeys(fileHandle);
	for (var i=0; i<nameList.length; i++)
	{
	  name = nameList[i];
	  tempStr = name + "=" + MMNotes.get(fileHandle,name);
		retVal.push(tempStr);
	}
	return retVal;
}
