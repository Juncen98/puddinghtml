// Copyright 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

    
//**********************GLOBAL VARS********************

// intialize labels
var TEXTFIELD     =  MM.LABEL_TextField;
var HIDDENFIELD   =  MM.LABEL_HiddenField;
var PASSWORDFIELD =  MM.LABEL_PasswordField;
var PASSWORD      =  MM.LABEL_Password;
var FILEFIELD     =  MM.LABEL_FileField;
var TEXTAREA      =  MM.LABEL_TextArea;
var MENU          =  MM.LABEL_Menu;
var CHECKBOX      =  MM.LABEL_CheckBox;
var RADIOGROUP    =  MM.LABEL_RadioGroup;
var STATICTEXT    =  MM.LABEL_Text;

var TEXT          =  "',none,NULL";
var NUMERIC       =  "none,none,NULL";
var DATE          =  "',none,NULL";
var DATEMSACCESS  =  "#,none,NULL";
var CHECKBOXYN    =  "none,'Y','N'";
var CHECKBOX10    =  "none,1,0";
var CHECKBOXNEG10 =  "none,-1,0";
var CHECKBOXACCESS=  "none,Yes,No";

var STR_DIVIDER = "* *";
var STR_ELEMENT_NAMES = STR_DIVIDER;

var DB_UNSUPPORTED_COLUMNS_ENUM_MAP = null;

var DEBUG_FILE = dw.getConfigurationPath() + "/SO_DEBUG.txt";

//--------------------------------------------------------------------
// FUNCTION:
//   createFormElementStrings
//
// DESCRIPTION:
//   This function creates the form element strings that will be used
//   to create the final form.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function createFormElementStrings(rowInfoArr)
{
  var nRows = rowInfoArr.length, i,currRowInfoObj;
  var fieldInfoObj, fieldType, fieldLabel, fieldVal;
  var formElemObj, formElemStrArr = new Array(), formElemStr;

  for (i = 0; i < nRows; i++)
  {
    fieldType = "", fieldLabel = "";
    
    currRowInfoObj = rowInfoArr[i];
    fieldInfoObj = currRowInfoObj.displayAs; 
    fieldInfoObj.fieldName = currRowInfoObj.fieldName;
    fieldLabel = currRowInfoObj.label;    
    fieldVal = fieldInfoObj.value;         
    fieldType = fieldInfoObj.type;
    
    formElemObj = new Object();    
    formElemObj.ElementName = fieldInfoObj.fieldName;
    formElemObj.ElementType = fieldType.toLowerCase();
    formElemObj.ElementValue = fieldVal;
    formElemObj.ElementLabel = fieldLabel;
    formElemObj.EqualToVal = "";
    
    if (fieldType == "checkBox")
    {
      formElemObj.ElementChecked = "";
      if (fieldInfoObj.checked)
      {
        formElemObj.ElementChecked = "checked";
      }
    }
    else if (fieldType == "text")
    {
      formElemObj.ElementValue = fieldInfoObj.text;
    }
    else if (fieldType == "dynamicCheckBox")
    {  
      formElemObj.ElementChecked = "";
      if(fieldInfoObj.checkIf)
      {
        var selObj = new Object();
	    selObj.expression1 = dwscripts.encodeDynamicExpression(fieldInfoObj.checkIf); 
        selObj.expression2 = dwscripts.encodeDynamicExpression(fieldInfoObj.equalTo); 
		formElemObj.ElementChecked = extPart.getInsertString("", "DynamicCheckbox_attrib", selObj, "");
      }
    }
    else if (fieldType == "menu")
    {
      var nOptions = fieldInfoObj.textArr.length;
      var defaultSelected = fieldInfoObj.defaultSelected;
      
      if (!nOptions) 
      {
         var labelText = "[ " + MM.LABEL_Label + " ]";
         fieldInfoObj.textArr = new Array(labelText, labelText);
         fieldInfoObj.valArr   = new Array("menuitem1","menuitem2");
         nOptions = 2;
      }      
      
      formElemObj.OptionText = fieldInfoObj.textArr;
      formElemObj.OptionValue = fieldInfoObj.valArr;

      var optionSelectedArr = new Array();
      // This logic checks if the selected field is same as the value,
      // if so marks it as selected, otherwise adds an empty string.
      // this logic is required because all the arrays should be of same
      // length for loop in edml file
      for(var j = 0; j < nOptions; j++)
      {
        if(fieldInfoObj.valArr[j] && defaultSelected)
        {
          var selObj = new Object;
          selObj.DefaultSelected = dwscripts.encodeDynamicExpression(defaultSelected);
          if (   selObj.DefaultSelected.length > 1 && selObj.DefaultSelected.charAt(0) == "#" 
              && selObj.DefaultSelected.charAt(selObj.DefaultSelected.length - 1) == "#" 
             )
          {
            selObj.DefaultSelected = selObj.DefaultSelected.slice(1, 
                                       selObj.DefaultSelected.length - 1);
          }

          if (fieldInfoObj.valArr[j])
          {
            var tempItemValue = dwscripts.encodeDynamicExpression(fieldInfoObj.valArr[j]);
            // We need to strip the outer #'s if present
            if (   tempItemValue.length > 1 && tempItemValue.charAt(0) == "#" 
                && tempItemValue.charAt(tempItemValue.length - 1) == "#" 
               )
            {
              tempItemValue = tempItemValue.slice(1, tempItemValue.length - 1);
            }
            selObj.ItemValue = tempItemValue;
          }
          else
          {
            selObj.ItemValue = fieldInfoObj.valArr[j];
          }

          var expr = extPart.getInsertString("", "Menu_OptionSelected", selObj, "");
          optionSelectedArr.push(expr);
        }
        else
        {
          optionSelectedArr.push("");
        }
      }
      formElemObj.OptionSelected = optionSelectedArr;  
    }
    else if (fieldType == "dynamicMenu")
    {
      var equalTo = fieldInfoObj.defaultSelected;    
      formElemObj.DynOptionText = fieldInfoObj.textCol;
      formElemObj.DynOptionValue = fieldInfoObj.valCol;

      if (equalTo)
      {
        var tempEqualTo = dwscripts.encodeDynamicExpression(equalTo);
        // We need to strip the outer #'s if present
        if (   tempEqualTo.length > 1 && tempEqualTo.charAt(0) == "#" 
            && tempEqualTo.charAt(tempEqualTo.length - 1) == "#" 
           )
        {
          tempEqualTo = tempEqualTo.slice(1, tempEqualTo.length - 1);
        }
        formElemObj.EqualToVal = tempEqualTo;
      }
      else
      {
        formElemObj.EqualToVal = equalTo;
      }

      formElemObj.RecordsetName = fieldInfoObj.recordset;    
    }
    else if (fieldType == "radioGroup")
    {
      var nButtons = fieldInfoObj.labelArr.length;
      var defaultChecked = fieldInfoObj.defaultChecked;
      
      if (!nButtons) 
      {
         var labelText = "[ " + MM.LABEL_Label + " ]";
         fieldInfoObj.labelArr = new Array(labelText, labelText);
         fieldInfoObj.valArr   = new Array("radiobutton1","radiobutton2");
         nButtons = 2;
      }
      
      formElemObj.FieldLabel = fieldInfoObj.labelArr;
      formElemObj.FieldValue = fieldInfoObj.valArr;
    
      var fieldCheckedArr = new Array();
      
      // This logic checks if the checked field is same as the value,
      // if so marks it as checked, otherwise adds an empty string.
      // this logic is required because all the arrays should be of same
      // length for a loop in edml file
      for(j = 0;j < nButtons; j++)
      {
        if(fieldInfoObj.valArr[j] && defaultChecked)
        {
          var selObj = new Object;
          var tempDefaultChecked = dwscripts.encodeDynamicExpression(defaultChecked);
          // [my 06-27-05] #192070 - '#' causes syntac error for Iif
          // We need to strip the outer #'s if present
          if (  tempDefaultChecked.length > 1 && tempDefaultChecked.charAt(0) == "#" 
                && tempDefaultChecked.charAt(tempDefaultChecked.length - 1) == "#" )
           {
              selObj.DefaultChecked = tempDefaultChecked.slice(1, tempDefaultChecked.length - 1);
           }
           else
           {
			  selObj.DefaultChecked = tempDefaultChecked;
           }                
          
          if (fieldInfoObj.valArr[j])
          {
            var tempItemValue = dwscripts.encodeDynamicExpression(fieldInfoObj.valArr[j]);
	   // We need to strip the outer #'s if present
            if (   tempItemValue.length > 1 && tempItemValue.charAt(0) == "#" 
                && tempItemValue.charAt(tempItemValue.length - 1) == "#" 
               )
            {
              tempItemValue = tempItemValue.slice(1, tempItemValue.length - 1);
            }
            selObj.ItemValue = tempItemValue;       
          }
          else
          {
            selObj.ItemValue = fieldInfoObj.valArr[j];
          }
 
          var expr = extPart.getInsertString("", "Radio_OptionChecked", selObj, "");
          fieldCheckedArr.push(expr);
        }
        else
        {
          fieldCheckedArr.push("");
        }
      }
      formElemObj.FieldChecked = fieldCheckedArr;       
    }
    else if (fieldType == "dynamicRadioGroup")
    {
      var equalTo = fieldInfoObj.defaultChecked;        
      formElemObj.DynFieldName = fieldInfoObj.labelCol;
      formElemObj.DynFieldValue = fieldInfoObj.valCol;

      if (equalTo)
      {
        var tempEqualTo = dwscripts.encodeDynamicExpression(equalTo);
        // We need to strip the outer #'s if present
        if (   tempEqualTo.length > 1 && tempEqualTo.charAt(0) == "#" 
            && tempEqualTo.charAt(tempEqualTo.length - 1) == "#" 
           )
        {
          tempEqualTo = tempEqualTo.slice(1, tempEqualTo.length - 1);
        }
        formElemObj.EqualToVal = tempEqualTo;
      }
      else
      {
        formElemObj.EqualToVal = equalTo;
      }

      formElemObj.RecordsetName = fieldInfoObj.recordset;     
    }
    formElemStr = extPart.getInsertString("", "EditOp-FormElement", formElemObj, "");
    formElemStrArr.push(formElemStr);
  }
  
  return formElemStrArr;
}


