// SHARE-IN-MEMORY=true

// Copyright 2002, 2003 Macromedia, Inc. All rights reserved.


//--------------------------------------------------------------------
// CLASS:
//   DataSource
//
// DESCRIPTION:
//   Used as the return structure for the findDynamicSources()
//   function in a DataSource.
//
// PUBLIC PROPERTIES:
//
// PUBLIC FUNCTIONS:
//
//--------------------------------------------------------------------


//--------------------------------------------------------------------
// FUNCTION:
//   DataSource
//
// DESCRIPTION:
//   Constructor function
//
// ARGUMENTS:
//   title - string - the name that should be displayed in the Data
//     Bindings panel for this node
//   imageFile - string - the path to the image file which should be
//     displayed for this node
//   allowDelete - boolean - set to true if it is possible to delete
//     this node directly
//   dataSource - string - the simple file name of the data source
//     with which this node is associated
//   name - string - (optional) the name associated with this node.
//     This is mainly for use in storing recordset names
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function DataSource(title, imageFile, allowDelete, dataSource, name)
{  
  this.title = title;
  this.imageFile = imageFile;
  this.allowDelete = allowDelete;
  this.dataSource = dataSource;
  this.name = (name) ? name : "";
}




//--------------------------------------------------------------------
// CLASS:
//   DataSourceBinding
//
// DESCRIPTION:
//   Used as the return structure for generateDynamicSourceBindings() 
//   function in a DataSource.
//
// PUBLIC PROPERTIES:
//
// PUBLIC FUNCTIONS:
//
//--------------------------------------------------------------------


//--------------------------------------------------------------------
// FUNCTION:
//   DataSourceBinding
//
// DESCRIPTION:
//   Constructor function
//
// ARGUMENTS:
//   title - string - the name that should be displayed in the Data
//     Bindings panel for this node
//   imageFile - string - the path to the image file which should be
//     displayed for this node
//   allowDelete - boolean - set to true if it is possible to delete
//     this node directly
//   dataSource - string - the simple file name of the data source
//     with which this node is associated
//   name - string - (optional) the name associated with this node.
//     This is mainly for use in storing recordset names
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function DataSourceBinding(title, imageFile, allowDelete, dataSource, name)
{  
  this.title = title;
  this.imageFile = imageFile;
  this.allowDelete = allowDelete;
  this.dataSource = dataSource;
  this.name = (name) ? name : "";
}





//--------------------------------------------------------------------
// FUNCTION:
//   getDataSourceBindingList
//
// DESCRIPTION:
//   Given an array of data binding names, creates an array of 
//   DataSourceBinding nodes, suitable for returning from the
//   generateDynamicSourceBindings() function.
//
// ARGUMENTS:
//   theArray - array - the values to convert to nodes
//   imageFile - string - the file path of the image to display
//     with each node
//   allowDelete - boolean - set to true if it is possible to delete
//     this node directly
//   dataSource - string - the simple file name of the data source
//     html file which this node is associated with.
//   name - string - (optional) the name associated with this node.
//     This is mainly for use in storing recordset names
//
// RETURNS:
//   Array of DataSourceBinding objects
//--------------------------------------------------------------------

function getDataSourceBindingList(theArray, imageFile, allowDelete, dataSource, name)
{
  var retList = new Array();
  
  for (var i=0; i < theArray.length; i++)
  {    
    retList.push(new DataSourceBinding(theArray[i], imageFile, allowDelete, dataSource, name));    
  }
  
  return retList;
}
