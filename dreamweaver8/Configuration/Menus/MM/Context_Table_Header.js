// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

   function receiveArguments()
   {
	   var itemID = arguments[0];
	   var dom = dw.getDocumentDOM();
	   var column = dom.getClickedHeaderColumn();
	   if (itemID == "DW:TableHeader:MakeFixedWidth")
	   {
	       dom.setColumnAutostretch(column, false);
	   }
	   else if (itemID == "DW:TableHeader:MakeAutostretch")
	   {
		   dom.setColumnAutostretch(column, true);
	   }
	   else if (itemID == "DW:TableHeader:AddSpacer")
	   {
		   dom.addSpacerToColumn(column);
	   }
	   else if (itemID == "DW:TableHeader:RemoveSpacer")
	   {
		   dom.removeSpacerFromColumn(column);
	   }
   }

   function canAcceptCommand()
   {
	   // Gray out "Add Spacer" if the current column is autostretch.
	   var itemID = arguments[0];
	   var dom = dw.getDocumentDOM();
	   if (itemID == "DW:TableHeader:AddSpacer" && dom.isColumnAutostretch(dom.getClickedHeaderColumn()))
	   {
		   return false;
	   }
	   else
	   {
		   return true;
	   }
   }

   function getDynamicContent()
   {
	   var result = new Array;
   	   var resultIndex = 0;

	   // Add the "Make Column Autostretch" or "Make Column Fixed Width"
	   // entry, depending on the current column.
	   var dom = dw.getDocumentDOM();
	   var column = dom.getClickedHeaderColumn();
       var bAutostretch = dom.isColumnAutostretch(column);
	   if (bAutostretch)
	   {
	       result[resultIndex++] = MENU_strMakeFixedWidth + ";id='DW:TableHeader:MakeFixedWidth'";
	   }
	   else
	   {
	       result[resultIndex++] = MENU_strMakeAutostretch + ";id='DW:TableHeader:MakeAutostretch'";
	   }

	   // Add the "Add Spacer" or "Remove Spacer" entry, depending
	   // on the current column.
	   if (dom.doesColumnHaveSpacer(column))
	   {
		   result[resultIndex++] = MENU_strRemoveSpacer + ";id='DW:TableHeader:RemoveSpacer'";
	   }
	   else
	   {
		   result[resultIndex++] = MENU_strAddSpacer + ";id='DW:TableHeader:AddSpacer'";
	   }

	   return result;
   }
