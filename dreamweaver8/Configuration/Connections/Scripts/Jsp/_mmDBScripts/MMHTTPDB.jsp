<%@page  contentType="text/html; charset=utf-8" language="java" import="java.sql.*" errorPage="error.jsp"%>
<%
try 
{
	String theDriver	  = request.getParameter("Driver");
	String theConnString  = request.getParameter("ConnectionString");
	String theOpCode	  = request.getParameter("opCode");
	String theUserName	  = request.getParameter("UserName");
	String thePassword	  = request.getParameter("Password");

	if (theDriver != null && theConnString!=null)
	{
		Driver aDriver = (Driver)Class.forName(theDriver).newInstance();

		Connection aConn=null;

		if (request.getParameter("Timeout") != null)
		{
			int timeOut = Integer.parseInt(request.getParameter("Timeout"));
			DriverManager.setLoginTimeout(timeOut);
		}

		if ((theUserName !=null) || (thePassword !=null))
		{
			if ((theUserName.length() > 0) || (thePassword.length() > 0))
			{
				aConn= DriverManager.getConnection(theConnString,theUserName,thePassword);
			}
			else
			{
				aConn= DriverManager.getConnection(theConnString);
			}
		}
		else
		{
			aConn= DriverManager.getConnection(theConnString);
		}

		if ((aConn!=null) && (theOpCode!= null))
		{
			if (theOpCode.equals("GetTables"))
			{
				out.println(GetTables(aConn,request.getParameter("Schema"),request.getParameter("Catalog")));
			}
			else if (theOpCode.equals("GetViews"))
			{
				out.println(GetViews(aConn,request.getParameter("Schema"),request.getParameter("Catalog")));
			}
			else if (theOpCode.equals("GetProcedures"))
			{
				out.println(GetProcedures(aConn,request.getParameter("Schema"),request.getParameter("Catalog")));
			}
			else if (theOpCode.equals("GetColsOfTable"))
			{
				out.println(GetColumns(aConn,request.getParameter("TableName"),request.getParameter("Schema"),request.getParameter("Catalog")));
			}
			else if (theOpCode.equals("GetKeysOfTable"))
			{
				out.println(GetPrimaryKeys(aConn,request.getParameter("TableName"),request.getParameter("Schema"),request.getParameter("Catalog")));
			}
			else if (theOpCode.equals("GetParametersOfProcedure"))
			{
				out.println(MarshallRecordsetIntoHTML(GetParametersOfProcedure(aConn,request.getParameter("ProcName"),request.getParameter("Schema"),request.getParameter("Catalog"))));
			}
			else if (theOpCode.equals("ExecuteSQL"))
			{
				out.println(ExecuteSQL(aConn,request.getParameter("SQL"),request.getParameter("MaxRows")));
			}
			else if (theOpCode.equals("ExecuteSP"))
			{
				out.println(ExecuteSP(out,aConn,request.getParameter("ExecProcName"),0,request.getParameter("ExecProcParameters"),request.getParameter("Schema"),request.getParameter("Catalog")));
			}
			else if (theOpCode.equals("ReturnsResultSet"))
			{
				out.println(ReturnsResultSet(aConn,request.getParameter("RRProcName"),request.getParameter("Schema"),request.getParameter("Catalog")));
			}
			else if (theOpCode.equals("SupportsProcedure"))
			{
				out.println(SupportsProcedure(aConn));
			}
			else if (theOpCode.equals("GetProviderTypes"))
			{
				//TO DO;
			}
			else if (theOpCode.equals("IsOpen"))
			{
				out.println(TestOpen(aConn));
			}

			if (aConn != null)
			{
				aConn.close();
			}
		}
	}
}
catch (Exception e)
{
	out.println(HandleException(e));
}
%>


<%!

public static final int IsDefaultType = 0;
public static final int IsParamType = 1;
public static final int IsDataType = 2;

