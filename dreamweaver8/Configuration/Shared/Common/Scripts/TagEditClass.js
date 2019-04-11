// SHARE-IN-MEMORY=true

// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.


// File TagEditClass.js
//   Classes defined: TagEdit

//--------------------------------------------------------------------
// CLASS:
//   TagEdit
//
// DESCRIPTION:
//   This class represents a tag that we would like to edit without
//   altering the DOM of the current page.  This is useful for editing
//   tags while using the docEdits mechanism, so that the DOM of the
//   page does not become stale.
//
//   An object can be constructed by passing in a source string.
//
// PUBLIC PROPERTIES:
//
// PUBLIC FUNCTIONS:
//   getTagType()
//   getTagName()
//
//   getOuterHTML()
//   setOuterHTML()
//
//   getOpenTag()
//   getCloseTag()
//
//   getAttributeList()
//   getAttribute(attrName)
//   setAttribute(attrName, value)
//   removeAttribute(attrName)
//   removeAllAttributes()
//
//   getInnerHTML()
//   setInnerHTML(newInnerHtml)
//
//   getChildNodes()
//   setChildNodes(childTagEdits)
//
//   format(childIndentStr, newlineStr);
//
// STATIC FUNCTIONS:
//
//   parseString(inputStr)
//
//--------------------------------------------------------------------


//--------------------------------------------------------------------
// FUNCTION:
//   TagEdit
//
// DESCRIPTION:
//   Constructor function
//
// ARGUMENTS:
//   tagSource - string - the tag source to edit
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function TagEdit(tagSource)
{
  // for backwards compatibility, check if they passed a node,
  //  instead of a string
  if (typeof tagSource != "string")
  {
    tagSource = dwscripts.getOuterHTML(tagSource);
  }
  
  this.tagType = TagEdit.TYPE_NONE;
  
  this.tagName = "";
  
  this.source = tagSource;
  
  this.preOpenTagWs = "";  // pre-open tag whitespace
  this.preCloseTagWs = ""; // pre-close tag whitespace
  
  this.openTagStart  = -1;
  this.openTagStop   = -1;
  this.closeTagStart = -1;
  this.closeTagStop  = -1;
  
  this.tagAttributes = null;
  
  this.attributeStart = -1;
  this.attributeStop  = -1;
  
  // an array of TagEdit nodes which represent the children of this tag
  this.childNodes = null;
  
  // flags to indicate node edits
  this.changedAttribute = false;
  this.changedChildNodes = false;
  

  // if tagSource passed in, parse the tag
  if (tagSource && tagSource.search(/[^ \t\n\r]/) != -1)
  {
    this.setOuterHTML(tagSource);
  }
}


// static properties
TagEdit.TYPE_NONE        = 0;
TagEdit.TYPE_DIRECTIVE   = 1;
TagEdit.TYPE_TEXT        = 2;
TagEdit.TYPE_TAG         = 3;
TagEdit.TYPE_BLOCKTAG    = 4;

// static methods
TagEdit.parseString = TagEdit_parseString;


// public methods
TagEdit.prototype.getTagType      = TagEdit_getTagType;
TagEdit.prototype.getTagName      = TagEdit_getTagName;

TagEdit.prototype.getOuterHTML    = TagEdit_getOuterHTML;
TagEdit.prototype.setOuterHTML    = TagEdit_setOuterHTML;

TagEdit.prototype.getOpenTag      = TagEdit_getOpenTag;
TagEdit.prototype.getCloseTag     = TagEdit_getCloseTag;

TagEdit.prototype.getAttributeList    = TagEdit_getAttributeList;
TagEdit.prototype.getAttribute        = TagEdit_getAttribute;
TagEdit.prototype.setAttribute        = TagEdit_setAttribute;
TagEdit.prototype.removeAttribute     = TagEdit_removeAttribute;
TagEdit.prototype.removeAllAttributes = TagEdit_removeAllAttributes;

TagEdit.prototype.getInnerHTML    = TagEdit_getInnerHTML;
TagEdit.prototype.setInnerHTML    = TagEdit_setInnerHTML;

TagEdit.prototype.getChildNodes   = TagEdit_getChildNodes;
TagEdit.prototype.setChildNodes   = TagEdit_setChildNodes;

