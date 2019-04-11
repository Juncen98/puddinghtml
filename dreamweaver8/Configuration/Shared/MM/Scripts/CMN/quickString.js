//SHARE-IN-MEMORY=true
// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.
////////////////////////////////////////////////////////////////////////////
//
// QuickString
// 
// Aggregates smaller strings without doing a memory allocation each time.
// 
/////////////////////////////////////////////////////////////////////////////


function QuickString(inStr)
{
	this.characters = new Array();
	if (inStr != null)
		this.add(inStr);
}

// public methods

QuickString.prototype.add			= QS_add;
QuickString.prototype.toString		= QS_toString;
QuickString.prototype.lastChar		= QS_lastChar;
QuickString.prototype.isEmpty		= QS_isEmpty;

// public methods

function QS_add(inStr)
{
	if (inStr != null && inStr.length > 0)
		this.characters.push(inStr);
}

function QS_toString()
{
	return this.characters.join('');
}

function QS_lastChar()
{
    if (this.characters.length == 0)
		return "";

	var lastStr = this.characters[this.characters.length-1];
	if (lastStr.length == 0)
		return "";

	return lastStr[lastStr.length-1];
}

function QS_isEmpty()
{
	return this.characters.length == 0;
}
