// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

//--------------------------------------------------------------------
// CLASS:
//   WSDLCallback
//
// DESCRIPTION:
//   DefaultProxyGen's JavaScript callback object passed to dreamweaver.scanSourceString
//
// PUBLIC FUNCTIONS:
//  openTagBegin        -   called whenever an open tag is detected within the document being parsed
//
//  attribute           -   called for every attribute within the document being parsed
//
//  openTagEnd          -   called whenever an open tag is ended within the document being parsed
//
//  closeTagBegin       -   called whenever a close tag is detected within the document being parsed
//
//  translate           -   translates the given parameter and returns the value
//
//--------------------------------------------------------------------

function WSDLCallback()
{
  this.openTag = "";
  this.definitions = new Array();
  this.importlocation = "";
  this.service = new Array();
  this.porttype = new Array();
  this.binding = new Array();
  // temporary arrays to hold the values till final processing
  this.tempService = new Array();
  this.tempPortType = new Array();  
  this.tempBindings = new Array();
  this.tempBinding = ""; 
}

// public methods
WSDLCallback.prototype.attribute = attribute;
WSDLCallback.prototype.openTagBegin = openTagBegin;
WSDLCallback.prototype.openTagEnd = openTagEnd;
WSDLCallback.prototype.closeTagBegin = closeTagBegin;
WSDLCallback.prototype.translate = translate;

// private methods
WSDLCallback.prototype.readImportLocation = readImportLocation;

//--------------------------------------------------------------------
// FUNCTION:
//  openTagBegin
//
// DESCRIPTION:
//  gets called whenever an open tag is detected within the document 
//  being parsed.  The function returns true if scanning should
//  continue, or false if it should stop
//
// ARGUMENTS:
//  tag   :   the name of the tag
//  offset:   the document offset
//
// RETURNS:
//  boolean
//--------------------------------------------------------------------

function openTagBegin(tag, offset)
{
  with(this)
  {
    if (tag.toLowerCase() == "definitions" || tag.toLowerCase() == "wsdl:definitions")
    {
      openTag = tag.toLowerCase();
    }
    else if (tag.toLowerCase() == "import" || tag.toLowerCase() == "wsdl:import")
    {
      openTag = tag.toLowerCase();
    }
    else if (tag.toLowerCase() == "service" || tag.toLowerCase() == "wsdl:service")
    {
      openTag = tag.toLowerCase();
    }
    else if (tag.toLowerCase() == "binding" || tag.toLowerCase() == "wsdl:binding")
    {
      openTag = tag.toLowerCase();
      tempBinding = new Object()
    }
    else if (tag.toLowerCase() == "porttype" || tag.toLowerCase() == "wsdl:porttype")
    {
      openTag = tag.toLowerCase();
    }
    // check what kind of binding it is, 
    // the known types for now are
    // i) soap:binding
    // ii) http: binding with verb = "get", "post" or anything else in the future...
    // iii) not handling MIME binding type for now...
    else if (tag.toLowerCase().indexOf(":binding") != -1)
    {
      openTag = tag.toLowerCase();
      var index =  tag.toLowerCase().indexOf(":binding");
      tempBinding.bindingProtocol = tag.substr(0, index);
    }    
  }
  
  return true;
}

//--------------------------------------------------------------------
// FUNCTION:
//  attribute
//
// DESCRIPTION:
//  gets called for each HTML attribute within the document 
//  being parsed.  The function returns true if scanning should
//  continue, or false if it should stop
//
// ARGUMENTS:
//  name  :   attribute name
//  code  :   attribute value
//
// RETURNS:
//  boolean
//--------------------------------------------------------------------

function attribute(attname, code)
{
  with (this)
  {
    if (openTag == "definitions" || openTag == "wsdl:definitions")
    {
      if (attname.toLowerCase() == "name")
      {
        definitions.push({name:code});
      }
    }
    else if (openTag == "import" || openTag == "wsdl:import")
    {
      if (attname.toLowerCase() == "location")
      {
        importlocation = code;
      }
    }    
    else if (openTag == "service" || openTag == "wsdl:service")
    {
//      if (attname.toLowerCase() == "name")
//      {
//        tempService.push(code);
//      }
		service.push({name:code});
    }
    else if (openTag == "binding" || openTag == "wsdl:binding")
    {
      if (attname.toLowerCase() == "name")
      {
        tempBinding.bindingName = code;
      }
      else if (attname.toLowerCase() == "type")
      {
        tempBinding.bindingType = code;
      }
    }
    // check what kind of binding it is, 
    // the known types for now are
    // i) soap:binding
    // ii) http: binding with verb = "get", "post" or anything else in the future...
    // iii) not handling MIME binding type for now...
    else if (openTag.toLowerCase().indexOf(":binding") != -1)
    {
      if (attname.toLowerCase() == "verb")
      {
        tempBinding.bindingProtocolVerb = code;
      }
    }  
    else if (openTag == "porttype" || openTag == "wsdl:porttype")
    {
      if (attname.toLowerCase() == "name")
      {
        tempPortType.push(code);
      }
    }
  }
  
  return true;
}

