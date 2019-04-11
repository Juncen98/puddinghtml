//SHARE-IN-MEMORY=true
//
// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.
//
//dateID.js
//
//Used by Date command file and property inspector to create and decipher
//a date format. The command uses createDateID and the inspector uses
//decipherDateID
//
//Both functions are placed in one common file so that if either one of them
//changes, it is easy to remember (and convenient) to change the other
//
//--------------------------------------------------------------
//   


//function: createDateID
//description: given three strings - the dayFormat, dateFormat, and timeFormat,
//creates an ID for them.
//The reason these aren't just all concatanated together is that the idea
//is to keep the ID is short as possible.

function createDateID(dayFormat,dateFormat,timeFormat){

   var dayIDs = new Array();
   dayIDs["NoDay"] = "";   
   dayIDs["FullDay"] = "f";   
   dayIDs["FullDayComma"] = "fc";   
   dayIDs["AbbrDay"] = "a"; 
   dayIDs["AbbrDayComma"] = "ac"; 
   dayIDs["LowAbbrDay"] = "la"; 
   dayIDs["LowAbbrDayComma"] = "lac"; 
   dayIDs["WestFullDayComma"] = "wfc"; 
   dayIDs["WestAbbrDayComma"] = "wac"; 
            
   var dayStr = dayIDs[dayFormat];
   var dateStr = dateFormat.substring(0,2) + dateFormat.charAt(dateFormat.length-1);
   var timeStr = (timeFormat == "NoTime")?"":(timeFormat=="AMPMTime")?"a":"m";

   return dayStr + dateStr +  timeStr;

}



//function: decipherDateID
//description: given a date array, returns an array with 3 items:
//the dayFormat, the dateFormat, and the timeFormat

function decipherDateID(dateID){
   var dayIDs = new Array();
   dayIDs[""] = "NoDay";         
   dayIDs["f"] = "FullDay";
   dayIDs["fc"] = "FullDayComma";      
   dayIDs["a"] = "AbbrDay";
   dayIDs["ac"] = "AbbrDayComma";
   dayIDs["la"] = "LowAbbrDay";
   dayIDs["lac"] = "LowAbbrDayComma";
   dayIDs["wfc"] = "WestFullDayComma";		
   dayIDs["wac"] = "WestAbbrDayComma";

   var dateIDs = new Array()
   dateIDs["Am1"] = "American1";
   dateIDs["Am2"] = "American2";
   dateIDs["Am3"] = "American3";
   dateIDs["IS1"] = "ISO8601";
   dateIDs["En1"] = "English1";
   dateIDs["En2"] = "English2";
   dateIDs["Fr1"] = "French1";
   dateIDs["Sp1"] = "Spanish1";
   dateIDs["Ja1"] = "Japanese1";
   dateIDs["Ja2"] = "Japanese2";
   dateIDs["Ja3"] = "Japanese3";
   dateIDs["Br1"] = "Brazilian1";
   dateIDs["Sw1"] = "Swedish1";
   dateIDs["It1"] = "Italian1";
   dateIDs["Ge1"] = "German1";
   dateIDs["Ko1"] = "Korean1";
   dateIDs["Ko2"] = "Korean2";
   dateIDs["Ko3"] = "Korean3";
   dateIDs["Ko4"] = "Korean4";
   dateIDs["Ko5"] = "Korean5";
   dateIDs["Ko6"] = "Korean6";
   dateIDs["Ko7"] = "Korean7";
   dateIDs["Ch1"] = "Chinese1";
   dateIDs["Ch2"] = "Chinese2";

   
   var upperCasePattern = /[A-Z]/
   var dateInd = dateID.search(upperCasePattern);
   
   var dayStr = "";
   var dateStr = "";
   var timeStr = ""; 
   
   //create dayStr
   if (dateInd != 0)
      dayStr = dayIDs[  dateID.substring(0,dateInd)  ];
   
   //create dateStr
   dateStr = dateIDs[  dateID.substring(dateInd,dateInd+3)  ];

   //create timeStr
   if (dateID.length ==  dateInd+4)
      timeStr = (dateID.charAt(dateInd+3)=="a") ?"AMPMTime":"MilitaryTime"; 
   
   return new Array(dayStr,dateStr,timeStr);

}


    
