// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

// *************** GLOBALS VARS *****************

    var commandFile = "RadioGroup.htm";

// ******************* API **********************

//--------------------------------------------------------------------
// FUNCTION:
//   objectTag
//
// DESCRIPTION:
//   This object is used as a shim to launch the appropriate 
//   command file for the current server model.  The individual
//   command files are responsible for inserting the code on the
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
  var retVal = "";
  
  if (dom)
  {
      dwscripts.callCommand(commandFile)
  }
  
  return ""; 
}



// ***************** LOCAL FUNCTIONS  ******************

//--------------------------------------------------------------------
// FUNCTION:
//   canInsertObject
//
// DESCRIPTION:
//   The function returns true if this object can be inserted in the
//   current document.  This function, and the functions it calls should
//   display the necessary error messages.
//
// ARGUMENTS:
//   commandFileName - string - the file name of the command file
//     which implements this object
//
// RETURNS:
//   boolean - true if the dialog should be displayed, or false otherwise
//--------------------------------------------------------------------

function canInsertObject()
{
  var retVal = false;
  
  var path = dw.getConfigurationPath() + "/Commands/" + commandFile;
  
  if (dwscripts.fileExists(path))
  {
    retVal = true;
  }
  
  return retVal;
}