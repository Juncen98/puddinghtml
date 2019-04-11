
// Copyright 1998, 1999, 2000, 2001, 2002, 2003, 2004 Macromedia, Inc. All rights reserved.

// Global vars.
var const_PageBindTag = "<MM:PageBind runat=\"server\" PostBackBind=\"true\" />";
var const_PageBindDecl = '<%@ Register TagPrefix="MM" Namespace="DreamweaverCtrls" Assembly="DreamweaverCtrls,version=1.0.0.0,publicKeyToken=836f606ede05d46a,culture=neutral" %>';

var const_formOpen  = "<form runat=\"server\">\r";
var const_formClose = "</form>";

//--------------------------------------------------------------------
// FUNCTION:
//   decodeDataSource
//
// DESCRIPTION:
//   Accepts the DataSource attribute and attempts to  
//   extract the DataSource name.
//
// ARGUMENTS:
//   inStr - the DataSource attribute expression.
//
// RETURNS:
//   string - the name of the recordset. If unable to parse, return 
//            an empty string.
//
//--------------------------------------------------------------------

function decodeDataSource(inStr)
{
  var outStr = "";
  
  if (inStr)
  {
    var re = /(\w+).defaultView/gi;
  
    if (inStr.search(re) != -1)
    {
      outStr = RegExp.$1;
    }   
  }
  
  return outStr;
}

//--------------------------------------------------------------------
// FUNCTION:
//   encodeDataSource
//
// DESCRIPTION:
//   Formats the argument(rs name) to be a valid DataSource expression.
//
// ARGUMENTS:
//   inStr - the recordset name
//
// RETURNS:
//   string - the DataSource expression.
//
//--------------------------------------------------------------------

function encodeDataSource(inStr)
{
  return "<%# " + inStr + ".DefaultView %>";
}

//--------------------------------------------------------------------
// FUNCTION:
//   encodePageSize
//
// DESCRIPTION:
//   Formats the argument(rs name) to be a valid PageSize expression.
//
// ARGUMENTS:
//   inStr - the recordset name
//
// RETURNS:
//   string - the PageSize expression.
//
//--------------------------------------------------------------------

function encodePageSize(inStr)
{
  return "<%# " + inStr + ".PageSize %>";
}

//--------------------------------------------------------------------
// FUNCTION:
//   encodeVirtualItemCount
//
// DESCRIPTION:
//   Formats the argument(rs name) to be a valid VirtualItemCount expression.
//
// ARGUMENTS:
//   inStr - the recordset name
//
// RETURNS:
//   string - the VirtualItemCount expression.
//
//--------------------------------------------------------------------

function encodeVirtualItemCount(inStr)
{
  return "<%# " + inStr + ".RecordCount %>";
}

//--------------------------------------------------------------------
// FUNCTION:
//   encodeExpression
//
// DESCRIPTION:
//   Formats the argument(rs name) to be a valid Expression.
//
// ARGUMENTS:
//   inStr - the recordset name
//
// RETURNS:
//   string - the DataSource expression.
//
//--------------------------------------------------------------------

function encodeExpression(inStr) 
{
  return "<%# " + inStr + " %>"
}

//--------------------------------------------------------------------
// FUNCTION:
//   isInsideForm
//
// DESCRIPTION:
//   Checks to see if the tag is within a form tag.
//
// ARGUMENTS:
//   node - the node to check
//
// RETURNS:
//   node - returns the form node if it exists or null if not.
//             
//--------------------------------------------------------------------

function isInsideForm(node)
{
  var formObj = null;
  var currNode = node;

  while ((formObj == null) && currNode.parentNode)
  {
    if ((currNode.nodeType == currNode.ELEMENT_NODE) &&
	    (currNode.tagName == "FORM"))
    {
	  formObj = currNode;
    }
	else
    {
	  currNode = currNode.parentNode;
    }
  }

  return formObj;
}

//--------------------------------------------------------------------
// FUNCTION:
//   validateAttribute
//
// DESCRIPTION:
//   Validates a string. If null, returns empty string, or default value.
//   
//
// ARGUMENTS:
//   value - the string to check
//   defaultValue - the string to return if the value is empty/null.
//
// RETURNS:
//   boolean - true if the node is located in one of the tags
//             false otherwise
//--------------------------------------------------------------------

function validateAttribute(value, defaultValue)
{
  var ret;

  if ((value == null) || (value == "undefined"))
  {
    ret = (defaultValue == null) ? "" : defaultValue;
  }
  else  
  {
    ret = value;
  }

  return ret;
}

//--------------------------------------------------------------------
// FUNCTION:
//   isDupeID
//
// DESCRIPTION:
//   Check to see if object with specified id already exists.
//   
// ARGUMENTS:
//   name - the string to check
//   tag  - type of tag to search for
//   dom  - the dom to search in.
//   index - Index to exclude. It will be used in the case
//           of an update, where you want omit the current object. 
//
// RETURNS:
//   boolean - true if there is a dupe
//             false if no dupe
//--------------------------------------------------------------------

