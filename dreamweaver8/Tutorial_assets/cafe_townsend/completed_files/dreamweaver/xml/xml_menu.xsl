<!-- DWXMLSource="specials.xml" --><!DOCTYPE xsl:stylesheet  [
	<!ENTITY nbsp   "&#160;">
	<!ENTITY copy   "&#169;">
	<!ENTITY reg    "&#174;">
	<!ENTITY trade  "&#8482;">
	<!ENTITY mdash  "&#8212;">
	<!ENTITY ldquo  "&#8220;">
	<!ENTITY rdquo  "&#8221;"> 
	<!ENTITY pound  "&#163;">
	<!ENTITY yen    "&#165;">
	<!ENTITY euro   "&#8364;">
]>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
<xsl:output method="html" encoding="iso-8859-1" doctype-public="-//W3C//XHTML 1.0 Transitional//EN" doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"/>
<xsl:template match="/">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />
<title>Cafe Townsend</title>
<link href="xml_menu.css" rel="stylesheet" type="text/css" />
<style type="text/css">
<xsl:comment>
body {
	background-color: #000000;
}
</xsl:comment>
</style>
</head>
<body>
<table width="700" border="0" align="center" cellpadding="0" cellspacing="0">
  <tr>
    <td><img src="images/header.jpg" alt="" width="700" height="92" /><br />
      <br /></td>
  </tr>
</table>
<table width="700" border="0" align="center" cellpadding="0" cellspacing="0">
  <tr>
    <td><img src="images/body_main_header.gif" alt="" width="700" height="25" /></td>
  </tr>
</table>
<table width="700" border="0" align="center" cellpadding="0" cellspacing="0">
  <tr>
    <td width="140" valign="top" bgcolor="#993300">
		<a href="#" class="navigation">Cuisine</a> 
		<a href="#" class="navigation">Chef Ipsum</a> 
		<a href="#" class="navigation">Articles</a> 
		<a href="#" class="navigation">Special Events</a> 
		<a href="#" class="navigation">Location</a> 
		<a href="#" class="navigation">Reservations</a> 
		<a href="#" class="navigation">Contact Us</a>	</td>
    <td valign="top" bgcolor="#F7EEDF"><p class="menu_header">Specials of the Day</p>
      <table width="450" border="0" align="center" cellpadding="0" cellspacing="0">
        <xsl:for-each select="specials/menu_item">
          <tr>
              <td width="425" class="menu"><em><a href="{link}"><xsl:value-of select="item"/></a></em> - <xsl:value-of select="description"/></td>
              <td width="25" class="menu"><xsl:value-of select="price"/></td>
          </tr>
        </xsl:for-each>
        
      </table>
	  <p>&nbsp;</p>	</td>
  </tr>
</table>
<table width="700" border="0" align="center" cellpadding="0" cellspacing="0">
  <tr>
    <td><img src="images/body_main_footer.gif" alt="" width="700" height="25" /></td>
  </tr>
</table>
</body>
</html>
</xsl:template>
</xsl:stylesheet>
