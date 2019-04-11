// Copyright 2002, 2003 Macromedia, Inc. All rights reserved.

var FOR_TEST = 1
var FINAL = 2

function getDefaultCursorType()
{
	return 0;
}

function getDefaultLockType()
{
	return 3;
}

function getDefaultCursorLocation()
{
	return 3;
}


function ReplaceParamsWithVals(st, pa)
{
	var statement = st
	for (var i = 0; i < pa.length; i++)
	{
		var theParamVal = String(pa[i][1]).replace(/'/g, "''")
		var myRe = new RegExp("\\b" + pa[i][0] + "\\b","g")
		statement = statement.replace(myRe, theParamVal)
	}
	return statement
}