function isDupeID(name, tag, dom, index)
{
  var retVal = false;

  if (dom)
  {
    var tags = dom.getElementsByTagName(tag);

    for (var i = 0; i < tags.length; i++)
	{
	  if (i != index)
	  {
	    var id = tags[i].getAttribute("ID");
		
		if (id && (name.toLowerCase() == id.toLowerCase()))
		{
           retVal = true;
		   break;
		}
	  }
	}
  }
  
  return retVal;
}

function findDataSetTag(dom, dataSetName)
{
	var ret = null;

	if (dataSetName != "")
	{
		var dataSets = dom.getElementsByTagName("MM:DataSet");

		for (var j = 0; j < dataSets.length; ++j)
		{
			var id = dataSets[j].getAttribute("id");

			if (id && (id.toUpperCase() == dataSetName.toUpperCase()))
			{
				ret  = dataSets[j];
				break;
			}
		}
	}

	return ret;
}

function checkFormTags(name)
{
  var emptyDom = getEmptyDomIfNeeded(true);
  var dom = dreamweaver.getDocumentDOM();

  fixUpSelection(dom);
  
  var offsets = dom.getSelection();
  var selNode = dw.offsetsToNode(offsets[0], offsets[1]);
  var formNodes = emptyDom.getElementsByTagName("Form");

  if (formNodes.length > 0)
  {
    // There is atleast one form node. 
	// Check if the current selection is inside a form node.

    var aFormNode = isInsideForm(selNode);	 

	if (aFormNode)
	{
      // Okay, we're in a form node. Let's check if it has the runat attr.

	  var runatAttr = aFormNode.getAttribute("runat");
	 
	  if (!runatAttr)
	  {
        // Ok, so it doesn't have a runat attribute. We need to see if 
		// there are any other form tags that have runat attrs.

        setRunatAttribute = true;

		if (formNodes.length > 1)
		{
          // There're are more than 1 form. Let's see if any of them have
		  // runat attrs.

		  for (var j = 0; j<formNodes.length; j++)
		  {
		    var tempAttr = formNodes[j].getAttribute("runat");
		
			if (tempAttr)
			{
			  var msg = MM.MSG_Form_RunAtAttrExists;
			  msg = msg.replace(/%s/g, name);
              alert(msg);
			  break;
			}
		  }
		}
	  }
	  else
	  {
        setRunatAttribute = false;
	  }
	}
	else
	{
      // We're not in a form node, but there are forms on the page. Check
	  // if any of them have the runat attr.
      
	  addForm = true;

      for (var k=0; k<formNodes.length; k++)
	  {
        var tempAttr = formNodes[k].getAttribute("runat");
	
		if (tempAttr)
		{
          var msg = MM.MSG_NoForm_RunAtAttrExists;
          msg = msg.replace(/%s/g, name);
          alert(msg);
		}
	  }
	}
  }
  else
  {
    addForm = true;
  }
}

function CreateNewName(root, nodes)
{
  if (nodes)
  {
    var num = 0;
    var newNameFound = false;

    while (!newNameFound)
	{
      var rsName = root + (++num);
      newNameFound = true;
      
	  for (var i = 0; i < nodes.length; i++)
	  {
        var theName = (nodes[i].getAttribute("ID") ? nodes[i].getAttribute("ID") : "");
        
		if (theName.toLowerCase() == rsName.toLowerCase())
		{
          newNameFound = false;
          break;
        }
      }
    }
  }

  return rsName;
}

function showLayer(layerObj)
{
  if (enabledLayer)
  {
	// There's a problem with refreshing a layer, so force it.

	enabledLayer.visibility = "hidden";
    enabledLayer.innerHTML = enabledLayer.innerHTML;
  }

  layerObj.visibility = "visible";
  enabledLayer = layerObj;
}

