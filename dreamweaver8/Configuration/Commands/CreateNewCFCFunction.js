// Copyright 2005 Macromedia, Inc. All rights reserved.
var _newFnName;

function commandButtons() {
	btnArray =  new Array(
	MM.BTN_OK,       "clickedOK()", 
  MM.BTN_Cancel,   "clickedCancel()");
	return btnArray;
}

function initializeUI() {
	_newFnName = dwscripts.findDOMObject("newFuctionName");
	var rcFName = dwscripts.getCommandArguments();
	if (rcFName) {
		_newFnName.value = rcFName;
	}

}

function clickedOK() {
	var newFnName = _newFnName.value;

	// check if the name is empty
	if (newFnName == '') {
		alert(MM.MSG_Enter_Function_Name);
		return;
	}

	// check if the name is valid
	if (!newFnName.match(/^[a-z_][\w]*$/i)) {
		alert(MM.MSG_Valid_Function_Name);
		return;
	}

	// check if the function already exists
	var dom = dw.getDocumentDOM();
	var existingFunctions = dom.getElementsByTagName("cffunction");
	for (var i=0;i<existingFunctions.length;i++) {
		if (existingFunctions[i].getAttribute('name') && 
			existingFunctions[i].getAttribute('name').toLowerCase() == newFnName.toLowerCase()) {
			
			alert(MM.MSG_Existing_Function_Name);
			return;
		}
	}

	// check if the cfcomponent tag exists
	var theCFC = dom.getElementsByTagName("cfcomponent");
	if (!theCFC || theCFC.length==0) {
		alert(MM.MSG_NO_CFCOMPONENT);
		window.close();
		return;
	}
	var cffcontent = '\n\t<cffunction name="'+newFnName+'" output="false" access="public" returntype="query"></cffunction>';
	theCFC[0].innerHTML += cffcontent;
	dwscripts.setCommandReturnValue(newFnName);


	window.close();
}

function clickedCancel() {
	_newFnName.value = '';
	window.close();
}

