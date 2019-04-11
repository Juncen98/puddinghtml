function receiveArguments()
{
  var designPageObj = dw.getDocumentDOM();

  if (designPageObj == null)
  {
    return;
  }
   
  var filePath = designPageObj.URL;
  filePath = dwscripts.localURLToFilePath(filePath);
  var cbFilePath = MMCB.getCodeBehindFile(filePath);
  if (cbFilePath && cbFilePath.length)
  {
 	dw.openDocument(cbFilePath);
  }
  else
  {
   var designFilePath = MMCB.getDesignFile(filePath);
   if (designFilePath && designFilePath.length)
   {
    	dw.openDocument(designFilePath);
   }
  }
 }

function canAcceptCommand()
{
  var retVal = false;
  var designPageObj = dw.getDocumentDOM();

  if (designPageObj == null)
  {
    return false;
  }
  
  var filePath = designPageObj.URL;
  filePath = dwscripts.localURLToFilePath(filePath);
  retVal = (MMCB.hasCodeBehindFile(filePath) || MMCB.hasDesignFile(filePath));
  return retVal;
}

function getDynamicContent(itemID)
{
  var openDocName = new Array();
  var designPageObj = dw.getDocumentDOM();
  if (designPageObj == null)
  {
    return openDocName;
  }

  var filePath = designPageObj.URL;
  filePath = dwscripts.localURLToFilePath(filePath);
  var hasCBFilePath = MMCB.hasCodeBehindFile(filePath);
  var hasdesignFilePath = false;
  if (!hasCBFilePath)
  {
	hasDesignFilePath = MMCB.hasDesignFile(filePath);
  }
  
   if (hasCBFilePath)
   {
		openDocName[0] = MM.LABEL_Open_Code_Behind;
		openDocName[0]  += "\tF7";
		openDocName[0]  += ";id='" + MM.LABEL_Open_Code_Behind + "'";
   }
   else if (hasDesignFilePath)
   {
		openDocName[0] = MM.LABEL_Open_Design_File;
		openDocName[0]  += "\tF7";
		openDocName[0]  += ";id='" + MM.LABEL_Open_Design_File + "'";
   }
   else
   {
		openDocName[0] = MM.LABEL_Open_Code_Behind;
		openDocName[0]  += "\tF7";
		openDocName[0]  += ";id='" + MM.LABEL_Open_Code_Behind + "'";
   }
      	
   return openDocName;
}
