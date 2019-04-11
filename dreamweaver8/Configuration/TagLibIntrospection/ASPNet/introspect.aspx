<%@ Page Language="C#" Debug="true"
%><%@ Import Namespace="System.Collections"
%><%@ Import Namespace="System.ComponentModel"
%><%@ Import Namespace="System.ComponentModel.Design"
%><%@ Import Namespace="System.IO"
%><%@ Import Namespace="System.Reflection"
%><%@ Import Namespace="System.CodeDom"
%><%@ Import Namespace="System"
%><script runat="server">

// ==========================================================================
// PAGE LOAD
// ==========================================================================

// Debugging output
String errors;

// List of sources (.dll and .ascx)
ArrayList sources = new ArrayList();

// Attribute category information (refreshed on each tag)
Hashtable attributeCategories;

String newline = "\r\n";

protected void Page_Load(Object Src, EventArgs E)
{
	// Set up for XML output
	Response.ContentType = "Text/Plain";
	Response.Write("<?xml version=\"1.0\" ?>" + newline);

	// Generate appropriate XML output
	String mode = GetFormValue("mode");

	if (mode == "listAllSources")
		ListAllSources();
	else if (mode == "introspectSomeSources")
		IntrospectSomeSources();
	else if (mode == "introspectAllSources")
		IntrospectAllSources();

	// Debugging output
	Response.Write(newline + newline + errors + newline + newline);
}


// Grab the form value (or "")
protected String GetFormValue(String name)
{
	return Request.Form[name] == null ? "" : Request.Form[name];
}


// Generate an XML file of every available source (.dll or .ascx)
// Use mode=listAllSources
protected void ListAllSources()
{
	GetAllSources();
	WriteAllSources();
}


// Generate a VTM file of tag information for provided sources
// Use mode=introspectSomeSources and sources=<comma delimited list>
protected void IntrospectSomeSources()
{
	String sourcesList = GetFormValue("sources");
	sources.AddRange(sourcesList.Split(new Char[] {';'}));
	IntrospectSources();
}


// Generate a VTM file of tag information for all available sources
// Use mode=introspectAllSources
protected void IntrospectAllSources()
{
	GetAllSources();
	IntrospectSources();
}

// ==========================================================================
// GETTING SOURCES
// ==========================================================================


// Look up all sources and put them into the ArrayList "sources"
protected void GetAllSources()
{
	GetAssemblies();
	GetASCXControls();
}


// Add all non-excluded assemblies available in this virtual directory
protected void GetAssemblies()
{
	try
	{
		AppDomain domain = AppDomain.CurrentDomain;
		foreach (Assembly a in domain.GetAssemblies())
		{
			if (!ExcludeAssembly(a))
				sources.Add(a.GetName().FullName);
		}
	}
	catch (Exception e)
	{
		WriteError("ASSEMBLIES", "Problem locating assemblies");
	}
}


// Add all ASCX controls that fall within this virtual directory.
protected void GetASCXControls()
{
	try
	{
		String virtualDir = Request.ApplicationPath;
		if (virtualDir[virtualDir.Length-1] != '/')
			virtualDir += "/";
	
		String physicalDir = Request.PhysicalApplicationPath;
		if (physicalDir[physicalDir.Length-1] != '\\')
			physicalDir += "\\";
	
		DirectoryInfo starterDir = new DirectoryInfo(physicalDir);
		GetASCXControls(starterDir, physicalDir, virtualDir);
	}
	catch (Exception e)
	{
		WriteError("ASCX CONTROLS", "Problem locating ASCX controls");
	}
}


// Add all ASCX controls in dir (and its subdirectories).  Works recursively.
protected void GetASCXControls(DirectoryInfo dir,
							   String physicalDir, String virtualDir)
{
	foreach (FileInfo f in dir.GetFiles("*.ascx"))
		sources.Add(GetURL(f, physicalDir, virtualDir));
	foreach (DirectoryInfo sub in dir.GetDirectories())
	{
		try
		{
			GetASCXControls(sub, physicalDir, virtualDir);
		}
		catch (Exception e)
		{
			WriteError("ASCX CONTROLS", "Problems locating ASCX controls in " + sub.FullName);
		}
	}
}


