// Copyright 2002, 2003 Macromedia, Inc. All rights reserved.

var helpDoc = MM.HELP_sbASPNetDataGridHyperlink;

var columnInfo = null;
var columnObj = null;

var titleCtrl = null;
var linkTypeCtrl = null
var linkStaticCtrl = null;
var linkDynamicCtrl = null;
var linkFormatCtrl = null;
var urlTypeCtrl = null;
var urlStaticCtrl = null
var urlDynamicCtrl = null;
var urlFormatCtrl = null;
var urlBrowseCtrl = null;
var urlFormatStringBrowseCtrl = null;

//-----------------------------------------------------------------------------

function initializeUI()
{
	titleCtrl = dwscripts.findDOMObject("Title");
	linkTypeCtrl = dwscripts.findDOMObject("HyperlinkType");
	linkStaticCtrl = dwscripts.findDOMObject("HyperlinkStaticText");
	linkDynamicCtrl = new ListControl("HyperlinkDataField");
	linkFormatCtrl = dwscripts.findDOMObject("HyperlinkFormatString");
	urlTypeCtrl = dwscripts.findDOMObject("LinkedPageType");
	urlStaticCtrl = dwscripts.findDOMObject("LinkedPageStaticURL");
	urlDynamicCtrl = new ListControl("LinkedPageDataField"); 
	urlFormatCtrl = dwscripts.findDOMObject("LinkedPageFormatString");
	urlBrowseCtrl = dwscripts.findDOMObject("LinkedPageBrowseButton");
	urlFormatStringBrowseCtrl = dwscripts.findDOMObject("LinkedPageFormatStringBrowseButton");

	columnInfo = dwscripts.getCommandArguments();
	
	if (columnInfo)
	{
		linkDynamicCtrl.setAll(columnInfo.getDataFieldNames());
		urlDynamicCtrl.setAll(columnInfo.getDataFieldNames());

		columnObj = columnInfo.getColumnObj();

		if (columnObj)
		{
			titleCtrl.value = columnObj.getTitle();

			if (columnObj.getHyperlinkType() == DataGridColumn.LINK_TYPE_STATIC)
			{
				linkTypeCtrl[0].checked = true;
				linkStaticCtrl.value = columnObj.getHyperlinkData();
			}
			else
			{
				linkTypeCtrl[1].checked = true;
				linkDynamicCtrl.pick(columnObj.getHyperlinkData());
				linkFormatCtrl.value = columnObj.getHyperlinkDataFormat();
			}

			if (columnObj.getLinkedPageType() == DataGridColumn.LINK_TYPE_STATIC)
			{
				urlTypeCtrl[0].checked = true;
				urlStaticCtrl.value = columnObj.getLinkedPageData();
			}
			else
			{
				urlTypeCtrl[1].checked = true;
				urlDynamicCtrl.pick(columnObj.getLinkedPageData());
				urlFormatCtrl.value = columnObj.getLinkedPageDataFormat();
			}

			onHyperlinkTypeChanged();
			onLinkedPageTypeChanged();
		}
	}

	titleCtrl.focus();
}

function commandButtons()
{
	return new Array(MM.BTN_OK,		"onOKClicked()",
					 MM.BTN_Cancel,	"onCancelClicked()",
					 MM.BTN_Help,	"displayHelp()" );
}

function onHyperlinkTypeChanged()
{
	if (linkTypeCtrl[0].checked)
	{
		SetEnabled(linkStaticCtrl, true);
		SetEnabled(linkDynamicCtrl.object, false);
		SetEnabled(linkFormatCtrl, false);
	}
	else
	{
		SetEnabled(linkStaticCtrl, false);
		SetEnabled(linkDynamicCtrl.object, true);
		SetEnabled(linkFormatCtrl, true);
	}
}

function onLinkedPageTypeChanged()
{
	if (urlTypeCtrl[0].checked)
	{
		SetEnabled(urlStaticCtrl, true);
		SetEnabled(urlBrowseCtrl, true);
		SetEnabled(urlDynamicCtrl.object, false);
		SetEnabled(urlFormatCtrl, false);
		SetEnabled(urlFormatStringBrowseCtrl, false);
	}
	else
	{
		SetEnabled(urlStaticCtrl, false);
		SetEnabled(urlBrowseCtrl, false);
		SetEnabled(urlDynamicCtrl.object, true);
		SetEnabled(urlFormatCtrl, true);
		SetEnabled(urlFormatStringBrowseCtrl, true);
	}
}

function onBrowseClicked(ctrl)
{
	var arr = new Array();

	arr.push(".aspx");

	var ret = dw.browseForFileURL("select", "", false, false, arr, "", false);

	if (ret)
	{
		if (ctrl == "LinkedPageStaticURL")
		{
			urlStaticCtrl.value = ret;
		}
		else if (ctrl == "LinkedPageFormatString")
		{
			if (ret.indexOf("?") == (-1))
			{
				ret += "?" + urlDynamicCtrl.get() + "={0}";
			}
			
			urlFormatCtrl.value = ret;
		}
	}
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

		columnObj.setType(DataGridColumn.TYPE_LINK);
		columnObj.setTitle(title);

		if (linkTypeCtrl[0].checked)
		{
			columnObj.setHyperlinkType(DataGridColumn.LINK_TYPE_STATIC);
			columnObj.setHyperlinkData(linkStaticCtrl.value);
		}
		else
		{
			columnObj.setHyperlinkType(DataGridColumn.LINK_TYPE_DYNAMIC);
			columnObj.setHyperlinkData(linkDynamicCtrl.get());
			columnObj.setHyperlinkDataFormat(linkFormatCtrl.value);
		}

		if (urlTypeCtrl[0].checked)
		{
			columnObj.setLinkedPageType(DataGridColumn.LINK_TYPE_STATIC);
			columnObj.setLinkedPageData(urlStaticCtrl.value);
		}
		else
		{
			columnObj.setLinkedPageType(DataGridColumn.LINK_TYPE_DYNAMIC);
			columnObj.setLinkedPageData(urlDynamicCtrl.get());
			columnObj.setLinkedPageDataFormat(urlFormatCtrl.value);
		}

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

