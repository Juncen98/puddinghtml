//=========================================================================================================
//
// Copyright 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.
//
// Feature: Paste Fix
// Author:  JDH
// Module:  PMContext.js
// Purpose:	The context object for the Paste Fix pipeline, as well as wrappers for CSS class access.
// Updates:
//	5/17/02 - Started file control
//
//=========================================================================================================

function CSSClassCollection( targetCSS )
{
	// Allocate an associate array to hold the classes
	this.targetCSS = targetCSS;
	this.classes = new Array();
	this.IDs = new Array();
	this.referenced = new Array();
	this.newToOld = new Array();
	this.oldToNew = new Array();
	this.removedClasses = new Array();
	this.tdClassName = "";
}

CSSClassCollection.prototype.add   = CSSClassCollection_add;
CSSClassCollection.prototype.addID = CSSClassCollection_addID;
CSSClassCollection.prototype.get   = CSSClassCollection_get;
CSSClassCollection.prototype.getID = CSSClassCollection_getID;
CSSClassCollection.prototype.has   = CSSClassCollection_has;
CSSClassCollection.prototype.hasID = CSSClassCollection_hasID;
CSSClassCollection.prototype.ref   = CSSClassCollection_ref;
CSSClassCollection.prototype.refID = CSSClassCollection_refID;
CSSClassCollection.prototype.createUsed = CSSClassCollection_createUsed;
CSSClassCollection.prototype.getRemovedClasses = CSSClassCollection_getRemovedClasses;
CSSClassCollection.prototype.remapClasses = CSSClassCollection_remapClasses;
CSSClassCollection.prototype.newClassName = CSSClassCollection_newClassName;
CSSClassCollection.prototype.getTDClassName = CSSClassCollection_getTDClassName;

function CSSClassCollection_getTDClassName()
{
	return this.tdClassName;
}

function CSSClassCollection_newClassName()
{
	// Iterate through the possible class names to find a new excel
	// name
	for( var index = 1; ; index++ )
	{
		var name = "excel" + index;
		var dotName = ".excel" + index;
		if ( this.targetCSS.has( name ) == false &&
		     this.targetCSS.has( dotName ) == false && 
			 this.newToOld[ dotName ] == null )
		{
			return dotName;
		}
	}
}

function CSSClassCollection_remapClasses()
{
	// Create maps for the old excel name to the new excel name
	// and vice versa
	for( var key in this.classes )
	{
		if ( key.match( /^[.]xl/ ) || key == "td" )
		{
			var newName = this.newClassName();

			if ( key == "td" )
			{
				this.tdClassName = newName.replace( /^./, "" );
				this.referenced[ newName ] = 1;
			}
					
			this.newToOld[ newName ] = key;
			this.oldToNew[ key ] = newName;
		}
	}

	// Copy the TD styles into each .xl class, since we're not copying the TD redefinition 
	var tdStyle = this.classes[ 'td' ];
	for( var key in this.classes )
	{
		if ( key.match( /^[.]xl/ ) )
		{
			// we need td styles to be first, so move "old" one out of the way
			var tempStyle = this.classes [ key ];
			this.classes [ key ] = new Array();
			for( var tdKey in tdStyle )
				this.classes[ key ][ tdKey ] = tdStyle[ tdKey ];
			// now put original one back
			for( var tempKey in tempStyle )
				this.classes[ key ][ tempKey ] = tempStyle[ tempKey ];
			
		}
	}

}

function CSSClassCollection_add( name, data )
{
	if (this.classes [ name ] == undefined)
	{
		this.classes[ name ] = data;
	}
	else
	{
		//already exists, let's add the new styles
		for( var tempKey in data )
		{
			this.classes[ name ][ tempKey ] = data[ tempKey ];
		}
	}
}

function CSSClassCollection_addID( id, data )
{
	if (this.IDs[ id ] == undefined)
	{
		this.IDs[ id ] = data;
	}
	else
	{
		//already exists, let's add the new styles
		for( var tempKey in data )
		{
			this.IDs[ id ][ tempKey ] = data[ tempKey ];
		}
	}
}

function CSSClassCollection_get( name )
{
	return this.classes[ name ];
}

function CSSClassCollection_getID( id )
{
	return this.IDs[ id ];
}