// Transform the ASCX file name into a URL
protected String GetURL(FileInfo file, String oldPrefix, String newPrefix)
{
	Regex oldPrefixFinder = new Regex(Regex.Escape(oldPrefix));
	String result = oldPrefixFinder.Replace(file.FullName, newPrefix, 1, 0);
	Regex backslashFinder = new Regex(Regex.Escape("\\"));
	return backslashFinder.Replace(result, "/");
}

// ==========================================================================
// WRITING SOURCES
// ==========================================================================


// Write out the sources in a simple XML format
protected void WriteAllSources()
{
	Response.Write("<ITEMS>" + newline);
	foreach (String s in sources)
		Response.Write("  <ITEM>" + s + "</ITEM>" + newline);
	Response.Write("</ITEMS>" + newline);
}


// Write out an error block.  SOURCE will be "ASSEMBLIES", "ASCX Controls",
// or the name of a particular assembly or user control.
protected void WriteError(String source, String message)
{
	Response.Write("<ERROR SOURCE=\"" + source + "\" MESSAGE=\"" + message + "\"/>" + newline);
}

// ==========================================================================
// INTROSPECTING SOURCES
// ==========================================================================


// Write out tag information for all sources in ArrayList sources
protected void IntrospectSources()
{
	InitializePropertyMap();  // fills in the Hashtable
	foreach (String s in sources)
	{
		String sLower = s.Trim().ToLower();
		if (sLower.EndsWith(".ascx"))
			IntrospectASCXControl(sLower);
		else
			IntrospectAssembly(sLower);
	}
}


// Write out tag information for ASCX Control
// (Load the control, grab the type, and move on to IntrospectTag.)
protected void IntrospectASCXControl(String URI)
{
	if (File.Exists(MapPath(URI)))
	{
		Control ASCXControl;
		try
		{
			ASCXControl = LoadControl(URI);
		}
		catch (Exception e)
		{
			WriteError(URI, e.Message);
			return;
		}
		IntrospectTag(ASCXControl.GetType(), true);
	}
}


// Write out tag information for all tags in the assembly
// (Load assembly, grab the types, and send the good ones on to IntrospectTag.)
protected void IntrospectAssembly(String dllName)
{
	// Load the assembly
	Assembly assembly;
	try
	{
		assembly = Assembly.Load(dllName);
	}
	catch (Exception e)
	{
		WriteError(dllName, e.Message);
		return;
	}

	// Get the types for this assembly; introspect the valid controls
	try
	{
		Type[] allTypes = assembly.GetTypes();
		foreach (Type tagType in allTypes)
		{
			if (CheckTagType(tagType))
				IntrospectTag(tagType, false);
		}
	}
	catch (Exception e)
	{
		WriteError(dllName, e.Message);
	}
}


// Write out tag information for a particular tag type
protected void IntrospectTag(Type tagType, Boolean isASCXControl)
{
	// Start out with no attributes
	attributeCategories = new Hashtable();

	// Write TAG open.  Use a phony namespace for ASCX controls.
	if (isASCXControl)
		WriteTagOpen(tagType.Name, "ASCXControl");
	else
		WriteTagOpen(tagType.Name, tagType.Namespace);

	// Open attributes tag
	WriteAttributesOpen();

	// Find and write valid tag attributes
	PropertyDescriptorCollection propsCollection = GetSortedProperties(tagType);
	foreach (PropertyDescriptor prop in propsCollection)
		IntrospectProperty(prop, prop.Name);

	// Find and write tag events
	EventDescriptorCollection eventsCollection = GetSortedEvents(tagType);
	foreach (EventDescriptor evnt in eventsCollection)
		IntrospectEvent(evnt);

	// Close attributes tag
	WriteAttributesClose();

	// Write attribute categories
	WriteAttributeCategories();

	// Write TAG close.
	WriteTagClose();

}


// Get list of tag attributes (in alphabetical order)
protected PropertyDescriptorCollection GetSortedProperties(Type tagType)
{
	PropertyDescriptorCollection propsCollection =
		TypeDescriptor.GetProperties(tagType);
	return propsCollection.Sort();
}

// Get list of tag events (in alphabetical order). Sort isn't defined.
protected EventDescriptorCollection GetSortedEvents(Type tagType)
{
	EventDescriptorCollection eventsCollection =
		TypeDescriptor.GetEvents(tagType);
	return eventsCollection.Sort();
}


