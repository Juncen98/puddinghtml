// Copyright 2004, 2005 Macromedia, Inc. All rights reserved.
function isDOMRequired() { 
  // return true.  This will insert the object into the design view.
  return true;
}

function isAsset() {
	return true;
}

function objectTag()
{
  retVal = callCommand("FlashPaper");
  return retVal;
}

