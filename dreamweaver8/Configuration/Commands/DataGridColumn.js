// Copyright 2002, 2003 Macromedia, Inc. All rights reserved.

//-----------------------------------------------------------------------------

DataGridColumnInfo.prototype.setConnectionName = DataGridColumnInfo_setConnectionName;
DataGridColumnInfo.prototype.setDataSetName = DataGridColumnInfo_setDataSetName;
DataGridColumnInfo.prototype.setDataFieldChoices = DataGridColumnInfo_setDataFieldChoices;
DataGridColumnInfo.prototype.setSubmitAsTypes = DataGridColumnInfo_setSubmitAsTypes;
DataGridColumnInfo.prototype.setTableChoices = DataGridColumnInfo_setTableChoices;
DataGridColumnInfo.prototype.setTableName = DataGridColumnInfo_setTableName;
DataGridColumnInfo.prototype.setPrimaryKey = DataGridColumnInfo_setPrimaryKey;
DataGridColumnInfo.prototype.setPrimaryKeySubmitAs = DataGridColumnInfo_setPrimaryKeySubmitAs;
DataGridColumnInfo.prototype.setColumnObj = DataGridColumnInfo_setColumnObj;
DataGridColumnInfo.prototype.setHasEditColumn = DataGridColumnInfo_setHasEditColumn;

DataGridColumnInfo.prototype.getConnectionName = DataGridColumnInfo_getConnectionName;
DataGridColumnInfo.prototype.getDataSetName = DataGridColumnInfo_getDataSetName;
DataGridColumnInfo.prototype.getDataFieldNames = DataGridColumnInfo_getDataFieldNames;
DataGridColumnInfo.prototype.getDataFieldTypes = DataGridColumnInfo_getDataFieldTypes;
DataGridColumnInfo.prototype.getSubmitAsTypes = DataGridColumnInfo_getSubmitAsTypes;
DataGridColumnInfo.prototype.getTableChoices = DataGridColumnInfo_getTableChoices;
DataGridColumnInfo.prototype.getTableName = DataGridColumnInfo_getTableName;
DataGridColumnInfo.prototype.getPrimaryKey = DataGridColumnInfo_getPrimaryKey;
DataGridColumnInfo.prototype.getPrimaryKeySubmitAs = DataGridColumnInfo_getPrimaryKeySubmitAs;
DataGridColumnInfo.prototype.getColumnObj = DataGridColumnInfo_getColumnObj;
DataGridColumnInfo.prototype.getHasEditColumn = DataGridColumnInfo_getHasEditColumn;

//-----------------------------------------------------------------------------

function DataGridColumnInfo()
{
	this.connectionName = "";
	this.dataSetName = "";
	this.columnObj = null;
	this.hasEditColumn = false;
}

function DataGridColumnInfo_setConnectionName(name) { this.connectionName = name; }
function DataGridColumnInfo_setDataSetName(name) { this.dataSetName = name; }
function DataGridColumnInfo_setSubmitAsTypes(types) { this.submitAsTypes = types; }
function DataGridColumnInfo_setTableName(name) { this.tableName = name; }
function DataGridColumnInfo_setTableChoices(tables) { this.tableChoices = tables; }
function DataGridColumnInfo_setPrimaryKey(key) { this.primaryKey = key; }
function DataGridColumnInfo_setPrimaryKeySubmitAs(submitAs) { this.primaryKeySubmitAs = submitAs; }
function DataGridColumnInfo_setColumnObj(obj) { this.columnObj = obj; }
function DataGridColumnInfo_setHasEditColumn(has) { this.hasEditColumn = has; }

function DataGridColumnInfo_setDataFieldChoices(names, types)
{
	this.dataFieldNames = names;
	this.dataFieldTypes = types;
}