// Write out attribute information corresponding to a particular property
protected void IntrospectProperty(PropertyDescriptor prop, String propName)
{
	Type propType = prop.PropertyType;

	// Ignore read-only and other useless properties
	Boolean includeProperty = CheckProperty(prop, propName);

	// Attributes like Font and ItemStyle.  They aren't used by tags directly.
	// Instead, tags use subproperties like Font-Bold and ItemStyle-BackColor
	if (HasSubProperties(prop))
	{
		PropertyDescriptorCollection subPropsCollection =
			GetSortedProperties(propType);
		if (includeProperty)
		{
			CategorizeMember(prop, propName);
			WriteAttribute(propName, MapPropertyType(propName, propType));
		}
		foreach (PropertyDescriptor subProp in subPropsCollection)
		{
			IntrospectProperty(subProp, propName + "-" + subProp.Name);
		}
	}

	// Attributes that use enumerated.  We need all of the available types
	// to build <ATTRIBOPTION> tags
	else if (propType.IsEnum && includeProperty)
	{
		WriteAttributeOpen(propName, "enumerated");

		String [] members = Enum.GetNames(propType);
		foreach (String member in members)
			WriteAttributeOption(member);

		CategorizeMember(prop, propName);
		WriteAttributeClose();
	}

	// We need to specify boolean attributes as enumerations of "true" and "false"
	else if (propType.FullName == "System.Boolean")
	{
		WriteAttributeOpen(propName, "enumerated");
		WriteAttributeOption("true");
		WriteAttributeOption("false");
		CategorizeMember(prop, propName);
		WriteAttributeClose();
	}

	// Normal attributes
	else if (includeProperty)
	{
		CategorizeMember(prop, propName);
		WriteAttribute(propName, MapPropertyType(propName, propType));
	}
}


// Add this attribute to the proper category (in Hashtable attributeCategories)
protected void CategorizeMember(MemberDescriptor desc, String name)
{
	String category = GetCategory(desc);
	if (attributeCategories[category] == null)
		attributeCategories[category] = new ArrayList();
	((ArrayList)attributeCategories[category]).Add(name);
}


// Identify the tag attribute category that this property/event belongs to
protected String GetCategory(MemberDescriptor desc)
{
	CategoryAttribute attr = (CategoryAttribute)
		desc.Attributes[typeof(CategoryAttribute)];
	return attr == null ? "Misc" : attr.Category;
}


// Write out attribute information corresponding to a particular event
protected void IntrospectEvent(EventDescriptor evnt)
{
	String eventName = "On" + evnt.Name;
	CategorizeMember(evnt, eventName);
	WriteEvent(eventName);
}

// ==========================================================================
// WRITING TAG INFORMATION
// ==========================================================================


protected void WriteTagOpen(String name, String myNamespace)
{
	Response.Write("<tag name=\"" + name + "\" namespace=\"" + myNamespace + "\">" + newline);
}


protected void WriteTagClose()
{
	Response.Write("</tag>" + newline);
}


protected void WriteAttributesOpen()
{
	Response.Write("  <attributes>" + newline);
}

protected void WriteAttributesClose()
{
	WriteAttributeOpen("runat", "enumerated");
	WriteAttributeOption("server");
	WriteAttributeClose();
	Response.Write("  </attributes>" + newline);
}


protected void WriteAttribute(String name, String type)
{
	Response.Write("    <attrib name=\"" + name + "\" type=\"" + type + "\"/>" + newline);
}


protected void WriteAttributeOpen(String name, String type)
{
	Response.Write("    <attrib name=\"" + name + "\" type=\"" + type + "\">" + newline);
}


protected void WriteAttributeClose()
{
	Response.Write("    </attrib>" + newline);
}


protected void WriteAttributeOption(String value)
{
	Response.Write("      <attriboption value=\"" + value + "\"/>" + newline);
}


protected void WriteEvent(String eventName)
{
	WriteAttribute(eventName, "text");
	Response.Write("    <event name=\"" + eventName + "\"/>" + newline);
}


protected void WriteAttributeCategories()
{
	Response.Write("  <attribcategories>" + newline);
	foreach (DictionaryEntry pair in attributeCategories)
	{
		Response.Write("    <attribgroup name=\"" + pair.Key + "\"" + newline);
		Response.Write("      elements=\"");
		ArrayList attributes = (ArrayList)pair.Value;
		if (attributes.Count > 0)
		{
			Response.Write((String)attributes[0]);
			attributes.RemoveAt(0);
		}
		foreach (String s in attributes)
		{
			Response.Write("," + s);
		}
		Response.Write("\"/>" + newline);
	}
	Response.Write("  </attribcategories>" + newline);
}

