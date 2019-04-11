// Copyright 1998, 1999, 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.
//Preloads multiple images files in order. Accepts a variable number of args
//(each should be quoted):
//  imgURL   - an image filename, URL encoded. (ex: file.gif, http://www.x.com/y.gif)
//
//Creates a new array of Image objects. With each one, it assigns an image source
//from the argument list. These are downloaded essentially simultaneously into the
//client cache. When the user needs a new image file (for example: they go to the
//next web page), the browser should quickly find this image in the cache.

function MM_preloadImages() { //v3.0
  var d=document; if(d.images){ if(!d.MM_p) d.MM_p=new Array();
    var i,j=d.MM_p.length,a=MM_preloadImages.arguments; for(i=0; i<a.length; i++)
    if (a[i].indexOf("#")!=0){ d.MM_p[j]=new Image; d.MM_p[j++].src=a[i];}}
}

MM.VERSION_MM_preloadImages = 3.0; //define latest version number for behavior inspector
