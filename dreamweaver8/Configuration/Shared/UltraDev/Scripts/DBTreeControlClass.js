//SHARE-IN-MEMORY=true
// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

/* ----------------------------------------------------------------------*/
//DBTree Control Class

// Include: common.js

/*

	The DBTreeControl Constructor takes a pointer to a DBTree as the only
	argument.

	Calling .getData() on the DBTreeControl returns a DBTreeInfo object.
	This object has the following props:

	1) table
	2) column
	3) procedure
	4) paramArray	- an array of procParam objects  
	5) origStr		- the original selectedItem string from the table

	It also has the following methods. Use these methods to determine which
	properties will have valid values:

	1) IsTable 
	2) IsColumn
	3) IsProcedure

*/



/********** OBJECT DEFS AND FUNCTION DECS BEGIN **************/


function DBTreeControl(theName)
{
	this.obj = findObject(theName)
	this.getData = DBTreeControlGetData
}

DBTreeControl.prototype.getData = DBTreeControlGetData
DBTreeControl.prototype.setConnection = DBTreeControlSetConnection


function DBTreeInfo()
{
	this.table = ""
	this.column = ""
	this.procedure = ""
	this.paramArray = new Array()
	this.origStr = ""
}


DBTreeInfo.prototype.IsTable = DBTreeInfoIsTable
DBTreeInfo.prototype.IsColumn = DBTreeInfoIsColumn
DBTreeInfo.prototype.IsProcedure = DBTreeInfoIsProcedure
DBTreeInfo.prototype.IsEmpty = DBTreeInfoIsEmpty


function DBTreeParamObj()
{
	this.name = ""
	this.direction = ""
	this.type = ""
}


/********** OBJECT DEFS AND FUNCTION DECS END **************/




/********** FUNCTION DEFS BEGIN ****************************/


function DBTreeControlGetData()
{
	var tableColumnLabel = ":MM_TABLE_COLUMN:"
	var spLabel = ":MM_SP_PARAMS:"

	var treeInfo = new DBTreeInfo()

	var str = String(this.obj.selectedItem)

	treeInfo.origStr = str

	if (str == "")
	{
		return treeInfo
	}

	var index = str.indexOf(tableColumnLabel)

	if (index != -1)
	{
		treeInfo.table = str.substring(0, index)
		treeInfo.column = str.substring(index + tableColumnLabel.length)

		return treeInfo
	}
	
	index = str.indexOf(spLabel)

	if (index != -1)
	{
		treeInfo.procedure = str.substring(0, index)

		var paramList = str.substring(index + spLabel.length)
		
		DBTreeControlParseSPParams(paramList, treeInfo)

		return treeInfo
	}

	//If we get here, it was just a table name
	treeInfo.table = str

	return treeInfo
}


function DBTreeInfoIsTable()
{
	return (this.table != "" && this.column == "")
}


function DBTreeInfoIsColumn()
{
	return (this.table != "" && this.column != "")
}


function DBTreeInfoIsProcedure()
{
	return (this.procedure != "")
}


function DBTreeInfoIsEmpty()
{
	return (this.procedure == "" && this.table == "" && this.column == "")
}


function DBTreeControlParseSPParams(paramList, treeInfo)
{	
	var paramArray = DBTreeControlParamsToArray(paramList)

	for (var i = 0; i < paramArray.length; i++)
	{
		var thisParam = new DBTreeParamObj()

		thisParam.name = DBTreeControlGetParamAttr("name", paramArray[i])
		thisParam.direction = DBTreeControlGetParamAttr("direction", paramArray[i])
		thisParam.type = DBTreeControlGetParamAttr("datatype", paramArray[i])

		treeInfo.paramArray.push(thisParam) 
	}
}


function DBTreeControlGetParamAttr(attr, paramDef)
{
	var index = paramDef.indexOf(attr + ":")
	var theEnd = paramDef.indexOf(";", index)
	return paramDef.substring(index + attr.length + 1, theEnd)
}


function DBTreeControlParamsToArray(strIn)
{
	var str = String(strIn)
	var outArray = new Array()

	while (str.length > 0)
	{
		var commaPos = str.indexOf(",") 
		if (commaPos != -1)
		{
			// get this set of params and then
			// clip them off the front of str

			var paramSet = str.substring(0, commaPos)
			outArray.push(paramSet)
			str = str.substring(commaPos + 1)
		}
		else 
		{
			// it is the last set of params
			outArray.push(str)		
			str = ""
		}
	}

	return outArray
}


function DBTreeControlSetConnection(newConn)
{
	this.obj.connection = newConn
}
