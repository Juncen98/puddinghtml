// Copyright 2002, 2003 Macromedia, Inc. All rights reserved.

var helpDoc = MM.HELP_sbASPNetDataGridDelete;

var columnInfo = null;
var columnObj = null;

var titleCtrl = null;
var buttonTypeCtrl = null;
var deleteFromCtrl = null;
var primaryKeyCtrl = null;
var submitAsCtrl = null;

//-----------------------------------------------------------------------------

function initializeUI()
{
	titleCtrl = dwscripts.findDOMObject("Title");
	buttonTypeCtrl = new ListControl("ButtonType");
	deleteFromCtrl = new ListControl("DeleteFrom");
	primaryKeyCtrl = new ListControl("PrimaryKey");
	submitAsCtrl = new ListControl("SubmitAs");

	var buttonTypes = new Array();

	buttonTypes.push(MM.LABEL_LinkButton);
	buttonTypes.push(MM.LABEL_PushButton);

	buttonTypeCtrl.setAll(buttonTypes);

	columnInfo = dwscripts.getCommandArguments();
	
	if (columnInfo)
	{
		deleteFromCtrl.setAll(columnInfo.getTableChoices());
		submitAsCtrl.setAll(columnInfo.getSubmitAsTypes());

		columnObj = columnInfo.getColumnObj();

		if (columnObj)
		{
			titleCtrl.value = columnObj.getTitle();
			
			buttonTypeCtrl.setIndex(columnObj.getButtonType());
			
			deleteFromCtrl.pick(columnInfo.getTableName());
			onDeleteFromChanged();

			primaryKeyCtrl.pick(columnInfo.getPrimaryKey());
			onPrimaryKeyChanged();

			submitAsCtrl.pick(columnInfo.getPrimaryKeySubmitAs());
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

function onDeleteFromChanged()
{
	var connectionName = columnInfo.getConnectionName();
	var databaseType = MMDB.getDatabaseType(connectionName);
	var tableName = deleteFromCtrl.get();
	var columnList = dwscripts.getColumnValueList(connectionName, tableName);
	var names = new Array();
	var types = new Array();
	var keyColumnName = null;

	for (var i = 0; i < columnList.length; i++)
	{
		var columnName = columnList[i].getColumnName();

		// Determine the primary key so we can select it by default. (Must be done
		//   before setting default mapping because we mark all columns as keys by
		//   default in this case).

		if (columnList[i].getIsPrimaryKey() && !keyColumnName) 
		{
			keyColumnName = columnName;
		}

		names.push(columnName);
		types.push(dwscripts.getDBColumnTypeAsString(columnList[i].getColumnType(), databaseType));
	}

	primaryKeyCtrl.setAll(names, types);
	primaryKeyCtrl.pick(keyColumnName);

	onPrimaryKeyChanged();
}

function onPrimaryKeyChanged()
{
	submitAsCtrl.pick(primaryKeyCtrl.getValue());
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

		columnObj.setType(DataGridColumn.TYPE_DELETE);
		columnObj.setTitle(title);
		columnObj.setButtonType(buttonTypeCtrl.getIndex());
		
		columnInfo.setTableName(deleteFromCtrl.get());
		columnInfo.setPrimaryKey(primaryKeyCtrl.get());
		columnInfo.setPrimaryKeySubmitAs(submitAsCtrl.get());

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

