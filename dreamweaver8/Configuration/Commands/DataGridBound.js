// Copyright 2002, 2003 Macromedia, Inc. All rights reserved.

var helpDoc = MM.HELP_sbASPNetDataGridBound;

var columnInfo = null;
var columnObj = null;
var titleCtrl = null;
var dataFieldCtrl = null;
var isReadOnlyCtrl = null;
var submitAsCtrl = null;

//-----------------------------------------------------------------------------

function initializeUI()
{
	titleCtrl = dwscripts.findDOMObject("Title");
	dataFieldCtrl = new ListControl("DataField");
	isReadOnlyCtrl = new CheckBox(null, "IsReadOnly");
  if (isReadOnlyCtrl)
  {
      //call the initializeUI for checkbox control
     isReadOnlyCtrl.initializeUI(); 
  }
	submitAsCtrl = new ListControl("SubmitAs");

	columnInfo = dwscripts.getCommandArguments();
	
	if (columnInfo)
	{
		dataFieldCtrl.setAll(columnInfo.getDataFieldNames(), columnInfo.getDataFieldTypes());
		submitAsCtrl.setAll(columnInfo.getSubmitAsTypes());

		columnObj = columnInfo.getColumnObj();

		if (columnObj)
		{
			titleCtrl.value = columnObj.getTitle();

			dataFieldCtrl.pick(columnObj.getDataField());
			onDataFieldChanged();

			isReadOnlyCtrl.setCheckedState(columnObj.getIsReadOnly());
			onReadOnlyChanged();

			submitAsCtrl.pick(columnObj.getSubmitAs());
		}

		// If there isn't an "Edit" column in this
		// DataGrid, don't enable the EditItemTemplate
		// and associated controls

		if (!columnInfo.getHasEditColumn())
		{
			isReadOnlyCtrl.setCheckedState(true);
			isReadOnlyCtrl.enable(false);
			submitAsCtrl.disable();
		}
	}

	titleCtrl.focus();
}

function commandButtons()
{
	return new Array(MM.BTN_OK,		"onOKClicked()",
					 MM.BTN_Cancel,	"onCancelClicked()",
					 MM.BTN_Help,		"displayHelp()" );
}

function onDataFieldChanged()
{
	submitAsCtrl.pick(dataFieldCtrl.getValue());
}

function onReadOnlyChanged()
{
	submitAsCtrl.enable(!isReadOnlyCtrl.getCheckedState());
}

function onOKClicked()
{
	do
	{
		if (!columnObj)
			break;

		var title = titleCtrl.value;

		if (title == "")
		{
			alert(MM.MSG_NeedColumnTitle);
			titleCtrl.focus();
			break;
		}

		columnObj.setType(DataGridColumn.TYPE_BOUND);
		columnObj.setTitle(title);
		columnObj.setDataField(dataFieldCtrl.get());
		columnObj.setIsReadOnly(isReadOnlyCtrl.getCheckedState());
		columnObj.setSubmitAs(submitAsCtrl.get());

		dwscripts.setCommandReturnValue(columnInfo);
		window.close();
	}
	while (false);
}

function onCancelClicked()
{
  dwscripts.setCommandReturnValue("");
  window.close();
}

