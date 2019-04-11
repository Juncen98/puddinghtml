// Copyright 2000, 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

function bodyCase(direction, bShift)
{
  var bHaveLayerSelected = false;
  var bHaveMultipleLayersSelected = false;
  var selarray = dw.getDocumentDOM().getSelection(true);
  var theNode = dw.getDocumentDOM().offsetsToNode(selarray[0],selarray[1]);

  if (theNode.nodeType == Node.ELEMENT_NODE)
  {
    bHaveLayerSelected =  (theNode.tagName == "SPAN" || theNode.tagName == "DIV" ||  theNode.tagName == "LAYER" || theNode.tagName == "ILAYER");
  
    if (selarray.length > 2)
    {
      theNode = dw.getDocumentDOM().offsetsToNode(selarray[2],selarray[3]);
      bHaveMultipleLayersSelected = (theNode.tagName == "SPAN" || theNode.tagName == "DIV" || theNode.tagName == "LAYER" || theNode.tagName == "ILAYER");
    }
  }

  if (direction == "right")
  {
    if (bHaveLayerSelected && dw.appName != "Contribute")
	{
      if (bHaveMultipleLayersSelected)
	  {
        dw.getDocumentDOM().align("right");
      }
	  else
	  {
        var bHandled = dw.getDocumentDOM().resizeSelectionBy(0,0,bShift ? 10:1,0);
		//if the selection state is not a layer it means we could be inside the contents.
		if (!bHandled)
		{
		   dw.getDocumentDOM().nextWord(1, bShift);
		}
      }
    }
	else
	{
      dw.getDocumentDOM().nextWord(1, bShift);
    }
  }
  if (direction == "left")
  {
    if (bHaveLayerSelected && dw.appName != "Contribute")
	{
      if (bHaveMultipleLayersSelected)
	  {
        dw.getDocumentDOM().align("left");
      }
	  else
	  {
        var bHandled = dw.getDocumentDOM().resizeSelectionBy(0,0,bShift ? -10:-1,0);
		//if the selection state is not a layer it means we could be inside the contents.
		if (!bHandled)
		{
		   dw.getDocumentDOM().previousWord(1, bShift);
		}
      }
    }
	else
	{
      dw.getDocumentDOM().previousWord(1, bShift);
    }
  }
  if (direction == "up")
  {
    if (bHaveLayerSelected && dw.appName != "Contribute")
	{
      if (bHaveMultipleLayersSelected)
	  {
        dw.getDocumentDOM().align("top");
      }
	  else
	  {
		var bHandled = dw.getDocumentDOM().resizeSelectionBy(0,0,0,bShift ? -10:-1);
		//if the selection state is not a layer it means we could be inside the contents.
		if (!bHandled)
		{
		   dw.getDocumentDOM().previousParagraph(1, bShift);
		}
      }
    }
	else
	{
      dw.getDocumentDOM().previousParagraph(1, bShift);
    }
  }
  if (direction == "down")
  {
    if (bHaveLayerSelected && dw.appName != "Contribute")
	{
      if (bHaveMultipleLayersSelected)
	  {
        dw.getDocumentDOM().align("bottom");
      }
	  else
	  {
        var bHandled = dw.getDocumentDOM().resizeSelectionBy(0,0,0,bShift ? 10:1);
		//if the selection state is not a layer it means we could be inside the contents.
		if (!bHandled)
		{
		   dw.getDocumentDOM().nextParagraph(1, bShift);
		}
      }
    }
	else
	{
      dw.getDocumentDOM().nextParagraph(1, bShift);
    }
  }
}
  
function frameCase(direction,bShift)
{
  var theSel = dw.getDocumentDOM().getSelectedNode();
  var theMotherNode = theSel.parentNode;
  var siblings = theMotherNode.childNodes;
  var children = theSel.childNodes;
  var numberOneSon = (children.length > 0) ? theSel.childNodes[0] : null;
    
  if (direction == "left")
  {
    for (var i=0; i <= siblings.length; i++)
	{
      if ((siblings[i] == theSel) && (i > 0))
	  {
        dw.getDocumentDOM().setSelectedNode(siblings[i-1]);
        break;
      }
	    else if (siblings[i] == theSel && siblings.length > 1)
	    {
        dw.getDocumentDOM().setSelectedNode(siblings[i+1]);
        break;
      }
    }
  }
  
  if (direction == "right")
  {
    for (var i=0; i <= siblings.length; i++)
	{
      if (siblings[i] == theSel && i < siblings.length - 1)
	  {
        dw.getDocumentDOM().setSelectedNode(siblings[i+1]);
        break;
      }
	  else if (siblings[i] == theSel && siblings.length > 1)
	  {
        dw.getDocumentDOM().setSelectedNode(siblings[i-1]);
        break;
      }
    }
  }
  
  if (direction == "up")
  {
    if (theMotherNode.tagName == 'FRAME' || theMotherNode.tagName == 'FRAMESET')
	{
      dw.getDocumentDOM().setSelectedNode(theMotherNode);
    }
  }
  
  if (direction == "down")
  {
    if (numberOneSon)
	{
      dw.getDocumentDOM().setSelectedNode(numberOneSon);
    }
  }
}

function receiveArguments()
{
  if (dw.getDocumentDOM() == null)
  {
    return;
  }
  
  var view = dw.getDocumentDOM().getView();
  if( view != 'design' && view != 'split')
  {
	  return;
  }
  
  if (dw.getDocumentDOM().getActiveView() != 'design')
  {
    return;
  }
 
  if (dw.getFocus(true) != 'frames' && dw.getFocus() != 'document')
  {
    return;
  }
  
  if (arguments.length != 2)
  {
    alert(MSG_WrongAcceleratorArgs);
    return;
  }
  
  var direction = arguments[0];
  var bShift = arguments[1];

  if (dw.getDocumentDOM().getFocus() == 'body')
  {
    bodyCase(direction,bShift);
  }
  else if (dw.getDocumentDOM().getFocus() == 'frameset')
  {
    frameCase(direction,bShift);
  }
}

