// Copyright 2000, 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved


function createFormContent(rowInfoArr,rs,col){
  var nRows = rowInfoArr.length, i,currRowInfoObj, tableRowPart;
  var displayInfo, type, leftColContents, rightColContents;
  var tableStr = "", paramObj = new Object();
  var hiddenFieldsHTML = "";
  var hiddenFieldPart = new Participant( (EDIT_OP_TYPE == "Insert")?
                                         "insertRecord_hiddenEdit":"updateRecord_hiddenEdit"); 
  
  for (i=0;i<nRows;i++){
    currRowInfoObj = rowInfoArr[i];
    fieldInfoObj = currRowInfoObj.displayAs; 
    fieldInfoObj.fieldName = currRowInfoObj.fieldName;
    fieldType = fieldInfoObj.type; 
    
    if (fieldType == "hiddenField") {
      hiddenFieldsHTML += createFieldCellContents(fieldInfoObj);
      
    } else { 
      // first, get the right row type for the form fields being displayed
      if (fieldType == "radioGroup" || fieldType == "dynamicRadioGroup") {
        tableRowPart = PART_TR_RG;
      } else if ( fieldType == "textArea") {
        tableRowPart = PART_TR_TA;
      } else {
        tableRowPart = PART_TR;
      }
        
      // next, create the html for the form widget,as adefined in the XML files.
      paramObj.leftCol = currRowInfoObj.label;
      paramObj.rightCol = createFieldCellContents(fieldInfoObj);
   
      tableStr += tableRowPart.getInsertString(paramObj);
    }  
  } // end loop used to create table HTML
  
  // add last row to table that contains submit button
  var submitButtonPart = new Participant("editOps_submitButton"); 
	if (dreamweaver.appVersion && ( (dreamweaver.appVersion.indexOf('ja') != -1) ||
								    (dreamweaver.appVersion.indexOf('ko') != -1) ||
									(dreamweaver.appVersion.indexOf('zh') != -1) ) )
	{  
    	if (isDoubleByteEncoding()) 
	   	{
			// Exception for DoubleByte languages
			paramObj.buttonText = (EDIT_OP_TYPE == "Insert")?MM.BTN_InsertRecord:MM.BTN_UpdateRecord;
		} else {
			// not a JA, KO, or Chinese document so use English to prevent corruption
			paramObj.buttonText = (EDIT_OP_TYPE == "Insert")?MM.BTN_EngInsertRecord:MM.BTN_EngUpdateRecord;
		}
	} else
  		paramObj.buttonText = (EDIT_OP_TYPE == "Insert")?entityNameEncode(MM.BTN_InsertRecord):entityNameEncode(MM.BTN_UpdateRecord);;

  var submitButtonHTML = submitButtonPart.getInsertString(paramObj);
  paramObj.leftCol = "&nbsp;";
  paramObj.rightCol = submitButtonHTML;
  tableStr += PART_TR.getInsertString(paramObj);
  
  // wrap table content in the actual table tags
  paramObj.tableContent = tableStr;
  paramObj.tableAlign   = "center";
  var tableHTML = PART_TABLE.getInsertString(paramObj);
  
  // create html for hidden fields -- both the hidden fields that correspond
  // to database fields, and the hidden fields needed for the edit op.
  // The html for the hidden database fields is already stored in the
  // hiddenFieldsHTML variable
  
  // add hidden field needed for this particular edit op
  hiddenFieldsHTML += hiddenFieldPart.getInsertString();
  
  
  // need another hidden field for update record
  if ( EDIT_OP_TYPE == "Update" ){
    var hiddenFieldRecordIDPart = new Participant("editOps_hiddenRecordId"); 
    paramObj.rs = rs; 
    paramObj.col = col;
    hiddenFieldsHTML += hiddenFieldRecordIDPart.getInsertString(paramObj);
  } 
  

  return tableHTML + hiddenFieldsHTML;
}

