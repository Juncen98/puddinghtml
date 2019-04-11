// Copyright 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

var outlineId = 2000;

// ----
// looks up the node parents for cfformgroup to decide if this a block or inline child. Also 
// returns some general default styles for all elements
// returns a string of css display properties.
// ----
function getCfFormElementStyle(node)
{
	var flashFormProperties = "";
	var defaultProperties = "padding:5px;";
	var curParent = node.parentNode;
	while (curParent)
	{
		if (curParent.tagName )
		{
			var tagNameLower = curParent.tagName.toLowerCase();
			if( tagNameLower == "cfformgroup")
			{
				if( flashFormProperties != "" )
				{
					if (!curParent.type){
						return defaultProperties; //type is a required attribute, so we shouldn't really get here
					}
					var typeLower = curParent.type.toLowerCase();
					
					//these are all the inline types.
					if( typeLower == "horizontal" ||
						typeLower == "hbox" ||
						typeLower == "hdividedbox" ||
						typeLower == "tile" )
					{
						flashFormProperties = (defaultProperties + " display:inline;");
					}
					else
					{
						//If it's not inline, then it's block
					 	flashFormProperties = (defaultProperties + " display:block;") ;
					}
				}
			}
			else if( tagNameLower == "cfform" )
			{
				if( curParent.format && curParent.format.toLowerCase() == "flash" ){
					if( flashFormProperties == "" ) {
						return (defaultProperties + " display:block;"); //default for flash forms is block 
					}
					else {
						return flashFormProperties
					}
				}	
				else { 
					return ""; //this isn't a flash form so use standard html properties
				}
			}
		}
		//go up one more
		curParent = curParent.parentNode;
	}
	return "";
}

// ----
// cffgrid - map it to dreawmeavers custom mm:treecontrol tag
// ----
function translateCfGrid(node)
{
	if (node)
	{
		//start with default style
		var style = new QuickString(getCfFormElementStyle(node));
		
		//add styles that were specified as attributes on the tag
		if( node.height )
		{
			style.add(" height:");
			style.add(node.height.toString());
			style.add("px;");
		}
		if( node.width )
		{
			style.add(" width:");
			style.add(node.width.toString());
			style.add("px;");
		}
		
		//then add any styles in this node's style attribute (these will take precedence if they match ones we added already
		if( node.style ){
			style.add(node.style.toString());
		}
		
		var code = new QuickString("<mm:treecontrol style=\"");
		code.add(style.toString());
		code.add("\" >");
		
		var childNodes = node.childNodes;
		for (var i= 0; i < childNodes.length;i++)
		{
			if (childNodes[i].tagName && 
				childNodes[i].tagName.toLowerCase() == "cfgridcolumn")
			{
				code.add("<mm:treecolumn ");
				if( childNodes[i].header ) {
					code.add("value=\"");
					code.add(childNodes[i].header.toString());
					code.add("\" ");
				}
				if( childNodes[i].width ) {
					code.add("width=\"");
					code.add(childNodes[i].width.toString());
					code.add("\" ");
				}
				code.add("/>");
			}
		}
		code.add("</mm:treecontrol>");
		return code.toString();
	}
}

// ----
// common code for translates all the tags
// ----
function translateCfFormElementCommon(node, labelPosition)
{
	if (node)
	{
		//start with default style
		var style = getCfFormElementStyle(node);
		if( style == "" ){ 
			return ""; //not a flash form
		}
		
		var code = new QuickString("<label style=\"");
		code.add(style);
		code.add("\" >");
		
		var nodeString = node.outerHTML;
		//see if this is a required field
		if( node.required && node.required.toLowerCase() != "false" && node.required.toLowerCase() != "no")
		{
			//for required node, add a red star in front of the item
			nodeString = "<span style=\"color:red;\">*</span>" + nodeString;
		}
		
		//see if the label should be on the left of right of the tag
		var typeLower;
		if( node.type ) {
			typeLower = node.type.toLowerCase();
		}
		
		if( labelPosition == "none" )
		{
			//no special case for the label text, just need to be wrapped for positioning
			code.add(nodeString);
		}
		else if( labelPosition == "right"  )
		{
			//label goes on the right of these elements
			code.add(nodeString);
			if( node.label ){
				code.add(" ");
				code.add(node.label.toString());
			}
		}
		else
		{
			//default if for label to go on the left
			if( node.label ){
				code.add(node.label.toString());
				code.add(" ");
			}
			code.add(nodeString);
		}
		
		code.add("</label>");
		return code.toString();
	}
}

// ----
// cfinput
// ----
function translateCfInput(node)
{
	if (node)
	{
		//see if the label should be on the left of right of the tag
		var typeLower;
		if( node.type ) {
			typeLower = node.type.toLowerCase();
		}
		
		if( typeLower == "hidden" ){
			return ""; //no translation needed for hidden
		}
		else if( typeLower == "button" || typeLower == "file" || typeLower == "image" || typeLower == "reset" || typeLower == "submit")
		{
			//no special case for the label text, just need to be wrapped for positioning
			return translateCfFormElementCommon(node, "none");
		}
		else if( typeLower == "radio" || typeLower == "checkbox" )
		{
			//label goes on the right of these elements
			return translateCfFormElementCommon(node, "right");
		}
		else
		{
			//default if for label to go on the left
			return translateCfFormElementCommon(node, "left");
		}
	}
}

// ----
// cftextarea
// ----
function translateCfTextArea(node)
{
	if (node)
	{
		return translateCfFormElementCommon(node, "left");
	}
}

// ----
// cfselect
// ----
function translateCfSelect(node)
{
	if (node)
	{
		return translateCfFormElementCommon(node, "left");
	}
}