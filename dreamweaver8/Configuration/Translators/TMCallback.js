//SHARE-IN-MEMORY=true
// Copyright 2000, 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

///////////////////////////////////////////////// Global Identifiers //////////////////////////////////////////////////////
var PTYPE_DIRECTIVE = 0;
var PTYPE_TEXT = 1;
var PTYPE_ATTRIBUTE = 2;
var PTYPE_TAG = 3;
var debugTMC = false;

////////////////////////////////////////////////// TMCallback Class ///////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Function : TMCallback::TMCallback
// Purpose	: translation manager's JavaScript callback object passed to dreamweaver.scanSourceString.
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function TMCallback(transMgr)
{
	// Members
	this.transMgr = transMgr;
	this.inTagSpan = false;
	this.withinCFOutput = false;
	this.inCData = 0;
}
  // methods
  TMCallback.prototype.directive = directive;
  TMCallback.prototype.text = text;
  TMCallback.prototype.attribute = attribute;
  TMCallback.prototype.openTagBegin = openTagBegin;
  TMCallback.prototype.openTagEnd = openTagEnd;
  TMCallback.prototype.closeTagBegin = closeTagBegin;
  TMCallback.prototype.closeTagEnd = closeTagEnd;
  TMCallback.prototype.restartParse = restartParse;
  TMCallback.prototype.xmlCDataStartTag = xmlCDataStartTag;
  TMCallback.prototype.xmlCDataEndTag = xmlCDataEndTag;

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Function : TMCallback::directive
// Purpose	: called for every directive within the document being parsed
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function directive(code, offset)
{
	if (this.inCData > 0)
		return true;

	if (debugTMC)
		alert("directive\n" + code);
	this.transMgr.notifyTagBegin("", offset);
	if (this.inTagSpan)
	{
		this.transMgr.addToTagSpan(code, offset, true);
	}
	else
	{
		var part = this.transMgr.getParticipant(PTYPE_DIRECTIVE, code);
		var trans = this.transMgr.getData(part, code);
		this.transMgr.translateDirective(code, offset, trans);
	}
		  
	return true;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Function : TMCallback::attribute
// Purpose	: called for every attribute within the document being parsed
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function attribute(name, code)
{
	if (this.inCData > 0)
		return true;

	if (debugTMC)
		alert("attribute\n" + code);
	if (this.withinCFOutput && name.toLowerCase() == "query")
	{
		if (!this.transMgr.CFOutput.IsEmpty())
		{
			var queryName = this.transMgr.CFOutput.Pop();
			queryName = code;
			this.transMgr.CFOutput.Push(queryName);
		}
	}
	if (!this.inTagSpan)
	{
		var part = null;
		if (this.transMgr.lookInThisAttribute(code))
		{
			part = this.transMgr.getParticipant(PTYPE_ATTRIBUTE, code, name);
			var trans = this.transMgr.getData(part, code, name);
			this.transMgr.translateAttribute(code, name, trans);
		}
		else
		{
			this.transMgr.translateAttribute(code, name, null);
		}
	}

	return true;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Function : TMCallback::text
// Purpose	: called for every text span within the document being parsed
//			  calls translateText for each occurence of pattern within the text run 
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function text(code, offset)
{
	if (this.inCData > 0)
		return true;

	if (debugTMC)
		alert("text\n" + code);
	this.transMgr.notifyTagBegin("", offset);
	
	if (this.inTagSpan)
	{
		this.transMgr.addToTagSpan(code, offset, true);
	}
	else
	{	  
		this.transMgr.translateTextSpan(code, offset);
	}

	return true;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Function : TMCallback::openTagBegin
// Purpose	: called whenever an open tag is detected within the document being parsed
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function openTagBegin(tag, offset)
{
	if (this.inCData > 0)
		return true;

	this.transMgr.notifyTagBegin(tag, offset);
	if (this.transMgr.lookInThisTag(tag.toLowerCase()))
	{
		if (tag.toLowerCase() == "cfoutput")
		{
			this.withinCFOutput = true;
			this.transMgr.CFOutput.Push("");
		}
	}
	if (tag.toLowerCase() == "mm:invisible")
	{
		this.transMgr.setDecoration(false);
	}

	return true;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Function : TMCallback::openTagEnd
// Purpose	: called whenever an open tag is ended within the document being parsed
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function openTagEnd(offset, trailingFormat)
{
	if (this.inCData > 0)
		return true;

	var code = this.transMgr.notifyTagEnd(offset);
	if (debugTMC)
		alert("open tag\n" + code);
	if (this.inTagSpan)
	{
		this.transMgr.addOpenTagToTagSpan(code, offset, trailingFormat);
	}
	else if (this.transMgr.lookInThisTag(this.transMgr.getCurrentTagName()))
	{
		if (this.withinCFOutput)
		{
			this.withinCFOutput = false;
		}

		// Try to translate this as a tag span
		var success = false;
		this.inTagSpan = this.transMgr.translateTagSpan(code, offset, trailingFormat);
		if (this.inTagSpan)
		{
			// Try to add the first open tag to the tag span.  If this tag
			// has the form <.../>, the tag span will complete.  If addOpenTag
			// returns false, it means that the tag span completed but no match
			// was found.
			var result = this.transMgr.addOpenTagToTagSpan(code, offset, trailingFormat);
			success = result.success;
			this.inTagSpan = result.inTagSpan;
			if (result.reparse)
				return false;
		}

		// If we didn't end up in a tag span (or the entire tag span was
		// a single <.../> tag which didn't match any of the patterns).
		if (!this.inTagSpan && !success)
		{
			var part = this.transMgr.getParticipant(PTYPE_TAG, code);
			var trans = this.transMgr.getData(part, code);
			var startOffset = this.transMgr.getCurrentTagOffset();
			this.transMgr.translateTag(code, startOffset, trans);
		}
	}
	else
	{
		var startOffset = this.transMgr.getCurrentTagOffset();
		this.transMgr.translateTag(code, startOffset, null);
	}

	this.transMgr.pushOpenTag(trailingFormat);
	return true;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Function : TMCallback::closeTagBegin
// Purpose	: called whenever a close tag is detected within the document being parsed
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function closeTagBegin(tag, offset)
{
	if (this.inCData > 0)
		return true;

	this.transMgr.notifyTagBegin(tag, offset);
	if (this.transMgr.lookInThisTag(tag.toLowerCase()))
	{
		if (tag.toLowerCase() == "cfoutput")
		{
			if (!this.transMgr.CFOutput.IsEmpty())
			{
				var queryName = this.transMgr.CFOutput.Pop();
			}
		}
	}
	if (tag.toLowerCase() == "mm:invisible")
	{
		this.transMgr.setDecoration(true);
	}

	return true;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Function : TMCallback::closeTagEnd
// Purpose	: called whenever a close tag is ended within the document being parsed
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function closeTagEnd(offset)
{
	if (this.inCData > 0)
		return true;

	var code = this.transMgr.notifyTagEnd(offset);
	if (debugTMC)
		alert("close tag\n" + code);
	this.transMgr.popCloseTag();
	if (this.inTagSpan)
	{
		// Try to add this close tag to the tag span.  If this tag ends
		// the tag span, this.transMgr.inTagSpan will change to false.
		// If addCloseTag returns false, it means that the tag span
		// completed, but no match was found.  This means we have to
		// restart the parse.
		var result = this.transMgr.addCloseTagToTagSpan(code, offset);
		this.inTagSpan = result.inTagSpan;
		if (result.reparse)
			return false;
	}
	else if (this.transMgr.lookInThisTag(this.transMgr.getCurrentTagName()))
	{
		if (!this.inTagSpan)
		{
			var part = this.transMgr.getParticipant(PTYPE_TAG, code);
			var trans = this.transMgr.getData(part, code);
			var startOffset = this.transMgr.getCurrentTagOffset();
			this.transMgr.translateTag(code, startOffset, trans);
		}
	}
	else
	{
		var startOffset = this.transMgr.getCurrentTagOffset();
		this.transMgr.translateTag(code, startOffset, null);
	}

	return true;
}


function restartParse()
{
	this.transMgr.initialize();
	return false;
}


function xmlCDataStartTag()
{
	this.inCData++;
	return true;
}

function xmlCDataEndTag()
{
	if (this.inCData > 0)
		this.inCData--;
	return true;
}