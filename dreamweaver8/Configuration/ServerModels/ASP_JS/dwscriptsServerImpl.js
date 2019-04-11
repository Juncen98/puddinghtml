// Copyright 2002, 2003, 2004 Macromedia, Inc. All rights reserved.

// *************** GLOBALS VARS *****************

// ***************** LOCAL FUNCTIONS  ******************

//--------------------------------------------------------------------
// FUNCTION:
//   queueDefaultDocEdits
//
// DESCRIPTION:
//   This function is called before the docEdits are applied to the
//   page to allow any default doc edits to be added.  We will add
//   the VBSCRIPT language tag.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function queueDefaultDocEdits()
{
  var partList = dw.getParticipants("PageDirective_lang");
  if (!partList || partList.length == 0)  // does not currently exist
  {
    // HACK: For some reason, the PageDirective_lang participant will
    //       sometimes not be found, even though it exists on the page.
    //       This code checks to make sure that the language tag
    //       is *really* not on the page, before trying to add it again.
    
    var found = false;
    var dom = dw.getDocumentDOM();
    if (dom)
    {
      var docStr = dom.documentElement.outerHTML;
      var endSearch = -1;
      var pageDirectiveStart = -1;
      var startSearch = docStr.indexOf('<%');
      if (startSearch > -1)
        endSearch = docStr.indexOf('%>');
        
      if (startSearch > -1 && endSearch > 0){
        pageDirectiveStart = docStr.substring(startSearch,endSearch).search( /@LANGUAGE=/i );
      }

      if( pageDirectiveStart > -1 )
      {
        found = true;
        var node = dom.offsetsToNode(pageDirectiveStart,pageDirectiveStart);
        if (node)
        {
          dwscripts.queueParticipantInfo("PageDirective_lang", node);
        }
      }
    }
    
    if (!found)
    {
      var paramObj = new Object();
      paramObj.Language = "JAVASCRIPT";
      dwscripts.queueDocEditsForParticipant("PageDirective_lang",paramObj);
    }
    
  }
  else
  {
    dwscripts.queueParticipantInfo("PageDirective_lang", partList[0].participantNode);
  }
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
  expression = expression.toString();

  if (hasServerMarkup(expression))
  {
    retVal = trimServerMarkup(expression);
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
      retVal = "<%= " + expression + " %>";
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
  return (expression.indexOf("<%") != -1 && expression.indexOf("%>") != -1);
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

  if (retVal.length)
  {
    var begininlineindex = retVal.indexOf("<%=");
    var endinlineindex  =  retVal.indexOf("%>");
    if ((begininlineindex != -1) && (endinlineindex!=-1))
    {
      retVal = retVal.substring(begininlineindex+3, endinlineindex);
    }
    else
    {
      var begininlineindex = retVal.indexOf("<%");
      var endinlineindex  =  retVal.indexOf("%>");
      if ((begininlineindex != -1) && (endinlineindex!=-1))
      {
        retVal = retVal.substring(begininlineindex+3, endinlineindex);
      }
    }

    retVal = dwscripts.trim(retVal);
  }

  return retVal;
}






////////////////////////////////////////////////////////////////////////////////
//These are some helper functions used by SSI infrastructure and not
//part of the Server API.
////////////////////////////////////////////////////////////////////////////////

//--------------------------------------------------------------------
// FUNCTION:
//   getRecordsetNames
//
// DESCRIPTION:
//   Returns a list of all recordset names on the page.
//
// ARGUMENTS:
//   dontIncludeStoredProcRS - boolean (optional). 'true' if should not
//     include recordsets returned from stored procedures. defaults to
//     'false'.
//
// RETURNS:
//   array of strings
//--------------------------------------------------------------------

function getRecordsetNames(dontIncludeStoredProcRS)
{
  if (!dontIncludeStoredProcRS) dontIncludeStoredProcRS = false;
  
  var nameList = new Array();
  var currentdom = dreamweaver.getDocumentDOM();

  if (currentdom)
  {
    var nodes = currentdom.getElementsByTagName("MM_RECORDSET");
    for (var index =0 ; index < nodes.length ; index++)
    {
      var node = nodes.item(index);
      if (node)
      {
        nameList.push(node.getAttribute("NAME"));
      }
    }

    if (!dontIncludeStoredProcRS)
    {
      var nodes = currentdom.getElementsByTagName("MM_CMDRECSET");
      for (var index =0 ; index < nodes.length ; index++)
      {
        var node = nodes.item(index);
        if (node)
        {
          nameList.push(node.getAttribute("NAME"));
        }
      }
    }
  }

  return nameList;
}


//--------------------------------------------------------------------
// FUNCTION:
//   getRepeatedRegionNames
//
// DESCRIPTION:
//   Returns a list of all repeated region names on the page.
//
// ARGUMENTS:
//   None
//
// RETURNS:
//   array of strings
//--------------------------------------------------------------------

function getRepeatedRegionNames()
{
  var nameList = new Array();
  var currentdom = dreamweaver.getDocumentDOM();

  if (currentdom)
  {
    var nodes = currentdom.getElementsByTagName("MM_REPEATEDREGION");
    for (var index =0 ; index < nodes.length ; index++)
    {
      var node = nodes.item(index);
      if (node)
      {
        nameList.push(node.getAttribute("NAME"));
      }
    }
  }
  return nameList;
}


//--------------------------------------------------------------------
// FUNCTION:
//   findSourceNode
//
// DESCRIPTION:
//   Returns a data source name by name.
//
// ARGUMENTS:
//   elementName - string - the name of the data source
//
// RETURNS:
//   DOM node pointer
//--------------------------------------------------------------------

function findSourceNode(elementName)
{
  var foundnode = null;
  var currentdom = dreamweaver.getDocumentDOM();

  if (currentdom)
  {
    var nodes = currentdom.getElementsByTagName("MM_RECORDSET");
    for (var index =0 ; index < nodes.length ; index++)
    {
      var node = nodes.item(index);
      if (node)
      {
        if(node.getAttribute("NAME") == elementName)
        {
          foundnode = node;
        }
      }
    }

    if (!foundnode)
    {
      var nodes = currentdom.getElementsByTagName("MM_COMMAND");
      for (var index =0 ; index < nodes.length ; index++)
      {
        var node = nodes.item(index);
        if (node)
        {
          if(node.getAttribute("NAME") == elementName)
          {
            foundnode = node;
          }
        }
      }
    }

    if (!foundnode)
    {
      var nodes = currentdom.getElementsByTagName("MM_CMDRECSET");
      for (var index =0 ; index < nodes.length ; index++)
      {
        var node = nodes.item(index);
        if (node)
        {
          if(node.getAttribute("NAME") == elementName)
          {
            foundnode = node;
          }
        }
      }
    }
  }

  return foundnode;
}


//--------------------------------------------------------------------
// FUNCTION:
//   getColumnNames
//
// DESCRIPTION:
//   Returns the column names for the given recordset.
//   If rs is not specified the column names for the first recordset
//   are returned.
//
// ARGUMENTS:
//   rs - string - optional - the name of a data source
//
// RETURNS:
//   array of strings
//--------------------------------------------------------------------

function getColumnNames(rs)
{
  var rsDOM, nameList = new Array();

  dataSourceNode = findSourceNode(rs);

  if (dataSourceNode && dataSourceNode.tagName == "MM_RECORDSET")
  {
    var rsDOM = dreamweaver.getDocumentDOM(dreamweaver.getConfigurationPath() + "/DataSources/ASP_JS/Recordset.htm");
  }
  else if (dataSourceNode && dataSourceNode.tagName == "MM_CMDRECSET")
  {
    var rsDOM = dreamweaver.getDocumentDOM(dreamweaver.getConfigurationPath() + "/DataSources/ASP_JS/Command.htm");
  }

  if (rsDOM)
  {
      nameList = rsDOM.parentWindow.generateDynamicSourceBindings(rs);
  }

  return nameList;
}

