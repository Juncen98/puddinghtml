// Copyright 2002, 2003 Macromedia, Inc. All rights reserved.

//************************GLOBAL************************

var helpDoc = MM.HELP_ssDataGridAspNet;

var ID_FIELD = null;
var RECORDSET_FIELD = new RecordsetMenu("DataGrid.htm", "DataSetName", true);
var PAGING_RADIO = null;
var PAGE_SIZE_FIELD = null;
var PAGE_NAV_FIELD = null;
var COLUMNS_GRID = null;
var MOVE_UP_BUTTON = null;
var MOVE_DOWN_BUTTON = null;
var ADD_BUTTON = null;
var DELETE_BUTTON = null;
var EDIT_BUTTON = null;
var CHANGE_TYPE_BUTTON = null;

// Global vars

var isPriorRec = false;
var columnArray = new Array();
var origColumnCount = -1;
var isColumnsTagPresent = false;
var positionID = -1;
var emptyPath = dw.getConfigurationPath() + "/Shared/MM/Cache/empty.htm";
var nodes = null;
var runSyncUI = true;
var insertPageBind = false;
var formNode = null;
var addForm = false;
var setRunatAttribute = false;
var connectionName = null;
var columnInfo = new DataGridColumnInfo();

// Content vars

var dataGridNode;
var columnNode;
var columnNodes = new Array();
var columnNodeObj = new Object();
var columnPosArray = new Array();

// Constants

var const_DATAGRID_OPEN = "<asp:DataGrid id=\"@@id@@\" " + 
           "\r  runat=\"server\" " + 
           "\r  AllowSorting=\"False\" " +
		   "\r  AutoGenerateColumns=\"@@autogenerate@@\" " + 
           "\r  CellPadding=\"@@cellpadding@@\" " +
		   "\r  CellSpacing=\"@@cellspacing@@\" " +
           "\r  ShowFooter=\"@@footer@@\" " +
           "\r  ShowHeader=\"@@header@@\" ";

var const_DATAGRID_END_OPEN = "\r>";
var const_DATAGRID_CLOSE = "\r</asp:DataGrid>";
		   
var const_onCancel = "\r  onCancelCommand=\"@@oncancelcommand@@\" "; 
var const_onDelete = "\r  onDeleteCommand=\"@@ondeletecommand@@\" ";
var const_onEdit   = "\r  onEditCommand=\"@@oneditcommand@@\" "; 
var const_onItemDataBound = "\r  onItemDataBound=\"@@onitemdatabound@@\" "; 
var const_onUpdate = "\r  onUpdateCommand=\"@@onupdatecommand@@\" ";
var const_onPageIndexChanged = "\r  OnPageIndexChanged=\"@@onpageindexchanged@@\" ";
var const_allowPaging = "\r  AllowPaging=\"@@allowpaging@@\" ";
var const_pagerStyle =  "\r  PagerStyle-Mode=\"@@pagerstyle@@\" ";
var const_pageSize = "\r  PageSize=\"@@pagesize@@\" ";
var const_dataSource = "\r  DataSource=\"@@datasource@@\" ";
var const_allowCustomPaging = "\r  AllowCustomPaging=\"@@allowcustompaging@@\" ";
var const_virtualItemCount = "\r  VirtualItemCount=\"@@virtualitemcount@@\" ";

var const_styles = "\r    <HeaderStyle HorizontalAlign=\"center\" BackColor=\"#E8EBFD\" ForeColor=\"#3D3DB6\" Font-Name=\"Verdana, Arial, Helvetica, sans-serif\" Font-Bold=\"true\" Font-Size=\"smaller\" />" +
			"\r    <ItemStyle BackColor=\"#F2F2F2\" Font-Name=\"Verdana, Arial, Helvetica, sans-serif\" Font-Size=\"smaller\" />" +
			"\r    <AlternatingItemStyle BackColor=\"#E5E5E5\" Font-Name=\"Verdana, Arial, Helvetica, sans-serif\" Font-Size=\"smaller\" />" +
			"\r    <FooterStyle HorizontalAlign=\"center\" BackColor=\"#E8EBFD\" ForeColor=\"#3D3DB6\" Font-Name=\"Verdana, Arial, Helvetica, sans-serif\" Font-Bold=\"true\" Font-Size=\"smaller\" />" +
			"\r    <PagerStyle BackColor=\"white\" Font-Name=\"Verdana, Arial, Helvetica, sans-serif\" Font-Size=\"smaller\" />";

var const_columns1 = "\r    <Columns>";
var const_columns2 = "\r    </Columns>";

var const_SIMPLE = "\r      <asp:BoundColumn DataField=\"@@datafield@@\" "+
           "\r        HeaderText=\"@@columntitle@@\" " +
		   "\r        ReadOnly=\"@@readonly@@\" " + 
           "\r        Visible=\"True\"\/>";

var const_FREEFORM = "      <asp:TemplateColumn HeaderText=\"@@columntitle@@\" " + 
           "\r        Visible=\"True\">" +
           "\r@@templatecontents@@" +  
		   "\r      </asp:TemplateColumn>";

var const_HYPERLINK1 = "      <asp:HyperLinkColumn " + 
           "\r        HeaderText=\"@@columntitle@@\" " +
           "\r        Visible=\"True\"";
var const_HYPERLINK2 = "\/>"

var const_linkText = "\r        Text=\"@@hyperlinktext@@\"";
var const_linkNavigateUrl = "\r        NavigateUrl=\"@@staticurl@@\"";
var const_linkDataNavigateUrlField = "\r        DataNavigateUrlField=\"@@dataurlfield@@\"";
var const_linkDataNavigateUrlFormatString = "\r        DataNavigateUrlFormatString=\"@@dataurlformatstring@@\"";
var const_linkDataTextField = "\r        DataTextField=\"@@hyperlinkfield@@\"";
var const_linkDataTextFormatString = "\r        DataTextFormatString=\"@@datatextformatstring@@\"";

var const_EDIT = "\r      <asp:EditCommandColumn " +
           "\r        ButtonType=\"@@buttontype@@\" " + 
           "\r        CancelText=\"@@canceltext@@\" " + 
           "\r        EditText=\"@@edittext@@\" " + 
           "\r        HeaderText=\"@@columntitle@@\" " +
           "\r        UpdateText=\"@@updatetext@@\" " + 
           "\r        Visible=\"True\"\/>";

var const_DELETE = "\r      <asp:ButtonColumn " + 
           "\r        ButtonType=\"@@buttontype@@\" " + 
           "\r        CommandName=\"@@command@@\" " + 
           "\r        HeaderText=\"@@columntitle@@\" " + 
           "\r        Text=\"@@deletetext@@\" " + 
           "\r        Visible=\"True\"\/>";

var const_DataKeyField = "\r        DataKeyField=\"@@datakeyfield@@\"";

var const_nextPrev = "NextPrev";
var const_numeric = "NumericPages";

var NAV_TYPE_NEXTPREV = 0;
var NAV_TYPE_NUMERIC = 1;

var const_TemplateTags = new Array("HeaderTemplate",
								   "ItemTemplate",
								   "EditItemTemplate",
								   "FooterTemplate");

var const_ColumnTypes = new Array(DataGridColumn.TYPE_BOUND,
								  DataGridColumn.TYPE_TEMPLATE,
								  DataGridColumn.TYPE_LINK,
								  DataGridColumn.TYPE_EDIT,
								  DataGridColumn.TYPE_DELETE);

//*************************API**************************

//*-------------------------------------------------------------------
// FUNCTION:
//   canApplyServerBehavior
//
// DESCRIPTION:
//   Returns true if the server behavior can be applied.
//   Otherwise, displays an alert and returns false.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function canApplyServerBehavior(sbObj)
{
  var retVal = true;
  
  if (!sbObj)
  {
    var nameValueArray = RECORDSET_FIELD.findAllRecordsetNames();
    var rsNames = nameValueArray[0];

    if (rsNames.length < 2)	// Don't count the "None" label
    {
      alert(dwscripts.sprintf(MM.MSG_NoRecordsets, dwscripts.getRecordsetDisplayName()));
      retVal = false;
    }
  }
      
  return retVal;
}

