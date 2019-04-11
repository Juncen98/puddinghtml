// SQLTypes.js
// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

//Include String.js if you include this file

// "friendly" function names:
//   colTypeIsNumeric(colType)
//   colTypeIsBinary(colType)
//   colTypeIsDate(colType)
//   colTypeIsBoolean(colType)

function colTypeIsNumeric(colType){
  return ( getEnclosingTokenForSQLType(colType) == "")?true:false;
}

function colTypeIsBinary(colType){
  return isSQLTypeBinary(colType);
}

function colTypeIsDate(colType){
  var typeNum = getSQLTypeAsNum(colType);
  var isDate = false;
  
  if ( typeNum == 7   ||
       typeNum == 133 ||
       typeNum == 134 ||
       typeNum == 135 ) {
     isDate = true;    
  }
  
  return isDate;
}

function colTypeIsBoolean(colType) {
  var typeNum = getSQLTypeAsNum(colType);
  return (typeNum == 11);
  
}

function colTypeIsCurrency(colType) {
  var typeNum = getSQLTypeAsNum(colType);
  return (typeNum == 6);
  
}


// ***************************** Fns Utilized by "Friendly Fns"


// Maps the inParam to a number.
// Parameters:
//  inParam: a value retrieved from the C DBLib.
function getSQLTypeAsNum(inParam) {
  if (!inParam){
    return 129; //If for some reason nothing is passed in,
                //we return char (129) because the "text"
                //data type of SQL Server was coming in
                //as blank.
  }
  var inVal = String(inParam);
 
  if (AllInRange("0", "9", inVal)) {
    // it already is a num
    return parseInt(inVal);
  }
  var a = new Array();
  //from the ASP book
  a["empty"] = 0;
  a["smallint"] = 2;
  a["integer"] = 3;
  a["single"] = 4;
  a["double"] = 5;
  a["currency"] = 6;
  a["date"] = 7;
  a["bstr"] = 8;
  a["idispatch"] = 9;
  a["error"] = 10;
  a["boolean"] = 11;
  a["variant"] = 12;
  a["iunknown"] = 13;
  a["decimal"] = 14;
  a["tinyint"] = 16;
  a["unsignedtinyint"] = 17;
  a["unsignedsmallint"] = 18;
  a["unsignedint"] = 19;
  a["bigint"] = 20;
  a["ebigint"] = 20; // matched to bigint
  a["unsignedbigint"] = 21;
  a["guid"] = 72;
  a["binary"] = 128;
  a["char"] = 129;
  a["wchar"] = 130;
  a["numeric"] = 131;
  a["userdefined"] = 132;
  a["dbdate"] = 133;
  a["dbtime"] = 134;
  a["dbtimestamp"] = 135;
  a["varchar"] = 200;
  a["longchar"] = 201;
  a["longvarchar"] = 201;
  a["memo"] = 201;
  a["varwchar"] = 202;
  a["longvarwchar"] = 203;
  a["string"]=201;
  a["varbinary"] = 204;
  a["longvarbinary"] = 204; 
  a["longbinary"] = 205; // matched to longvarbinary

  //others
  a["money"] = 6;
  a["int"] = 3; //integer
  a["counter"] = 131; //numeric

  //oracle
  a["varchar2"] = 200;
  a["smalldatetime"] = 135;
  a["datetime"] = 135;
  a["number"] = 5; //double
  a["ref cursor"] = 900; //Arbitrary ID Val
  a["refcursor"] = 900;
  a["bit"] = 901; //Arbitrary ID Val;
  a["long raw"] = 20; // Match it to BigInt
  a["clob"] = 129; //char
  a["long"] = 20; // bigint
  a["double precision"] = 131; //numeric
  a["raw"]	= 204;// Match it to Binary
  a["nclob"]	= 204;//Match it to Binary
  a["bfile"]	= 204;//Match it to Binary
  a["rowid"]	= 129 ;//Match it to Hexadecimal String 
  a["urowid"]	= 129 ;//Match it to Hexadecimal String

  //odbc
  a["tid"] = 129;
  a["id"] = 200; //varchar

  // SQL Server 7
  a["smallmoney"] = 6; //currency
  a["float"] = 5; //double
  a["nchar"] = 200; //varchar
  a["real"] = 131; //numeric
  a["text"] = 200; //varchar
  a["timestamp"] = 135; //numeric
  a["sysname"] = 129;
  a["int identity"] = 131; //numeric
  a["smallint identity"] = 131; //numeric counter
  a["tinyint identity"] = 131; //numeric counter
  a["bigint identity"] = 131; //numeric counter
  a["decimal() identity"] = 131; //numeric counter
  a["numeric() identity"] = 131; //numeric counter
  a["uniqueidentifier"] = 131;//numeric
  a["ntext"]	= 200; //varchar
  a["nvarchar"]	= 200; //varchar
  a["nvarchar2"] = 200; //varchar
  a["image"]	=  204 ;// binary

  // DB2
  a["time"] = 135; // needs '
  a["character () for bit data"] = 129;
  a["blob"] = 128; //binary
  a["tinyblob"] = 128; //binary
  a["mediumblob"] = 128; //binary
  a["longblob"] = 128; //binary
  a["long varchar for bit data"] = 200; //varchar
  a["varchar () for bit data"] = 200; //varchar
  a["long varchar"] = 131; //numeric
  a["character"] = 129; //char
  //JDBC Specifc constants
  a["-8"] = 200; //JDBC varchar
  a["-9"] = 200; //JDBC varchar
  a["-10"] = 200; //JDBC varchar
  a["other"] = 200; //JDBC varchar

  //MySQL
  a["year"] = 133; //dbdate
  a["tinytext"] = 200; //varchar
  a["mediumtext"] = 200; //varchar
  a["longtext"] = 201; //longvarchar
  a["mediumint"] = 3; //integer
  a["enum"] = 132; //userdefined
  a["set"] = 132; //userdefined
  a["double unsigned zerofill"] = 5; //double
  a["float unsigned zerofill"] = 5; //double

  var theVal = String(inVal).toLowerCase();
  if (a[theVal]) {
    return a[theVal];
  }
  alert( "Alert in SQLTypes.js, theVal = " + theVal + ", inVal = " + inVal );
  alert(errMsg(MM.MSG_SQLTypeAsNumNotInMap,inVal));
  return inVal;
}