//*-------------------------------------------------------------------
// FUNCTION:
//   wrapNamesWithSpaces
//
// DESCRIPTION:
//   this fn is needed for SQL statements,
//   names with spaces need brackets around them
//
// ARGUMENTS:
//   nameStr - the name to wrap
//
// RETURNS:
//   string - the wrapped name
//--------------------------------------------------------------------
function wrapNamesWithSpaces(nameStr){
  var hasSpaces = ( nameStr.indexOf(" ") != -1 );
  return (hasSpaces)? "[" + nameStr + "]" : nameStr;

}


//*-------------------------------------------------------------------
// FUNCTION:
//   browseFile
//
// DESCRIPTION:
//  Invokes dialog to allow user to select filename. Puts value in text input.
//  The optional flag stripParameters will remove anything after a question
//  mark if it is set to true
//
// ARGUMENTS:
//   fieldToStoreURL 
//   stripParameters - boolean flag to remove anything after a question
//   mark
//
// RETURNS:
//   string - the wrapped name
//--------------------------------------------------------------------
function browseFile(fieldToStoreURL, stripParameters) {
  var fileName = "";
  fileName = browseForFileURL();  //returns a local filename
  if (stripParameters) {
    var index = fileName.indexOf("?");
    if (index != -1) {
      fileName = fileName.substring(0,index);
    }
  }
  if (fileName) fieldToStoreURL.value = fileName;
}

//--------------------------------------------------------------------
// FUNCTION:
//   populateColumnGrid
//
// DESCRIPTION:
//   This function is called by updateUI function.  It is responsible
//   for populating the Column grid.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function populateColumnGrid()
{
  // clear additional column list
  // it lists columns that don't get populated in the grid, and needs to be cleared
  updateAdditionalColumnList('clear'); 
    
    // if there are no tables, then clear grid
  if ( !connectionHasBeenChosen() )
  {
    _ColumnNames.setAllRows(new Array(),new Array());
    return;
  }

  var colsAndTypes = MMDB.getColumnAndTypeOfTable(_ConnectionName.getValue(), _TableName.getValue());
  ColumnTypes = new Array();  // clear the column types map
  var rowTextArr = new Array();
  var rowValArr  = new Array();

  for (var i=0; i < colsAndTypes.length; i+=2)
  {
    ColumnTypes[colsAndTypes[i]] = colsAndTypes[i+1];
    
    if (EDIT_OP_TYPE == "Update") 
    {
      rowInfo = getRowTextAndValue(colsAndTypes[i], colsAndTypes[i+1], _RecordsetName.getValue(), _UniqueKeyColumn.getValue());
    } 
    else 
    {  
      // if Insert (and recordset menu does not exist)
      rowInfo = getRowTextAndValue(colsAndTypes[i],colsAndTypes[i+1]);
    }
    rowTextArr.push(rowInfo[0]);
    rowValArr.push(rowInfo[1]);
  }
 
  _ColumnNames.setAllRows(rowTextArr, rowValArr);
    
  // clear global field names array (used to check for dupe field names)
  STR_ELEMENT_NAMES = STR_DIVIDER;    
}

