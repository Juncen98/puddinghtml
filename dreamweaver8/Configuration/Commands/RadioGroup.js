// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

var HELP_DOC = MM.HELP_RadioGroup;

var GC_RADIOS     = new GridControl("LabelValuePairs");
var TF_GROUP_NAME = new TextField("","GroupName");
var RG_LAYOUT     = new RadioGroup("Layout");

var PREF_SECTION         = "Extensions\\Objects\\Radio Group";
var PREF_KEY_LAYOUT      = "Layout Type Index";
var PREF_DEFAULT_LAYOUT  = 0;

//--------------------------------------------------------------------
// FUNCTION:
//   displayHelp
//
// DESCRIPTION:
//   called when the user clicks the Help button. in this implementation,

//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function displayHelp()
{
   // Replace the following call if you are modifying this file for your own use.
   dwscripts.displayDWHelp(HELP_DOC);
}

//--------------------------------------------------------------------
// FUNCTION:
//   commandButtons
//
// DESCRIPTION:
//   dialog button control
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function commandButtons()
{
  return new Array(MM.BTN_OK,"clickedOK()",
                   MM.BTN_Cancel,"window.close()",
                   MM.BTN_Help,"displayHelp()");
}


//--------------------------------------------------------------------
// FUNCTION:
//   clickedOK
//
// DESCRIPTION:
//   called when the user clicks OK, manages radio group insertion and error messages
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function clickedOK()
{
  var labelValueArr = GC_RADIOS.getAll();
  var radioGroupName = TF_GROUP_NAME.getValue();
  var canApplyMsg = "";
  
  canApplyMsg = checkForLabelsAndValues(labelValueArr);
  
  if (!canApplyMsg && !radioGroupName)
    canApplyMsg = MM.MSG_NeedARadioGroupName;
  else
    radioGroupName = dwscripts.entityNameEncode(radioGroupName);
  
  if (canApplyMsg)
  {
    alert(canApplyMsg);
    return;
  }
  
  var isTable = RG_LAYOUT.getSelectedIndex() == 1;
  
  // Do not allow the checked attribute to be set from the form object version
  //   of the radio group.
  var selectValueEqualTo = ""; 
  var insertionStr = createRadioGroupString(radioGroupName,isTable,selectValueEqualTo,labelValueArr);

  savePreferences(); // save layout choice, i.e. line break or table

  dw.getDocumentDOM().insertHTML(returnFormTag(insertionStr),false);
  window.close();

}


//--------------------------------------------------------------------
// FUNCTION:
//   initializeUI
//
// DESCRIPTION:
//   prepare the dialog for user feedback
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function initializeUI()
{
  TF_GROUP_NAME.initializeUI();

  var radioLabel = MM.LABEL_Radio;
  var radioValue = MM.LABEL_Radio.toLowerCase();

  var displayArr = new Array(new Array(radioLabel,radioValue),
                             new Array(radioLabel,radioValue)
                            );

  GC_RADIOS.setAll(displayArr);

  // generate unique radio group name, i.e.: "RadioGroup1"
  TF_GROUP_NAME.setValue( generateRadioGroupName() );
  
  // set layout type to previous choice
  RG_LAYOUT.setSelectedIndex( getPreference(PREF_KEY_LAYOUT) );

  TF_GROUP_NAME.textControl.focus();  // set focus to radio group name
  TF_GROUP_NAME.textControl.select(); // select current group name

}


