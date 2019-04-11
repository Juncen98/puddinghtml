// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.
//--------------------------------------------------------------------
// CLASS:
//   SBInsertRecord
//
// DESCRIPTION:
//   This class is derived from the SBInsertUpdateASPNET, and
//   represents a Insert Record Server Behvaior

SBInsertRecord.prototype.__proto__ = SBInsertUpdateASPNET.prototype;

SBInsertRecord.prototype.initSBInsertRecord = SBInsertRecord_initSBInsertRecord;
SBInsertRecord.prototype.setSQLStatement = SBInsertRecord_setSQLStatement;
SBInsertRecord.prototype.checkData = SBInsertRecord_checkData;

//--------------------------------------------------------------------
// FUNCTION:
//   SBInsertRecord
//
// DESCRIPTION:
//   Constructor function
//
// ARGUMENTS:
//   name, title, selectedNode 
//
//--------------------------------------------------------------------

function SBInsertRecord(name, title, selectedNode)
{
  this.initSBInsertRecord((name) ? name : "InsertRecordset", title, selectedNode);
}

function SBInsertRecord_initSBInsertRecord(name, title, selectedNode)
{
  this.initSBInsertUpdateASPNET(name, title, selectedNode);
}

function SBInsertRecord_setSQLStatement(tableName, columnList)
{
  var sqlObj = new SQLStatement("");
  sqlObj.createInsertStatement(tableName, columnList);
  
  var sql = sqlObj.getStatement(true);
  
  sql = dwscripts.escSQLQuotes(sql);
    
  this.setParameter(this.EXT_DATA_SQL, sql);
}

//--------------------------------------------------------------------
// FUNCTION:
//   SBInsertUpdateASPNET.checkData
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

function SBInsertRecord_checkData()
{
  var isValid = true;
  
  // Clear out the error message.
  
  this.setErrorMessage("");

  isValid = this.checkConnectionName(false) && isValid;

  if (isValid)
  {
    // Get all form elements for the chosen form so we can check that mapped columns
    //   are mapped to an existing form element.
  
    var formNode = this.getFormTag();
    var formElements = (formNode) ? formNode.elements : new Array();
    var found = false;

	formElements = formElements.concat(FormFieldsMenuASPNet.getWebFormControls(formNode));

	if (formElements != null)
	{
      var columns = this.getColumnList();
  
      for (var i = 0; columns && i < columns.length; i++)
      {
        // Check that user has bound some columns to values. Also, make sure the columns are
        // bound to existing form elements.
    
        var columnValue = columns[i].getVariableName();
	
  	    if (columnValue)
        {      
	  	  if (dwscripts.findInArray(formElements, columnValue, findFormElement) == (-1))
          {
            isValid = false;
            this.appendErrorMessage(dwscripts.sprintf(MM.MSG_MapColumnToExistingElement, 
													     columns[i].getColumnName()));
          }

          found = true;
        }
      }
    }

    if (!found)
    {
      this.appendErrorMessage(MM.MSG_NoMappedColumns);
      isValid = false;
    }
  }

  return isValid;
}