//--------------------------------------------------------------------
// FUNCTION:
//  openTagEnd
//
// DESCRIPTION:
//  gets whenever an open tag is ended within the document 
//  being parsed.  The function returns true if scanning should
//  continue, or false if it should stop
//
// ARGUMENTS:
//  offset          :   document offset
//  trailingFormat  :   the trailing format
//
// RETURNS:
//  boolean
//--------------------------------------------------------------------

function openTagEnd(offset, trailingFormat)
{
  with(this)
  {
    if (openTag == "import" || openTag == "wsdl:import")
    {
      readImportLocation();
    }
    openTag = "";
  }
  return true;
}

//--------------------------------------------------------------------
// FUNCTION:
//  closeTagBegin
//
// DESCRIPTION:
//  gets called whenever a close tag is detected within the document
//  being parsed.  The function returns true if scanning should
//  continue, or false if it should stop
//
// ARGUMENTS:
//  tag     :   name of the tag 
//  offset  :   document offset
//
// RETURNS:
//  boolean
//--------------------------------------------------------------------

function closeTagBegin(tag, offset)
{
  with(this)
  {
    if (tag.toLowerCase() == "definitions" || tag.toLowerCase() == "wsdl:definitions")
    {
      var porttypeindex, name, value, bindingObj;
      for(var i = 0; i < tempBindings.length; i++)
      {
        var type = tempBindings[i].bindingType;
        if (type)
        {
          // search this binding type in the portType array to find
          // out the index of the portType...
          for(var j = 0; j < tempPortType.length; j++)
          {          
            if (type.toLowerCase().indexOf(tempPortType[j].toLowerCase()) != -1)
            {
              porttypeindex = type.indexOf(tempPortType[j]);
              if (porttypeindex)
              {
                if (tempBindings[i].bindingProtocol)
                {
                  bindingObj = new Object();
                  name = "binding[" + i + "]";
                  value = tempBindings[i].bindingName;
                  name = name + "porttype[" + j + "]"; 
                  name = name + tempBindings[i].bindingProtocol;               
                  if (tempBindings[i].bindingProtocolVerb)
                  {
                    name = name + ":" + tempBindings[i].bindingProtocolVerb;                    
                  } 
                  bindingObj.name = name;
                  bindingObj.value = value;
                  binding.push(bindingObj);
                  break;
                }
              } 
            }
          }
        }
      } 
      
      // service array...
//      var serviceObj;
//      for(i = 0; i < tempService.length; i++)
//      {
//        if (tempService[i])
//        {
//          serviceObj = new Object;
//          serviceObj.name = "service[" + i + "]";
//          serviceObj.value = tempService[i];
//          service.push(serviceObj);
//        }
//      }
      
      // portType array...
      var portTypeObj;
      for(i = 0; i < tempPortType.length; i++)
      {
        if (tempPortType[i])
        {
          portTypeObj = new Object;
          portTypeObj.name = "porttype[" + i + "]";
          portTypeObj.value = tempPortType[i];
          porttype.push(portTypeObj);
        }
      } 
    } // if (tag.toLowerCase() == "definitions")
    if (tag.toLowerCase() == "binding" || tag.toLowerCase() == "wsdl:binding")
    {     
      // push the temporary binding object into the temporary bindings array...
      tempBindings.push(tempBinding);    
    }
  }
	return true;
}

//--------------------------------------------------------------------
// FUNCTION:
//  translate
//
// DESCRIPTION:
//  utility function that translates the given parameter and returns 
//  the value
//
// ARGUMENTS:
//  varName    :   The variable that needs to be translated
//
// RETURNS:
//  String
//--------------------------------------------------------------------
 
function translate(varName)
{
  with(this)
  {
    var name = varName.toLowerCase();
    if(name.indexOf("[") != -1)
      name = name.substr(0, name.indexOf("["));
    // does javascript do perl type substitution?? i wish
    if(name == "definitions")
      return definitions;
    else if(name == "service")
      return service;
    else if(name == "porttype")
      return porttype;
    else if(name == "binding")
      return binding;
  }  
}

//--------------------------------------------------------------------
// FUNCTION:
//  readImportLocation
//
// DESCRIPTION:
//  Reads the WSDL specified by the import location and calls
//  dreamweaver.scanSourceString again.  Used when a WSDL is a service
//  implementation and imports the service interface
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function readImportLocation()
{
  var localWsdl, bRemote = false;
  with(this)
  { 
    if (importlocation.length)
    {
      // read the wsdl into a string
      if (importlocation.substr(0, 5).toLowerCase() == "http:" || importlocation.substr(0, 6).toLowerCase() == "https:")
        bRemote = true;
      if(!bRemote)
        localWsdl = importlocation;    
      else
      {  
        localWsdl = getWSDL(importlocation);
      }
      if (localWsdl)
      {      
        var inStr = DWfile.read(MMNotes.filePathToLocalURL(localWsdl));
        if (inStr)
        {
          if (dreamweaver.scanSourceString(inStr, this))
          {
          }
          // delete the file it is remote, as we have created a local file
          // in the temp directory...
          if(bRemote && localWsdl.length && DWfile.exists(localWsdl))
            DWfile.remove(localWsdl);          
        }
      }
    }
  }
}