//--------------------------------------------------------------------
// FUNCTION:
//   checkForUnsupportedColumnTypes
//
// DESCRIPTION:
//   This function checks if all the columns are supported or not,
//   displaying a message
//
// ARGUMENTS:
//   Boolean - to display alert message or not
//
// RETURNS:
//   Nothing
//--------------------------------------------------------------------
function checkForUnsupportedColumnTypes(displayMsg)
{   
  // check for the colTypes to make sure we support them, if not
  // the flow is that they don't appear in the form fields grids,
  // But we do display a message saying that they are not displayed,
  // but the user can add them manually by clicking on the + button...
  var unsupportedColTypes = new Array();
  var unsupportedColNames = new Array();
  
  for(var i = 0; i < _ColumnNames.valueList.length; i++)
  {
    var rowInfoObj = _ColumnNames.valueList[i];
    if (rowInfoObj && rowInfoObj.colType)
    {
      if (!isColTypeSupported(rowInfoObj.colType))
      {
        unsupportedColTypes.push(rowInfoObj.colType);
        unsupportedColNames.push(rowInfoObj);
      }
    }
  }  
  
  if (unsupportedColTypes.length && unsupportedColNames.length)
  {
    if(displayMsg)
    {
      // Note: we use a setTimeout to alert the warning message to fix Mac bug
      //   #58368. Before this dialog is shown, the MM:Treecontrol is updated.
      //   After the update from the JS side is complete, we put up this alert.
      //   However, it appears the the updates to MM:Treecontrol force the dialog 
      //   to refresh, and this refresh continues after the alert dialog is up.
      //   The refresh takes the focus from the alert. Dreamweaver is then in
      //   a frozen state where the SB dialog has focus and the alert dialog is
      //   stuck behind it. By using setTimeout, the alert is not shown until the
      //   dialog is completely refreshed (we hope).
      var alertScript = "alert('" 
                      + dwscripts.sprintf(MM.Msg_UnsupportedColumnsInTable, unsupportedColTypes)
                      + "')";
      setTimeout(alertScript, 250);
    }
    for(var i = 0; i < unsupportedColNames.length; i++)
    {
      // select the row that is to be deleted...
      _ColumnNames.pickRowValue(unsupportedColNames[i]);
      deleteGridRow();    
    }
  }

}

//--------------------------------------------------------------------
// FUNCTION:
//   isColTypeSupported
//
// DESCRIPTION:
//   This function returns if the colType is supported by UD or not.
//
// ARGUMENTS:
//   colType - string - column type for update
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------
function isColTypeSupported(colType)
{
  var retVal = true;
  if (DB_UNSUPPORTED_COLUMNS_ENUM_MAP == null)
  {
    buildUnsupportedColumnsEnum();
  }
  
  var unsupportedCol = DB_UNSUPPORTED_COLUMNS_ENUM_MAP[colType.toLowerCase()]  
  if (unsupportedCol)
  {
    // col is not supported,,,
    retVal = false;
  }
  else
  {
    retVal = true;
  }   
  
  return retVal;  
}

//--------------------------------------------------------------------
// FUNCTION:
//   buildUnsupportedColumnsEnum
//
// DESCRIPTION:
//   This function returns if the colType is supported by UD or not.
//
// ARGUMENTS:
//   colType - string - column type for update
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------
function buildUnsupportedColumnsEnum()
{
    if (DB_UNSUPPORTED_COLUMNS_ENUM_MAP == null)
    {
      // TODO: read in from a configuration file
      var a = new Array();
      a["binary"] = 128; 
      a["varbinary"] = 204;
      a["longvarbinary"] = 204; 
      a["longbinary"] = 205; // matched to longvarbinary
                
      //oracle
      a["raw"]  = 204;// Match it to Binary
      a["nclob"]  = 204;//Match it to Binary
      a["bfile"]  = 204;//Match it to Binary
      a["ref cursor"] = 900; //Arbitrary ID Val
      a["refcursor"] = 900;
      // SQL Server 7
      a["image"]  =  204 ;// binary
      
      DB_UNSUPPORTED_COLUMNS_ENUM_MAP = a;
    }
}


//--------------------------------------------------------------------
// FUNCTION:
//   getRowTextAndValue
//
// DESCRIPTION:
//   This function returns the information for a row in the column table.
//
// ARGUMENTS:
//   colName - string - column name
//   colType - string - column type
//   rsName  - string - (optional) recordset name, only needed for update
//   uniqueColName - string - (optional) Unique Key Column, only needed
//                            for update
//
// RETURNS:
//   array of 2 values
//--------------------------------------------------------------------
function getRowTextAndValue(colName, colType, rsName, uniqueColName)
{
  var retVal = new Array(2);
  var colFieldType = "", colSubmitType = "", colSubmitName = "";
  
  var colLabel = getLabelFromColumnName(colName);
  
  var fieldName = getElementNameFromColumnName(colName);
  // if update, the unique key column should be a static text...
  if (EDIT_OP_TYPE == "Update" && colName == uniqueColName)
  {
    colFieldType = STATICTEXT;
  }
  else
  {
    // default to password display type if "password" appears in field name
    if (colName.toLowerCase().indexOf(PASSWORD) != -1)
    {
      colFieldType = PASSWORDFIELD;
    }
    else
    {
      colFieldType = getFieldTypeFromColumnType(colType);
    }
  }
  
  var colSubmitType = getSubmitTypeFromColumnType(colType);
  var colSubmitName = getSubmitNameFromSubmitType(colSubmitType);   
 
  var colDisplayAs = getFormFieldStorageObjectFromFormFieldType(colFieldType);
  
  // disable the _SubmitAs field if it is for the Primary Key column
  if (EDIT_OP_TYPE == "Update" && colName == uniqueColName)
  {
    UniqueColSubmitAs = colSubmitType;
    colSubmitType = "";  
    colSubmitName = "";
    toggleSubmitAs(false); // enable or disable Submit As Menu
    toggleLabelVisibility(colDisplayAs);    // enable or disable Label textfield
  }
  
  var rowText = colName + "|" + colLabel + "|" + colFieldType + "|" + colSubmitName;

  var rowValObj = new Object();  
  rowValObj.column = colName;
  rowValObj.label = colLabel;
  rowValObj.displayAs = colDisplayAs;
  rowValObj.submitAs = colSubmitType;
  rowValObj.fieldName = fieldName;
  rowValObj.defaultStr = "";
  rowValObj.passwordStr = "";
  rowValObj.colType = colType;
  
  // populate storage object with any default values
  if (EDIT_OP_TYPE == "Update" && rowValObj.displayAs.type != "passwordField")
  {
    var rs = (rsName)?rsName:_RecordsetName.getValue();
    rowValObj = populateFormFieldStorageType(rowValObj,rs,colName);
  }

  retVal[0] = rowText;
  retVal[1] = rowValObj;
            
  return retVal;
}

//--------------------------------------------------------------------
// FUNCTION:
//   getLabelFromColumnName
//
// DESCRIPTION:
//
// ARGUMENTS:
//
// RETURNS:
//   Nothing
//--------------------------------------------------------------------
function getLabelFromColumnName(colName)
{
  return colName.charAt(0).toUpperCase() + colName.substring(1) + MM.LABEL_Delimiter;      
}

//--------------------------------------------------------------------
// FUNCTION:
//   getElementNameFromColumnName
//
// DESCRIPTION:
//
// ARGUMENTS:
//   col - string - the column name to create an element name from
//
// RETURNS:
//   string -  the element name
//--------------------------------------------------------------------
function getElementNameFromColumnName(col)
{
  var elemName = col;
  var counter = 2;
  var divider = STR_DIVIDER;

  // replace spaces with underscores
  elemName = elemName.replace(/ /g, "_");
  
  // strip out all characters that are not alpha-numeric, or underscores
  elemName = elemName.replace(/[^a-zA-Z_0-9]/g, "");
  
  // don't allow the first character to be numeric
  while (parseInt(elemName.charAt(0)) &&
         parseInt(elemName.charAt(0)) == elemName.charAt(0) )
  {
    elemName = elemName.substring(1);
  }

  // in the unlikely case that no characters are left after the above,
  // then name element generically as "element"
  if (elemName.length == 0)
  {
    elemName = MM.LABEL_Element;
  }

  // ensure that name is not a dupe
  var tempName = elemName; 
  while (STR_ELEMENT_NAMES.indexOf(divider + elemName + divider) != -1)
  {
    elemName = tempName + counter++;
  }

  // add name to global names list
  STR_ELEMENT_NAMES += elemName + divider;

  return elemName;
}