function CSSClassCollection_has( name )
{
	// return true if there is a class definition

	if ( this.classes[ name ] != null )
		return true;
	return false;
}

function CSSClassCollection_hasID( id )
{
	// return true if there is a class definition
	if ( this.IDs[ id ] != null )
		return true;
	return false;
}

function CSSClassCollection_ref( tag, name )
{
	tag = tag.toLowerCase();
	
	// Check to see if this is a remapped name
	if ( this.oldToNew[ name ] )
	{
		this.referenced[ this.oldToNew[ name ] ] = 1;
		return this.oldToNew[ name ];
	}

	// Check to see if this is a remapped to a dot-name
	if ( this.oldToNew[ "." + name ] )
	{
		this.referenced[ this.oldToNew[ "." + name ] ] = 1;
		var styleName = this.oldToNew[ "." + name ];
		styleName = styleName.replace( /^./, "" );
		return styleName;
	}

	// Check to see if this is an unstyled td that needs a class
	if ( tag == "td" && name == "" )
	{
		this.referenced[ this.oldToNew[ "td" ] ] = 1;
		styleName = this.oldToNew[ "td" ];
		styleName = styleName.replace( /^./, "" );
		return styleName;
	}

	// Ignore if this is already referenced
	if ( this.referenced[ name ] )
	{
		return name;
	}
	/// Check the basic name
	if ( this.classes[ name ] )
	{
		this.referenced[ name ] = 1;
		return name;
	}

	/// Check the dot-name
	var dotName = "."+name;
	if ( this.classes[ dotName ] )
	{
		this.referenced[ dotName ] = 1;
		return name;
	}
	
	/// Check the tag-dot-name
	var dirName = tag+"."+name;
	if ( this.classes[ dirName ] )
	{
		this.referenced[ dirName ] = 1;
		return name;
	}

	return name;
}

function CSSClassCollection_refID( tag, id )
{
	tag = tag.toLowerCase();
	
	// Ignore if this is already referenced
	if ( this.referenced[ id ] )
	{
		return id;
	}

	/// Check the hash-id
	var hashID = "#"+id;
	if ( this.IDs[ hashID ] )
	{
		this.referenced[ hashID ] = 1;
		return id;
	}
	
	/// Check the tag-hash-name
	var dirName = tag+hashID;
	if ( this.IDs[ dirName ] )
	{
		this.referenced[ dirName ] = 1;
		return id;
	}

	return id;
}


function CSSClassCollection_createUsed( )
{
	// Create text for all of the new classes
	var output = "";
	for ( var name in this.referenced )
	{
		var style;
		if ( this.has( name ) )
			style = this.classes[ name ];
		else if ( this.has ( this.newToOld[ name ] ) )
			style = this.classes[ this.newToOld[ name ] ];
		else if ( this.hasID( name ) )
			style = this.IDs[ name ];	

		var classText = Utils_BuildClass( style );
		if (classText != "")
			output += name + " {\n" + classText + "}\n";
		else
		{
			// remove anything up to and including dot
			var dotIndex = name.lastIndexOf(".");
			if ( dotIndex >= 0 )
				name = name.substring(dotIndex + 1);
			this.removedClasses[ name ] = 1;
		}
	}
	return output;
}

function CSSClassCollection_getRemovedClasses()
{
	return this.removedClasses;
}

function CSSReferenceClassCollection()
{
	// Initialize associate array for the class names

	this.classes = new Array();
}

CSSReferenceClassCollection.prototype.add = CSSReferenceClassCollection_add;
CSSReferenceClassCollection.prototype.get = CSSReferenceClassCollection_get;
CSSReferenceClassCollection.prototype.has = CSSReferenceClassCollection_has;

function CSSReferenceClassCollection_add( name )
{
	// Coerce the name to lower case and add a reference to it to the associative
	// array

	name = name.toLowerCase();
	this.classes[ name ] = 1;
}

function CSSReferenceClassCollection_get( name )
{
	// We shouldn't be trying to get the class definition, since we don't have
	// them for the target document

}

function CSSReferenceClassCollection_has( name )
{
	// Coerce the name to lower case and check for it's existince in the array

	name = name.toLowerCase();
	if ( this.classes[ name ] != null )
		return true;
	return false;
}


function JSStringBuffer() { this._text = ""; }