TagEdit.prototype.format = TagEdit_format;

// private methods
TagEdit.prototype.isChanged           = TagEdit_isChanged;

TagEdit.prototype.setTagInfo          = TagEdit_setTagInfo;
TagEdit.prototype.setTagOffsets       = TagEdit_setTagOffsets;
TagEdit.prototype.setAttributeInfo    = TagEdit_setAttributeInfo;
TagEdit.prototype.setAttributeOffsets = TagEdit_setAttributeOffsets;
TagEdit.prototype.setChildNodeInfo    = TagEdit_setChildNodeInfo;
TagEdit.prototype.toString            = TagEdit_toString;



//--------------------------------------------------------------------
// FUNCTION:
//   TagEdit.parseString
//
// DESCRIPTION:
//   Static function which returns a list of TagEdit nodes, based
//   on the given input string
//
// ARGUMENTS:
//   inputStr - string - the string to parse
//
// RETURNS:
//   array of TagEdit nodes
//--------------------------------------------------------------------

function TagEdit_parseString(inputStr)
{
  var retVal = null;
  
  var callback = new TagEditCallback(inputStr);

  dw.scanSourceString(inputStr, callback);
  
  retVal = callback.tagNodes;

  return retVal;
}

//--------------------------------------------------------------------
// FUNCTION:
//   TagEdit.setOuterHTML
//
// DESCRIPTION:
//   This function sets the outer HTML for this TagEdit node.
//   When the outer HTML is set, we parse the source to extract
//   node information.  This is done using the TagEditCallback class.
//
// ARGUMENTS:
//   newOuterHTML - string - the outer HTML for this tag
//
// RETURNS:
//   boolean - true is successfull
//--------------------------------------------------------------------