//--------------------------------------------------------------------
// FUNCTION:
//   getFieldTypeFromColumnType
//
// DESCRIPTION:
//   This function returns the field type based on the given column type
//
// ARGUMENTS:
//   colType - string - the column type returned from MMDB
//
// RETURNS:
//   Nothing
//--------------------------------------------------------------------
function getFieldTypeFromColumnType(colType)
{
  return (dwscripts.isBooleanDBColumnType(colType)) ? CHECKBOX : TEXTFIELD;
}

//--------------------------------------------------------------------
// FUNCTION:
//   getSubmitTypeFromColumnType
//
// DESCRIPTION:
//   This function is called when the grid is populated, to choose a 
//   submit type based on the column type
//
//   Note: this function is used during initial population only.
//         getSubmitTypeBasedOnElementType() is used when the 
//         element type is changed
//
// ARGUMENTS:
//   colType - string - the column type returned from MMDB
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function getSubmitTypeFromColumnType(colType)
{
  var retVal = "";
  var colIsNumeric = dwscripts.isNumericDBColumnType(colType);
  var colIsDate    = dwscripts.isDateDBColumnType(colType);
  var colIsBoolean = dwscripts.isBooleanDBColumnType(colType);
  // added condition for currency...skarra
  var colIsCurrency = dwscripts.isCurrencyDBColumnType(colType);

  if ( colIsNumeric )
  {
    retVal = (colIsBoolean) ? CHECKBOX10 : NUMERIC;
  }
  else if ( colIsDate )
  {
    retVal = DATE;
  }
  else if (colIsCurrency)
  {
    retVal = NUMERIC;
  }
  else
  { // if text-based
    retVal = (colIsBoolean) ? CHECKBOXYN : TEXT;
  }
  
  return retVal;
}

//--------------------------------------------------------------------
// FUNCTION:
//   getSubmitTypeBasedOnElementType
//
// DESCRIPTION:
//   Called when the element type is changed, to update the submit type
//
// ARGUMENTS:
//   submitType - string - the current submit type
//   elemType - string - the current element type
//   colType - string - the current column type
//
// RETURNS:
//   Nothing
//--------------------------------------------------------------------
function getSubmitTypeBasedOnElementType(submitType, elemType, colType)
{
  var newSubmitType = submitType;
  
  // don't bother if conection hasn't been chosen
  if ( connectionHasBeenChosen() )
  {
    var colIsNumeric = dwscripts.isNumericDBColumnType(colType);
    var colIsDate    = dwscripts.isDateDBColumnType(colType);

    if ( elemType == CHECKBOX )
    { 
      // if display element is a checkbox
      if (colIsNumeric)
      {
        newSubmitType = CHECKBOX10;
      }
      else
      {
        newSubmitType = CHECKBOXYN;
      }
    }
    else
    { // display type does not equal checkbox

      // if submit type is currently a checkbox type,
      // then change it back to the most appropriate
      // non-checkbox type

      if (submitType==CHECKBOXYN    || submitType==CHECKBOX10 ||
          submitType==CHECKBOXNEG10 || submitType == CHECKBOXACCESS)
      {
        if (colIsNumeric)
        {
          newSubmitType = NUMERIC;
        }
        else if (colIsDate)
        {
          newSubmitType = DATE;
        }
        else
        {
          newSubmitType = TEXT;
        }
      }
    }
  }
  
  return newSubmitType;
}


//--------------------------------------------------------------------
// FUNCTION:
//   getSubmitNameFromSubmitType
//
// DESCRIPTION:
//   Returns the display string that should be used for the given
//   submit as type
//
// ARGUMENTS:
//   submitType - string - the comma separated list of submit values
//
// RETURNS:
//   string
//--------------------------------------------------------------------
function getSubmitNameFromSubmitType(submitType)
{
  var submitTypeLabels = _SubmitAs.get('all');
  var submitTypeValues = _SubmitAs.getValue('all');
  
  var submitName = "";
  
  var index = dwscripts.findInArray(submitTypeValues, submitType);
  if (index >= 0)
  {
    submitName = submitTypeLabels[index];
  }
  else
  {
    submitName = submitTypeLabels[0];
  }
  
  return submitName;
}

//--------------------------------------------------------------------
// FUNCTION:
//   getFormFieldStorageObjectFromFormFieldType
//
// DESCRIPTION:
//   This function returns a field storage object, based on the 
//   given field type.
//
// ARGUMENTS:
//   fieldType - string - the field type selected in the UI
//
// RETURNS:
//   object
//--------------------------------------------------------------------
function getFormFieldStorageObjectFromFormFieldType(fieldType)
{
  var retObj = "";

  if (fieldType == STATICTEXT)
  {
    retObj = new eoText();
  }
  else if (fieldType == TEXTFIELD)
  {
    retObj = new eoTextField();
  }
  else if (fieldType == HIDDENFIELD)
  {
    retObj = new eoHiddenField();
  }
  else if (fieldType == PASSWORDFIELD)
  {
    retObj = new eoPasswordField();
  }
  else if (fieldType == FILEFIELD)
  {
    retObj = new eoFileField();
  }
  else if (fieldType == TEXTAREA)
  {
    retObj = new eoTextArea();
  }
  else if (fieldType == MENU)
  {
    retObj = new eoMenu();
  }
  else if (fieldType == RADIOGROUP)
  {
    retObj = new eoRadioGroup();
  }
  else if (fieldType == CHECKBOX)
  {
    retObj = (EDIT_OP_TYPE == "Insert")?new eoCheckBox():new eoDynamicCheckBox();
  } 

  return retObj;
}

