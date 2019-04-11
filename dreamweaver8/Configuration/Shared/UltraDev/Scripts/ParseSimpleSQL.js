//SHARE-IN-MEMORY=true
// Copyright 2000, 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.
var DEBUG_PSSQL = false

function ParseSimpleSQL(inSQL)
{
	var theSQL = String(inSQL)
	var outObj = new Object()

	if (StripChars(" \n\r\t", theSQL).length == 0)
	{
		outObj.empty = true
		return outObj	
	}

	theSQL = theSQL.replace(/\n/g, " ")
	theSQL = theSQL.replace(/\r/g, " ")

	var strColumns = ""
	var strTables = ""
	var strWhere = ""
	var strOrderBy = ""


	if (theSQL.search(/^\s*select\s(.+)\sfrom\s(.+)\swhere\s(.+)\sorder\s+by\s(.+)$/i) != -1)
	{
		strColumns = RegExp.$1
		strTables = RegExp.$2
		strWhere = RegExp.$3
		strOrderBy = RegExp.$4
	}
	else if (theSQL.search(/^\s*select\s(.+)\sfrom\s(.+)\swhere\s(.+)$/i) != -1)
	{
		strColumns = RegExp.$1
		strTables = RegExp.$2
		strWhere = RegExp.$3
	}
	else if (theSQL.search(/^\s*select\s(.+)\sfrom\s(.+)\sorder\s+by\s(.+)$/i) != -1)
	{
		strColumns = RegExp.$1
		strTables = RegExp.$2
		strOrderBy = RegExp.$3
	}
	else if (theSQL.search(/^\s*select\s(.+)\sfrom\s(.+)$/i) != -1)
	{
		strColumns = RegExp.$1
		strTables = RegExp.$2
	}
	if (strColumns == "")
	{
		// no patterns matched
		if (DEBUG_PSSQL) alert("no select patterns matched")
		return false
	}
	

	// Now we must parse the pieces to see if they qualify as simple

	
	// Check the columns
	var isStar = false
	if (Trim(strColumns) == "*")
	{
		isStar = true
	}
	else
	{
		var colArray = strColumns.split(",")
		
		for (var i = 0; i < colArray.length; i++)
		{
			var thisCol = Trim(String(colArray[i]))
			if (thisCol == "")
			{
				if (DEBUG_PSSQL) alert("there was a column with no name...two consecutive commas")
				return false
			}

			if (StripChars("0123456789abcdefghijklmnopqrstuvwxyz_", thisCol.toLowerCase()).length > 0)
			{
				
				if (DEBUG_PSSQL) alert("the column name was invalid: " + thisCol)
				return false
			}
		
			colArray[i] = thisCol
		}
	}



	//Check the table, we only accept one

	if (strTables.search(/^\s*(\w+)\s*$/) == -1 &&
      strTables.search(/^\s*(\w+\.\w+)\s*$/) == -1)
	{
		if (DEBUG_PSSQL) alert("there was more than one table in the string: " + strTables)
		return false
	}
	var theTable = RegExp.$1

	// Now check the Where Clause if there is one

	if (strWhere != "")
	{

		var theLVal = ""
		var theRVal = ""
		var theOperator = ""
		var isString = false
				
		if (strWhere.search(/^\s*(\w+)\s*([=><])\s*(\w+)\s*$/) != -1)

		{
			theLVal = RegExp.$1
			theOperator = RegExp.$2
			theRVal = RegExp.$3
		}
		else if (strWhere.search(/^\s*(\w+)\s*([=><])\s*'(\w+)'\s*$/) != -1)
		{
			theLVal = RegExp.$1
			theOperator = RegExp.$2
			theRVal = RegExp.$3
			isString = true
		}		
		else if (strWhere.search(/^\s*(\w+)\s*((<>)|(>=)|(<=))\s*(\w+)\s*$/) != -1)
		{
			theLVal = RegExp.$1
			theOperator = RegExp.$2
			theRVal = RegExp.$6
		}		
		else if (strWhere.search(/^\s*(\w+)\s*((<>)|(>=)|(<=))\s*'(\w+)'\s*$/) != -1)
		{
			theLVal = RegExp.$1
			theOperator = RegExp.$2
			theRVal = RegExp.$6
			isString = true
		}
		else if (strWhere.search(/^\s*(\w+)\s*(like)\s*('%(\w+)%')\s*$/i) != -1)
		{
			theLVal = RegExp.$1
			theOperator = "contains"
			theRVal = RegExp.$4
			isString = true
		}
		else if (strWhere.search(/^\s*(\w+)\s*(like)\s*('%(\w+)')\s*$/i) != -1)
		{
			theLVal = RegExp.$1
			theOperator = "ends with"
			theRVal = RegExp.$4
			isString = true
		}
		else if (strWhere.search(/^\s*(\w+)\s*(like)\s*('(\w+)%')\s*$/i) != -1)
		{
			theLVal = RegExp.$1
			theOperator = "begins with"
			theRVal = RegExp.$4
			isString = true
		}
		else
		{
			// didn't match
			if (DEBUG_PSSQL) alert("this where clause didn't match a pattern: " + strWhere)
			return false
		}

	} //end checking where clause

	
	
	// Now do Order By Clause if there is one

	if (strOrderBy != "")
	{

		var theOrderColumn = ""
		var theOrder = ""

		if (strOrderBy.search(/^\s*(\w+)\s*$/i) != -1)
		{
			theOrderColumn = RegExp.$1		
			theOrder = "ASC"
		}
		else if (strOrderBy.search(/^\s*(\w+)\s+asc\s*$/i) != -1)
		{
			theOrderColumn = RegExp.$1		
			theOrder = "ASC"
		}
		else if (strOrderBy.search(/^\s*(\w+)\s+desc\s*$/i) != -1)
		{
			theOrderColumn = RegExp.$1		
			theOrder = "DESC"
		}
		else
		{
			if (DEBUG_PSSQL) alert("order by clause was bad: " + strOrderBy)
			return false
		}

	}

	// Construct the object to be returned.

	outObj.empty = false
	outObj.table = theTable
	outObj.all = isStar
	outObj.columns = colArray
	if (strWhere == "")
	{
		outObj.filterColumn = null
		outObj.filterOperator = null
		outObj.isString = null
	}
	else
	{
		outObj.filterColumn = theLVal
		outObj.filterOperator = theOperator
		outObj.filterVal = theRVal
		outObj.isString = isString
	}
	if (strOrderBy == "")
	{
		outObj.sortColumn = null
		outObj.sortType = null
	}
	else
	{
		outObj.sortColumn = theOrderColumn
		outObj.sortType = theOrder
	}

	return outObj
}
/*
function StripChars(theStr, theFilter)
{
  var retVal = "";

  if (theStr && theFilter)
  {
    retVal = theStr.replace(RegExp("[" + dwscripts.escRegExpChars(theFilter) + "]", "g"), "");
  }

  return retVal;
}

function Trim(theStr)
{
  var retVal = "";

  if (typeof theStr == "string")
  {
    var firstNonWhite = theStr.search(/\S/);

    if (firstNonWhite != -1)
    {
      //Count the spaces at the end
      for (var i=theStr.length-1; i >= 0; i--)
      {
        if (theStr.charAt(i).search(/\S/) != -1)
        {
          theStr = theStr.substring(firstNonWhite, i+1);
          break;
        }
      }

      retVal = theStr;
    }
  }

  return retVal;
}
*/