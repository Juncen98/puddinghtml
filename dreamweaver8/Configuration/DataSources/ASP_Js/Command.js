// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.
var command_filename = "SP_D.gif"
var command_rs_filename = "RS_D.gif"
var datasourceleaf_filename = "DSL_D.gif"


function addDynamicSource()
{
  dw.popupServerBehavior("Command.htm");
}

function findDynamicSources()
{
  var DSL = new Array();
  var currentdom = dreamweaver.getDocumentDOM();

  if (currentdom) {

    var nodes = currentdom.getElementsByTagName("MM_COMMAND");
    for (var index =0 ; index < nodes.length ; index++)
    {
      var node = nodes.item(index);
      if (node)
      {
        //DSL[DSL.length] = node.getAttribute("NAME");
        ssRec = findSSrec(node,"command");
        if (ssRec && (ssRec.commandtype == 4)) 
        {
          if (ssRec.recordset)
          {
            DSL[DSL.length] = new ObjectInfo(ssRec.title, command_filename, true, "Recordset.htm",ssRec.recordset);
          }
          else
          {
            DSL[DSL.length] = new ObjectInfo(ssRec.title, command_filename, true, "Command.htm","");
          }

        }
      }
    }
  }

  return DSL;
}

////////////////////////////////////////////////////////////////////////////////
//  Function: generateDynamicSourceBindings()
//
//  Returns a list of bindings for elementNode on the page.
////////////////////////////////////////////////////////////////////////////////
function generateDynamicSourceBindings(elementName)
{
  ssRec = findSSrecByTitle(elementName,"command")

  if (ssRec) {
    elementNode = ssRec.selectedNode;
  } else {
    elementNode = findSourceNode(elementName);
  }


  var BindingsArray = new Array();
  var outArray;

  if (elementNode) 
  {
    var comDom = dreamweaver.getDocumentDOM(dreamweaver.getConfigurationPath() + "/ServerBehaviors/ASP_JS/Command.htm")
    if(elementNode.tagName == "MM_COMMAND")
    {
      CachedParametersArray  = getCachedParametersArray(elementNode.getAttribute("NAME"));

      if (CachedParametersArray .length)
      {
        //we use +3 since our Parameter has name,type,direction
        for (var j=0; j < CachedParametersArray .length ; j+=3)
        {
          var dir = CachedParametersArray[j+1];
          if (dir == 4 || dir == 2 || dir == 3)
          {
             BindingsArray.push(CachedParametersArray[j]);
          }
        }
      }
      else
      {
        BindingsArray = comDom.parentWindow.getDynamicBindings(elementNode)
        var ss = findSSrec(elementNode, "command")
        if (ss)
        {
          var CachedParameterString = MMDB.getSPParamsAsString(ss.connectionName,ss.commandText);
          SaveParametersForCache(elementNode.getAttribute("NAME"),CachedParameterString);
        }
      }

      var rnode = GetRecordsetNodeForCommand(elementNode)
      if (rnode) 
      {
        CachedCTArray  = getCachedColumnAndTypeArray(rnode.getAttribute("NAME"));
        if (CachedCTArray.length)
        {
          for (var j=0; j < CachedCTArray.length ; j+=2)
          {
            BindingsArray.push(rnode.getAttribute("NAME") + "." + CachedCTArray[j]);
          }
        }
        else
        {
          var colArray = new Array();
          colArray = comDom.parentWindow.getDynamicBindings(rnode)
          SaveColumnAndTypeArrayForCache(rnode.getAttribute("NAME"),colArray);
          for (var cvar=0;cvar < colArray.length ;cvar+=2) 
          {
            BindingsArray.push(rnode.getAttribute("NAME") + "." + colArray[cvar]);
          }
        }
        BindingsArray.push(rnode.getAttribute("NAME") + "."+ MM.LABEL_FirstRecordIndex);
        BindingsArray.push(rnode.getAttribute("NAME") + "."+ MM.LABEL_LastRecordIndex);
        BindingsArray.push(rnode.getAttribute("NAME") + "."+ MM.LABEL_TotalRecordIndex);
      }

      outArray = GenerateObjectInfoForSourceBindings(BindingsArray, datasourceleaf_filename, "Command");
    }
    else if(elementNode.tagName == "MM_CMDRECSET")
    {
      CachedCTArray  = getCachedColumnAndTypeArray(elementNode.getAttribute("NAME"));
      if (CachedCTArray.length)
      {
        for (var j=0; j < CachedCTArray.length ; j+=2)
        {
          BindingsArray.push(CachedCTArray[j]);
        }
      }
      else
      {
        var colArray = new Array();
        colArray = comDom.parentWindow.getDynamicBindings(elementNode)
        SaveColumnAndTypeArrayForCache(elementNode.getAttribute("NAME"),colArray);
        for (var cvar=0;cvar < colArray.length ;cvar+=2) 
        {
          BindingsArray.push(colArray[cvar]);
        }
      }

      BindingsArray.push(MM.LABEL_FirstRecordIndex);
      BindingsArray.push(MM.LABEL_LastRecordIndex);
      BindingsArray.push(MM.LABEL_TotalRecordIndex);
      outArray = GenerateObjectInfoForSourceBindings(BindingsArray, datasourceleaf_filename, "Command");
    }
  }
    
  return outArray;
}


