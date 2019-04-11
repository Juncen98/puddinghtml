//--------------------------------------------------------------------
// CLASS:
//   SBInsertUpdateASPNET
//
// DESCRIPTION:
//   This class is derived from the SBEditOpsASPNET class, and
//   represents an Insert/Update Server Behvaior

// Inherit from the SBDatabaseCallASPNET class.

SBInsertUpdateASPNET.prototype.__proto__ = SBEditOpsASPNET.prototype;

SBInsertUpdateASPNET.prototype.initSBInsertUpdateASPNET = SBInsertUpdateASPNET_initSBInsertUpdateASPNET;
SBInsertUpdateASPNET.prototype.analyze = SBInsertUpdateASPNET_analyze;

SBInsertUpdateASPNET.prototype.setFormTag = SBInsertUpdateASPNET_setFormTag;
SBInsertUpdateASPNET.prototype.getFormTag = SBInsertUpdateASPNET_getFormTag;
SBInsertUpdateASPNET.prototype.setFormName = SBInsertUpdateASPNET_setFormName;
SBInsertUpdateASPNET.prototype.getFormName = SBInsertUpdateASPNET_getFormName;

SBInsertUpdateASPNET.prototype.EXT_DATA_FORM_TAG	= "form__tag";
SBInsertUpdateASPNET.prototype.EXT_DATA_FORM_NAME	= "FormName";

//--------------------------------------------------------------------
// FUNCTION:
//   SBInsertUpdateASPNET
//
// DESCRIPTION:
//   Constructor function
//
// ARGUMENTS:
//   name, title, selectedNode 
//
//--------------------------------------------------------------------

function SBInsertUpdateASPNET(name, title, selectedNode)
{
  this.initSBInsertUpdateASPNET(name, title, selectedNode);
}

function SBInsertUpdateASPNET_initSBInsertUpdateASPNET(name, title, selectedNode)
{
  this.initSBEditOpsASPNET(name, title, selectedNode);
}

function SBInsertUpdateASPNET_setFormTag(formTag)
{
  this.setParameter(this.EXT_DATA_FORM_TAG, formTag);
}

function SBInsertUpdateASPNET_getFormTag()
{
  return this.getParameter(this.EXT_DATA_FORM_TAG);
}

function SBInsertUpdateASPNET_setFormName(formName)
{
  this.setParameter(this.EXT_DATA_FORM_NAME, formName);
}

function SBInsertUpdateASPNET_getFormName()
{
  return this.getParameter(this.EXT_DATA_FORM_NAME);
}

//--------------------------------------------------------------------
// FUNCTION:
//   SBInsertUpdateASPNET.analyze
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

function SBInsertUpdateASPNET_analyze(allRecs)
{
  // Mark this sb as incomplete, if the user
  // renamed the form and not the references to it

  var formNameReference = (this.getFormName()) ? this.getFormName() : "";
  var formNode = this.getFormTag();
  var actualFormName = "";

  if (formNode && formNode.getAttribute("NAME"))
  {
    actualFormName = formNode.getAttribute("NAME");
  }
  
  // Only check form name correctness when not in livedata mode. The asp.net
  //   server renames all forms with runat=server, so the form name and 
  //   form name reference will always be different. 
  if (   !dw.getLiveDataMode()
      && actualFormName.toUpperCase() != formNameReference.toUpperCase()
     )
  {
    this.setIsIncomplete(true);
  }
}

function findFormElement(object, searchValue)
{
  var searchName = String(searchValue).toUpperCase();
  var objectName = String(object.getAttribute("NAME")).toUpperCase();
  
  return (objectName == searchName);
};
                                  
