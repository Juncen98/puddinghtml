<!-- auto-generated=true -->
<!DOCTYPE HTML SYSTEM "-//Macromedia//DWExtension layout-engine 5.0//dialog">

<HTML>
<HEAD>
<TITLE><%= serverBehaviorTitle %></TITLE>

<SCRIPT SRC="../../Shared/Common/Scripts/dwscripts.js"></SCRIPT>
<SCRIPT SRC="../../Shared/Common/Scripts/dwscriptsServer.js"></SCRIPT>
<SCRIPT SRC="../../Shared/Common/Scripts/dwscriptsExtData.js"></SCRIPT>
<SCRIPT SRC="../../Shared/Common/Scripts/ServerBehaviorClass.js"></SCRIPT>

<% for (i = 0; i < numDependents; i++) { %>
<SCRIPT SRC="../../<%= dependentFiles[i] %>"></SCRIPT>
<% } %>
<SCRIPT>

<% for (i = 0; i < numParameters; i++) { %>
var _<%= paramNames[i] %> = new <%= paramControlTypes[i] %>("<%= serverBehaviorName %>.htm", "<%= paramNames[i] %>", "<%= paramTagTypes[i] %>");
<% } %>


//--------------------------------------------------------------------
// FUNCTION:
//   initializeUI
//
// DESCRIPTION:
//   Prepare the dialog and controls for user input
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function initializeUI()
{
  var elts;

<% for (i = 0; i < numParameters; i++) { %>
  _<%= paramNames[i] %>.initializeUI();
<% } %>

<% if (numParameters > 0) { %>
  elts = document.forms[0].elements;
  if (elts && elts.length)
    elts[0].focus();
<% } %>
}


//--------------------------------------------------------------------
// FUNCTION:
//   findServerBehaviors
//
// DESCRIPTION:
//   Returns an array of ServerBehavior objects, each one representing
//   an instance of this Server Behavior on the page
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   JavaScript Array of ServerBehavior objects
//--------------------------------------------------------------------
function findServerBehaviors()
{
<% for (i = 0; i < numParameters; i++) { %>
  _<%= paramNames[i] %>.findServerBehaviors();
<% } %>

  sbArray = dwscripts.findSBs();

  return sbArray;
}


//--------------------------------------------------------------------
// FUNCTION:
//   canApplyServerBehavior
//
// DESCRIPTION:
//   Returns true if a Server Behavior can be applied to the current
//   document
//
// ARGUMENTS:
//   sbObj - ServerBehavior object - one of the objects returned
//           from findServerBehaviors
//
// RETURNS:
//   boolean - true if the behavior can be applied, false otherwise
//--------------------------------------------------------------------
function canApplyServerBehavior(sbObj)
{
  var success = true;
<% for (i = 0; i < numParameters; i++) { %>
  if (success)
  {
    success = _<%= paramNames[i] %>.canApplyServerBehavior(sbObj);
  }
<% } %>
  if (success)
  {
    success = dwscripts.canApplySB(sbObj, false); // preventNesting is false
  }
  return success;
}


//--------------------------------------------------------------------
// FUNCTION:
//   applyServerBehavior
//
// DESCRIPTION:
//   Collects values from the form elements in the dialog box and
//   adds the Server Behavior to the user's document
//
// ARGUMENTS:
//   sbObj - ServerBehavior object - one of the objects returned
//           from findServerBehaviors
//
// RETURNS:
//   string - empty upon success, or an error message
//--------------------------------------------------------------------
function applyServerBehavior(sbObj)
{
  var paramObj = new Object();
  var errStr = "";

<% for (i = 0; i < numParameters; i++) { %>
  if (!errStr)
  {
    errStr = _<%= paramNames[i] %>.applyServerBehavior(sbObj, paramObj);
  }
<% } %>

  if (!errStr)
  {
    dwscripts.fixUpSelection(dw.getDocumentDOM(), true, true);
    dwscripts.applySB(paramObj, sbObj);
  }
  return errStr;
}


//--------------------------------------------------------------------
// FUNCTION:
//   inspectServerBehavior
//
// DESCRIPTION:
//   Sets the values of the form elements in the dialog box based
//   on the given ServerBehavior object
//
// ARGUMENTS:
//   sbObj - ServerBehavior object - one of the objects returned
//           from findServerBehaviors
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function inspectServerBehavior(sbObj)
{
<% for (i = 0; i < numParameters; i++) { %>
  _<%= paramNames[i] %>.inspectServerBehavior(sbObj);
<% } %>
}


//--------------------------------------------------------------------
// FUNCTION:
//   deleteServerBehavior
//
// DESCRIPTION:
//   Remove the specified Server Behavior from the user's document
//
// ARGUMENTS:
//   sbObj - ServerBehavior object - one of the objects returned
//           from findServerBehaviors
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function deleteServerBehavior(sbObj)
{
<% for (i = 0; i < numParameters; i++) { %>
  _<%= paramNames[i] %>.deleteServerBehavior(sbObj);
<% } %>

  dwscripts.deleteSB(sbObj);
}


//--------------------------------------------------------------------
// FUNCTION:
//   analyzeServerBehavior
//
// DESCRIPTION:
//   Performs extra checks needed to determine if the Server Behavior
//   is complete
//
// ARGUMENTS:
//   sbObj - ServerBehavior object - one of the objects returned
//           from findServerBehaviors
//   allRecs - JavaScripts Array of ServerBehavior objects - all of the
//             ServerBehavior objects known to Dreamweaver
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function analyzeServerBehavior(sbObj, allRecs)
{
<% for (i = 0; i < numParameters; i++) { %>
  _<%= paramNames[i] %>.analyzeServerBehavior(sbObj, allRecs);
<% } %>
}


//--------------------------------------------------------------------
// FUNCTION:
//   updateUI
//
// DESCRIPTION:
//   Called from controls to update the dialog based on user input
//
// ARGUMENTS:
//   controlName - string - the name of the control which called us
//   event - string - the name of the event which triggered this call
//           or null
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function updateUI(controlName, event)
{
  if (window["_" + controlName] != null)
  {
    var controlObj = window["_" + controlName];

<% for (i = 0; i < numParameters; i++) { %>
    if (_<%= paramNames[i] %>.updateUI != null)
    {
      _<%= paramNames[i] %>.updateUI(controlObj, event);
    }
<% } %>
  }
}

</SCRIPT>

</HEAD>

<BODY onLoad="initializeUI()">
<% if (numParameters > 0) { %>
<FORM NAME="theForm">
  <TABLE BORDER=0>
<% for (i = 0; i < numParameters; i++) { %>
    <TR>
      <TD ALIGN="right" VALIGN="baseline" NOWRAP>
        <%= paramLabels[i] %>:
      </TD>
      <TD VALIGN="baseline" NOWRAP>
        <%= paramControlSources[i].replace(/\n/g, "\n        ") %>
      </TD>
    </TR>
    <TR><TD HEIGHT="1"></TD></TR>
<% } %>
  </TABLE>
</FORM>
<% } %>
</BODY>
</HTML>

