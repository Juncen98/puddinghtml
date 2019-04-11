/*
 * 505/W3C Accessibility Suite OEM V2 for Macromedia Dreamweaver
 * (C) Copyright 2001-2005 UsableNet Inc. All rights reserved.
 */
/* $Id: dwas_config.js,v 1.7 2005/03/18 08:55:46 malex Exp $ */

/* contains configuration settings for DWAS */
       
// WARNING: these paths must be in sync with src= attributes
// in HTML files.

// DWAS Version 

// Platform specific settings
var PLATFORM = navigator.platform;
var NEWLINE = (PLATFORM != "Win32") ? "\x0D" : "\x0D\x0A";

// PATHs
var DW_CONFIG_PATH = dw.getConfigurationPath();
var DWAS_SHARED_PATH = DW_CONFIG_PATH + "/Shared/UsableNet_508ASOEM";
var DWAS_COMMANDS_PATH = DW_CONFIG_PATH + "/Commands";
var DWAS_REPORTS_PATH = DW_CONFIG_PATH + "/Reports/HTML Reports";
var DWAS_RULES_PATH = DWAS_SHARED_PATH + "/rules";
var DWAS_DATA_PATH = DWAS_SHARED_PATH + "/data";
var DWAS_HTML_PATH = DWAS_SHARED_PATH + "/html";

// Local URLs
var DWAS_RULES_FILES =  [ "/508_rules.xml", "/wcagp2_rules.xml" ];
var DEFAULT_RULES_URL = DWAS_DATA_PATH + "/Settings2.xml";
var REPORTS_RESULTS_FILE = "/Results.xml";
var DWAS_SHARED_URL = MMNotes.filePathToLocalURL(DWAS_SHARED_PATH);

// dwas_config.js ends here
