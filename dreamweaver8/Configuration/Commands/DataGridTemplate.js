// Copyright 2002, 2003 Macromedia, Inc. All rights reserved.

var helpDoc = MM.HELP_sbASPNetDataGridTemplate;

var columnInfo = null;
var columnObj = null;
var titleCtrl = null;
var templateCtrl = null;
var contentsCtrl = null;
var submitControlIDCtrl = null;
var submitAsCtrl = null;
var oldTemplateIndex = (-1);

var const_templateNames = new Array("ItemTemplate", "EditItemTemplate");
var const_editItemTemplateIndex = 1;

var templateValues = null;
 
//-----------------------------------------------------------------------------

function initializeUI()
{
	titleCtrl = dwscripts.findDOMObject("Title");
	templateCtrl = new ListControl("Template");
	contentsCtrl = dwscripts.findDOMObject("Contents");
	submitControlIDCtrl = dwscripts.findDOMObject("SubmitControlID");
	submitAsCtrl = new ListControl("SubmitAs");

	columnInfo = dwscripts.getCommandArguments();
	
	if (columnInfo)
	{
		// If there isn't an "Edit" column in this
		// DataGrid, don't enable the EditItemTemplate
		// and associated controls

		var templateArr = new Array();
		templateArr.push(const_templateNames[0]);

		if (!columnInfo.getHasEditColumn())
		{
			templateCtrl.disable();
			submitControlIDCtrl.setAttribute("disable", "disable");
			submitAsCtrl.disable();
		}
		else
		{
			templateArr.push(const_templateNames[1]);				
		}
		
		templateCtrl.setAll(templateArr);

		submitAsCtrl.setAll(columnInfo.getSubmitAsTypes());

		columnObj = columnInfo.getColumnObj();

		if (columnObj)
		{
			titleCtrl.value = columnObj.getTitle();
			templateCtrl.setIndex(0);
			submitControlIDCtrl.value = columnObj.getSubmitControlID();
			submitAsCtrl.pick(columnObj.getSubmitAs());

			// Parse the contents and pick out the inner
			// html for each of the template tags

			templateValues = new Array();

			var contents = columnObj.getTemplateContents();

			for (var i = 0; i < const_templateNames.length; i++)
			{
				var tag = const_templateNames[i];
				var re = new RegExp(dwscripts.sprintf("<%s>([\\s\\S]*)<\\/%s>", tag, tag), "i");
				var innerHtml = "";

				if (contents.search(re) != (-1))
				{
					innerHtml = RegExp.$1;
					innerHtml = dwscripts.trim(innerHtml);
				}

				if ((i == const_editItemTemplateIndex) &&
					((innerHtml.length == 0) ||
					(innerHtml == "&nbsp;")))
				{
					innerHtml = MM.LABEL_DataGridEditItemTemplateDesc;
				}

				templateValues.push(innerHtml);
			}

			onTemplateChanged();
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

function saveCurrentTemplateContents()
{
	if (oldTemplateIndex != (-1))
	{
		templateValues[oldTemplateIndex] = contentsCtrl.value;
	}
}

function onTemplateChanged()
{
	saveCurrentTemplateContents();

	var index = templateCtrl.getIndex();
	var contents = "";

	if (index >= 0)
	{
		contents = templateValues[index];
	}

	contentsCtrl.value = contents;

	if (index == const_editItemTemplateIndex)
	{
		submitControlIDCtrl.removeAttribute("disabled");
		submitAsCtrl.enable();
	}
	else
	{
		submitControlIDCtrl.setAttribute("disabled", "disabled");
		submitAsCtrl.disable();
	}

	oldTemplateIndex = index;
}

function onAddDataFieldClicked()
{
	// Pass the recordset name to the dialog. 

	var expr = dwscripts.callCommand("AddDataField.htm", columnInfo.getDataSetName());

	contentsCtrl.value += expr;
	contentsCtrl.focus();
}

function onOKClicked()
{
	saveCurrentTemplateContents();
	
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

		// Put all of the template contents together
		
		var contents = "";
		var tag;
		
		var descCompare = MM.LABEL_DataGridEditItemTemplateDesc;

		// The edit box does things with the returns, so just
		// ignore them for the comparison.

		descCompare = descCompare.replace(/\n/gi, "");

		for (var i = 0; i < const_templateNames.length; i++)
		{
			var innerHtml = templateValues[i];
			var innerHtmlCompare = dwscripts.trim(innerHtml.replace(/[\n\r]/gi, ""));

			if ((i == const_editItemTemplateIndex) &&
				(innerHtmlCompare == descCompare))
			{
				innerHtml = "";
			}

			if (innerHtml != "")
			{
				tag = const_templateNames[i];
				contents += dwscripts.sprintf("<%s>%s</%s>", tag, innerHtml, tag);
			}
		}

		columnObj.setType(DataGridColumn.TYPE_TEMPLATE);
		columnObj.setTitle(title);
		columnObj.setTemplateContents(contents);
		columnObj.setSubmitControlID(submitControlIDCtrl.value);
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