//--------------------------------------------------------------------
// FUNCTION:
//   updateUI
//
// DESCRIPTION:
//   update the UI based on user feedback.
//
// ARGUMENTS:
//   theArg -- label for element or elements to update
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function updateUI(theArg)
{
  // if user clicks the "-" button, delete the currently selected item
  if (theArg == "deleteButton")
  {
    GC_RADIOS.del();
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   generateRadioGroupName
//
// DESCRIPTION:
//   generate unique radio group name
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   unique name
//--------------------------------------------------------------------
function generateRadioGroupName()
{
  var baseName = MM.LABEL_RadioGroupDefaultName;
  return dwscripts.getUniqueNameForTag("INPUT",baseName);
}



//--------------------------------------------------------------------
// FUNCTION:
//   createRadioGroupString
//
// DESCRIPTION:
//   create the text string to insert into the document
//
// ARGUMENTS:
//   groupName (string), isTable (boolean), selectValueEqualTo (string), labelValueArr(array)
//
// RETURNS:
//   string to insert into the document
//--------------------------------------------------------------------
function createRadioGroupString(groupName,isTable,selectValueEqualTo,labelValueArr)
{
  // labelValueArr is n items long, where n equal the number of radio buttons
  // Each nth item is an array in which [0] is the label and [1] is the value
  
  // Create a third item in the array that contains the checked string or
  // an empty string if there is no checked string
  addCheckedInformation(labelValueArr,selectValueEqualTo);

  var nItems = labelValueArr.length;
  var i;
  var insertionStr = "";
  var paramObj = new Object();
  paramObj.RadioName = groupName;
  var radioButtonStr = "";

  for (i=0;i<nItems;i++)
  {
    paramObj.RadioButtonLabel = labelValueArr[i][0];
    paramObj.RadioValue = labelValueArr[i][1];
    paramObj.CheckedAttribute = labelValueArr[i][2];
    paramObj.RadioButton = getRadioButtonString(paramObj);

    insertionStr += (isTable) ? getTableRowString(paramObj):
                                getLineBreakString(paramObj);
  }

  return ( addOuterTag(insertionStr,isTable) );
}



//--------------------------------------------------------------------
// FUNCTION:
//   addCheckedInformation
//
// DESCRIPTION:
//   adds the checked attribute as a third item in the multi-dimensional array
//   determines the correct type of checked attribute (static or dynamic), and
//   builds up the correct string for either case
//
// ARGUMENTS:
//   labelValueArr (multi-dimensional array),selectValueEqualTo (string)
//
// RETURNS:
//   nothing -- the multi-dimensional array is passed by reference
//--------------------------------------------------------------------
function addCheckedInformation(labelValueArr,selectValueEqualTo)
{
  var nItems = labelValueArr.length;
  var i;

  for (i=0; i<nItems; i++)
  {
    labelValueArr[i][2] = "";
  }
  
/*
  // if static value, then look for that value in the list
  if (selectValueEqualTo && !dwscripts.hasServerMarkup(selectValueEqualTo))
  {
    for (i=0;i<nItems;i++)
    {
      labelValueArr[i][2] = (labelValueArr[i][1] == selectValueEqualTo)?"CHECKED":"";
    }
  }
  
  else if (selectValueEqualTo && dwscripts.hasServerModel()) // dynamic case
  {
    var paramObj = new Object();
    var dynamicCheckedStr = "";
    paramObj.DynValue = dwscripts.encodeDynamicExpression(selectValueEqualTo);

    for (i=0;i<nItems;i++)
    {
      paramObj.RadioButtonValue = labelValueArr[i][1];
      labelValueArr[i][2] = extPart.getInsertString("","DynRadioGroup_checkedAttr",paramObj);
    }
  }
  
  else // there is no checked information to store
  {
    for (i=0;i<nItems;i++)
      labelValueArr[i][2] = "";
  }
*/
}


//--------------------------------------------------------------------
// FUNCTION:
//   addOuterTag
//
// DESCRIPTION:
//   adds table or p tags around current string, based on user preference
//
// ARGUMENTS:
//   theStr -- string to wrap outer tag around
//   isTable -- boolean -- if false, it is assumed that layout is line breaks
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function addOuterTag(theStr,isTable)
{
  return (isTable)?'<table width="200">' + theStr + '</table>':
                   '<p>'                 + theStr + '</p>';

}


//--------------------------------------------------------------------
// FUNCTION:
//   getPreference
//
// DESCRIPTION:
//   gets the layout type from the previous time the radio group was applied.
//   the layout type is "sticky" and remembered from access to access
//
// ARGUMENTS:
//   name of key to get
//
// RETURNS:
//   the last chosen preference, uses default value if no preference on record
//--------------------------------------------------------------------
function getPreference(whichKey)
{
  var retVal = "";

  if (whichKey == PREF_KEY_LAYOUT)
  {
    retVal = dw.getPreferenceString(PREF_SECTION,PREF_KEY_LAYOUT,PREF_DEFAULT_LAYOUT);
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   savePreferences
//
// DESCRIPTION:
//   save user layout preference
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function savePreferences()
{
  dw.setPreferenceString(PREF_SECTION,PREF_KEY_LAYOUT,RG_LAYOUT.getSelectedIndex());
}



//--------------------------------------------------------------------
// FUNCTION:
//   getRadioButtonString
//
// DESCRIPTION:
//   get the string which represents one radio button
//
// ARGUMENTS:
//   paramObj -- object with name/value properties
//
// RETURNS:
//   string which represents one html element radio button
//--------------------------------------------------------------------
function getRadioButtonString(paramObj)
{
  var radioStr = '<input type="radio" name="@@RadioName@@" value="@@RadioValue@@">';


  radioStr = radioStr.replace(/@@RadioName@@/,paramObj.RadioName);
  radioStr = radioStr.replace(/@@RadioValue@@/,paramObj.RadioValue);

  if (paramObj.CheckedAttribute)
  {
    radioStr = radioStr.substring(0,radioStr.length-1) + " " + paramObj.CheckedAttribute + ">";
  }
  return radioStr;
}


//--------------------------------------------------------------------
// FUNCTION:
//   getTableRowString
//
// DESCRIPTION:
//   get the string which represents one table row
//   used only when layout type is set to "Table"
//
// ARGUMENTS:
//   paramObj -- object with name/value properties
//
// RETURNS:
//   string which represents one html table row
//--------------------------------------------------------------------
function getTableRowString(paramObj)
{
  var rowStr =  "<tr><td><label>@@RadioButton@@@@RadioButtonLabel@@</label></td></tr>";

  rowStr = rowStr.replace(/@@RadioButton@@/,paramObj.RadioButton);
  rowStr = rowStr.replace(/@@RadioButtonLabel@@/,paramObj.RadioButtonLabel);

  return rowStr;
}


//--------------------------------------------------------------------
// FUNCTION:
//   getLineBreakString
//
// DESCRIPTION:
//   get the string which represents the radio button and radio button label
//   used only when layout type is set to "Line Breaks"
//
// ARGUMENTS:
//   paramObj -- object with name/value properties
//
// RETURNS:
//   string which represents radio button and associated label
//--------------------------------------------------------------------
function getLineBreakString(paramObj)
{
  var textStr = "<label>@@RadioButton@@ @@RadioButtonLabel@@</label><br>";

  textStr = textStr.replace(/@@RadioButton@@/,paramObj.RadioButton);
  textStr = textStr.replace(/@@RadioButtonLabel@@/,paramObj.RadioButtonLabel);

  return textStr;

}


//--------------------------------------------------------------------
// FUNCTION:
//   checkForLabelsAndValues
//
// DESCRIPTION:
//   checks a multi-dimensional array to verify its contents
//   verifies that there is at least one item, and that all items are complete
//
// ARGUMENTS:
//   theArr - multi-dimensional array
//
// RETURNS:
//   empty string if everything is fine, and error message string if it is not
//--------------------------------------------------------------------
// returns empty string if valid, and error message if not valid
function checkForLabelsAndValues(theArr)
{
  var retVal = "";
  var nItems = theArr.length;
  var i;
  
  if (!nItems || nItems == 0)
  {
    retVal = MM.MSG_NeedAtLeastOneButton;
  }
  
  if (!retVal)
  {
    for (i=0;i<nItems;i++)
    {
      if (theArr[i][0] == "" || theArr[i][1] == "")
      {
        retVal = MM.MSG_EnterLabelAndValue;
        break;
      }
    }
  }
  
  return retVal;
}
