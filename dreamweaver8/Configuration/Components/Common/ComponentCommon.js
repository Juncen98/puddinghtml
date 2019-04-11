// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

//--------------------------------------------------------------------
// CLASS:
//   ComponentRec
//
// DESCRIPTION:
//  This class encapsulates a component record in Server Components 
//  Panel
//
// PUBLIC FUNCTIONS:
//  getName        -   returns the name of the component object using the this object.
//
//  getImageFile   -   returns the image file name to display for 
//
//  hasChildren    -   returns whether it has children or not.
//
//  getToolTipText -   get the tool tip text for this node.
//
//  IsDraggable    -   determines whether the object can be dragged or dropped.
//
//--------------------------------------------------------------------


var PROPERTIES_FILENAME     = "Shared/MM/Images/DSL_D.gif";
var METHODS_FILENAME		= "Shared/MM/Images/DSL_D.gif";
var PLUSBUTTONUP			= "Shared/MM/Images/btnAdd.gif";
var PLUSBUTTONDOWN			= "Shared/MM/Images/btnAdd_sel.gif";
var MINUSBUTTONUP			= "Shared/MM/Images/btnDel.gif";
var MINUSBUTTONDOWN			= "Shared/MM/Images/btnDel_sel.gif";
var MINUSBUTTONDISABLED		= "Shared/MM/Images/btnDel_dis.gif";
var PLUSDROPBUTTONUP		= "Shared/MM/Images/btnAddDrop.gif";
var PLUSDROPBUTTONDOWN		= "Shared/MM/Images/btnAddDrop_sel.gif";


//-------------------------------------------------------------------
// FUNCTION:
//   ComponentRec
//
// DESCRIPTION:
//	 constructs component rec objects
//
// ARGUMENTS:
//	 name			: of the node to appear in the component tree.
//	 imageFile		: the image for the node.
//	 allowDelete	: allowDeleting the node.
//	 hasChildren	: the node has further children
//	 tooliptext		: the tooltip text for this node.
//	 contextmenu	: the context menu for this node.
//
// RETURNS:
//   componentRec
//--------------------------------------------------------------------
function ComponentRec(name,imageFile,bHasChildren,bIsDraggable,toolTipText,bAllowDelete,bIsDesignViewDraggable)
{
	this.name = name;
	this.image = imageFile;
	this.hasChildren = bHasChildren;
	this.toolTipText = toolTipText;
	this.isCodeViewDraggable = bIsDraggable;
	if (arguments.length > 5)
	{
		this.allowDelete = bAllowDelete;
	}
	if (arguments.length > 6)
	{
		this.isDesignViewDraggable = bIsDesignViewDraggable;
	}
}

// public methods
ComponentRec.prototype.getName			= componentRec_getName;
ComponentRec.prototype.getImageFile		= componentRec_getImageFile;
ComponentRec.prototype.hasChildren		= componentRec_hasChildren;
ComponentRec.prototype.getToolTipText	= componentRec_getToolTipText;
ComponentRec.prototype.IsDraggable		= componentRec_IsDraggable;

//-------------------------------------------------------------------
// FUNCTION:
//   componentRec_getName
//
// DESCRIPTION:
//	 returns the name of the component object using the this object.
//
// ARGUMENTS:none
//
// RETURNS:
//   a string.
//--------------------------------------------------------------------
function componentRec_getName()
{
	return this.name;
}

//-------------------------------------------------------------------
// FUNCTION:
//   componentRec_getImageFile
//
// DESCRIPTION:
//	 returns the image file name to display for 
//
// ARGUMENTS:none
//
// RETURNS:
//   a string.
//--------------------------------------------------------------------
function componentRec_getImageFile()
{
	return this.imageFile;
}


//-------------------------------------------------------------------
// FUNCTION:
//   componentRec_hasChildren
//
// DESCRIPTION:
//	 returns whether it has children or not.
//
// ARGUMENTS:none
//
// RETURNS:
//   a string.
//--------------------------------------------------------------------
function componentRec_hasChildren()
{
	return this.hasChildren;
}

//-------------------------------------------------------------------
// FUNCTION:
//   componentRec_getToolTipText
//
// DESCRIPTION:
//	 get the tool tip text for this node.
//
// ARGUMENTS:none
//
// RETURNS:
//   a string.
//--------------------------------------------------------------------
function componentRec_getToolTipText()
{
	return this.toolTipText;
}


//-------------------------------------------------------------------
// FUNCTION:
//   componentRec_IsDraggable
//
// DESCRIPTION:
//	 determines whether the object can be dragged or dropped.
//
// ARGUMENTS:none
//
// RETURNS:
//   a string.
//--------------------------------------------------------------------
function componentRec_IsDraggable()
{
	return this.isCodeViewDraggable;
}

//-------------------------------------------------------------------
// FUNCTION:
//   ToolbarRec
//
// DESCRIPTION:
//	 constructs toolbar rec objects
//
// ARGUMENTS:
//	 image			: the image for the node.
//	 pressedImage	: the pressed image for the node.
//	 disabledImage	: the node has further children
//	 tooliptext		: the tooltip text for this node.
//	 toolStyle		: the stlye of the toolbar(left/right).
//	 onClick		: the onClick event hanlder.
//
// RETURNS:
//   ToolBarRec
//--------------------------------------------------------------------
function ToolbarControlRec(image,pressedImage,disabledImage,tooltiptext,toolStyle,onClick)
{
	this.image= image;
	this.pressedImage = pressedImage;
	this.disabledImage = disabledImage;
	this.toolTipText = tooltiptext;
	this.toolstyle =toolStyle;
	this.command = onClick;
}


//*-------------------------------------------------------------------
// FUNCTION:
//   clickedDatabaseInsert()
//
// DESCRIPTION:
//		drops code into code view.
//
// ARGUMENTS:
//	
// RETURNS:
//--------------------------------------------------------------------
function clickedInsert()
{
  var insertText="";
	var dom = dw.getDocumentDOM();
	if (dom)
	{
		var aNode = dw.serverComponentsPalette.getSelectedNode();
		if (aNode && aNode.isCodeViewDraggable)
		{
			insertText = getCodeViewDropCode(aNode);
			var selection = dom.source.getSelection();
			dom.source.replaceRange(selection[0],selection[1],insertText);
		}
	}
}


//*-------------------------------------------------------------------
// FUNCTION:
//   clickedInsert()
//
// DESCRIPTION:
//		drops code into code view.
//
// ARGUMENTS:
//	
// RETURNS:
//--------------------------------------------------------------------
function clickedInsert(aNode)
{
  var insertText="";
	var dom = dw.getDocumentDOM();
	if (dom)
	{
		if (aNode && aNode.isCodeViewDraggable && (dw.getFocus() == 'textView'))
		{
			insertText = getCodeViewDropCode(aNode);
			var selection = dom.source.getSelection();
			dom.source.replaceRange(selection[0],selection[1],insertText);
		}
	}
}


//*-------------------------------------------------------------------
// FUNCTION:
//   enabledInsert()
//
// DESCRIPTION:
//		checks to see to enable the insert menu option.
//
// ARGUMENTS:
//	
// RETURNS:
//--------------------------------------------------------------------
function insertEnabled(aNode)
{
  var enable=false;
	var dom = dw.getDocumentDOM();
	if (dom)
	{
		if (aNode && aNode.isCodeViewDraggable && (dw.getFocus() == 'textView'))
		{
				enable = true;
		}
	}
	return enable;
}