//--------------------------------------------------------------------
// FUNCTION:
//   displayGridFieldValues
//
// DESCRIPTION:
//   This function is called when the user clicks on a new row in the 
//   grid, changes the values of the UI fields to display the correct
//   information
//
// ARGUMENTS:
//   None
//
// RETURNS:
//   Nothing
//--------------------------------------------------------------------
function displayGridFieldValues()
{ 
  // don't bother if grid is empty -- needed because this fn is also
  // called when the connection or table changes
  if (_ColumnNames.list.length == 0)
  {
    _ElementLabel.value = "";
  }
  else
  {
    var currRowText = _ColumnNames.getRow();
    var currRowVal  = _ColumnNames.getRowValue();
    
    var rowTextTokens = getTokens(currRowText,"|");

    // TODO: this should be taken from the record, not the display
    _ElementLabel.value = rowTextTokens[1]; // update label field
    _DisplayAs.pickValue(rowTextTokens[2]); // update display menu

    // change UI at bottom of dialog, if relevent
    // for instance, if prior row had displayAs = Text, but this row has displayAs = Menu
    showDifferentParams(); 

    if (dwscripts.findDOMObject("SubmitAs")) 
    {
      _SubmitAs.pickValue(currRowVal.submitAs); // update submit menu
    }

    // fill in form parameters at bottom of UI
    // note that in the case of radio or menu, there is nothing to fill in
    switch (currRowVal.displayAs.type)
    {
    case "text":
      dwscripts.findDOMObject("Text").value = currRowVal.displayAs.text = currRowVal.defaultStr;
      break;
    case "textArea":
    case "textField":
    case "hiddenField":
    case "fileField":
      dwscripts.findDOMObject("SetValueTo").value = currRowVal.displayAs.value = currRowVal.defaultStr;
      break;
    case "passwordField":
      dwscripts.findDOMObject("SetValueTo").value = currRowVal.displayAs.value = currRowVal.passwordStr;
      break;
    case "checkBox": 
      // note: dwscripts.findDOMObject doesn't work with radios, so manual references are needed
      var InitialStateRadios = document.forms[0].InitialState;
      if ( currRowVal.displayAs.checked.toString() == "true")
      {
        InitialStateRadios[0].checked = true; InitialStateRadios[1].checked = false;
      }
      else
      {
        InitialStateRadios[0].checked = false; InitialStateRadios[1].checked = true;
      }
      break;

    case "dynamicCheckBox":
      dwscripts.findDOMObject("CheckIf").value = currRowVal.displayAs.checkIf;
      dwscripts.findDOMObject("EqualTo").value = currRowVal.displayAs.equalTo;
      break;

    case "default":
      break; 
    }
  }
}

//--------------------------------------------------------------------
// FUNCTION:
//   showDifferentParams
//
// DESCRIPTION:
//   This function shows form field specific parameters at the bottom
//   of the dialog for instance, shows "Menu Properties" button for 
//   menu, value field for textfield, etc
//
// ARGUMENTS:
//   displayDefaultStr - Column Name
//
// RETURNS:
//   Nothing
//--------------------------------------------------------------------
function showDifferentParams(displayDefaultStr)
{
  // don't bother if connection has not been chosen
  if ( connectionHasBeenChosen() )
  {
    //EnableDisableUpDownBtns();
    
    //EnableDisableAddDelBtns();
    
    var displayAs = _DisplayAs.getValue()?_DisplayAs.getValue():"none";
    var tables = domUIPieces.getElementsByTagName("TABLE"), param, i;
    var mmParamsTag = document.getElementsByTagName("mmParams").item(0);

    var rowInfoObj = _ColumnNames.getRowValue();
    if (EDIT_OP_TYPE == "Update" && rowInfoObj.fieldName == _UniqueKeyColumn.getValue())
    {
      toggleSubmitAs(false);
    }
    else
    {
      toggleSubmitAsVisibility(displayAs); // enable or disable Submit As Menu
      toggleLabelVisibility(displayAs);    // enable or disable Label textfield
    }

    if (displayAs == TEXTFIELD || displayAs == TEXTAREA || displayAs == HIDDENFIELD ||
      displayAs == PASSWORDFIELD || displayAs == FILEFIELD)
    {
      param = "textField";
    }
    else if (displayAs == STATICTEXT)
    {
      param = "text";
    }
    else if (displayAs == RADIOGROUP)
    {
      param = "radio";
    }
    else if (displayAs == MENU)
    {
      param = "menu";
    }
    else if (displayAs == CHECKBOX)
    {
      param = (EDIT_OP_TYPE == "Insert") ? "checkBox" : "dynamicCheckBox";
    }
    else if (displayAs == "none")
    {
      param = "none";
    }

    for (i=0;i<tables.length;i++)
    {
      if (tables[i].name && tables[i].name == param)
      {
        mmParamsTag.innerHTML = tables[i].innerHTML;
        
        // NOTE: This is call is very expensize.  It causes the entire dialog to be
        //       repaginated.  This function is called as the user clicks on different
        //       items in the columns tree control, so we need this to be quick.
        //       Instead, we will adjust the size of the dialog to be large enough
        //       to accomodate all the controls.
        
        // resize window to contents - otherwise top of dialog is clipped (added as bugfix) 
        //window.resizeToContents(); 
        
        break;
      }
    }
    // if display as equals text, text area, or text field, and the display as menu has
    // just been changed, then display the default text for this column
    if (displayDefaultStr)
    {
      var rowInfoObj = _ColumnNames.getRowValue();
      var defaultStr = _ColumnNames.getRowValue().defaultStr;
      var passwordStr = _ColumnNames.getRowValue().passwordStr;
      if ( displayAs == TEXTFIELD || displayAs == TEXTAREA ||
        displayAs == HIDDENFIELD || displayAs == FILEFIELD )
      {
        dwscripts.findDOMObject("SetValueTo").value = rowInfoObj.displayAs.value = defaultStr;  // set UI
      }
      else if ( displayAs == PASSWORDFIELD )
      {
        dwscripts.findDOMObject("SetValueTo").value = rowInfoObj.displayAs.value = passwordStr;    // set UI
      }
      else if ( displayAs == STATICTEXT )
      {
        dwscripts.findDOMObject("Text").value = rowInfoObj.displayAs.text = defaultStr;    // set UI
      }
      else if ( param == "dynamicCheckBox" )
      {
        dwscripts.findDOMObject("CheckIf").value = rowInfoObj.displayAs.checkIf = defaultStr;
      }
    }
  }
}

//--------------------------------------------------------------------
// FUNCTION:
//   addGridRow
//
// DESCRIPTION:
//   This function is called if there are columns not already 
//   displayed in the grid pop up the "Add Columns" dialog, and allow
//   the user to add them
//
// ARGUMENTS:
//   None
//
// RETURNS:
//   Nothing
//--------------------------------------------------------------------
function addGridRow()
{
  // check to see if there are columns to add first
  if (ColumnsToAdd.length == 0)
  {
    alert(MM.MSG_NoMoreColumnsToAdd);
    return;
  }
  var addedCols = dwscripts.callCommand("Add Column.htm", ColumnsToAdd);
  if (!addedCols) return; // user clicked Cancel
  var nCols = addedCols.length,i, currCol, rowInfoArr;

  for (i=0;i<nCols;i++)
  {
    currCol = addedCols[i];
    rowInfoArr = getRowTextAndValue(currCol,ColumnTypes[currCol]);
    _ColumnNames.addRow(rowInfoArr[0],rowInfoArr[1]);
    updateAdditionalColumnList('del',currCol);
  }
}

//--------------------------------------------------------------------
// FUNCTION:
//   deleteGridRow
//
// DESCRIPTION:
//   This function is called when the user clicks the "-" image button
//
// ARGUMENTS:
//  None
//
// RETURNS:
//   Nothing
//--------------------------------------------------------------------
function deleteGridRow()
{
  var currRow = _ColumnNames.getRow();
  var currCol = currRow.substring(0,currRow.indexOf("|") );
  var nRows = _ColumnNames.list.length;

  if (nRows > 1)
  {
    updateAdditionalColumnList('add',currCol);
    _ColumnNames.delRow();
    displayGridFieldValues(); 
  }
  else
  {
    alert(MM.MSG_NeedOneColumnInList);
  }
}