// ==========================================================================
// HARD CODED BITS FOR EXCLUSION AND MAPPING
// ==========================================================================


// Identify built-in assemblies (used in ExcludeAssemblies, below)
String [] excludeNames =
{
	// Current assemblies

	"mscorlib",
	"System",
	"System.Web",
	"System.XML",
	"System.Data",
	"System.Web.RegularExpressions",
	"System.Web.Services",
	"System.Drawing",
	"Microsoft.VisualBasic",

	// Beta 1 assemblies (left here for good measure)

	"Microsoft.ComServices",
	"System.Diagnostics",
	"System.Net",
	"System.Text.RegularExpressions",
	"System.Xml.Serialization"
};

// Converts file name to file URL (helper for ExcludeAssemblies, below)
protected String GetFileURL(String fileName)
{
	/*
	YUCK!!!  Surely there's some class that will do this for me!
	*/
	fileName = Regex.Replace(fileName, "\\\\", "/");
	fileName = "file:///" + fileName;
	//fileName = Server.UrlEncode(fileName);
	//fileName = Regex.Replace(fileName, " ", "%20");
	return fileName;
}

// Exclude built-in assemblies and dynamically generated assemblies
protected Boolean ExcludeAssembly(Assembly a)
{
	// Uncomment to introspect built-in web controls
	// return false;

	// Exclude system assemblies we've already introspected
	String name = a.GetName().Name;	
	foreach (String excludeName in excludeNames)
	{
		if (String.Compare(name, excludeName, true) == 0)
			return true;
	}

	// Exclude dynamic assemblies
	if (String.Compare(GetFileURL(a.Location), a.CodeBase, true) == 0)
		return true;
	return false;
}


// Determine whether this type has a particular .Net attribute
protected Boolean HasAttribute(Type type,
							   Type attrType,
							   Attribute testAttr)
{
	return (testAttr.Equals(TypeDescriptor.GetAttributes(type)[attrType]));
}

								 
// Determine whether this property/event has a particular .Net attribute
protected Boolean HasAttribute(MemberDescriptor desc,
							   Type attrType,
							   Attribute testAttr)
{
	return (testAttr.Equals(desc.Attributes[attrType]));
}


// Identify valid controls (tags which can be used on an ASPX page)
protected Boolean CheckTagType(Type tagType)
{
	if (tagType.IsSubclassOf(typeof(DataGridColumn)))
		return true;

	if (!tagType.IsPublic || tagType.IsAbstract ||
		!typeof(IComponent).IsAssignableFrom(tagType))
		return false;
	
	if (HasAttribute(tagType, typeof(ToolboxItemAttribute),
					 ToolboxItemAttribute.Default))
		return false;

	return true;
}


// Identify valid properties (which can be used in an ASPX tag)
protected Boolean CheckProperty(PropertyDescriptor prop, String propName)
{
	if (prop.DesignTimeOnly)
		return false;
	if (!prop.IsBrowsable)
		return false;
	if (prop.IsReadOnly)
		return false;
	return true;
}


// Should we use subproperties (like Font-Bond or ItemStyle-BackColor)?
protected Boolean HasSubProperties(PropertyDescriptor prop)
{
	return HasAttribute(prop, typeof(NotifyParentPropertyAttribute),
						NotifyParentPropertyAttribute.Yes);	
}


// Map .Net types to VTML types (BOOL and ENUMERATED handled separately)
Hashtable propertyMap = new Hashtable();
protected void InitializePropertyMap()
{
	propertyMap.Add("System.Drawing.Color", "color");
	propertyMap.Add("System.Web.UI.WebControls.FontInfo", "font");
}
protected String MapPropertyType(String propName, Type propType)
{
	String vtmType = (String)propertyMap[propType.FullName];
	if (vtmType == null)
		vtmType = "text";
	
	// Special case
	if (Regex.IsMatch(propName, "CssClass", RegexOptions.IgnoreCase) ||
		Regex.IsMatch(propName, ".*-CssClass", RegexOptions.IgnoreCase))
		vtmType = "style";

	return vtmType;
}

</script>