JSStringBuffer.prototype.append = JSStringBuffer_append;
JSStringBuffer.prototype.get = JSStringBuffer_get;

function JSStringBuffer_get( ) { return this._text; }
function JSStringBuffer_append( str ) { this._text += str; }



function JSDWBuffer() { this._id = dw.createStringBuffer(); }

JSDWBuffer.prototype.append = JSDWBuffer_append;
JSDWBuffer.prototype.get = JSDWBuffer_get;

function JSDWBuffer_get( ) { return dw.getStringBuffer( this._id ); }
function JSDWBuffer_append( str ) { dw.appendToStringBuffer( this._id, str ); }



function PasteContext( clipDOM, clipCSS, targetDOM, targetCSS, targetIDs, settings )
{
	// Initialize string buffers
	dw.resetStringBuffers();

	// Initialize the member variables

	// The clipboard and it's current type (assumend to be HTML)
	this.clipDOM                  = clipDOM;
	this.clipText                 = this.clipDOM.documentElement.outerHTML;
	this.contentType              = CONTENT_TYPE_HTML;
	this.originClasses            = clipCSS;

	// The target
	this.targetDOM                = targetDOM;
	this.targetClasses            = targetCSS;
	this.targetIDs                = targetIDs;
	this.remapClasses             = false;

	// The information about the current application
	this.originApplicationFull    = "";
	this.originApplication        = null;
	this.originApplicationVersion = null;
	this.originOffice             = false;
	
	// The global settings for the handlers
	this.settings                 = settings;

	// The debug data
	this.debugData                = new Array();

	// The meta tags
	this.metaTags                 = {};

	// The CSS
	this.usedStyles               = "";
}

PasteContext.prototype.updateClipDOM = PasteContext_updateClipDOM;
PasteContext.prototype.getClipDOM = PasteContext_getClipDOM;
PasteContext.prototype.setClipText = PasteContext_setClipText;
PasteContext.prototype.getClipText = PasteContext_getClipText;
PasteContext.prototype.getDebugText = PasteContext_getDebugText;
PasteContext.prototype.getDebugHTML = PasteContext_getDebugHTML;
PasteContext.prototype.generateUsedStyles = PasteContext_generateUsedStyles;
PasteContext.prototype.getUsedStyles = PasteContext_getUsedStyles;
PasteContext.prototype.getRemovedClasses = PasteContext_getRemovedClasses;
PasteContext.prototype.getContentType = PasteContext_getContentType;
PasteContext.prototype.getOriginApplicationFull = PasteContext_getOriginApplicationFull;
PasteContext.prototype.getOriginApplication = PasteContext_getOriginApplication;
PasteContext.prototype.getOriginApplicationVersion = PasteContext_getOriginApplicationVersion;
PasteContext.prototype.getOriginOffice = PasteContext_getOriginOffice;
PasteContext.prototype.setOriginApplicationFull = PasteContext_setOriginApplicationFull;
PasteContext.prototype.setOriginApplication = PasteContext_setOriginApplication;
PasteContext.prototype.setOriginApplicationVersion = PasteContext_setOriginApplicationVersion;
PasteContext.prototype.addToDebug = PasteContext_addToDebug;
PasteContext.prototype.debugWarning = PasteContext_debugWarning;
PasteContext.prototype.debugInformation = PasteContext_debugInformation;
PasteContext.prototype.debugCritical = PasteContext_debugCritical;
PasteContext.prototype.getSetting = PasteContext_getSetting;
PasteContext.prototype.setSetting = PasteContext_setSetting;
PasteContext.prototype.settingDefined = PasteContext_settingDefined;
PasteContext.prototype.getOriginClasses = PasteContext_getOriginClasses;
PasteContext.prototype.getTargetClasses = PasteContext_getTargetClasses;
PasteContext.prototype.setMeta = PasteContext_setMeta;
PasteContext.prototype.getMeta = PasteContext_getMeta;
PasteContext.prototype.createStringBuffer = PasteContext_createStringBuffer;
PasteContext.prototype.checkClasses = PasteContext_checkClasses;
PasteContext.prototype.checkIDs = PasteContext_checkIDs;

function PasteContext_setMeta( key, value ) { this.metaTags[ key ] = value; }

function PasteContext_getMeta( key ) { return this.metaTags[ key ]; }