public String GetTables(Connection aConn,String SchemaName , String CatalogName) 
{
	try 
	{
		if ((aConn!=null) && !aConn.isClosed())
		{
			DatabaseMetaData dm = aConn.getMetaData();

			if (dm != null)
			{
				String[] atypes = {"TABLE"};

				if ((CatalogName != null) && (CatalogName.length()==0))
				{
					CatalogName = null;
				}
				if ((SchemaName != null) && (SchemaName.length()==0))
				{
					SchemaName = null;
				}

				return MarshallRecordsetIntoHTML(dm.getTables(CatalogName,SchemaName,null,atypes));
			}
		}
	}
	catch (Exception e)
	{
		return HandleException(e);
	}

	return null;
}

public String GetViews(Connection aConn,String SchemaName , String CatalogName) 
{
	try 
	{
		if ((aConn!=null) && !aConn.isClosed())
		{
			DatabaseMetaData dm = aConn.getMetaData();

			if (dm != null)
			{
				String[] atypes = {"VIEW"};

				if ((CatalogName != null) && (CatalogName.length()==0))
				{
					CatalogName = null;
				}

				if ((SchemaName != null) && (SchemaName.length()==0))
				{
					SchemaName = null;
				}

				return MarshallRecordsetIntoHTML(dm.getTables(CatalogName,SchemaName,null,atypes));
			}
		}
	}
	catch (Exception e)
	{
		return HandleException(e);
	}

	return null;
}

public String GetProcedures(Connection aConn,String SchemaName , String CatalogName) 
{
	try 
	{
		if ((aConn!=null) && !aConn.isClosed())
		{
			DatabaseMetaData dm = aConn.getMetaData();

			if (dm != null)
			{
				if ((CatalogName != null) && (CatalogName.length()==0))
				{
					CatalogName = null;
				}

				if ((SchemaName != null) && (SchemaName.length()==0))
				{
					SchemaName = null;
				}

				return MarshallRecordsetIntoHTML(dm.getProcedures(CatalogName,SchemaName,null));
			}
		}
	}
	catch (Exception e)
	{
		return HandleException(e);
	}

	return null;
}

public String GetColumns(Connection aConn,String TableName, String SchemaName , String CatalogName) 
{
	try 
	{
		if ((aConn!=null) && !aConn.isClosed() && (TableName!=null) && (TableName.length()>0))
		{
			DatabaseMetaData dm = aConn.getMetaData();

			if (dm != null)
			{
				if ((CatalogName != null) && (CatalogName.length()==0))
				{
					CatalogName = null;
				}

				if ((SchemaName != null) && (SchemaName.length()==0))
				{
					SchemaName = null;
				}

				return MarshallRecordsetIntoHTML(dm.getColumns(CatalogName,SchemaName,TableName,null));
			}
		}
	}
	catch (Exception e)
	{
		return HandleException(e);
	}

	return null;
}

public String GetPrimaryKeys(Connection aConn,String TableName, String SchemaName , String CatalogName) 
{
	try 
	{
		if ((aConn!=null) && !aConn.isClosed() && (TableName!=null) && (TableName.length()>0))
		{
			DatabaseMetaData dm = aConn.getMetaData();

			if (dm != null)
			{
				if ((CatalogName != null) && (CatalogName.length()==0))
				{
					CatalogName = null;
				}

				if ((SchemaName != null) && (SchemaName.length()==0))
				{
					SchemaName = null;
				}

				return MarshallRecordsetIntoHTML(dm.getPrimaryKeys(CatalogName,SchemaName,TableName));
			}
		}
	}
	catch (Exception e)
	{
		return HandleException(e);
	}

	return null;
}