function DataGridColumnInfo_getConnectionName() { return this.connectionName; }
function DataGridColumnInfo_getDataSetName() { return this.dataSetName; }
function DataGridColumnInfo_getSubmitAsTypes() { return this.submitAsTypes; }
function DataGridColumnInfo_getDataFieldNames() { return this.dataFieldNames; }
function DataGridColumnInfo_getDataFieldTypes() { return this.dataFieldTypes; }
function DataGridColumnInfo_getTableChoices() { return this.tableChoices; }
function DataGridColumnInfo_getTableName() { return this.tableName; }
function DataGridColumnInfo_getPrimaryKey() { return this.primaryKey; }
function DataGridColumnInfo_getPrimaryKeySubmitAs() { return this.primaryKeySubmitAs; }
function DataGridColumnInfo_getColumnObj() { return this.columnObj; }
function DataGridColumnInfo_getHasEditColumn() { return this.hasEditColumn; }

//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------

DataGridColumn.TYPE_BOUND = MM.LABEL_BoundColumnType;
DataGridColumn.TYPE_TEMPLATE = MM.LABEL_TemplateColumnType;
DataGridColumn.TYPE_LINK = MM.LABEL_HyperlinkColumnType;
DataGridColumn.TYPE_EDIT = MM.LABEL_EditCmdColumnType;
DataGridColumn.TYPE_DELETE = MM.LABEL_DeleteColumnType;
DataGridColumn.TYPE_OTHER = MM.LABEL_OtherType;

DataGridColumn.BUTTON_TYPE_LINK = 0;
DataGridColumn.BUTTON_TYPE_PUSH = 1;
DataGridColumn.LINK_TYPE_STATIC = 0;
DataGridColumn.LINK_TYPE_DYNAMIC = 1;

DataGridColumn.prototype.setType = DataGridColumn_setType;
DataGridColumn.prototype.setTitle = DataGridColumn_setTitle;
DataGridColumn.prototype.setDataField = DataGridColumn_setDataField;
DataGridColumn.prototype.setSubmitAs = DataGridColumn_setSubmitAs;
DataGridColumn.prototype.setIsReadOnly = DataGridColumn_setIsReadOnly;
DataGridColumn.prototype.setTemplateContents = DataGridColumn_setTemplateContents;
DataGridColumn.prototype.setSubmitControlID = DataGridColumn_setSubmitControID;
DataGridColumn.prototype.setHyperlinkType = DataGridColumn_setHyperlinkType;
DataGridColumn.prototype.setHyperlinkData = DataGridColumn_setHyperlinkData;
DataGridColumn.prototype.setHyperlinkDataFormat = DataGridColumn_setHyperlinkDataFormat;
DataGridColumn.prototype.setLinkedPageType = DataGridColumn_setLinkedPageType;
DataGridColumn.prototype.setLinkedPageData = DataGridColumn_setLinkedPageData;
DataGridColumn.prototype.setLinkedPageDataFormat = DataGridColumn_setLinkedPageDataFormat;
DataGridColumn.prototype.setButtonType = DataGridColumn_setButtonType;
DataGridColumn.prototype.setOriginalIndex = DataGridColumn_setOriginalIndex;
DataGridColumn.prototype.setOriginalType = DataGridColumn_setOriginalType;

DataGridColumn.prototype.getType = DataGridColumn_getType;
DataGridColumn.prototype.getTitle = DataGridColumn_getTitle;
DataGridColumn.prototype.getDataField = DataGridColumn_getDataField;
DataGridColumn.prototype.getSubmitAs = DataGridColumn_getSubmitAs;
DataGridColumn.prototype.getIsReadOnly = DataGridColumn_getIsReadOnly;
DataGridColumn.prototype.getTemplateContents = DataGridColumn_getTemplateContents;
DataGridColumn.prototype.getSubmitControlID = DataGridColumn_getSubmitControID;
DataGridColumn.prototype.getHyperlinkType = DataGridColumn_getHyperlinkType;
DataGridColumn.prototype.getHyperlinkData = DataGridColumn_getHyperlinkData;
DataGridColumn.prototype.getHyperlinkDataFormat = DataGridColumn_getHyperlinkDataFormat;
DataGridColumn.prototype.getLinkedPageType = DataGridColumn_getLinkedPageType;
DataGridColumn.prototype.getLinkedPageData = DataGridColumn_getLinkedPageData;
DataGridColumn.prototype.getLinkedPageDataFormat = DataGridColumn_getLinkedPageDataFormat;
DataGridColumn.prototype.getButtonType = DataGridColumn_getButtonType;
DataGridColumn.prototype.getOriginalIndex = DataGridColumn_getOriginalIndex;
DataGridColumn.prototype.getOriginalType = DataGridColumn_getOriginalType;

