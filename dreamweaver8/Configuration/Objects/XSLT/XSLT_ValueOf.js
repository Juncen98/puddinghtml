// Copyright 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

// *************** GLOBALS VARS *****************
var xslValueOfTagBegin = "xsl:value-of";
var xslValueOfSelectAttr = "select";
var xslValueOfDisableOutputEscaping = "disable-output-escaping";
var helpDoc = MM.HELP_objXSLTValueOf;

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
  var retCode = "";
  if (dom)
  {
		expression = dreamweaver.showDynamicDataDialog("", dw.loadString("xslt/expression builder/title/text"));
		if (expression.length)
		{
		  //form the returned code expression (<xsl:value-of select="expression"/>)
			retCode+="<";
			retCode+=xslValueOfTagBegin;
			retCode+=" ";
			retCode+=xslValueOfSelectAttr;
			retCode+="=\"";
			retCode+=expression;
			retCode+="\"";
			//check if schema has rss element which contains html
			if (dreamweaver.isRSSElementContainHTML())
			{
				retCode+=" ";
				retCode+=xslValueOfDisableOutputEscaping;
				retCode+="=\"yes\"";
			}
			retCode+="/>";
			//replace the current selection with xsl:value-of 
			replaceSelectionInDocRemoveNBSP(retCode);
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