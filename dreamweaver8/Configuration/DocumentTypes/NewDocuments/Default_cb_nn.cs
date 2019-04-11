using System;
using System.Data;
using System.Web;
using System.Web.SessionState;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.UI.HtmlControls;


/// <summary>
/// Summary description for WebForm.
/// </summary>
public class @@DW_CLASSNAME@@ : System.Web.UI.Page
{
	private void Page_Load(object sender, System.EventArgs e)
	{
		if (Page.IsPostBack == false)
		{
			//put user code here.			
		}
		DataBind();		   			
	}

	override protected void OnInit(EventArgs e)
	{
		//
		// DWMXCODE: This call is required by DWMX.
		//
		InitializeComponent();
		base.OnInit(e);
	}
	
	/// <summary>
	/// Required method for Event support - do not modify
	/// the contents of this method with the code editor.
	/// </summary>
	private void InitializeComponent()
	{    
		this.Load += new System.EventHandler(this.Page_Load);
	}
}