//*-------------------------------------------------------------------
// FUNCTION:
//   findServerBehaviors
//
// DESCRIPTION:
//   Locates instances of this server behavior on the current page.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   an array of ServerBehavior objects
//--------------------------------------------------------------------

function findServerBehaviors()
{
  var paramObj = new Object();
  var sbList = new Array();
  var dgNodeList = new Array();
  var partArray = new Array();
  var badFlag = false;
  
  var dom = dw.getDocumentDOM();
  var emptyDom = getEmptyDomIfNeeded(true);

  var emptyArray = emptyDom.getElementsByTagName("asp:DataGrid");
  var docArray = dom.getElementsByTagName("asp:DataGrid");
  
  for (var j = 0; j < docArray.length; j++)
  {
	  dgNodeList.push(docArray[j]);
  }

  if (dgNodeList.length != emptyArray.length)
  {
	if (dgNodeList.length == 0)
	{
		//  This condition can occur if we are in Live Data mode.  In this case,
		//  we want to look for something other than mm:togglevisibility because
		//  the Live Data translator doesn't produce that tag.  Instead, we can
		//  look for lock tags with asp:datagrid in the "orig" attribute.

		docArray = dom.getElementsByTagName("mm:beginlock");

        for (var k = 0; k < docArray.length; k++)
        {
		  if (docArray[k].orig)
		  {
		    var origValue = new String(unescape(docArray[k].orig));
            if (origValue.toLowerCase().indexOf("asp:datagrid") > -1)
	        {
	          dgNodeList.push(docArray[k]);
            }
		  }
        }
	}

    if (dgNodeList.length != emptyArray.length)
	{
      // Something bad happened here, so we're out of sync. Turn on the bad flag.
      badFlag = true;
	}
  }

  for (var i = 0; i < emptyArray.length; i++)
  {
    var sbObj = new SBDataGridDataList(emptyArray[i].id,
	                                    MM.LABEL_TitleDataGrid + " (" + emptyArray[i].id + ")",
                                        (!badFlag) ? dgNodeList[i] : null);

    var sbPart = new SBParticipant("DataGrid_main", (!badFlag) ? dgNodeList[i] : null, 
                                   0, 0, null);
    sbObj.addParticipant(sbPart);
    sbObj.setPosition(i);	
    sbObj.setServerBehaviorFileName("DataGrid.htm");
	sbObj.setDataSetName(decodeDataSource(validateAttribute(emptyArray[i].dataSource)));

	sbList.push(sbObj);
  }

  return sbList;
}

//*-------------------------------------------------------------------
// FUNCTION:
//   applyServerBehavior
//
// DESCRIPTION:
//   adds the server behavior to the users page, based on the UI settings
//
// ARGUMENTS:
//   priorRec - if we are re-applying, the previous SB for this
//              server behavior
//
// RETURNS:
//   string - error message to indicate failure, or the empty string
//            to indicate success
//--------------------------------------------------------------------