////////////////////////////////////////////////////////////////////////////////
//
//  Function: generateDynamicDataRef
//
//  Returns a dynamic binding string.
////////////////////////////////////////////////////////////////////////////////
function generateDynamicDataRef(elementName,bindingName,dropObject)
{
  var retStr="";

  var tokenindex = bindingName.indexOf(".");
  if (tokenindex != -1) 
  {
    elementName = bindingName.substring(0,tokenindex);
    bindingName = bindingName.substring(tokenindex+1);
  }

  ssRec = findSSrecByTitle(elementName,"command")
  if (ssRec) 
  {
    elementNode = ssRec.selectedNode;
  } 
  else 
  {
    elementNode = findSourceNode(elementName);
  }
  
  if (elementNode && elementNode.tagName == "MM_CMDRECSET")
  {
    if ((bindingName == MM.LABEL_FirstRecordIndex) || (bindingName == MM.LABEL_LastRecordIndex) || (bindingName == MM.LABEL_TotalRecordIndex))  
    {
      //  Recordset statistics.  These are useful when the page 
      //  is being used for navigation through a large set of records.
      //  Typically you add some text to the page that says something
      //  like:
      //  Records 10 to 15 of 63
      //  where 10 corresponds to [first record index]
      //  15 corresponds [last record index]
      //  63 corresponds [total records]

      if (bindingName == MM.LABEL_FirstRecordIndex) 
      {
        retStr = "<%= (" + elementName + "_first" + ") %>";
      }
      else if (bindingName == MM.LABEL_LastRecordIndex) 
      {
        retStr = "<%= (" + elementName + "_last" + ") %>";
      }
      else if (bindingName == MM.LABEL_TotalRecordIndex)  
      {
        retStr = "<%= (" + elementName + "_total" + ") %>";
      }
    }
    else 
    {
      retStr = "<%= " + elementName + ".Fields.Item(\"" + bindingName + "\").Value" +  " %>";
    }
  }
  else if(elementNode && (elementNode.tagName == "MM_COMMAND")) 
  {
    retStr = "<%= " + elementNode.getAttribute("NAME") + ".Parameters.Item(\"" + bindingName + "\").Value" +  " %>";
  }

  // If the string is being inserted inside a script block, strip the
  // script delimiters.
  if (dwscripts.canStripScriptDelimiters(dropObject))
    retStr = dwscripts.stripScriptDelimiters(retStr);

  return retStr;
}

////////////////////////////////////////////////////////////////////////////////
//
//  Function: inspectDynamicDataRef
//
//  Inspects a dynamic binding string and returns a pair of source and binding.
////////////////////////////////////////////////////////////////////////////////
function inspectDynamicDataRef(expression)
{
  var retArray = new Array();
  if(expression.length) 
  {
    // Quickly reject if the expression doesn't contain "<%="
    var exprIndex = expression.indexOf("<%=");
    if (exprIndex != -1)
    {
      // No need to search the string prior to the "<%="
      expression = expression.substr(exprIndex);

      var TranslatorDOM = dreamweaver.getDocumentDOM(dreamweaver.getConfigurationPath() + "/Translators/ASP.htm");
      if (TranslatorDOM)  
      {
        TranslatedStr = TranslatorDOM.parentWindow.miniTranslateMarkup("", "", expression, false);
        if (TranslatedStr.length)
        {
          var found = TranslatedStr.search(/mm_dynamic_content\s+source=(\w+)\s+binding="([^"]*)"/i)
          if (found != -1)
          {
            //map the name to node 
            elementNode = findSourceNode(RegExp.$1);
            if (elementNode)
            {
              if (elementNode.tagName == "MM_CMDRECSET") 
              {
                ///map the node to SSRec to get the title.
                parentNode = elementNode.parentNode;
                ssRec = findSSrec(parentNode,"command");
              } 
              else 
              {
                ssRec = findSSrec(elementNode,"command");
              }
              
              if (ssRec)
              {   
                retArray[0] = ssRec.title;

                if (elementNode.tagName == "MM_CMDRECSET") 
                {
                  retArray[1] = RegExp.$1 + "." + RegExp.$2;
                } 
                else 
                {
                  retArray[1] = RegExp.$2;
                }
              }
            }
          }
            //alert("source=" + retArray[0] + " binding=" + retArray[1])
        }
      }
    }
  }
  return retArray;
}
    


////////////////////////////////////////////////////////////////////////////////
//
//  Function: deleteDynamicSource
//
//  Deletes a dynamic source from the document.
////////////////////////////////////////////////////////////////////////////////
function deleteDynamicSource(sourceName,bindingName)
{
  ssRec = findSSrecByTitle(sourceName,"command")

  if (ssRec) {
    elementNode = ssRec.selectedNode;
    var dom = dw.getDocumentDOM();
    if (elementNode)  {
      if (!bindingName) 
      {
        dw.serverBehaviorInspector.deleteServerBehavior(ssRec);
      }
      else
      {
        alert(MM.MSG_CantDelColumn);
      }
    }
  }
}


