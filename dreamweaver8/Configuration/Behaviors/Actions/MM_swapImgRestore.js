// Copyright 1998, 1999, 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

//Restores a set of images to their previous source files.
//Accepts a variable number of params, in pairs read from a global property:
//  objStr - Javascript object ref for an image (ex: document.myImage)
//  imgURL - original image filename, URL encoded. (ex: file.gif, http://www.x.com/y.gif)
//
//This is the companion Action to Swap Image. Swap Image gathers the original
//image src filenames, and writes document.MM_swapImageData before changing the images.
//This sets the images src properties back to their original filenames:
//  document.myImage.src = file.gif.

function MM_swapImgRestore() { //v3.0
  var i,x,a=document.MM_sr; for(i=0;a&&i<a.length&&(x=a[i])&&x.oSrc;i++) x.src=x.oSrc;
}

MM.VERSION_MM_swapImgRestore = 3.0; //define latest version number for behavior inspector