//--------------------------------------------------------------------
// FUNCTION:
//   updateGridRow
//
// DESCRIPTION:
//   This function is called whenever the label, submitAs, or displayAs
//   fields are edited updates both the actual text display in the grid, 
//   and the object that stores the information about the display
//
// ARGUMENTS:
//   whichColumn: the parameter which has been edited -- displayAs, 
//   submitAs, or label
//
// RETURNS:
//   Nothing
//--------------------------------------------------------------------
function updateGridRow(whichColumn)
{
  // check that connection has been chosen before proceeding
  if ( !connectionHasBeenChosen() )
  {
    alert( MM.MSG_NoDataSourceSelected );
    // _DisplayAs.setIndex(0); // set display menu back to first item
    return;
  }

  var currRowObj  = _ColumnNames.getRowValue();
  var currRowText = _ColumnNames.getRow();
  var currColName = currRowText.substring(  0,currRowText.indexOf("|")  );

  // update grid row text
  var newRowText = currColName + "|" + _ElementLabel.value + "|" + _DisplayAs.get() + "|"; 
  newRowText += (dwscripts.findDOMObject("SubmitAs")) ? _SubmitAs.get() : "";
  _ColumnNames.setRow(newRowText);

  // update object that stores information about grid row
  // this object is stored in a value attribute of the Grid object
  // these objects are stored in an array: GridObj.valueList

  switch (whichColumn)
  {
  case "label":
    currRowObj.label = _ElementLabel.value;
    break;

  case "submitAs":
    currRowObj.submitAs = _SubmitAs.getValue();
    break;

  case "displayAs": 
    currRowObj.displayAs = getFormFieldStorageObjectFromFormFieldType(_DisplayAs.getValue());
    // need to update submit property, because changing displayAs menu can
    // auto-change submit type
    if ( dwscripts.findDOMObject("SubmitAs") )
    {
      currRowObj.submitAs = _SubmitAs.getValue();
    }

    var defaultStr = currRowObj.defaultStr;
    var passwordStr = currRowObj.passwordStr;
    var fieldType = currRowObj.displayAs.type;

    if ( fieldType == "textField"  || fieldType == "hiddenField" || 
      fieldType == "fileField"  ||  fieldType == "textArea" )
    {
      currRowObj.displayAs.value = defaultStr;
    }
    else if ( fieldType == "passwordField")
    {
      currRowObj.displayAs.value = passwordStr;          
    }
    else if ( fieldType == "text")
    {
      currRowObj.displayAs.text = defaultStr;
    }
    else if ( fieldType == "menu")
    {
      currRowObj.displayAs.defaultSelected = defaultStr;
    }
    else if ( fieldType == "radioGroup")
    {
      currRowObj.displayAs.defaultChecked = defaultStr;
    }
    else if (fieldType == "dynamicCheckBox")
    {
      currRowObj.displayAs.checkIf = defaultStr;
    }
    break;

  default:
    break;
  }
}

//--------------------------------------------------------------------
// FUNCTION:
//   popUpFormFieldPropertiesDialog
//
// DESCRIPTION:
//   It pops up the Radio or Menu Properties dialog, and passes in the 
//   current menu/radio storage object so that the dialog can be 
//   initialized correctly
//
// ARGUMENTS:
//   whichOne - String that can be "Radio" or "Menu"
//
// RETURNS:
//   Nothing
//--------------------------------------------------------------------
function popUpFormFieldPropertiesDialog(whichOne)
{
  var commandFileName = "ServerObject-" + whichOne + "Props.htm";
  var rowObj = _ColumnNames.getRowValue();
  var fieldInfoObj = dwscripts.callCommand(commandFileName,rowObj.displayAs)


  // note: use the "type" property on the menuInfoObj to see which
    // type of object was returned
    if (fieldInfoObj)
  {
    rowObj.displayAs = fieldInfoObj;
  }
}

//--------------------------------------------------------------------
// FUNCTION:
//   updateAdditionalColumnList
//
// DESCRIPTION:
//   The + button calls up an Add Columns dialog, allowing
//   the user to add additional columns to the list. When the Add Columns
//   dialog is called, it is populated with the "additional columns list".
//   This list is updated when a user adds or deletes a column from the UI.
//
// ARGUMENTS:
//   action - Action argument that can Add, Del or Clear
//   col    - Column
//
// RETURNS:
//   Nothing
//--------------------------------------------------------------------
function updateAdditionalColumnList(action, col)
{
  if (action == 'add')
  {
    ColumnsToAdd.push(col);
  }
  else if ( action == 'clear')
  {
    ColumnsToAdd = new Array();
  }
  else
  { // delete an item from additional column list
    for (var i=0; i < ColumnsToAdd.length; i++)
    {
      if (ColumnsToAdd[i] == col)
      {
        ColumnsToAdd.splice(i,1);
        break;
      }
    }
  }
}

//--------------------------------------------------------------------
// FUNCTION:
//   connectionHasBeenChosen
//
// DESCRIPTION:
//   This function is called when the grid is populated, to choose a 
//   submit type based on the column type
//
// ARGUMENTS:
//   None
//
// RETURNS:
//   Nothing
//--------------------------------------------------------------------
function connectionHasBeenChosen()
{
  return (_ConnectionName.getValue());
}

/*
//--------------------------------------------------------------------
// FUNCTION:
//   setFieldsAndColumns
//
// DESCRIPTION:
//   This function is called when the grid is populated, to choose a 
//   submit type based on the column type
//
// ARGUMENTS:
//   paramObj - 
//
// RETURNS:
//   Nothing
//--------------------------------------------------------------------
function setFieldsAndColumns(paramObj) {
  var colInfoObjs = _ColumnNames.valueList, nCols = colInfoObjs.length, i, currObj;
  var fieldsStr = "",columnsStr = "", submitType;
  
  // create mini-lookup table
  var lookupTable = new Object();
  lookupTable[TEXT]          = "',none,''";
  lookupTable[NUMERIC]       = "none,none,NULL";
  lookupTable[DATE]          = "',none,NULL";
  lookupTable[DATEMSACCESS]  = "#,none,NULL";
  lookupTable[CHECKBOXYN]    = "none,'Y','N'";
  lookupTable[CHECKBOX10]    = "none,1,0";
  lookupTable[CHECKBOXNEG10] = "none,-1,0";
  lookupTable[CHECKBOXACCESS]= "none,Yes,No";
  
  for (i=0;i<nCols;i++)
  {
    currObj = colInfoObjs[i];
    if (currObj.displayAs.type != "text"){ // if a form element
      submitType = currObj.submitAs;  
      fieldsStr += currObj.fieldName + "|value|";
      columnsStr += wrapNamesWithSpaces(currObj.column) + "|" + lookupTable[submitType] + "|";
    }
  }
  
  // remove last separators
  fieldsStr = fieldsStr.substring(0,fieldsStr.length-1);
  columnsStr = columnsStr.substring(0,columnsStr.length-1);
  
  if (dw.getDocumentDOM() != null && 
      dw.getDocumentDOM().serverModel.getServerName() == "Cold Fusion") {
    fieldsStr = fieldsStr.replace(/#/g,"##");
    columnsStr = columnsStr.replace(/#/g,"##");      
  }
  
  paramObj.fieldsStr = fieldsStr;
  paramObj.columnsStr = columnsStr;
}
*/

