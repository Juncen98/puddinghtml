// Copyright 2002, 2003 Macromedia, Inc. All rights reserved.

//--------------------------------------------------------------------
// CLASS:
//   SBUpdateRecord
//
// DESCRIPTION:
//   This class is derived from the SBUpdateRecord, and
//   represents a Update Record Server Behvaior

SBUpdateRecord.prototype.__proto__ = SBInsertUpdateASPNET.prototype;

SBUpdateRecord.prototype.initSBUpdateRecord = SBUpdateRecord_initSBUpdateRecord;
SBUpdateRecord.prototype.setSQLStatement = SBUpdateRecord_setSQLStatement;
SBUpdateRecord.prototype.checkData = SBUpdateRecord_checkData;

//--------------------------------------------------------------------
// FUNCTION:
//   SBUpdateRecord
//
// DESCRIPTION:
//   Constructor function
//
// ARGUMENTS:
//   name, title, selectedNode 
//
//--------------------------------------------------------------------

function SBUpdateRecord(name, title, selectedNode)
{
  this.initSBUpdateRecord((name) ? name : "UpdateRecordset", title, selectedNode);
}

function SBUpdateRecord_initSBUpdateRecord(name, title, selectedNode)
{
  this.initSBInsertUpdateASPNET(name, title, selectedNode);
}

function SBUpdateRecord_setSQLStatement(tableName, columnList)
{
  var sqlObj = new SQLStatement("");
  sqlObj.createUpdateStatement(tableName, columnList);
  
  var sql = sqlObj.getStatement(true);
  
  sql = dwscripts.escSQLQuotes(sql);
    
  this.setParameter(this.EXT_DATA_SQL, sql);
}

//--------------------------------------------------------------------
// FUNCTION:
//   SBUpdateRecord.checkData
//
// DESCRIPTION:
//   Checks that the data supplied for the repeat region is complete
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function SBUpdateRecord_checkData()
{
  var isValid = true;
  
  // Clear out the error message.
  
  this.setErrorMessage("");

  isValid = this.checkConnectionName(false) && isValid;

  if (isValid)
  {
    // Get all form elements for the chosen form so we can check that mapped columns
    // are mapped to an existing form element.
  
    var formNode = this.getFormTag();
    var formElements = (formNode) ? formNode.elements : new Array();
    var mappedColumn = false;
    var mappedPrimary = false;

	formElements = formElements.concat(FormFieldsMenuASPNet.getWebFormControls(formNode));

	if (formElements != null)
	{
      var columns = this.getColumnList();
  
      for (var i = 0; columns && i < columns.length; i++)
      {
        // Check that user has mapped some columns to values. Also, make sure the columns are
        // mapped to existing form elements.
    
        var columnValue = columns[i].getVariableName();
	
  	    if (columnValue)
        {      
	  	  if (dwscripts.findInArray(formElements, columnValue, findFormElement) == (-1))
          {
            isValid = false;
            this.appendErrorMessage(dwscripts.sprintf(MM.MSG_MapColumnToExistingElement, 
													     columns[i].getColumnName()));
          }
          else if (columns[i].getIsPrimaryKey())
		  {
		    mappedPrimary = true;
		  }
		  else
		  {
            mappedColumn = true;
		  }
        }
      }
    }

    if (!mappedColumn)
    {
      this.appendErrorMessage(MM.MSG_NoMappedColumns);
      isValid = false;
    }

    if (!mappedPrimary)
    {
      this.appendErrorMessage(MM.MSG_NoMappedKey);
      isValid = false;
    }
  }

  return isValid;
}