public ResultSet GetParametersOfProcedure(Connection aConn,String ProcName, String SchemaName , String CatalogName) 
{
	try 
	{
		if ((aConn!=null) && !aConn.isClosed() && (ProcName!=null) && (ProcName.length()>0))
		{
			DatabaseMetaData dm = aConn.getMetaData();

			if (dm != null)
			{
				if ((CatalogName != null) && (CatalogName.length()==0))
				{
					CatalogName = null;
				}

				if ((SchemaName != null) && (SchemaName.length()==0))
				{
					SchemaName = null;
				}

				int dotIndex = ProcName.lastIndexOf(".");

				if (dotIndex != -1)
				{
					ProcName = ProcName.substring(dotIndex+1,ProcName.length());
				}

				return dm.getProcedureColumns(CatalogName,SchemaName,ProcName,null);
			}
		}
	}
	catch (Exception e)
	{
		HandleException(e);
	}

	return null;
}

public String ExecuteSQL(Connection aConn,String SQL,String MaxRows) 
{
	try 
	{
		if ((aConn!=null) && !aConn.isClosed())
		{
			Statement aStatement = aConn.createStatement();
			aStatement.setMaxRows(Integer.parseInt(MaxRows));
			ResultSet aRecordset = aStatement.executeQuery(SQL);
			if (aRecordset != null)
			{
				return MarshallRecordsetIntoHTML(aRecordset);
			}
		}
	}
	catch (Exception e)
	{
		return HandleException(e);
	}

	return null;
}

public String ExecuteSP(JspWriter aOut,Connection aConn,String spName,int timeOut,String spParams,String SchemaName,String CatalogName)
{
	try 
	{
		if ((aConn!=null) && !aConn.isClosed())
		{
			java.util.Hashtable aParamArray=null;

			if(spParams != null && spParams.length() > 0)
			{
				aParamArray = new java.util.Hashtable();

				for (;;)
				{
					int Index = spParams.indexOf(",");

					if(Index == -1)
					{
						Index = spParams.length();
					}

					String name = spParams.substring(0,Index);
					spParams	= spParams.substring(Index+1,spParams.length());

					Index = spParams.indexOf(",");
					if (Index == -1)
					{
						Index = spParams.length();
					}

					String value = spParams.substring(0,Index);

					aParamArray.put(name,value);

					if (Index >= spParams.length())
					{
						break;
					}

					spParams = spParams.substring(Index+1,spParams.length());
				}
			}

			ResultSet paramRS = GetParametersOfProcedure(aConn,spName,SchemaName,CatalogName);

			String aCallStatement="";
			boolean bHasRetVal = false;
			int RefCurIndex = -1;

			if (paramRS != null)
			{
				int i = 0;
				aCallStatement = aCallStatement + "(";
				while (paramRS.next())
				{
					int pType	 = paramRS.getInt("COLUMN_TYPE");

					if(i > 0)
					{
						aCallStatement = aCallStatement + ",";
					}

					if (pType == DatabaseMetaData.procedureColumnReturn)
					{
						bHasRetVal = true;
					}
					else
					{
						aCallStatement = aCallStatement + "?";
						i++;
					}
				}
				paramRS.close();
			}

			aCallStatement = aCallStatement + ")}";


			if(bHasRetVal)
			{
				aCallStatement = "{?=call " + spName + aCallStatement;
			}
			else
			{
				aCallStatement = "{call " + spName + aCallStatement;
			}

			CallableStatement aStatement = aConn.prepareCall(aCallStatement);

			if (aStatement != null)
			{
				paramRS = GetParametersOfProcedure(aConn,spName,SchemaName,CatalogName);
				if (paramRS != null)
				{
					int index = 0;
					while (paramRS.next())
					{
						String pName = paramRS.getString("COLUMN_NAME");
						int pType	 = paramRS.getInt("COLUMN_TYPE");
						int aType	 = Types.LONGVARCHAR;

						String TypeName = paramRS.getString("TYPE_NAME");

						if (TypeName.indexOf("REF CURSOR") != -1)
						{
							RefCurIndex = index + 1;
							aType = -10;//ORACLE.REF CURSOR.
						}

						if (pType == DatabaseMetaData.procedureColumnIn)
						{
							String pValue = aParamArray.get(pName).toString();
							aStatement.setString(index+1,pValue);
						}
						else if (pType == DatabaseMetaData.procedureColumnInOut)
						{
							if (RefCurIndex != index + 1)
							{
								String pValue = aParamArray.get(pName).toString();
								aStatement.setString(index+1,pValue);
							}
							aStatement.registerOutParameter(index+1,aType);
						}
						else if ((pType == DatabaseMetaData.procedureColumnOut) ||
								 (pType == DatabaseMetaData.procedureColumnReturn)) 	
						{
							aStatement.registerOutParameter(index+1,aType);
						}
						index++;
					}
					paramRS.close();
				}

				aStatement.execute();
				ResultSet aResultSet = null;

				if (RefCurIndex != -1)
				{
					aResultSet = (ResultSet)aStatement.getObject(RefCurIndex);
				}
				else
				{
					aResultSet = aStatement.getResultSet();
				}

				return MarshallRecordsetIntoHTML(aResultSet);
			}
		}
	}
	catch (Exception e)
	{
		return HandleException(e);
	}

	return null;
}