//--------------------------------------------------------------------
// FUNCTION:
//   checkThatCursorIsNotInsideOfAForm
//
// DESCRIPTION:
//   Before inserting a form, check that cursor is not inside of 
//   an existing form. If it is, set IP location to be just after the form
//
// ARGUMENTS:
//   None
//
// RETURNS:
//   Nothing
//--------------------------------------------------------------------
function checkThatCursorIsNotInsideOfAForm()
{
  var dom = dw.getDocumentDOM();
  var formNode = findForm(dom);

  if (formNode)
  { // if inside of a form tag
    formArr = dom.nodeToOffsets(formNode);
    dom.setSelection(formArr[1]+1,formArr[1]+1);
  }
}

//--------------------------------------------------------------------
// FUNCTION:
//   findForm
//
// DESCRIPTION:
//   Before inserting a form, check that cursor is not inside of 
//   an existing form. If it is, set IP location to be just after the form
//
// ARGUMENTS:
//   dom - DOM object
//
// RETURNS:
//   formObj
//--------------------------------------------------------------------
function findForm(dom)
{
  var formObj="";
  var selArr = dom.getSelection();
  var selObj = dom.offsetsToNode(selArr[0],selArr[1]);

  while (formObj=="" && selObj.parentNode)
  {
    if (selObj.nodeType == Node.ELEMENT_NODE && selObj.tagName=="FORM")
      formObj=selObj;
    else
      selObj = selObj.parentNode;
  }

  return formObj;
}

//--------------------------------------------------------------------
// FUNCTION:
//   toggleSubmitAsVisibility
//
// DESCRIPTION:
//   toggles the visibility of "Submit As: [menu]" that appears on 
//   the UI.  This menu should be visible for all items except text
//
// ARGUMENTS:
//   displayAs
//
// RETURNS:
//   Nothing
//--------------------------------------------------------------------
function toggleSubmitAsVisibility(displayAs)
{
  var currentVal = _SubmitAs.getValue();
  if ( displayAs != STATICTEXT && (currentVal == " " || !currentVal))
  { // if any form field is chosen in displayAs menu
    _SubmitAs.enable();
    _SubmitAs.del();
    var submitType = getSubmitTypeFromColumnType(ColumnTypes[_ColumnNames.getRowValue().column]);
    _SubmitAs.pickValue(submitType);
  }
  else if (displayAs == STATICTEXT)
  { // if plain text was chosen in displayAs menu
    _SubmitAs.append(" ");
    _SubmitAs.disable();
  }
}

//--------------------------------------------------------------------
// FUNCTION:
//   toggleLabelVisibility
//
// DESCRIPTION:
//   toggles the visibility of "Label: [textfield]" that appears on
//   the UI.  This textfield should be visible for all items except 
//   hidden fields
//
// ARGUMENTS:
//   displayAs
//
// RETURNS:
//   Nothing
//--------------------------------------------------------------------
function toggleLabelVisibility(displayAs)
{
  var labelFieldIsVisible = !( _ElementLabel.disabled == "true");

  if (displayAs != HIDDENFIELD && !labelFieldIsVisible)
  { // if non-hidden field & non-visible label field
    _ElementLabel.removeAttribute("disabled")                     // then make label field visible
      _ElementLabel.setAttribute("value",_ColumnNames.getRowValue().label); // and set value of it 

  }
  else if (displayAs == HIDDENFIELD && labelFieldIsVisible)
  {  // if hidden field
    _ElementLabel.setAttribute("value","");                          // then set value field to empty string
    _ElementLabel.setAttribute("disabled","true");                   // and make it non-editable
  }
}

//--------------------------------------------------------------------
// FUNCTION:
//   toggleSubmitAs
//
// DESCRIPTION:
//   toggles the visibility of "Submit As: [menu]" that appears on 
//   the UI.  This menu is disabled in case of Update form and if
//   it is a primary key column
//
// ARGUMENTS:
//   show - boolean 
//
// RETURNS:
//   Nothing
//--------------------------------------------------------------------
function toggleSubmitAs(bShow)
{
  if (bShow)
  { 
    _SubmitAs.enabled();
  }
  else
  {
    _SubmitAs.append(" ");
    _SubmitAs.disable();
  }
}

