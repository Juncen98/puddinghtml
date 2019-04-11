//SHARE-IN-MEMORY=true
// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.


//--------------------------------------------------------------------
// CLASS:
//   CFDataSourceMenu
//
// DESCRIPTION:
//   Creates a menu of the current connections
//   The menu consists of menu labels and menu values
//   The labels are a user-friendly list of connections
//   The values are the actual connection paths.
//
// PUBLIC PROPERTIES:
//
// PUBLIC FUNCTIONS:
//
//   initializeUI()
//
//   getName
//   getValue()
//   getUsername()
//   getPassword()
//   pickName()
//   pickValue(connName)
//   ensureLogin()
//
//   applyServerBehavior(sbObj, paramObj)
//   inspectServerBehavior(sbObj)
//
//--------------------------------------------------------------------


//--------------------------------------------------------------------
// FUNCTION:
//   CFDataSourceMenu
//
// DESCRIPTION:
//   Constructor function for the CFDataSourceMenu control
//
// ARGUMENTS:
//   behaviorName - the name of the behavior using this control
//   paramName - the name of the parameter that is being set
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function CFDataSourceMenu(behaviorName, paramName, empty) 
{
  this.behaviorName = behaviorName;
  this.paramName = paramName;
  
  this.listControl = '';

  this.isConnectionMenu = true;
  
  window.MM_CONNECTION_MENU = this;
}

//public methods
CFDataSourceMenu.prototype.initializeUI = CFDataSourceMenu_initializeUI;
CFDataSourceMenu.prototype.updateUI = CFDataSourceMenu_updateUI;

CFDataSourceMenu.prototype.getName = CFDataSourceMenu_getName;
CFDataSourceMenu.prototype.getValue = CFDataSourceMenu_getValue;
CFDataSourceMenu.prototype.getUsername = CFDataSourceMenu_getUsername;
CFDataSourceMenu.prototype.getPassword = CFDataSourceMenu_getPassword;
CFDataSourceMenu.prototype.pickName = CFDataSourceMenu_pickName;
CFDataSourceMenu.prototype.pickValue = CFDataSourceMenu_pickValue;
CFDataSourceMenu.prototype.getRDSConnections = CFDataSourceMenu_getRDSConnections;
CFDataSourceMenu.prototype.ensureLogin = CFDataSourceMenu_ensureLogin;

CFDataSourceMenu.prototype.applyServerBehavior = CFDataSourceMenu_applyServerBehavior;
CFDataSourceMenu.prototype.inspectServerBehavior = CFDataSourceMenu_inspectServerBehavior;

// no ops
CFDataSourceMenu.prototype.findServerBehaviors = CFDataSourceMenu_findServerBehaviors;
CFDataSourceMenu.prototype.canApplyServerBehavior = CFDataSourceMenu_canApplyServerBehavior;
CFDataSourceMenu.prototype.deleteServerBehavior = CFDataSourceMenu_deleteServerBehavior;
CFDataSourceMenu.prototype.analyzeServerBehavior = CFDataSourceMenu_analyzeServerBehavior;


//--------------------------------------------------------------------
// FUNCTION:
//   initializeUI()
//
// DESCRIPTION:
//   initializes the list control with the names of the connections
//
// ARGUMENTS:
//   elementName - string - (optional) the name of the form control, if it
//     differs from the parameter name
//   ignoreConnectionVariables - boolean - (optional) true if
//     connection vars should not be included in the list of 
//     data sources
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function CFDataSourceMenu_initializeUI(elementName, ignoreConnectionVariables) 
{ 
  var elemName = (elementName) ? elementName : this.paramName;
  
  this.listControl = new ListControl(elemName);

  var connNames;  
  var retValue = true; 

  var noneArray = new Array(MM.LABEL_None);
  var blankArray = new Array("");

  connNames = this.getRDSConnections(); 
  
  if (!ignoreConnectionVariables)
  {
    var dsList = dwscripts.getDataSourcesByFileName("ConnectionVar.htm");
    
    var nodeList = null;
    if (dsList && dsList.length)
    {
      var nodeList = dwscripts.getDataSourceNodes(dsList[0]);
    }
    
    var varNames = new Array();
    var varValues = new Array();
    
    if (nodeList && nodeList.length)
    {
      for (var i=0; i < nodeList.length; i++)
      {
        varNames.push("#" + nodeList[i].title + "#");
        varValues.push(nodeList[i].name);
      }
    }    
  }
  
  if (varNames && varValues)
  {
    this.listControl.setAll(noneArray.concat(varNames).concat(connNames),
                            blankArray.concat(varValues).concat(connNames));
  }
  else
  {

    if (!connNames)
    {
      retValue = false; 
    }
    
    this.listControl.setAll(noneArray.concat(connNames), blankArray.concat(connNames));
  }
  
  this.listControl.setIndex(0);
  
  return retValue; 
}