/* for hidden fields we need to remove the size attr*/
function removeSizeAttr(inStr)
{
  var outStr
	outStr= inStr;
  var sizeAttrRegEx = /size\s*=\s*"32"/i;
  outStr = outStr.replace(sizeAttrRegEx,"");    
	return outStr;
}


function createFieldCellContents(fieldInfoObj){
  var paramObj = new Object();
  var retVal   = "";
  var fieldType = fieldInfoObj.type;
  paramObj.fieldName = fieldInfoObj.fieldName;

  switch (fieldType){
   
    case "textArea":
      paramObj.fieldVal = fieldInfoObj.value;
      retVal = PART_TA.getInsertString(paramObj)
      break;
      
    case "textField":
      paramObj.fieldVal = fieldInfoObj.value;
      retVal = PART_TF.getInsertString(paramObj)
      break;
      
    case "hiddenField":
      paramObj.fieldVal = fieldInfoObj.value;
      retVal = PART_HF.getInsertString(paramObj);
			/* for hidden fields we need to remove the size attr*/
			retVal = removeSizeAttr(retVal);
      break;
      
    case "passwordField":
      paramObj.fieldVal = fieldInfoObj.value;
      retVal = PART_PF.getInsertString(paramObj)
      break;
      
    case "fileField":
      paramObj.fieldVal = fieldInfoObj.value;
      retVal = PART_FF.getInsertString(paramObj)
      break;
    
    case "text": 
      retVal = fieldInfoObj.text;
      break;
    
    case "menu":
      var nOptions = fieldInfoObj.textArr.length, i;
      var defaultSelected = fieldInfoObj.defaultSelected;
      paramObj.selected = "";
      
      for (i=0;i<nOptions;i++){
        paramObj.optionText = fieldInfoObj.textArr[i];
        paramObj.optionVal  = fieldInfoObj.valArr[i]
        if (defaultSelected && paramObj.optionVal){
          paramObj.expression2 = formatDynamicExpression(paramObj.optionVal);
          paramObj.expression1 = formatDynamicExpression(defaultSelected);
          // Special case for ColdFusion - we must strip surrounding #'s
          if (   paramObj.expression1.length > 1 && paramObj.expression1.charAt(0) == '#' 
              && paramObj.expression1.charAt(paramObj.expression1.length - 1) == '#'
             )
          { 
            paramObj.expression1 = paramObj.expression1.slice(1, paramObj.expression1.length - 1);
          }

		//[akishnani 08/12/05] bug 198878 update form wizard inserts bad ASP code; page breaks  
		//we are using the same paramObj for the two participants we need to intialize the checked
		//parameter for "PART_SELECTED_ATTR" to be "checked" which is what html looks for.

		  paramObj.selected = "selected='selected'"; //paramObj.checked for PART_SELECTED_ATTR
          paramObj.selected = PART_SELECTED_ATTR.getInsertString(paramObj);//paramObj.checked for PART_OPTION                   
        }
        retVal += PART_OPTION.getInsertString(paramObj);
        retVal = killEndingWhiteSpace(retVal);
      }
      
      // if no option is selected by default, then add "selected" to first option
      // this allows the first option to show in the ultradev wysiwyg view
      var regExp = /selected/i;
      if (retVal.search(regExp) == -1){
        regExp = /(<option[^>]*)(>)/i;
        if ( regExp.exec(retVal) != null ){
          retVal =  retVal.replace(RegExp.$2," selected>");
        }
      }
        
      paramObj.menuContent = retVal;
      
      retVal = PART_SELECT.getInsertString(paramObj);
      break;
    
    case "dynamicMenu":
      var defaultSelected = fieldInfoObj.defaultSelected;
      var menuStr = "";
      var optionPart = PART_DYN_OPTION;

      paramObj.labelColumn = fieldInfoObj.textCol;
      paramObj.valueColumn = fieldInfoObj.valCol
      paramObj.rsName = fieldInfoObj.recordset;
      paramobj = getJSPParamObj(paramObj);
      paramObj.selected = "selected='selected'"; //paramObj.selected default value
   
      if (defaultSelected)
      {
        paramObj.expression1 = formatDynamicExpression(defaultSelected); 
        // Special case for ColdFusion - we must strip surrounding #'s
        if (   paramObj.expression1.length > 1 && paramObj.expression1.charAt(0) == '#' 
            && paramObj.expression1.charAt(paramObj.expression1.length - 1) == '#'
           )
        { 
          paramObj.expression1 = paramObj.expression1.slice(1, paramObj.expression1.length - 1);
        }
        optionPart = PART_DYN_OPTION;
      } else {
        paramObj.MM_subType = "noSelection";
        optionPart = PART_DYN_OP_NOSEL;
      
      }
 
      menuStr += PART_BEGIN_LOOP.getInsertString(paramObj);
      menuStr += optionPart.getInsertString(paramObj);
      
      // Note that we use the new version of getInsertString for PART_END_LOOP.
      //   We added a conditional directive in the edml for JSP's PART_END_LOOP
      //   to switch between the recordset/callable reset code (see getJSPParamObj
      //   below for more details). The old getInsertString does not support
      //   the conditional directive, so we have to use the new version in this
      //   case. Ultimately, we should switch all of these calls to the new code, but
      //   we are too late in the release at this point.
      //menuStr += PART_END_LOOP.getInsertString(paramObj);
      menuStr += extPart.getInsertString("", PART_END_LOOP.name, paramObj, "");
      
      paramObj.menuContent = menuStr;
      retVal = PART_SELECT.getInsertString(paramObj);
      
      break;
  
    
    case "checkBox":
    case "dynamicCheckBox":
      var checkIf = fieldInfoObj.checkIf;
      var equalTo = fieldInfoObj.equalTo;

      if (checkIf && equalTo) { // dynamic checkbox
        paramObj.expression1 = formatDynamicExpression(checkIf);
        paramObj.expression2 = formatDynamicExpression(equalTo);
	    paramObj.checked = "checked='checked'"; //paramObj.checked for dynamicCheckbox_attrib
        var checkedPart = new Participant("dynamicCheckbox_attrib");
        paramObj.checked = checkedPart.getInsertString(paramObj);
      } else { // static checkbox
        if (fieldInfoObj.checked){
          paramObj.checked = (fieldInfoObj.checked.toString() == "true")?"checked":"";
        } else { // needed if user only filled out 1 field in dynamic check box
          paramObj.checked = "";
        }
      }
      retVal = PART_CB.getInsertString(paramObj);
      break;
      
    
    case "radioGroup": 
       var tableContentStr = "";
       var nButtons = fieldInfoObj.labelArr.length;
       var defaultChecked = fieldInfoObj.defaultChecked;
       
       paramObj.checked = "";
       if (!nButtons) {
          var labelText = "[ " + MM.LABEL_Label + " ]";
          fieldInfoObj.labelArr = new Array(labelText,labelText);
          fieldInfoObj.valArr   = new Array("radiobutton1","radiobutton2");
          nButtons = 2;
       }
     

       for (i=0;i<nButtons;i++){
         paramObj.fieldLabel = fieldInfoObj.labelArr[i];
         paramObj.fieldVal   = fieldInfoObj.valArr[i];
         if (defaultChecked && paramObj.fieldVal){
           paramObj.expression1 = formatDynamicExpression(paramObj.fieldVal);
           paramObj.expression2 = formatDynamicExpression(defaultChecked);

		   //[akishnani 08/12/05] bug 198878 update form wizard inserts bad ASP code; page breaks  
		   //we are using the same paramObj for the two participants we need to intialize the checked
		   //parameter for "PART_CHECKED_ATTR" to be "checked" which is what html looks for.
		   paramObj.checked = "checked='checked'"; //paramObj.checked for PART_CHECKED_ATTR
           paramObj.checked =  PART_CHECKED_ATTR.getInsertString(paramObj); //paramObj.checked for PART_TR_RB
         }
         tableContentStr += PART_TR_RB.getInsertString(paramObj);
      }  
      
      paramObj.tableAlign = "left";
      paramObj.tableContent = tableContentStr;
      retVal = PART_TABLE.getInsertString(paramObj);
      
      break;
      
    case "dynamicRadioGroup":
      var recordset = fieldInfoObj.recordset;
      var labelCol  = fieldInfoObj.labelCol;
      var valCol    = fieldInfoObj.valCol;
      var defaultChecked = fieldInfoObj.defaultChecked;
      var tableRowStr = "";
      
      paramObj.fieldLabel = createDynamicData(recordset,labelCol);
      paramObj.fieldVal   = createDynamicData(recordset,valCol);
      paramObj.recordset  = recordset;
      paramObj.checked    = "";
      paramObj.rsName     = recordset;
      setMoveToParamsForJsp(paramObj);
      
      if (defaultChecked && paramObj.fieldVal) {
        paramObj.expression1 = formatDynamicExpression(paramObj.fieldVal);
        paramObj.expression2 = formatDynamicExpression(defaultChecked);
  	    paramObj.checked = "checked='checked'"; //paramObj.checked for PART_CHECKED_ATTR
        paramObj.checked     = PART_CHECKED_ATTR.getInsertString(paramObj);
      }
      
      tableRowStr += PART_BEGIN_LOOP.getInsertString(paramObj);
      tableRowStr += PART_TR_RB.getInsertString(paramObj);
      tableRowStr += PART_END_LOOP.getInsertString(paramObj);
      
      paramObj.tableAlign = "left";
      paramObj.tableContent = tableRowStr;
      retVal = PART_TABLE.getInsertString(paramObj);

      break;
    
    
    default:
      break;
  }
  
  return retVal;
    
}



