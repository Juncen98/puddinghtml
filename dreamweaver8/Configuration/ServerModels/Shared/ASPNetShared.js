// Copyright 2002, 2003 Macromedia, Inc. All rights reserved.

//--------------------------------------------------------------------
// FUNCTION:
//   getColumnValueNode
//
// DESCRIPTION:
//   This function returns a platform specific instance of the
//   ColumnValueNode class.  This function is called by dwscripts,
//   and serves as a factory method.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   ASPNetColumnValueNode object
//--------------------------------------------------------------------

function getColumnValueNode()
{
  return new ASPNetColumnValueNode();
}

//--------------------------------------------------------------------
// CLASS:
//   ASPNetColumnValueNode
//
// DESCRIPTION:
//   This class represents the mapping of a database column to a value.
//
// PUBLIC PROPERTIES:
//   None
//
// PUBLIC FUNCTIONS:
//   See the base class in:
//     Configuration/Shared/Common/Scripts/ColumnValueNodeClass.js
//
//--------------------------------------------------------------------

ASPNetColumnValueNode.prototype.__proto__ = ColumnValueNode.prototype;
ASPNetColumnValueNode.prototype.initialize = ASPNetColumnValueNode_initialize;
ASPNetColumnValueNode.prototype.setVariableName = ASPNetColumnValueNode_setVariableName;
ASPNetColumnValueNode.prototype.setSubmitAs = ASPNetColumnValueNode_setSubmitAs;
ASPNetColumnValueNode.prototype.getSubmitAs = ASPNetColumnValueNode_getSubmitAs;
ASPNetColumnValueNode.prototype.setDefaultValue = ASPNetColumnValueNode_setDefaultValue;
ASPNetColumnValueNode.prototype.getDefaultValue = ASPNetColumnValueNode_getDefaultValue;
ASPNetColumnValueNode.prototype.setParamType = ASPNetColumnValueNode_setParamType;
ASPNetColumnValueNode.prototype.getParamType = ASPNetColumnValueNode_getParamType;

//--------------------------------------------------------------------

function ASPNetColumnValueNode()
{
  this.initialize();
}

function ASPNetColumnValueNode_initialize()
{
  this.columnName = "";
  this.columnType = "";
  this.isPrimaryKey = false;
  this.varName = "";
  this.runtimeValue = "";
  this.submitAs = "";
  this.paramType = "";
  this.defaultValue = "";
}

function ASPNetColumnValueNode_setVariableName(varName)
{
  this.varName = varName;
}

function ASPNetColumnValueNode_setSubmitAs(submitAs)
{
  this.submitAs = submitAs;
}

function ASPNetColumnValueNode_getSubmitAs()
{
  return this.submitAs;
}

function ASPNetColumnValueNode_setDefaultValue(defaultValue)
{
  this.defaultValue = defaultValue;
}

function ASPNetColumnValueNode_getDefaultValue()
{
  return this.defaultValue;
}

function ASPNetColumnValueNode_setParamType(paramType)
{
  this.paramType = paramType;
}

function ASPNetColumnValueNode_getParamType()
{
  return this.paramType;
}

//--------------------------------------------------------------------
// FUNCTION:
//   getParameterTypeArray
//
// DESCRIPTION:
//   Get list of available parameter types.
//
// ARGUMENTS:
//   bRemoveEnteredVal - boolean (optional). 'true' if should remove 'Entered Value'
//     as a possible parameter type. Defaults to 'false'.
//
// RETURNS:
//   array of strings - localized list of parameter types.
//--------------------------------------------------------------------

function getParameterTypeArray(bRemoveEnteredVal)
{
  // Make a copy of MM.LABEL_ASPNET_Param_Types. We may need to alter it and we
  //   don't want to affect the original array.

  var paramTypes = new Array();

  for (var i = 0; i < MM.LABEL_ASPNET_Param_Types.length; ++i)
  {
    paramTypes.push(MM.LABEL_ASPNET_Param_Types[i]);
  }
  
  if (bRemoveEnteredVal)
  {
    paramTypes.splice(paramTypes.length - 1, 1);
  }

  return paramTypes;
}

//--------------------------------------------------------------------
// FUNCTION:
//   getDBColumnTypeAsString
//
// DESCRIPTION:
//   Maps the enumerated number used by the database to represent a type to the
//   corresponding sql type string.
//
// ARGUMENTS:
//   typeNum - enumerated number. Number used by the database to represent
//     the type.
//   databaseType - string. "OleDb" or "SQLServer" for now.
// RETURNS:
//   string - ASP.Net type string. null if typeNum is not found.
//--------------------------------------------------------------------

