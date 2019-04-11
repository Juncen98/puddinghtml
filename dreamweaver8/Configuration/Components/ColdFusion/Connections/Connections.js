// Copyright 2005 Macromedia, Inc. All rights reserved.

//*-------------------------------------------------------------------
// FUNCTION:
//   canDisplayComponent()
//
// DESCRIPTION:
//   optional Component API function. Lets this component conditionally 
//	 display for a given server
//
// ARGUMENTS: none
//	
// RETURNS: true/false
//--------------------------------------------------------------------
function canDisplayComponent ()
{
	var dom = dw.getDocumentDOM();
	//only display components if this CF Server is version 7 or greater
	if (dom) {
		return (dom.serverModel.getServerVersion('Server.ColdFusion.ProductVersion.Major') >= 7);
	}
	return false; //default is not to show (DW MX 2004 behavior)
}

//*-------------------------------------------------------------------
// FUNCTION:
//   enableMinusButton()
//
// DESCRIPTION:
//   allows this component to hide the minus button. Called when the floater is first shown
//
// ARGUMENTS: none
//	
// RETURNS: true/false
//--------------------------------------------------------------------
function enableMinusButton()
{
	return false; //don't allow the minus button for ColdFusion, have them go to the CF admin instead
}


//*-------------------------------------------------------------------
// FUNCTION:
//   clickedInsert()
//
// DESCRIPTION:
//   drops code into code view.
//
// ARGUMENTS:
//	
// RETURNS:
//--------------------------------------------------------------------
function clickedInsert(aNode) {
	var insertText="";
	var dom = dw.getDocumentDOM();
	if (dom) {
		if (aNode && aNode.isCodeViewDraggable && (dw.getFocus() == 'textView')) {
			insertText = getCodeViewDropCode(aNode);
			var selection = dom.source.getSelection();
			dom.source.replaceRange(selection[0],selection[1],insertText);
		}
	}
}



//*-------------------------------------------------------------------
// FUNCTION:
//   insertEnabled()
//
// DESCRIPTION:
//   checks to see to enable the insert menu option.
//
// ARGUMENTS:
//	
// RETURNS:
//--------------------------------------------------------------------
function insertEnabled(aNode) {
	var enable=false;
	var dom = dw.getDocumentDOM();
	if (dom) {
		if (aNode && aNode.isCodeViewDraggable && (dw.getFocus() == 'textView')) {
			enable = true;
		}
	}
	return enable;
}



//*-------------------------------------------------------------------
// FUNCTION:
//   getCodeViewDropCode
//
// DESCRIPTION:
//	 returns the code snippet to drop after a drag operation.
//
// ARGUMENTS:
//	 component Rec.
//	
// RETURNS:
//   code to drop into code view.
//--------------------------------------------------------------------
function getCodeViewDropCode(componentRec) {
	var codeToDrop="";
	if (componentRec)
	{
		if (componentRec.objectType == "Connection")
		{
			var connPart = new Participant("datasource_tag");
			var paramObj = new Object();
			paramObj.datasource = componentRec.name;
			codeToDrop = connPart.getInsertString(paramObj, "aboveHTML");
		}
		else if ((componentRec.objectType == "Column")||
				 (componentRec.objectType == "Parameter"))
		{
			codeToDrop =  componentRec.dropcode;
		}
		else
		{
			codeToDrop =  componentRec.name;
		}
	}
	return codeToDrop;
}
