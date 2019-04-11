// Copyright 2005 Macromedia, Inc. All rights reserved.
//form field names:

// *********** GLOBAL VARS *****************************

var helpDoc = MM.HELP_inspXSLComment;
var XSLCOMMENTTEXTAREA;

// ******************** API ****************************
function canInspectSelection()
{  
  var dom = dw.getDocumentDOM();
  var xslCommentObj = dom.getSelectedNode();
  return (xslCommentObj.tagName && xslCommentObj.tagName=="XSL:COMMENT");
}

function inspectSelection()
{
  var dom = dw.getDocumentDOM();
  var xslCommentObj = dom.getSelectedNode();
	XSLCOMMENTTEXTAREA = dwscripts.findDOMObject("xslComment");
	if (xslCommentObj != null)
	{
		var xslComment = xslCommentObj.innerHTML;
		XSLCOMMENTTEXTAREA.value = xslComment;
	}
}


function setXSLComment()
{
  var dom = dw.getDocumentDOM();
  var xslCommentObj = dom.getSelectedNode();
	var updatedXSLComment = XSLCOMMENTTEXTAREA.value;
	if (updatedXSLComment.length)
	{
	  //set the innerHTML to the updated XSL Comment 
		if (xslCommentObj != null)
		{
			xslCommentObj.innerHTML = updatedXSLComment;
		}
	}
}