function applyServerBehavior(priorRec)
{
	var iHTML = "";
	var origIndex = -1;
	var columnsNode = null;
	var errMsg = ""; 

	if (priorRec)
	{ 
		var emptyDom = getEmptyDomIfNeeded(true);

		nodes = emptyDom.getElementsByTagName("asp:DataGrid");
		dataGridNode = nodes[positionID];

		var dgNodes = dataGridNode.childNodes;

		for (var index=0; index<dgNodes.length; index++)
		{
			if (dgNodes[index].tagName &&
               (dgNodes[index].tagName.toLowerCase() == "columns"))
			{
				columnNode = dgNodes[index];
				columnNodes = columnNode.childNodes;
			}
		}

		errMsg = inspectUI();

		if (errMsg != "")
			return errMsg;

		dataGridNode.id = ID_FIELD.value;
		dataGridNode.setAttribute("Datasource", encodeDataSource(RECORDSET_FIELD.getValue()));

		// We want to update the paging attributes only if it's a standard 
		// recordset

		if (PAGING_RADIO[0].checked)
		{
			var dataSet = RECORDSET_FIELD.getValue();

			dataGridNode.AllowPaging = "true";
			dataGridNode.AllowCustomPaging = "true";
			dataGridNode.PageSize = encodePageSize(dataSet);
			dataGridNode.VirtualItemCount = encodeVirtualItemCount(dataSet);
			dataGridNode.OnPageIndexChanged = (dataSet + ".OnDataGridPageIndexChanged");

			if (PAGE_NAV_FIELD.selectedIndex == NAV_TYPE_NEXTPREV)
			{
				dataGridNode.setAttribute("PagerStyle-Mode", const_nextPrev);
			}
			else
			{
				dataGridNode.setAttribute("PagerStyle-Mode", const_numeric);
			}
		}
		else
		{
			dataGridNode.AllowPaging = "false";
			dataGridNode.removeAttribute("PageSize");
			dataGridNode.removeAttribute("PagerStyle-Mode");
			dataGridNode.removeAttribute("AllowCustomPaging");
			dataGridNode.removeAttribute("VirtualItemCount");
			dataGridNode.removeAttribute("OnPageIndexChanged");
		} 

		// Check to see if there are any Edit or Delete Columns. If there aren't
		// ensure that the appropriate event handlers are removed.

		if (hasColumnOfType(DataGridColumn.TYPE_EDIT) ||
			hasColumnOfType(DataGridColumn.TYPE_DELETE))
		{
			dataGridNode.setAttribute("DataKeyField", columnInfo.getPrimaryKey());
		}
		else
		{
			dataGridNode.removeAttribute("DataKeyField");
		}

		if (hasColumnOfType(DataGridColumn.TYPE_EDIT))
		{
			dataGridNode.setAttribute("onCancelCommand", RECORDSET_FIELD.getValue() + ".OnDataGridCancel");
			dataGridNode.setAttribute("onEditCommand", RECORDSET_FIELD.getValue() + ".OnDataGridEdit");
			dataGridNode.setAttribute("onUpdateCommand", RECORDSET_FIELD.getValue() + ".OnDataGridUpdate");
			dataGridNode.setAttribute("onItemDataBound", RECORDSET_FIELD.getValue() + ".OnDataGridItemDataBound");
		}
		else
		{
			dataGridNode.removeAttribute("onCancelCommand");
			dataGridNode.removeAttribute("onEditCommand");
			dataGridNode.removeAttribute("onUpdateCommand");
			dataGridNode.removeAttribute("onitemdatabound");
		}

		if (hasColumnOfType(DataGridColumn.TYPE_DELETE))
		{
			dataGridNode.setAttribute("onDeleteCommand", RECORDSET_FIELD.getValue() + ".OnDataGridDelete");
		}
		else
		{
			dataGridNode.removeAttribute("onDeleteCommand");
		}

		if (columnArray.length > 0)
		{
			// We have columns to add/update.

			// Check to see if any column has changed position. Ofcourse, the
			// position becomes less important if there weren't any columns
			// to start off with, so check for the original column count too.

			dataGridNode.setAttribute("AutoGenerateColumns", false);

			if (origColumnCount > 0)
			{
				// We got to be real careful with how we update these guys...
				// we don't want the update to mess with the position of 
				// style sub tags. 

				var oHtmlArray = new Array();

				for (var index=0; index<columnNodes.length; index++)
				{
					oHtmlArray.push(columnNodes[index].outerHTML);
				}

				var cNodesLength = columnNodes.length;
				var cArrayLength = columnArray.length;

				if (cNodesLength == cArrayLength)
				{
					// it's a 1-1 mapping. We don't need to worry about either adding or removing columns.

					for (var index=0; index<columnArray.length; index++)
					{	  
						if (columnArray[index].getOriginalIndex() >= 0)
						{    
            				// This is a pre-existent column.

							// Check to see if the column type matches it column type of 
							// the column it is about to replace. If it is the same, we 
							// can just update the attributes, as opposed to updating the
							// outerHTML of the node.

							if (columnArray[index].getType() == columnArray[index].getOriginalType())
							{
								// The types match..

								columnNodes[index].outerHTML = oHtmlArray[columnArray[index].getOriginalIndex()];
								refreshColumnNodes();
								updateColumnNode(columnNodes[index], index);	  
							}
							else
							{	  
								columnNodes[index].outerHTML = buildColumnTags(false, index, index);
								refreshColumnNodes();
							}
						}
						else
						{
							columnNodes[index].outerHTML = buildColumnTags(false, index, index);
							refreshColumnNodes();
						}
					}			 	
				}
				else if (cNodesLength < cArrayLength)
				{
					for (var index1=0; index1 < cNodesLength; index1++)
					{    
						if (columnArray[index1].getOriginalIndex() >= 0)
						{
							if (columnArray[index1].getType() == columnArray[index1].getOriginalType())
							{
								columnNodes[index1].outerHTML = oHtmlArray[columnArray[index1].getOriginalIndex()];
								refreshColumnNodes();
								updateColumnNode(columnNodes[index1], index1);
							}
							else
							{
								columnNodes[index1].outerHTML = buildColumnTags(false, index1, index1);
								refreshColumnNodes();
							}
						}
						else
						{
							columnNodes[index1].outerHTML = buildColumnTags(false, index1, index1);
							refreshColumnNodes();
						} 
					}

					// Ok, we've done the easy part of just mapping new content into 
					// the existing columns. The next part is to now add the extra 
					//  columns.

					for (var index2=cNodesLength; index2<cArrayLength; index2++)
					{
						if (columnArray[index2].getOriginalIndex() >= 0)
						{
							iHtml = columnNode.innerHTML;
							columnNode.innerHTML = iHtml + oHtmlArray[columnArray[index2].getOriginalIndex()];
							refreshColumnNodes();
							updateColumnNode(columnNodes[index2], index2);
						}
						else
						{
							iHtml = columnNode.innerHTML;
							columnNode.innerHTML = iHtml + buildColumnTags(false, index2, index2);
							refreshColumnNodes();
						}
					}	
				}
				else
				{
					// The user has removed some columns. We need to add the columns we have 
					//  and remove the rest.

					for (var index3=0; index3 < cArrayLength; index3++)
					{
						if (columnArray[index3].getOriginalIndex() >= 0)
						{
							if (columnArray[index3].getType() == columnArray[index3].getOriginalType())
							{
								columnNodes[index3].outerHTML = oHtmlArray[columnArray[index3].getOriginalIndex()];
								refreshColumnNodes();
								updateColumnNode(columnNodes[index3], index3);
							}
							else
							{
								columnNodes[index3].outerHTML = buildColumnTags(false, index3, index3);
								refreshColumnNodes(); 
							}
						}
						else
						{
							columnNodes[index3].outerHTML = buildColumnTags(false, index3, index3);
							refreshColumnNodes(); 
						}               
					}

					// Ok, we've done the easy part of just mapping new content into 
					// the existing columns. The next part is to now remove the extra 
					//  columns.

					for (var index4=cArrayLength; index4<cNodesLength; index4++)
					{
						columnNodes[index4].outerHTML = "";
					}

					refreshColumnNodes();
				}
			}
			else
			{
				// We can just plunk the columns into the DataGrid, if there
				// weren't any columns originally.

				var addColumnsTag = true;   
		
				if (isColumnsTagPresent)
				{
					iHtml = columnNode.innerHTML;
					columnNode.innerHTML = iHtml + buildColumnTags(false);
				}
				else
				{
					iHtml = dataGridNode.innerHTML
					dataGridNode.innerHTML = iHtml + buildColumnTags(true);
				}
			}
		}
		else
		{
			// There aren't any columns. We need to delete any columns that
			// may exist.

			dataGridNode.setAttribute("AutoGenerateColumns", true);

			if (origColumnCount > 0)
			{
				// The user has deleted all columns. Blitz the column node's inner html.
		
				if (columnNode)
				{
					columnNode.innerHTML = "";
				}
			}
		}

		// Update the current dom.

		var dom = dreamweaver.getDocumentDOM();
		// NOTE: only update the body! Otherwise our updates to the DataSet node below
		//   will be working with invalid node pointers!!
		storeEmptyDomIfNeeded(emptyDom, true);
	}
	else
	{
		// New object, so we need to just add the columns

		errMsg = inspectUI();

		if (errMsg != "")
			return errMsg;

		var dom = dw.getDocumentDOM();

		fixUpSelection(dom);

		var paramObj = new Object();
		paramObj.InsertText = buildTag(dom);
        dwscripts.queueDocEditsForGroup("DataGrid", paramObj);
	}

	// Update the PageSize and EditOpTable
	// attributes and the EditOpParameters tag
	// of the DataSet tag as appropriate

	var dataSetTag = findDataSetTag(dw.getDocumentDOM(), RECORDSET_FIELD.getValue());
	
	if (dataSetTag)
	{
		var tagEdit = new TagEdit(dataSetTag);
		var childNodes = tagEdit.getChildNodes();

		if (PAGING_RADIO[0].checked)
		{
			tagEdit.setAttribute("PageSize", PAGE_SIZE_FIELD.value);
		}
		else
		{
			tagEdit.removeAttribute("PageSize");
		}

		// Remove the old EditOps tag

		var editOpsTag = null;

		for (var i = 0; i < childNodes.length; i++)
		{
			if (childNodes[i].getTagName() == "EDITOPS")
			{
				editOpsTag = childNodes[i];
				break;
			}
		}

		if (editOpsTag != null)
		{
			var index = dwscripts.findInArray(childNodes, editOpsTag);

			if (index >= 0)
			{
				childNodes.splice(index, 1); // remove the node
			}
		}

		// TODO: Be more selective about updating the EditOps tag

		if (hasColumnOfType(DataGridColumn.TYPE_EDIT) ||
			hasColumnOfType(DataGridColumn.TYPE_DELETE))
		{
			// Build <EditOps> tag

			childNodes.push(buildEditOpsTag());
		}

		tagEdit.setChildNodes(childNodes);
		updateText = tagEdit.getOuterHTML();

		dwscripts.queueNodeEdit(updateText, dataSetTag);
	}

	if (insertPageBind)
	{
		dwscripts.queueDocEdit(const_PageBindDecl, "aboveHTML+5");
		dwscripts.queueDocEdit(const_PageBindTag, "aboveHTML+99");
	}

	dwscripts.applyDocEdits(false);

	if (!priorRec && !addForm && setRunatAttribute)
	{
		formNode.setAttribute("Runat", "server");
	}
	
	return "";
}

//*----------------------------------------------------------------------------
// FUNCTION:
//   inspectServerBehavior
//
// DESCRIPTION:
//   populates the UI based on the SB of the current server behavior
//
// ARGUMENTS: 
//   sbObj - the instance of the server behavior to inspect
//
// RETURNS:
//   nothing
//-----------------------------------------------------------------------------

function inspectServerBehavior(sbObj)
{
  isPriorRec = true;

  // Some initializations...

  isColumnsTagPresent = false;
  originalColumnCount = 0;

  var emptyDom = getEmptyDomIfNeeded(true);
  
  var dom = dreamweaver.getDocumentDOM();
  fixUpSelection(dom);
  
  positionID = sbObj.getPosition();
  
  var offsets = dom.getSelection();

  nodes = emptyDom.getElementsByTagName("asp:DataGrid");

  var tempNodes = emptyDom.getElementsByTagName("MM:PageBind");

  insertPageBind = (tempNodes.length == 0);
  dataGridNode = nodes[positionID];
  
  var dgNodes = dataGridNode.childNodes;
  
  for (var index = 0; index < dgNodes.length; index++)
  {
    if (dgNodes[index].tagName &&
	   (dgNodes[index].tagName.toLowerCase() == "columns"))
	{
	  columnNode = dgNodes[index];
      columnNodes = columnNode.childNodes;
	  isColumnsTagPresent = true;
	  originalColumnCount = columnNodes.length;
	  break;
	}
  }

  syncUI();
}

