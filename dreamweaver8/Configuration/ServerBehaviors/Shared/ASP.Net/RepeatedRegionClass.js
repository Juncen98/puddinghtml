// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

// Inherit from the ServerBehavior class.

SBRepeatedRegionASPNET.prototype.__proto__ = ServerBehavior.prototype;

// Public methods

SBRepeatedRegionASPNET.prototype.analyze = SBRepeatedRegionASPNET_analyze;
SBRepeatedRegionASPNET.prototype.checkData = SBRepeatedRegionASPNET_checkData;
SBRepeatedRegionASPNET.prototype.queueDocEdits = SBRepeatedRegionASPNET_queueDocEdits;
SBRepeatedRegionASPNET.prototype.queueDataSetDocEdits = SBRepeatedRegionASPNET_queueDataSetDocEdits;

SBRepeatedRegionASPNET.prototype.getRecordsetName = SBRepeatedRegionASPNET_getRecordsetName;
SBRepeatedRegionASPNET.prototype.getPageSize = SBRepeatedRegionASPNET_getPageSize;
SBRepeatedRegionASPNET.prototype.isPageNavigation = SBRepeatedRegionASPNET_isPageNavigation;
SBRepeatedRegionASPNET.prototype.findDataSetTag = SBRepeatedRegionASPNET_findDataSetTag;

SBRepeatedRegionASPNET.prototype.setRecordsetName = SBRepeatedRegionASPNET_setRecordsetName;
SBRepeatedRegionASPNET.prototype.setPageSize = SBRepeatedRegionASPNET_setPageSize;

SBRepeatedRegionASPNET.prototype.EXT_DATA_REPEATER_ID		= "RepeaterId";
SBRepeatedRegionASPNET.prototype.EXT_DATA_RECORDSET_NAME	= "RecordsetName";
SBRepeatedRegionASPNET.prototype.EXT_DATA_PAGE_SIZE			= "PageSize";

function SBRepeatedRegionASPNET(name, title, selectedNode)
{
  this.initServerBehavior((name) ? name : "RepeatedRegion", title, selectedNode);
  this.setParameter(this.EXT_DATA_REPEATER_ID, "");
}

function SBRepeatedRegionASPNET_queueDocEdits(existingNode)
{
  // Update the DataSource attribute if needed

  var part = this.getNamedSBPart("RepeatedRegion_main");
  
  if (part || existingNode)
  {
    var node = ((part) ? part.getNode() : existingNode);
    var tagEdit = new TagEdit(node);
    var rsName = this.getParameter("RecordsetName");
    var dataSource = dwscripts.sprintf("<%# %s.DefaultView %>", rsName);
	
	// TODO: Handle new recordset name (remove rr info from old dataset)

    tagEdit.setAttribute("DataSource", dataSource);
    
	dwscripts.queueNodeEdit(tagEdit.getOuterHTML(), node);
  }
  else
  {
    alert("RepeatedRegion_main not found");
  }
}

function SBRepeatedRegionASPNET_queueDataSetDocEdits()
{
  // Find Recordset and update attributes

  var node = null;
  var dom = dw.getDocumentDOM();
  var paramTags = dom.getElementsByTagName("MM:DataSet");
  var rsName = this.getRecordsetName();

  for (var j = 0; j < paramTags.length; ++j)
  {
	var id = paramTags[j].getAttribute("id");

    if (id && (id.toUpperCase() == rsName.toUpperCase()))
    {
	  node = paramTags[j];
	  break;
	}
  }

  if (node != null)
  {
    tagEdit = new TagEdit(node);

    if (this.getPageSize())
    {
      var varName = dwscripts.sprintf("%s_CurrentPage", rsName);
      var condition = dwscripts.getParameterExpressionFromType(MM.LABEL_ASPNET_Param_Types[0], varName);
	  var paramSyntax = dwscripts.getParameterSyntaxFromType(MM.LABEL_ASPNET_Param_Types[0], varName);
      var trueClause = dwscripts.getParameterAsInteger(paramSyntax);
      var currentPage = "<%# " + dwscripts.getTernaryStatement(condition, trueClause, "0") + " %>";
   
      tagEdit.setAttribute("PageSize", this.getPageSize());
      tagEdit.setAttribute("CurrentPage", currentPage);
    }
    else
    {
	  tagEdit.removeAttribute("PageSize");
	  tagEdit.removeAttribute("CurrentPage");
    }
  
	var updateText = tagEdit.getOuterHTML();

	// Replace double-quotes w/ single in cases of: attrib="<%# value %>"

    var re = /="<%#\s*([\s\S]+)\s*%>"/ig
    var attrib;

    while ((attrib = re.exec(updateText)) != null)
    {
      updateText = updateText.replace(attrib[0], ("='<%# " + attrib[1] + " %>'"));
    }

    dwscripts.queueNodeEdit(updateText, node);
  }
}

function SBRepeatedRegionASPNET_analyze(allRecs)
{
  // TODO:
}

function SBRepeatedRegionASPNET_checkData()
{
  // TODO:

  return true;
}

function SBRepeatedRegionASPNET_getRecordsetName()
{
  return this.getParameter(this.EXT_DATA_RECORDSET_NAME);
}

function SBRepeatedRegionASPNET_getPageSize()
{
  return this.getParameter(this.EXT_DATA_PAGE_SIZE);
}

function SBRepeatedRegionASPNET_isPageNavigation()
{
  return (this.getPageSize() != null);
}

function SBRepeatedRegionASPNET_setRecordsetName(rsName)
{
  return this.setParameter(this.EXT_DATA_RECORDSET_NAME, rsName);
}

function SBRepeatedRegionASPNET_setPageSize(pageSize)
{
  return this.setParameter(this.EXT_DATA_PAGE_SIZE, pageSize);
}

function SBRepeatedRegionASPNET_findDataSetTag()
{
  var tag = null;
  var dom = dw.getDocumentDOM();
  var tags = dom.getElementsByTagName("MM:DataSet");

  for (var j = 0; j < tags.length; ++j)
  {
    var id = tags[j].getAttribute("id");

    if (id && (id.toUpperCase() == this.getRecordsetName().toUpperCase()))
    {
	  tag = tags[j];
	  break;
    }	  
  }

  return tag;
}