// Maps the inParam to a string.
// Parameters:
//  inParam: a value retrieved from the C DBLib.
function getSQLTypeAsString(inParam) {
  var inVal = getSQLTypeAsNum(inParam);
  var a = new Array();
  //from the ASP book
  a[0] = "Empty";
  a[2] = "SmallInt";
  a[3] = "Integer";
  a[4] = "Single";
  a[5] = "Double";
  a[6] = "Currency";
  a[7] = "Date";
  a[8] = "BSTR";
  a[9] = "IDispatch";
  a[10] = "Error";
  a[11] = "Boolean";
  a[12] = "Variant";
  a[13] = "IUnknown";
  a[14] = "Decimal";
  a[16] = "TinyInt";
  a[17] = "UnsignedTinyInt";
  a[18] = "UnsignedSmallInt";
  a[19] = "UnsignedInt";
  a[20] = "BigInt";
  a[21] = "UnsignedBigInt";
  a[72] = "GUID";
  a[128] = "Binary";
  a[129] = "Char";
  a[130] = "WChar";
  a[131] = "Numeric";
  a[132] = "UserDefined";
  a[133] = "DBDate";
  a[134] = "DBTime";
  a[135] = "DBTimeStamp";
  a[200] = "VarChar";
  a[201] = "LongVarChar";
  a[202] = "VarWChar";
  a[203] = "LongVarWChar";
  a[204] = "VarBinary";
  a[205] = "LongVarBinary";
  a[900] = "REF CURSOR"
  a[901] = "bit"
  if (a[inVal]) {
    return a[inVal];
  }
  alert(errMsg(MM.MSG_SQLTypeNotInMap,inVal));
  return inVal;
}

