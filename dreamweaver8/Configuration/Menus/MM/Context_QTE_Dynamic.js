// Copyright 2000, 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

   // This is an array of tags we don't want to allow people to remove.
   var noStripTags = new Array("body", "head", "html", "tr", "td", "table", "mm:beginlock");

   // getSelectionParentTag() returns the tag or empty tag that's the
   // closest ancestor of the current selection.
   function getSelectionParentTag()
   {
     var dom = dw.getDocumentDOM();
     var selArray = dom.getSelection(true);
     var obj = dom.offsetsToNode(selArray[0], selArray[1]);
     while (obj && !obj.tagName)
         obj = obj.parentNode;

       // Special case: If more than one table cell is selected,
     // return the parent table.
       if (selArray.length > 2 && obj.tagName.toLowerCase() == "td")
     {
         var tableObj = obj.parentNode;
         while (tableObj && 
                  (tableObj.nodeType != Node.ELEMENT_NODE ||
                   tableObj.tagName.toLowerCase() != "table"))
           {
               tableObj = tableObj.parentNode;
           }
           if (tableObj)
               obj = tableObj;
       }

     return obj;
   }

   function receiveArguments()
   {
     var dom = dw.getDocumentDOM();
     var obj = getSelectionParentTag();
  
      var itemID = arguments[0];

     if (itemID == "DW:QTE:Insert")
         dw.showQuickTagEditor("selection", "insert");
     else if (itemID == "DW:QTE:Edit")
     {
          // If we showed the user a specific tag to edit, and
       // it's not a locked region, then select it first, to
       // make sure that's the tag the QTE will let us edit.
       if (obj && obj.tagName.toLowerCase() != "mm:beginlock")
       {
           dw.getDocumentDOM().setSelectedNode(obj);
       }
          dw.showQuickTagEditor("selection", "edit");
     }
     else if (itemID == "DW:QTE:Wrap")
       dw.showQuickTagEditor("selection", "wrap");
     else if (itemID == "DW:QTE:Remove")
     {
          // Get the parent tag of the current selection and remove it.
       if (obj)
       {
           var selection = dom.nodeToOffsets(obj);
         dom.setSelection(selection[0], selection[1]);
               dom.stripTag();
       }
     }
     else if (itemID == "DW:QTE")
         dw.showQuickTagEditor();
   }

   function canAcceptCommand()
   {
      var dom = dw.getDocumentDOM();
      var obj = getSelectionParentTag();
      
      // disable removing MMTEMPLATE:EDITABLE, MMTEMPLATE:IF, and MMTEMPLATE:REPEAT if they're wrapped
      // around a TR or a TD.
      if (arguments[0] == "DW:QTE:Remove" && obj){
        if (obj.tagName == "MMTEMPLATE:EDITABLE" || obj.tagName == "MMTEMPLATE:IF" || obj.tagName == "MMTEMPLATE:REPEAT"){
          if (obj.hasChildNodes() && (obj.childNodes[0].tagName == "TR" || obj.childNodes[0].tagName == "TD")){
            return false;
          }
        }
      }

     // disable editing and removing mm:editable if we're a page
     // made from a template
       if (dom.getAttachedTemplate() && (arguments[0] == "DW:QTE:Edit" || arguments[0] == "DW:QTE:Remove"))
       {
          if (obj)
          { 
            var tagName = obj.tagName.toLowerCase();
           
            if (tagName == "mm:editable" || tagName == "mmtinstance:editable")
              return false;
            else
              return true; 
          } 
          else
            return true;
      }
     // Otherwise, if we put it in the menu, it must be reasonable in the
     // current context.
     else
       return true;
   }

   function getDynamicContent()
   {
     var result = new Array;

     // Depending on the current selection, add entries for
     // specific Quick Tag Editor modes.
        var resultIndex = 0;
     var selection = dw.getSelection();
     if (selection[0] == selection[1])
     {
         // We have an IP.  Add "Insert HTML..."
       result[resultIndex++] = MENU_strQTE + ";id='DW:QTE:Insert'";
     }
     else
     {
          // "Wrap" is available if the current selection is balanced.
       // A selection is balanced only if both ends of the selection
       // have a common parent.  But "wrap" isn't useful when the
       // selection is an IP.
         var startNode = dw.offsetsToNode(selection[0], selection[0]);
         var endNode = dw.offsetsToNode(selection[1], selection[1]);
         if (startNode != endNode)
         {
             // If we're looking at a text node, we can go up one level
           // to the parent tag.
           if (startNode.nodeType == Node.TEXT_NODE)
               startNode = startNode.parentNode;
           if (endNode.nodeType == Node.TEXT_NODE)
               endNode = endNode.parentNode;
         }
         if (startNode == endNode)
         {
             // We can probably wrap a tag around the selection.
           result[resultIndex++] = MENU_strQTE + ";id='DW:QTE:Wrap'";
         }
     }

     // Okay, see if we're inside a tag, and if so, add "Edit".
     var obj = getSelectionParentTag();
     if (obj)
     {
         // "Edit" is available for container tags.
       // For locked regions, we just show "Edit Tag".
       var tagName = "";
       if (obj.tagName.toLowerCase() != "mm:beginlock")
       {
         tagName = " <" + obj.tagName.toLowerCase() + ">";
       }

       // "Remove" is available on a tag surrounding the selection.
         // However, we block certain "dangerous" tags from being stripped.
            var tagName = obj.tagName.toLowerCase();
          var found = false;
          var i;
          for (i = 0; i < noStripTags.length; i++)
          {
              if (noStripTags[i] == tagName)
            {
                found = true;
              break;
            }
          }
    
          if (!found)
             result[resultIndex++] = MENU_strRemove + " <" + obj.tagName.toLowerCase() + ">;id='DW:QTE:Remove'";
     }

     return result;
   }
