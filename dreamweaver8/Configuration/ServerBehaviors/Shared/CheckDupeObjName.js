// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

function IsDupeObjectName(newName, oldName)
{
  var recs = dw.sbi.getServerBehaviors()
  var serverLang = dw.getDocumentDOM().serverModel.getServerLanguage()

  if (serverLang == "CFML") {
    if (newName && oldName) {
      if (newName.toLowerCase() == oldName.toLowerCase()) {
        return false
      }
    }
  } else {
    if (newName == oldName) {
      return false
    }
  }

  switch(serverLang)
  {
    case "JavaScript":
    case "VBScript":

      for (var i = 0; i < recs.length; i++)
      {
        var thisRec = recs[i]
        if (thisRec.type == "recordset" || thisRec.serverBehavior == "Recordset.htm")
        {
          if (thisRec.rsName == newName)
          {
            return true
          }
        }
        else if (thisRec.type == "command")
        {
          if (thisRec.cdName == newName)
          {
            return true
          }

          if (thisRec.recordset == newName)
          {
            return true
          }
        }
      }

      break

    case "CFML":

    for (var i = 0; i < recs.length; i++)
      {
        var thisRec = recs[i]
        if (thisRec.type == "recordset" || thisRec.serverBehavior == "Recordset.htm")
        {
          if (thisRec.rsName.toLowerCase() == newName.toLowerCase())
          {
            return true
          }
        }
        else if (thisRec.type == "cfstoredproc")
        {
          if (thisRec.name.toLowerCase() == newName.toLowerCase())
          {
            return true
          }

          if (thisRec.resultsetName.toLowerCase() == newName.toLowerCase())
          {
            return true
          }
        }
      }

      break

    case "Java":

    for (var i = 0; i < recs.length; i++)
      {
        var thisRec = recs[i]
        if (thisRec.type == "recordset" || thisRec.serverBehavior == "Recordset.htm")
        {
          if (thisRec.rsName == newName)
          {
            return true
          }
        }
        else if (thisRec.type == "callable")
        {
          if (thisRec.callableName == newName)
          {
            return true
          }

          if (thisRec.recordset == newName)
          {
            return true
          }
        } 
		else if (thisRec.type == "prepared")
        {
          if (thisRec.preparedName == newName)
          {
            return true
          }
        }
		else if (thisRec.type == "JavaBean" || thisRec.serverBehavior == "JavaBean.htm")
        {
          if (thisRec.parameters.Id == newName)
          {
            return true
          }
        }
      }

      break
  }

  return false
}

