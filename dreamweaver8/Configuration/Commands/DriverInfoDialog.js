
<!--Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.-->
//**********************Global vars ********************
var driverArray, driverTemplateArray;
var driverListObj;

//*************************API**************************

function commandButtons(){
  return new Array(MM.BTN_OK, "okClicked()",
                   MM.BTN_Cancel,"cancelClicked()",
				   MM.BTN_Help,"alert('Help for all dialogs will be added later by IMD')" );
}



//*******************LOCAL FUNCTIONS*********************

function initializeUI(){
   var dataObj = MM.commandArgument;
   driverArray = new Array;
   driverTemplateArray = new Array;

   driverArray = dataObj.driverArray;
   driverTemplateArray = dataObj.driverTemplateArray;

   driverListObj = new ListControl("DriverList");
   driverListObj.setAll(driverArray, driverArray);
	
   driverListObj.setIndex(dataObj.selectedIndex);
   SelectionChanged();
}


function cancelClicked(){
   
   window.close();
}

function okClicked(){

  var dataObj = new Object();
  dataObj.driverArray = driverArray;
  dataObj.driverTemplateArray = driverTemplateArray;
  
  MM.commandReturnValue = dataObj;
  window.close();
}

function AddClicked()
{
  if (ValidateDriverName(document.theForm.Driver.value))
	{
	  driverArray.push(document.theForm.Driver.value);
	  driverTemplateArray.push(document.theForm.Template.value);
	  driverListObj.setAll(driverArray, driverArray);
	  document.theForm.Driver.value = "";
	  document.theForm.Template.value = "";
	} 
}

function RemoveClicked()
{
  var index = driverListObj.getIndex();
  if(index >= 0){
    driverArray.splice(index, 1);
	driverTemplateArray.splice(index, 1);
    driverListObj.setAll(driverArray, driverArray);
  }
}

function ValidateDriverName(varName)
{  
  if (varName.length == 0)
  {
	alert(MM.MSG_EnterDriver);
	document.theForm.Driver.focus();
	return false;
  }
  return true;
}

function UpdateClicked()
{
  if(driverListObj.getIndex >= 0 )
  {
    if(ValidateDriverName(document.theForm.Driver.value))
	{
      driverArray[driverListObj.getIndex()] =  document.theForm.Driver.value;
      driverTemplateArray[driverListObj.getIndex()] = document.theForm.Template.value;
      driverListObj.setAll(driverArray, driverArray);
	}
  }
}

function SelectionChanged()
{
  document.theForm.Driver.value = driverArray[driverListObj.getIndex()];
  document.theForm.Template.value = driverTemplateArray[driverListObj.getIndex()];
}