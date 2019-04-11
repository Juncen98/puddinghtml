
<!--Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.-->

//***********************GLOBAL VARS********************
var helpDoc = MM.HELP_cmdcfDataSourceLogin;

//*************************API**************************

function commandButtons(){
  return new Array(MM.BTN_OK, "okClicked()",
                   MM.BTN_Cancel,"cancelClicked()",
				   MM.BTN_Help,"isplayHelp()" );
}



//*******************LOCAL FUNCTIONS*********************

function initializeUI(){
   var data = MM.commandArgument;
   document.theForm.username.value = data.username;
   document.theForm.password.value = data.password;
}

function cancelClicked(){
   MM.commandReturnValue = "";
   window.close();
}

function okClicked(){
  var dataObj = new Object();
  dataObj.username = document.theForm.username.value;
  
  if(dataObj.username)
  {
    if(StripChars(" ", document.theForm.username.value) == "")
	{
		alert(MM.MSG_EnterPassword);
		return;
	}
  }
  dataObj.password = document.theForm.password.value;
 
  MM.commandReturnValue = dataObj;
  window.close();
}