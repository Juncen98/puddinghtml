

""//clear out the text fields
head_fld.text= "";
subhead_fld.text = "";

//list of all locales that require double-byte settings
doubleByteLocales = ["ko", "ja","zh_tw", "zh_cn"];

//simple method to loop through above array to tell us if we're in a double-byte locale
isDoubleByteLocale = function(){
	var retVal = false
	for (var i = 0; i< doubleByteLocales.length; i++){
		if(doubleByteLocales[i] == lang	) retVal =  true;
	}
	return retVal;
}


//determine the default font name
//
// only works in latin-based locales
getDefaultFontName = function(){
	// set the correct font name and size
	var name;
	if(isDoubleByteLocale()){
		name = null;
	} else {
		name = (plat == "mac" ? "Lucida Grande" : "Tahoma");
	}
	return name
}

/**
*	method to determine if this is the local or remote version
*/
isRemoteVersion = function(){
	var urlStr = new String(this._url);
	var isRemote = urlStr.indexOf("http://") > -1;
	
	return isRemote
}



loadXML = function(fileName){
	this.contentXML = new XML();
	this.contentXML.ignoreWhite = true;
	this.contentXML.controller = new Object();
	this.contentXML.controller = this;
	
	this.contentXML.onLoad = function(success){
		myTrace("xml load successful? " + success)
		this.controller.parseXML(success, this);
	}
	
	//where is the content? if we're in the dynamic swf, point to the current directory
	var urlStr = new String(this._url);
	if(_root.plat == "mac"){
		var xmlLoc = (isRemoteVersion() ? urlStr.substring(0 ,urlStr.indexOf("/", 7)) +"/startpage/" +  fileName : "Assets/" + fileName);
	} else {
		var xmlLoc = ( isRemoteVersion() ? urlStr.substring(0,urlStr.lastIndexOf("/") + 1) + fileName : "Assets/" + fileName);
	}
	myTrace("xml file is -- " + xmlLoc)
	this.contentXML.load(xmlLoc);
}


parseXML = function(success, contentXML){

	if(success){
		//var nd = _level0.contentXML.firstChild;
		//find the correct node for this language
		//while (nd.attributes.lang != lang){
			//nd=nd.nextSibling;
		//}
		var nd;
		var foundNode = false;
		var len = contentXML.childNodes.length;
		for(var i = 0;i<len;i++){
			nd = contentXML.childNodes[i];
			if(nd.attributes.lang == lang) {
				foundNode = true;
				break;
			}
		}
		
		//if no appropriate language is found, display the error
		if(!foundNode) {
			var fontName = 			(nd.attributes["fontName" + plat] == undefined ? getDefaultFontName() : nd.attributes["fontName" + plat]);
		
			//header and subhead content
			var head = 				new Object()
			head.text = 				"Problem Loading the content XML.";
			head.style = 				"bold"
			head.clr = 					0xFF0000;
			head.size = 				12;
			
			var subHead = 			new Object();
			subHead.text = 			"You've requested a language ( '" + lang + "' ) which does not have any available content."
			subHead.style = 			"plain";
			subHead.clr = 			0x000000;
			subHead.size = 			11;
		} else {
			
			//now start setting some variables
			var fontName = 			(nd.attributes["fontName" + plat] == undefined ? getDefaultFontName() : nd.attributes["fontName" + plat]);
	
			//get the actual content node based on the value of stat
			var content = nd.firstChild;
			while(content.nodeName != stat){
				content = content.nextSibling;
			}
			
			//goURL
			var linkUrl = 				content.attributes.linkUrl;
			
			//header and subhead content
			var headNode = 			content.firstChild;
			var head = 				new Object()
			head.text = 				headNode.attributes.text;
			head.style = 				(headNode.attributes.style == undefined ? "plain" : headNode.attributes.style); 
			//strip off leading pound sign
			var clr = 					new String(headNode.attributes.color).substring(1);
			head.clr = 					(headNode.attributes.color == undefined ? 0x2C2CFF : parseInt(clr,16)); 
			head.size = 				(headNode.attributes.size == undefined ? 11 : parseInt(headNode.attributes.size)); 
			
			var subHeadNode = 	headNode.nextSibling;
			var subHead = 			new Object();
			subHead.text = 			subHeadNode.attributes.text;
			subHead.style = 			(subHeadNode.attributes.style == undefined ? "plain" : subHeadNode.attributes.style); 
			//strip off leading pound sign
			clr = 							new String(subheadNode.attributes.color).substring(1);
			subHead.clr = 			(subHeadNode.attributes.color == undefined ? 0x000000 : parseInt(clr, 16)); 
			subHead.size = 			(subHeadNode.attributes.size == undefined ? 11 : parseInt(subHeadNode.attributes.size)); 
		}

		
	} else {
		myTrace("unable to load xml");
			var fontName = 			(nd.attributes["fontName" + plat] == undefined ? getDefaultFontName() : nd.attributes["fontName" + plat]);
		
		//header and subhead content
		var head = 				new Object()
		head.text = 				"Problem Loading the content XML";
		head.style = 				"bold"
		head.clr = 					0xFF0000;
		head.size = 				12;
		
		var subHead = 			new Object();
		subHead.text = 			"Possible reasons for this include a)the XML file is in the incorrect location or b)the XML file is incorrectly formatted."
		subHead.style = 			"plain";
		subHead.clr = 			0x000000;
		subHead.size = 			11;
		
		return;
	}
	
	var ver = (isRemoteVersion() ? "remote" : "local");
	if(success)contentSetup(fontName, linkURL, head, subhead, ver);
	getOmnitureAcctName();
}


