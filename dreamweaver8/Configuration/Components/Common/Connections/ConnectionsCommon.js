// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.
var CONNECTION_FILENAME="Shared/MM/Images/Database.gif";
var DATABASE_FILENAME="Shared/MM/Images/Database.gif";

var TABLES_FILENAME="Components/Common/Connections/DBTables.gif";
var VIEWS_FILENAME="Components/Common/Connections/DBViews.gif";
var PROCEDURES_FILENAME="Components/Common/Connections/DBProcedures.gif";

var TABLE_FILENAME="Components/Common/Connections/DBTable.gif";
var VIEW_FILENAME="Components/Common/Connections/DBView.gif";
var PROCEDURE_FILENAME="Components/Common/Connections/DBProcedure.gif";

var TYPEPK_FILENAME="Components/Common/Connections/TypePK.gif";
var TYPESTRING_FILENAME="Components/Common/Connections/TypeString.gif";
var TYPEDATE_FILENAME="Components/Common/Connections/TypeDate.gif";
var TYPENUMBER_FILENAME="Components/Common/Connections/TypeNumber.gif";
var TYPECUR_FILENAME="Components/Common/Connections/TypeCurrency.gif";
var TYPEID_FILENAME="Components/Common/Connections/TypeID.gif";

var TESTCONNECTION_FILENAME = "Components/Common/Connections/DBTestConnection.gif";
var DUPLCIATECONNECTION_FILENAME = "Components/Common/Connections/DBConnDuplicate.gif";
var EDITCONNECTION_FILENAME = "Components/Common/Connections/DBConnEdit.gif";

var REFRESHBUTTONUP			= "Shared/MM/Images/refresh.gif";
var REFRESHBUTTONDOWN		= "Shared/MM/Images/refresh_sel.gif";
var REFRESHBUTTONDISABLED	= "Shared/MM/Images/refresh_dis.gif";


//*-------------------------------------------------------------------
// FUNCTION:
//   findConnections()
//
// DESCRIPTION:
//	 add a new entry information for the web service
//
// ARGUMENTS:
//	
// RETURNS:
//--------------------------------------------------------------------
function findConnections()
{
	return MMDB.getConnectionList();
}

//*-------------------------------------------------------------------
// FUNCTION:
//   getIconForType(typename)
//
// DESCRIPTION:
//	 gets an gif icon based on the type.
//
// ARGUMENTS:
//	
// RETURNS:
//--------------------------------------------------------------------
function getIconForType(typename)
{
	var iconFile = TYPESTRING_FILENAME;

	if(typename && typename.length)
	{
		typename = typename.toLowerCase();
    
    if (dwscripts.isDateDBColumnType(typename))
		{
			iconFile = TYPEDATE_FILENAME;
		}
    if (dwscripts.isCurrencyDBColumnType(typename))
		{
			iconFile = TYPECUR_FILENAME;
		}
    else if (dwscripts.isNumericDBColumnType(typename)  ||
             dwscripts.isBooleanDBColumnType(typename))
		{
			iconFile = TYPENUMBER_FILENAME;
		}
		else
		{
			if (typename.indexOf("id") != -1)
			{
				iconFile = TYPEID_FILENAME;
			}
		}
	}
	return iconFile;
}


function GetDirString(dirNum)
{
  var a = new Array()

  a[1] = "in"
  a[2] = "out"
  a[3] = "in/out"
  a[4] = "RETURN_VALUE"

  if (!a[dirNum])
    alert(errMsg(MM.MSG_DirNum,dirNum));

  return a[dirNum]
}
