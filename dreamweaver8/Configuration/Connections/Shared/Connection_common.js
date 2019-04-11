// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

// *************** GLOBALS VARS *****************

var restrict_catalog, restrict_schema
var updateMode = false;

// ******************* API **********************

// Returns array of tokens which define a connection
// There is only 1 connection per file and 1 type
// of connection, so either it matches or it doesn't

function findConnectionParameters(text)
{
  if (text.length == 0)
    return null;

  //get searchPatterns
  var searchPatterns = new Array();
  var searchPattList = dw.getExtDataArray("connection_includefile", "searchPatterns");
  for (var i=0; searchPattList && i < searchPattList.length; i++)
  {
    if (searchPattList[i] != "whereToSearch")
    {
      var node = new Object();
      node.paramNames = dw.getExtDataValue("connection_includefile", "searchPatterns", searchPattList[i], "paramNames");
      node.isOptional = dw.getExtDataValue("connection_includefile", "searchPatterns", searchPattList[i], "isOptional");
      node.pattern = dw.getExtDataValue("connection_includefile", "searchPatterns", searchPattList[i]);
      node.match = '';
      searchPatterns.push(node);
    }
  }

  // Verify that there are patterns for searching
  if (searchPatterns.length == 0)
    return null;

  // Process each pattern
  var parameters = new Array();

  //Tries each pattern. If patterns exist and any 
  //patterns are not found, breaks and returns null.
  //Otherwise remembers position of last match (used for "nodeAttribute" insertLocation).
  for (var i=0; i < searchPatterns.length; i++)
  {
    // connection searchPatterns are always regular expressions
    var pattern = searchPatterns[i].pattern;
    if (pattern.length > 0)
    {
      pattern = eval(pattern);            //convert /string/ to regular expression
      var match = text.match(pattern);    //search for it as RegExp
      if (match)
      {
        //get the list of parameters to extract for this pattern
        var paramList = searchPatterns[i].paramNames.split(",");

        //now, extract the parameters from this pattern
        for (var j=0; j < paramList.length; j++)
        {
          var paramName = paramList[j];
          if (paramName)
            parameters[paramName] = (match.length > j+1) ? match[j+1] : "";
        }
      }
      else if (searchPatterns[i].isOptional != "true")
        return null;                      // exit point
    }
  }

  return parameters;
}

function ensureQuotesForStaticText(string)
{
  // If outer single- or double-quotes are not present,
  // and the string is static text, add double-quotes
  if (!(string[0] == '"' && string[string.length-1] == '"') &&
    !(string[0] == "'" && string[string.length-1] == "'"))
  {
    // Verify standard format, otherwise string is not static. This prevents
	// putting quotes around code starting or ending with variables or
	// functions (such as Server.MapPath())
    var matchResult = string.match(/[\w\s]+=[^'";]*/g);
    if (matchResult != null)
    {
      string2 = matchResult.join(';');

      //Join does not add the trailing semicolon...
      if (string[string.length-1] == ";")
      {
        string2 = string2 + ";";
      }

      if ((matchResult.length > 0) && (string2 == string))
        string = '"' + string + '"';
    }
  }

  return string;
}

function ensureQuotes(string)
{
  // If outer single- or double-quotes are not present,
  // and the string is static text, add double-quotes
  if ((string[0] == '"' && string[string.length-1] == '"') ||
    (string[0] == "'" && string[string.length-1] == "'"))
  {
    return string;
    
  } else if((string[0] != '"' && string[string.length-1] != '"') &&
    (string[0] != "'" && string[string.length-1] != "'"))
  {
	// check for neither trailing or leading quotes
	
	string = '"' + string + '"';
  
  } else {
  
	// Check for missing trailing dbl-quote
	if(string[0] == '"' && string[string.length-1] != '"')

		string = string + '"';
	
	// Check for missing leading dbl-quote
	else if(string[0] != '"' && string[string.length-1] == '"')

		string = '"' + string;

	// Check for missing trailing single-quote
	else if(string[0] == "'" && string[string.length-1] != "'")

		string = string + "'";
	
	// Check for missing leading single-quote
	else if(string[0] != "'" && string[string.length-1] == "'")

		string = "'" + string;

  }
  return string;
}