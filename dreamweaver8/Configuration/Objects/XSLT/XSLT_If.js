// Copyright 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

// *************** GLOBALS VARS *****************
var xslTag = "xsl:if";
var xslIfTestAttr = "test";
var helpDoc = MM.HELP_objXSLTIf;

// ******************* API **********************

//--------------------------------------------------------------------
// FUNCTION:
//   objectTag
//
// DESCRIPTION:
//   This object is used as a shim to launch the appropriate 
//   server behavior for the current server model.  The individual
//   server behavior files are responsible for inserting the code on the
//   page, so this function just returns the empty string.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string - empty string to indicate that nothing should be inserted
//--------------------------------------------------------------------

function objectTag() 
{
  var dom = dw.getDocumentDOM();
  var codeBeforeSel = "";
  var codeAfterSel = "";
  var insideChoose = false;
  var insideOtherwise = false;
  var insideWhen = false;
  var defaultvalue = dw.loadString("xmlschema/defaultForReplaceContents");
  var linebreak = "\n";
	var nbspStr = dom.getNBSPChar();
  if (dom)
  {
		dw.runCommand('XSLT_ConditionDialog.htm', helpDoc);
		var expression = MM.XSLT_ConditionValue;

		if (expression && expression.length)
		{


			insideChoose = dom.isSelInsideTag("XSL:CHOOSE");
			insideOtherwise = dom.isSelInsideTag("XSL:OTHERWISE");
			insideWhen = dom.isSelInsideTag("XSL:WHEN");
			
			xslTag = "xsl:if"; //default to xsl:if
			if (insideChoose && !insideOtherwise && !insideWhen)
				xslTag = "xsl:when";

			//form the returned code expression (<xsl:if test="expression"/>)
			codeBeforeSel+="<";
			codeBeforeSel+=xslTag;
			codeBeforeSel+=" ";
			codeBeforeSel+=xslIfTestAttr;
			codeBeforeSel+="=\"";
			codeBeforeSel+=expression;
			codeBeforeSel+="\"";
			codeBeforeSel+=">";

			codeAfterSel+="</";
			codeAfterSel+=xslTag;
			codeAfterSel+=">";

			//wrap xslt object around the current selection
			wrapSelectionInDocRemoveNBSP(codeBeforeSel, codeAfterSel, defaultvalue);

		}
  }
  
  return "";  
}


//--------------------------------------------------------------------
// FUNCTION:
//   getSetupSteps
//
// DESCRIPTION:
//   Returns an array of steps to be displayed in an instructions
//   dialog.  The first element of the array is the text that appears
//   above the list.  The remaining elements are the steps, which will
//   be rendered in a numbered list.
//
//   The steps are each HTML, which may contain JavaScript event
//   handlers.  The event handlers can either be a JavaScript script
//   or an "event:KeyWord" syntax.  If the latter is used, then the
//   handler for KeyWord is implemented internally in the Dreamweaver
//   executable.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   the array described above
//--------------------------------------------------------------------
function getSetupSteps()
{
  return getSetupStepsForServerObject();
}



//--------------------------------------------------------------------
// FUNCTION:
//   setupStepsCompleted
//
// DESCRIPTION:
//   Returns the number of steps (in the list of steps returned from
//   getSetupSteps) that have already been completed.  This number is
//   used to determine how many steps will have a check mark next to
//   them.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   An integer - the number of check marks to be displayed, or -1
//   if all steps have been completed.
//--------------------------------------------------------------------
function setupStepsCompleted()
{
  return setupStepsCompletedForServerObject();
}