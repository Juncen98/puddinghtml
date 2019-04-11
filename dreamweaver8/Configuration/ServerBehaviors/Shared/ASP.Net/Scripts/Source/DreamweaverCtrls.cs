using System;
using System.Collections;
using System.Collections.Specialized;
using System.Configuration;
using System.Text;
using System.Text.RegularExpressions;
using System.Web;
using System.Web.Caching;
using System.Web.SessionState;
using System.Web.Security;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.UI.HtmlControls;
using System.Data;
using System.Data.SqlClient;
using System.Data.OleDb;
using System.Data.Common;
using System.Globalization;
using System.Threading;
using System.Reflection;

//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
//  Update this ONLY if your revisions break backward compatibility.
//  WARNING:  Revising this may require users to use the GAC to access
//  earlier versions.
[assembly:AssemblyVersionAttribute("1.0.0.0")]
//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!


//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
//  Update this whenever you revise this file...
[assembly:AssemblyInformationalVersionAttribute("1.0.0.5")]
//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

[assembly:AssemblyKeyFileAttribute("DreamweaverCtrls.snk")]
[assembly:AssemblyCompanyAttribute("Macromedia, Inc.")]
[assembly:AssemblyCopyrightAttribute("Copyright (c) 2002 Macromedia, Inc.")]
[assembly:AssemblyProductAttribute("Macromedia Dreamweaver MX")]
[assembly:AssemblyTrademarkAttribute("Dreamweaver MX is a trademark of Macromedia.")]
[assembly:AssemblyDescriptionAttribute("Macromedia Dreamweaver MX custom controls for .NET")]
[assembly:AssemblyTitleAttribute("Macromedia Dreamweaver MX custom controls for .NET")]