//--------------------------------------------------------------------
// FUNCTION:
//   updateUI()
//
// DESCRIPTION:
//   Check the newly selected data source to see if the user needs
//   to specify a username and password
//
// ARGUMENTS:
//   control - object - the control that fired the event
//   event - string - the event fired by the control
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function CFDataSourceMenu_updateUI(control, event)
{
  var retVal = true;
  
  if (control == this)
  {
    this.ensureLogin();
  }
  
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   getName
//
// DESCRIPTION:
//   Returned the currently selected name
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function CFDataSourceMenu_getName()
{
  var retVal = "";

  if (this.listControl)
  {
    retVal = this.listControl.get();
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   getValue
//
// DESCRIPTION:
//   Returned the currently selected value
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function CFDataSourceMenu_getValue()
{
  var retVal = "";

  if (this.listControl)
  {
    retVal = this.listControl.getValue();
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   getUsername
//
// DESCRIPTION:
//   Returns the username being used for the current connection
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function CFDataSourceMenu_getUsername()
{
  var retVal = "";
  
  var connRec = MMDB.getConnection(this.getValue());
  if (connRec)
  {
    retVal = connRec.username;
  }
  
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   getPassword
//
// DESCRIPTION:
//   Returns the password being used for the current connection
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function CFDataSourceMenu_getPassword()
{
  var retVal = "";
  
  var connRec = MMDB.getConnection(this.getValue());
  if (connRec)
  {
    retVal = connRec.password;
  }
  
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   pickName
//
// DESCRIPTION:
//   Select the connection with the given name
//
// ARGUMENTS:
//   connName - string - the connection to select
//   dontPromptForVariable - boolean - true to supress the display
//     of the add connection variable dialog.
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function CFDataSourceMenu_pickName(connName, dontPromptForVariable)
{
  retVal = false;

  //find the name in the list
  for (var i=0; i < this.listControl.getLen() ; i++) 
  {
    if (this.listControl.get(i) == connName) 
    {
      retVal = this.listControl.setIndex(i);

      if (window.updateUI != null)
      {
        window.updateUI(this.paramName, "onPickName");
      }

      break;
    }
  }
  
  if (!retVal && !dontPromptForVariable)
  {
    // check if this is a variable
    if (connName.charAt(0) == "#" && connName.charAt(connName.length-1) == "#")
    {
      dwscripts.popupDataSource("ConnectionVar.htm", connName.substring(1,connName.length-1));

      this.initializeUI();
      
      this.pickName(connName, true);
    }
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   pickValue
//
// DESCRIPTION:
//   Select the connection with the given name
//
// ARGUMENTS:
//   connName - string - the connection to select
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function CFDataSourceMenu_pickValue(connName)
{
  retVal = false;

  //find the name in the list
  for (var i=0; i < this.listControl.getLen() ; i++) 
  {
    if (this.listControl.getValue(i) == connName) 
    {
      retVal = this.listControl.setIndex(i);

      if (window.updateUI != null)
      {
        window.updateUI(this.paramName, "onPickValue");
      }

      break;
    }
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   getRDSConnections
//
// DESCRIPTION:
//   This function returns a list of connections for ColdFusion.
//   We keep popping up the RDS dialog as long as the the 
//   remote dsn list is empty and the user clicks ok in the RDS dialog.
//   If the user clicks cancel, back off and let the user 
//   into the connection dialog.
//
// ARGUMENTS: 
//   none
//
// RETURNS:
//   array of strings - an array of connection names
//--------------------------------------------------------------------

function CFDataSourceMenu_getRDSConnections()
{
  var CFDSNArray = MMDB.getColdFusionDsnList();
   
  if (MMDB.needToPromptForRdsInfo(true))
  {
    var exit = false;
    while (!exit)
    {
      //Show the RDS Dialog
      var returnArray = MMDB.showRdsUserDialog(MMDB.getRDSUserName(), MMDB.getRDSPassword(), returnArray);
      
      //Proceed if the user name or password and not empty. 
      //We use or instead of and because ColdFusion might need 
      //only a password in certain circumstances.

      if (returnArray.username != null && returnArray.password != null) 
      {
        var RDSusername = returnArray.username;
        var RDSpassword = returnArray.password;

        MMDB.setRDSUserName(RDSusername);
        MMDB.setRDSPassword(RDSpassword);

        CFDSNArray = MMDB.getColdFusionDsnList();

        exit = (!MMDB.needToPromptForRdsInfo(true));
      }      
      else // cancel button clicked 
      {
        exit = true;      
      }
    }  //while
  } 
  
  return (CFDSNArray && CFDSNArray.length) ? CFDSNArray : false; 
}


//--------------------------------------------------------------------
// FUNCTION:
//   ensureLogin
//
// DESCRIPTION:
//   This function gives the user an opportunity to ensure the 
//   username and password have been provided, and are correct. 
//   If the user hits the ok button in the connection dialog, the 
//   connection will be tested automatically and if it fails,
//   the username/password dialog pops up again. If the user clicks 
//   cancel, the dialog closes without testing the connection. 
//
// ARGUMENTS:
//   pageUsername - string - (optional) the username stored in the
//     cfquery tag on the page
//   pagePassword - string - (optional) the password stored in the
//     cfquery tag on the page
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function CFDataSourceMenu_ensureLogin(pageUsername, pagePassword)
{
  var retVal = true;
  
  var connectionName = this.getValue();
  
  if (connectionName)
  {  
    // test the connection by getting the tables
    var tableObjects = MMDB.getTables(connectionName);

    var retVal = (tableObjects && tableObjects.length);

    // try the pageUsername and pagePassword if they were provided
    if (!retVal && (pageUsername || pagePassword))
    {
      var connRec = MMDB.getConnection(connectionName);
      if (connRec)
      {
        connRec.username = (pageUsername) ? pageUsername : "";
        connRec.password = (pagePassword) ? pagePassword : "";
        retVal = MMDB.testConnection(connRec, false);
        if (retVal)
        {
          MMDB.setConnection(connRec);
        }
      }
    }

    while (!retVal)
    {
      var connRec = MMDB.getConnection(connectionName);
      if (connRec)
      {
        var username = connRec.username;
        var password = connRec.password;
        var result = dwscripts.callCommand("Connection_cf_login.htm", new Array(connectionName,username,password));
        if (result && result.length)
        {
          connRec.username = result[0];
          connRec.password = result[1];
          MMDB.setConnection(connRec);
          retVal = MMDB.testConnection(connRec, false);
          if (!retVal)
          {
            // show the error dialog if it fails
            MMDB.testConnection(connRec);
          }
        }
        else
        {
          // the user hit cancel
          break;
        }
      }
      else
      {
        // bad connection name
        alert(dwscripts.sprintf(MM.MSG_ConnNotFound, connectionName));
        break;
      }
    }
  }
  
  if (!retVal)
  {
    // if we fail, set the connection to None
    this.listControl.setIndex(0);
  }
  
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   applyServerBehavior
//
// DESCRIPTION:
//   Add the selected connection path to the list of parameters
//
// ARGUMENTS: 
//   sbObj - ServerBehavior objct - the previous SB instance
//   paramObj - JavaScript Object - the parameter values array
//
// RETURNS:
//   boolean - true is successful
//--------------------------------------------------------------------

function CFDataSourceMenu_applyServerBehavior(sbObj, paramObj)
{
  var retVal = "";
  
  var connName = this.listControl.get();
  var connValue = this.listControl.getValue();
  
  if (!connValue) 
  {
    retVal = MM.MSG_NoCFDataSource;
  } 
  else 
  {
    //add connection name to the paramObj
    paramObj[this.paramName] = connName;
  }
   
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   inspectServerBehavior
//
// DESCRIPTION:
//   Sets the selected connection, based on the parameters for the
//   given ServerBehavior
//
// ARGUMENTS:
//   sbObj - ServerBehvaior object
//   newErrMsgStr - string - and alternate error message to be displayed
//     if the given connection cannot be found
//
// RETURNS:
//   boolean - true if successful
//--------------------------------------------------------------------

function CFDataSourceMenu_inspectServerBehavior(sbObj, newErrMsgStr)
{
  var retVal = "";
  
  var connName = sbObj.parameters[this.paramName];

  retVal = this.pickName(connName);

  if (!retVal) // if connection name can't be found
  {
    // If "" passed in, don't display any error.
    if (newErrMsgStr == null) 
    {
      alert(dwscripts.sprintf(MM.MSG_ConnNotFound, connName)); // display specific error msg
    } 
    else if (newErrMsgStr.length > 0) 
    {
      alert(newErrMsgStr);        // display generic error msg
    }
  }
    
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   findServerBehaviors
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------
function CFDataSourceMenu_findServerBehaviors(paramObj) 
{
  // nothing needed here
}


//--------------------------------------------------------------------
// FUNCTION:
//   canApplyServerBehavior
//
// DESCRIPTION:
//   The user can define new connections, so nothing is needed here.
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------
function CFDataSourceMenu_canApplyServerBehavior(sbObj) 
{
  var retVal = true;
  
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   deleteServerBehavior
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------
function CFDataSourceMenu_deleteServerBehavior(sbObj) 
{
  // nothing needed here
}


//--------------------------------------------------------------------
// FUNCTION:
//   analyzeServerBehavior
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------
function CFDataSourceMenu_analyzeServerBehavior(sbObj, allRecs) 
{
  // nothing needed here
}




