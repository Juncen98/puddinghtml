//SHARE-IN-MEMORY=true
// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.


//--------------------------------------------------------------------
// CLASS:
//   DatabaseTreeControl
//
// DESCRIPTION:
//   This class represents a database tree control.
//
//   To define one of these, use the following HTML:
//
//     <select name="" style="width:300px;height:110px" 
//      type="mmdatabasetree" connection="" 
//      onChange=""></select>
//
//   The key attributes, are type and connection.  The other attibutes
//   are standard select list attributes.
//
//   The DatabaseTreeControl Constructor takes a pointer to a DBTree as the only
//   argument.
//
//   Calling .getSelectedData() on the DatabaseTreeControl returns a DatabaseTreeInfo object.
//   This object has the following props:
//
//    1) table
//    2) column
//    3) procedure
//    4) paramArray - an array of procParam objects  
//    5) origStr    - the original selectedItem string from the table
//
//   It also has the following methods. Use these methods to determine which
//   properties will have valid values:
//
//    1) isTable 
//    2) isColumn
//    3) isProcedure
//
// PUBLIC PROPERTIES:
//
//   <property> - <type and description>
//
// PUBLIC FUNCTIONS:
//
//   <function name> - <description>
//--------------------------------------------------------------------


//--------------------------------------------------------------------
// FUNCTION:
//   DatabaseTreeControl
//
// DESCRIPTION:
//   Constructor function
//
// ARGUMENTS:
//   theName - string - the name of the HTML control
//
// RETURNS:
//   <type and description>
//--------------------------------------------------------------------

function DatabaseTreeControl(theName)
{
  this.object = dwscripts.findDOMObject(theName);
}

// static properties

DatabaseTreeControl.COLUMN_LABEL = ":MM_TABLE_COLUMN:";
DatabaseTreeControl.SP_LABEL = ":MM_SP_PARAMS:";

// public methods

DatabaseTreeControl.prototype.setConnection = DatabaseTreeControl_setConnection;
DatabaseTreeControl.prototype.getConnection = DatabaseTreeControl_getConnection;
DatabaseTreeControl.prototype.getSelectedData = DatabaseTreeControl_getSelectedData;

// private methods

DatabaseTreeControl.prototype.parseSPParams = DatabaseTreeControl_parseSPParams;
DatabaseTreeControl.prototype.getParamAttr = DatabaseTreeControl_getParamAttr;
DatabaseTreeControl.prototype.paramsToArray = DatabaseTreeControl_paramsToArray;


