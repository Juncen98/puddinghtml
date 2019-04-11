// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

function commandButtons()
{
  return new Array(MM.BTN_OK,"ClickedOK()", MM.BTN_Cancel,"ClickedCancel()", MM.BTN_Help, "displayHelp()")
}

function ClickedOK()
{
  var value = document.forms[0].textfield.value;

  if (value) {
    if (IsValidVarName(value)) {
      MM.clickedOK = true;
      MM.retVal = value;
      window.close()
    } else {
      alert(value + " " + MM.MSG_InvalidParamName);
    }
  } else {
    alert(MM.MSG_NoName);
  }
}

function ClickedCancel()
{
  MM.clickedOK = false
  window.close()
}
