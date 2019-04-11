// Copyright 2005 Macromedia, Inc. All rights reserved.

// *************** GLOBALS VARS *****************

// ***************** LOCAL FUNCTIONS  ******************

//--------------------------------------------------------------------
// FUNCTION:
//   queueDefaultDocEdits
//
// DESCRIPTION:
//   This function is called before the docEdits are applied to the
//   page to allow any default doc edits to be added.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function queueDefaultDocEdits()
{
}


//--------------------------------------------------------------------
// FUNCTION:
//   encodeDynamicExpression
//
// DESCRIPTION:
//   This function prepares a dynamic expression for insertion onto
//   the page.  It is assumed that this expression will be used
//   within a larger dynamic statement, therefore all server markup
//   is stripped.
//
// ARGUMENTS:
//   expression - string - the dyanmic expression to encode
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function encodeDynamicExpression(expression)
{
  var retVal = "";
  if (expression == null)
  {
    return retVal;
  }
  expression = expression.toString();

  if (hasServerMarkup(expression))
  {
    retVal = trimServerMarkup(expression, true);
  }
  else
  {
    var parameters = expression.match(/(true|false|[-]?\d+[\.]?\d*)/);
    if (parameters && parameters[0].length == expression.length) // matches, return exact
    {
      retVal = expression;
    }
    else
    {
      if (!dwscripts.isQuoted(expression))
      {
        retVal = "\"" + dwscripts.escQuotes(expression) + "\"";
      }
      else
      {
        retVal = expression;
      }
    }
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   decodeDynamicExpression
//
// DESCRIPTION:
//   This function prepares a dynamic expression for display within
//   a dialog box.  Quotes are removed,a nd server markup is re-added.
//
// ARGUMENTS:
//   expression - string - the dynamic expression to prepare for display
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function decodeDynamicExpression(expression)
{
  var retVal = "";

  expression = dwscripts.trim(expression.toString());
  var unquoted = dwscripts.trimQuotes(expression);

  var parameters = unquoted.match(/(true|false|[-]?\d+[\.]?\d*)/);
  if (parameters && parameters[0].length == unquoted.length) // matches, return exact
  {
    retVal = expression;
  }
  else
  {
    if (dwscripts.isQuoted(expression))
    {
      retVal = dwscripts.unescQuotes(unquoted);
    }
    else
    {
      retVal = expression;
    }
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   hasServerMarkup
//
// DESCRIPTION:
//   This function returns true if the given expression contains
//   server markup.
//
// ARGUMENTS:
//   expression - string - the expression to test for server markup
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function hasServerMarkup(expression)
{
  expression = expression.toString();
  return (expression.indexOf("<xsl:") != -1);
}


//--------------------------------------------------------------------
// FUNCTION:
//   trimServerMarkup
//
// DESCRIPTION:
//   This function returns the given expression with any server markup
//   removed.
//
// ARGUMENTS:
//   expression - string - the expression to remove server markup from
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function trimServerMarkup(expression)
{
  var retVal = expression.toString();

alert("trimServerMarkup\n" + retVal);
  // Look for: <xsl:value-of.../>, <xsl:for-each>...</xsl:for-each>, <xsl:if>...</xsl:if> and <xsl:choose>...</xsl:choose>

  if (retVal.length)
  {
    var begininlineindex = retVal.indexOf("<xsl:value-of");
    var endinlineindex  =  retVal.indexOf("/>");

    if ((begininlineindex != -1) && (endinlineindex!=-1))
    {
      retVal = retVal.substring(begininlineindex+13, endinlineindex);
    }
    else
    {
      begininlineindex = retVal.indexOf("<xsl:for-each");
      endinlineindex = retVal.indexOf("</xsl:for-each>");

      if ((begininlineindex != -1) && (endinlineindex!=-1))
      {
        retVal = retVal.substring(begininlineindex+13, endinlineindex);
      }
      else
      {
        begininlineindex = retVal.indexOf("<xsl:if");
        endinlineindex = retVal.indexOf("</xsl:if>");

        if ((begininlineindex != -1) && (endinlineindex!=-1))
        {
          retVal = retVal.substring(begininlineindex+7, endinlineindex);
        }
        else
        {
          begininlineindex = retVal.indexOf("<xsl:choose>");
          endinlineindex = retVal.indexOf("</xsl:choose>");

          if ((begininlineindex != -1) && (endinlineindex!=-1))
          {
            retVal = retVal.substring(begininlineindex+12, endinlineindex);
          }
        }
      }
    }

    retVal = dwscripts.trim(retVal);

    // now look for the select attribute in the string

    var beginindex = retVal.indexOf("select=\"");

    if (beginindex != -1)
    {
      retVal = retVal.substring(beginindex+8);
    }
    else
    {
      beginindex = retVal.indexOf("test=\"");
      
      if (beginindex != -1)
      {
        retVal = retVal.substring(beginindex+6);
      }
      else
      {
        // must be in a <xsl:choose> tag
      }
    }

    // strip everything from the first "\"" to the end of the string
    var endindex = retVal.indexOf("\"");
    if (retVal.length > 0 && endindex != -1)
    {
      retVal = retVal.substring(0, endindex);
    }

    retVal = dwscripts.trim(retVal);
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   isValidServerVarName
//
// DESCRIPTION:
//   Returns true if the given variable name is legal
//
// ARGUMENTS:
//   theVarName - string - variable to check
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function isValidServerVarName(theVarName)
{
  var retVal = true;

  var parts = theVarName.split(".");

  for (var i=0; i < parts.length; i++)
  {
    if (!dwscripts.isValidVarName(parts[i]))
    {
      retVal = false;
      break;
    }
  }

  return retVal;
}