//--------------------------------------------------------------------
// FUNCTION:
//   setConnection
//
// DESCRIPTION:
//   Sets the current connection for the tree
//
// ARGUMENTS:
//   connectionName - string - the name of the connection
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function DatabaseTreeControl_setConnection(connectionName)
{
  if (this.object.connection != connectionName)
  {
    this.object.connection = connectionName;
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   getConnection
//
// DESCRIPTION:
//   Returns the name of the current connection
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string - connection name
//--------------------------------------------------------------------

function DatabaseTreeControl_getConnection()
{
  return this.object.connection;
}


//--------------------------------------------------------------------
// FUNCTION:
//   getSelectedData
//
// DESCRIPTION:
//   <description>
//
// ARGUMENTS:
//   <arg1> - <type and description>
//
// RETURNS:
//   <type and description>
//--------------------------------------------------------------------

function DatabaseTreeControl_getSelectedData()
{
  var treeInfo = new DatabaseTreeInfo();
  var str = "";
  
  // Check if selectedItem is undefined.
  if (this.object.selectedItem)
  {
    str = String(this.object.selectedItem);
  }

  treeInfo.origStr = str;

  if (str == "")
  {
    return treeInfo;
  }

  var index = str.indexOf(DatabaseTreeControl.COLUMN_LABEL)

  if (index != -1)
  {
    treeInfo.table = str.substring(0, index);
    treeInfo.column = str.substring(index + DatabaseTreeControl.COLUMN_LABEL.length);

    return treeInfo;
  }
  
  index = str.indexOf(DatabaseTreeControl.SP_LABEL)

  if (index != -1)
  {
    treeInfo.procedure = str.substring(0, index);

    var paramList = str.substring(index + DatabaseTreeControl.SP_LABEL.length)
    
    this.parseSPParams(paramList, treeInfo);

    return treeInfo;
  }

  //If we get here, it was just a table name
  treeInfo.table = str;

  return treeInfo;
}


//--------------------------------------------------------------------
// FUNCTION:
//   parseSPParams
//
// DESCRIPTION:
//   <description>
//
// ARGUMENTS:
//   paramList - parameter list 
//   treeInfo - tree info object (see constructor below) 
//
// RETURNS:
//   none
//--------------------------------------------------------------------

function DatabaseTreeControl_parseSPParams(paramList, treeInfo)
{ 
  var paramArray = this.paramsToArray(paramList);

  for (var i=0; i < paramArray.length; i++)
  {
    var thisParam = new DatabaseTreeParamObj();

    thisParam.name = this.getParamAttr("name", paramArray[i]);
    thisParam.direction = this.getParamAttr("direction", paramArray[i]);
    thisParam.type = this.getParamAttr("datatype", paramArray[i]);

    treeInfo.paramArray.push(thisParam); 
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   getParamAttr
//
// DESCRIPTION:
//   <description>
//
// ARGUMENTS:
//   <arg1> - <type and description>
//
// RETURNS:
//   <type and description>
//--------------------------------------------------------------------

function DatabaseTreeControl_getParamAttr(attr, paramDef)
{
  var index = paramDef.indexOf(attr + ":");
  var theEnd = paramDef.indexOf(";", index);

  return paramDef.substring(index + attr.length + 1, theEnd);
}


//--------------------------------------------------------------------
// FUNCTION:
//   <function name>
//
// DESCRIPTION:
//   <description>
//
// ARGUMENTS:
//   <arg1> - <type and description>
//
// RETURNS:
//   <type and description>
//--------------------------------------------------------------------

function DatabaseTreeControl_paramsToArray(strIn)
{
  var str = String(strIn);
  var outArray = new Array();

  while (str.length > 0)
  {
    var commaPos = str.indexOf(","); 
    if (commaPos != -1)
    {
      // get this set of params and then
      // clip them off the front of str

      var paramSet = str.substring(0, commaPos);
      outArray.push(paramSet);
      str = str.substring(commaPos + 1);
    }
    else 
    {
      // it is the last set of params
      outArray.push(str);    
      str = "";
    }
  }

  return outArray;
}



//--------------------------------------------------------------------
// CLASS:
//   DatabaseTreeInfo
//
// DESCRIPTION:
//   This class represents a row of tree information within the DBTree
//
// PUBLIC PROPERTIES:
//   <property> - <type and description>
//
// PUBLIC FUNCTIONS:
//   <function name> - <description>
//--------------------------------------------------------------------


//--------------------------------------------------------------------
// FUNCTION:
//   DatabaseTreeInfo
//
// DESCRIPTION:
//   Constructor function
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   notihing
//--------------------------------------------------------------------

function DatabaseTreeInfo()
{
  this.table = ""
  this.column = ""
  this.procedure = ""
  this.paramArray = new Array()
  this.origStr = ""
}


DatabaseTreeInfo.prototype.isTable = DatabaseTreeInfo_isTable
DatabaseTreeInfo.prototype.isColumn = DatabaseTreeInfo_isColumn
DatabaseTreeInfo.prototype.isProcedure = DatabaseTreeInfo_isProcedure
DatabaseTreeInfo.prototype.isEmpty = DatabaseTreeInfo_isEmpty


//--------------------------------------------------------------------
// FUNCTION:
//   isTable
//
// DESCRIPTION:
//   Determines whether the selected item in the DBTree is a table
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   true or false
//--------------------------------------------------------------------

function DatabaseTreeInfo_isTable()
{
  return (this.table != "" && this.column == "")
}


//--------------------------------------------------------------------
// FUNCTION:
//   isColumn
//
// DESCRIPTION:
//   Determines whether the selected item in the DBTree is a column
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   true or false
//--------------------------------------------------------------------

function DatabaseTreeInfo_isColumn()
{
  return (this.table != "" && this.column != "")
}


//--------------------------------------------------------------------
// FUNCTION:
//   isProcedure
//
// DESCRIPTION:
//   Determines whether the selected item in the DBTree is a stored procedure
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   true or false
//--------------------------------------------------------------------

function DatabaseTreeInfo_isProcedure()
{
  return (this.procedure != "")
}


//--------------------------------------------------------------------
// FUNCTION:
//   isEmpty
//
// DESCRIPTION:
//   Checks to see whether the selected node in the DBTree is not 
//   a column, table or stored procedure
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   true or false
//--------------------------------------------------------------------

function DatabaseTreeInfo_isEmpty()
{
  return (this.procedure == "" && this.table == "" && this.column == "")
}


//--------------------------------------------------------------------
// CLASS:
//   DatabaseTreeParamObj
//
// DESCRIPTION:
//   A simple class that is used to store the name, direction and type 
//   properties of a DBTree parameter object. 
//
// PUBLIC PROPERTIES:
//   <property> - <type and description>
//
// PUBLIC FUNCTIONS:
//   <function name> - <description>
//--------------------------------------------------------------------


//--------------------------------------------------------------------
// FUNCTION:
//   DatabaseTreeParamObj
//
// DESCRIPTION:
//   Constructor function
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   none
//--------------------------------------------------------------------

function DatabaseTreeParamObj()
{
  this.name = ""
  this.direction = ""
  this.type = ""
}