//--------------------------------------------------------------------
// FUNCTION:
//   getJSPParamObj
//
// DESCRIPTION:
//   For JSP only, check if this is a recordset from a callable object. We
//   switch between different recordset reset code for dynamic menus based  
//   on whether the recordset is from a callable or not. Make sure the 
//   callableName parameter is set to perform the switch.
//
// ARGUMENTS:
//   paramObj - the parameter object for the SB
//
// RETURNS:
//   object - the updated parameter object
//--------------------------------------------------------------------
function getJSPParamObj(paramObj)
{
  if (!paramObj.callableName && dw.getDocumentDOM().serverModel.getServerName() == "JSP") 
  {
    var recordsetName = paramObj.rsName;
    
    var callableName = ""; // empty string if not from a callable
    var sbList = dw.serverBehaviorInspector.getServerBehaviors();
    for (var i=0; i < sbList.length; i++) 
    {
      if (sbList[i].recordset == recordsetName && sbList[i].callableName) 
      {
        callableName = sbList[i].callableName;
        break;
      }
    }
    
    paramObj.callableName = callableName;
  }
  
  return paramObj;
}

//--------------------------------------------------------------------
// FUNCTION:
//   isDoubleByteEncoding
//
// DESCRIPTION:
//   Check to avoid entity encoding in double byte languages
//   
// ARGUMENTS:
//   none
//   
// RETURNS:
//   true if charSet and appVersion correspond to a DoubleByte language
//   false otherwise
//
//--------------------------------------------------------------------

function isDoubleByteEncoding()
{
	var charSet = dw.getDocumentDOM().getCharSet();
	charSet = charSet.toLowerCase();
	if (   ( (dreamweaver.appVersion.indexOf('ja') != -1) && 
			 (charSet == "shift_jis" || charSet == "x-sjis" || charSet == "euc-jp" || charSet == "iso-2022-jp" || charSet == "utf-8") )
		|| ( (dreamweaver.appVersion.indexOf('ko') != -1) && 
			 (charSet == "euc-kr" || charSet == "utf-8") )
		|| ( (dreamweaver.appVersion.indexOf('zh') != -1) && 
			 (charSet == "big5" || charSet == "gb2312" || charSet == "utf-8") ) )
	{
		return true;
	}
	else
	{
		return false;
	}
}
