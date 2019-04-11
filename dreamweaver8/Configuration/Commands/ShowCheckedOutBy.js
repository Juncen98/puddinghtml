// Copyright 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

var fileName = "";
var siteName = "";
var ownerName = "";
var ownerEmail = "";

//--------------------------------------------------------------------

function commandButtons()
{                          
	return new Array(MM.BTN_OK,     "okClicked()" );
}

//--------------------------------------------------------------------

function receiveArguments()
{
	arguments[0]; 

	if (arguments && arguments.length)
	{
		fileName = (arguments[0]) ? arguments[0] : "";
		siteName = (arguments[1]) ? arguments[1] : "";
		ownerName = (arguments[2]) ? arguments[2] : "";
		ownerEmail = (arguments[3]) ? arguments[3] : "";
	}
}

//--------------------------------------------------------------------

function okClicked()
{
	window.close();
}

//--------------------------------------------------------------------

function initializeUI()
{
	var msg;
	
	if (ownerName != "")
	{
		msg = dw.loadString("site/checkedoutby/owner");
		
		msg = msg.replace(/{filename}/, fileName);
		msg = msg.replace(/{owner}/, ownerName);
		
		if (ownerEmail != "")
		{
			msg = msg.replace(/{href}/, "href=''");
		}
	}
	else
	{
		msg = dw.loadString("site/checkedoutby/not");
		msg = msg.replace(/{filename}/, fileName);
	}
	
	findObject("msg").innerHTML = msg; 
}

function onEmailClicked()
{
	var subject = dw.loadString("site/checkedoutby/email");
	
	subject = subject.replace(/{filename}/, fileName);
	subject = subject.replace(/{sitename}/, siteName);
	
	dw.sendEmail(ownerEmail, subject);
	
	window.close();
}
