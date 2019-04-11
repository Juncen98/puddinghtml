// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.
//Given a unique object name, finds the object in the DOM. dom is used for recursion
//and is not normally passed in. For example:
//    obj = MM_findObj("image1");
//obj will point to the image object. It can be in layers, frames etc.
//To look in other frames, use objName?frameName. For example:
//    obj = MM_findObj("image1?topFrame");
//will only search frame "topFrame".
//Now works for Netscape 6 as well!

function MM_findObj(n, d) { //v4.01
  var p,i,x;  if(!d) d=document; if((p=n.indexOf("?"))>0&&parent.frames.length) {
    d=parent.frames[n.substring(p+1)].document; n=n.substring(0,p);}
  if(!(x=d[n])&&d.all) x=d.all[n]; for (i=0;!x&&i<d.forms.length;i++) x=d.forms[i][n];
  for(i=0;!x&&d.layers&&i<d.layers.length;i++) x=MM_findObj(n,d.layers[i].document);
  if(!x && d.getElementById) x=d.getElementById(n); return x;
}

MM.VERSION_MM_findObj = 4.01; //define latest version number for behavior inspector