function getDBColumnTypeAsString(typeNum, databaseType)
{
	var a = new Array();

	// OleDb types

	a['0'] = "Empty";
	a['2'] = "SmallInt";
	a['3'] = "Integer";
	a['4'] = "Single";
	a['5'] = "Double";
	a['6'] = "Currency";
	a['7'] = "Date";
	a['8'] = "BSTR";
	a['9'] = "IDispatch";
	a['10'] = "Error";
	a['11'] = "Boolean";
	a['12'] = "Variant";
	a['13'] = "IUnknown";
	a['14'] = "Decimal";
	a['16'] = "TinyInt";
	a['17'] = "UnsignedTinyInt";
	a['18'] = "UnsignedSmallInt";
	a['19'] = "UnsignedInt";
	a['20'] = "BigInt";
	a['21'] = "UnsignedBigInt";
	a['72'] = "GUID";
	a['128'] = "Binary";
	a['129'] = "VarChar";
	a['130'] = "WChar";
	a['131'] = "Numeric";
	a['132'] = "UserDefined";
	a['133'] = "DBDate";
	a['134'] = "DBTime";
	a['135'] = "DBTimeStamp";
	a['139'] = "VarNumeric";
	a['200'] = "VarChar";
	a['201'] = "LongVarChar";
	a['202'] = "VarWChar";
	a['203'] = "LongVarWChar";
	a['204'] = "VarBinary";
	a['205'] = "LongVarBinary";
	a['900'] = "REF CURSOR";
	a['901'] = "bit";

	// Database-specific overrides

	if (databaseType.toLowerCase() == "sqlserver")
	{
		a['3'] = "Int";
		a['4'] = "Real";
		a['5'] = "Float";
		a['6'] = "Money";
		a['7'] = "DateTime";
		a['8'] = "BSTR";
		a['11'] = "Bit";
		a['17'] = "SmallInt";
		a['18'] = "SmallInt";
		a['19'] = "Int";
		a['21'] = "BitInt";
		a['130'] = "NChar";
		a['131'] = "Decimal";
		a['133'] = "DateTime";
		a['134'] = "DateTime";
		a['135'] = "DateTime";
		a['139'] = "Decimal";
		a['201'] = "NVarChar";
		a['202'] = "NVarChar";
		a['203'] = "NVarChar";
	}

	return (a[typeNum] && (a[typeNum] != "")) ? a[typeNum] : null;
}

//--------------------------------------------------------------------

function warnIfNoPageNavDisplay(recordsetName, ignoreCase, isAll)
{
	if (!canInsertPageNavDisplay(recordsetName, ignoreCase, isAll))
	{
		dwscripts.informDontShow(dwscripts.sprintf(MM.MSG_WarnAboutPageNavForDataSet, recordsetName),
			"Extensions\\ServerBehaviors\\PageNavigation","SkipPageNavDisplayWarning");
	}
}

function canInsertPageNavDisplay(recordsetName, ignoreCase, isAll)
{
	var canInsert = false;
	var dom = dw.getDocumentDOM();
	var dataSetTags = dom.getElementsByTagName("MM:DataSet");
	var rsName = recordsetName;

	if (rsName && ignoreCase)
	{
		rsName = rsName.toLowerCase();
	}

	for (var j = 0; j < dataSetTags.length; ++j)
	{
		var id = dataSetTags[j].getAttribute("id");

		if (!id)
			continue;
			
		if (ignoreCase)
		{
			id = id.toLowerCase();
		}
	
		if ((rsName != null) && (rsName != id))
			continue;
			
		if (!dataSetTags[j].getAttribute("PageSize"))
			continue;
			
		canInsert = true;
		break;
	}

	return canInsert;
}

function getRecordsetNameWithPageNav()
{
  var retVal = "";
  var dom = dw.getDocumentDOM();
  var dataSetTags = dom.getElementsByTagName("MM:DataSet");

  for (var i = 0; i < dataSetTags.length; ++i)
  {
    if (dataSetTags[i].getAttribute("PageSize"))
    {
	  retVal = dataSetTags[i].getAttribute("id");
	  break;
	}
  }

  return retVal;
}