//build product code hash based on productName
//NOTE: this first group is a legacy setting
var prodCodes = new Object();
prodCodes.contribute = "ct";
prodCodes.dreamweaver = "dw";
prodCodes.freehand = "fh";
prodCodes.fireworks = "fw";
prodCodes["flash pro"] = "flpro";

var prodCode = prodCodes[productName];

//////////////
//this lays out the buttons and sets up their links correctly
/////////////
contentSetup = function(fontName, linkURL, head, subhead, ver){
	head_fld.text= head.text;
	subhead_fld.text = subhead.text;
		
	//set the correct font dynamically
	var tf = new TextFormat();
	tf.font = fontName;

	tf = setFormatProperties(tf,head);	
	head_fld.setTextFormat(tf);
	head_fld.multiline=true;
	head_fld.wordWrap=true;
	
	tf = setFormatProperties(tf,subHead);
	subhead_fld.setTextFormat(tf);
	subhead_fld.multiline=true;
	subhead_fld.wordWrap=true;
	
	//now reset the height to eliminate the problem with descenders getting chopped
	head_fld._height = head_fld.textHeight + 2;
	
	//now reset the subHead _y 
	subhead_fld._y =  head_fld._y + head_fld._height + 1;
	
	//The below is only needed in the remote version of the content files.
	// in testing, i set "ver" == local to evalutate local content but this is not how the actual file works
	//only create the link if we're in the remote version
	if(isRemoteVersion()){
		//make a background button to support the text field
		//NOTE: requirements change -- this field needs to cover the entire swf
		this.createEmptyMovieClip("head_mc", 1);
		head_mc._x = head_fld._x;
		head_mc._y = head_fld._y;
		
		var btnWid = head_fld.textWidth;
		var btnHt = head_fld.textHeight;
		
		head_mc.moveTo(0,0);
		head_mc.beginFill(0x000000, 0);
		head_mc.lineTo(btnWid, 0);
		head_mc.lineTo(btnWid, btnHt);
		head_mc.lineTo(0, btnHt);
		head_mc.endFill()
		
		//now create a background for hte boxshot since its vector art
		this.createEmptyMovieClip("box_bg", 2);

		btnWid = boxshot_mc._width;
		btnHt = boxshot_mc._height;
		
		box_bg._x = boxshot_mc._x - (btnWid / 2);
		box_bg._y = boxshot_mc._y - (btnHt / 2);
		
		box_bg.moveTo(0,0);
		box_bg.beginFill(0x000000, 0);
		box_bg.lineTo(btnWid, 0);
		box_bg.lineTo(btnWid, btnHt);
		box_bg.lineTo(0, btnHt);
		box_bg.endFill()
		
			
		//set the target for the getURL call
		_level0.targ = "_blank";
		//parse the url. 
		//  NOTE: - this should not be handled here. This should be dealt with in the XML
		if(plat == "mac" && productName == "contribute"){
			var domain = new String(linkURL).substring(7);
			linkURL = "mmbrowse:" + domain;
			targ = null;
		}
		_level0.linkURL = linkURL;
		
		head_mc.onRelease = box_bg.onRelease = function(){
			startpage.getURL(linkURL, targ);
		}
	}
	
}


setFormatProperties = function(tf, propertyObj){
	tf.color = 			propertyObj.clr;
	tf.bold = 			(new String(propertyObj.style).toLowerCase().indexOf("bold") > -1 ? true : false)
	tf.italic = 			(new String(propertyObj.style).toLowerCase().indexOf("italic") > -1 ? true : false)
	tf.underline = 	(new String(propertyObj.style).toLowerCase().indexOf("underline") > -1 ? true : false);
	tf.size = 			propertyObj.size;
	return tf;
}



//var $debug=true;
if($debug){
	_root.createTextField("debug",1050,Stage.width - 305,0,300,79);
	_root.debug.background=true;
	_root.debug.border=true;
}
myTrace = function(str){
	if($debug)_root.debug.text +=str +"\n";
	else trace(str)
}


myTrace("-----------------------------");
myTrace("url is" + this._url);

//begin loading content	
loadXML(productName + "_content.xml");

stop();
