
function searchBackwards(fromOffset,dom){
  var backPoint;
	for (var i=fromOffset; i >= 0; i--){
		j = dom.source.getText(i,i+1);
		if (j == " " || j == "." || j == "(" || j == ")" || j == "<" || j == ">" || j == "=" || j == "/" || j == "\\" || j == "\n" || j == "\r" || j == "@" || j == "%" || j == '"'){
			backPoint = i+1;
			break;
		}
	}
	return backPoint;
}

function getPrevWord(fromOffset,dom){
	var backPoint = searchBackwards(fromOffset-2,dom);
	return dom.source.getText(backPoint,fromOffset-1);
}

function getTagName(fromOffset,dom,docLength){
	var backPoint;
	var forPoint;
	var j;
	for (var i=fromOffset; i >= 0; i--){
		j = dom.source.getText(i,i+1);
		if (j == "<"){
			backPoint = i+1;
			break;
		}
	}
	for (var i=backPoint; i < docLength; i++){
		j = dom.source.getText(i,i+1);
		if (j == " "){
			forPoint = i;
			break;
		}
	}
	return dom.source.getText(backPoint,forPoint);
}

function searchForwards(fromOffset,dom,docLength){
	var forPoint;
	for (var i=fromOffset; i < docLength; i++){
		j = dom.source.getText(i,i+1);
		if (j == " " || j == "." || j == "(" || j == ")" || j == "<" || j == ">" || j == "=" || j == "/" || j == "\\" || j == "\n" || j == "\r" || j == "@" || j == "%" || j == '"'){
			forPoint = i;
			break;
		}
	}
	return forPoint;
}

function getTopic(keyword){
	var retVal = null;
	for (var i=0; i < KEYWORDS.length; i=i+3){
		if (KEYWORDS[i] == keyword){
			retVal = new Array (BOOK_NAME,KEYWORDS[i+1],KEYWORDS[i+2]);
			break;
		}
	}
	return retVal;
}