public String SupportsProcedure(Connection aConn)
{
	String status = "true";

	try 
	{
		if ((aConn!=null) && !aConn.isClosed())
		{
			DatabaseMetaData dm = aConn.getMetaData();

			if (dm != null)
			{
				String pTerm = dm.getProcedureTerm();

				if (pTerm != null)
				{
					if (pTerm.equals("QUERY"))
					{
						status = "false";
					}
				}

				String xmlOutput = "";
				xmlOutput = xmlOutput + "<SUPPORTSPROCEDURE status=";
				xmlOutput = xmlOutput + status;
				xmlOutput = xmlOutput + "></SUPPORTSPROCEDURE>";
				return xmlOutput;

			}
		}
	}
	catch (Exception e)
	{
		String xmlOutput ="<SUPPORTSPROCEDURE status=true></SUPPORTSPROCEDURE>";
		return xmlOutput;
	}

	return null;
}

public String ReturnsResultSet(Connection aConn,String ProcName, String SchemaName , String CatalogName) 
{

	String status = "false";

	try 
	{
		if ((aConn!=null) && !aConn.isClosed() && (ProcName!=null) && (ProcName.length()>0))
		{
			DatabaseMetaData dm = aConn.getMetaData();

			if (dm != null)
			{
				if ((CatalogName != null) && (CatalogName.length()==0))
				{
					CatalogName = null;
				}

				if ((SchemaName != null) && (SchemaName.length()==0))
				{
					SchemaName = null;
				}

				ResultSet aResultSet = dm.getProcedures(CatalogName,SchemaName,ProcName);
				aResultSet.next();
				if (aResultSet != null)
				{
					int pType = aResultSet.getInt("PROCEDURE_TYPE");

					if (pType == DatabaseMetaData.procedureNoResult)
					{
						status = "false";
					}
					else if (pType == DatabaseMetaData.procedureReturnsResult)
					{
						status = "true";
					}
					else if (pType == DatabaseMetaData.procedureResultUnknown)
					{
						status = "true";
					}
				}

				String xmlOutput = "";
				xmlOutput = xmlOutput + "<RETURNSRESULTSET status=";
				xmlOutput = xmlOutput + status;
				xmlOutput = xmlOutput + "></RETURNSRESULTSET>";
				return xmlOutput;

			}
		}
	}
	catch (Exception e)
	{
		String xmlOutput = "<RETURNSRESULTSET status=false></RETURNSRESULTSET>";
		return xmlOutput;
	}

	return null;
}


