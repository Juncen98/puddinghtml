// Copyright 2005 Macromedia, Inc. All rights reserved.
var DEBUG = false;

function formatDynamicDataRef(str, format)
{
	var ret = str;
	// The arguments are:
	//     strNamedFormat = string code for format of date/time
	if (format) 
	{
		ret = format.formatFunc + "(" + str + ",'" + format.strNamedFormat + "')";
	}
	else
	{
		ret = format.formatFunc + "(" + str +  ")";
	}
	return ret;
}

function applyFormat()
{
}

function deleteFormat()
{
}
