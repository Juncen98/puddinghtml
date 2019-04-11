
// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

//************************GLOBAL************************

// Common Objects

var ID_FIELD;
var RECORDSET_FIELD = new RecordsetMenu("DataList.htm", "RecordsetSelect", "");
var PAGING_RADIO;
var PAGE_SIZE_FIELD;
var ORGANIZE_RADIO;
var COLUMN_COUNT_FIELD;
var FILL_ORDER_RADIO;
var TEMPLATE_FIELD;
var TEMPLATE_CONTENTS_FIELD;
var ADD_DATA_FIELD_BUTTON;

// Global vars

var isPriorRec;
var dlName = "";
var recordsetName = "";
var emptyPath = dw.getConfigurationPath() + "/Shared/MM/Cache/empty.htm";
var ranUpdateUI = false;
var insertPageBind = false;
var formNode = null;
var addForm = false;
var setRunatAttribute = false;
var pageSize = 0;

// Here're are the default contents for the templates. These are
// stored in global vars so that they can be localized.

var const_defaultContentArray = new Array(MM.LABEL_HeaderTemplateDesc, 
  MM.LABEL_ItemTemplateDesc, 
  MM.LABEL_AltItemTemplateDesc, 
  MM.LABEL_EditItemTemplateDesc, 
  MM.LABEL_SelectedItemTemplateDesc, 
  MM.LABEL_SeparatorTemplateDesc, 
  MM.LABEL_FooterTemplateDesc);

// Array which will contain the template contents.

var contentArray = new Array();

// Contain the previous locations of template nodes.

var origIndexArray = new Array(-1, -1, -1, -1, -1, -1, -1);
var dataListNode = null;
var templateNodes = null;
var positionID = -1;

// Actual names of the tags (in lowercase)

var const_templateNameArray = new Array("HeaderTemplate", 
  "ItemTemplate",
  "AlternatingItemTemplate", 
  "EditItemTemplate", 
  "SelectedItemTemplate",
  "SeparatorTemplate", 
  "FooterTemplate");

// All the template/tag formats

var const_dataListTag1 = "<asp:DataList id=\"@@id@@\" " + 
  "\rrunat=\"server\" " +
  "\rRepeatColumns=\"@@repeatcolumns@@\" " +
  "\rRepeatDirection=\"@@repeatdirection@@\" " + 
  "\rRepeatLayout=\"@@repeatlayout@@\" ";
var const_dataListTag1_A = ">";
var const_dataListTag2 = "\r</asp:DataList>";

var const_dataSource = "\rDataSource=\"@@datasource@@\" ";

