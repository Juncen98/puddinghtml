Imports System
Imports System.Data
Imports System.Web
Imports System.Web.SessionState
Imports System.Web.UI
Imports System.Web.UI.WebControls
Imports System.Web.UI.HtmlControls
	  
Namespace @@DW_NAMESPACE@@	  
Public Class @@DW_CLASSNAME@@
    Inherits System.Web.UI.Page

    'This call is required by the DWMX.
    Private Sub InitializeComponent()

    End Sub

    Private Sub Page_Init(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles MyBase.Init
        'DWMXCODE: This method call is required by the DWMX
        'Do not modify it using the code editor.
        InitializeComponent()
    End Sub

    Private Sub Page_Load(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles MyBase.Load
        If Not IsPostBack Then
           'put user code here.
        End If	
        DataBind()
    End Sub

End Class
End Namespace
