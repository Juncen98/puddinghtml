
// Copyright 2001 Macromedia, Inc. All rights reserved.

//*************************API**************************

<!--Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.-->

function commandButtons(){
  return new Array(MM.BTN_OK,     "okClicked()",
                   MM.BTN_Cancel,"cancelClicked()",
           MM.BTN_Help,"displayHelp()" );
}

var helpDoc = MM.HELP_cmdSelectDSList;

var selectObj;

//*******************LOCAL FUNCTIONS*********************

function initializeUI()
{
   selectObj = new ListControl("ds");

   var selectedDS = MM.commandReturnValue;

	//use Remote DS List.
	remoteDSNs = getRemoteDSList();
	selectObj.setAll(remoteDSNs, remoteDSNs);

  if(!selectObj.pickValue(selectedDS))
		selectObj.setIndex(0);
}

function cancelClicked(){
   MM.commandReturnValue = "";
   window.close();
}

function okClicked()
{
  var retdsn = "";
  var index = document.theForm.ds.selectedIndex;

  if ( index != -1 )
  {
	  retdsn = document.theForm.ds.options[index].text;
  }

  MM.commandReturnValue = retdsn;
  window.close();
}

function getRemoteDSList()
{
	//it get a list of remote JNDI References.
	var dom = dw.getDocumentDOM();

	var httpReply	  = MMHttp.postText(dom.serverModel.getAppURLPrefix() + "_mmServerScripts/jndiDataSources.jsp","jdbcContext=" + MM.jdbcContext,"application/x-www-form-urlencoded","","Connections/Scripts/JRUN 4.0/_mmDBScripts/");

	//it may be an File Transfer failed.
	if (httpReply.statusCode != 200)
	{
		alert(httpError(httpReply.statusCode));
		window.close();
	}

	var remoteDSs = new Array();

	var tempFilename = dw.getConfigurationPath() + '/Shared/MM/Cache/empty.htm';

	if (DWfile.exists(tempFilename)) 
	{
		var tempDOM	 = dw.getDocumentDOM(tempFilename);
		tempDOM.documentElement.outerHTML = httpReply.data;
		var errNodes = tempDOM.getElementsByTagName("ERRORS");
		if (errNodes.length == 0)
		{
			var dsListNodes	= tempDOM.getElementsByTagName("ROW");

			for (var i =0 ; i < dsListNodes.length ; i++)
			{
				remoteDSs.push(dsListNodes[i].getAttribute("NAME"));
			}
		}
		else
		{
			var errNodes	= tempDOM.getElementsByTagName("ERROR");
			if (errNodes.length > 0)
			{
				var errMessage	= errNodes[0].getAttribute("Description");
				alert(errMsg(MM.MSG_JNDIError,errMessage,MM.jdbcContext));
			}
		}
	}

	return remoteDSs
}