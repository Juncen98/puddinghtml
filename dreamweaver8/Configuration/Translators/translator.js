//SHARE-IN-MEMORY=true
// Copyright 2000, 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.


////////////////////////////////////////////////// Translator Class ///////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Function : translator::translator
// Purpose  : class which interfaces to the C-level translator support library
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function translator()
{
  // Members
   // begin for stored procedures
  this.translatorClass = "";
  this.translatorDOM = null;
  this.document = null;
  this.language = dw.getDocumentDOM().serverModel.getServerLanguage();
   //  end for stored procedures
  this.parser = TSL;

  // Whenever the parser restarts, the translator starts counting from position 0 again.
  // If the parser is restarted from somewhere other than the beginning of the document,
  // this adjustment is set first, so that we'll know where we are.  This number should
  // be added to each offset before it is passed to TSL.
  this.offsetAdj = 0;
}
  // methods
  translator.prototype.initiate     = translator_initiate;
  translator.prototype.terminate      = translator_terminate;
  translator.prototype.getTranslation   = translator_getTranslation;
  translator.prototype.translateDirective = translator_translateDirective;
  translator.prototype.translateText    = translator_translateText;
  translator.prototype.translateAttribute = translator_translateAttribute;
  translator.prototype.translateTag   = translator_translateTag;
  translator.prototype.insertTranslation = translator_insertTranslation;
  translator.prototype.resetPosition = translator_resetPosition;
  translator.prototype.getPosition = translator_getPosition;
  translator.prototype.getPreCode = translator_getPreCode;
  translator.prototype.previewMode = translator_previewMode;
  translator.prototype.getOutlineId = translator_getOutlineId;
  translator.prototype.setOutlineId = translator_setOutlineId;
  translator.prototype.setDecoration    = translator_setDecoration;
  translator.prototype.isPrepared     = translator_isPrepared;
  translator.prototype.isCallable     = translator_isCallable;
  translator.prototype.isObjectDeallocation = translator_isObjectDeallocation;
  translator.prototype.isInitialization = translator_isInitialization;
  translator.prototype.isAdvancedInitialization = translator_isAdvancedInitialization;
  translator.prototype.isRuntimeParam = translator_isRuntimeParam;
  translator.prototype.isDefaultAndRuntimeParam = translator_isDefaultAndRuntimeParam;
  translator.prototype.isASPInitialization = translator_isASPInitialization;
  
  translator.prototype.processSQL     = translator_processSQL;

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Function : translator_initiate
// Purpose  : initialize the translator
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function translator_initiate(inStr, translatorClass)
{
  this.document = inStr;
  this.parser.initiate(inStr, translatorClass);
  this.translatorClass = translatorClass;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Function : translator_terminate
// Purpose  : terminate the translator
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function translator_terminate()
{
  this.parser.terminate();
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Function : translator_getTranslation
// Purpose  : retreive the results of the translation process
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function translator_getTranslation()
{
  return this.parser.getTranslation();
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Function : translator_translateDirective
// Purpose  : apply translation rules to the specified directive
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function translator_translateDirective(code, offset, part, type, openTag, closeTag, attributes, display, lockAttributes)
{
  offset += this.offsetAdj;

  // begin for stored procedures
  if (part == "script") 
  {
    if (type.length == 0 && openTag.length == 0 && 
      closeTag.length == 0 && attributes.length==0 && display.length == 0)
    {
      if (this.translatorClass == "MM_ASPSCRIPT")
      {
        var translatedTag = this.isDefaultAndRuntimeParam(code);
        if (!translatedTag.length)
        {
          translatedTag = this.isRuntimeParam(code);
          if (!translatedTag.length)
          {
            translatedTag = this.isASPInitialization(code);
          }
        }
        if (translatedTag.length)
        {
          return this.parser.translateInitializationDirective(code, offset, translatedTag);
        }
        else
        {
          this.parser.translateUnrecognizedDirective(code, offset);
          return true;
        }
      }
      if (this.translatorClass == "MM_JSPSCRIPT")
      {
        var translatedTag = this.isPrepared(code, offset);
        if (translatedTag.length)
        {
          return this.parser.translatePreparedDirective(code, offset, translatedTag);
        }
        else
        {
          translatedTag = this.isCallable(code, offset);
          if (translatedTag.length)
          {
            return this.parser.translateCallableDirective(code, offset, translatedTag);
          }
          else
          {
            translatedTag = this.isObjectDeallocation(code, offset);
            if (translatedTag.length)
            {
              return this.parser.translateObjectDeallocationDirective(code, offset, translatedTag);
            }
            else
            {
              translatedTag = this.isAdvancedInitialization(code, offset);
              if (!translatedTag.length)
              {
                translatedTag = this.isInitialization(code);
              }
              if (translatedTag.length)
              {
                return this.parser.translateInitializationDirective(code, offset, translatedTag);
              }
            }
          }
        }
      }
    }
  }
  // end for stored procedures
  return this.parser.translateDirective(code, offset, part, type, openTag, closeTag, attributes, display, lockAttributes);
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Function : translator_translateText
// Purpose  : apply translation rules to the specified text span
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function translator_translateText(code, offset, part, type, openTag, closeTag, attributes, display, lockAttributes)
{
  offset += this.offsetAdj;
  return this.parser.translateText(code, offset, part, type, openTag, closeTag, attributes, display, lockAttributes);
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Function : translator_translateAttribute
// Purpose  : apply translation rules to the specified attribute
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function translator_translateAttribute(code, name, type, attributes)
{
  var success = true;
  if (type.length)
  {
    success = this.parser.translateAttribute(code, name, type, attributes);
  }
  return success;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Function : translator_translateTag
// Purpose  : apply translation rules to the specified directive
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function translator_translateTag(code, offset, part, type, openTag, closeTag, attributes, display, lockAttributes)
{
  offset += this.offsetAdj;

  return this.parser.translateTag(code, offset, part, type, openTag, closeTag, attributes, display, lockAttributes);
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Function : translator_insertTranslation
// Purpose  : insert "translation" into the translated doc in place of "code"
// ("translation" should already contain locks and stuff)
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function translator_insertTranslation(code, offset, translation)
{
  offset += this.offsetAdj;

  return this.parser.insertTranslation(code, offset, translation);
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Function : translator_resetPosition
// Purpose  : Reset m_curPos in the parser.  This lets us re-parse portions
// of the page.
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function translator_resetPosition(position)
{
  position += this.offsetAdj;
  this.parser.resetPosition(position);
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Function : translator_getPosition
// Purpose  : Get the current position in the document from the parser.
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function translator_getPosition()
{
  var position = this.parser.getPosition();
  return position - this.offsetAdj;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Function : translator_getPreCode(offset)
// Purpose  : Retrieves the section of the document between m_curPos and offset.  This provides a
//			  mechanism for retrieving the whitespace that happens before any scanSourceString
//			  callback.
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function translator_getPreCode(offset)
{
  offset += this.offsetAdj;
  return this.parser.getPreCode(offset);
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Function : translator_previewMode
// Purpose  : Sets m_previewMode in the translator.  This causes the translator
// to translate strings without locks and without appending them to the
// translated document (all translate functions just return strings without
// having side effects).
// Arguments: Use state = true to turn it on; state = false to turn it off.
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function translator_previewMode(state)
{
  this.parser.previewMode(state);
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Function : translator_getOutlineId
// Purpose  : grab the current outline ID from the translator
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function translator_getOutlineId()
{
  return this.parser.getOutlineId();
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Function : translator_setOutlineId
// Purpose  : set the current outline ID in the translator
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function translator_setOutlineId(outlineId)
{
  this.parser.setOutlineId(outlineId);
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Function : translator_setDecoration
// Purpose  : turn decoration on or off in the TSL
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function translator_setDecoration(decoration)
{
  this.parser.setDecoration(decoration);
}

function translator_isPrepared(tag, offset)
{
  var translatedTag = "";
  if (tag.indexOf("PreparedStatement") != -1)
  {
    var pattern = "[\\r\\n]+\\s*PreparedStatement\\s+(\\w+)\\s*=\\s*Conn(\\w+)\\.prepareStatement\\(([^;]+\\;)";
    var re = new RegExp(pattern, "gi");
    if (tag.search(re) != -1)
    {
      if (RegExp.$1 == RegExp.$2)
      {
        var name = RegExp.$1;
        var SQL = RegExp.$3;
        SQL = SQL.replace(/\s*\)\s*;/, "");
        var parameters = null;
        var parameterArray = this.processSQL(SQL);
        if (parameterArray && parameterArray.length)
        {
          parameters = parameterArray[0];
          SQL = parameterArray[1];
        }
        translatedTag = "\n<MM_PREPARED NAME=\"" + URLEncode(name) + "\" QUERY=\"" + URLEncode(SQL) + "\"";
        pattern = "(<%|[\\r\\n]+)\s*Driver\\s+Driver" + name + "\\s*=\\s*\\(\\s*Driver\\s*\\)Class.forName\\s*\\(([^\\)]+)\\).newInstance\\(\\s*\\)";
        re = new RegExp(pattern, "gi");
        var driver = "";
        var connectionName = "";
        var connectionUser = "";
        var connectionPwd = "";
        var queryTimeout = "";

        if (tag.search(re) != -1)
        {
          driver = RegExp.$2;
          translatedTag = translatedTag + " DRIVER=\"" + URLEncode(driver) + "\"";
        }
        pattern = "[\\r\\n]+\\s*Connection\\s+Conn" + name + "\\s*=\\s*DriverManager\\.getConnection\\(([^,]+),([^,]+),([^\\)]+)\\)";
        re = new RegExp(pattern, "gi");
        if (tag.search(re) != -1)
        {
          connectionName = RegExp.$1;
          connectionUser = RegExp.$2;
          connectionPwd = RegExp.$3;
          translatedTag = translatedTag + " CONNECTIONNAME=\"" + URLEncode(connectionName) + "\"";
          translatedTag = translatedTag + " CONNECTIONUSER=\"" + URLEncode(connectionUser) + "\"";
          translatedTag = translatedTag + " CONNECTIONPASSWORD=\"" + URLEncode(connectionPwd) + "\"";
        }
        pattern = "[\\r\\n]+\\s*" + name + "\\.setQueryTimeout\\(([^\\)]+)\\)";
        re = new RegExp(pattern, "gi");
        if (tag.search(re) != -1)
        {
          queryTimeout = RegExp.$1;
          translatedTag = translatedTag + " QUERYTIMEOUT=\"" + URLEncode(queryTimeout) + "\"";
        }
        translatedTag = translatedTag + ">";
        if (parameters)
        {
          translatedTag = translatedTag + parameters;
        }
        translatedTag = translatedTag + "\n</MM_PREPARED>\n";
      }
    }
  }

  return translatedTag;
}

function translator_isCallable(tag, offset)
{
  var translatedTag = "";
  if (tag.indexOf("CallableStatement") != -1)
  {
    var pattern = "[\\r\\n]+\\s*CallableStatement\\s+(\\w+)\\s*=\\s*Conn(\\w+)\\.prepareCall\\(\\s*(\"[^\"]+\")\\)";
    var re = new RegExp(pattern, "gi");
    if (tag.search(re) != -1)
    {
      if (RegExp.$1 == RegExp.$2)
      {
        var name = RegExp.$1;
        var stmt = RegExp.$3;
        translatedTag = "\n<MM_CALLABLE NAME=\"" + URLEncode(name) + "\" STATEMENT=\"" + URLEncode(stmt) + "\"";
        pattern = "(<%|[\\r\\n]+)\s*Driver\\s+Driver" + name + "\\s*=\\s*\\(\\s*Driver\\s*\\)Class.forName\\s*\\(([^\\)]+)\\).newInstance\\(\\s*\\)";
        re = new RegExp(pattern, "gi");
        if (tag.search(re) != -1)
        {
          driver = RegExp.$2;
          translatedTag = translatedTag + " DRIVER=\"" + URLEncode(driver) + "\"";
        }
        pattern = "[\\r\\n]+\\s*Connection\\s+Conn" + name + "\\s*=\\s*DriverManager\\.getConnection\\(([^,]+),([^,]+),([^\\)]+)\\)";
        re = new RegExp(pattern, "gi");
        if (tag.search(re) != -1)
        {
          connectionName = RegExp.$1;
          connectionUser = RegExp.$2;
          connectionPwd = RegExp.$3;
          translatedTag = translatedTag + " CONNECTIONNAME=\"" + URLEncode(connectionName) + "\"";
          translatedTag = translatedTag + " CONNECTIONUSER=\"" + URLEncode(connectionUser) + "\"";
          translatedTag = translatedTag + " CONNECTIONPASSWORD=\"" + URLEncode(connectionPwd) + "\"";
        }
        pattern = "[\\r\\n]+\\s*" + name + ".setQueryTimeout\\(([^\\)]+)\\)";
        re = new RegExp(pattern, "gi");
        if (tag.search(re) != -1)
        {
          queryTimeout = RegExp.$1;
          translatedTag = translatedTag + " QUERYTIMEOUT=\"" + URLEncode(queryTimeout) + "\"";
        }
        translatedTag = translatedTag + ">";
        var translation = "";
        pattern = "[\\r\\n]+\\s*" + name + ".setString\\(\\s*([0-9]+)\\s*,\\s*(" + name + "__\\w+)\\s*\\)";
        re = new RegExp(pattern, "gi");
        var array = tag.match(re);
        if (array && array.length)
        {
          for (var i = 0; i < array.length; i++)
          {
            var item = array[i];
            item.search(re);
            item = item.replace(re, "<MM_PARAMITEM DIRECTION=\"1\" INDEX=\"$1\" VALUE=\"" + URLEncode(RegExp.$2) + "\">\n");
            translation = translation + item;
          }
        }
        pattern = "[\\r\\n]+\\s*" + name + ".registerOutParameter\\(\\s*([0-9]+)\\s*,\\s*([^\\)]+)\\)";
        re = new RegExp(pattern, "gi");
        array = tag.match(re);
        if (array && array.length)
        {
          for (var i = 0; i < array.length; i++)
          {
            var item = array[i];
            item.search(re);
            item = item.replace(re, "<MM_PARAMITEM DIRECTION=\"0\" INDEX=\"$1\" VALUE=\"" + URLEncode(RegExp.$2) + "\">\n");
            translation = translation + item;
          }
        }
        if (translation.length)
        {
          translation = "\n<MM_PARAMETERS NAME=\"" + name + "\">\n" + translation + "</MM_PARAMETERS>";
          translatedTag = translatedTag + translation;
        }

        pattern = "[\\r\\n]+\\s*resultset\\s+(\\w+)\\s*=\\s*" + name + ".getresultset\\(\\s*\\)";
        re = new RegExp(pattern, "gi");
        if (tag.search(re) != -1)
        {
          resultset = RegExp.$1;
          translatedTag = translatedTag + "\n<MM_CALLRESSET NAME=\"" + URLEncode(resultset) + "\">";
        }
        else
        {
          translatedTag = translatedTag + "\n<MM_CALL>";
        }
        pattern = "[\\r\\n]+\\s*resultset\\s+(\\w+)\\s*=\\s*\\(resultset\\)\\s*" + name + ".getObject";
        re = new RegExp(pattern, "gi");
        if (tag.search(re) != -1)
        {
          resultset = RegExp.$1;
          translatedTag = translatedTag + "\n<MM_CALLRESSET NAME=\"" + URLEncode(resultset) + "\">";
        }
        else
        {
          translatedTag = translatedTag + "\n<MM_CALL>";
        }
        translatedTag = translatedTag + "\n</MM_CALLABLE>\n";
      }
    }
  }

  return translatedTag;
}

function translator_isObjectDeallocation(tag, offset)
{
  var translatedTag = "";
  if (tag.indexOf(".close") != -1)
  {
    var pattern = "(\\w+)\\.close\\(\\s*\\)";
    var re = new RegExp(pattern, "i");
    if (tag.search(re) != -1)
    {
      var name = RegExp.$1;
      pattern = "Resultset\\s+" + name + "\\s*=\\s*Statement" + name + "\\.executeQuery\\(\\s*\\)";
      re = new RegExp(pattern, "i");
      var index = this.document.search(re);
      if ((index != -1) && (index < offset))
      {
        translatedTag = "\n<MM_RESULTSETCLOSE NAME=\"" + URLEncode(name) + "\">\n";
      }
      else
      {
        pattern = "PreparedStatement\\s+\\w+\\s*=\\s*" + name + "\\.prepareStatement\\(([^\\)]+)\\)";
        re = new RegExp(pattern, "i");
        index = this.document.search(re);
        if ((index != -1) && (index < offset))
        {
          translatedTag = "\n<MM_PREPAREDCLOSE NAME=\"" + URLEncode(name) + "\">\n";
        }
        else
        {
          pattern = "CallableStatement\\s+\\w+\\s*=\\s*" + name + "\\.prepareCall\\(\\s*(\"[^\"]+\")\\)";
          re = new RegExp(pattern, "i");
          index = this.document.search(re);
          if ((index != -1) && (index < offset))
          {
            translatedTag = "\n<MM_CALLABLECLOSE NAME=\"" + URLEncode(name) + "\">\n";
          }
        }
      }
    }
  }

  return translatedTag;
}

function translator_isInitialization(tag)
{
  var translatedTag = "";
  if (tag.indexOf("__") != -1)
  {
    var pattern = "[a-z]+\\s*(\\w+)__(\\w+)\\s*=\\s*([^;]+)";
    // regular expression for initialization blocks other than command and repeated regions
    var re = new RegExp(pattern, "gi");
    if (tag.search(re) != -1)
    {
      var name = RegExp.$1;
      var translation = "";
      var array = tag.match(re);
      if (array && array.length)
      {
        for (var i = 0; i < array.length; i++)
        {
          var item = array[i];
          item.search(re);
          item = item.replace(re, "<MM_VARITEM NAME=\"$1__$2\" VALUE=\"" + URLEncode(RegExp.$3) + "\">\n");
          if (RegExp.$1 == name)
          {
            translation = translation + item;
          }
        }
        if (translation.length)
        {
          translation = "\n<MM_VARIABLES NAME=\"" + name + "\">\n" + translation + "</MM_VARIABLES>\n";
          translatedTag = translation;
        }
      }
    }
  }

  return translatedTag;
}

function translator_isAdvancedInitialization(tag)
{
  var translatedTag = "";
  if (tag.indexOf("__") != -1)
  {
    var pattern = "[a-z]+\\s+(\\w+)__(\\w+)\\s*=\\s*([^;]+);\\s*if\\s*\\(([^!]+)!=\\s*null\\s*\\)\\s*\\{?\\s*(\\w+)__(\\w+)\\s*=\\s*\\(String\\)\\s*([^;]+);\\s*\\}?";
    // regular expression for repeated region initialization
    var re = new RegExp(pattern, "gi");
    if (tag.search(re) != -1)
    {
      var name = RegExp.$1;
      var translation = "";
      var array = tag.match(re);
      if (array && array.length)
      {
        for (var i = 0; i < array.length; i++)
        {
          var item = array[i];
          item.search(re);
          item = item.replace(re, "<MM_VARITEM NAME=\"$1__$2\" VALUE=\"" + URLEncode(RegExp.$3) + "\"");
          if ((RegExp.$1 == name) && (RegExp.$5 == name)  && (RegExp.$6 == RegExp.$2))
          {
            var RunTime = "";
            var Expression1 = RegExp.$4;
            var Expression2 = RegExp.$7;
            if (Expression1 != Expression2)
            {
              var ch = ' ';
              // There must be a better way to remove trailing whitespace - LLT
              while ((Expression1.length > 0) && (((ch = Expression1.charAt(Expression1.length-1)) == ' ') || (ch == '\t')))
              {
                Expression1 = Expression1.substr(0, Expression1.length - 1);
              }
              while ((Expression2.length > 0) && (((ch = Expression2.charAt(Expression2.length-1)) == ' ') || (ch == '\t')))
              {
                Expression2 = Expression2.substr(0, Expression2.length - 1);
              }
            }
            if (Expression1 == Expression2)
            {
              RunTime = " RUNTIME=\"" + URLEncode(Expression1) + "\"";
            }
            translation = translation + item + RunTime + ">\n";
          }
        }
        if (translation.length)
        {
          translation = "\n<MM_VARIABLES NAME=\"" + name + "\">\n" + translation + "</MM_VARIABLES>\n";
          translatedTag = translation;
        }
      }
    }
  }

  return translatedTag;
}

function translator_processSQL(SQL)
{
  var parameterArray = new Array(2);
  var parameters = "";
  var pattern = "\"\\s*\\+\\s*(\\w+__)(\\w+)\\s*\\+\\s*\"";
  var re = new RegExp(pattern, "i");
  var index = SQL.search(re);
  while (index != -1)
  {
    parameters = parameters + "\n<MM_PARAMETER NAME=\"" + RegExp.$1 + RegExp.$2 + "\">";
    SQL = SQL.replace(re, "$2\" + \"");
    index = SQL.search(re);
  }
  pattern = "\"\\s*\\+\\s*\"";
  re = new RegExp(pattern, "i");
  index = SQL.search(re);
  while (index != -1)
  {
    SQL = SQL.replace(re, "");
    index = SQL.search(re);
  }
  parameterArray[0] = parameters;
  parameterArray[1] = SQL;

  return parameterArray;
}

function translator_isASPInitialization(tag)
{
  var translatedTag = "";
  if (tag.indexOf("__") != -1)
  {
    var pattern = "";
    if (this.language == "VBScript")
    {
      pattern = "Dim (\\w+)__(\\w+)\\s+(\\w+)__(\\w+)\\s*=\\s*([^\\r\\n]+)";
    }
    else
    {
      pattern = "var (\\w+)__(\\w+)\\s*=\\s*([^;\\r\\n]+)";
    }
    var match = 0;
    // regular expression for initialization blocks other than command and repeated regions
    var re = new RegExp(pattern, "gi");
    if (tag.search(re) != -1)
    {
      var name = RegExp.$1;
      var translation = "";
      var array = tag.match(re);
      if (array.length)
      {
        for (var i = 0; i < array.length; i++)
        {
          var item = array[i];
          if (this.language == "VBScript")
          {
            item = item.replace(re, "<MM_VARITEM NAME=$1__$2 VALUE=$5>\n");
            if ((RegExp.$1 == name) && (RegExp.$3 == name) && (RegExp.$2 == RegExp.$4))
            {
              translation = translation + item;
            }
          }
          else
          {
            item = item.replace(re, "<MM_VARITEM NAME=$1__$2 VALUE=$3>\n");
            if (RegExp.$1 == name)
            {
              translation = translation + item;
            }
          }
        }
        if (translation.length)
        {
          translation = "\n<MM_VARIABLES NAME=" + name + ">\n" + translation + "</MM_VARIABLES>\n";
          translatedTag = translation;
        }
      }
    }
  }

  return translatedTag;
}

function translator_isDefaultAndRuntimeParam(tag)
{
  var translatedTag = "";
  if (tag.indexOf("__") != -1)
  {
    var pattern = "";
    if (this.language == "VBScript")
    {
      pattern = "Dim\\s+(\\w+)__(\\w+)\\s+(\\w+)__(\\w+)\\s*=\\s*([^\\r\\n]+)\\s+if\\s*\\(([^<]+)<>\\s*\"\"\\s*\\)\\s*then\\s*(\\w+)__(\\w+)\\s*=\\s*([^\\r\\n]+)";
    }
    else
    {   
      pattern = "var\\s+(\\w+)__(\\w+)\\s*=\\s*([^;]+);\\s*if\\s*\\(String\\(([^!]+)\\s*!=\\s*\"undefined\"\\s*\\&&\\s*String\\(([^!]+)\\s*!=\\s*\"\"\\)\\s*\\{\\s*(\\w+)__(\\w+)\\s*=\\s*String\\(([^;]+)\\)\\s*;\\s*\\}";
    }
    // regular expression for repeated region initialization
    var re = new RegExp(pattern, "gi");

    //we changed the reg-exp in Rockford for getting ...use the old reg-exp to catch the old cases
    var searchIndex = tag.search(re);
    if (searchIndex == -1)
    {
      if (this.language != "VBScript") //JavaScript
      {
        //use the old search expression i.e UltraDev 4.0
        pattern = "var\\s+(\\w+)__(\\w+)\\s*=\\s*([^;]+);\\s*if\\s*\\(String\\(([^!]+)!=\\s*\"undefined\"\\s*\\)\\s*\\{\\s*(\\w+)__(\\w+)\\s*=\\s*String\\(([^;]+)\\)\\s*;\\s*\\}";
        re = new RegExp(pattern, "gi");
        searchIndex = tag.search(re);
      }
    }
    if (searchIndex != -1)
    {
      var name = RegExp.$1;
      var translation = "";
      var array = tag.match(re);
      if (array.length)
      {
        for (var i = 0; i < array.length; i++)
        {
          var item = array[i];
          if (this.language == "VBScript")
          {
            item.search(re);  // Need to do search for URLEncode(RegExp.$5) expression below - LLT 1/6/00
            item = item.replace(re, "<MM_VARITEM NAME=$1__$2 VALUE=\"" + URLEncode(RegExp.$5) + "\"");
            if ((RegExp.$1 == name) && (RegExp.$3 == name) && (RegExp.$7 == name) && (RegExp.$2 == RegExp.$4) && (RegExp.$2 == RegExp.$8))
            {
              var Runtime = "";
              var Expression1 = RegExp.$6;
              var Expression2 = RegExp.$9;
              Expression1 = dwscripts.trim(Expression1);
              Expression2 = dwscripts.trim(Expression2);
              if (Expression1 == Expression2)
              {
                Runtime = " RUNTIME=\"" + URLEncode(Expression1) + "\"";
              }
              translation = translation + item + Runtime + ">\n";
            }
          }
          else
          {
            item.search(re);  // Need to do search for URLEncode(RegExp.$3) expression below - LLT 1/6/00
            item = item.replace(re, "<MM_VARITEM NAME=$1__$2 VALUE=\"" + URLEncode(RegExp.$3) + "\"");
            if ((RegExp.$1 == name) && (RegExp.$5 == name)  && (RegExp.$6 == RegExp.$2))
            {
              var Runtime = "";
              var Expression1 = RegExp.$4;
              var Expression2 = RegExp.$7;
              Expression1 = dwscripts.trim(Expression1);
              Expression2 = dwscripts.trim(Expression2);
              // remove closing paren in String(expr) and then remove trailing white
              Expression1 = dwscripts.trim(Expression1.substr(0, Expression1.length - 1));
              if (Expression1 == Expression2)
              {
                Runtime = " RUNTIME=\"" + URLEncode(Expression1) + "\"";
              }
              translation = translation + item + Runtime + ">\n";
            }
          }
        }
        if (translation.length)
        {
          translation = "\n<MM_VARIABLES NAME=" + name + ">\n" + translation + "</MM_VARIABLES>\n";
          translatedTag = translation;
        }
      }
    }
  }
  return translatedTag;
}

function translator_isRuntimeParam(tag)
{
  var translatedTag = "";
  if (tag.indexOf("__") != -1)
  {
    var pattern = "";
    if (this.language == "VBScript")
    {
      pattern = "\\bif\\s*\\(([^<]+)\\s*<>\\s*\"\"\\s*\\)\\s*then\\s*(\\w+)__(\\w+)\\s*=\\s*([^\\r\\n]+)";
    }
    else
    {
      pattern = "\\bif\\s*\\(String\\(([^!]+)!=\\s*\"undefined\"\\s*\\)\\s*\\{\\s*(\\w+)__(\\w+)\\s*=\\s*String\\(([^;]+)\\)\\s*;\\s*\\}";
    }
    var match = 0;
    // regular expression for repeated region initialization
    var re = new RegExp(pattern, "gi");
    if (tag.search(re) != -1)
    {
      var name = RegExp.$2;
      var translation = "";
      var array = tag.match(re);
      if (array.length)
      {
        for (var i = 0; i < array.length; i++)
        {
          var item = array[i];
          if (this.language == "VBScript")
          {
            item.search(re);
            item = item.replace(re, "<MM_VARITEM NAME=$2__$3 VALUE=\"\"");
            if (RegExp.$2 == name)
            {
              var Runtime = "";
              var Expression1 = RegExp.$1;
              var Expression2 = RegExp.$4;
              Expression1 = dwscripts.trim(Expression1);
              Expression2 = dwscripts.trim(Expression2);
              if (Expression1 == Expression2)
              {
                RunTime = " RUNTIME=\"" + URLEncode(Expression1) + "\"";
              }
              translation = translation + item + RunTime + ">\n";
            }
          }
          else
          {
            item.search(re);
            item = item.replace(re, "<MM_VARITEM NAME=$2__$3 VALUE=\"\"");
            if (RegExp.$2 == name)
            {
              var RunTime = "";
              var Expression1 = RegExp.$1;
              var Expression2 = RegExp.$4;
              Expression1 = dwscripts.trim(Expression1);
              Expression2 = dwscripts.trim(Expression2);
              // remove closing paren in String(expr) and then remove trailing white
              Expression1 = dwscripts.trim(Expression1.substr(0, Expression1.length - 1));
              if (Expression1 == Expression2)
              {
                RunTime = " RUNTIME=\"" + URLEncode(Expression1) + "\"";
              }
              translation = translation + item + RunTime + ">\n";
            }
          }
        }
        if (translation.length)
        {
          translation = "\n<MM_VARIABLES NAME=" + name + ">\n" + translation + "</MM_VARIABLES>\n";
          translatedTag = translation;
        }
      }
    }
  }

  return translatedTag;
}

// belongs in helper.js
function URLEncode(str)
{
  re1 = /"/g;
  re2 = /</g;
  re3 = />/g;
  re4 = /%/g;
  str = str.replace(re4, "\%25");
  str = str.replace(re1, "%22");
  str = str.replace(re2, "%3C");
  str = str.replace(re3, "%3E");

  return str;
}
