//SHARE-IN-MEMORY=true
// Copyright 2004, 2005 Macromedia, Inc. All rights reserved.


function makeAsIsTranslation(displayString)
{
	return new transData("", "as is", "", "", "", displayString, "", "", false, false, false);
}

function showAsInvisible(code, transMgr)
{
	var translation = "<mm:invisible>" +
					code +
					"</mm:invisible>";
	var trans = makeAsIsTranslation(translation);
	trans.type = "raw";
	trans.reparse = true;
	trans.useEditMode = false;
	trans.lockAttributes = " beginLinkedLock";
	return trans;
}
