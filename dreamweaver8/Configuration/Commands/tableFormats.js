 //Copyright 1998, 1999, 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.


function tableFormats(){
  var Formats=new Array();
  var i=-1;

// ***** Define all additional table formats after this line! *****

// *********************Simple Formats************************

//Directions: To define a new format, copy a format definition and paste in another location.
//Change the name property to reflect the new name. Change the properties to reflect the new
//properties.

//Notes:
//*Define null values as empty strings
//except text styles; define null text styles as 0
//*rowLimit usage: row color is alternated every rowLimit rows.
//Text Styles are defined as constants: NONE,BOLD,ITALIC, and BOLD_ITALIC

//Simple1
Formats[++i] = new Array();                   Formats[i].name="Simple1";                       
Formats[i].firstRowColor="";                  Formats[i].secondRowColor="";
Formats[i].topRowTextStyle=BOLD;              Formats[i].topRowAlign="";
Formats[i].topRowColor="#99FF00";             Formats[i].topRowTextColor="";
Formats[i].leftColTextStyle=ITALIC;           Formats[i].leftColAlign="";
Formats[i].border="0";                        Formats[i].rowLimit="0";

//Simple2
Formats[++i] = new Array();                   Formats[i].name="Simple2";                       
Formats[i].firstRowColor="";                  Formats[i].secondRowColor="";
Formats[i].topRowTextStyle=BOLD;              Formats[i].topRowAlign="center";
Formats[i].topRowColor="";                    Formats[i].topRowTextColor="";
Formats[i].leftColTextStyle=BOLD;             Formats[i].leftColAlign="center";
Formats[i].border="1";                        Formats[i].rowLimit="0";

//Simple3
Formats[++i] = new Array();                   Formats[i].name="Simple3";                       
Formats[i].firstRowColor="#FFFFCA";           Formats[i].secondRowColor="";
Formats[i].topRowTextStyle=NONE;              Formats[i].topRowAlign="";
Formats[i].topRowColor="#DFDFFF";             Formats[i].topRowTextColor="";
Formats[i].leftColTextStyle=NONE;             Formats[i].leftColAlign="";
Formats[i].border="0";                        Formats[i].rowLimit="0";

//Simple4
Formats[++i] = new Array();                   Formats[i].name="Simple4";                       
Formats[i].firstRowColor="lightgreen";        Formats[i].secondRowColor="";
Formats[i].topRowTextStyle=ITALIC;            Formats[i].topRowAlign="center";
Formats[i].topRowColor="lightyellow";         Formats[i].topRowTextColor="";
Formats[i].leftColTextStyle=NONE;             Formats[i].leftColAlign="";
Formats[i].border="1";                        Formats[i].rowLimit="0";


 // *********************Alternating Rows************************

//Directions: To define a new format, copy a format definition and paste in another location.
//Change the name property to reflect the new name. Change the properties to reflect the new
//format. For instance, to create a table with red and white alternating rows, set
//Formats[i].firstRowColor to red and Formats[i].secondRowColor to white.

//Notes:-All properties must be defined.
//-Colors can be defined with color names or hex values.
//-rowLimit usage: row color is alternated every rowLimit rows.
//Text Styles are defined as constants: NONE,BOLD,ITALIC, and BOLD_ITALIC

//Blue & Yellow
Formats[++i] = new Array();                   Formats[i].name="AltRows:Blue&Yellow";                       
Formats[i].firstRowColor="#FFFFCC";           Formats[i].secondRowColor="#6666CC";
Formats[i].topRowTextStyle=NONE;              Formats[i].topRowAlign="LEFT";
Formats[i].topRowColor="";                    Formats[i].topRowTextColor="";
Formats[i].leftColTextStyle=NONE;             Formats[i].leftColAlign="";
Formats[i].border="2";                        Formats[i].rowLimit="1";

//Earth Colors
Formats[++i] = new Array();                   Formats[i].name="AltRows:Earth Colors";                       
Formats[i].firstRowColor="#CC9900";           Formats[i].secondRowColor="#CCCC00";
Formats[i].topRowTextStyle=ITALIC;            Formats[i].topRowAlign="";
Formats[i].topRowColor="#666600";             Formats[i].topRowTextColor="#CC9900";
Formats[i].leftColTextStyle=NONE;             Formats[i].leftColAlign="";
Formats[i].border="0";                        Formats[i].rowLimit="1";

//Earth Colors 2
Formats[++i] = new Array();                   Formats[i].name="AltRows:Earth Colors2";                       
Formats[i].firstRowColor="#FFFFCC";           Formats[i].secondRowColor="#CCCC00";
Formats[i].topRowTextStyle=NONE;              Formats[i].topRowAlign="";
Formats[i].topRowColor="";                    Formats[i].topRowTextColor="";
Formats[i].leftColTextStyle=NONE;             Formats[i].leftColAlign="";
Formats[i].border="0";                        Formats[i].rowLimit="1";

//Green & Yellow
Formats[++i] = new Array();                   Formats[i].name="AltRows:Green&Yellow";                       
Formats[i].firstRowColor="#FFFFCC";           Formats[i].secondRowColor="#CCFF99";
Formats[i].topRowTextStyle=NONE;              Formats[i].topRowAlign="center";
Formats[i].topRowColor="#6633CC";             Formats[i].topRowTextColor="white";
Formats[i].leftColTextStyle=NONE;             Formats[i].leftColAlign="center";
Formats[i].border="2";                        Formats[i].rowLimit="1";

//Grey
Formats[++i] = new Array();                   Formats[i].name="AltRows:Basic Grey";                       
Formats[i].firstRowColor="lightgrey";         Formats[i].secondRowColor="white";
Formats[i].topRowTextStyle=BOLD;              Formats[i].topRowAlign="center";
Formats[i].topRowColor="";                    Formats[i].topRowTextColor="";
Formats[i].leftColTextStyle=NONE;             Formats[i].leftColAlign="";
Formats[i].border="0";                        Formats[i].rowLimit="1";

//Orange
Formats[++i] = new Array();                   Formats[i].name="AltRows:Orange";                       
Formats[i].firstRowColor="#FF9900";           Formats[i].secondRowColor="#FFCC66";
Formats[i].topRowTextStyle=BOLD;              Formats[i].topRowAlign="";
Formats[i].topRowColor="yellow";              Formats[i].topRowTextColor="";
Formats[i].leftColTextStyle=NONE;             Formats[i].leftColAlign="";
Formats[i].border="0";                        Formats[i].rowLimit="1";


//Red
Formats[++i] = new Array();                   Formats[i].name="AltRows:Red";                       
Formats[i].firstRowColor="#FF6666";           Formats[i].secondRowColor="#FFFFCC";
Formats[i].topRowTextStyle=BOLD;              Formats[i].topRowAlign="center";
Formats[i].topRowColor="#FFFF99";             Formats[i].topRowTextColor="";
Formats[i].leftColTextStyle=ITALIC;           Formats[i].leftColAlign="center";
Formats[i].border="0";                        Formats[i].rowLimit="1";

//Sunset
Formats[++i] = new Array();                   Formats[i].name="AltRows:Sunset";                       
Formats[i].firstRowColor="yellow";            Formats[i].secondRowColor="orange";
Formats[i].topRowTextStyle=BOLD;              Formats[i].topRowAlign="center";
Formats[i].topRowColor="";                    Formats[i].topRowTextColor="blue";
Formats[i].leftColTextStyle=NONE;             Formats[i].leftColAlign="center";
Formats[i].border="0";                        Formats[i].rowLimit="1";


 // *********************Double Rows************************

//Directions: To define a new format, copy a format definition and paste in another location. //Change the name property to reflect the new name. Change the properties to reflect the new //format. For instance, to create a table with red and white alternating rows, set //Formats[i].firstRowColor to red and Formats[i].secondRowColor to white.

//Notes:-All properties must be defined.
//-Use "" to indicate no formatting. This removes the current formatting.
//-rowLimit usage: row color is alternated every rowLimit rows.
//Text Styles are defined as constants: NONE,BOLD,ITALIC, and BOLD_ITALIC

//Cyan
Formats[++i] = new Array();                   Formats[i].name="DblRows:Cyan";                       
Formats[i].firstRowColor="#CCFFFF";           Formats[i].secondRowColor="#66FFCC";
Formats[i].topRowTextStyle=BOLD;              Formats[i].topRowAlign="center";
Formats[i].topRowColor="";                    Formats[i].topRowTextColor="";
Formats[i].leftColTextStyle=NONE;             Formats[i].leftColAlign="";
Formats[i].border="3";                        Formats[i].rowLimit="2";

//Grey
Formats[++i] = new Array();                   Formats[i].name="DblRows:Grey";                       
Formats[i].firstRowColor="white";             Formats[i].secondRowColor="lightgrey";
Formats[i].topRowTextStyle=BOLD;              Formats[i].topRowAlign="center";
Formats[i].topRowColor="";                    Formats[i].topRowTextColor="";
Formats[i].leftColTextStyle=NONE;             Formats[i].leftColAlign="";
Formats[i].border="1";                        Formats[i].rowLimit="2";

//Light Green
Formats[++i] = new Array();                   Formats[i].name="DblRows:Light Green";                       
Formats[i].firstRowColor="white";             Formats[i].secondRowColor="lightgreen";
Formats[i].topRowTextStyle=BOLD;              Formats[i].topRowAlign="center";
Formats[i].topRowColor="lightyellow";         Formats[i].topRowTextColor="red";
Formats[i].leftColTextStyle=NONE;             Formats[i].leftColAlign="";
Formats[i].border="2";                        Formats[i].rowLimit="2";

//Magenta & Blue
Formats[++i] = new Array();                   Formats[i].name="DblRows:Magenta,Blue";                       
Formats[i].firstRowColor="#CC00FF";           Formats[i].secondRowColor="#CCFFFF";
Formats[i].topRowTextStyle=NONE;              Formats[i].topRowAlign="";
Formats[i].topRowColor="";                    Formats[i].topRowTextColor="";
Formats[i].leftColTextStyle=NONE;             Formats[i].leftColAlign="center";
Formats[i].border="1";                        Formats[i].rowLimit="2";

//Orange
Formats[++i] = new Array();                   Formats[i].name="DblRows:Orange";                       
Formats[i].firstRowColor="white";             Formats[i].secondRowColor="orange";
Formats[i].topRowTextStyle=BOLD;              Formats[i].topRowAlign="center";
Formats[i].topRowColor="";                    Formats[i].topRowTextColor="";
Formats[i].leftColTextStyle=ITALIC;           Formats[i].leftColAlign="left";
Formats[i].border="1";                        Formats[i].rowLimit="2";

// ****** When defining additional formats, don't go below this line! ******

  return Formats;
}

