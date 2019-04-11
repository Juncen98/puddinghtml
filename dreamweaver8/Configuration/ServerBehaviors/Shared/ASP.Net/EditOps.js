// Copyright 2002, 2003 Macromedia, Inc. All rights reserved.

//--------------------------------------------------------------------
// FUNCTION:
//   setDefaultMapping
//
// DESCRIPTION:
//   This function maps columns to values and submit as types.  This
//   function should be called whenever the list of columns changes,
//   or the list of values changes.
//
// ARGUMENTS:
//   columnValueNode - ColumnValueNode.
//   valueList - array of form element name references. The set of form element
//     references whose associated form elements are available to provide the 
//     value for the column. Parallel to nodeList.
//   nodeList - array of form element nodes. The set of form elements 
//     available to provide the value for the column. Parallel to valueList.
//
// RETURNS:
//   columnValueNode
//--------------------------------------------------------------------

function setDefaultMapping(columnValueNode, valueList, nodeList, databaseType)
{
  setDefaultValue(columnValueNode, valueList, nodeList);
  setDefaultSubmitAs(columnValueNode, databaseType);
}

//--------------------------------------------------------------------
// FUNCTION:
//   setDefaultValue
//
// DESCRIPTION:
//   This function sets a default value based on the column name, and
//   the list of values.
//
// ARGUMENTS:
//   columnValueNode - ColumnValueNode.
//   valueList - array of form element name references. The set of form element
//     references whose associated form elements are available to provide the 
//     value for the column. Parallel to nodeList.
//   nodeList - array of form element nodes. The set of form elements 
//     available to provide the value for the column. Parallel to valueList.
//
// RETURNS:
//   columnValueNode
//--------------------------------------------------------------------

function setDefaultValue(columnValueNode, valueList, nodeList)
{
  var foundDefaultValue = false;
  var columnName = columnValueNode.getColumnName();
  
  for (var i = 0; !foundDefaultValue && i < nodeList.length; ++i)
  {
    var name = (nodeList[i] ? nodeList[i].getAttribute('NAME') : "");
    
	if (columnName.toUpperCase() == name.toUpperCase())
    {
      columnValueNode.setVariableName(valueList[i]);
      foundDefaultValue = true;
    }
  }
}

//--------------------------------------------------------------------
// FUNCTION:
//   setDefaultSubmitAs
//
// DESCRIPTION:
//   This function sets a default submit as type, based on the column type
//
// ARGUMENTS:
//   columnValueNode - ColumnValueNode.
//
// RETURNS:
//   Nothing.
//--------------------------------------------------------------------

function setDefaultSubmitAs(columnValueNode, databaseType)
{
  var columnType = columnValueNode.getColumnType();
  
  if (columnType)
  {
    columnValueNode.setSubmitAs(dwscripts.getDBColumnTypeAsString(columnType, databaseType));
  }
}