public String TestOpen(Connection aConn)
{
	try 
	{
		if ((aConn!=null) && !aConn.isClosed())
		{
			String xmlOutput = "<TEST status=true</TEST>";
			return xmlOutput;
		}
		else
		{
			String xmlOutput = "<TEST status=false</TEST>";
			return xmlOutput;
		}
	}
	catch (Exception e)
	{
			String xmlOutput = "<TEST status=false</TEST>";
			return xmlOutput;
	}
}


public String MarshallRecordsetIntoHTML(ResultSet aResultSet)
{
	String xmlOutput = "";

	try 
	{
		if (aResultSet != null)
		{
			xmlOutput = xmlOutput + "<RESULTSET>";
			xmlOutput = xmlOutput + "<FIELDS>";

			ResultSetMetaData rMetaData = aResultSet.getMetaData();

			boolean bUseProc = false;
			int n = rMetaData.getColumnCount();
			int someTypeFlags[] = new int[n];
			for(int i = 1; i <= n; i++)
			{
				someTypeFlags[i - 1] = IsDefaultType;

				xmlOutput = xmlOutput + "<FIELD";
				xmlOutput = xmlOutput + " type=\"";
				xmlOutput = xmlOutput + rMetaData.getColumnTypeName(i);
				xmlOutput = xmlOutput + "\"";

				xmlOutput = xmlOutput + " definedSize=\"-1\"";
				xmlOutput = xmlOutput + " actualsize=\"-1\"";

				xmlOutput = xmlOutput + " precision=\"";
				xmlOutput = xmlOutput + rMetaData.getPrecision(i);
				xmlOutput = xmlOutput + "\"";

				xmlOutput = xmlOutput + " scale=\"";
				xmlOutput = xmlOutput + rMetaData.getScale(i);
				xmlOutput = xmlOutput + "\"";

				xmlOutput = xmlOutput + "><NAME>";

				String colName = rMetaData.getColumnName(i);
				String colNameUpper = colName.toUpperCase();

				if (colNameUpper.equals("TABLE_CAT"))
				{
					colName = "TABLE_CATALOG";
				}
				else if (colNameUpper.equals("TABLE_SCHEM"))
				{
					colName = "TABLE_SCHEMA";
				}
				else if (colNameUpper.equals("PROCEDURE_CAT"))
				{
					colName = "PROCEDURE_CATALOG";
					bUseProc = true;
				}
				else if (colNameUpper.equals("PROCEDURE_SCHEM"))
				{
					colName = "PROCEDURE_SCHEMA";
					bUseProc = true;
				}
				else if (colNameUpper.equals("COLUMN_TYPE"))
				{
					if (bUseProc)
					{
						colName = "PARAMETER_TYPE";
						someTypeFlags[i - 1] = IsParamType;
					}
					else
					{
						someTypeFlags[i - 1] = IsDataType;
					}
				}
				else if (colNameUpper.equals("DATA_TYPE"))
				{
						someTypeFlags[i - 1] = IsDataType;
				}
				else if (colNameUpper.equals("COLUMN_NAME"))
				{
					if (bUseProc)
					{
						colName = "PARAMETER_NAME";
					}
				}
				xmlOutput = xmlOutput + colName;
				xmlOutput = xmlOutput + "</NAME></FIELD>";
			}
			xmlOutput = xmlOutput + "</FIELDS>";

			xmlOutput = xmlOutput + "<ROWS>";
			while (aResultSet.next())
			{
				xmlOutput = xmlOutput + "<ROW>";
				for(int i = 1; i <= n; i++)
				{
					xmlOutput = xmlOutput + "<VALUE>";
					String aObject = aResultSet.getString(i);
					if (aObject != null)
					{
						if(someTypeFlags[i - 1] == IsParamType)
						{
							aObject  = MapParameterType2UD(aObject);
						}
						else if(someTypeFlags[i - 1] == IsDataType)
						{
							String TypeName = aResultSet.getString("TYPE_NAME");
							aObject = TypeName;
						}

						xmlOutput = xmlOutput + aObject;
					}
					xmlOutput = xmlOutput + "</VALUE>";
				}
				xmlOutput = xmlOutput + "</ROW>";
			}
			xmlOutput = xmlOutput + "</ROWS>";
			xmlOutput = xmlOutput + "</RESULTSET>";
			aResultSet.close();
		}
	}
	catch (Exception e)
	{
		return HandleException(e);
	}

	return xmlOutput;
}

