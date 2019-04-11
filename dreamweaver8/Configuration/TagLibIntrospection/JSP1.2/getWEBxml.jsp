<%@page contentType="text/html; charset=iso-8859-1" language="java" import="java.net.*,java.io.*,java.util.zip.*,java.util.*"%>

<%
	String uri = "/WEB-INF/web.xml";

	if (uri != null)
	{
		String webxmlData = "";

		ServletContext svc = pageContext.getServletContext();
		uri =  svc.getRealPath(uri);
		try 
		{
			BufferedReader fs = new BufferedReader(new FileReader(uri));
			if (fs != null)
			{
				String aLine = null;
				aLine = fs.readLine();
				while (aLine != null)
				{
					webxmlData = webxmlData + aLine;
					aLine = fs.readLine();
				}
				fs.close();
			}	
		}
		catch (Exception e)
		{
			webxmlData = "<ERROR";
			webxmlData = webxmlData + " Description=\"";
			String eMessage = e.getMessage();
			eMessage = eMessage.replace('"','\'');
			webxmlData = webxmlData + eMessage;
			webxmlData = webxmlData + "\"";
			webxmlData = webxmlData + " Source=\"\"";
			webxmlData = webxmlData + " Identification=\"\"";
			webxmlData = webxmlData + " HelpFile=\"\"";
			webxmlData = webxmlData + " HelpContext=\"\"";
			webxmlData = webxmlData + "></ERROR>";
			webxmlData = webxmlData + "</ERRORS>";
		}
		out.println(webxmlData);
	}	
%>