//*-------------------------------------------------------------------
// FUNCTION:
//   deleteServerBehavior
//
// DESCRIPTION:
//   Removes the selected server behavior from the page
//
// ARGUMENTS: 
//   sbObj - the SB of the server behavior to delete
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function deleteServerBehavior(sbObj)
{
  var pos = sbObj.getPosition();
  var emptyDom = getEmptyDomIfNeeded(true);
  var nodes = emptyDom.getElementsByTagName("asp:datagrid");
  var offsets = dw.getDocumentDOM().getSelection();
  
  if (nodes.length > pos)
  {
    // Remove the PageSize and EditOps attributes of the associated
    // DataSet tag

    var node = nodes[pos];
    var allowPaging = node.getAttribute("allowpaging");
    var dataSetName = decodeDataSource(validateAttribute(node.getAttribute("datasource")));
	
    var tag = findDataSetTag(emptyDom, dataSetName);

    if (tag)
    {
      var tagEdit = new TagEdit(tag);
      var childNodes = tagEdit.getChildNodes();

  	  if (allowPaging && (allowPaging.toLowerCase() == "true"))
  	  {
	      tagEdit.removeAttribute("PageSize");
      }
        
      // Remove the EditOps tag
      var editOpsTag = null;

  		for (var i = 0; i < childNodes.length; i++)
  		{
  			if (childNodes[i].getTagName() == "EDITOPS")
  			{
  				editOpsTag = childNodes[i];
  				break;
  			}
  		}

  		if (editOpsTag != null)
  		{
  			var index = dwscripts.findInArray(childNodes, editOpsTag);
  
  			if (index >= 0)
  			{
  				childNodes.splice(index, 1); // remove the node
  			}
  		}

  		tagEdit.setChildNodes(childNodes);

      tag.outerHTML = tagEdit.getOuterHTML();
    }

	  node.outerHTML = "";
	  storeEmptyDomIfNeeded(emptyDom, false);
    
    dw.getDocumentDOM().setSelection(offsets[0],offsets[0]);
  }

  return true;
}

function analyzeServerBehavior(sbObj, allRecs)
{
	var isIncomplete = false;
	var dataSetName = sbObj.getDataSetName();

	// Is the DataSet name valid?

	if (!RECORDSET_FIELD.rsNameIsValid(dataSetName))
	{
		isIncomplete = true;
	}

	sbObj.incomplete = isIncomplete;
}

//*-------------------------------------------------------------------
// FUNCTION:
//   copyServerBehavior
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------

function copyServerBehavior(sbObj)
{
  var pos = sbObj.getPosition();
  var emptyDom = getEmptyDomIfNeeded(true);
  var nodes = emptyDom.getElementsByTagName("asp:DataGrid");
  
  sbObj.oHTML = nodes[pos].outerHTML;
}

//*-------------------------------------------------------------------
// FUNCTION:
//   pasteServerBehavior
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------

function pasteServerBehavior(sbObj)
{
  if (sbObj.oHTML)
  {
    var emptyDom = dwscripts.getEmptyDOM();

	emptyDom.documentElement.outerHTML = sbObj.oHTML;
	emptyDom = dw.getDocumentDOM(emptyPath);
	
	var nodes = emptyDom.getElementsByTagName("asp:DataGrid");
	
	if (nodes.length > 0)
	{
	   nodes[0].setAttribute("ID", CreateNewName(MM.LABEL_DataGridBaseName, nodes));
       dw.getDocumentDOM().insertHTML(nodes[0].outerHTML);
	}
	else
	{
       dw.getDocumentDOM().insertHTML(sbObj.oHTML);
	}
  }
}

function buildEditOpsTag()
{
	var mainTag = new TagEdit("<EditOps></EditOps>");
	var nodes = mainTag.getChildNodes();
	var tag;

	// Fist add the table

	tag = "<EditOpsTable Name=\"" + columnInfo.getTableName() + "\" />";
	nodes.push(new TagEdit(tag));

	// Remember the primary key

	var primaryKeyName = columnInfo.getPrimaryKey();
	var primaryKeyType = columnInfo.getPrimaryKeySubmitAs();
	var addedPrimaryKey = false;

	var paramName;
	var paramType;

	for (var i = 0; i < columnArray.length; i++)
	{
		if (columnArray[i].isEditable())
		{
			switch (columnArray[i].getType())
			{
				case DataGridColumn.TYPE_BOUND:
					paramName = columnArray[i].getDataField();
					paramType = columnArray[i].getSubmitAs();
					break;

				case DataGridColumn.TYPE_TEMPLATE:
					paramName = columnArray[i].getSubmitControlID();
					paramType = columnArray[i].getSubmitAs();
					break;

				default:
					alert("Unsupported 'Editable' column type.");
					break;
			}	 

			tag = "<Parameter Name=\"" + paramName + "\" Type=\"" + paramType + "\""; 
			
			if (paramName == primaryKeyName)
			{
				tag += " IsPrimary=\"true\"";
				addedPrimaryKey = true;
			}
			
			tag += " />";
			
			nodes.push(new TagEdit(tag));
		}
	}

	if (!addedPrimaryKey)
	{
		tag = "<Parameter Name=\"" + primaryKeyName + "\" Type=\"" + primaryKeyType + "\" IsPrimary=\"true\" />";
		nodes.push(new TagEdit(tag));
	}

	mainTag.setChildNodes(nodes);

	return mainTag;
}

function buildTag(dom)
{
  var offsets = dom.getSelection();
  var tagStr = "";
  var currSel = dreamweaver.offsetsToNode(offsets[0], offsets[1]);

  formNode = isInsideForm(currSel)
  
  if (!formNode)
  {
    addForm = true;
    tagStr = tagStr + const_formOpen;
  } 

  tagStr = tagStr + const_DATAGRID_OPEN;
  tagStr = tagStr.replace("@@id@@", ID_FIELD.value);

  // DataSource

  tagStr += const_dataSource;
  tagStr = tagStr.replace("@@datasource@@", encodeDataSource(RECORDSET_FIELD.getValue()));
  
  if (columnArray.length > 0)
  {
    tagStr = tagStr.replace("@@autogenerate@@", "false");
  }
  else 
  {
    tagStr = tagStr.replace("@@autogenerate@@", "true");
  }

  tagStr = tagStr.replace("@@cellpadding@@", "3");
  tagStr = tagStr.replace("@@cellspacing@@", "0");
  tagStr = tagStr.replace("@@footer@@", "false");
  tagStr = tagStr.replace("@@header@@", "true");

  // If the user is using a standard recordset, let's check to see if any 
  // events need to be added.
  
    // Set paging style

    tagStr += const_pagerStyle;

    if (PAGE_NAV_FIELD.selectedIndex == 0)
    {
	  tagStr = tagStr.replace("@@pagerstyle@@", const_nextPrev);
    }
	else 
    {
	  tagStr = tagStr.replace("@@pagerstyle@@", const_numeric);
    }

    // AllowPaging
    
    if (PAGING_RADIO[0].checked)
	{
	  var dataSet = RECORDSET_FIELD.getValue();

	  tagStr += const_allowPaging;
      tagStr = tagStr.replace("@@allowpaging@@", "true")

	  tagStr += const_allowCustomPaging;
      tagStr = tagStr.replace("@@allowcustompaging@@", "true")

      tagStr += const_pageSize;
      tagStr = tagStr.replace("@@pagesize@@", encodePageSize(dataSet));
      
	  tagStr += const_virtualItemCount;
      tagStr = tagStr.replace("@@virtualitemcount@@", encodeVirtualItemCount(dataSet));

	  tagStr += const_onPageIndexChanged;   
      tagStr = tagStr.replace("@@onpageindexchanged@@", (dataSet + ".OnDataGridPageIndexChanged"));
    }
	
	if (hasColumnOfType(DataGridColumn.TYPE_EDIT) ||
			hasColumnOfType(DataGridColumn.TYPE_DELETE))
	{
	  tagStr = tagStr += const_DataKeyField;
	  tagStr = tagStr.replace("@@datakeyfield@@", columnInfo.getPrimaryKey());
	  
	  // If there's an editcommand column, add the the appropriate events.

	  if (hasColumnOfType(DataGridColumn.TYPE_EDIT))
	  {
        tagStr += const_onCancel;
	    tagStr += const_onEdit;
	    tagStr += const_onUpdate;
	    tagStr += const_onItemDataBound;
      
	    tagStr = tagStr.replace("@@oncancelcommand@@",  RECORDSET_FIELD.getValue() + ".OnDataGridCancel");
	    tagStr = tagStr.replace("@@oneditcommand@@", RECORDSET_FIELD.getValue() + ".OnDataGridEdit");
	    tagStr = tagStr.replace("@@onupdatecommand@@", RECORDSET_FIELD.getValue() + ".OnDataGridUpdate");
	    tagStr = tagStr.replace("@@onitemdatabound@@", RECORDSET_FIELD.getValue() + ".OnDataGridItemDataBound");
	  }
	    
      // If there's a delete button column, add the appropriate events.
    
	  if (hasColumnOfType(DataGridColumn.TYPE_DELETE))
	  {
        tagStr += const_onDelete;
        tagStr = tagStr.replace("@@ondeletecommand@@", RECORDSET_FIELD.getValue() + ".OnDataGridDelete");
      } 
    }

  tagStr += const_DATAGRID_END_OPEN;

  // style templates can go immediately within the datagrid tag...

  tagStr = tagStr + buildStyleTags();

  // columnObj goes here...
  
  tagStr = tagStr + buildColumnTags(true); 

  tagStr = tagStr + const_DATAGRID_CLOSE;

  if (addForm)
  {
    tagStr += const_formClose;
  }

  return tagStr;
}

