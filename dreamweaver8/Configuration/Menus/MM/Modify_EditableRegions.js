// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

   var idPrefix = "DWMenu_Modify_EditableRegion_";
   var noneID = "DWMenu_Modify_EditableRegion_none";

   function indexFromID(itemID)
   {
      // Get the part of the ID which represents the index.
     var prefixLen = idPrefix.length;
	   var number = itemID.substring(prefixLen, itemID.length);

     return number;
   }

   function receiveArguments()
   {
     var index = indexFromID(arguments[0]);
     if (dw.getDocumentDOM() != null){
       var regionList = dw.getDocumentDOM().getEditableRegionList();
       var node = regionList[index];

       dw.getDocumentDOM().setSelectedNode(node, true, true, false);
     }
   }

   function canAcceptCommand()
   {
      var retVal = false;
      if (dw.getDocumentDOM() != null && !site.windowIsFrontmost() && arguments[0] != noneID){
        retVal = true;
      }
      return retVal;
   }

   function isCommandChecked()
   {
      // See if the index matches the selected editable region.
	  return (dw.getDocumentDOM() != null && indexFromID(arguments[0]) == dw.getDocumentDOM().getSelectedEditableRegion())
   }

// getDynamicContent()
// 
// Returns an array of strings to be placed in the menu, 
// with a unique identifier for each item separated from the 
// menu string by a semicolon, or null if the menu has no items.
//
function getDynamicContent(itemID){
  var regionList = null;
  var result = null; 
  var dom = dw.getDocumentDOM();
	
  if (dom){
    var bodyNode = dom.body; 
	  var bodyOffsets = null; 
	
	  if (bodyNode){
  	  bodyOffsets = dom.nodeToOffsets(bodyNode); 
	 	  regionList = dom.getEditableRegionList();
		  result = new Array(); 

		  if (regionList && regionList.length > 0){
			  // Start with a pipe, so that the 'seenRegions' string will 
		  	// always either be empty, or look like |regionName|regionName2|.
			  // This way, when doing the match later on, we can include the 
			  // pipes, and get rid of spurious matches on substrings
			  // of earlier regions.
			  var seenRegions = "|"; 

  			var i;
	  		for (i=0; i<regionList.length; i++){
			    var regionOffsets = dom.nodeToOffsets(regionList[i]); 
				
				  var isInHead = (bodyOffsets != null && regionOffsets[1] <= bodyOffsets[0]); 
				
				  if (!isInHead){
				  	if (seenRegions.indexOf("|" + regionList[i].name + "|") == -1){
						  seenRegions += regionList[i].name; 
						  seenRegions += "|";
						  result.push(unescape(regionList[i].name) + ";id='" + escQuotes(idPrefix + i) + "'");
					  }
				  }
			  }
		  }

		  if (result.length == 0){
			  result.push(MENU_NoEditableRegions + ";id='" + noneID +"'");
		  }
    }
  }
	return result;
} 