public String HandleException(Exception e)
{
	String xmlOutput = "";
	String message = "";

	if (e instanceof java.lang.ClassNotFoundException)
	{
		message = e.getMessage() + " Class not found";
	}
	else
	{
		message = e.getMessage();
	}

	xmlOutput = xmlOutput + "<ERRORS>";
	xmlOutput = xmlOutput + "<ERROR";
	xmlOutput = xmlOutput + " Source=\"\"";
	xmlOutput = xmlOutput + " Identification=\"\"";
	xmlOutput = xmlOutput + " HelpFile=\"\"";
	xmlOutput = xmlOutput + " HelpContext=\"\"";
	xmlOutput = xmlOutput + "><DESCRIPTION>";
	xmlOutput = xmlOutput + message;
	xmlOutput = xmlOutput + "</DESCRIPTION></ERROR>";
	xmlOutput = xmlOutput + "</ERRORS>";

	return xmlOutput;
}

public String MapParameterType2UD(String parameterTypeName)
{
	String retType="";

	try 
	{
		int iType = Integer.parseInt(parameterTypeName);

		switch (iType)
		{
			case java.sql.DatabaseMetaData.procedureColumnIn:
			{
				retType="1";
				break;
			}
			case java.sql.DatabaseMetaData.procedureColumnInOut:
			{
				retType="3";
				break;
			}
			case java.sql.DatabaseMetaData.procedureColumnOut:
			{
				retType="2";
				break;
			}
			case java.sql.DatabaseMetaData.procedureColumnReturn:
			{
				retType="4";
				break;
			}
			case java.sql.DatabaseMetaData.procedureColumnResult:
			{
				retType="5";
				break;
			}
			default:
			{
				retType = parameterTypeName;
				break;
			}
		}
	}
	catch (Exception e)
	{
		retType = "";
	}

	return retType;
}

public String MapSQLType2Name(String typeIntName)
{
	String retType="";

	try 
	{
		int iType = Integer.parseInt(typeIntName);

		switch (iType)
		{
			case -5:
			{
				retType="bigint";
				break;
			}
			case -2:
			{
				retType="binary";
				break;
			}
			case -7:
			{
				retType="bit";
				break;
			}
			case 1:
			{
				retType="char";
				break;
			}
			case 91:
			{
				retType="date";
				break;
			}
			case 3:
			{
				retType = "decimal";
				break;
			}
			case 8:
			{
				retType = "double";
				break;
			}
			case 6:
			{
				retType = "float";
				break;
			}
			case 4:
			{
				retType = "integer";
				break;
			}
			case -4:
			{
				retType = "longvarbinary";
				break;
			}
			case -1:
			{
				retType = "longvarchar";
				break;
			}
			case 0:
			{
				retType = "null";
				break;
			}
			case 2:
			{
				retType = "numeric";
				break;
			}
			case 1111:
			{
				retType = "other";
				break;
			}
			case 7:
			{
				retType = "real";
				break;
			}
			case 5:
			{
				retType = "smallint";
				break;
			}
			case 92:
			{
				retType = "time";
				break;
			}
			case 93:
			{
				retType = "timestamp";
				break;
			}
			case -6:
			{
				retType = "tinyint";
				break;
			}
			case -3:
			{
				retType = "varbinary";
				break;
			}
			case 12:
			{
				retType = "varchar";
				break;
			}
			default:
			{
				retType = typeIntName;
				break;
			}
		}
	}
	catch (Exception e)
	{
		retType = "";
	}

	return retType;
}


%>