function buildStyleTags()
{
  return const_styles;
}

function buildColumnTags(includeColumns, startIndex, stopIndex)
{
  var retStr = "";

  if (startIndex == null)
    startIndex = 0;

  if (stopIndex == null)
    stopIndex = (columnArray.length - 1);

  if (includeColumns)
    retStr = const_columns1;

  for (var i = startIndex; i <= stopIndex; i++)
  {
    switch (columnArray[i].getType())
	{
      case DataGridColumn.TYPE_BOUND: // Simple
      {
	    retStr = retStr + const_SIMPLE;
		retStr = retStr.replace("@@datafield@@", columnArray[i].getDataField());
		// TODO: Only output ReadOnly attribute if true
		retStr = retStr.replace("@@readonly@@", columnArray[i].getIsReadOnly() ? "true" : "false");
		break;
      }

      case DataGridColumn.TYPE_TEMPLATE: //Free Form
      {
	    var contents = columnArray[i].getTemplateContents();

	  	for (var j = 0; j < const_TemplateTags.length; ++j)
		{
		  contents = ensureEditableContentTag(contents, const_TemplateTags[j]);
        }

	    retStr = retStr + const_FREEFORM;
        retStr = retStr.replace("@@templatecontents@@", contents);
        break;
      }

      case DataGridColumn.TYPE_LINK: // HyperLink
      {
	    retStr = retStr + const_HYPERLINK1;

        if (columnArray[i].getHyperlinkType() == DataGridColumn.LINK_TYPE_STATIC)
		{
          retStr = retStr + const_linkText;
          retStr = retStr.replace("@@hyperlinktext@@", columnArray[i].getHyperlinkData());
        }
		else
		{
          retStr = retStr + const_linkDataTextField;
		  retStr = retStr.replace("@@hyperlinkfield@@", columnArray[i].getHyperlinkData());

          var fmtString = columnArray[i].getHyperlinkDataFormat();

		  if (fmtString && (fmtString != ""))
		  {
		    retStr = retStr + const_linkDataTextFormatString;
		    retStr = retStr.replace("@@datatextformatstring@@", fmtString);
		  }
		}
        
		if (columnArray[i].getLinkedPageType() == DataGridColumn.LINK_TYPE_STATIC)
		{
	      retStr = retStr + const_linkNavigateUrl;
          retStr = retStr.replace("@@staticurl@@", columnArray[i].getLinkedPageData());
        }
		else
		{
          retStr = retStr + const_linkDataNavigateUrlField;
		  retStr = retStr.replace("@@dataurlfield@@", columnArray[i].getLinkedPageData());

          var fmtString = columnArray[i].getLinkedPageDataFormat();

		  if (fmtString && (fmtString != ""))
		  {
		    retStr = retStr + const_linkDataNavigateUrlFormatString;
		    retStr = retStr.replace("@@dataurlformatstring@@", fmtString);
		  }
	    }
        
		retStr = retStr + const_HYPERLINK2;  
        break;
      }

      case DataGridColumn.TYPE_EDIT: // Edit Command
      {
	    retStr = retStr + const_EDIT;

        if (columnArray[i].getButtonType() == DataGridColumn.BUTTON_TYPE_LINK)
        {
		  retStr = retStr.replace("@@buttontype@@", "LinkButton");
        }
		else 
        {
		  retStr = retStr.replace("@@buttontype@@", "PushButton");
        }
		
		retStr = retStr.replace("@@canceltext@@", MM.LABEL_CancelCmdText);
        retStr = retStr.replace("@@edittext@@", MM.LABEL_EditCmdText);
        retStr = retStr.replace("@@updatetext@@", MM.LABEL_UpdateCmdText);
		break;
      }

      case DataGridColumn.TYPE_DELETE: // Delete
      {
	    retStr = retStr + const_DELETE;

        if (columnArray[i].getButtonType() == DataGridColumn.BUTTON_TYPE_LINK)
        {
		  retStr = retStr.replace("@@buttontype@@", "LinkButton");
        }
		else 
        {
		  retStr = retStr.replace("@@buttontype@@", "PushButton");
        }
		
		retStr = retStr.replace("@@command@@", "Delete");
        retStr = retStr.replace("@@deletetext@@", MM.LABEL_CTDelete);
        break;
      }
    }

    retStr = retStr.replace("@@columntitle@@", columnArray[i].getTitle());
  }

  if (includeColumns)
    retStr = retStr + const_columns2;  

  return retStr;
}