// Maps the inParam to a CF SQL TYPE string.
// Parameters:
//  inParam: a value retrieved from the C DBLib.
function getSQLTypeAsCFString(inParam) {
  var inVal = getSQLTypeAsNum(inParam);
  var a = new Array();
  //from the ASP book
  a[0] = "Empty";
  a[2] = "CF_SQL_SMALLINT";
  a[3] = "CF_SQL_INTEGER";
  a[4] = "CF_SQL_FLOAT";
  a[5] = "CF_SQL_FLOAT";
  a[6] = "CF_SQL_MONEY";
  a[7] = "CF_SQL_DATE";
  a[8] = "CF_SQL_CHAR"; //?
  a[9] = "IDispatch";
  a[10] = "Error";
  a[11] = "CF_SQL_BIT"; //Boolean
  a[12] = "Variant";
  a[13] = "IUnknown";
  a[14] = "CF_SQL_DECIMAL"; //Decimal
  a[16] = "CF_SQL_TINYINT"; //TinyInt
  a[17] = "CF_SQL_TINYINT"; //UnsignedTinyInt
  a[18] = "CF_SQL_SMALLINT"; //UnsignedSmallInt
  a[19] = "CF_SQL_INTEGER"; //UnsignedInt
  a[20] = "CF_SQL_BIGINT"; //BigInt
  a[21] = "CF_SQL_BIGINT"; //UnsignedBigInt
  a[72] = "GUID";
  a[128] = "Binary";
  a[129] = "CF_SQL_CHAR"; //Char
  a[130] = "CF_SQL_CHAR"; //WChar
  a[131] = "CF_SQL_NUMERIC"; //Numeric
  a[132] = "UserDefined";
  a[133] = "CF_SQL_DATE"; //DBDate
  a[134] = "CF_SQL_TIME"; //DBTime
  a[135] = "CF_SQL_TIMESTAMP"; //DBTimeStamp for bug 49070.
  a[200] = "CF_SQL_VARCHAR"; //VarChar
  a[201] = "CF_SQL_LONGVARCHAR"; //LongVarChar
  a[202] = "CF_SQL_VARCHAR"; //VarWChar
  a[203] = "CF_SQL_LONGVARCHAR"; //LongVarWChar
  a[204] = "VarBinary";
  a[205] = "LongVarBinary";
  //Defined for CF support
  a[400] = "CF_SQL_REAL";
  a[401] = "CF_SQL_FLOAT";
  a[402] = "CF_SQL_LONGVARCHAR";
  a[403] = "CF_SQL_MONEY4";
  a[900] = "REF CURSOR" // Special case for Oracle
  a[901] = "bit";
  if (a[inVal]) {
    return a[inVal];
  }
  alert(errMsg(MM.MSG_SQLTypeNotInMap,inVal));
  return inVal;
}


// This function takes a SQL type as returned from C library and returns
// the character that should be used to enclose the value in
// a sql statement.  For example, passing in "varchar" will
// most likely result in a single quote being returned.  Passing
// in "date" for an Access Database would result in the pound
// sign being returned.

// NOTE!!  NEED TO WORK ON THIS FOR ACCESS. WE MAY NEED TWO
// CALLS. ONE FOR DESIGN-TIME AND ONE FOR RUN-TIME.

function getEnclosingTokenForSQLType(inType, connName) {
  var retChar = ""
  var typeNum = getSQLTypeAsNum(inType);
  switch (typeNum) {
	case 128:
    case 129:
    case 130:
    case 133:
    case 134:
    case 135:
    case 200:
    case 201:
    case 202:
    case 203: 
    case 204:
    case 205:
	case 7:
      retChar = "'";
      break;
      
  }
  return retChar;
}

// Returns true if the inType (retrieved from
// the C DBLib) maps to a binary type.
function isSQLTypeBinary(inType) {
  var retVal = false;
  var typeNum = getSQLTypeAsNum(inType);
  switch (typeNum) {
      case 204:
      case 205:
      case 128:
      case 13:
        retVal = true;
  }
  return retVal;
}