//  Note from Rebecca Hyatt (while code reviewing this function for it's
//  original author, Russ Helfand, on 12 Feb 2004):
//  [This] works only because editing the server behavior through the dialog sets 
//  the outerHTML of the document.  With other types of edits (like dragging 
//  content around), the affected section loses its MM_LIVE_DATA 
//  translation, but the rest of the page is left intact.  Since all server 
//  behaviors set outerHTML, they wipe out the MM_LIVE_DATA translation on 
//  everything.  So when you are trying to figure out whether the content 
//  you care about has been live-data-translated, you can just test to see 
//  if there are any MM_LIVE_DATA lock tags in the document at all.
//
//  Russ responds:  Yes, I agree.  Both Rebecca and I feel that this is the right
//  fix for bug 163887, given how close we are to RTM for Cannonball.  However,
//  we are recommending to QRB that this bug be transitioned into an engineering
//  work item in Coltrane so we can re-write the logic around the callers of this
//  function so:
//  1)  We get rid of this function entirely (since it works only because of the
//      tangental fact stated by Rebecca, above).
//  2)  The callers of this function look directly in locked regions inserted by the
//      live data translator when those callers are trying to find specific tags or
//      other DOM data that is otherwise hidden because of these locked regions.  There
//      is other code in DataGrid.js, etc. that does this already.  Hunt in the
//      configuration folder's JS files for "live data" and you find where it is done.
//      We need to do similar things when looking for tags like MM:PageBind when
//      determining whether or not to insert register directives in places like
//		inspectServerBehavior where we set up variables like insertPageBind.
//  For now, though, this refining our heuristic through the use of a reasonably good
//  function like liveDataTranslatorInEffect is the best compromise of risk/reward.
function liveDataTranslatorInEffect(dom)
{
	var ret = false;
	if (dom && dom.getElementsByTagName && dw.getLiveDataMode && dw.getLiveDataMode())
	{
		var lockNodes = dom.getElementsByTagName("MM:BEGINLOCK");
		for (var j=0; (!ret) && (j<lockNodes.length); j++)
		{
			var lockNode = lockNodes[j];
			ret = lockNode && lockNode.translatorClass && (lockNode.translatorClass == "MM_LIVE_DATA");
		}
	}
	
	return ret;
}

function getEmptyDomIfNeeded(cleanUp)
{
  //if the normal mode return the current DOM-else return the unstranslated DOM.
  var eDom = dreamweaver.getDocumentDOM();

  if (liveDataTranslatorInEffect(eDom))
  {
	  eDom = dreamweaver.getDocumentDOM(emptyPath);

	  if (cleanUp)
	  {
		var dom = dreamweaver.getDocumentDOM();
		var oHTML = dom.documentElement.outerHTML

		//make sure both documents charsets are the same
		eDom.setCharSet( dom.getCharSet() );
    
		eDom.documentElement.outerHTML = "" + oHTML;
	  }
   }
  
  return eDom;
}

function storeEmptyDomIfNeeded(emptyDOM, bodyOnly)
{
	// if we're in live data mode, replace the current DOM with the modified one;
	// otherwise, the current DOM already has the modifications, so do nothing
	if (dw.getLiveDataMode())
	{
		var dom = dw.getDocumentDOM();
		if (liveDataTranslatorInEffect(dom))
		{
			if (bodyOnly)
			{
				dom.body.outerHTML = emptyDOM.body.outerHTML;
			}
			else
			{
				dom.documentElement.outerHTML = emptyDOM.documentElement.outerHTML;
			}
		}
	}
}

function notAnInteger(val)
{
  return (val != parseInt(val));
}

function ensureEditableContentTag(contents, tag)
{
	// Make sure there is at least a &nbsp; in the template tags

	var ret = contents;
	var re = new RegExp(dwscripts.sprintf("((<%s>)([\\s]*)(<\/%s>))", tag, tag), "i");

	if (contents.search(re) != (-1))
	{
		var replaceWith = RegExp.$2 + RegExp.$3 + "&nbsp;" + RegExp.$4;
		ret = ret.replace(RegExp.$1, replaceWith);
	}

	return ret;
}

//////////////////////////////////////////////////////////////
// Inherit from the ServerBehavior class

SBDataGridDataList.prototype.__proto__ = ServerBehavior.prototype;

// Class methods:

SBDataGridDataList.prototype.setPosition = SBDataGridDataList_setPosition;
SBDataGridDataList.prototype.getPosition = SBDataGridDataList_getPosition;
SBDataGridDataList.prototype.setServerBehaviorFileName = SBDataGridDataList_setServerBehaviorFileName;
SBDataGridDataList.prototype.getServerBehaviorFileName = SBDataGridDataList_getServerBehaviorFileName;
SBDataGridDataList.prototype.setDataSetName = SBDataGridDataList_setDataSetName;
SBDataGridDataList.prototype.getDataSetName = SBDataGridDataList_getDataSetName;

// Construction

SBDataGridDataList.prototype.initSBDataGridDataList = SBDataGridDataList_initSBDataGridDataList;

//--------------------------------------------------------------------

function SBDataGridDataList(name, title, selectedNode)
{
  this.initSBDataGridDataList(name, title, selectedNode);
}

function SBDataGridDataList_initSBDataGridDataList(name, title, selectedNode)
{
  // First, initialize base class

  this.initServerBehavior(name, title, selectedNode);
}

function SBDataGridDataList_setPosition(position)
{
  this.position = position;
}

function SBDataGridDataList_getPosition()
{
  return this.position;
}

function SBDataGridDataList_setServerBehaviorFileName(filename)
{
  this.filename = filename;
}

function SBDataGridDataList_getServerBehaviorFileName()
{
  return this.filename;
}

function SBDataGridDataList_setDataSetName(dataSetName)
{
	this.dataSetName = dataSetName;
}

function SBDataGridDataList_getDataSetName()
{
	return this.dataSetName;
}
