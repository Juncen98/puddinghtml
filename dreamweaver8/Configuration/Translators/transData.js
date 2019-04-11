//SHARE-IN-MEMORY=true
// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

/////////////////////////////////////////////////// transData Class  //////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Function : transData_transData
// Purpose	: data store for a participants translation information
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function transData(part, type, openTag, closeTag, attributes, display, insertBefore, insertAfter, beginMegaLock, endMegaLock, lockAttributes)
{
	// Members
	this.participant	= part;			// participant name
	this.type			= type;			// blank|custom|tabbedRegion|dataSource|dynamicData
	this.openTag		= openTag;		// may contain replace tokens
	this.closeTag		= closeTag;		// may contain replace tokens
	this.attributes		= attributes;	// may contain replace tokens
	this.display		= display;		// may contain replace tokens
	this.insertBefore	= insertBefore;	//
	this.insertAfter	= insertAfter;	// 
	this.beginMegaLock	= beginMegaLock;//
	this.endMegaLock	= endMegaLock;  //
	this.lockAttributes = lockAttributes;
}
	// methods
	transData.prototype.replaceTokens	= transData_replaceTokens;
	transData.prototype.replaceToken	= transData_replaceToken;
	transData.lookupTransValue			= transData_lookupTransValue;
	transData.lookupTransArray			= transData_lookupTransArray;
	transData.parse						= transData_parse;
	transData.copy						= transData_copy;

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Function : transData_replaceTokens
// Purpose	: replace tokens of the form @@name@@ with tokens[name]
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function transData_replaceTokens(tokens)
{
	this.openTag = this.replaceToken(this.openTag, tokens);
	this.closeTag = this.replaceToken(this.closeTag, tokens);
	this.attributes = this.replaceToken(this.attributes, tokens);
	if (this.attributes && this.attributes.indexOf("@@") != -1)
	{
		this.attributes = this.attributes.replace(/\s*\w+=@@\w+@@/g, "");
	}
	if (this.type == "dynamic data" && this.attributes.indexOf("mmTranslatedValueDynValue") != -1)
	{
		if (dw.getDynamicTextFormat() == "{}")
		{
			this.attributes = this.attributes.replace(/mmTranslatedValueDynValue="VALUE=\{[^\}]+\}"/gi, "mmTranslatedValueDynValue=\"VALUE=\{\}\"");
		}
	}

	if (this.display)
	{
		if (this.type == "dynamic data" && dw.getDynamicTextFormat() == "{}")
		{
			this.display = "{}";
		}
		else
		{
			this.display = this.replaceToken(this.display, tokens);
			if (this.display.indexOf("@@") != -1)
			{
				this.display = this.display.replace(/@@\w+@@/g, "");
			}
			if (this.type == "tabbed region start")
			{
				this.display = escape(this.display);
			}
		}
	}
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Function : transData_replaceToken
// Purpose	: replace specified tokens of the form @@name@@ with tokens[name]
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function transData_replaceToken(value, tokens)
{
	var shortToken;
	if (value && value.indexOf("@@") != -1)
	{
		for (var i in tokens)
		{
			shortToken = tokens[i];
			if (shortToken.length > 19)
				shortToken = shortToken.substr(0, 16) + "...";

			if (value.indexOf("@@"+i+"@@") != -1)
				value = value.replace(RegExp("@@" + i + "@@","g"), tokens[i]);
			if (value.indexOf("@@limit(" + i + ")@@") != -1)
				value = value.replace(RegExp("@@limit[(]" + i + "[)]@@", "g"), shortToken);
			if (value.indexOf("@@escape(" + i + ")@@") != -1)
				value = value.replace(RegExp("@@escape[(]" + i + "[)]@@", "g"), escape(tokens[i]));
			if (value.indexOf("@@limitAndEscape(" + i + ")@@") != -1)
				value = value.replace(RegExp("@@limitAndEscape[(]" + i + "[)]@@", "g"), escape(shortToken));
		}

		var current = 0;
		var subValue = value;
		var temp = subValue.search(/@@MM.LABEL_\w+@@/);
		var replacement;

		while (temp > -1)
		{
			var varEnd = value.indexOf("@@", current+temp+2);
			var variable = value.substr(current+temp+2, varEnd-current-temp-2);
			replacement = eval(variable);
			value = value.replace(RegExp("@@" + variable + "@@", "g"), replacement);
			current = current+temp+replacement.length;
			subValue = value.substr(current);
			temp = subValue.search(/@@MM.LABEL_\w+@@/);
		}
	}

	return value;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Function : transData_lookupTransValue
// Purpose	: pulls one value out of a XML <translation> tag
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function transData_lookupTransValue(participant, translation, name)
{
	return dw.getExtDataValue(participant, "translator", "translations", translation, name);
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Function : transData_lookupTransArray
// Purpose	: pulls one array out of a XML <translation> tag
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function transData_lookupTransArray(participant, translation, name)
{
	return dw.getExtDataArray(participant, "translator", "translations", translation, name);
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Function : transData_parse
// Purpose	: pulls values out of XML <translation> tag and creates a new transData
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function transData_parse(participant, translation, translatorInfoItem, manager)
{
  var whereToSearch = transData.lookupTransValue(participant, translation, "whereToSearch").toLowerCase();

  // ===========================================================================
  // Put this participant into the appropriate partition.
  // ===========================================================================

  if (whereToSearch.indexOf("tag+") == 0)
  {
	var limitSearch =
	  transData.lookupTransValue(participant, translation, "limitSearch").toLowerCase();
	
	// Look for "tagonly" or "all" tag patterns that aren't
	// covered by the server model "alwaysCheckTag" rules
	var tagName = whereToSearch.substr(4);
	if (!translatorInfoItem.lookInAllTags &&
		limitSearch.indexOf("attribute+") != 0 &&
		!manager.alwaysCheckTag(tagName))
	  translatorInfoItem.lookInAllTags = true;
	
	whereToSearch = whereToSearch + ":" + limitSearch;
	
	if (limitSearch.indexOf("attribute+") == 0)
	{
	  translatorInfoItem.attributeParticipants[participant] = true;
	}
	else if (limitSearch.indexOf("tagonly") == 0)
	{
	  translatorInfoItem.tagOnlyParticipants[participant] = true;
	}
	else
	{
	  translatorInfoItem.outerHTMLParticipants[participant] = true;
	}
  }
  else if (whereToSearch == "directive")
	translatorInfoItem.directiveParticipants[participant] = true;
  else if (whereToSearch == "text")
	translatorInfoItem.textParticipants[participant] = true;
	
  // ===========================================================================
  // Retrieve all of the transDataValues
  // ===========================================================================

  if (translatorInfoItem[participant].translations[whereToSearch] == null)
  {
	translatorInfoItem[participant].translations[whereToSearch] = new Array();
	var translatorsArryItem = translatorInfoItem[participant].translations[whereToSearch];
	
	translatorsArryItem.type = transData.lookupTransValue(participant, translation, "translationType").toLowerCase();

	translatorsArryItem.beginMegaLock = (transData.lookupTransValue(participant, translation, "beginMegaLock").toLowerCase() == "true");
	translatorsArryItem.endMegaLock = (transData.lookupTransValue(participant, translation, "endMegaLock").toLowerCase() == "true");

/*
	if (participant == "DataListOpenTags")
	{
		alert("PARSE...\n" +
		participant + " " + whereToSearch + "\n" +
		"Begin: " + translatorsArryItem.beginMegaLock + "\n" +
		"End: " + translatorsArryItem.endMegaLock + "\n");
	}
*/

	translatorsArryItem.lockAttributes = transData.lookupTransValue(participant, translation, "lockAttributes");

	translatorsArryItem.openTag = transData.lookupTransValue(participant, translation, "openTag");
	
	translatorsArryItem.display = transData.lookupTransValue(participant, translation, "display");
	//For localization purposes: if display string is MM.LABEL_????, it's a global var (from Startup folder), so eval it.
	if (translatorsArryItem.display && translatorsArryItem.display.indexOf("MM.LABEL_")==0)
	  translatorsArryItem.display = eval(translatorsArryItem.display);
	
	translatorsArryItem.closeTag = transData.lookupTransValue(participant, translation, "closeTag");
	
	// Set translatorsArryItem.attributes to a array of name/value pairs
	// Set translatorsArryItem.data.attributes to a space-delimited list of values...?
	var attributes = "";
	var attributeArry = transData.lookupTransArray(participant, translation, "attributes");
	if (attributeArry && attributeArry.length)
	{
	  translatorsArryItem.attributes = new Array();
	  for (var k = 0; k < attributeArry.length; k++)
	  {
		translatorsArryItem.attributes[attributeArry[k]] =
		  dw.getExtDataValue(participant, "translator", "translations", translation, "attributes", attributeArry[k]);  
	  }
	  var quickAttributes = new QuickString();
	  for (var attributeName in translatorsArryItem.attributes)
	  {
		var attribute = translatorsArryItem.attributes[attributeName];
		if (attribute && attribute.length)
		  {
			quickAttributes.add(" ");
			quickAttributes.add(attribute);
		  }
	  }
	  attributes = quickAttributes.toString();
	}
	
	translatorsArryItem.insertBefore = transData.lookupTransValue(participant, translation, "insertBefore");
	translatorsArryItem.insertAfter = transData.lookupTransValue(participant, translation, "insertAfter");
	
	translatorsArryItem.data = new transData(participant,
											 translatorsArryItem.type,
											 translatorsArryItem.openTag,
											 translatorsArryItem.closeTag,
											 attributes,
											 translatorsArryItem.display,
											 translatorsArryItem.insertBefore,
											 translatorsArryItem.insertAfter,
											 translatorsArryItem.beginMegaLock,
											 translatorsArryItem.endMegaLock,
											 translatorsArryItem.lockAttributes);
  }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Function : transData_parse
// Purpose	: pulls values out of XML <translation> tag and creates a new transData
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function transData_copy(data)
{
  return new transData(data.participant, data.type,
					   data.openTag, data.closeTag,
					   data.attributes, data.display,
					   data.insertBefore, data.insertAfter,
					   data.beginMegaLock, data.endMegaLock,
					   data.lockAttributes);
}
