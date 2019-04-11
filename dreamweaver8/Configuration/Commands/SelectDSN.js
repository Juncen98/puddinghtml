// Copyright 2000, 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.





// *************** GLOBALS VARS *****************



var HELP_DOC = MM.HELP_cmdSelectDSNList;



var DSN_SELECT_OBJ;





//*************************API**************************



//--------------------------------------------------------------------

// FUNCTION:

//   commandButtons

//

// DESCRIPTION:

//   Returns the array of buttons that should be displayed on the

//   right hand side of the dialog.  The array is comprised

//   of name, handler function name pairs.

//

// ARGUMENTS:

//   none

//

// RETURNS:

//   array of strings - name, handler function name pairs

//--------------------------------------------------------------------



function commandButtons()

{

  return new Array(MM.BTN_OK,     "okClicked()",

                   MM.BTN_Cancel, "cancelClicked()",

                   MM.BTN_Help,   "displayHelp()" );

}





//--------------------------------------------------------------------

// FUNCTION:

//   okClicked

//

// DESCRIPTION:

//   Sets the return value to the selected DSN and closes the window.

//

// ARGUMENTS:

//   none

//

// RETURNS:

//   nothing

//--------------------------------------------------------------------



function okClicked()

{

  //don't allow user to close dialog when in the middle of server activity

  if (site.serverActivity())

	return;

	

  var retVal = DSN_SELECT_OBJ.get();

  

  dwscripts.setCommandReturnValue(retVal);

  

  // reset the options list

  DSN_SELECT_OBJ.setAll(new Array(MM.LABEL_Loading));

  

  window.close();

}





//--------------------------------------------------------------------

// FUNCTION:

//   cancelClicked

//

// DESCRIPTION:

//   Closes the window and returns nothing

//

// ARGUMENTS:

//   none

//

// RETURNS:

//   nothing

//--------------------------------------------------------------------



function cancelClicked()

{

  //don't allow user to close dialog when in the middle of server activity

  if (site.serverActivity())

	return;

	

  dwscripts.setCommandReturnValue("");



  // reset the options list

  DSN_SELECT_OBJ.setAll(new Array(MM.LABEL_Loading));

  

  window.close();

}





//--------------------------------------------------------------------

// FUNCTION:

//   displayHelp

//

// DESCRIPTION:

//   Displays the built-in Dreamweaver help.

//

// ARGUMENTS:

//   none

//

// RETURNS:

//   nothing

//--------------------------------------------------------------------



function displayHelp()

{

  // Replace the following call if you are modifying this file for your own use.

  dwscripts.displayDWHelp(HELP_DOC);

}







//*******************LOCAL FUNCTIONS*********************



//--------------------------------------------------------------------

// FUNCTION:

//   initializeUI

//

// DESCRIPTION:

//   Find the dom objects that will be used to manipualte the dialog

//

// ARGUMENTS:

//   none

//

// RETURNS:

//   nothing

//--------------------------------------------------------------------



function initializeUI()

{

  DSN_SELECT_OBJ = new ListControl("dsn");



  var args = dwscripts.getCommandArguments();

  if (args && args.length)

  {

    var selectedDSN = args[0];

    var useHTTP = args[1];

  }

  else if (MM.useHTTP)

  {

    // special case to handle old references to this dialog

    selectedDSN = MM.commandReturnValue;

    useHTTP = MM.useHTTP;

  }  

  

  if (useHTTP)

  {

    //use Remote DSN List

    var remoteDSNs = MMDB.getRemoteDsnList();

    DSN_SELECT_OBJ.setAll(remoteDSNs, remoteDSNs);

  }

  else

  {

    //use Local DSN List

    var localDSNs = MMDB.getLocalDsnList();

    DSN_SELECT_OBJ.setAll(localDSNs, localDSNs);

  }



  if(!DSN_SELECT_OBJ.pickValue(selectedDSN))

  {

    DSN_SELECT_OBJ.setIndex(0);

  }



}