namespace DreamweaverCtrls
{

//*************************************************************************************
	
[System.Runtime.CompilerServices.CompilerGlobalScopeAttribute()]
public class DataSet : System.Web.UI.UserControl
{
private static int __autoHandlers;
private static bool __intialized = false;

private Boolean _bHasBeenInitialized = false;
private ArrayList _params;
public ArrayList Parameters
{
	get { return _params; }
	set { _params = value; }
}

private ArrayList _editOps;
public ArrayList EditOps
{
	get { return _editOps; }
	set { _editOps = value; }
}

protected string _exceptionString = "";
private IDbCommand _theCommand;

private static System.Web.UI.WebControls.BoundColumn theBC = new System.Web.UI.WebControls.BoundColumn();
private static System.Web.UI.WebControls.TemplateColumn theTC = new System.Web.UI.WebControls.TemplateColumn();
private static System.Web.UI.WebControls.CheckBox theCB = new System.Web.UI.WebControls.CheckBox();
private static System.Web.UI.WebControls.TextBox theTB = new System.Web.UI.WebControls.TextBox();
private static System.Web.UI.WebControls.DropDownList theDDL = new System.Web.UI.WebControls.DropDownList();

public string CommandText = "";
public string DatabaseType = "OleDb";
public Boolean IsStoredProcedure = false;
public string ConnectionString = "";
public string SuccessURL = "";
public string FailureURL = "";
public Boolean Expression = true;
public Boolean Debug = false;
public Boolean ProcessOnPostBack = true;
public Boolean CreateDataSet = true;
public int PageSize = 0;
public int CurrentPage = 0;
public Boolean GetRecordCount = true;
protected int _recordCount = 0;
public int RecordCount
{
	get
	{ 
		if (!_bHasBeenInitialized)
		{
			DoInit();
		}

		return _recordCount;
	}
}
public string RecordCountCommandText = "";
protected int _lastPage = 0;
public int LastPage
{
	get
	{
		if (!_bHasBeenInitialized)
		{
			DoInit();
		}

		return _lastPage;
	}
}
public int StartRecord = 0;
public int EndRecord
{
	get
	{
		if (!_bHasBeenInitialized)
		{
			DoInit();
		}

		return Math.Min((CurrentPage + 1) * PageSize, _recordCount);
	}
}
public int MaxRecords = 0;
public string TableName = "theTable";
public System.Data.DataSet theDS = new System.Data.DataSet();
public DataView DefaultView
{
	get
	{
		if (!_bHasBeenInitialized)
		{
			DoInit();
		}

		if (theDS.Tables.Count == 0)
		{
			//	Hey, wait a second.  Someone has requested access to tabular data
			//	that doesn't exist!  We better report whatever errors we found
			//	during the attempt to create the DataSet.

			if (Expression)
			{
				try
				{
					throw(new System.Exception("The DefaultView was requested but no tables yet exist."));
				}
				catch (Exception e)
				{
					HandleException(e);
					Response.Write(_exceptionString);
					Response.End();
				}
			}
			else
			{
				throw(new System.Exception(_exceptionString));
			}
		}

		return theDS.Tables[0].DefaultView;
	}
}

protected void Page_Load(Object src, EventArgs E)
{
	DoInit();
}

protected void ForceInit()
{
	Boolean oldProcessOnPostBack = ProcessOnPostBack;
	
	ProcessOnPostBack = true;
	DoInit();
	ProcessOnPostBack = oldProcessOnPostBack;
}

public void DoInit()
{
	DataBind();

	// If we got here because of a post-back, we (typically)
	// don't want to do any processing. You can change this
	// behavior by setting the ProcessOnPostBack attribute of the
	// MM:DataSet tag to true.

	if (IsPostBack && !ProcessOnPostBack)
	{
		return;
	}

	theDS.Clear();
	_recordCount = 0;
	_bHasBeenInitialized = true;

	if (Expression)
	{
		IDbConnection myConnection = null;

		try
		{
			//	The connection string and the database type typically are obtained from application
			//	settings in the web.config.  This isn't mandatory:	it is perfectly OK to have
			//	a literal string for the ConnectionString attribute, etc., but the more common case
			//	is to use something like this:
			//
			//	  <MM:DataSet
			//		 id="Recordset1"
			//		 runat="Server"
			//		 IsStoredProcedure="false"
			//		 ConnectionString='<%# System.Configuration.ConfigurationSettings.AppSettings["MM_CONNECTION_STRING_Pubs"] %>'
			//		 DatabaseType='<%# System.Configuration.ConfigurationSettings.AppSettings["MM_CONNECTION_DATABASETYPE_Pubs"] %>'
			//		 CommandText='<%# "SELECT * FROM dbo.authors" %>'
			//		 Debug="true"
			//		 PageSize="10"
			//		 CurrentPage='<%# ((Request.QueryString["Recordset1_CurrentPage"] != null) && (Request.QueryString["Recordset1_CurrentPage"].Length > 0)) ? Int32.Parse(Request.QueryString["Recordset1_CurrentPage"]) : 0	%>'
			//	  />
			//
			//	We know that if the ConnectionString is the empty string (or null) we are going to
			//	fail to make the connection.  We also know that if the DatabaseType is the empty
			//	string (or null) we are in trouble.  Though we can't be certain, we can guess
			//	(with 99.99% certainty) that if both of these values are the empty string the
			//	reason is that the web.config file is either missing from the server or doesn't
			//	have an entry for a particular Macromedia (Dreamweaver) connection.
			//
			//	We can suggest this to help the author diagnose and fix the problem.

			Boolean ConnectionStringIsNull = ((ConnectionString == null) || (ConnectionString.Length == 0));
			Boolean DatabaseTypeIsNull = ((DatabaseType == null) || (DatabaseType.Length == 0));

			string msgPart1 =
				"This page has a MM:DataSet, MM:Insert, MM:Update or MM:Delete tag " +
				"with a null or empty value for the ";

			string msgPart2 =
				"\n\nOften, such values come from application settings in the web.config file. " +
				"That file might be missing from the server executing this page.  Or, it might " +
				"be missing the particular <b>add key</b> tags for the database " +
				"connection this page uses. If you are using Dreamweaver, look for the web.config " +
				"file in the local root folder of your Dreamweaver site. Once you find this file, " +
				"you can either:<ul>" +
				"<li>Put this file onto the server that is executing this page.</li>" +
				"<li>Copy the <b>add key</b> tags from the web.config in the local root folder " +
				"of your Dreamweaver site and paste them into the web.config file in the server " +
				"that is executing this page.</li></ul>";

			if (ConnectionStringIsNull && DatabaseTypeIsNull)
			{
				string msgPart1a = "ConnectionString and DatabaseType attributes. ";
				string fullMsg = msgPart1 + msgPart1a + msgPart2;
				throw(new System.Exception(fullMsg));
			}
			else if (ConnectionStringIsNull)
			{
				string msgPart1a = "ConnectionString attribute. ";
				string fullMsg = msgPart1 + msgPart1a + msgPart2;
				throw(new System.Exception(fullMsg));
			}
			else if (DatabaseTypeIsNull)
			{
				string msgPart1a = "DatabaseType attribute. ";
				string fullMsg = msgPart1 + msgPart1a + msgPart2;
				throw(new System.Exception(fullMsg));
			}

			myConnection = NewDbConnection(ConnectionString);
			myConnection.Open();

			_theCommand = NewDbCommand();
			_theCommand.CommandText = CommandText;
			_theCommand.Connection = myConnection;

			_theCommand.CommandType = IsStoredProcedure ? CommandType.StoredProcedure : CommandType.Text;
			AddParameters(_theCommand);

			if (CreateDataSet)
			{
				DbDataAdapter myDataAdapter = NewDbDataAdapter();
				((IDbDataAdapter)myDataAdapter).SelectCommand = _theCommand;

				if ((PageSize > 0) && (CurrentPage >= 0))
				{
					myDataAdapter.Fill(theDS, PageSize * CurrentPage, PageSize, TableName);

					//	Only get the RecordCount if we are told to do so.  For performance reasons, the
					//	user may decide not to get this count becuase they do not intend to use it.

					if (GetRecordCount)
					{
						_recordCount = CalculateRecordCount(myConnection, _theCommand);
						_lastPage = (int)(Math.Ceiling(((double)_recordCount)/((double)PageSize))) - 1;

						StartRecord = CurrentPage * PageSize;
					}
				}
				else
				{
					if (MaxRecords > 0)
					{
						_recordCount = myDataAdapter.Fill(theDS, StartRecord, MaxRecords, TableName);
					}
					else
					{
						_recordCount = myDataAdapter.Fill(theDS, 0, Int32.MaxValue, TableName);
					}
				}
			}
			else
			{
				_theCommand.ExecuteNonQuery();
			}

			//	Set up the values for stored procedure output, inputoutput or returnvalue parameters.

			if (IsStoredProcedure)
			{
				if (_params != null)
				{
					foreach (HtmlGenericControl p in _params)
					{
						// See comments in AddParameters()

						Controls.Add(p);
						p.DataBind();
						Controls.Remove(p);

						if (String.Compare(p.TagName, "parameter", true) == 0)
						{
							string strDirection = (((System.Web.UI.IAttributeAccessor)p).GetAttribute("Direction") == null) ? "input" : ((System.Web.UI.IAttributeAccessor)p).GetAttribute("Direction");
							if ((string.Compare(strDirection.ToLower(), "inputoutput") == 0) || (string.Compare(strDirection.ToLower(), "output") == 0) || (string.Compare(strDirection.ToLower(), "returnvalue") == 0))
							{
								string strName = ((System.Web.UI.IAttributeAccessor)p).GetAttribute("Name"); 
								((System.Web.UI.IAttributeAccessor)p).SetAttribute("Value", ((IDataParameter)(_theCommand.Parameters[strName])).Value.ToString());
							}
						}
					}
				}
			}

			if (SuccessURL.Length != 0)
			{
				//	Using Server.Transfer fails to update the browser's address bar which is VERY confusing.
				//
				//	  Server.Transfer(SuccessURL);
				//

				if (Request.Browser.Type.ToLower().IndexOf("netscape") != -1)
				{
					//	Using Response.Redirect can cause problems in Netscape Navigator.
					//	This is particularly true if redirecting to the same page. To work around this, and we
					//	can use the following code which will work for all but the oldest browsers.

					Response.Buffer = true;
					Response.Status = "300 Multiple Choices";
					Response.AddHeader("Location", SuccessURL);
					Response.ClearContent();
					Response.Write("<html><head><meta http-equiv='refresh' content='0; URL=" + SuccessURL + "'></head><body></body></html>");
					Response.End();
				}
				else
				{
					Response.Redirect(SuccessURL);
				}
			}
		}
		catch (ThreadAbortException tae)
		{
			// Response.Redirect() throws the ThreadAbort exception.
			// When we try to redirect to the success url, we cause
			// a failure! Ignore this exception.

			// To avoid a compilation warning (CS0168), we must do something with
			// the tae variable.
			string msg = tae.Message;
		}
		catch (Exception e)
		{
			HandleException(e);
		}
		finally
		{
			if (myConnection != null)
			{
				myConnection.Close();
			}
		}
	}
}

protected void AddParameters(IDbCommand myCommand)
{
	if (_params != null)
	{
		int iParam = 0;

		foreach (HtmlGenericControl p in _params)
		{
			//	We now need to do something that isn't at all obvious.	To understand what
			//	is going on, we have to first diagram our situation.
			//
			//	This is a user control (probably named MM:DataSet or something like that).
			//	It has been instantiated on an ASPX page.  This user control has an inner
			//	tag called Parameters.	That corresponds to the property of this user
			//	control's class that has been named _params.  It is an ArrayList.  So
			//	_params is a child of this user control.  Within the Parameters tag can live
			//	one or more Parameter tags (note the lack of the s at the end).  Each
			//	Parameter tag is an HtmlGenericControl.  They get created by the ASPX page
			//	under the hood (when that page is turned into C# or VB, etc., before the
			//	.Net system compiles and links it into a DLL).	So each HtmlGenericControl
			//	is a child of the ArrayList.
			//
			//	When a page or control calls DataBind it has to have a binding container.
			//	But a binding container is only assigned to objects that have as a parent a
			//	page or control.
			//
			//	Note that the HtmlGenericControl is a child of an ArrayList, not a page or
			//	control.  Therefore, calling DataBind on it will cause an exception to be
			//	thrown.
			//
			//	We have to make a dual-parentage for these HtmlGenericControl instances.
			//	They have to be parented to a control or page.	It turns out that .Net does
			//	allow a control to parent itself to its page's controls.  So we will do
			//	the next best thing.  We'll parent the HtmlGenericControl it the user
			//	control.  It's kind of like skipping a level (because we are skipping the
			//	ArrayList).  But that's not entirely accurate because the ArrayList remains
			//	a parent of the HtmlGenericControl in the sence that it has been added to
			//	that array.  That doesn't change.  We are really just making a NEW
			//	parentage to the user control, too.
			//
			//	Note that we add the control, bind it and then immediately remove it.  The
			//	removal is needed to prevent the system from writing out this control onto
			//	the response.  We don't want <PARAMETER ...></PARAMETER> actually showing up
			//	in the HTML passed down to the browser.  If we don't do the remove, that is
			//	exactly what happens.  This would reveal a server-side control to the browser
			//	which might compromise security, etc.

			Controls.Add(p);
			p.DataBind();
			Controls.Remove(p);

			if (string.Compare(p.TagName, "parameter", true) == 0)
			{
				iParam++;

				string strName = (((System.Web.UI.IAttributeAccessor)p).GetAttribute("Name") == null) ? string.Format("parameter_{0}", iParam) : ((System.Web.UI.IAttributeAccessor)p).GetAttribute("Name"); 
				string strValue = ((System.Web.UI.IAttributeAccessor)p).GetAttribute("Value"); 
				string strType = (((System.Web.UI.IAttributeAccessor)p).GetAttribute("Type") == null) ? System.Convert.ToInt32(GetDefaultDbType()).ToString() : ((System.Web.UI.IAttributeAccessor)p).GetAttribute("Type"); 
				string strSize = ((System.Web.UI.IAttributeAccessor)p).GetAttribute("Size");
				string strDirection = (((System.Web.UI.IAttributeAccessor)p).GetAttribute("Direction") == null) ? "input" : ((System.Web.UI.IAttributeAccessor)p).GetAttribute("Direction");
				
				Enum theType = GetDbTypeFromString(strType); 

				if (strSize == null)
				{
					AddDbParameter(myCommand, strName, theType);
				}
				else
				{
					AddDbParameter(myCommand, strName, theType, Int32.Parse(strSize));
				}

				switch (strDirection.ToLower())
				{
					case "output":
						((IDataParameter)(myCommand.Parameters[strName])).Direction = ParameterDirection.Output;
						break;

					case "returnvalue":
						((IDataParameter)(myCommand.Parameters[strName])).Direction = ParameterDirection.ReturnValue;
						break;

					case "inputoutput":
					case "input":
					case "":
					{
						((IDataParameter)(myCommand.Parameters[strName])).Direction = (string.Compare(strDirection.ToLower(), "input") == 0) ? ParameterDirection.Input : ParameterDirection.InputOutput;
						
						if (strValue != null)
						{
							((IDataParameter)(myCommand.Parameters[strName])).Value = ConvertParameterValue(strValue, theType);
						}
						else
						{
							((IDataParameter)(myCommand.Parameters[strName])).Value = System.DBNull.Value;
						}
						
						break;
					}

					default:
						throw(new System.Exception("Unsupported DIRECTION attribute:  " + strDirection));
						//	break;	// There is no point breaking here because we won't reach it after we throw.
				}
			}
		}
	}
}

protected int CalculateRecordCount(IDbConnection myConnection, IDbCommand myCommand)
{
	int nReturn = 0;

	//	There are several ways to get a record count:
	//		1)	We may be given an explicit SQL command to use.  Typically, this would be
	//			either "SELECT COUNT(*) FROM sometable WHERE ..." or it would be
	//			"EXEC somestoredprocedure".  If both cases, the command should NOT rely on
	//			parameters because none will be set up for it.
	//		2)	If we were given a SELECT command in CommandText (to fill the DataSet) we
	//			can morph it into a SELECT that does a COUNT(*).
	//		3)	We can loop over all the records from the reader.  This is the slowest
	//			method so it should only be used if the number of records is reasonably small.

	string useThisRecordCountCommandText = "";
	string strSelect = "select";
	string strFrom = " from ";
	string[] strUselessClauses = {" order by ", " having ", " group by "};
	string strUnion = " union ";

	if (RecordCountCommandText.Length > 0)
	{
		useThisRecordCountCommandText = RecordCountCommandText;
	}
	else if ((CommandText.ToLower().StartsWith(strSelect)) && (CommandText.ToLower().IndexOf(strUnion) == -1))
	{
		int startCountQueryAddon = CommandText.ToLower().IndexOf(strFrom);
		if (startCountQueryAddon >= 0)
		{
			startCountQueryAddon += strFrom.Length;
			int stopCountQueryAddon = CommandText.Length;

			foreach (string s in strUselessClauses)
			{
				int uselessClauseIndex = CommandText.ToLower().IndexOf(s);
				if (uselessClauseIndex >= 0)
				{
					stopCountQueryAddon = Math.Min(stopCountQueryAddon, uselessClauseIndex);
				}
			}

			if ((startCountQueryAddon > 0) && (stopCountQueryAddon > 0))
			{
				useThisRecordCountCommandText = "SELECT COUNT(*) FROM " + CommandText.Substring(startCountQueryAddon, stopCountQueryAddon - startCountQueryAddon);
			}
		}
	}


	if (useThisRecordCountCommandText.ToLower().IndexOf("?") >= 0)
	{
		useThisRecordCountCommandText = "";
	}

	Boolean bGotCount = false;

	try
	{
		if (useThisRecordCountCommandText.Length > 0)
		{
			IDbCommand myRecordCountCommand = NewDbCommand(useThisRecordCountCommandText, myConnection);
			nReturn = Int32.Parse(myRecordCountCommand.ExecuteScalar().ToString());
			bGotCount = true;
		}
	}
	catch
	{
		//	Don't do anything; we'll get the count the hard way... below.
		//	We can get here when we have parameterized SQL statements.
	}

	if (!bGotCount)
	{
		IDataReader myRecordCountReader = myCommand.ExecuteReader();
		while (myRecordCountReader.Read())
		{
			nReturn++;
		}
		myRecordCountReader.Close();
	}

	return nReturn;
}

public void OnDataGridPageIndexChanged(Object Src, DataGridPageChangedEventArgs E)
{
	DataGrid dg = (DataGrid)Src;
	
	CurrentPage = E.NewPageIndex;

	ForceInit();

	dg.CurrentPageIndex = E.NewPageIndex;
	Page.DataBind();
}

public void OnDataGridCancel(Object Src, DataGridCommandEventArgs E)
{
	DataGrid dg = (DataGrid)Src;

	CurrentPage = dg.CurrentPageIndex;

	ForceInit();

	dg.EditItemIndex = (-1);
	Page.DataBind();
}

public void OnDataGridItemDataBound(Object Src, DataGridItemEventArgs E)
{
	DataGrid dg = (DataGrid)Src;

	do
	{
		if (null == E)
			break;

		System.Web.UI.WebControls.DataGridItem dgi = E.Item;

		if (null == dgi)
			break;

		if (dgi.ItemType != ListItemType.EditItem)
			break;
		
		if (null == dgi.DataItem)
			break;

		if (dg.EditItemIndex < 0)
			break;
		
		// If we have any edititemtemplates with dropdownlists
		// select the value for the item being edited

		String strName;
		String strType;
		int paramIndex = 0;

		foreach (System.Web.UI.WebControls.DataGridColumn col in dg.Columns)
		{
			// We only care about bound and template columns

			if ((col.GetType() != theBC.GetType()) &&
				(col.GetType() != theTC.GetType()))
			{
				continue;
			}
			
			// Ignore ReadOnly Bound columns

			if ((col.GetType() == theBC.GetType()) &&
				((System.Web.UI.WebControls.BoundColumn)col).ReadOnly)
			{
				continue;
			}
			
			// Ignore Template columns with no EditItemTemplate

			if ((col.GetType() == theTC.GetType()) &&
				(((System.Web.UI.WebControls.TemplateColumn)col).EditItemTemplate == null))
			{
				continue;
			}

			// Find the next "Parameter" tag (with a non-blank name)
			
			HtmlGenericControl p = null;

			while (paramIndex < _editOps.Count)
			{
				p = (HtmlGenericControl)_editOps[paramIndex++];

				if (string.Compare(p.TagName, "parameter", true) == 0)
				{
					strName = ((System.Web.UI.IAttributeAccessor)p).GetAttribute("Name"); 
					
					if (strName != "")
						break;
				}
			}

			if ((p == null) || (paramIndex > _editOps.Count))
			{
				throw(new System.Exception("Missing one or more EditOps Parameters."));
			}

			strName = ((System.Web.UI.IAttributeAccessor)p).GetAttribute("Name"); 
			strType = ((System.Web.UI.IAttributeAccessor)p).GetAttribute("Type");

			// We assume (and enforce in the DataGrid UI) that
			// the parameter name is the name of the control

			Object ctrl = E.Item.FindControl(strName);
		
			if (ctrl == null)
				continue;

			if (ctrl.GetType() == theDDL.GetType())
			{
				System.Web.UI.WebControls.DropDownList ddl = (System.Web.UI.WebControls.DropDownList)(ctrl);
				String currVal = DataBinder.Eval(dgi.DataItem, strName).ToString().Trim();
				ddl.SelectedIndex = ddl.Items.IndexOf(ddl.Items.FindByValue(currVal));
			}
		}
	}
	while (false);
}

public void OnDataGridEdit(Object Src, DataGridCommandEventArgs E)
{
	DataGrid dg = (DataGrid)Src;
	
	CurrentPage = dg.CurrentPageIndex;

	ForceInit();
	
	dg.EditItemIndex = (int)E.Item.ItemIndex;

	Page.DataBind();
}

public void OnDataGridUpdate(Object Src, DataGridCommandEventArgs E)
{
	DataGrid dg = (DataGrid)Src;
	IDbConnection myConnection = NewDbConnection(ConnectionString);

	try
	{
		IDbCommand cmd = NewDbCommand();
		
		// Find the name of the table to update.

		String updateTable =  "";
		
		if (_editOps == null)
		{
			throw(new System.Exception("Missing EditOps Tag."));
		}
		
		foreach (HtmlGenericControl p in _editOps)
		{
			//	See comments in AddParameters
	
			Controls.Add(p);
			p.DataBind();
			Controls.Remove(p);

			if (string.Compare(p.TagName, "EditOpsTable", true) == 0)
			{
				updateTable = ((System.Web.UI.IAttributeAccessor)p).GetAttribute("Name");
				break;
			}
		}
		
		if (updateTable == "")
		{
			throw(new System.Exception("Missing EditOps Table Name."));
		}

		// Build the UPDATE sql statement

		cmd.CommandText = "UPDATE " + updateTable + " SET ";
		cmd.Connection = myConnection;
		cmd.CommandType = CommandType.Text;

		Enum theType;
		String strName;
		String strType;
		String strValue = "";
		String strPrimaryKey = dg.DataKeyField;
		String strPrimaryKeyType = "";
		String paramName = "";
		String cmdParamName = "";
		Boolean addComma = false;
		int columnIndex = 0;
		int paramIndex = 0;

		foreach (System.Web.UI.WebControls.DataGridColumn col in dg.Columns)
		{
			// We only care about bound and template columns

			if ((col.GetType() != theBC.GetType()) &&
				(col.GetType() != theTC.GetType()))
			{
				columnIndex++;
				continue;
			}
			
			// Ignore ReadOnly Bound columns

			if ((col.GetType() == theBC.GetType()) &&
				((System.Web.UI.WebControls.BoundColumn)col).ReadOnly)
			{
				columnIndex++;
				continue;
			}
			
			// Ignore Template columns with no EditItemTemplate

			if ((col.GetType() == theTC.GetType()) &&
				(((System.Web.UI.WebControls.TemplateColumn)col).EditItemTemplate == null))
			{
				columnIndex++;
				continue;
			}

			// Find the next "Parameter" tag (with a non-blank name)
			
			HtmlGenericControl p = null;

			while (paramIndex < _editOps.Count)
			{
				p = (HtmlGenericControl)_editOps[paramIndex++];

				if (string.Compare(p.TagName, "parameter", true) == 0)
				{
					strName = ((System.Web.UI.IAttributeAccessor)p).GetAttribute("Name"); 
					
					if (strName != "")
						break;
				}
			}

			if ((p == null) || (paramIndex > _editOps.Count))
			{
				throw(new System.Exception("Missing one or more EditOps Parameters."));
			}

			strName = ((System.Web.UI.IAttributeAccessor)p).GetAttribute("Name"); 
			strType = ((System.Web.UI.IAttributeAccessor)p).GetAttribute("Type");

			String strIsPrimary = ((System.Web.UI.IAttributeAccessor)p).GetAttribute("IsPrimary");

			if ((strIsPrimary != null) &&
				(strIsPrimary != "") &&
				Boolean.Parse(strIsPrimary))
			{
				strPrimaryKeyType = strType;
			}
			
			if (col.GetType() == theBC.GetType())
			{
				// Bound columns are always TextBoxes

				strValue = ((System.Web.UI.WebControls.TextBox)E.Item.Cells[columnIndex].Controls[0]).Text;
			}
			else
			{
				// We assume (and enforce in the DataGrid UI) that
				// the parameter name is the name of the control

				Object ctrl = E.Item.FindControl(strName);
		
				if (ctrl == null)
				{
					throw(new System.Exception("Control not found in DataGrid column: " + strName));
				}

				if (ctrl.GetType() == theTB.GetType())
				{
					strValue = ((System.Web.UI.WebControls.TextBox)ctrl).Text;
				}
				else if (ctrl.GetType() == theCB.GetType())
				{
					strValue = ((System.Web.UI.WebControls.CheckBox)ctrl).Checked ? "true" : "false";
				}
				else if (ctrl.GetType() == theDDL.GetType())
				{
					strValue = ((System.Web.UI.WebControls.DropDownList)ctrl).SelectedItem.Value;
				}
				else
				{
					throw(new System.Exception("Unsupported control type in DataGrid column: " + (ctrl.GetType()).ToString()));
				}
			}

			// Update the sql and parameter collection

			if (addComma)
			{
				cmd.CommandText += ", ";
			}

			theType = GetDbTypeFromString(strType);

			paramName = "@" + strName;

			switch (DatabaseType.ToLower())
			{
				case "oledb":
					cmdParamName = "?";
					break;
				case "sqlserver":
				default:
					cmdParamName = paramName;
					break;
			}

			cmd.CommandText += strName + "=" + cmdParamName;
			AddDbParameter(cmd, paramName, theType);
			((IDataParameter)(cmd.Parameters[paramName])).Value = ConvertParameterValue(strValue, theType);

			addComma = true;

			columnIndex++;
		}
		
		// Finish the sql statement

		paramName = "@" + strPrimaryKey;

		switch (DatabaseType.ToLower())
		{
			case "oledb":
				cmdParamName = "?";
				break;
			case "sqlserver":
				cmdParamName = paramName;
				break;
		}

		cmd.CommandText += " WHERE " + strPrimaryKey + "=" + cmdParamName;

		// If we didn't already find the primary key, we'd better
		// have one more parameter left over

		if (strPrimaryKeyType == "")
		{
			if (paramIndex >= _editOps.Count)
			{
				throw(new System.Exception("Missing Primary Key Parameter."));
			}
			
			HtmlGenericControl p = null;
			
			while (paramIndex < _editOps.Count)
			{
				p = (HtmlGenericControl)_editOps[paramIndex++];

				if (string.Compare(p.TagName, "parameter", true) == 0)
				{
					strName = ((System.Web.UI.IAttributeAccessor)p).GetAttribute("Name"); 
					
					if (strName != "")
						break;
				}
			}

			if ((p == null) || (paramIndex > _editOps.Count))
			{
				throw(new System.Exception("Missing Primary Key Parameter."));
			}

			strPrimaryKey = ((System.Web.UI.IAttributeAccessor)p).GetAttribute("Name"); 
			strPrimaryKeyType = ((System.Web.UI.IAttributeAccessor)p).GetAttribute("Type");
		}

		AddDbParameter(cmd, paramName, GetDbTypeFromString(strPrimaryKeyType));
		((IDataParameter)(cmd.Parameters[paramName])).Value = dg.DataKeys[E.Item.ItemIndex];

		myConnection.Open();
		
		cmd.ExecuteNonQuery();
	}
	catch (Exception e)
	{
		HandleException(e);
	}
	finally
	{
		myConnection.Close(); 
	}

	CurrentPage = dg.CurrentPageIndex;

	ForceInit();
	
	dg.EditItemIndex = (-1);
	Page.DataBind();
}

public void OnDataGridDelete(Object Src, DataGridCommandEventArgs E)
{
	DataGrid dg = (DataGrid)Src;
	IDbConnection myConnection = NewDbConnection(ConnectionString);

	try
	{
		// Find the name of the table to update.

		String deleteFromTable =  "";
		
		if (_editOps == null)
		{
			throw(new System.Exception("Missing EditOps Tag."));
		}
		
		foreach (HtmlGenericControl p in _editOps)
		{
			//	See comments in AddParameters
	
			Controls.Add(p);
			p.DataBind();
			Controls.Remove(p);

			if (string.Compare(p.TagName, "EditOpsTable", true) == 0)
			{
				deleteFromTable = ((System.Web.UI.IAttributeAccessor)p).GetAttribute("Name");
				break;
			}
		}
		
		if (deleteFromTable == "")
		{
			throw(new System.Exception("Missing EditOps Table Name."));
		}
		
		IDbCommand cmd = NewDbCommand();
		
		// Build the DELETE sql statement

		String paramName = "@" + dg.DataKeyField;
		String cmdParamName = "";

		switch (DatabaseType.ToLower())
		{
			case "oledb":
				cmdParamName = "?";
				break;
			case "sqlserver":
				cmdParamName = paramName;
				break;
		}

		cmd.CommandText = "DELETE FROM " + deleteFromTable + " WHERE " + dg.DataKeyField + "=" + cmdParamName;
		cmd.Connection = myConnection;
		cmd.CommandType = CommandType.Text;
		AddDbParameter(cmd, paramName, dg.DataKeys[E.Item.ItemIndex]);

		myConnection.Open();	
		
		cmd.ExecuteNonQuery();
	}
	catch (Exception e)
	{
		HandleException(e);
	}
	finally
	{
		myConnection.Close(); 
	}

	try
	{
		CurrentPage = dg.CurrentPageIndex;

		ForceInit();
			
		dg.EditItemIndex = (-1);
		Page.DataBind();
	}
	catch (Exception e)
	{
		//	There's an oddball case where we have deleted the sole row on the last
		//	page of the DataGrid.  In that case, our previous attempt to set
		//	bind will throw an exception.  We should try again, with a newly
		//	calculated PageCount from the DataGrid as the upper bound of the
		//	page index for the DataGrid.

		dg.CurrentPageIndex = Math.Min(dg.CurrentPageIndex, (dg.PageCount - 1));
		CurrentPage = dg.CurrentPageIndex;

		ForceInit();
			
		dg.EditItemIndex = (-1);
		Page.DataBind();

		// To avoid a compilation warning (CS0168), we must do something with
		// the tae variable.

		string msg = e.Message;
	}
}

public Enum GetDbTypeFromString(string str)
{
	Enum retValue = OleDbType.VarChar;	// Initialize to anything just to get it to compile; we'll reinitialize again below.

	switch (DatabaseType.ToLower())
	{
		case "sqlserver":
			retValue = OleDbType.VarChar;

			try
			{
				retValue = (SqlDbType)Int32.Parse(str); 
			}
			catch (FormatException e)
			{
				// To avoid a compilation warning (CS0168), we must do something with
				// the e variable.

				string msg = e.Message;

				//	If the given string does not contain a number (i.e., an int casting of an OleDbType)
				//	then it may contain a type that is a string representation like Single, VarChar, etc.

				switch(str.ToLower())
				{
					case "bigint":
						retValue = SqlDbType.BigInt;
						break;
					case "bit":
						retValue = SqlDbType.Bit;
						break;
					case "char":
						retValue = SqlDbType.Char;
						break;
					case "datetime":
						retValue = SqlDbType.DateTime;
						break;
					case "decimal":
						retValue = SqlDbType.Decimal;
						break;
					case "float":
						retValue = SqlDbType.Float;
						break;
					case "int":
						retValue = SqlDbType.Int;
						break;
					case "money":
						retValue = SqlDbType.Money;
						break;
					case "nchar":
						retValue = SqlDbType.NChar;
						break;
					case "ntext":
						retValue = SqlDbType.NText;
						break;
					case "nvarchar":
						retValue = SqlDbType.NVarChar;
						break;
					case "real":
						retValue = SqlDbType.Real;
						break;
					case "smalldatetime":
						retValue = SqlDbType.SmallDateTime;
						break;
					case "smallint":
						retValue = SqlDbType.SmallInt;
						break;
					case "smallmoney":
						retValue = SqlDbType.SmallMoney;
						break;
					case "text":
						retValue = SqlDbType.Text;
						break;
					case "timestamp":
						retValue = SqlDbType.Timestamp;
						break;
					case "tinyint":
						retValue = SqlDbType.TinyInt;
						break;
					case "uniqueidentifier":
						retValue = SqlDbType.UniqueIdentifier;
						break;
					case "varchar":
						retValue = SqlDbType.VarChar;
						break;
					default:
						//	Cases not covered are:
						//	SqlDbType.Binary
						//	SqlDbType.Image
						//	SqlDbType.VarBinary
						//	SqlDbType.Variant

						throw(new System.Exception("Unsupported TYPE attribute:  " + str));
						// break;  // There is no point breaking here because we won't reach it after we throw.
				}
			}
			break;

		case "oledb":
			retValue = OleDbType.VarChar;

			try
			{
				retValue = (OleDbType)Int32.Parse(str); 
			}
			catch (FormatException e)
			{
				// To avoid a compilation warning (CS0168), we must do something with
				// the e variable.

				string msg = e.Message;

				//	If the given string does not contain a number (i.e., an int casting of an OleDbType)
				//	then it may contain a type that is a string representation like Single, VarChar, etc.

				switch(str.ToLower())
				{
					case "bigint":
						retValue = OleDbType.BigInt;
						break;
					case "boolean":
						retValue = OleDbType.Boolean;
						break;
					case "bstr":
						retValue = OleDbType.BSTR;
						break;
					case "char":
						retValue = OleDbType.Char;
						break;
					case "currency":
						retValue = OleDbType.Currency;
						break;
					case "date":
						retValue = OleDbType.Date;
						break;
					case "dbdate":
						retValue = OleDbType.DBDate;
						break;
					case "dbtime":
						retValue = OleDbType.DBTime;
						break;
					case "dbtimestamp":
						retValue = OleDbType.DBTimeStamp;
						break;
					case "decimal":
						retValue = OleDbType.Decimal;
						break;
					case "double":
						retValue = OleDbType.Double;
						break;
					case "filetime":
						retValue = OleDbType.Filetime;
						break;
					case "integer":
						retValue = OleDbType.Integer;
						break;
					case "longvarchar":
						retValue = OleDbType.LongVarChar;
						break;
					case "longvarwchar":
						retValue = OleDbType.LongVarWChar;
						break;
					case "numeric":
						retValue = OleDbType.Numeric;
						break;
					case "single":
						retValue = OleDbType.Single;
						break;
					case "smallint":
						retValue = OleDbType.SmallInt;
						break;
					case "tinyint":
						retValue = OleDbType.TinyInt;
						break;
					case "unsignedbigint":
						retValue = OleDbType.UnsignedBigInt;
						break;
					case "unsignedint":
						retValue = OleDbType.UnsignedInt;
						break;
					case "unsignedsmallint":
						retValue = OleDbType.UnsignedSmallInt;
						break;
					case "unsignedtinyint":
						retValue = OleDbType.UnsignedTinyInt;
						break;
					case "varchar":
						retValue = OleDbType.VarChar;
						break;
					case "varnumeric":
						retValue = OleDbType.VarNumeric;
						break;
					case "varwchar":
						retValue = OleDbType.VarWChar;
						break;
					case "wchar":
						retValue = OleDbType.WChar;
						break;
					default:
						//	Cases not covered are:
						//	OleDbType.Binary
						//	OleDbType.Empty
						//	OleDbType.Error
						//	OleDbType.Guid
						//	OleDbType.IDispatch
						//	OleDbType.IUnknown
						//	OleDbType.LongVarBinary
						//	OleDbType.PropVariant
						//	OleDbType.VarBinary
						//	OleDbType.Variant

						throw(new System.Exception("Unsupported TYPE attribute:  " + str));
						// break;  // There is no point breaking here because we won't reach it after we throw.
				}
			}
			break;
	}

	return retValue;
}

//  FieldValueAtIndex
//
//  PURPOSE:  This function determines the value of a named field within some row within
//		this DataSet.  The tricky part is determining which row is desired.  Consider an
//		example.  Suppose we have a page containing 3 DataSets:  ds1, ds2 and ds3.  This
//		page might contain a DataGrid, g1, bound to ds1.  Within the DataGrid may be
//		with a TemplateColumn containing a Repeater, r1, bound to ds2.  Within the Repeater
//		might be an ItemTemplate containing ds1.FieldValue("foo", Container) as well as
//		ds2.FieldValue("bar", Container).  Outside the whole DataGrid might be another
//		Repeater, r2, bound to ds1 containing an ItemTemplate containing
//		ds1.FieldValue("foo", Container) and ds3.FieldValue("xyz", Container).  We can
//		diagram this as:
//
//		DataSet ds1
//		DataSet ds2
//		DataSet ds3
//
//		DataGrid g1 bound to ds1
//			TemplateColumn
//				ItemTemplate
//					Repeater r1 bound to ds2
//						ItemTemplate
//							ds1.FieldValue("foo", Container)  [use the row in ds1 that g1 is currently processing]
//							ds2.FieldValue("bar", Container)  [use the row in ds2 that r1 is currrently processing]
//
//		Repeater r2 bound to ds1
//			ds1.FieldValue("foo", Container) [use the row in ds1 that r2 is currently processing]
//			ds3.FieldValue("xyz", Container) [use the 0th row in ds3]
//		
//		The challenge presented to this method is to resolve the field values according to the
//		description shown above in square brackets.
//
public string FieldValueAtIndex(int Index, string FieldName, System.Web.UI.Control Container)
{
	string strReturn = "";  // contains the field value that we eventually resolve to

	try
	{
		//  Make some objects so we can get their types to use later in comparisons.

		System.Web.UI.WebControls.Repeater theRepeater = new System.Web.UI.WebControls.Repeater();
		System.Web.UI.WebControls.DataList theDataList = new System.Web.UI.WebControls.DataList();
		System.Web.UI.WebControls.DataGrid theDataGrid = new System.Web.UI.WebControls.DataGrid();

		System.Web.UI.WebControls.RepeaterItem repeaterItemContainer = new System.Web.UI.WebControls.RepeaterItem(0, ListItemType.Item);
		System.Web.UI.WebControls.DataListItem dataListItemContainer = new System.Web.UI.WebControls.DataListItem(0, ListItemType.Item);
		System.Web.UI.WebControls.DataGridItem dataGridItemContainer = new System.Web.UI.WebControls.DataGridItem(0, 0, ListItemType.Item);

		Type repeaterType = theRepeater.GetType();
		Type dataListType = theDataList.GetType();
		Type dataGridType = theDataGrid.GetType();
		 
		Type repeaterItemType = repeaterItemContainer.GetType();
		Type dataListItemType = dataListItemContainer.GetType();
		Type dataGridItemType = dataGridItemContainer.GetType();

		theRepeater = null;
		theDataList = null;
		theDataGrid = null;

		//  We will now figure out what control (Repeater, DataList or DataGrid) this DataSet
		//  has been bound to.  Later we can figure out what row that control is presently
		//  processing.

		Control theParent = null;

		if (Container != null)
		{
			theParent = Container.Parent;
			while (theParent != null)
			{
				if (repeaterType.IsInstanceOfType(theParent))
				{
					theRepeater = (System.Web.UI.WebControls.Repeater)theParent;
					if (theRepeater.DataSource == this.DefaultView)
					{
						break;
					}
				}
				else if (dataListType.IsInstanceOfType(theParent))
				{
					theDataList = (System.Web.UI.WebControls.DataList)theParent;
					if (theDataList.DataSource == this.DefaultView)
					{
						break;
					}
				}
				else if (dataGridType.IsInstanceOfType(theParent))
				{
					theDataGrid = (System.Web.UI.WebControls.DataGrid)theParent;
					if (theDataGrid.DataSource == this.DefaultView)
					{
						break;
					}
				}

				theParent = theParent.Parent;
			}

			//  Finding the control that this DataSet is bound to isn't enough.  
			//  We have to get the field value of a the right record within
			//  that DataSet.  That is, we have to find the row in that DataSet
			//  that the Repeater or DataList or DataGrid is currently processing.

			if (theParent != null)
			{
				Control candidateBindingContainer = Container;
				while (candidateBindingContainer != null)
				{
					while ((candidateBindingContainer == null) ||
						   ((!repeaterItemType.IsInstanceOfType(candidateBindingContainer)) &&
							(!dataListItemType.IsInstanceOfType(candidateBindingContainer)) &&
							(!dataGridItemType.IsInstanceOfType(candidateBindingContainer))))
					{
						try
						{
							candidateBindingContainer = candidateBindingContainer.BindingContainer;
						}
						catch
						{
							candidateBindingContainer = null;
						}
					}

					if (candidateBindingContainer != null)
					{
						if (repeaterType.IsInstanceOfType(theParent))
						{
							if ((candidateBindingContainer.Parent != null) &&
							    (candidateBindingContainer.Parent == theRepeater))
							{
								strReturn = ((DataView)(theRepeater.DataSource))[((RepeaterItem)candidateBindingContainer).ItemIndex][FieldName].ToString();
								return strReturn;
							}
						}
						else if (dataListType.IsInstanceOfType(theParent))
						{
							if ((candidateBindingContainer.Parent != null) &&
							    (candidateBindingContainer.Parent == theDataList))
							{
								strReturn = ((DataView)(theDataList.DataSource))[((DataListItem)candidateBindingContainer).ItemIndex][FieldName].ToString();
								return strReturn;
							}
						}
						else if (dataGridType.IsInstanceOfType(theParent))
						{
							if ((candidateBindingContainer.Parent != null) &&
								(candidateBindingContainer.Parent.Parent != null) &&
							    (candidateBindingContainer.Parent.Parent == theDataGrid))
							{
								strReturn = ((DataView)(theDataGrid.DataSource))[((DataGridItem)candidateBindingContainer).ItemIndex][FieldName].ToString();
								return strReturn;
							}
						}

						candidateBindingContainer = candidateBindingContainer.Parent;
					}
				}
			}
		}

		//  If we haven't found the parent control then we must fall back on something
		//  safe:  simply access the field value at the given index.

		if (theParent == null)
		{
			strReturn = DefaultView[Index][FieldName].ToString();
		}
	}
	catch
	{
	}

	return strReturn.Trim();
}

public string FieldValue(string FieldName, System.Web.UI.Control Container)
{
	return FieldValueAtIndex(0, FieldName, Container);
}

public object ParameterValue(string ParameterName)
{
	return ((IDataParameter)(_theCommand.Parameters[ParameterName])).Value;
}

public void HandleException(Exception e)
{
	if (Expression)
	{
		if (Debug)
		{
			string _nextExceptionString = e.ToString();

			// Format the exception string so that it looks
			// good as both text and html.

			_exceptionString += _nextExceptionString.Replace("\n", "<br>\n") + "<hr>";
	
			String nonXHTMLStr = System.Configuration.ConfigurationSettings.AppSettings["MM_USE_NON_XHTML_COMPLIANT_EXCEPTION_REPORTING"];
			Boolean nonXHTML = false;
			
			if (nonXHTMLStr != "")
			{
				nonXHTML = System.Convert.ToBoolean(nonXHTMLStr);
			}

			if (nonXHTML)
			{
				Controls.AddAt(0, new LiteralControl(_exceptionString));
			}
			else
			{
				Response.Write(_exceptionString);
			}
		}
		else if (FailureURL.Length != 0)
		{
			//	Using Server.Transfer fails to update the browser's address bar which is VERY confusing.
			//
			//	  Server.Transfer(FailureURL);
			//

			if (Request.Browser.Type.ToLower().IndexOf("netscape") != -1)
			{
				//	Using Response.Redirect can cause problems in Netscape Navigator.
				//	This is particularly true if redirecting to the same page. To work around this, and we
				//	can use the following code which will work for all but the oldest browsers.

				Response.Buffer = true;
				Response.Status = "300 Multiple Choices";
				Response.AddHeader("Location", FailureURL);
				Response.ClearContent();
				Response.Write("<html><head><meta http-equiv='refresh' content='0; URL=" + FailureURL + "'></head><body></body></html>");
				Response.End();
			}
			else
			{
				Response.Redirect(FailureURL);
			}
		}
	}
}

Object ConvertParameterValue(string strValue, Enum theType)
{
	Object ret = null;

	switch (DatabaseType.ToLower())
	{
		case "sqlserver":

			switch ((SqlDbType)theType)
			{
				case SqlDbType.Char:
				case SqlDbType.NChar:
				case SqlDbType.NText:
				case SqlDbType.NVarChar:
				case SqlDbType.Text:
				case SqlDbType.VarChar:
				{
					ret = strValue;
					break;
				}
					
				case SqlDbType.Bit:
				{
					// asp:checkbox returns "on" for true and an empty string
					// for false, but Boolean.Parse() doesn't accept either of
					// those as valid "boolean" strings.
					
					if (strValue == "on")
					{
						strValue = "true";
					}
					else if (strValue == "")
					{
						strValue = "false";
					}
					
					ret = Boolean.Parse(strValue);
					break;
				}

				default:
				{
					// None of these types support empty values.
					// If we encounter an empty value, set the
					// value to DBNull.
			
					if (strValue == "")
					{
						ret = System.DBNull.Value;
						break;
					}

					switch((SqlDbType)theType)
					{
						case SqlDbType.BigInt:
							ret = Int64.Parse(strValue);
							break;
						case SqlDbType.DateTime:
						case SqlDbType.SmallDateTime:
							ret = DateTime.Parse(strValue);
							break;
						case SqlDbType.Decimal:
							ret = Decimal.Parse(strValue);
							break;
						case SqlDbType.Float:
							ret = Double.Parse(strValue);
							break;
						case SqlDbType.Int:
							ret = Int32.Parse(strValue);
							break;
						case SqlDbType.Money:
						case SqlDbType.SmallMoney:
							ret = Decimal.Parse(strValue, NumberStyles.Currency);
							break;
						case SqlDbType.Real:
							ret = Single.Parse(strValue);
							break;
						case SqlDbType.SmallInt:
							ret = Int16.Parse(strValue);
							break;
						case SqlDbType.Timestamp:
							ret = DateTime.Parse(strValue);
							break;
						case SqlDbType.TinyInt:
							ret = Byte.Parse(strValue);
							break;
						case SqlDbType.UniqueIdentifier:
						case SqlDbType.Binary:
						case SqlDbType.Image:
						case SqlDbType.VarBinary:
						case SqlDbType.Variant:
						default:

							throw(new System.Exception("Unsupported TYPE attribute:  " + theType.ToString()));
							// break;  // There is no point breaking here because we won't reach it after we throw.
					}
					break;
				}
			}

			break;

		case "oledb":

			switch ((OleDbType)theType)
			{
				case OleDbType.Char:
				case OleDbType.BSTR:
				case OleDbType.LongVarChar:
				case OleDbType.LongVarWChar:
				case OleDbType.VarChar:
				case OleDbType.VarWChar:
				case OleDbType.WChar:
				{
					ret = strValue;
					break;
				}
					
				case OleDbType.Boolean:
				{
					// asp:checkbox returns "on" for true and an empty string
					// for false, but Boolean.Parse() doesn't accept either of
					// those as valid "boolean" strings.
					
					if (strValue == "on")
					{
						strValue = "true";
					}
					else if (strValue == "")
					{
						strValue = "false";
					}
					
					ret = Boolean.Parse(strValue);
					break;
				}

				default:
				{
					// None of these types support empty values.
					// If we encounter an empty value, set the
					// value to DBNull.
			
					if (strValue == "")
					{
						ret = System.DBNull.Value;
						break;
					}

					switch((OleDbType)theType)
					{
						case OleDbType.BigInt:
							ret = Int64.Parse(strValue);
							break;
						case OleDbType.Currency:
							ret = Decimal.Parse(strValue, NumberStyles.Currency);
							break;
						case OleDbType.Date:
						case OleDbType.DBDate:
						case OleDbType.Filetime:
							ret = DateTime.Parse(strValue);
							break;
						case OleDbType.DBTime:
							ret = TimeSpan.Parse(strValue);
							break;
						case OleDbType.DBTimeStamp:
							ret = DateTime.Parse(strValue);
							break;
						case OleDbType.Decimal:
						case OleDbType.Numeric:
						case OleDbType.VarNumeric:
							ret = Decimal.Parse(strValue);
							break;
						case OleDbType.Double:
							ret = Double.Parse(strValue);
							break;
						case OleDbType.Integer:
							ret = Int32.Parse(strValue);
							break;
						case OleDbType.Single:
							ret = float.Parse(strValue);
							break;
						case OleDbType.SmallInt:
							ret = Int16.Parse(strValue);
							break;
						case OleDbType.TinyInt:
							ret = SByte.Parse(strValue);
							break;
						case OleDbType.UnsignedBigInt:
							ret = UInt64.Parse(strValue);
							break;
						case OleDbType.UnsignedInt:
							ret = UInt32.Parse(strValue);
							break;
						case OleDbType.UnsignedSmallInt:
							ret = UInt16.Parse(strValue);
							break;
						case OleDbType.UnsignedTinyInt:
							ret = byte.Parse(strValue);
							break;
						case OleDbType.Binary:
						case OleDbType.Empty:
						case OleDbType.Error:
						case OleDbType.Guid:
						case OleDbType.IDispatch:
						case OleDbType.IUnknown:
						case OleDbType.LongVarBinary:
						case OleDbType.PropVariant:
						case OleDbType.VarBinary:
						case OleDbType.Variant:
						default:
							throw(new System.Exception("Unsupported TYPE attribute:  " + theType.ToString()));
							// break;  // There is no point breaking here because we won't reach it after we throw.
					}
					break;
				}
			}

			break;
	}

	return ret;
}

private IDbCommand NewDbCommand()
{
	IDbCommand theCommand;
	switch (DatabaseType.ToLower())
	{
		case "sqlserver":
			theCommand = new SqlCommand();
			break;
		case "oledb":
		default:
			theCommand = new OleDbCommand();
			break;
	}

	return theCommand;
}

private IDbCommand NewDbCommand(string strCommandText, IDbConnection theConnection)
{
	IDbCommand theCommand;
	switch (DatabaseType.ToLower())
	{
		case "sqlserver":
			theCommand = new SqlCommand(strCommandText, (SqlConnection)theConnection);
			break;
		case "oledb":
		default:
			theCommand = new OleDbCommand(strCommandText, (OleDbConnection)theConnection);
			break;
	}

	return theCommand;
}

private IDbConnection NewDbConnection(string strConnection)
{
	IDbConnection theConnection;
	switch (DatabaseType.ToLower())
	{
		case "sqlserver":
			theConnection = new SqlConnection(strConnection);
			break;
		case "oledb":
		default:
			theConnection = new OleDbConnection(strConnection);
			break;
	}

	return theConnection;
}

private DbDataAdapter NewDbDataAdapter()  // note that this returns an object, not an interface
{
	DbDataAdapter theDataAdapter;
	switch (DatabaseType.ToLower())
	{
		case "sqlserver":
			theDataAdapter = new SqlDataAdapter();
			break;
		case "oledb":
		default:
			theDataAdapter = new OleDbDataAdapter();
			break;
	}

	return theDataAdapter;
}

private Enum GetDefaultDbType()
{
	Enum theType;
	switch (DatabaseType.ToLower())
	{
		case "sqlserver":
			theType = SqlDbType.VarChar;
			break;
		case "oledb":
		default:
			theType = OleDbType.VarChar;
			break;
	}

	return theType;
}

private void AddDbParameter(IDbCommand cmd, string strName, object obj)
{
	//	There is no Add method in the IDataParametersCollection interface.
	//	So, unfortunatetly, we have to directly cast here.

	switch (DatabaseType.ToLower())
	{
		case "sqlserver":
			((SqlCommand)cmd).Parameters.Add(strName, obj);
			break;
		case "oledb":
		default:
			((OleDbCommand)cmd).Parameters.Add(strName, obj);
			break;
	}
}

private void AddDbParameter(IDbCommand cmd, string strName, Enum theType)
{
	//	There is no Add method in the IDataParametersCollection interface.
	//	So, unfortunatetly, we have to directly cast here.

	switch (DatabaseType.ToLower())
	{
		case "sqlserver":
			((SqlCommand)cmd).Parameters.Add(strName, (SqlDbType)theType);
			break;
		case "oledb":
		default:
			((OleDbCommand)cmd).Parameters.Add(strName, (OleDbType)theType);
			break;
	}
}

private void AddDbParameter(IDbCommand cmd, string strName, Enum theType, int nSize)
{
	//	There is no Add method in the IDataParametersCollection interface.
	//	So, unfortunatetly, we have to directly cast here.

	switch (DatabaseType.ToLower())
	{
		case "sqlserver":
			((SqlCommand)cmd).Parameters.Add(strName, (SqlDbType)theType, nSize);
			break;
		case "oledb":
		default:
			((OleDbCommand)cmd).Parameters.Add(strName, (OleDbType)theType, nSize);
			break;
	}
}

public DataSet()
{
	if ((DreamweaverCtrls.DataSet.__intialized == false))
	{
		DreamweaverCtrls.DataSet.__intialized = true;
	}
}

protected override int AutoHandlers
{
	get
	{
		return DreamweaverCtrls.DataSet.__autoHandlers;
	}
	set
	{
		DreamweaverCtrls.DataSet.__autoHandlers = value;
	}
}

protected System.Web.HttpApplication ApplicationInstance
{
	get
	{
		return ((System.Web.HttpApplication)(this.Context.ApplicationInstance));
	}
}

public override string TemplateSourceDirectory
{
	get
	{
		return "/bin";
	}
}

private void __BuildControlTree(System.Web.UI.Control __ctrl)
{
}

protected override void FrameworkInitialize()
{
	this.__BuildControlTree(this);
}

}  //  end of class DataSet

//*************************************************************************************

[System.Runtime.CompilerServices.CompilerGlobalScopeAttribute()]
public class Insert : DataSet
{
}

//*************************************************************************************

[System.Runtime.CompilerServices.CompilerGlobalScopeAttribute()]
public class Update : DataSet
{
}

//*************************************************************************************

[System.Runtime.CompilerServices.CompilerGlobalScopeAttribute()]
public class Delete : DataSet
{
}

//*************************************************************************************

[System.Runtime.CompilerServices.CompilerGlobalScopeAttribute()]
public class PageBind : System.Web.UI.UserControl
{
private static int __autoHandlers;
private static bool __intialized = false;

public Boolean PostBackBind = true;
public Boolean Ignore = false;
private Boolean MustDoBind = true;

static System.Web.UI.WebControls.DataGrid theDataGrid = new System.Web.UI.WebControls.DataGrid();

protected void Page_DataBind(Object src, EventArgs E)
{
	MustDoBind = false;
}

protected void Page_Load(Object src, EventArgs E)
{
	if (!Ignore)
	{
		// We don't want to bind if this is the result of clicking
		// on a DataGrid editCommand or delete button.
		// The buttons can be links or push buttons. Unfortunately,
		// they work differently.

		// Detect the hyperlink case...

		String eventTarget = Request.Form["__EVENTTARGET"];

		if (eventTarget != null)
		{
			int index = eventTarget.IndexOf(":");

			if (index >= 0)
			{
				eventTarget = eventTarget.Substring(0, index);

				Object ctrl = Page.FindControl(eventTarget);
				
				if (ctrl != null)
				{
					if (ctrl.GetType() == theDataGrid.GetType())
					{
						Ignore = true;
					}
				}
			}
		}
	
	}
	
	if (!Ignore)
	{			
		// Detect the pushbutton case...
		//
		// We need to figure out which button submitted the form and
		// then figure out if that button belongs to a DataGrid.
		
		String[] formCtrlNames = Request.Form.AllKeys;
		
		for (int index = 0; index < formCtrlNames.Length; index++) 
		{
			String name = formCtrlNames[index];

			// The buttons we're interested in will have names like...
			// DataGrid1:_ctl12:_ctl0, so look for something like that
			
			int strIndex = name.IndexOf(":_ctl");
			
			if (strIndex == (-1))
				continue;

			// See if it has a value
			
			if (Request.Form[name] == null)
				continue;
				
			// The first part of the name is the parent control
			// See if it's a DataGrid
			
			name = name.Substring(0, strIndex);

			Object ctrl = Page.FindControl(name);
			
			if (ctrl != null)
			{
				if (ctrl.GetType() == theDataGrid.GetType())
				{
					Ignore = true;
					break;
				}
			}
		}
	}

	if (MustDoBind && (!Ignore))
	{
		if ((!Page.IsPostBack) || (PostBackBind))
		{
			Parent.DataBind();
		}
	}
}
        
public PageBind()
{
	if ((DreamweaverCtrls.PageBind.__intialized == false))
	{
		DreamweaverCtrls.PageBind.__intialized = true;
	}
}

protected override int AutoHandlers
{
	get
	{
		return DreamweaverCtrls.PageBind.__autoHandlers;
	}
	set
	{
		DreamweaverCtrls.PageBind.__autoHandlers = value;
	}
}

protected System.Web.HttpApplication ApplicationInstance
{
	get
	{
		return ((System.Web.HttpApplication)(this.Context.ApplicationInstance));
	}
}

public override string TemplateSourceDirectory
{
	get
	{
		return "/bin";
	}
}

private void __BuildControlTree(System.Web.UI.Control __ctrl)
{
}

protected override void FrameworkInitialize()
{
	this.__BuildControlTree(this);
}

}  //  end of class PageBind

//*************************************************************************************

[System.Runtime.CompilerServices.CompilerGlobalScopeAttribute()]
public class If : System.Web.UI.UserControl
{
private static int __autoHandlers;
private static bool __intialized = false;

protected System.Web.UI.WebControls.PlaceHolder foo;
public Boolean Expression = true;

private ITemplate _contentsTemplate;      
public ITemplate ContentsTemplate
{
	get { return _contentsTemplate; }
	set { _contentsTemplate = value; }
}

protected void Page_Load(Object src, EventArgs E)
{
	if ((_contentsTemplate != null) && Expression)
	{
		_contentsTemplate.InstantiateIn(foo);
		DataBind();
	}
}

public If()
{
	if ((DreamweaverCtrls.If.__intialized == false))
	{
		DreamweaverCtrls.If.__intialized = true;
	}
}

protected override int AutoHandlers
{
	get
	{
		return DreamweaverCtrls.If.__autoHandlers;
	}
	set
	{
		DreamweaverCtrls.If.__autoHandlers = value;
	}
}

protected System.Web.HttpApplication ApplicationInstance
{
	get
	{
		return ((System.Web.HttpApplication)(this.Context.ApplicationInstance));
	}
}

public override string TemplateSourceDirectory
{
	get
	{
		return "/bin";
	}
}

private System.Web.UI.Control __BuildControlfoo()
{
	System.Web.UI.WebControls.PlaceHolder __ctrl;
	__ctrl = new System.Web.UI.WebControls.PlaceHolder();
	this.foo = __ctrl;
	__ctrl.ID = "foo";
	return __ctrl;
}

private void __BuildControlTree(System.Web.UI.Control __ctrl)
{
	this.__BuildControlfoo();
	System.Web.UI.IParserAccessor __parser = ((System.Web.UI.IParserAccessor)(__ctrl));
	__parser.AddParsedSubObject(this.foo);
	__parser.AddParsedSubObject(new System.Web.UI.LiteralControl("\r\n"));
}

protected override void FrameworkInitialize()
{
	this.__BuildControlTree(this);
}

}  //  end of class If

}  //  end of namespace DreamweaverCtrls