function buildColumnArray()
{
  columnArray.splice(0, columnArray.length);
 
  origColumnCount = columnNodes.length;
  
  for (var i = 0; i < columnNodes.length; i++)
  {    
    var tagName = columnNodes[i].tagName;
	var columnObj;

    if (tagName.toLowerCase() == "asp:boundcolumn")
	{  
	  var readOnly = columnNodes[i].getAttribute("ReadOnly");
	  
	  columnObj = buildColumnObject(DataGridColumn.TYPE_BOUND, i);	  
      columnObj.setTitle(validateAttribute(columnNodes[i].getAttribute("HeaderText"), MM.LABEL_DefaultColumnTitle));
	  columnObj.setDataField(validateAttribute(columnNodes[i].getAttribute("DataField")));
	  columnObj.setIsReadOnly(readOnly && (readOnly.toLowerCase() == "true"));
    }
	else if (tagName.toLowerCase() == "asp:templatecolumn")
	{
      columnObj = buildColumnObject(DataGridColumn.TYPE_TEMPLATE, i);
	  columnObj.setTitle(validateAttribute(columnNodes[i].getAttribute("HeaderText"), MM.LABEL_DefaultColumnTitle));
      columnObj.setTemplateContents(dwscripts.trim(columnNodes[i].innerHTML));
	}
	else if (tagName.toLowerCase() == "asp:hyperlinkcolumn")
	{  
      columnObj = buildColumnObject(DataGridColumn.TYPE_LINK, i);
	  columnObj.setTitle(validateAttribute(columnNodes[i].getAttribute("HeaderText"), MM.LABEL_DefaultColumnTitle));
	  
	  var dataTxtFld = columnNodes[i].getAttribute("DataTextField")
	  
	  if (!dataTxtFld)
	  {
        columnObj.setHyperlinkType(DataGridColumn.LINK_TYPE_STATIC);
        
		var lnk = columnNodes[i].getAttribute("Text");
		
		columnObj.setHyperlinkData(lnk ? lnk : "");
	  }
	  else
	  {
		var fmt = columnNodes[i].getAttribute("DataTextFormatString");
        
		columnObj.setHyperlinkType(DataGridColumn.LINK_TYPE_DYNAMIC);
        columnObj.setHyperlinkData(dataTxtFld);
		columnObj.setHyperlinkDataFormat(fmt ? fmt : "");
	  }
	  
	  if (!columnNodes[i].getAttribute("DataNavigateUrlField"))
	  {
        columnObj.setLinkedPageType(DataGridColumn.LINK_TYPE_STATIC);
		columnObj.setLinkedPageData(columnNodes[i].getAttribute("NavigateUrl"));
	  }
	  else
	  {
		var fmt = columnNodes[i].getAttribute("DataNavigateUrlFormatString");

        columnObj.setLinkedPageType(DataGridColumn.LINK_TYPE_DYNAMIC);
        columnObj.setLinkedPageData(columnNodes[i].getAttribute("DataNavigateUrlField"));
		columnObj.setLinkedPageDataFormat(fmt ? fmt : "");
	  }
 	}
	else if (tagName.toLowerCase() == "asp:editcommandcolumn")
	{  
      columnObj = buildColumnObject(DataGridColumn.TYPE_EDIT, i);
	  columnObj.setTitle(validateAttribute(columnNodes[i].getAttribute("HeaderText"), MM.LABEL_DefaultColumnTitle));
      columnObj.setButtonType(DataGridColumn.BUTTON_TYPE_LINK);

	  var btnType = columnNodes[i].getAttribute("ButtonType");
	  
	  if (btnType && (btnType == "PushButton"))
	  {
	    columnObj.setButtonType(DataGridColumn.BUTTON_TYPE_PUSH);
	  }
	}
	else if (tagName.toLowerCase() == "asp:buttoncolumn")
	{
      var cmdName = columnNodes[i].getAttribute("CommandName");
	  
	  if (cmdName)
	  {   
        if (cmdName.toLowerCase() == "delete")
		{
          // Possibly one of our columns
          
		  columnObj = buildColumnObject(DataGridColumn.TYPE_DELETE, i);
		  columnObj.setTitle(validateAttribute(columnNodes[i].getAttribute("HeaderText"), MM.LABEL_DefaultColumnTitle));
	    }
		else
		{
          // Don't know about this guy. Ignore 'im for now.
          
		  columnObj = buildColumnObject(DataGridColumn.TYPE_OTHER, i);
          columnObj.setTitle(validateAttribute(columnNodes[i].getAttribute("HeaderText"), " "));
	    }
	  }
	  else
	  {
        // Don't know about this guy. Ignore 'im for now.
        
		columnObj = buildColumnObject(DataGridColumn.TYPE_OTHER, i);
        columnObj.setTitle(validateAttribute(columnNodes[i].getAttribute("HeaderText"), " "));
	  }
	  
	  var btnType = columnNodes[i].getAttribute("ButtonType");
	  
	  columnObj.setButtonType(DataGridColumn.BUTTON_TYPE_LINK);

	  if (btnType && (btnType == "PushButton"))
      {
        columnObj.setButtonType(DataGridColumn.BUTTON_TYPE_PUSH);
	  }
    }
	else
	{
	  columnObj = buildColumnObject(DataGridColumn.TYPE_OTHER, 0);
	}
 
	if (columnObj.getType() != DataGridColumn.TYPE_OTHER)
	{
	  columnArray.push(columnObj);
    }
  }
}

function buildColumnObject(type, index)
{
	var obj = new DataGridColumn();

	obj.setType(type);
	obj.setOriginalType(type);
	obj.setOriginalIndex(index);

	return obj;
}

function updateColumnNode(node, index)
{
  var oldTagName = "";
  var obj = columnArray[index];

  if (obj.getType() != DataGridColumn.TYPE_OTHER)
  {
    node.HeaderText = obj.getTitle();

    switch (obj.getType())
	{
      case DataGridColumn.TYPE_BOUND:
	  {
	    node.DataField = obj.getDataField();
	    node.ReadOnly = obj.getIsReadOnly();

		if (oldTagName.toLowerCase() == "asp:templatecolumn")
		{
          node.innerHTML = "";   
		}
		
		break;
	  }
	    
	  case DataGridColumn.TYPE_TEMPLATE:
      {
	    var contents = columnArray[index].getTemplateContents();

	  	for (var j = 0; j < const_TemplateTags.length; ++j)
		{
		  contents = ensureEditableContentTag(contents, const_TemplateTags[j]);
        }

        node.innerHTML = contents;
        break;
      }

      case DataGridColumn.TYPE_LINK:
      {
	    if (obj.getHyperlinkType() == DataGridColumn.LINK_TYPE_STATIC)
		{
	      node.removeAttribute("DataTextField");
	      node.removeAttribute("DataTextFormatString");

          node.setAttribute("Text", obj.getHyperlinkData());
        }
		else
		{
          node.removeAttribute("Text");

          node.setAttribute("DataTextField", obj.getHyperlinkData());
          node.setAttribute("DataTextFormatString", obj.getHyperlinkDataFormat());
        }
                
		if (obj.getLinkedPageType() == DataGridColumn.LINK_TYPE_STATIC)
		{
          node.removeAttribute("DataNavigateUrlField");
          node.removeAttribute("DataNavigateUrlFormatString");
        
		  node.setAttribute("NavigateUrl", obj.getLinkedPageData());
        }
		else 
        {
          node.removeAttribute("NavigateUrl");

          node.setAttribute("DataNavigateUrlField", obj.getLinkedPageData());
          node.setAttribute("DataNavigateUrlFormatString", obj.getLinkedPageDataFormat());
        }
			
        break;
      }

	  case DataGridColumn.TYPE_EDIT:
	  {
	    if (obj.getButtonType() == DataGridColumn.BUTTON_TYPE_LINK) 
	    {
          node.ButtonType = "LinkButton";
		}
        else 
		{
          node.ButtonType = "PushButton";
        }

        node.CancelText = validateAttribute(node.CancelText, MM.LABEL_CancelCmdText);
        node.EditText = validateAttribute(node.EditText, MM.LABEL_EditCmdText);
        node.UpdateText = validateAttribute(node.UpdateText, MM.LABEL_UpdateCmdText);
        break;
      }

	  case DataGridColumn.TYPE_DELETE:
	  {
	    if (obj.getButtonType() == DataGridColumn.BUTTON_TYPE_LINK) 
	    {
          node.ButtonType = "LinkButton";
        }
        else 
        {
          node.ButtonType = "PushButton";
        }
		            
        node.Text = validateAttribute(node.Text, "Delete");
		break;
      }
	              
	  case DataGridColumn.TYPE_OTHER:
	      // This must of type "other". Don't do anything.
	      break;

      default:
	    break;
    }
  }
}

function refreshColumnNodes()
{
  if (isPriorRec)
  {
    if (dataGridNode)
	{
      var dgNodes = dataGridNode.childNodes;

      for (var index = 0; index < dgNodes.length; index++)
      {
        if (dgNodes[index].tagName &&
           (dgNodes[index].tagName.toLowerCase() == "columns"))
		{
	      columnNode = dgNodes[index];
          columnNodes = columnNode.childNodes;
	    }
	  }
    }
  }
}

function hasColumnOfType(type)
{
  var retVal = false;

  for (var i = 0; i < columnArray.length; i++)
  {
    if (columnArray[i].getType() == type)
	{
      retVal = true;
	  break;
	}
  }

  return retVal;
}

//*******************LOCAL FUNCTIONS*******************************************