function TagEdit_setOuterHTML(newOuterHTML)
{
  var retVal = false;
  
  var nodes = TagEdit.parseString(newOuterHTML);
  
  if (!nodes && nodes.length < 0 ||
      nodes.length > 1 || !nodes[0])
  {
	  var msg = MM.MSG_ParsingError;
		msg = msg.replace(/%s/, 'TagEdit.setOuterHTML');
    msg = msg.replace(/%s/, 'newOuterHTML');
    msg = msg.replace(/%s/, newOuterHTML);
    alert(msg);
  }
  else
  {
    var mainNode = nodes[0];
    
    this.source = newOuterHTML;

    this.preOpenTagWs = mainNode.preOpenTagWs;
    this.preCloseTagWs = mainNode.preCloseTagWs;

    this.tagType = mainNode.tagType;
    this.tagName = mainNode.tagName;
    this.openTagStart = mainNode.openTagStart;
    this.openTagStop = mainNode.openTagStop;
    this.closeTagStart = mainNode.closeTagStart;
    this.closeTagStop = mainNode.closeTagStop;

    this.tagAttributes = mainNode.tagAttributes;
    this.childNodes = mainNode.childNodes;
    
    this.attributeStart = -1;
    this.attributeStop  = -1;

    this.changedAttribute = false;
    this.changedChildNodes = false;

    retVal = true;
  }
  
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   TagEdit.getOuterHTML
//
// DESCRIPTION:
//   This function returns the new HTML for this TagEdit.  This new
//   HTML can then be applied to the document using the 
//   dwscripts.queueDocEdit function.
//
//   TODO: update the node based on this information
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string - the edited HTML for this object
//--------------------------------------------------------------------

function TagEdit_getOuterHTML()
{
  var retVal = new Array();
  
  if (this.tagType != TagEdit.TYPE_NONE)
  {  
    retVal.push(this.preOpenTagWs);

    retVal.push(this.getOpenTag());

    if (this.tagType == TagEdit.TYPE_BLOCKTAG)
    {
      retVal.push(this.getInnerHTML());

      retVal.push(this.getCloseTag());
    }
  }

  return retVal.join("");
}


//--------------------------------------------------------------------
// FUNCTION:
//   TagEdit.getTagType
//
// DESCRIPTION:
//   This function returns the tag type of the tag edit node.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   enumerated value: TagEdit.TYPE_DIRECTIVE, TagEdit.TYPE_TEXT,
//     TagEdit.TYPE_TAG, or TagEdit.TYPE_BLOCKTAG
//--------------------------------------------------------------------

function TagEdit_getTagType()
{
  var retVal = "";
  
  retVal = this.tagType;
  
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   TagEdit.getTagName
//
// DESCRIPTION:
//   This function returns the tag name of the tag edit node.  This
//   is useful for determining the names of child nodes.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function TagEdit_getTagName()
{
  var retVal = "";
  
  retVal = this.tagName.toUpperCase();
  
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   TagEdit.getOpenTag
//
// DESCRIPTION:
//   Returns the text of the opening tag
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function TagEdit_getOpenTag()
{
  var retVal = "";
  
  if (!this.changedAttribute || this.tagAttributes == null)
  {
    retVal = this.source.substring(this.openTagStart,this.openTagStop);
  }
  else
  {
    var openTag = new Array();
    
    this.setAttributeOffsets();
    
    if (this.attributeStart != -1)
    {
      // add the opening tag up to the first attribute
      openTag.push(this.source.substring(this.openTagStart,this.attributeStart));
    }
    else
    {
      // add the opening tag up to the end of the tag name
      openTag.push(this.source.substring(this.openTagStart,this.openTagStart + this.tagName.length + 1));
    }
    
    for (var i=0; i < this.tagAttributes.length; i++)
    {
      var tagAttr = this.tagAttributes[i];
      if (tagAttr.code != null && !tagAttr.remove)
      { // update existing attribute

        if (tagAttr.newCode == null)
        {
          openTag.push(this.source.substring(tagAttr.outerStart,tagAttr.outerStop));
        }
        else if (tagAttr.newCode != null)
        {
          if (tagAttr.name)
          {
            if (tagAttr.singleQuotes){
              openTag.push(this.source.substring(tagAttr.outerStart,tagAttr.innerStart-1) + "'" + tagAttr.newCode + "'" + this.source.substring(tagAttr.innerStop+1, tagAttr.outerStop));
            }else{
              openTag.push(this.source.substring(tagAttr.outerStart,tagAttr.innerStart) +
              tagAttr.newCode + this.source.substring(tagAttr.innerStop, tagAttr.outerStop));
            }
          }
          else
          {
            openTag.push(" " + tagAttr.newCode);
          }
        }
      }
      else if (!tagAttr.remove)
      { // add new attribute

        if (tagAttr.name)
        {
          if (tagAttr.singleQuotes)
            openTag.push(" " + tagAttr.name + "='" + tagAttr.newCode + "'");
          else
            openTag.push(" " + tagAttr.name + "=\"" + tagAttr.newCode + "\"");
        }
        else
        {
          openTag.push(" " + tagAttr.newCode);
        }
      }
    }

    // now, add the close of the tag
    if (this.attributeStop != -1)
    {
      openTag.push(this.source.substring(this.attributeStop , this.openTagStop));
    }
    else
    {
      openTag.push(this.source.substring(this.openTagStart + this.tagName.length + 1, this.openTagStop));
    }
    
    retVal = openTag.join("");
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   TagEdit.getCloseTag
//
// DESCRIPTION:
//   <description>
//
// ARGUMENTS:
//   <arg1> - <type and description>
//
// RETURNS:
//   <type and description>
//--------------------------------------------------------------------

function TagEdit_getCloseTag()
{
  var retVal = null;
  
  if (this.tagType == TagEdit.TYPE_BLOCKTAG)
  {
    retVal = this.source.substring(this.closeTagStart,this.closeTagStop);
  }
  
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   TagEdit.getAttributeList
//
// DESCRIPTION:
//   Returns an array of the attribute names for this tag.
//   The code is returned for minimized attributes.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   array of strings
//--------------------------------------------------------------------

function TagEdit_getAttributeList()
{
  var retVal = new Array();
  
  if (this.tagAttributes != null)
  {
    for (var i=0; i < this.tagAttributes.length; i++)
    {
      if (!this.tagAttributes[i].remove)
      {
        if (this.tagAttributes[i].name)
        {
          retVal.push(this.tagAttributes[i].name);
        }
        else
        {
          if (this.tagAttributes[i].newCode != null)
          {
            retVal.push(this.tagAttributes[i].newCode);
          }
          else
          {
            retVal.push(this.tagAttributes[i].code);
          }
        }
      }
    }
  }
  
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   TagEdit.getAttribute
//
// DESCRIPTION:
//   This function returns the value of the given attribute.
//   It first checks the list of set attribute, and if the name is
//   not found within this list, then it retrieves the value from
//   the orignal tag.
//
// ARGUMENTS:
//   attributeName - string - the name of the attribute to get the
//     value of
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function TagEdit_getAttribute(attributeName)
{
  var retVal = null;
  
  if (this.tagAttributes != null)
  {
    for (var i=0; i < this.tagAttributes.length; i++)
    {
      if (this.tagAttributes[i].name.toUpperCase() == attributeName.toUpperCase())
      {
        if (this.tagAttributes[i].newCode != null)
        {
          retVal = this.tagAttributes[i].newCode;
        }
        else
        {
          retVal = this.tagAttributes[i].code;
        }
        break;
      }
    }
  }
  
  return retVal;
}
    

//--------------------------------------------------------------------
// FUNCTION:
//   TagEdit.setAttribute
//
// DESCRIPTION:
//   Sets an atrribute with the given name to the given value.
//   This edit is stored and applied to the tag when the getOuterHTML
//   function is called.
//
// ARGUMENTS:
//   attributeName - string - the name of the attribute to set, the
//     code of the minimized attribute to replace, or
//     blank if adding a new minimized attribute
//   newValue - string - the new value for the attribute
//   useSingleQuotes - boolean - indicates whether the attribute should
//   be set using single quotes rather than double quotes (this is
//   necessary when binding data with ASP.NET). optional.
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function TagEdit_setAttribute(attributeName, newValue, useSingleQuotes)
{
  this.changedAttribute = true;
  
  var found = false;
  
  if (attributeName && this.tagAttributes != null)
  {
    for (var i=0; i < this.tagAttributes.length; i++)
    {
      if (this.tagAttributes[i].name.toUpperCase() == attributeName.toUpperCase())
      {
        this.tagAttributes[i].newCode = newValue;
        this.tagAttributes[i].remove = false;
        if (useSingleQuotes)
          this.tagAttributes[i].singleQuotes = true;
        found = true;
        break;
      }
      else if (this.tagAttributes[i].code &&
               this.tagAttributes[i].code == attributeName)
      {
        this.tagAttributes[i].newCode = newValue;
        this.tagAttributes[i].remove = false;
        found = true;
        break;
      }
    }
  }
  
  // if this attribute is not found, add a new one
  if (!found)
  {
    if (this.tagAttributes == null)
    {
      this.tagAttributes = new Array();
    }
    
    var node = new Object();
    node.name = attributeName;
    node.newCode = newValue;
    node.remove = false;
    if (useSingleQuotes)
     node.singleQuotes = true;
    
    this.tagAttributes.push(node);
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   TagEdit.removeAttribute
//
// DESCRIPTION:
//   This function removes the named attribute.  This edit is stored,
//   and applied when the getOuterHTML function is called.
//
// ARGUMENTS:
//   attributeName - string - the name of the attribute to remove,
//     or the code of the minimized attribute to remove
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function TagEdit_removeAttribute(attributeName)
{
  this.changedAttribute = true;
  
  for (var i=0; i < this.tagAttributes.length; i++)
  {
    if (this.tagAttributes[i].name.toUpperCase() == attributeName.toUpperCase())
    {
      this.tagAttributes[i].remove = true;
      break;
    }
    else if (this.tagAttributes[i].code &&
             this.tagAttributes[i].code == attributeName)
    {
      this.tagAttributes[i].remove = true;
      break;
    }
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   TagEdit.removeAllAttributes
//
// DESCRIPTION:
//   This function removes all attributes.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function TagEdit_removeAllAttributes()
{
  this.changedAttribute = true;
  
  for (var i=0; i < this.tagAttributes.length; i++)
  {
    this.tagAttributes[i].remove = true;
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   TagEdit.getInnerHTML
//
// DESCRIPTION:
//   Returns the innerHTML.  This is the orignal innerHTML, if 
//   setInnerHTML has not been called, or else it is the new value.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function TagEdit_getInnerHTML()
{
  var retVal = null;

  if (this.tagType == TagEdit.TYPE_BLOCKTAG)
  {
    if (!this.isChanged())
    {
      retVal = this.source.substring(this.openTagStop,this.closeTagStart);
    }
    else if (this.childNodes != null)
    {
      var innerSrc = new Array();
      for (var i=0; i < this.childNodes.length; i++)
      {
        if (i > 0 &&
            this.childNodes[i].preOpenTagWs == "" &&
            this.childNodes[i-1].preOpenTagWs != "")
        {
          this.childNodes[i].preOpenTagWs = this.childNodes[i-1].preOpenTagWs;
        }
        innerSrc.push(this.childNodes[i].getOuterHTML());
      }
      retVal = innerSrc.join("") + this.preCloseTagWs;
    }
    else
    {
      retVal = "";
    }
  }
    
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   TagEdit.setInnerHTML
//
// DESCRIPTION:
//   Sets the innerHTML.  This edit is stored, and applied when
//   getOuterHTML is called.
//
// ARGUMENTS:
//   newInnerHTML - string - the new inner HTML
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function TagEdit_setInnerHTML(newInnerHTML)
{
  this.changedChildNodes = true;
  
  var nodes = TagEdit.parseString(newInnerHTML);
  
  // get the pre-openTag whitespace from the previous first child
  var previousWs = "";
  if (this.childNodes && this.childNodes.length > 0)
  {
    previousWs = this.childNodes[0].preOpenTagWs;
  }

  this.childNodes = nodes;
  
  // set the first new childs whitespace to match the
  //  old node, if none was specified
  if (this.childNodes && this.childNodes.length > 0 &&
      this.childNodes[0].preOpenTagWs == "")
  {
    this.childNodes[0].preOpenTagWs = previousWs;
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   TagEdit.getChildNodes
//
// DESCRIPTION:
//   Returns an array of TagEdits, which represent the children
//   of the current tag.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   array of TagEdits
//--------------------------------------------------------------------

function TagEdit_getChildNodes()
{
  var retVal = new Array();
  
  if (this.childNodes != null)
  {  
    for (var i=0; i < this.childNodes.length; i++)
    {
      retVal.push(this.childNodes[i]);
    }
  }
  
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   TagEdit.setChildNodes
//
// DESCRIPTION:
//   Sets the array of TagEdits.
//
// ARGUMENTS:
//   childNodes - array of TagEdits - the new list of
//     children for this object
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function TagEdit_setChildNodes(childNodes)
{
  this.changedChildNodes = true;
  
  this.childNodes = childNodes;
}


//--------------------------------------------------------------------
// FUNCTION:
//   TagEdit.format
//
// DESCRIPTION:
//   Reformats the sub-tags of this tag object.  Uses a return and
//   two space indent for each child, unless other values are
//   provided.
//
// ARGUMENTS:
//   childIndentStr - string - (optional) the string to use before 
//     each sub-tag.
//   newlineStr - string - (optional) the new line string
//     to use between sub-nodes
//   level - integer- (internal) used for recurrsion
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function TagEdit_format(childIndentStr, newlineStr, level)
{
  childIndentStr = (childIndentStr) ? childIndentStr : "  ";
  newlineStr = (newlineStr) ? newlineStr : dwscripts.getNewline();
  level = (level) ? level : 0;
  
  this.changedChildNodes = true;
  
  if (level == 0)
  {
    this.preOpenTagWs = "";
    if (this.tagType == TagEdit.TYPE_BLOCKTAG)
    {
      this.preCloseTagWs = newlineStr;
    }
  }
  else
  {
    var indent = new Array();
    for (var i=0; i < level; i++)
    {
      indent.push(childIndentStr);
    }
    
    this.preOpenTagWs = newlineStr + indent.join("");
    if (this.tagType == TagEdit.TYPE_BLOCKTAG)
    {
      this.preCloseTagWs = newlineStr + indent.join("");
    }
  }
  
  if (this.childNodes != null)
  {
    level++;
    for (var i=0; i < this.childNodes.length; i++)
    {
      this.childNodes[i].format(childIndentStr, newlineStr, level);
    }
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   TagEdit.isChanged
//
// DESCRIPTION:
//   Returns true if this node has had its attributes or childNodes
//   updated, or if any of its children have been updated.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function TagEdit_isChanged()
{
  var retVal = false;
  
  retVal = (this.changedAttribute || this.changedChildNodes);
  
  if (!retVal && this.childNodes != null)
  {
    for (var i=0; i < this.childNodes.length; i++)
    {
      if (this.childNodes[i].isChanged())
      {
        retVal = true;
        break;
      }
    }
  }
  
  return retVal;
}



//--------------------------------------------------------------------
// FUNCTION:
//   TagEdit.setTagInfo
//
// DESCRIPTION:
//   <description>
//
// ARGUMENTS:
//   <arg1> - <type and description>
//
// RETURNS:
//   <type and description>
//--------------------------------------------------------------------

function TagEdit_setTagInfo(type, name, source, openTagStart, openTagStop)
{
  this.tagType = type;
  this.tagName = name.toUpperCase();
  this.source = source;
  this.openTagStart = openTagStart;
  this.openTagStop = openTagStop;
}


//--------------------------------------------------------------------
// FUNCTION:
//   TagEdit.setTagOffsets
//
// DESCRIPTION:
//   <description>
//
// ARGUMENTS:
//   <arg1> - <type and description>
//
// RETURNS:
//   <type and description>
//--------------------------------------------------------------------

function TagEdit_setTagOffsets(openTagStart, openTagStop, closeTagStart, closeTagStop)
{
  if (openTagStart != null)
  {
    this.openTagStart = openTagStart;
  }
  if (openTagStop != null)
  {
    this.openTagStop = openTagStop;
  }
  if (closeTagStart != null)
  {
    this.closeTagStart = closeTagStart;
    this.tagType = TagEdit.TYPE_BLOCKTAG;
  }
  if (closeTagStop != null)
  {
    this.closeTagStop = closeTagStop;
    this.tagType = TagEdit.TYPE_BLOCKTAG;
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   TagEdit.setAttributeInfo
//
// DESCRIPTION:
//   <description>
//
// ARGUMENTS:
//   <arg1> - <type and description>
//
// RETURNS:
//   <type and description>
//--------------------------------------------------------------------

function TagEdit_setAttributeInfo(name, code)
{
  if (this.tagAttributes == null)
  {
    this.tagAttributes = new Array();
  }
  
  var obj = new Object();
  obj.name = name;
  obj.code = code;
  obj.outerStart = -1;
  obj.outerStop  = -1;
  obj.innerStart = -1;
  obj.innerStop  = -1;
  obj.newCode = null;
  obj.remove = false;
  
  this.tagAttributes.push(obj);
}


//--------------------------------------------------------------------
// FUNCTION:
//   TagEdit.setAttributeOffsets
//
// DESCRIPTION:
//   <description>
//
// ARGUMENTS:
//   <arg1> - <type and description>
//
// RETURNS:
//   <type and description>
//--------------------------------------------------------------------

function TagEdit_setAttributeOffsets()
{
  this.attributeStart = -1;
  this.attributeStop  = -1;
  
  if (this.tagAttributes != null)
  {
    var searchPattern = "";

    var openTag = this.source.substring(this.openTagStart,this.openTagStop);
    
    for (var i=0; i < this.tagAttributes.length; i++)
    {
      // only set offsets for existing attributes
      if (this.tagAttributes[i].code != null)
      {
        var tagAttr = this.tagAttributes[i];

        if (tagAttr.name)
        {
          searchPattern = "(\\s+" + dwscripts.escRegExpChars(tagAttr.name) +
            "\\s*=\\s*[\"\']?)(" + dwscripts.escRegExpChars(tagAttr.code) + 
            ")([\"\']?)";
          var match = openTag.match(RegExp(searchPattern,"i"));
          if (match)
          {
            tagAttr.outerStart = this.openTagStart + match.index;
            tagAttr.innerStart = tagAttr.outerStart + match[1].length;
            tagAttr.innerStop  = tagAttr.innerStart + match[2].length;
            tagAttr.outerStop  = tagAttr.innerStop + match[3].length;
          }
        }
        else
        {
          searchPattern = "(\\s+" + dwscripts.escRegExpChars(tagAttr.code) + ")";
          var match = openTag.match(RegExp(searchPattern,"i"));
          if (match)
          {
            tagAttr.outerStart = this.openTagStart + match.index;
            tagAttr.outerStop  = tagAttr.outerStart + match[1].length;
          }
        }
        
        // set the beginning of the attributes
        if (this.attributeStart == -1)
        {
          this.attributeStart = tagAttr.outerStart;
        }
        
        // this is set each time, so it always cooresponds to the
        //  last item.
        this.attributeStop = tagAttr.outerStop;
      }
    }
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   TagEdit.setChildNodeInfo
//
// DESCRIPTION:
//   <description>
//
// ARGUMENTS:
//   <arg1> - <type and description>
//
// RETURNS:
//   <type and description>
//--------------------------------------------------------------------

function TagEdit_setChildNodeInfo(childNodes)
{
  this.childNodes = childNodes;
}


//--------------------------------------------------------------------
// FUNCTION:
//   TagEdit.toString
//
// DESCRIPTION:
//   Returns a string representation of this TagEdit node, suitable
//   for debugging
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function TagEdit_toString()
{
  var retVal = new Array();

  retVal.push("TagType: " + this.tagType);
  retVal.push("Tag Name: " + this.tagName);
  retVal.push("Offsets: " + this.openTagStart + ", " + this.openTagStop + ", " +
              this.closeTagStart + ", " + this.closeTagStop);
  retVal.push("OuterHTML: ");
  if (this.tagType != TagEdit.TYPE_BLOCKTAG)
  {
    retVal.push(this.source.substring(this.openTagStart,this.openTagStop));
  }
  else
  {
    retVal.push(this.source.substring(this.openTagStart,this.closeTagStop));
  }
  if (this.tagType == TagEdit.TYPE_BLOCKTAG)
  {
    retVal.push("InnerHTML:");
    retVal.push(this.source.substring(this.openTagStop,this.closeTagStart));
  }
  if (this.tagType == TagEdit.TYPE_BLOCKTAG || this.tagType == TagEdit.TYPE_TAG)
  {
    if (this.tagAttributes != null)
    {
      retVal.push("Attributes:");
      for (var j=0; j < this.tagAttributes.length; j++)
      {
        var attr = this.tagAttributes[j];
        if (attr.name)
        {
          retVal.push(attr.name + " = " + attr.code);
        }
        else
        {
          retVal.push("minimized attribute = " + attr.code);
        }
      }
    }
  }
  
  if (this.childNodes != null)
  {
    retVal.push("Child Nodes: " + this.childNodes.length);

    for (var i=0; i < this.childNodes.length; i++)
    {
      retVal.push(this.childNodes[i].tagType + ", " + this.childNodes[i].tagName);
    }
  }

  return retVal.join("\n");
}






//--------------------------------------------------------------------
// FUNCTION:
//   TagEditCallback
//
// DESCRIPTION:
//   Constructor function
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function TagEditCallback(source)
{
  this.source = source;
  
  this.tagNodes = new Array();
  
  this.currNode = null;
}

TagEditCallback.DEBUG = false;

TagEditCallback.prototype.directive = TagEditCallback_directive;
TagEditCallback.prototype.text = TagEditCallback_text;
TagEditCallback.prototype.attribute = TagEditCallback_attribute;
TagEditCallback.prototype.openTagBegin = TagEditCallback_openTagBegin;
TagEditCallback.prototype.openTagEnd = TagEditCallback_openTagEnd;
TagEditCallback.prototype.closeTagBegin = TagEditCallback_closeTagBegin;
TagEditCallback.prototype.closeTagEnd = TagEditCallback_closeTagEnd;
TagEditCallback.prototype.restartParse = TagEditCallback_restartParse;

TagEditCallback.prototype.toString = TagEditCallback_toString;


function TagEditCallback_directive(code, offset)
{
  if (TagEditCallback.DEBUG) alert("directive(" + code + ", " + offset + ")");
  
  var node = new TagEdit();
  node.setTagInfo(TagEdit.TYPE_DIRECTIVE, "", this.source, offset, offset + code.length);
  this.tagNodes.push(node);
  this.currNode = node;
}


function TagEditCallback_text(code, offset)
{
  if (TagEditCallback.DEBUG) alert("text(" + code + ", " + offset + ")");
  
  var node = new TagEdit();
  node.setTagInfo(TagEdit.TYPE_TEXT, "", this.source, offset, offset + code.length);
  this.tagNodes.push(node);
  this.currNode = node;
}


function TagEditCallback_openTagBegin(tag, offset)
{
  if (TagEditCallback.DEBUG) alert("openTagBegin(" + tag + ", " + offset + ")");
  
  var node = new TagEdit();
  node.setTagInfo(TagEdit.TYPE_TAG, tag, this.source, offset, null);
  
  if (this.currNode)
  {
    // store the whitespace between the new tag and the previous tag
    if (this.currNode.getTagType() == TagEdit.TYPE_BLOCKTAG)
    {
      node.preOpenTagWs = this.source.substring(this.currNode.closeTagStop, offset);
    }
    else
    {
      node.preOpenTagWs = this.source.substring(this.currNode.openTagStop, offset);
    }
  }
  
  this.tagNodes.push(node);
  this.currNode = node;
}


function TagEditCallback_attribute(name, code)
{
  if (TagEditCallback.DEBUG) alert("attribute(" + name + ", " + code + ")");
  
  if (this.currNode)
    this.currNode.setAttributeInfo(name,code);
}


function TagEditCallback_openTagEnd(offset, trailingFormat)
{
  if (TagEditCallback.DEBUG) alert("openTagEnd(" + offset + ", " + trailingFormat + ")");
  
  if (this.currNode)
    this.currNode.setTagOffsets(null,offset,null,null);
}


function TagEditCallback_closeTagBegin(tag, offset)
{
  if (TagEditCallback.DEBUG) alert("closeTagBegin(" + tag + ", " + offset + ")");
  
  var tagName = tag.toUpperCase();
  var lastNode = this.currNode;

  for (var i=this.tagNodes.length-1; i >= 0; i--)
  {
    var tagNode = this.tagNodes[i];
    if (tagNode.getTagType() == TagEdit.TYPE_TAG && 
        tagNode.getTagName() == tagName)
    {
      this.currNode = tagNode;
      
      if (lastNode)
      {
        // store the whitespace between the close tag and the previous tag
        if (lastNode.getTagType() == TagEdit.TYPE_BLOCKTAG)
        {
          this.currNode.preCloseTagWs = this.source.substring(lastNode.closeTagStop, offset);
        }
        else
        {
          this.currNode.preCloseTagWs = this.source.substring(lastNode.openTagStop, offset);
        }
      }
      
      // now set the offsets, so the tag type doesn't change
      //   until we are done setting the whitespace
      this.currNode.setTagOffsets(null,null,offset,null);
  
      // set the child nodes if there are any
      if (i < this.tagNodes.length - 1)
      {
        /*
        var childNodes = this.tagNodes.splice(i+1);
        */
        
        var childNodes = new Array();
        for (var k=i+1; k < this.tagNodes.length; k++)
        {
          childNodes.push(this.tagNodes[k]);
        }
        this.tagNodes.length = i+1;
        
        this.currNode.setChildNodeInfo(childNodes);
      }
      break;
    }
  }
}


function TagEditCallback_closeTagEnd(offset)
{
  if (TagEditCallback.DEBUG) alert("closeTagEnd(" + offset + ")");
  
  if (this.currNode)
    this.currNode.setTagOffsets(null,null,null,offset);
}


function TagEditCallback_restartParse()
{
  if (TagEditCallback.DEBUG) alert("restartParse");
  
  this.tagNodes = new Array();
  
  this.currNode = null;
}


function TagEditCallback_toString()
{
  var retVal = new Array();

  for (var i=0; i < this.tagNodes.length; i++)
  {
    retVal.push(this.tagNodes[i].toString());
  }

  return retVal.join("\n");
}