DataGridColumn.prototype.isEditable = DataGridColumn_isEditable;

//-----------------------------------------------------------------------------

function DataGridColumn(type)
{
	this.type = type;
	this.originalIndex = (-1);
	this.originalType = this.TYPE_OTHER;
	this.title = "";
	this.templateContents = "<ItemTemplate>&nbsp;\r</ItemTemplate>\n<EditItemTemplate>&nbsp;\n</EditItemTemplate>";
	this.submitControlID = "";
	this.buttonType = this.BUTTON_TYPE_LINK;
	this.hyperlinkType = this.LINK_TYPE_STATIC;
	this.hyperlinkData = "";
	this.hyperlinkDataFormat = "";
	this.linkedPageType = this.LINK_TYPE_STATIC;
	this.linkedPageData = "";
	this.linkedPageDataFormat = "";
}

function DataGridColumn_setType(type) { this.type = type; }
function DataGridColumn_setTitle(title) { this.title = title; }
function DataGridColumn_setDataField(dataField) { this.dataField = dataField; }
function DataGridColumn_setSubmitAs(submitAs) { this.submitAs = submitAs; }
function DataGridColumn_setIsReadOnly(isReadOnly) { this.isReadOnly = isReadOnly; }
function DataGridColumn_setTemplateContents(contents) { this.templateContents = contents; }
function DataGridColumn_setSubmitControID(id) { this.submitControlID = id; }
function DataGridColumn_setHyperlinkType(type) { this.hyperlinkType = type; }
function DataGridColumn_setHyperlinkData(data) { this.hyperlinkData = data; }
function DataGridColumn_setHyperlinkDataFormat(fmt) { this.hyperlinkDataFormat = fmt; }
function DataGridColumn_setLinkedPageType(type) { this.linkedPageType = type; }
function DataGridColumn_setLinkedPageData(data) { this.linkedPageData = data; }
function DataGridColumn_setLinkedPageDataFormat(fmt) { this.linkedPageDataFormat = fmt; }
function DataGridColumn_setButtonType(type) { this.buttonType = type; }
function DataGridColumn_setOriginalIndex(index) { this.originalIndex = index; }
function DataGridColumn_setOriginalType(type) { this.originalType = type; }

function DataGridColumn_getType() { return this.type; }
function DataGridColumn_getTitle() { return this.title; }
function DataGridColumn_getDataField() { return this.dataField; }
function DataGridColumn_getSubmitAs() { return this.submitAs; }
function DataGridColumn_getIsReadOnly() { return this.isReadOnly; }
function DataGridColumn_getTemplateContents() { return this.templateContents; }
function DataGridColumn_getSubmitControID() { return this.submitControlID; }
function DataGridColumn_getHyperlinkType() { return this.hyperlinkType; }
function DataGridColumn_getHyperlinkData() { return this.hyperlinkData; }
function DataGridColumn_getHyperlinkDataFormat() { return this.hyperlinkDataFormat; }
function DataGridColumn_getLinkedPageType() { return this.linkedPageType; }
function DataGridColumn_getLinkedPageData() { return this.linkedPageData; }
function DataGridColumn_getLinkedPageDataFormat() { return this.linkedPageDataFormat; }
function DataGridColumn_getButtonType() { return this.buttonType; }
function DataGridColumn_getOriginalIndex() { return this.originalIndex; }
function DataGridColumn_getOriginalType() { return this.originalType; }

function DataGridColumn_isEditable()
{
  var ret = false;

  switch (this.type)
  {
    case DataGridColumn.TYPE_BOUND:
    {
      ret = !this.getIsReadOnly();
      break;
    }

    case DataGridColumn.TYPE_TEMPLATE:
    {
	  // Only if an EditItemTemplate exists

	  var contents = this.getTemplateContents();
	  ret = (contents && contents.toLowerCase().indexOf("edititemtemplate") != (-1));
	  break;
    }	 
  }

  return ret;
}
