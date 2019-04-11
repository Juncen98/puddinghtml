// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

// returns the webservices directory under configuration
function getWebServicesDirectory()
{
  var path = MMNotes.localURLToFilePath(dw.getConfigurationPath());
  if (DWfile.exists(path))
  {
    if(path.charAt(path.length - 1) =="/")
      path = path + "WebServices/ProxyGenerators/";
    else
      path = path + "/WebServices/ProxyGenerators/";
  }
  return path;
}