var helpDoc = MM.HELP_ssDataListAspNet;

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
	return RECORDSET_FIELD.canApplyServerBehavior(sbObj);
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
//   an array of SB objects
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

  var emptyArray = emptyDom.getElementsByTagName("asp:DataList");
  var docArray = dom.getElementsByTagName("asp:DataList");
  
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
		//  look for lock tags with asp:datalist in the "orig" attribute.

		docArray = dom.getElementsByTagName("mm:beginlock");

        for (var k = 0; k < docArray.length; k++)
        {
		  if (docArray[k].orig)
		  {
		    var origValue = new String(unescape(docArray[k].orig));
            if (origValue.toLowerCase().indexOf("asp:datalist") > -1)
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
	                                    MM.LABEL_TitleDataList + " (" + emptyArray[i].id + ")",
                                        (!badFlag) ? dgNodeList[i] : null);

    var sbPart = new SBParticipant("DataList_main", (!badFlag) ? dgNodeList[i] : null, 
                                   0, 0, null);
    sbObj.addParticipant(sbPart);
    sbObj.setPosition(i);
	sbObj.setServerBehaviorFileName("DataList.htm");
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
  var oHTML = "";
  var footerIndex = -1;
  var headerIndex = -1;
  var errMsg = "";
	 
  if (isPriorRec)
  {
    // If there's a prior rec, we have a few things to consider:
    // - We would like to ensure that the footer template is always last.
    // - So, if the server behavior already has a footer template, we will insert all 
    //   newly added templates just before the footer template. No other 
    //   restriction is placed on position. 
    // - Note: We will probably consider a similar restriction with respect to
    //   the header template. The restriction will ensure that it is always the first
    //   item, if it exists.

    var emptyDom = getEmptyDomIfNeeded(true);
	var nodes = emptyDom.getElementsByTagName("asp:DataList");
    
	dataListNode = nodes[positionID];
    templateNodes = dataListNode.childNodes;
			  
    errMsg = inspectUI();
    
	if (errMsg != "")
      return errMsg;

    dataListNode.setAttribute("ID", ID_FIELD.value);

	var dataSource = RECORDSET_FIELD.getValue();
	
	if (dataSource.indexOf("***") == (-1))
	{
		dataListNode.setAttribute("Datasource", encodeDataSource(dataSource));
	}
	else
	{
		dataListNode.removeAttribute("Datasource");
	}

    // Set Repeat Layout, Columns and Direction.

    if (ORGANIZE_RADIO[1].checked)
	{
      dataListNode.setAttribute("RepeatLayout", "Table");
      dataListNode.setAttribute("RepeatColumns", COLUMN_COUNT_FIELD.getValue()); 

      if (FILL_ORDER_RADIO[0].checked)
	  {
	    dataListNode.setAttribute("RepeatDirection", "Vertical");
      }
	  else
      {
	    dataListNode.setAttribute("RepeatDirection", "Horizontal");
      }
    }
	else
	{
      dataListNode.setAttribute("RepeatLayout", "Flow");
    }
            
    headerIndex = origIndexArray[0];
    footerIndex = origIndexArray[6];        
      
    for (var index=0; index < contentArray.length; index++)
	{      
      if (origIndexArray[index] > -1)
	  {    
        // TODO: If the contents are empty, should we remove the template?
              
        // The item already exists. We need to just update it.
        
		templateNodes[origIndexArray[index]].innerHTML = 
					ensureEditableContentTag(contentArray[index], const_templateNameArray[index]);
        refreshTemplateNodes();
      }
	  else
	  {
        // Check to see if the user has modified the entry.
        
		if (dwscripts.trim(contentArray[index]) != const_defaultContentArray[index])
		{
          // The user has modified the content.
          // We need to add a new tag just above the footer tag, if it exists.

          if (origIndexArray[6] == -1)
		  {
            // There isn't a footer index available, so just add to the inner html..
            
			iHTML = dataListNode.innerHTML;
            dataListNode.innerHTML = iHTML + buildTag(index);
							
            refreshTemplateNodes();
          }
		  else
		  {
            // Ok, there's a footer index.

            if (index < 6)
			{
              // OK, this isn't the footer index we're adding
              // Bump up the index of the footer.

              oHTML = templateNodes[origIndexArray[6]].outerHTML;
              templateNodes[origIndexArray[6]].outerHTML = buildTag(index) + oHTML;
              refreshTemplateNodes();
              origIndexArray[6] ++; 
            }
			else
			{
              iHTML = dataListNode.innerHTML;
              dataListNode.innerHTML = iHTML + buildTag(index);
								
              refreshTemplateNodes();
            }
          }
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
    errMsg = inspectUI();

    if (errMsg != "")
      return errMsg;

    // New object, so we need to just add the columns

    var dom = dw.getDocumentDOM();

    fixUpSelection(dom);

    var paramObj = new Object();
    paramObj.InsertText = buildTag(null, dom);
    dwscripts.queueDocEditsForGroup("DataList", paramObj);
  }

  // Update the PageSize and CurrentPage attributes of the DataSet tag as needed

  var dataSetTag = findDataSetTag(dw.getDocumentDOM(), recordsetName);
 
  if (dataSetTag)
  {
    var tagEdit = new TagEdit(dataSetTag);

  	if (PAGING_RADIO[0].checked)
	{
      tagEdit.setAttribute("PageSize", PAGE_SIZE_FIELD.value);

      var varName = dwscripts.sprintf("%s_CurrentPage", recordsetName);
      var condition = dwscripts.getParameterExpressionFromType(MM.LABEL_ASPNET_Param_Types[0], varName);
	  var paramSyntax = dwscripts.getParameterSyntaxFromType(MM.LABEL_ASPNET_Param_Types[0], varName);
      var trueClause = dwscripts.getParameterAsInteger(paramSyntax);
      var attr = "<%# " + dwscripts.getTernaryStatement(condition, trueClause, "0") + " %>";
       
      tagEdit.setAttribute("CurrentPage", attr);
    }
  	else
	{
	  tagEdit.removeAttribute("PageSize");
	  tagEdit.removeAttribute("CurrentPage");
	}

    updateText = tagEdit.getOuterHTML();

	// Replace double-quotes w/ single in cases of: attrib="<%# value %>"

    var re = /="<%#\s*([\s\S]+)\s*%>"/ig
    var attrib;

    while ((attrib = re.exec(updateText)) != null)
    {
      updateText = updateText.replace(attrib[0], ("='<%# " + attrib[1] + " %>'"));
    }

    dwscripts.queueNodeEdit(updateText, dataSetTag);
  }

  if (insertPageBind)
  {
    dwscripts.queueDocEdit(const_PageBindDecl, "aboveHTML+5");
    dwscripts.queueDocEdit(const_PageBindTag, "aboveHTML+99");
  }

  dwscripts.applyDocEdits(false);

  if (!isPriorRec && !addForm && setRunatAttribute)
  {
    formNode.setAttribute("Runat", "Server");
  }

  return "";
}

//*-------------------------------------------------------------------
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
//--------------------------------------------------------------------

function inspectServerBehavior(sbObj)
{
  var tagName = "";
 
  isPriorRec = true;

  var emptyDom = getEmptyDomIfNeeded(true);

  ID_FIELD.value = sbObj.name;
  positionID = sbObj.getPosition();

  var dom = dreamweaver.getDocumentDOM();
  fixUpSelection(dom);
  
  var offsets = dom.getSelection();
  
  var nodes = emptyDom.getElementsByTagName("asp:DataList");
  dataListNode = nodes[positionID];

  var tempNodes = emptyDom.getElementsByTagName("MM:PageBind");
  insertPageBind = (tempNodes.length == 0);

  templateNodes = dataListNode.childNodes;

  for (var index = 0; index < templateNodes.length; index++)
  {
    if (templateNodes[index].tagName)
	{
	  tagName = templateNodes[index].tagName.toLowerCase();
    
	  var indx = getTemplateIndex(tagName);
	  if (indx >= 0)
	  {
	    contentArray[indx] = templateNodes[index].innerHTML;
	    origIndexArray[indx] = index;
	  }
    }
  }

  // Find the recordset associated with the DataList
  // and resolve the paging attributes
	  
  var pageSizeFound = false;
  var rsName = decodeDataSource(dataListNode.dataSource);
 
  pageSize = 0; // Initialize
  
  if (rsName != "")
  {
    var emptyDom = getEmptyDomIfNeeded(true);
    var dataSetTag = findDataSetTag(getEmptyDomIfNeeded(true), rsName);
	
	if (dataSetTag)
	{
      var rsPageSize = dataSetTag.getAttribute("PageSize");

      if (rsPageSize && (rsPageSize != ""))
      {
        pageSize = dataSetTag.getAttribute("PageSize");
      }
    }
  }
  updateUI();
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
  var nodes = emptyDom.getElementsByTagName("asp:datalist");

  if (nodes.length > pos)
  {
    // Remove the PageSize and EditOps attributes of the associated
    // DataSet tag

    var node = nodes[pos];
    var dataSetName = decodeDataSource(validateAttribute(node.getAttribute("datasource")));
	var tag = findDataSetTag(emptyDom, dataSetName);

    if (tag != null)
    {
      var tagEdit = new TagEdit(tag);

	  tagEdit.removeAttribute("PageSize");
	  tagEdit.removeAttribute("CurrentPage");

      tag.outerHTML = tagEdit.getOuterHTML();
    }

	node.outerHTML = "";
	storeEmptyDomIfNeeded(emptyDom, false);
  }

  return true;
}

function analyzeServerBehavior(sbObj, allRecs)
{
	sbObj.incomplete = !RECORDSET_FIELD.rsNameIsValid(sbObj.getDataSetName());
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
  var emptyDom = getEmptyDomIfNeeded(true);
  var nodes = emptyDom.getElementsByTagName("asp:DataList");
  var pos = sbObj.getPosition();
  
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
	
	var nodes = emptyDom.getElementsByTagName("asp:DataList");
	
	if (nodes.length > 0)
	{
	   nodes[0].setAttribute("ID", CreateNewName(MM.LABEL_DataListBaseName), nodes);
       dw.getDocumentDOM().insertHTML(nodes[0].outerHTML);
	}
	else
	{
       dw.getDocumentDOM().insertHTML(sbObj.oHTML);
	}
  }
}

//*******************LOCAL FUNCTIONS*********************

function initializeUI()
{
  ID_FIELD = findObject("IdEdit")
  PAGING_RADIO = findObject("RecordCount");
  PAGE_SIZE_FIELD = findObject("RecordCountEdit");
  COLUMN_COUNT_FIELD = new ListControl("NumberOfColumnsSelect");
  TEMPLATE_FIELD = findObject("TemplateSelect");
  TEMPLATE_CONTENTS_FIELD = findObject("ContentsTextArea");
  ADD_DATA_FIELD_BUTTON = findObject("AddDataFieldButton");
  ORGANIZE_RADIO = findObject("OrganizeRadio");
  FILL_ORDER_RADIO = findObject("FillOrderRadio");
  RECORDSET_FIELD.initializeUI();
  
  isPriorRec = false;

  populateTemplateList();
  populateColumnCountList();

  setTimeout("updateUI()", 100);
}

function inspectUI()
{
  if (dwscripts.trim(ID_FIELD.value) == "" )
  {
	ID_FIELD.focus();
	return MM.MSG_EmptyID;
  }
  
  if (!dwscripts.isValidVarName(ID_FIELD.value, true))
  {
	ID_FIELD.focus();
	return MM.MSG_InvalidID;
  }

  if (isDupeID(ID_FIELD.value, "asp:datalist", getEmptyDomIfNeeded(true), positionID))
  {
    ID_FIELD.focus();
	return MM.MSG_DupeDataList;
  }
  
  return "";
}

function updateUI()
{
  if (!ranUpdateUI)
  {
    if (isPriorRec)
	  {
	    // Note - ranUpdateUI *must* be set before RECORDSET_FIELD.pickValue because
      //   RECORDSET_FIELD.pickValue calls the window's updateUI(). 
      ranUpdateUI = true;
      
      ID_FIELD.value = dataListNode.getAttribute("ID");
      RECORDSET_FIELD.pickValue(decodeDataSource(validateAttribute(dataListNode.getAttribute("Datasource"))));

      // Don't get any paging attribute values, unless it's an MM recordset.
    
	    if (pageSize > 0)
      {
        PAGING_RADIO[0].checked = true;
		    PAGE_SIZE_FIELD.value = pageSize;
	    }
      else
	    {
        PAGING_RADIO[1].checked = true;
	    }

	    var layout = dataListNode.getAttribute("RepeatLayout");
	  	  
	    if (layout && (layout.toLowerCase() == "table"))
	    {
        ORGANIZE_RADIO[1].checked = true;  
         
		    var numOfCols = dataListNode.getAttribute("RepeatColumns");
		 
		    if (numOfCols)
		    {
		      COLUMN_COUNT_FIELD.set(numOfCols, -1);
		    }

        var direction = dataListNode.getAttribute("RepeatDirection");
         
  		  if (direction && (direction.toLowerCase() == "horizontal"))
  		  {
  		    FILL_ORDER_RADIO[1].checked = true;
  		  }
	    }
	    else
	    {
        ORGANIZE_RADIO[0].checked = true;  
	    }
      
	    TEMPLATE_CONTENTS_FIELD.value = contentArray[0]
    }
	  else
	  {
	    checkFormTags(MM.LABEL_TitleDataList);
	   
      var emptyDom = getEmptyDomIfNeeded(true);
	    var pageBindNodes = emptyDom.getElementsByTagName("MM:PageBind");
      var nodes = emptyDom.getElementsByTagName("asp:DataList");
      
	    insertPageBind = (pageBindNodes.length == 0);

      ID_FIELD.value = CreateNewName(MM.LABEL_DataListBaseName, nodes);

      TEMPLATE_FIELD.selectedIndex = 0;    
	    TEMPLATE_CONTENTS_FIELD.value = contentArray[TEMPLATE_FIELD.selectedIndex];
    }

    recordsetSelectChanged();
    numberOfColumnSelectChange();
    organizeCheckClicked();
	
  }
  
  elts = document.forms[0].elements;
  if (elts && elts.length)
  {
    elts[0].focus();
    elts[0].select();
  }
}

function populateTemplateList()
{
  contentArray.push(MM.LABEL_HeaderTemplateDesc);
  contentArray.push(MM.LABEL_ItemTemplateDesc);
  contentArray.push(MM.LABEL_AltItemTemplateDesc);
  contentArray.push(MM.LABEL_EditItemTemplateDesc);
  contentArray.push(MM.LABEL_SelectedItemTemplateDesc);
  contentArray.push(MM.LABEL_SeparatorTemplateDesc);
  contentArray.push(MM.LABEL_FooterTemplateDesc);
}

function populateColumnCountList()
{  
  var columnCountArr = new Array();
  
  columnCountArr.push("1");
  columnCountArr.push("2");
  columnCountArr.push("3");
  columnCountArr.push("4");
  columnCountArr.push("5");
  
  COLUMN_COUNT_FIELD.setAll(columnCountArr, columnCountArr);
  COLUMN_COUNT_FIELD.setIndex(0);
}

function getTemplateIndex(templateStr)
{ 
  var retInt = (-1);
  
  for (var i = 0; i < const_templateNameArray.length; i++ )
  {
    if (const_templateNameArray[i].toLowerCase() == templateStr.toLowerCase())
	{
	  retInt = i;
	  break;
	}
  }

  return retInt;
}

function buildTag(index, dom)
{
  var retStr = "";
  
  if (index == null)
  {
    var offsets = dom.getSelection();
	var currSel = dreamweaver.offsetsToNode(offsets[0], offsets[1]);
    
    addForm = false;
	formNode = isInsideForm(currSel);
 	
	if (!formNode)
	{
      addForm = true;
      retStr += const_formOpen;
	}
   
	retStr += const_dataListTag1;
    retStr = retStr.replace("@@id@@", ID_FIELD.value);
    
    // DataSource
	retStr += const_dataSource;
    retStr = retStr.replace("@@datasource@@", encodeDataSource(RECORDSET_FIELD.getValue()));

    if (ORGANIZE_RADIO[1].checked)
	{
      retStr = retStr.replace("@@repeatlayout@@", "Table")
	  retStr = retStr.replace("@@repeatcolumns@@", COLUMN_COUNT_FIELD.getValue());

	  if (COLUMN_COUNT_FIELD.getValue() > 1)
	  {
        var direction = FILL_ORDER_RADIO[0].checked;
        
		if (direction)
        {
		  retStr = retStr.replace("@@repeatdirection@@", "Vertical");
        }
		else 
	    {
		  retStr = retStr.replace("@@repeatdirection@@", "Horizontal");
	    }
	  }
	  else
	  {
        retStr = retStr.replace("@@repeatdirection@@", "Vertical");
	  }
      
	  retStr = retStr.replace("@@repeatdirection@@", "Table")
    }
	else
	{
      retStr = retStr.replace("@@repeatcolumns@@", "1");
      retStr = retStr.replace("@@repeatdirection@@", "Vertical");
      retStr = retStr.replace("@@repeatlayout@@", "Flow")
	  retStr = retStr.replace("@@repeatcout@@", "1");
    }

    retStr += const_dataListTag1_A;

	for (var k = 0; k < contentArray.length; k++)
	{
	  if (dwscripts.trim(contentArray[k]) != const_defaultContentArray[k])
	  {
        retStr += "\r<" + const_templateNameArray[k] + ">";
	    retStr += ensureEditableContentTag(contentArray[k], const_templateNameArray[k]);
        retStr += "\r</" + const_templateNameArray[k] + ">";
      }
    }

    retStr += const_dataListTag2;

	if (addForm)
	{
	  retStr += const_formClose;
	}
  }
  else if ((index >= 0) && (index < const_templateNameArray.length))
  {
    retStr += "\r<" + const_templateNameArray[index] + ">";
	retStr += ensureEditableContentTag(contentArray[index], const_templateNameArray[index]);
    retStr += "\r</" + const_templateNameArray[index] + ">";
  }

  return retStr;
}

function refreshTemplateNodes()
{
  if (isPriorRec && dataListNode)
  {
    templateNodes = dataListNode.childNodes;
  }
}

// ********************* EVENT HANDLERS ***************************************

function recordsetSelectChanged()
{
  recordsetName = RECORDSET_FIELD.getValue();
  SetEnabled(PAGE_SIZE_FIELD, PAGING_RADIO[0].checked);
}

function pagingTypeChanged(value)
{
  SetEnabled(PAGE_SIZE_FIELD, (value == 'number'));
}

function columnListSelectionChanged()
{
  TEMPLATE_CONTENTS_FIELD.value = contentArray[TEMPLATE_FIELD.selectedIndex];
}

function contentsTextAreaBlur()
{
  if (TEMPLATE_FIELD.selectedIndex >= 0)
  {
    contentArray[TEMPLATE_FIELD.selectedIndex] = TEMPLATE_CONTENTS_FIELD.value;
  }
}

function numberOfColumnSelectChange()
{
  var columnCount = COLUMN_COUNT_FIELD.getValue();
  var enable = false;

  if (notAnInteger(columnCount) || (columnCount < 1))
  {
    COLUMN_COUNT_FIELD.setIndex(0);
    alert(MM.MSG_InvalidColumnCount);
    COLUMN_COUNT_FIELD.focus();
  }
  else
  {
    enable = (columnCount > 1);
  }
  
  SetEnabled(FILL_ORDER_RADIO[0], enable);
  SetEnabled(FILL_ORDER_RADIO[1], enable);
}

function organizeCheckClicked()
{
  SetEnabled(COLUMN_COUNT_FIELD.object, ORGANIZE_RADIO[1].checked);
  numberOfColumnSelectChange();
}

function AddDataFieldButtonClicked()
{
	// Pass the recordset name to the dialog. 

	var expr = dwscripts.callCommand("AddDataField.htm", RECORDSET_FIELD.getValue());

	if (expr && (expr != ""))
	{
		if (dwscripts_trim(TEMPLATE_CONTENTS_FIELD.value) ==
				const_defaultContentArray[TEMPLATE_FIELD.selectedIndex])
		{
			TEMPLATE_CONTENTS_FIELD.value = expr;
		}
		else
		{
			TEMPLATE_CONTENTS_FIELD.value += expr;
		}
		
		TEMPLATE_CONTENTS_FIELD.focus();
	}
}
