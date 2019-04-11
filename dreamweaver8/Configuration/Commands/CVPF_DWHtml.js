//=========================================================================================================
//
// Copyright 2002 Macromedia, Inc. All rights reserved.
//
// Feature: Code View Paste Filter
// Author:  JDH
// Module:  CVPF_DWHtml.js
// Purpose:	This module handles filtering the paste of DWHtml into HTML documents.
// Updates:
//	9/27/02 - Started file control
//
//=========================================================================================================

function CVPF_DWHtml_Clean( inStr )
{
	// Kill the dwcopytype attribute
	return inStr.replace( / dwcopytype\=\"CopyTable(Row|Column|Cell)\"\>/, ">" );
}
