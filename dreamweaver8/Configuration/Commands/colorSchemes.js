//Copyright 1998, 1999, 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

//function:colorSchemes
//arguments:none
//return value: returns a multi-dimensional array of the form:
//colorSchemes[backgroundColor][textAndLinkColors][property]

//NOTE TO LOCALIZERS: Localize the *name* property of each color sceheme only.

function colorSchemes(){
var colorSchemes = new Array();
var i;

//BLACK SCHEMES
colorSchemes.Black = new Array();
i=-1;

colorSchemes.Black[++i] = new Array();
colorSchemes.Black[i].name = "Green,Grey";
colorSchemes.Black[i].bgcolor = "#000000";
colorSchemes.Black[i].text = "#339933";
colorSchemes.Black[i].link = "#33FF00";
colorSchemes.Black[i].vlink = "#666666";
colorSchemes.Black[i].alink = "#666600";

colorSchemes.Black[++i] = new Array();
colorSchemes.Black[i].name = "Brown,Red";
colorSchemes.Black[i].bgcolor = "#000000";
colorSchemes.Black[i].text = "#CC6666";
colorSchemes.Black[i].link = "#FF0000";
colorSchemes.Black[i].vlink = "#CC3333";
colorSchemes.Black[i].alink = "#990000";

colorSchemes.Black[++i] = new Array();
colorSchemes.Black[i].name = "Green,Yellow";
colorSchemes.Black[i].bgcolor = "#000000";
colorSchemes.Black[i].text = "#999966";
colorSchemes.Black[i].link = "#FFFF00";
colorSchemes.Black[i].vlink = "#999933";
colorSchemes.Black[i].alink = "#FFFF99";


colorSchemes.Black[++i] = new Array();
colorSchemes.Black[i].name = "Purple,Blue";
colorSchemes.Black[i].bgcolor = "#000000";
colorSchemes.Black[i].text = "#CCCCFF";
colorSchemes.Black[i].link = "#00FFFF";
colorSchemes.Black[i].vlink = "#6666FF";
colorSchemes.Black[i].alink = "#000066";


colorSchemes.Black[++i] = new Array();
colorSchemes.Black[i].name = "Blue";
colorSchemes.Black[i].bgcolor = "#000000";
colorSchemes.Black[i].text = "#669999";
colorSchemes.Black[i].link = "#00FFFF";
colorSchemes.Black[i].vlink = "#006666";
colorSchemes.Black[i].alink = "#003333";

colorSchemes.Black[++i] = new Array();
colorSchemes.Black[i].name = "Purple,Pink";
colorSchemes.Black[i].bgcolor = "#000000";
colorSchemes.Black[i].text = "#996699";
colorSchemes.Black[i].link = "#FF00FF";
colorSchemes.Black[i].vlink = "#663366";
colorSchemes.Black[i].alink = "#FF99FF";

//BLUE SCHEMES
colorSchemes.Blue = new Array();
i=-1;

colorSchemes.Blue[++i] = new Array();
colorSchemes.Blue[i].name = "Blue,White";
colorSchemes.Blue[i].bgcolor = "#0099FF";
colorSchemes.Blue[i].text = "#99FFFF";
colorSchemes.Blue[i].link = "#00FFFF";
colorSchemes.Blue[i].vlink = "#99CCCC";
colorSchemes.Blue[i].alink = "#FFFFFF";

colorSchemes.Blue[++i] = new Array();
colorSchemes.Blue[i].name = "White,Green,Yellow";
colorSchemes.Blue[i].bgcolor = "#6666FF";
colorSchemes.Blue[i].text = "#FFFFFF";
colorSchemes.Blue[i].link = "#99FF33";
colorSchemes.Blue[i].vlink = "#FFFF00";
colorSchemes.Blue[i].alink = "#00CC00";


colorSchemes.Blue[++i] = new Array();
colorSchemes.Blue[i].name = "Green,White";
colorSchemes.Blue[i].bgcolor = "#3333FF";
colorSchemes.Blue[i].text = "#99CC99";
colorSchemes.Blue[i].link = "#00FF00";
colorSchemes.Blue[i].vlink = "#339933";
colorSchemes.Blue[i].alink = "#FFFFFF";

colorSchemes.Blue[++i] = new Array();
colorSchemes.Blue[i].name = "Grey,Orange,Purple";
colorSchemes.Blue[i].bgcolor = "#0000CC";
colorSchemes.Blue[i].text = "#CCCCCC";
colorSchemes.Blue[i].link = "#CC6666";
colorSchemes.Blue[i].vlink = "#6633CC";
colorSchemes.Blue[i].alink = "#FF0000";

colorSchemes.Blue[++i] = new Array();
colorSchemes.Blue[i].name = "Green,Yellow,White";
colorSchemes.Blue[i].bgcolor = "#0000CC";
colorSchemes.Blue[i].text = "#99CC99";
colorSchemes.Blue[i].link = "#FFFF00";
colorSchemes.Blue[i].vlink = "#669900";
colorSchemes.Blue[i].alink = "#FFFFFF";

//BROWN SCHEMES
colorSchemes.Brown = new Array();
i=-1;

colorSchemes.Brown[++i] = new Array();
colorSchemes.Brown[i].name = "Yellow,Orange,Blue";
colorSchemes.Brown[i].bgcolor = "#663300";
colorSchemes.Brown[i].text = "#FFCC99";
colorSchemes.Brown[i].link = "#FF6600";
colorSchemes.Brown[i].vlink = "#666699";
colorSchemes.Brown[i].alink = "#FF3300";

colorSchemes.Brown[++i] = new Array();
colorSchemes.Brown[i].name = "Purple,Olive,Red";
colorSchemes.Brown[i].bgcolor = "#663300";
colorSchemes.Brown[i].text = "#9999CC";
colorSchemes.Brown[i].link = "#999900";
colorSchemes.Brown[i].vlink = "#CC6600";
colorSchemes.Brown[i].alink = "#66CC00";

colorSchemes.Brown[++i] = new Array();
colorSchemes.Brown[i].name = "Purple,Grey";
colorSchemes.Brown[i].bgcolor = "#663300";
colorSchemes.Brown[i].text = "#CCCCFF";
colorSchemes.Brown[i].link = "#6666FF";
colorSchemes.Brown[i].vlink = "#666666";
colorSchemes.Brown[i].alink = "#0000FF";

//GREEN SCHEMES
colorSchemes.Green = new Array();
i=-1;


colorSchemes.Green[++i] = new Array();
colorSchemes.Green[i].name = "Brown,Green,Blue";
colorSchemes.Green[i].bgcolor = "#CCFFCC";
colorSchemes.Green[i].text = "#666600";
colorSchemes.Green[i].link = "#009900";
colorSchemes.Green[i].vlink = "#006600";
colorSchemes.Green[i].alink = "#00FF00";

colorSchemes.Green[++i] = new Array();
colorSchemes.Green[i].name = "Blue,Brown,Green";
colorSchemes.Green[i].bgcolor = "#99FFCC";
colorSchemes.Green[i].text = "#336666";
colorSchemes.Green[i].link = "#999900";
colorSchemes.Green[i].vlink = "#339900";
colorSchemes.Green[i].alink = "#009999";

colorSchemes.Green[++i] = new Array();
colorSchemes.Green[i].name = "Brown,Yellow,Red";
colorSchemes.Green[i].bgcolor = "#99CC66";
colorSchemes.Green[i].text = "#663333";
colorSchemes.Green[i].link = "#FFFF00";
colorSchemes.Green[i].vlink = "#FF6666";
colorSchemes.Green[i].alink = "#996666";

colorSchemes.Green[++i] = new Array();
colorSchemes.Green[i].name = "Black,Yellow,Brown";
colorSchemes.Green[i].bgcolor = "#66CC66";
colorSchemes.Green[i].text = "#003300";
colorSchemes.Green[i].link = "#FFFF99";
colorSchemes.Green[i].vlink = "#666600";
colorSchemes.Green[i].alink = "#CCCC99";

colorSchemes.Green[++i] = new Array();
colorSchemes.Green[i].name = "Brown,White,Green";
colorSchemes.Green[i].bgcolor = "#CCCC99";
colorSchemes.Green[i].text = "#663300";
colorSchemes.Green[i].link = "#FFFFFF";
colorSchemes.Green[i].vlink = "#669966";
colorSchemes.Green[i].alink = "#996666";



//GREY SCHEMES
colorSchemes.Grey = new Array();
i=-1;


colorSchemes.Grey[++i] = new Array();
colorSchemes.Grey[i].name = "Grey,White";
colorSchemes.Grey[i].bgcolor = "#333333";
colorSchemes.Grey[i].text = "#CCCCCC";
colorSchemes.Grey[i].link = "#666666";
colorSchemes.Grey[i].vlink = "#999999";
colorSchemes.Grey[i].alink = "#FFFFFF";

colorSchemes.Grey[++i] = new Array();
colorSchemes.Grey[i].name = "Blue";
colorSchemes.Grey[i].bgcolor = "#666666";
colorSchemes.Grey[i].text = "#99CCCC";
colorSchemes.Grey[i].link = "#00FFFF";
colorSchemes.Grey[i].vlink = "#66CCCC";
colorSchemes.Grey[i].alink = "#CCFFFF";

colorSchemes.Grey[++i] = new Array();
colorSchemes.Grey[i].name = "Pink,Red,Brown";
colorSchemes.Grey[i].bgcolor = "#666666";
colorSchemes.Grey[i].text = "#FF9999";
colorSchemes.Grey[i].link = "#CC0000";
colorSchemes.Grey[i].vlink = "#663333";
colorSchemes.Grey[i].alink = "#330000";

colorSchemes.Grey[++i] = new Array();
colorSchemes.Grey[i].name = "White,Pink,Purple";
colorSchemes.Grey[i].bgcolor = "#999999";
colorSchemes.Grey[i].text = "#FFFFFF";
colorSchemes.Grey[i].link = "#FF00FF";
colorSchemes.Grey[i].vlink = "#993399";
colorSchemes.Grey[i].alink = "#FF66FF";

colorSchemes.Grey[++i] = new Array();
colorSchemes.Grey[i].name = "Brown,Yellow";
colorSchemes.Grey[i].bgcolor = "#999999";
colorSchemes.Grey[i].text = "#333300";
colorSchemes.Grey[i].link = "#FFFF00";
colorSchemes.Grey[i].vlink = "#CCCC33";
colorSchemes.Grey[i].alink = "#FFFF99";

colorSchemes.Grey[++i] = new Array();
colorSchemes.Grey[i].name = "Brown,Olive,Yellow";
colorSchemes.Grey[i].bgcolor = "#666666";
colorSchemes.Grey[i].text = "#CCCC99";
colorSchemes.Grey[i].link = "#FFFF00";
colorSchemes.Grey[i].vlink = "#FFFF99";
colorSchemes.Grey[i].alink = "#999900";

colorSchemes.Grey[++i] = new Array();
colorSchemes.Grey[i].name = "Green";
colorSchemes.Grey[i].bgcolor = "#333333";
colorSchemes.Grey[i].text = "#669966";
colorSchemes.Grey[i].link = "#33CC33";
colorSchemes.Grey[i].vlink = "#99CC99";
colorSchemes.Grey[i].alink = "#CCFFCC";

colorSchemes.Grey[++i] = new Array();
colorSchemes.Grey[i].name = "White,Orange,Brown";
colorSchemes.Grey[i].bgcolor = "#333333";
colorSchemes.Grey[i].text = "#FFFFFF";
colorSchemes.Grey[i].link = "#FFCC00";
colorSchemes.Grey[i].vlink = "#999966";
colorSchemes.Grey[i].alink = "#FFFF00";

//MAGENTA SCHEMES
colorSchemes.Magenta = new Array();
i=-1;

colorSchemes.Magenta[++i] = new Array();
colorSchemes.Magenta[i].name = "Green,Yellow,Orange";
colorSchemes.Magenta[i].bgcolor = "#CC33CC";
colorSchemes.Magenta[i].text = "#CCCC99";
colorSchemes.Magenta[i].link = "#FFFF00";
colorSchemes.Magenta[i].vlink = "#FF9900";
colorSchemes.Magenta[i].alink = "#FFFFCC";

colorSchemes.Magenta[++i] = new Array();
colorSchemes.Magenta[i].name = "White,Green,Blue";
colorSchemes.Magenta[i].bgcolor = "#CC33CC";
colorSchemes.Magenta[i].text = "#FFFFFF";
colorSchemes.Magenta[i].link = "#66FF66";
colorSchemes.Magenta[i].vlink = "#66FFFF";
colorSchemes.Magenta[i].alink = "#CCCCCC";

colorSchemes.Magenta[++i] = new Array();
colorSchemes.Magenta[i].name = "Purple,Blue";
colorSchemes.Magenta[i].bgcolor = "#CC00FF";
colorSchemes.Magenta[i].text = "#CCCCFF";
colorSchemes.Magenta[i].link = "#00FFFF";
colorSchemes.Magenta[i].vlink = "#9999FF";
colorSchemes.Magenta[i].alink = "#CCFFFF";

//ORANGE SCHEMES
colorSchemes.Orange = new Array();
i=-1;

colorSchemes.Orange[++i] = new Array();
colorSchemes.Orange[i].name = "Grey,Yellow,Orange";
colorSchemes.Orange[i].bgcolor = "#FF9900";
colorSchemes.Orange[i].text = "#333333";
colorSchemes.Orange[i].link = "#FFFF00";
colorSchemes.Orange[i].vlink = "#FFCC66";
colorSchemes.Orange[i].alink = "#666600";

colorSchemes.Orange[++i] = new Array();
colorSchemes.Orange[i].name = "Blue,Green,Yellow";
colorSchemes.Orange[i].bgcolor = "#FF9933";
colorSchemes.Orange[i].text = "#003300";
colorSchemes.Orange[i].link = "#006666";
colorSchemes.Orange[i].vlink = "#336633";
colorSchemes.Orange[i].alink = "#FFFF00";

colorSchemes.Orange[++i] = new Array();
colorSchemes.Orange[i].name = "Grey,Yellow";
colorSchemes.Orange[i].bgcolor = "#FF9933";
colorSchemes.Orange[i].text = "#333333";
colorSchemes.Orange[i].link = "#FFFFCC";
colorSchemes.Orange[i].vlink = "#CCCCCC";
colorSchemes.Orange[i].alink = "#FFFF00";


//PURPLE SCHEMES
colorSchemes.Purple = new Array();
i=-1;

colorSchemes.Purple[++i] = new Array();
colorSchemes.Purple[i].name = "Yellow,Orange,Olive";
colorSchemes.Purple[i].bgcolor = "#993399";
colorSchemes.Purple[i].text = "#FFFF66";
colorSchemes.Purple[i].link = "#FF9900";
colorSchemes.Purple[i].vlink = "#999966";
colorSchemes.Purple[i].alink = "#FF00FF";

colorSchemes.Purple[++i] = new Array();
colorSchemes.Purple[i].name = "Grey,Pink,Orange";
colorSchemes.Purple[i].bgcolor = "#663366";
colorSchemes.Purple[i].text = "#CCCCCC";
colorSchemes.Purple[i].link = "#FF66FF";
colorSchemes.Purple[i].vlink = "#FF6666";
colorSchemes.Purple[i].alink = "#FFFFFF";

colorSchemes.Purple[++i] = new Array();
colorSchemes.Purple[i].name = "White,Yellow,Green";
colorSchemes.Purple[i].bgcolor = "#CC00CC";
colorSchemes.Purple[i].text = "#FFFFFF";
colorSchemes.Purple[i].link = "#FFFF00";
colorSchemes.Purple[i].vlink = "#CCCC33";
colorSchemes.Purple[i].alink = "#FF0000";

colorSchemes.Purple[++i] = new Array();
colorSchemes.Purple[i].name = "Pink,Blue";
colorSchemes.Purple[i].bgcolor = "#996699";
colorSchemes.Purple[i].text = "#FFCCFF";
colorSchemes.Purple[i].link = "#3399FF";
colorSchemes.Purple[i].vlink = "#00CCFF";
colorSchemes.Purple[i].alink = "#00FFFF";

colorSchemes.Purple[++i] = new Array();
colorSchemes.Purple[i].name = "Green,Brown,Black";
colorSchemes.Purple[i].bgcolor = "#666600";
colorSchemes.Purple[i].text = "#99FF99";
colorSchemes.Purple[i].link = "#999900";
colorSchemes.Purple[i].vlink = "#009966";
colorSchemes.Purple[i].alink = "#000000";

colorSchemes.Purple[++i] = new Array();
colorSchemes.Purple[i].name = "Purple,White";
colorSchemes.Purple[i].bgcolor = "#9999FF";
colorSchemes.Purple[i].text = "#333300";
colorSchemes.Purple[i].link = "#FFFFFF";
colorSchemes.Purple[i].vlink = "#CCFFFF";
colorSchemes.Purple[i].alink = "#6666FF";

colorSchemes.Purple[++i] = new Array();
colorSchemes.Purple[i].name = "Blue,Purple,Green";
colorSchemes.Purple[i].bgcolor = "#CCCCFF";
colorSchemes.Purple[i].text = "#006666";
colorSchemes.Purple[i].link = "#666633";
colorSchemes.Purple[i].vlink = "#009933";
colorSchemes.Purple[i].alink = "#666699";

colorSchemes.Purple[++i] = new Array();
colorSchemes.Purple[i].name = "White,Green,Yellow";
colorSchemes.Purple[i].bgcolor = "#9966FF";
colorSchemes.Purple[i].text = "#FFFFFF";
colorSchemes.Purple[i].link = "#99FF33";
colorSchemes.Purple[i].vlink = "#FFFF00";
colorSchemes.Purple[i].alink = "#00CC00";


colorSchemes.Purple[++i] = new Array();
colorSchemes.Purple[i].name = "Blue,Grey,Purple";
colorSchemes.Purple[i].bgcolor = "#9966FF";
colorSchemes.Purple[i].text = "#CCFFFF";
colorSchemes.Purple[i].link = "#0000FF";
colorSchemes.Purple[i].vlink = "#333333";
colorSchemes.Purple[i].alink = "#9999FF";

//RED SCHEMES
colorSchemes.Red = new Array();
i=-1;

colorSchemes.Red[++i] = new Array();
colorSchemes.Red[i].name = "Pink,Yellow,Green";
colorSchemes.Red[i].bgcolor = "#993300";
colorSchemes.Red[i].text = "#FFCCFF";
colorSchemes.Red[i].link = "#FFFF00";
colorSchemes.Red[i].vlink = "#CCCC33";
colorSchemes.Red[i].alink = "#CCCC99";

colorSchemes.Red[++i] = new Array();
colorSchemes.Red[i].name = "Brown,Pink,Purple";
colorSchemes.Red[i].bgcolor = "#FFCCCC";
colorSchemes.Red[i].text = "#660033";
colorSchemes.Red[i].link = "#FF0066";
colorSchemes.Red[i].vlink = "#CC9999";
colorSchemes.Red[i].alink = "#FF0000";

colorSchemes.Red[++i] = new Array();
colorSchemes.Red[i].name = "Yellow,Olive";
colorSchemes.Red[i].bgcolor = "#CC6666";
colorSchemes.Red[i].text = "#FFFF00";
colorSchemes.Red[i].link = "#FFFF99";
colorSchemes.Red[i].vlink = "#CCCC99";
colorSchemes.Red[i].alink = "#FFFFCC";

colorSchemes.Red[++i] = new Array();
colorSchemes.Red[i].name = "Yellow,Brown";
colorSchemes.Red[i].bgcolor = "#CC3333";
colorSchemes.Red[i].text = "#FFFF99";
colorSchemes.Red[i].link = "#FFFF00";
colorSchemes.Red[i].vlink = "#999966";
colorSchemes.Red[i].alink = "#666600";

//WHITE SCHEMES
colorSchemes.White = new Array();
i=-1;

colorSchemes.White[++i] = new Array();
colorSchemes.White[i].name = "Brown,Red,Orange";
colorSchemes.White[i].bgcolor = "#FFFFFF";
colorSchemes.White[i].text = "#996666";
colorSchemes.White[i].link = "#FF0000";
colorSchemes.White[i].vlink = "#663333";
colorSchemes.White[i].alink = "#FF9999";

colorSchemes.White[++i] = new Array();
colorSchemes.White[i].name = "Purple,Orange";
colorSchemes.White[i].bgcolor = "#FFFFFF";
colorSchemes.White[i].text = "#996699";
colorSchemes.White[i].link = "#FF9900";
colorSchemes.White[i].vlink = "#663366";
colorSchemes.White[i].alink = "#FF00FF";

colorSchemes.White[++i] = new Array();
colorSchemes.White[i].name = "Purple,Blue";
colorSchemes.White[i].bgcolor = "#FFFFFF";
colorSchemes.White[i].text = "#996699";
colorSchemes.White[i].link = "#3333FF";
colorSchemes.White[i].vlink = "#333366";
colorSchemes.White[i].alink = "#0000CC";


colorSchemes.White[++i] = new Array();
colorSchemes.White[i].name = "Turquoise,Aqua"
colorSchemes.White[i].bgcolor = "#FFFFFF";
colorSchemes.White[i].text = "#336666";
colorSchemes.White[i].link = "#009999";
colorSchemes.White[i].vlink = "#66CCCC";
colorSchemes.White[i].alink = "#00FFFF";

colorSchemes.White[++i] = new Array();
colorSchemes.White[i].name = "Olive,Green";
colorSchemes.White[i].bgcolor = "#FFFFFF";
colorSchemes.White[i].text = "#669966";
colorSchemes.White[i].link = "#009900";
colorSchemes.White[i].vlink = "#336633";
colorSchemes.White[i].alink = "#00FF00";

colorSchemes.White[++i] = new Array();
colorSchemes.White[i].name = "Brown,Yellow";
colorSchemes.White[i].bgcolor = "#FFFFFF";
colorSchemes.White[i].text = "#999966";
colorSchemes.White[i].link = "#CCCC00";
colorSchemes.White[i].vlink = "#666633";
colorSchemes.White[i].alink = "#FFFF66";


//YELLOW SCHEMES
colorSchemes.Yellow = new Array();
i=-1;

colorSchemes.Yellow[++i] = new Array();
colorSchemes.Yellow[i].name = "Green,Blue,Purple";
colorSchemes.Yellow[i].bgcolor = "#FFFF66";
colorSchemes.Yellow[i].text = "#336666";
colorSchemes.Yellow[i].link = "#0000FF";
colorSchemes.Yellow[i].vlink = "#33CCCC";
colorSchemes.Yellow[i].alink = "#990099";

colorSchemes.Yellow[++i] = new Array();
colorSchemes.Yellow[i].name = "Green,Red,Orange";
colorSchemes.Yellow[i].bgcolor = "#FFFF33";
colorSchemes.Yellow[i].text = "#336600";
colorSchemes.Yellow[i].link = "#CC3300";
colorSchemes.Yellow[i].vlink = "#FF6633";
colorSchemes.Yellow[i].alink = "#660000";

colorSchemes.Yellow[++i] = new Array();
colorSchemes.Yellow[i].name = "Purple,Pink,Green";
colorSchemes.Yellow[i].bgcolor = "#FFFFCC";
colorSchemes.Yellow[i].text = "#660099";
colorSchemes.Yellow[i].link = "#FF3399";
colorSchemes.Yellow[i].vlink = "#669966";
colorSchemes.Yellow[i].alink = "#CC3333";

colorSchemes.Yellow[++i] = new Array();
colorSchemes.Yellow[i].name = "Brown,Red";
colorSchemes.Yellow[i].bgcolor = "#FFCC99";
colorSchemes.Yellow[i].text = "#663300";
colorSchemes.Yellow[i].link = "#CC6600";
colorSchemes.Yellow[i].vlink = "#666666";
colorSchemes.Yellow[i].alink = "#FF3300";


return colorSchemes;

}