function PasteContext_updateClipDOM( )
{
	this.clipDOM.documentElement.outerHTML = this.clipText;
}

function PasteContext_getClipDOM( )
{
	this.updateClipDOM();
	return this.clipDOM;
}

function PasteContext_setClipText( html )
{
	this.clipText = html;
}

function PasteContext_getClipText( )
{
	return this.clipText;
}

function PasteContext_generateUsedStyles( )
{
	this.usedStyles = this.originClasses.createUsed();
	return this.usedStyles;
}

function PasteContext_getUsedStyles( )
{
	return this.usedStyles;
}

function PasteContext_getRemovedClasses( )
{
	return this.originClasses.getRemovedClasses();
}

function PasteContext_getTargetDOM( ) { return this.targetDOM; }

function PasteContext_getContentType( ) { return this.contentType; }

function PasteContext_getDebugText( )
{
	// Build a text string of the debug data generated during the run

	var debugText = "";

	for ( var index in this.debugData )
	{
		var item = this.debugData[ index ];
		debugText += item.module + " : " + item.text + "\n";
	}

	return debugText;
}

function PasteContext_getDebugHTML( )
{
	// Build an HTML table that has the debug data from the current run

	var debugText = "<table>";

	for ( var index in this.debugData )
	{
		var item = this.debugData[ index ];
		debugText += "<tr><td>" + item.module + "</td><td>" + item.level + "</td><td>" + item.text + "</td></tr>\n";
	}

	debugText += "</table>";

	return debugText;
}

function PasteContext_addToDebug ( level, module, text )
{
	this.debugData.push( { level: level, module: module, text: text } );
}

function PasteContext_debugWarning ( module, text ) { this.addToDebug( DEBUG_WARNING, module, text ); }

function PasteContext_debugInformation ( module, text ) { this.addToDebug( DEBUG_INFORMATION, module, text ); }

function PasteContext_debugCritical ( module, text ) { this.addToDebug( DEBUG_CRITICAL, module, text ); }

function PasteContext_getOriginApplicationFull() { return this.originApplicationFull; }

function PasteContext_getOriginApplication() { return this.originApplication; }

function PasteContext_getOriginApplicationVersion() { return this.originApplicationVersion; }

function PasteContext_getOriginOffice() { return this.originOffice; }

function PasteContext_setOriginApplication( name )
{
	if ( name == "excel" )
	{
		this.originOffice = true;
		if ( this.settingDefined( SETTINGS_CREATE_CLASSES ) )
		{
			this.originClasses.remapClasses();
			this.remapClasses = true;
		}
	}
	else if ( name == "word" || name == "powerpoint" )
		this.originOffice = true;

	this.originApplication = name;
}

function PasteContext_setOriginApplicationVersion( version ) { this.originApplicationVersion = version; }

function PasteContext_setOriginApplicationFull( name ) { this.originApplicationFull = name; }

function PasteContext_getSetting( name ) { return this.settings[ name ]; }

function PasteContext_settingDefined( name ) { return ( this.settings[ name ] != null ) ? true : false; }

function PasteContext_setSetting( name, value ) { this.settings[ name ] = value; }

function PasteContext_getOriginClasses( ) { return this.originClasses; }

function PasteContext_getTargetClasses( ) { return this.targetClasses; }

function PasteContext_createStringBuffer()
{
//	return new JSStringBuffer();
	return new JSDWBuffer();
}

function PasteContext_checkClasses( tag, className )
{
	var dotName = "." + className;
	var dirName = tag + dotName;
	// xxx if has name but doesn't match, we should rename it instead of using it
	if ( this.targetClasses.has( className ) || this.targetClasses.has( dotName ) || this.targetClasses.has( dirName ) )
	{
		return className;
	}
	if ( !this.settingDefined( SETTINGS_CREATE_CLASSES ) )
		return null;

	return this.originClasses.ref( tag, className );
}

function PasteContext_checkIDs( tag, id )
{
	var hashName = "#" + id;
	var dirName = tag + hashName;
	if ( this.targetIDs.has( id ) || this.targetIDs.has( hashName ) || this.targetIDs.has( dirName ) )
	{
		return id;
	}
	if ( !this.settingDefined( SETTINGS_CREATE_CLASSES ) )
		return null;
		
	return this.originClasses.refID( tag, id );
}
