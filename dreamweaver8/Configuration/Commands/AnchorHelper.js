//  Copyright 2002, 2003 Macromedia, Inc. All rights reserved.

function CheckNewAnchor( name )
{
	var errStr = CheckName( name );
	if ( errStr.length > 0 )
		return errStr;

	var count = _countAnchorsNamed( name ); 
	if ( count > 0 )
	{
		return MM.MSG_DuplicateName;
	}

	return "";
}

function CheckEditAnchor( old_name, name )
{
	if ( name == old_name )
		return "";

	var errStr = CheckName( name );
	if ( errStr.length > 0 )
		return errStr;

	var count = _countAnchorsNamed( name ); 
	if ( count > 0 )
		return MM.MSG_DuplicateName;

	return "";
}

var _count = 0;

function _findAnchorNamed( tag, name )
{
	if ( tag.tagName == "A" && tag.getAttribute( "name" ) == name )
		_count++;
	return true;
}

function _countAnchorsNamed( name )
{
   _count = 0;
   var root = dw.getDocumentDOM().documentElement;
   traverse(root, _findAnchorNamed, null, null, name );
   return _count;
}

function CheckName( name )
{
	if ( name.search( /\W/ ) != -1 )
	{
		return MM.MSG_InvalidName;
	}

	name.replace( /\W/, "" );

	if ( name.length < 1 )
	{
		return MM.MSG_EmptyName;
	}

	return "";
}
