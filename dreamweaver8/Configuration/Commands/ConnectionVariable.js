// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

//*************** GLOBALS VARS *****************

var _Name = null
var _ConnectionName = new CFDataSourceMenu("", "ConnectionName");
var helpDoc = MM.HELP_dataSourceNameVariable;

var NAME_LIST = null;

//******************* API **********************

function commandButtons()
{
  return new Array(MM.BTN_OK,    "okClicked()",
                   MM.BTN_Cancel,"window.close()",
                   MM.BTN_Help,	"displayHelp()");
}



//***************** LOCAL FUNCTIONS  ******************


function initializeUI()
{
  _Name = dwscripts.findDOMObject("theName");
  _ConnectionName.initializeUI(null, true);
  
  args = dwscripts.getCommandArguments();
  if (args.defaultName)
  {
    _Name.value = args.defaultName;
  }
  
  if (args.nameList)
  {
    NAME_LIST = args.nameList;
  }
  
  if (args.name)
  {
    // re-edit, so disable the name field
    _Name.value = args.name;
    _Name.setAttribute("disabled", true);
  }
  
  if (args.dataSource)
  {
    _ConnectionName.pickValue(args.dataSource);
  }
}


function updateUI(itemName, event)
{
  if (itemName == "ConnectionName" && event == "onChange")
  {
    if (!_Name.value)
    {
      _Name.value = _ConnectionName.getValue();
    }
  }
}


function okClicked()
{
  if (_Name.value)
  {
    if (dwscripts.isValidServerVarName(_Name.value))
    {
      if (!NAME_LIST || dwscripts.findInArray(NAME_LIST, _Name.value) == -1)
      {
        if (_ConnectionName.getValue())
        {
          var retVal = new Object();
          retVal.name = _Name.value;
          retVal.dataSource = _ConnectionName.getValue();

          dwscripts.setCommandReturnValue(retVal);
          window.close();
        }
        else
        {
          alert(MM.MSG_NoDataSource);
        }
      }
      else
      {
        alert(dwscripts.sprintf(MM.MSG_ParamNameAlreadyExists,_Name.value));
      }
    } 
    else
    {
      alert(_Name.value + " " + MM.MSG_InvalidParamName);
    }
  } 
  else
  {
    alert(MM.MSG_NoName);
  }
}


