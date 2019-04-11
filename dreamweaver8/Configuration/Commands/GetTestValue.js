// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

function commandButtons()
{
  return new Array(MM.BTN_OK,"ClickedOK()",MM.BTN_Cancel,"ClickedCancel()")
}

function ClickedOK()
{
  MM.clickedOK = true
  MM.retVal = document.forms[0].textfield.value;
  MM.SimpleRecordsetDefaultVal = MM.retVal;
  MM.maxParamNamePixels = 0;

  window.close()
}

function ClickedCancel()
{
  MM.clickedOK = false;
  MM.maxParamNamePixels = 0;

  window.close();
}

function initializeUI()
{
  var paramNameObj = findObject("paramName");
  var paramName = MM.paramName;

  if (MM.maxParamNamePixels > 0)
  {
    paramName = dw.shortenString(paramName, MM.maxParamNamePixels, false);
    MM.maxParamNamePixels = 0;
  }
  
  paramNameObj.innerHTML = paramName;

  var textField = document.forms[0].textfield;

  if (MM.SimpleRecordsetDefaultVal != null)
  {
	textField.value = MM.SimpleRecordsetDefaultVal;
  }
	
  textField.focus();
}
