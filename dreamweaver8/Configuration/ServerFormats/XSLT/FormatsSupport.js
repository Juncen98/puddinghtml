// Copyright 2005 Macromedia, Inc. All rights reserved.

function selectOption(selObj, val)
{
	var selInd = -1;
	for (var i=0; i<selObj.options.length; i++)
	{
		if (selObj.options[i].value == val)
		{
			selInd = i;
			break;
		}
	}

	if (selInd != -1)
	{
		selObj.selectedIndex = selInd;
	}
}

