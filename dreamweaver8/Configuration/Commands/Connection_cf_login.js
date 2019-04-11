
<!--Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.-->

//*************************API**************************
var HELP_DOC = MM.HELP_cmdcfDataSourceLogin;

function commandButtons(){
  return new Array(MM.BTN_OK, "okClicked()",
                   MM.BTN_Cancel,"cancelClicked()",
				   MM.BTN_Help,    "displayHelp()" );

}



//*******************LOCAL FUNCTIONS*********************

function initializeUI(){
  var args = dwscripts.getCommandArguments();
  if (args && args.length)
  {
	  document.theForm.datasourcename.innerHTML = args[0];
		document.theForm.username.value = args[1];
		document.theForm.password.value = args[2];
	}
}

function cancelClicked(){
   dwscripts.setCommandReturnValue("");
   window.close();
}

function okClicked()
{
  var retVal = new Array();
  retVal.push(dwscripts.trim(document.theForm.username.value));
  retVal.push(dwscripts.trim(document.theForm.password.value)); 
  dwscripts.setCommandReturnValue(retVal);

  window.close();
}

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
