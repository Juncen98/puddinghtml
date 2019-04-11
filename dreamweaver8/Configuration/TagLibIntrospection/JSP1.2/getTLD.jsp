<%@page contentType="text/html; charset=iso-8859-1" language="java" import="java.net.*,java.io.*,java.util.zip.*,java.util.*"%>

<%
	String uri = request.getParameter("uri");

	if (uri != null)
	{
		int extIndex = uri.lastIndexOf(".");
		if (extIndex != -1)
		{
			String ext		= uri.substring(extIndex+1);
			String tldData	= "";

			ServletContext svc = pageContext.getServletContext();
			uri =  svc.getRealPath(uri);

			try 
			{
				if (ext.equals("tld"))
				{
					tldData = readTLD(uri);
				}
				else if (ext.equals("jar"))
				{
					tldData = readTLDFromJar(uri);
				}
			}
			catch (Exception e)
			{
				tldData = "<ERROR";
				tldData = tldData + " Description=\"";
				String eMessage = e.getMessage();
				eMessage = eMessage.replace('"','\'');
				tldData = tldData + eMessage;
				tldData = tldData + "\"";
				tldData = tldData + " Source=\"\"";
				tldData = tldData + " Identification=\"\"";
				tldData = tldData + " HelpFile=\"\"";
				tldData = tldData + " HelpContext=\"\"";
				tldData = tldData + "></ERROR>";
				tldData = tldData + "</ERRORS>";
			}

			out.println(tldData);
		}	
	}

%>

<%!

public String uri2jarurl(String uri)
{
	 String aUrl = uri;

	 aUrl = aUrl.replace('\\','/');
	 aUrl = "jar:file:///" + aUrl;
	 aUrl = aUrl + "!";	

	 return aUrl;
}

public String readTLD(String filePath) throws Exception
{
    String fileData = "";
	try
	{
		 BufferedReader fs = new BufferedReader(new FileReader(filePath));
		 if (fs != null)
		 {
			String aLine = null;
			aLine = fs.readLine();
			while (aLine != null)
			{
				fileData = fileData + aLine;
				aLine = fs.readLine();
			}
			fs.close();
		 }	
	 }
	 catch (Exception e)
	 {
		throw(e);
	 }
	 return fileData;
}

public String readTLDFromJar(String filePath) throws Exception
{
	String fileData="";

	try 
	{
		Vector tldList = new Vector();
		//Get the list of tld from the jar files in case they may multiple.
		ZipFile zip = new ZipFile(filePath);

		if (zip != null)
		{
			for (Enumeration e = zip.entries() ; e.hasMoreElements() ;) 
			{
				 String fileName = ((ZipEntry)e.nextElement()).getName();
				 if (fileName.indexOf(".tld") != -1)
				 {
					tldList.add(fileName);
				 }
			}												
			zip.close();
		}

		//Convert the uri to jar-prefix.
		String urlprefix = uri2jarurl(filePath);
		for (int i =0 ; i < tldList.size() ; i++)
		{
			String tldFileName = (String)tldList.elementAt(i);
			tldFileName		= urlprefix + "/" + tldFileName;

			URL url  = new URL(tldFileName); 
			if (url != null)
			{
				JarURLConnection aConnection = (JarURLConnection)	url.openConnection();
				if (aConnection != null)
				{
					BufferedReader fs = new BufferedReader(new InputStreamReader(aConnection.getInputStream()));
					if (fs != null)
					{
						String aLine = null;
						aLine = fs.readLine();
						while (aLine != null)
						{
							fileData = fileData + aLine;
							aLine = fs.readLine();
						}
						fs.close();
					}
				}
			}
		}
	}
	catch (Exception e)
	{
		throw(e);
	}

	return fileData;
}

%>