//--------------------------------------------------------------------
// FUNCTION:
//   EnableDisableUpDownBtns
//
// DESCRIPTION:
//   Enable/disables the elemUp and elemDown buttons
//
// ARGUMENTS:
//   None
//
// RETURNS:
//   Nothing
//--------------------------------------------------------------------
function EnableDisableUpDownBtns()
{
  // Check if there are any columns
  if (_ColumnNames.list.length == 0 || _ColumnNames.getRowIndex() == -1)
  {
    _ElemUp.setAttribute("disabled", true);
    _ElemUp.src = "../Shared/MM/Images/btnUp_dis.gif";   
    
    _ElemDown.setAttribute("disabled", true);
    _ElemDown.src = "../Shared/MM/Images/btnDown_dis.gif";        
  }
  else
  {
    if(_ColumnNames.list.length == 1)
      {
      // first row, so disable the up and down buttons
      _ElemDown.setAttribute("disabled", true);
      _ElemDown.src = "../Shared/MM/Images/btnDown_dis.gif";

      _ElemUp.setAttribute("disabled", true);
      _ElemUp.src = "../Shared/MM/Images/btnUp_dis.gif";
    }  
    if(_ColumnNames.list.length-1 == _ColumnNames.getRowIndex())
    {
      // last row, so disable the down button and enable the up button
      _ElemDown.setAttribute("disabled", true);
      _ElemDown.src = "../Shared/MM/Images/btnDown_dis.gif";
            
      _ElemUp.setAttribute("disabled", false);
      _ElemUp.src = "../Shared/MM/Images/btnUp.gif";
    }
    // first row, if it is disable up button and enable the down button
    else if (_ColumnNames.getRowIndex() == 0)
    {
      _ElemUp.setAttribute("disabled", true);
      _ElemUp.src = "../Shared/MM/Images/btnUp_dis.gif";
      
      _ElemDown.setAttribute("disabled", false);
      _ElemDown.src = "../Shared/MM/Images/btnDown.gif";      
    }    
    else
    {
      //enable both up and down buttons
      _ElemDown.setAttribute("disabled", false);
      _ElemDown.src = "../Shared/MM/Images/btnDown.gif";
            
      _ElemUp.setAttribute("disabled", false);
      _ElemUp.src = "../Shared/MM/Images/btnUp.gif";      
    }
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   EnableDisableAddDelBtns
//
// DESCRIPTION:
//   Enable/disables the elemAdd and elemDel buttons
//
// ARGUMENTS:
//   None
//
// RETURNS:
//   Nothing
//--------------------------------------------------------------------
function EnableDisableAddDelBtns()
{
  // Check if there are any columns
  if (_ColumnNames.list.length == 0 || _ColumnNames.getRowIndex() == -1)
  {
    _ElemAdd.setAttribute("disabled", true);
    _ElemAdd.src = "../Shared/MM/Images/btnAdd_dis.gif";   
    
    _ElemDel.setAttribute("disabled", true);
    _ElemDel.src = "../Shared/MM/Images/btnDel_dis.gif";        
  }
  else
  {
    if (ColumnsToAdd.length == 0)
    {
      // no columns to add, so disable add button and enable delete button
      _ElemAdd.setAttribute("disabled", true);
      _ElemAdd.src = "../Shared/MM/Images/btnAdd_dis.gif"; 
      
      _ElemDel.setAttribute("disabled", false);
      _ElemDel.src = "../Shared/MM/Images/btnDel.gif";            
    }
    else
    {
      // enable both add and delete buttons
      _ElemAdd.setAttribute("disabled", false);
      _ElemAdd.src = "../Shared/MM/Images/btnAdd.gif"; 
    
      _ElemDel.setAttribute("disabled", false);
      _ElemDel.src = "../Shared/MM/Images/btnDel.gif";                
    }
  }
}

//--------------------------------------------------------------------
// FUNCTION:
//   displayDynamicDataDialog
//
// DESCRIPTION:
//   pops up the dialog allowing the user to choose dynamic data
//
// ARGUMENTS:
//   textFieldObj
//
// RETURNS:
//   Nothing
//--------------------------------------------------------------------
function displayDynamicDataDialog(textFieldObj)
{
  var serverModel = dw.getDocumentDOM().serverModel.getServerName();
  var expression = dw.showDynamicDataDialog(textFieldObj.value);

  if (expression)
  {
//    if (serverModel == "Cold Fusion")
//    {
//      expression = dwscripts.stripCFOutputTags(expression);
//    }
    textFieldObj.value = expression;
  }
}




//--------------------------------------------------------------------
// FUNCTION:
//   populateFormFieldStorageType
//
// DESCRIPTION:
//   This function is called by updateUI function.  It is responsible
//   for populating the Column grid.
//
// ARGUMENTS:
//   rowValObj - Column Name
//   rsName - Column Type
//   colName  - Recordset Name
//
// RETURNS:
//   Array
//--------------------------------------------------------------------
function populateFormFieldStorageType(rowValObj, rsName, colName)
{
  // note: this fn is only called when the row is first created, which is why
  // it only lists some of the available form types
  var displayType = rowValObj.displayAs.type;
  var dynDataVal = createDynamicData(rsName,colName);
  
  rowValObj.defaultStr = dynDataVal;

  if (displayType == "textField" || 
      displayType  == "textArea" || 
      displayType  == "hiddenField" )
  {
    rowValObj.displayAs.value = dynDataVal;
  }
  else if (displayType == "text" )
  {
    rowValObj.displayAs.text = dynDataVal;
  }
  else if (displayType == "dynamicCheckBox")
  {
    rowValObj.displayAs.checkIf = dynDataVal;
  }

  return rowValObj;
}


//--------------------------------------------------------------------
// FUNCTION:
//   createDynamicData
//
// DESCRIPTION:
//   Pops up the dialog allowing the user to choose dynamic data
//
// ARGUMENTS:
//   rs - Recordset
//   col - Column Name
//
// RETURNS:
//   String
//--------------------------------------------------------------------
function createDynamicData(rs,col)
{
  var retVal = "";
  if (rs){
    var colArray = dwscripts.getFieldNames(rs);
    if (dwscripts.findInArray(colArray, col) != -1){
      var paramObj = new Object();
      paramObj.sourceName = rs;
      paramObj.bindingName = col;

      retVal = extPart.getInsertString("", "Recordset_DataRef", paramObj);
    }
  }
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   updateDefaultFormFieldValues
//
// DESCRIPTION:
//   Goes through the default values, and replace references to the old
//   recordset with the new recordset
//
// ARGUMENTS:
//   oldRS - old Recordset
//   newRS - new Recordset
//
// RETURNS:
//   Nothing
//--------------------------------------------------------------------
function updateDefaultFormFieldValues(oldRS, newRS)
{
  var rowObjs = _ColumnNames.valueList;
  var nRows = rowObjs.length, i, fieldType, currRowObj, regExp;

  for (i=0;i<nRows;i++)
  {
    currRowObj = rowObjs[i];
    regExp = new RegExp(oldRS,"g");
    currRowObj.defaultStr = currRowObj.defaultStr.toString().replace(regExp,newRS);
    currRowObj.passwordStr = currRowObj.passwordStr.toString().replace(regExp,newRS);

    // update the current display
    switch(currRowObj.displayAs.type)
    {
      case "textField":
      case "textArea":
      case "hiddenField":
        currRowObj.displayAs.value = currRowObj.defaultStr;
        break;
      case "passwordField":
        currRowObj.passwordField.value = currRowObj.passwordStr;
        break;
      case "text":
        currRowObj.displayAs.text = currRowObj.defaultStr;
        break;
      case "radioGroup":
      case "dynamicRadioGroup":
        currRowObj.displayAs.defaultChecked = currRowObj.defaultStr;
        break;
      case "menu":
      case "dynamicMenu":
        currRowObj.displayAs.defaultSelected = currRowObj.defaultStr;
        break;
      case "dynamicCheckBox":
        currRowObj.displayAs.checkIf = currRowObj.defaultStr;
        break;
      case "default":
        break;  
    }
  } 

}


//--------------------------------------------------------------------
// FUNCTION:
//   getRedirectURL
//
// DESCRIPTION:
//   Returns the given URL with a query string added or removed, based
//   on the includeQuery boolean
//
// ARGUMENTS:
//   origURL - string - the URL to update
//   includeQuery - boolean - true to add the query string, false to
//     remove it.
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function getRedirectURL(origURL, includeQuery)
{
  var retVal = origURL;
  
  if (includeQuery)
  {
    if (!origURL)
    {
      retVal = "#CurrentPage#?#CGI.QUERY_STRING#";
    }
    else
    {
      if (origURL.indexOf("?") == -1)
      {
        retVal += "?#CGI.QUERY_STRING#";
      }
      else
      {
        retVal += "&#CGI.QUERY_STRING#";
      }
    }
  }
  else
  {
    var regExp = /[?&]#CGI\.QUERY_STRING#/i;
    var match = origURL.match(regExp);
    if (match && match.length > 0)
    {
      var endOffset = match.index + match[0].length;
      if (endOffset == origURL.length)
      {
        retVal = origURL.substring(0,match.index);
      }
      else
      {
        retVal = origURL.substring(0,match.index+1) + origURL.substring(match.index + match[0].length + 1);
      }
    }
  }
  
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   hasQueryString
//
// DESCRIPTION:
//   Returns true if the given URL has the query string added
//
// ARGUMENTS:
//   redirectURL - string - the URL to check
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function hasQueryString(redirectURL)
{
  var retVal = false;
  
  var regExp = /[?&]#CGI\.QUERY_STRING#/i;
  
  retVal = (redirectURL.search(regExp) != -1);

  return retVal;
}