function initializeUI()
{
	RECORDSET_FIELD.initializeUI();
	ID_FIELD = dwscripts.findDOMObject("ID");
	PAGING_RADIO = dwscripts.findDOMObject("RecordCount");
	PAGE_SIZE_FIELD = dwscripts.findDOMObject("RecordCountEdit");
	PAGE_NAV_FIELD = dwscripts.findDOMObject("PageNavigationSelect");
	COLUMNS_GRID = new TreeControlWithNavControls("ColumnsGrid");
	ADD_BUTTON = new ImageButton("AddButton", "ADD_BUTTON", "sSd", false);
	DELETE_BUTTON = new ImageButton("RemoveButton", "DELETE_BUTTON", "sSd", false);
	EDIT_BUTTON = dwscripts.findDOMObject("EditButton");
	CHANGE_TYPE_BUTTON = dwscripts.findDOMObject("ChangeTypeButton");
	MOVE_UP_BUTTON = new ImageButton("MoveUp", "MOVE_UP_BUTTON", "sSd", false);
	MOVE_DOWN_BUTTON = new ImageButton("MoveDown", "MOVE_DOWN_BUTTON", "sSd", false);

	COLUMNS_GRID.setColumnNames(MM.LABEL_DataGridColunmNames);

	isPriorRec = false;

	setTimeout("syncUI()", 100);
}

function syncUI()
{
	if (runSyncUI)
	{
		runSyncUI = false;

		if (isPriorRec)
		{
			var dataSetName = decodeDataSource(validateAttribute(dataGridNode.getAttribute("Datasource")));
			var dataSetTag = findDataSetTag(dw.getDocumentDOM(), dataSetName);

			// The Grid is using the dataset tag, look for the
			// PageSize attribute of the dataset tag.

			var datasetPageInfo = syncToDataSetBefore(dataGridNode, dataSetTag, dataSetName);

			ID_FIELD.value = dataGridNode.getAttribute("ID");
			RECORDSET_FIELD.pick(dataSetName);

			// Don't get any paging attribute values, unless it's an MM recordset.

			PAGE_NAV_FIELD.selectedIndex = NAV_TYPE_NEXTPREV;

			var pagerStyleMode = dataGridNode.getAttribute("PagerStyle-Mode");

			if (pagerStyleMode && (pagerStyleMode.toLowerCase() == const_numeric.toLowerCase()))
			{
				PAGE_NAV_FIELD.selectedIndex = NAV_TYPE_NUMERIC;
			}

			var allowPaging = datasetPageInfo.allowPaging;
			var pagingType;

			if (allowPaging && (allowPaging.toLowerCase() == "true"))
			{
				PAGING_RADIO[0].checked = true;
				PAGE_SIZE_FIELD.value = datasetPageInfo.pageSize;
				pagingType = "numeric";
			}
			else
			{
				PAGING_RADIO[1].checked = true;
				pagingType = "all";
			}

			buildColumnArray();

			if (columnArray.length > 0)
			{
				syncToDataSetAfter(dataSetTag);
				syncToColumnArray();
			}
						
			onPagingTypeChanged(pagingType);
		}
		else
		{
			checkFormTags(MM.LABEL_TitleDataGrid);

			var emptyDom = getEmptyDomIfNeeded(true);
			var pageBindNodes = emptyDom.getElementsByTagName("MM:PageBind");
			var nodes = emptyDom.getElementsByTagName("asp:DataGrid");

			insertPageBind = (pageBindNodes.length == 0);

			ID_FIELD.value = CreateNewName(MM.LABEL_DataGridBaseName, nodes);
			PAGE_NAV_FIELD.selectedIndex = 0;
		}

		updateUICommands();
	}
  
  elts = document.forms[0].elements;
  if (elts && elts.length)
  {
    elts[0].focus();
    elts[0].select();
  }
}

function syncToColumnArray()
{
	// Clear the grid

    COLUMNS_GRID.setAllRows(new Array());

	for (var i = 0; i < columnArray.length; i++)
	{
		var rowText = columnArray[i].getTitle() + "|" + columnArray[i].getType();
		COLUMNS_GRID.addRow(rowText);
	}

	COLUMNS_GRID.setRowIndex(0);
}

function syncToDataSetBefore(node, dataSetTag, dataSetName)
{
	// PageSize

	var usePageSize = false;

	var datasetPageInfo = new Object();
	datasetPageInfo.allowPaging = node.allowPaging;
	datasetPageInfo.pageSize = node.pageSize;

	if (encodePageSize(dataSetName) == node.pageSize)
	{
		if (dataSetTag)
		{
			var rsPageSize = dataSetTag.getAttribute("PageSize");

			if (rsPageSize && (rsPageSize != ""))
			{
				datasetPageInfo.pageSize = rsPageSize;
				usePageSize = true;
			}
		}
	}

	if (!usePageSize)
	{
		datasetPageInfo.allowPaging = "false";
		datasetPageInfo.pageSize = 10;   
	}

	return datasetPageInfo;
}

function syncToDataSetAfter(dataSetTag)
{
	// EditOps

	if (dataSetTag)
	{
		var editOpsTags = dataSetTag.getElementsByTagName("EditOps");

		if (editOpsTags.length > 0)
		{
			var tableTags = editOpsTags[0].getElementsByTagName("EditOpsTable");

			if (tableTags.length > 0)
			{
				columnInfo.setTableName(tableTags[0].getAttribute("Name"));
			}

			var paramTags = editOpsTags[0].getElementsByTagName("Parameter");
			var columnIndex = 0;

			for (var i = 0; i < paramTags.length; i++)
			{
				var paramName = paramTags[i].getAttribute("Name");
				var paramType = paramTags[i].getAttribute("Type");
				var paramIsPrimary = paramTags[i].getAttribute("IsPrimary");

				// Find the next "editable" column and
				// update the column info

				while ((columnIndex < columnArray.length) && 
						!columnArray[columnIndex].isEditable())
				{
					columnIndex++;
				}

				if (columnIndex < columnArray.length)
				{
					var columnObj = columnArray[columnIndex++];

					switch (columnObj.getType())
					{
						case DataGridColumn.TYPE_BOUND:
							columnObj.setDataField(paramName);
							columnObj.setSubmitAs(paramType);
							break;

						case DataGridColumn.TYPE_TEMPLATE:
							columnObj.setSubmitControlID(paramName);
							columnObj.setSubmitAs(paramType);
							break;

						default:
							alert("Unsupported 'Editable' column type.");
							break;
					}

					if (paramIsPrimary)
					{
						columnInfo.setPrimaryKey(paramName);
						columnInfo.setPrimaryKeySubmitAs(paramType);
					}
				}
				else
				{
					// This extra parameter is for the Primary Key

					columnInfo.setPrimaryKey(paramName);
					columnInfo.setPrimaryKeySubmitAs(paramType);
				}
			}
		}
	}
}

function inspectUI()
{
	if (dwscripts.trim(ID_FIELD.value) == "")
	{
		ID_FIELD.focus();
		return MM.MSG_EmptyID;
	}

	if (!dwscripts.isValidVarName(ID_FIELD.value, true))
	{
		ID_FIELD.focus();
		return MM.MSG_InvalidID;
	}

	if (isDupeID(ID_FIELD.value, "asp:datagrid", getEmptyDomIfNeeded(true), positionID))
	{
		ID_FIELD.focus();
		return MM.MSG_DupeDataGrid;
	}

	var dataSetName = RECORDSET_FIELD.getValue();

	if (!dataSetName || (dataSetName == MM.LABEL_None))
	{
		return MM.MSG_NoDataSetName;
	}

	return "";
}

// ***************** EVENT HANDLERS *******************************************

function onDataSetChanged()
{
	do
	{
		// Auto-populate, but only if the dataset changed
			
		var dataSetName = RECORDSET_FIELD.getValue();
		var oldDataSet = columnInfo.getDataSetName();

		if (dataSetName == oldDataSet)
			break;

		syncColumnInfo();

		// Clear the column array

		columnArray.splice(0, columnArray.length);

		var fields = columnInfo.getDataFieldNames();
		var types = columnInfo.getDataFieldTypes();

		if (fields  && fields.length && types && types.length)
		{
			for (var i = 0; i < fields.length; ++i)
			{
				var columnObj = new DataGridColumn();

				columnObj.setType(DataGridColumn.TYPE_BOUND);
				columnObj.setTitle(fields[i]);
				columnObj.setDataField(fields[i]);
				columnObj.setIsReadOnly(true);
				columnObj.setSubmitAs(types[i]);

				columnArray.push(columnObj);
			}
		}

		syncToColumnArray();
	}
	while (false);
}

