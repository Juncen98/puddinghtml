//
// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.
// ----------------------------------------------------
//

//
// ---- Object API ----
//

function objectTag() {
  dreamweaver.popupServerBehavior("DataList.htm");
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

