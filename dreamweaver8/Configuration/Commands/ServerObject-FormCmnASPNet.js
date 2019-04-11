// Copyright 2002, 2003 Macromedia, Inc. All rights reserved.
    
//**********************GLOBAL VARS********************

var TEXTFIELD		=  MM.LABEL_TextField;
var HIDDENFIELD		=  MM.LABEL_HiddenField;
var PASSWORDFIELD	=  MM.LABEL_PasswordField;
var PASSWORD		=  MM.LABEL_Password;
var FILEFIELD		=  MM.LABEL_FileField;
var TEXTAREA		=  MM.LABEL_TextArea;
var MENU			=  MM.LABEL_Menu;
var CHECKBOX		=  MM.LABEL_CheckBox;
var RADIOGROUP		=  MM.LABEL_RadioGroup;
var STATICTEXT		=  MM.LABEL_Text;

var STR_DIVIDER = "* *";
var STR_ELEMENT_NAMES = STR_DIVIDER;

var DB_UNSUPPORTED_COLUMNS_ENUM_MAP = null;

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
  var nRows = rowInfoArr.length;
  var formElemStrArr = new Array();

  for (var i = 0; i < nRows; i++)
  {
    var currRowInfoObj = rowInfoArr[i];
    var fieldInfoObj = currRowInfoObj.displayAs; 
    
	fieldInfoObj.fieldName = currRowInfoObj.fieldName;
	
	var fieldLabel = currRowInfoObj.label;    
    var fieldVal = fieldInfoObj.value;         
    var fieldType = fieldInfoObj.type;
    
    var formElemObj = new Object();    
    
	formElemObj.ElementName = fieldInfoObj.fieldName;
    formElemObj.ElementType = fieldType.toLowerCase();
    formElemObj.ElementValue = fieldVal;
    formElemObj.ElementLabel = fieldLabel;
    formElemObj.EqualToVal = "";
    formElemObj.UseWebFormControl = currRowInfoObj.useWebFormControl;

    if (fieldType == "text")
    {
      formElemObj.ElementValue = fieldInfoObj.text;
    }
    else if (fieldType == "checkBox")
    {
      if (fieldInfoObj.checked)
	  {
        formElemObj.ElementChecked = "checked";
		formElemObj.CheckedState = "true";
      }
	  else
      {
	    formElemObj.ElementChecked = "";
	    formElemObj.CheckedState = "false";
      }
    }
    else if (fieldType == "dynamicCheckBox")
    {  
      if (fieldInfoObj.checkIf)
      {
        var trueValue = fieldInfoObj.equalTo;

		// Add quotes if none

		if ((trueValue.charAt(0) != "'") && (trueValue.charAt(0) != '"'))
		{
		  trueValue = '"' + trueValue + '"';
		}

	    var checkIf = fieldInfoObj.checkIf;

		// If the conditional is surrounded by script tags, remove them

		var re = /<%#\s*([\s\S]+)\s*%>/ig
        var attrib;

        while ((attrib = re.exec(checkIf)) != null)
        {
          checkIf = checkIf.replace(attrib[0], attrib[1]);
        }

        checkIf = "(" + dwscripts.getEqualsStatement(checkIf, trueValue) + ")";

        formElemObj.ElementValue = trueValue;
        formElemObj.ElementChecked = "<%# " + dwscripts.getTernaryStatement(checkIf, "\"checked\"", "\"\"") + " %>";
        formElemObj.CheckedState = "<%# " + dwscripts.getTernaryStatement(checkIf, "true", "false") + " %>";
      }
	  else
	  {
	    formElemObj.ElementChecked = "";
        formElemObj.CheckedState = "false";
      }
    }
    else if (fieldType == "menu")
    {
      var nOptions = fieldInfoObj.textArr.length;
      var defaultSelected = fieldInfoObj.defaultSelected;
      
      // If the selected value code is surrounded by script tags, remove them
      // If it's not, then make sure it's surrounded by quotes.

	  var re = /<%#\s*([\s\S]+)\s*%>/ig
      var attrib = re.exec(defaultSelected);

      if (attrib != null)
      {
        do
		{
		  defaultSelected = defaultSelected.replace(attrib[0], attrib[1]);
		}
		while (attrib == re.exec(defaultSelected));
      }
      else if (defaultSelected.charAt(0) != '"')
      {
	    defaultSelected = "\"" + defaultSelected + "\"";
      }

	  // Replace instances of "Container" with null

	  defaultSelected = defaultSelected.replace(/Container/g, dwscripts.getNullToken());

      if (!nOptions) 
      {
         var labelText = "[ " + MM.LABEL_Label + " ]";

         fieldInfoObj.textArr = new Array(labelText, labelText);
         fieldInfoObj.valArr   = new Array("menuitem1","menuitem2");
         nOptions = 2;
      }      
      
      formElemObj.OptionText = fieldInfoObj.textArr;
      formElemObj.OptionValue = fieldInfoObj.valArr;
      formElemObj.SelectedValue = defaultSelected;

      // This logic checks if the selected field is same as the value,
      // if so marks it as selected, otherwise adds an empty string.
      // this logic is required because all the arrays should be of same
      // length for loop in edml file

      var optionSelectedArr = new Array();

      for (var j = 0; j < nOptions; j++)
      {
        if (fieldInfoObj.valArr[j] && defaultSelected)
        {
          var selObj = new Object;

          selObj.DefaultSelected = defaultSelected;
          selObj.ItemValue = fieldInfoObj.valArr[j];

          // If ItemValue doesn't have quotes, add them

		  if (selObj.ItemValue.charAt(0) != '"')
		  {
		    selObj.ItemValue = "\"" + selObj.ItemValue + "\"";
		  }

		  optionSelectedArr.push(extPart.getInsertString("", "Menu_OptionSelected", selObj, ""));
        }
		else
        {
          optionSelectedArr.push("");
        }
      }

      formElemObj.OptionSelected = optionSelectedArr;
    }
    else if (fieldType == "radioGroup")
    {
      var nButtons = fieldInfoObj.labelArr.length;
      var defaultChecked = fieldInfoObj.defaultChecked;
      
      // If the selected value code is surrounded by script tags, remove them
      // If it's not, then make sure it's surrounded by quotes.

	  var re = /<%#\s*([\s\S]+)\s*%>/ig
      var attrib = re.exec(defaultChecked);

      if (attrib != null)
      {
        do
		{
		  defaultChecked = defaultChecked.replace(attrib[0], attrib[1]);
		}
		while (attrib == re.exec(defaultChecked));
      }
      else if (defaultChecked.charAt(0) != '"')
      {
	    defaultChecked = "\"" + defaultChecked + "\"";
      }

	  // Replace instances of "Container" with null

	  defaultChecked = defaultChecked.replace(/Container/g, dwscripts.getNullToken());

      if (!nButtons) 
      {
         var labelText = "[ " + MM.LABEL_Label + " ]";

         fieldInfoObj.labelArr = new Array(labelText, labelText);
         fieldInfoObj.valArr   = new Array("radiobutton1","radiobutton2");
         nButtons = 2;
      }
      
      formElemObj.OptionText = fieldInfoObj.labelArr;
      formElemObj.OptionValue = fieldInfoObj.valArr;
      formElemObj.SelectedValue = defaultChecked;

      // This logic checks if the selected field is same as the value,
      // if so marks it as selected, otherwise adds an empty string.
      // this logic is required because all the arrays should be of same
      // length for loop in edml file

      var optionSelectedArr = new Array();

      for (var j = 0; j < nButtons; j++)
      {
        if (fieldInfoObj.valArr[j] && defaultChecked)
        {
          var selObj = new Object;

          selObj.DefaultChecked = defaultChecked;
          selObj.ItemValue = fieldInfoObj.valArr[j];

          // If ItemValue doesn't have quotes, add them

		  if (selObj.ItemValue.charAt(0) != '"')
		  {
		    selObj.ItemValue = "\"" + selObj.ItemValue + "\"";
		  }

          optionSelectedArr.push(extPart.getInsertString("", "Radio_OptionChecked", selObj, ""));
        }
		else
        {
          optionSelectedArr.push("\"FALSE\"");
        }
      }

      formElemObj.OptionSelected = optionSelectedArr;
    }
    else if (fieldType == "dynamicMenu")
    {
      var defaultSelected = fieldInfoObj.defaultSelected;
      
      // If the selected value code is surrounded by script tags, remove them
      // If it's not, then make sure it's surrounded by quotes.

	  var re = /<%#\s*([\s\S]+)\s*%>/ig
      var attrib = re.exec(defaultSelected);

      if (attrib != null)
      {
        do
		{
		  defaultSelected = defaultSelected.replace(attrib[0], attrib[1]);
		}
		while (attrib == re.exec(defaultSelected));
      }
      else if (defaultSelected.charAt(0) != '"')
      {
	    defaultSelected = "\"" + defaultSelected + "\"";
      }

	  // Replace instances of "Container" with null

	  defaultSelected = defaultSelected.replace(/Container/g, dwscripts.getNullToken());

      formElemObj.DynOptionText = fieldInfoObj.textCol;
      formElemObj.DynOptionValue = fieldInfoObj.valCol;

      var selObj = new Object;

      selObj.DefaultSelected = defaultSelected;
      selObj.ItemValue = dwscripts.sprintf("%s.FieldValue(\"%s\", Container)", fieldInfoObj.recordset, fieldInfoObj.valCol);

      formElemObj.DynOptionSelected = extPart.getInsertString("", "Menu_OptionSelected", selObj, "");
      formElemObj.RecordsetName = fieldInfoObj.recordset;
	  formElemObj.SelectedValue = defaultSelected;
    }
    else if (fieldType == "dynamicRadioGroup")
    {
      var defaultChecked = fieldInfoObj.defaultChecked;
      
      // If the selected value code is surrounded by script tags, remove them
      // If it's not, then make sure it's surrounded by quotes.

	  var re = /<%#\s*([\s\S]+)\s*%>/ig
      var attrib = re.exec(defaultChecked);

      if (attrib != null)
      {
        do
		{
		  defaultChecked = defaultChecked.replace(attrib[0], attrib[1]);
		}
		while (attrib == re.exec(defaultChecked));
      }
      else if (defaultChecked.charAt(0) != '"')
      {
	    defaultChecked = "\"" + defaultChecked + "\"";
      }

	  // Replace instances of "Container" with null

	  defaultChecked = defaultChecked.replace(/Container/g, dwscripts.getNullToken());

      formElemObj.DynOptionText = fieldInfoObj.labelCol;
      formElemObj.DynOptionValue = fieldInfoObj.valCol;

      var selObj = new Object;

      selObj.DefaultChecked = defaultChecked;
      selObj.ItemValue = dwscripts.sprintf("%s.FieldValue(\"%s\", Container)", fieldInfoObj.recordset, fieldInfoObj.valCol);

      formElemObj.DynOptionSelected = extPart.getInsertString("", "Radio_OptionChecked", selObj, "");
      formElemObj.RecordsetName = fieldInfoObj.recordset;
	  formElemObj.SelectedValue = defaultChecked;
    }

	//  There is some conditional logic in the downstream edml files that must check
	//  the length of the SelectedValue.  Because the conditional edml system must always
	//  find some value for elements it uses within conditions, we have to be sure something
	//  is always set.

	formElemObj.SelectedValue = formElemObj.SelectedValue ? formElemObj.SelectedValue : "";

    formElemStrArr.push(extPart.getInsertString("", "EditOp-FormElement", formElemObj, ""));
  }
  
  return formElemStrArr;
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
  
  if (!connectionHasBeenChosen())
  {
    _ColumnNames.setAllRows(new Array(), new Array());
    return;
  }

  //var colsAndTypes = MMDB.getColumnAndTypeOfTable(_ConnectionName.getValue(), _TableName.getValue());
  var columnInfo = dwscripts.getColumnValueList(_ConnectionName.getValue(), _TableName.getValue());
  var rowTextArr = new Array();
  var rowValArr  = new Array();
  
  ColumnTypes = new Array();  // clear the column types map

  //for (var i = 0; i < colsAndTypes.length; i+=2)
  for (var i = 0; i < columnInfo.length; i++)
  {
    var columnName = columnInfo[i].getColumnName();
	var columnType = columnInfo[i].getColumnType();

    ColumnTypes[columnName] = columnType;
    
    if (EDIT_OP_TYPE == "Update") 
    {
      rowInfo = getRowTextAndValue(columnName,
	                               columnType,
								   _RecordsetName.getValue(),
								   _UniqueKeyColumn.getValue());

	  if (columnInfo[i].getIsPrimaryKey() && !uniqueKeyColumnName)
	  {
	    uniqueKeyColumnName = columnName;
	  }
    } 
    else 
    {  
	  rowInfo = getRowTextAndValue(columnName, columnType);
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
  
  for (var i = 0; i < _ColumnNames.valueList.length; i++)
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
    if (displayMsg)
      alert(dwscripts.sprintf(MM.Msg_UnsupportedColumnsInTable, unsupportedColTypes));
    for (var i = 0; i < unsupportedColNames.length; i++)
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
  if (DB_UNSUPPORTED_COLUMNS_ENUM_MAP == null)
  {
    buildUnsupportedColumnsEnum();
  }
  
  return (!DB_UNSUPPORTED_COLUMNS_ENUM_MAP[colType.toLowerCase()]);
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

    // oracle

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
  var colFieldType = "";
  var colSubmitType = "";
  var colSubmitName = "";
  var colLabel = getLabelFromColumnName(colName);
  var fieldName = getElementNameFromColumnName(colName);
  
  // if update, the unique key column should be a static text...
  
  if ((EDIT_OP_TYPE == "Update") && (colName == uniqueColName))
  {
    colFieldType = STATICTEXT;
  }
  else
  {
    // default to password display type if "password" appears in field name
    
	if (colName.toLowerCase().indexOf(PASSWORD) != (-1))
    {
      colFieldType = PASSWORDFIELD;
    }
    else
    {
      colFieldType = getFieldTypeFromColumnType(colType);
    }
  }
  
  var databaseType = MMDB.getDatabaseType(_ConnectionName.getValue());
  var colSubmitType = dwscripts.getDBColumnTypeAsString(colType, databaseType);
  var colSubmitName = colSubmitType;
  var colDisplayAs = getFormFieldStorageObjectFromFormFieldType(colFieldType);
  
  // disable the _SubmitAs field if it is for the Primary Key column
  
  if ((EDIT_OP_TYPE == "Update") && (colName == uniqueColName))
  {
    UniqueColSubmitAs = colSubmitType;

    colSubmitType = "";  
    colSubmitName = "";

    toggleSubmitAs(false);                  // enable or disable Submit As Menu
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
  rowValObj.useWebFormControl = true;

  // populate storage object with any default values
  
  if ((EDIT_OP_TYPE == "Update") && (rowValObj.displayAs.type != "passwordField"))
  {
    var rs = (rsName) ? rsName : _RecordsetName.getValue();
    rowValObj = populateFormFieldStorageType(rowValObj, rs, colName);
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
         parseInt(elemName.charAt(0)) == elemName.charAt(0))
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

  while (STR_ELEMENT_NAMES.indexOf(divider + elemName + divider) != (-1))
  {
    elemName = tempName + counter++;
  }

  // add name to global names list
  
  STR_ELEMENT_NAMES += elemName + divider;

  // You can't have a web form control whose id is "id"

  if (elemName.toLowerCase() == "id")
  {
    elemName = "theID";
  }

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
    retObj = (EDIT_OP_TYPE == "Insert") ? new eoCheckBox() : new eoDynamicCheckBox();
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
    
    var rowTextTokens = getTokens(currRowText, "|");

    // TODO: this should be taken from the record, not the display

    _ElementLabel.value = currRowVal.label;				// update label field
    _DisplayAs.pickValue(rowTextTokens[2]);				// update display menu
    _UseWebFormCtrl.setCheckedState(currRowVal.useWebFormControl);

	// if the column is the unique key, don't let the "display as" be changed away from "text".

    if (EDIT_OP_TYPE == "Update")
	{
		if (rowTextTokens[0] == uniqueKeyColumnName)
		{
			_DisplayAs.disable();
		}
		else
		{
			_DisplayAs.enable();
		}
	}

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
      if (currRowVal.displayAs.checked.toString() == "true")
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

  if (connectionHasBeenChosen())
  {
    var displayAs = _DisplayAs.getValue() ? _DisplayAs.getValue() : "none";
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

    if ((displayAs == TEXTFIELD) ||
	    (displayAs == TEXTAREA) ||
		(displayAs == HIDDENFIELD) ||
        (displayAs == PASSWORDFIELD) ||
		(displayAs == FILEFIELD))
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

    for (i = 0;i < tables.length; i++)
    {
      if (tables[i].name && tables[i].name == param)
      {
        mmParamsTag.innerHTML = tables[i].innerHTML;
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

      if ((displayAs == TEXTFIELD) ||
	      (displayAs == TEXTAREA) ||
          (displayAs == HIDDENFIELD) ||
		  (displayAs == FILEFIELD))
      {
        dwscripts.findDOMObject("SetValueTo").value = rowInfoObj.displayAs.value = defaultStr;  // set UI
      }
      else if (displayAs == PASSWORDFIELD)
      {
        dwscripts.findDOMObject("SetValueTo").value = rowInfoObj.displayAs.value = passwordStr;    // set UI
      }
      else if (displayAs == STATICTEXT)
      {
        dwscripts.findDOMObject("Text").value = rowInfoObj.displayAs.text = defaultStr;    // set UI
      }
      else if (param == "dynamicCheckBox")
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

  if (!addedCols)
    return; // user clicked Cancel
  
  var nCols = addedCols.length,i, currCol, rowInfoArr;

  for (i=0;i<nCols;i++)
  {
    currCol = addedCols[i];
    rowInfoArr = getRowTextAndValue(currCol, ColumnTypes[currCol]);
  
    _ColumnNames.addRow(rowInfoArr[0], rowInfoArr[1]);
  
    updateAdditionalColumnList('del', currCol);
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
  var currCol = currRow.substring(0,currRow.indexOf("|"));
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

  if (!connectionHasBeenChosen())
  {
    alert(MM.MSG_NoConnectionSelected);
    return;
  }

  var currRowObj  = _ColumnNames.getRowValue();
  var currRowText = _ColumnNames.getRow();
  var currColName = currRowText.substring(0, currRowText.indexOf("|"));

  // update grid row text

  var newRowText = currColName;

  newRowText += "|" + _ElementLabel.value;
  newRowText += "|" + _DisplayAs.get();
  newRowText += "|" + (dwscripts.findDOMObject("SubmitAs") ? _SubmitAs.get() : "");
   
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

  case "useWebFormControl":
    currRowObj.useWebFormControl = _UseWebFormCtrl.getCheckedState();
	break;

  case "displayAs": 
    currRowObj.displayAs = getFormFieldStorageObjectFromFormFieldType(_DisplayAs.getValue());
  
    // need to update submit property, because changing displayAs menu can
    // auto-change submit type
    
	if (dwscripts.findDOMObject("SubmitAs"))
    {
      currRowObj.submitAs = _SubmitAs.getValue();
    }

    var defaultStr = currRowObj.defaultStr;
    var passwordStr = currRowObj.passwordStr;
    var fieldType = currRowObj.displayAs.type;

    if ((fieldType == "textField") ||
	    (fieldType == "hiddenField") || 
        (fieldType == "fileField") ||
		(fieldType == "textArea"))
    {
      currRowObj.displayAs.value = defaultStr;
    }
    else if (fieldType == "passwordField")
    {
      currRowObj.displayAs.value = passwordStr;          
    }
    else if (fieldType == "text")
    {
      currRowObj.displayAs.text = defaultStr;
    }
    else if (fieldType == "menu")
    {
      currRowObj.displayAs.defaultSelected = defaultStr;
    }
    else if (fieldType == "radioGroup")
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
  else if (action == 'clear')
  {
    ColumnsToAdd = new Array();
  }
  else
  { 
    // delete an item from additional column list
    
	for (var i = 0; i < ColumnsToAdd.length; i++)
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
  {
    // if inside of a form tag
    
	formArr = dom.nodeToOffsets(formNode);
    dom.setSelection(formArr[1] + 1, formArr[1] + 1);
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
  var formObj = "";
  var selArr = dom.getSelection();
  var selObj = dom.offsetsToNode(selArr[0], selArr[1]);

  while (formObj == "" && selObj.parentNode)
  {
    if (selObj.nodeType == Node.ELEMENT_NODE && selObj.tagName == "FORM")
    {
	  formObj = selObj;
    }
	else
    {
	  selObj = selObj.parentNode;
    }
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

  if ((displayAs != STATICTEXT) && (currentVal == " " || !currentVal))
  {
    // if any form field is chosen in displayAs menu
    
    var databaseType = MMDB.getDatabaseType(_ConnectionName.getValue());

	_SubmitAs.enable();
    _SubmitAs.del();
    _SubmitAs.pickValue(dwscripts.getDBColumnTypeAsString(ColumnTypes[_ColumnNames.getRowValue().column], databaseType));
  }
  else if (displayAs == STATICTEXT)
  {
    // if plain text was chosen in displayAs menu
    
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
  var labelFieldIsVisible = ( _ElementLabel.disabled != "true");

  if (displayAs != HIDDENFIELD && !labelFieldIsVisible)
  {
    // if non-hidden field & non-visible label field
    
	_ElementLabel.removeAttribute("disabled");
    _ElementLabel.setAttribute("value", _ColumnNames.getRowValue().label);
  }
  else if (displayAs == HIDDENFIELD && labelFieldIsVisible)
  {
    // if hidden field
    
	_ElementLabel.setAttribute("value", "");
    _ElementLabel.setAttribute("disabled", "true");
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
  if ((_ColumnNames.list.length <= 1) ||
      (_ColumnNames.getRowIndex() <= 0))
  {
    _ElemUp.setAttribute("disabled", true);
    _ElemUp.src = "../Shared/MM/Images/btnUp_dis.gif";   
  }
  else
  {
    _ElemUp.setAttribute("disabled", false);
    _ElemUp.src = "../Shared/MM/Images/btnUp.gif";      
  }
  
  if ((_ColumnNames.list.length <= 1) ||
      (_ColumnNames.getRowIndex() == (-1)) ||
	  ((_ColumnNames.list.length - 1) == _ColumnNames.getRowIndex()))
  {
    _ElemDown.setAttribute("disabled", true);
    _ElemDown.src = "../Shared/MM/Images/btnDown_dis.gif";        
  }
  else
  {
	_ElemDown.setAttribute("disabled", false);
    _ElemDown.src = "../Shared/MM/Images/btnDown.gif";      
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
  
  if (ColumnsToAdd.length == 0)
  {
    _ElemAdd.setAttribute("disabled", true);
    _ElemAdd.src = "../Shared/MM/Images/btnAdd_dis.gif";   
  }
  else
  {
    _ElemAdd.setAttribute("disabled", false);
    _ElemAdd.src = "../Shared/MM/Images/btnAdd.gif"; 
  }
    
  if ((_ColumnNames.list.length == 0) ||
      (_ColumnNames.getRowIndex() == (-1)))
  {
    _ElemDel.setAttribute("disabled", true);
    _ElemDel.src = "../Shared/MM/Images/btnDel_dis.gif";        
  }
  else
  {
    _ElemDel.setAttribute("disabled", false);
    _ElemDel.src = "../Shared/MM/Images/btnDel.gif";                
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
  var expression = dw.showDynamicDataDialog(textFieldObj.value);

  if (expression)
  {
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
  var dynDataVal = createDynamicData(rsName, colName);
  
  rowValObj.defaultStr = dynDataVal;

  if (displayType == "textField" || 
      displayType  == "textArea" || 
      displayType  == "hiddenField")
  {
    rowValObj.displayAs.value = dynDataVal;
  }
  else if (displayType == "text")
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

function createDynamicData(rs, col)
{
  var retVal = "";

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

  for (i = 0; i < nRows; i++)
  {
    currRowObj = rowObjs[i];
    regExp = new RegExp(oldRS,"g");
    currRowObj.defaultStr = currRowObj.defaultStr.toString().replace(regExp, newRS);
    currRowObj.passwordStr = currRowObj.passwordStr.toString().replace(regExp, newRS);

    // update the current display

    switch (currRowObj.displayAs.type)
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
//   sortByPrimaryKeyCB
//
// DESCRIPTION:
//   Sort such that columns that are primary keys are at the end.
//
// ARGUMENTS:
//   a, b: columnValueNodes.
//
// RETURNS:
//   If -1 is returned: order stays the same, if 1: values are switched, if 0: values are equal
//--------------------------------------------------------------------

function sortByPrimaryKeyCB(a, b)
{
  return (a.getIsPrimaryKey() && !b.getIsPrimaryKey()) ? 1 : (-1);
}