function syncColumnInfo()
{
	var dataSetName = RECORDSET_FIELD.getValue();
	var oldDataSet = columnInfo.getDataSetName();

	do
	{
		if (dataSetName == oldDataSet)
			break;
			
		columnInfo.setDataSetName(dataSetName);

		var connectionName = "";
		var fields = new Array();
		var types = new Array();
		var tables = new Array();
		var allTypes = new Array();
			
		if (dataSetName)
		{
			var sbs = dwscripts.findGroup("Recordset", MM.LABEL_TitleDataSet + " (@@RecordsetName@@)", SBRecordsetASPNET);

			// The stored procedures on the page may return a recordset. Add a datasource for
			// each recordset returned from a stored procedure.

			var sps = dwscripts.getServerBehaviorsByFileName("StoredProc.htm");

			for (var k = 0; k < sps.length; k++)
			{
				if (sps[k].createsDataSet())
				{
					sbs.push(sps[k]);
				}
			}

			for (var i = 0; i < sbs.length; ++i)
			{
				if (sbs[i].getRecordsetName().toLowerCase() == dataSetName.toLowerCase())
				{
					connectionName = sbs[i].getConnectionName();
					tables = dwscripts.getTableNames(connectionName);
									
					var fieldAndTypeArray = sbs[i].getRecordsetBindings();
					var databaseType = MMDB.getDatabaseType(connectionName);
					
					allTypes = SBDatabaseCallASPNET.getParamTypeList(databaseType);

					if (fieldAndTypeArray)
					{
						for (var j = 0; j < fieldAndTypeArray.length; j += 2)
						{
							fields.push(fieldAndTypeArray[j]);
							
							if (fieldAndTypeArray[j+1] != undefined)
							{
								types.push(dwscripts.getDBColumnTypeAsString(fieldAndTypeArray[j+1], databaseType));
							}
							else
							{
								types.push("");
							}
						}
					}

					break;
				}
			}
		}

		columnInfo.setConnectionName(connectionName);
		columnInfo.setTableChoices(tables);
		columnInfo.setDataFieldChoices(fields, types);				
		columnInfo.setSubmitAsTypes(allTypes);
	}
	while (false);
}

function onPagingTypeChanged(value)
{
	switch (value)
	{
		case 'number': 
			SetEnabled(PAGE_SIZE_FIELD, true);
			SetEnabled(PAGE_NAV_FIELD, true);
			break;

		case 'all':
			SetEnabled(PAGE_SIZE_FIELD, false);
			SetEnabled(PAGE_NAV_FIELD, false);
			break;
	}
}

function onAddButtonClicked()
{
	if (ADD_BUTTON.disabled)
		return;
		
	if (RECORDSET_FIELD.getValue() == MM.LABEL_None)
		return;

	var menu = new PopupMenu();

	for (var i = 0; i < const_ColumnTypes.length; i++)
	{
		menu.addItem(const_ColumnTypes[i]);
	}
	
	var selected = menu.popup();

	if (selected)
	{
		var dlg = getColumnDialog(selected);
		var columnObj = new DataGridColumn();
		
		syncColumnInfo();

		columnInfo.setColumnObj(columnObj);
		columnInfo.setHasEditColumn(hasColumnOfType(DataGridColumn.TYPE_EDIT));

		var ret = dwscripts.callCommand(dlg, columnInfo);

		if (ret)
		{
			var rowText = columnObj.getTitle() + "|" + columnObj.getType();
			
			COLUMNS_GRID.appendRow(rowText);
			columnInfo = ret;
			columnArray.push(columnObj);

			updateUICommands();
		}
	}
}

function onEditButtonClicked()
{
	var index = COLUMNS_GRID.getRowIndex();
	var columnObj = columnArray[index];
	
	syncColumnInfo();

	columnInfo.setColumnObj(columnObj);
	columnInfo.setHasEditColumn(hasColumnOfType(DataGridColumn.TYPE_EDIT));

	var dlg = getColumnDialog(columnObj.getType());
	var ret = dwscripts.callCommand(dlg, columnInfo);

	if (ret)
	{
		// Update the column entry

		var rowText = columnObj.getTitle() + "|" + columnObj.getType();

		COLUMNS_GRID.setRow(rowText);
		columnInfo = ret;

		updateUICommands();
	}
}

function onChangeTypeButtonClicked()
{
	var index = COLUMNS_GRID.getRowIndex();

	if (index >= 0)
	{
		var columnObj = columnArray[index];
		var menu = new PopupMenu();

		for (var i = 0; i < const_ColumnTypes.length; i++)
		{
			if (const_ColumnTypes[i] != columnObj.getType())
			{
				menu.addItem(const_ColumnTypes[i]);
			}
		}

		var selected = menu.popup();

		if (selected)
		{
			var dlg = getColumnDialog(selected);
		
			syncColumnInfo();

			columnInfo.setColumnObj(columnObj);
			columnInfo.setHasEditColumn(hasColumnOfType(DataGridColumn.TYPE_EDIT));

			var ret = dwscripts.callCommand(dlg, columnInfo);

			if (ret)
			{
				// Update the column entry

				var rowText = columnObj.getTitle() + "|" + columnObj.getType();

				COLUMNS_GRID.setRow(rowText);
				columnInfo = ret;

				updateUICommands();
			}
		}
	}
}

function onRemoveButtonClicked()
{
	if (DELETE_BUTTON.disabled)
		return;
		
	var index = COLUMNS_GRID.getRowIndex();

	if (index >= 0)
	{    
		COLUMNS_GRID.delRow();

		// Remove the associated item from the columnArray.

		columnArray.splice(index, 1);

		updateUICommands();
	}
}

function onMoveUpClicked()
{
  var index = COLUMNS_GRID.getRowIndex();

  COLUMNS_GRID.moveRowUp();
  
  if ((index > 0) &&
      (index < columnArray.length))
  {  
	var tObj = columnArray[index - 1];
    
	columnArray[index - 1] = columnArray[index];
	columnArray[index] = tObj;

	updateUICommands();
  }
}

function onMoveDownClicked()
{
  var index = COLUMNS_GRID.getRowIndex();

  COLUMNS_GRID.moveRowDown();

  if ((index >= 0) &&
      (index < (columnArray.length - 1)))
  {
    var tObj = columnArray[index + 1];
    
	columnArray[index + 1] = columnArray[index];
	columnArray[index] = tObj;

	updateUICommands();
  }
}

function updateUICommands()
{
	ADD_BUTTON.setDisabled(RECORDSET_FIELD.getValue() == MM.LABEL_None);

	var index = COLUMNS_GRID.getRowIndex();
	
	if (index < 0)
	{
		DELETE_BUTTON.setDisabled(true);
		EDIT_BUTTON.setAttribute("disabled", "disabled");
		CHANGE_TYPE_BUTTON.setAttribute("disabled", "disabled");
	}
	else
	{
		DELETE_BUTTON.setDisabled(false);
		EDIT_BUTTON.removeAttribute("disabled");
		CHANGE_TYPE_BUTTON.removeAttribute("disabled");
	}

	MOVE_UP_BUTTON.setDisabled(index <= 0);
	MOVE_DOWN_BUTTON.setDisabled((index < 0) || (index >= (columnArray.length - 1)));
}

function getColumnDialog(type)
{
	var ret = null;

	switch (type)
	{
		case DataGridColumn.TYPE_BOUND:
			ret = "DataGridBound.htm";
			break;

		case DataGridColumn.TYPE_TEMPLATE:
			ret = "DataGridTemplate.htm";
			break;

		case DataGridColumn.TYPE_LINK:
			ret = "DataGridLink.htm";
			break;

		case DataGridColumn.TYPE_EDIT:
			ret = "DataGridEdit.htm";
			break;

		case DataGridColumn.TYPE_DELETE:
			ret = "DataGridDelete.htm";
			break;
	}

	return ret;
}
