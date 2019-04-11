#
# Table structure for table `comments`
#

CREATE TABLE comments (
  COMMENT_ID int(11) NOT NULL auto_increment,
  FIRST_NAME varchar(50) default NULL,
  LAST_NAME varchar(50) default NULL,
  TELEPHONE varchar(20) default NULL,
  EMAIL varchar(50) default NULL,
  SUBMIT_DATE datetime default NULL,
  COMMENTS longtext,
  ANSWERED tinyint(4) default NULL,
  PRIMARY KEY  (COMMENT_ID),
  KEY PRIMARY_KEY (COMMENT_ID)
) TYPE=MyISAM;

#
# Dumping data for table `comments`
#

INSERT INTO comments (COMMENT_ID, FIRST_NAME, LAST_NAME, TELEPHONE, EMAIL, SUBMIT_DATE, COMMENTS, ANSWERED) VALUES (1, 'Letitia', 'Riley', '210-651-0964', 'letitiariley@juno.com', '2005-02-13 00:00:00', 'Are there any plans to open a restaurant in Anchorage, Alaska?', 1);
INSERT INTO comments (COMMENT_ID, FIRST_NAME, LAST_NAME, TELEPHONE, EMAIL, SUBMIT_DATE, COMMENTS, ANSWERED) VALUES (2, 'Sachiko', 'Matsuda', '(0) 476 322 802', 'sachi@web.net', '2005-03-20 00:00:00', 'Unbelievably excellent service received at your New Tokyo restaurant.', 0);
INSERT INTO comments (COMMENT_ID, FIRST_NAME, LAST_NAME, TELEPHONE, EMAIL, SUBMIT_DATE, COMMENTS, ANSWERED) VALUES (3, 'Dieter', 'Dietrich', '', 'dd@worldly.com', '2005-03-24 00:00:00', 'Is your London restaurant open on Saturdays?', 0);
INSERT INTO comments (COMMENT_ID, FIRST_NAME, LAST_NAME, TELEPHONE, EMAIL, SUBMIT_DATE, COMMENTS, ANSWERED) VALUES (4, 'Ben', 'Morin', '', 'bmorin@seadec.com', '2005-06-24 00:00:00', 'I would like more seafood choices on the menu. Thanks.', 0);
# --------------------------------------------------------

#
# Table structure for table `locations`
#

CREATE TABLE locations (
  CODE char(4) NOT NULL default '',
  LOCATION_NAME char(100) default NULL,
  ADDRESS char(50) default NULL,
  CITY char(50) default NULL,
  STATE_COUNTRY char(50) default NULL,
  REGION_ID int(11) NOT NULL default '0',
  TELEPHONE char(20) default NULL,
  FAX char(20) default NULL,
  PRIMARY KEY  (CODE),
  KEY code (CODE),
  KEY REGION_ID (REGION_ID)
) TYPE=MyISAM;

#
# Dumping data for table `locations`
#

INSERT INTO locations (CODE, LOCATION_NAME, ADDRESS, CITY, STATE_COUNTRY, REGION_ID, TELEPHONE, FAX) VALUES ('BWI', 'Baltimore-Washington International', 'Airport Blvd', 'Baltimore', 'MD', 1, '410-121-1222', '410-121-1223');
INSERT INTO locations (CODE, LOCATION_NAME, ADDRESS, CITY, STATE_COUNTRY, REGION_ID, TELEPHONE, FAX) VALUES ('CAI', 'Cairo International Airport', 'Cairo International Airport', 'Cairo', 'Egypt', 4, '2022652432', '2022652433');
INSERT INTO locations (CODE, LOCATION_NAME, ADDRESS, CITY, STATE_COUNTRY, REGION_ID, TELEPHONE, FAX) VALUES ('CBR', 'Canberra', 'Canberra Airport', 'Canberra', 'Australia', 6, '02 62496211', '02 62496212');
INSERT INTO locations (CODE, LOCATION_NAME, ADDRESS, CITY, STATE_COUNTRY, REGION_ID, TELEPHONE, FAX) VALUES ('CNS', 'Cairns', 'Cairns Airport', 'Cairns', 'Queensland', 6, '07 40359300', '07 40359300');
INSERT INTO locations (CODE, LOCATION_NAME, ADDRESS, CITY, STATE_COUNTRY, REGION_ID, TELEPHONE, FAX) VALUES ('CPT', 'Cape Town Airport', 'Cape Town Airport', 'Cape Town', 'South Africa', 4, '0272 19 343914', '0272 19 343915');
INSERT INTO locations (CODE, LOCATION_NAME, ADDRESS, CITY, STATE_COUNTRY, REGION_ID, TELEPHONE, FAX) VALUES ('CWB', 'Afonso Pena', 'Av. N. Sra Da Aparecida 904', 'Curitiba', 'Brazil', 2, '55 412698 010', '55 412698 011');
INSERT INTO locations (CODE, LOCATION_NAME, ADDRESS, CITY, STATE_COUNTRY, REGION_ID, TELEPHONE, FAX) VALUES ('CZM', 'Aeropuerto Intl De Cozumel', 'Cozumel Airport', 'Cozumel', 'Mexico', 2, '5298723888', '5298723889');
INSERT INTO locations (CODE, LOCATION_NAME, ADDRESS, CITY, STATE_COUNTRY, REGION_ID, TELEPHONE, FAX) VALUES ('DEN', 'Denver International', '100 Pena Blvd', 'Denver', 'CO', 1, '303-667-6555', '303-667-6556');
INSERT INTO locations (CODE, LOCATION_NAME, ADDRESS, CITY, STATE_COUNTRY, REGION_ID, TELEPHONE, FAX) VALUES ('DFW', 'Dallas Ft Worth International', '3838 North Bound Service Road', 'Dallas/Ft Worth', 'TX', 1, '972-455-3333', '972-455-3334');
INSERT INTO locations (CODE, LOCATION_NAME, ADDRESS, CITY, STATE_COUNTRY, REGION_ID, TELEPHONE, FAX) VALUES ('EZE', 'Eze', 'Autopista Tte Ricchierei', 'Buenos Aires', 'Argentina', 2, '00-54-4480-0055', '00-54-4480-0056');
INSERT INTO locations (CODE, LOCATION_NAME, ADDRESS, CITY, STATE_COUNTRY, REGION_ID, TELEPHONE, FAX) VALUES ('FRA', 'Frankfurt Airport', 'General Aviation Terminal - Frankfurt Airport', 'Frankfurt', 'Germany', 3, '069 69593245', '069 69593246');
INSERT INTO locations (CODE, LOCATION_NAME, ADDRESS, CITY, STATE_COUNTRY, REGION_ID, TELEPHONE, FAX) VALUES ('KIX', 'Kansai International Airport', 'Senshu-kuko Kita', 'Osaka', 'Japan', 5, '(0)724 552 500', '(0)724 552 500');
INSERT INTO locations (CODE, LOCATION_NAME, ADDRESS, CITY, STATE_COUNTRY, REGION_ID, TELEPHONE, FAX) VALUES ('LHR', 'Heathrow Airport', 'Heathrow Airport', 'London', 'United Kingdom', 3, '020 88972075', '020 88972074');
INSERT INTO locations (CODE, LOCATION_NAME, ADDRESS, CITY, STATE_COUNTRY, REGION_ID, TELEPHONE, FAX) VALUES ('MCI', 'Kansas City International Airport', '902 Tel Aviv Ave', 'Kansas City', 'MO', 1, '816-243-5765', '816-243-5591');
INSERT INTO locations (CODE, LOCATION_NAME, ADDRESS, CITY, STATE_COUNTRY, REGION_ID, TELEPHONE, FAX) VALUES ('MSP', 'Minneapolis/St Paul Intl Airport', '4300 Glumack Drive', 'Minneapolis', 'MN', 1, '651-698-9585', '651-698-3062');
INSERT INTO locations (CODE, LOCATION_NAME, ADDRESS, CITY, STATE_COUNTRY, REGION_ID, TELEPHONE, FAX) VALUES ('MUC', 'Franz-Josef-Strauss Airport', 'Franz-Josef-Strauss Airport', 'Munich', 'Germany', 3, '089 978861', '089 978865');
INSERT INTO locations (CODE, LOCATION_NAME, ADDRESS, CITY, STATE_COUNTRY, REGION_ID, TELEPHONE, FAX) VALUES ('NRT', 'New Tokyo International Airport', 'Chiba 282-8601', 'Narita', 'Japan', 5, '(0)476 322 802', '(0)476 322 802');
INSERT INTO locations (CODE, LOCATION_NAME, ADDRESS, CITY, STATE_COUNTRY, REGION_ID, TELEPHONE, FAX) VALUES ('PMO', 'Punta Raisi', 'Punta Raisi Airport - Sicily', 'Palermo', 'Sicily', 3, '091 213 113', '091 213 113');
INSERT INTO locations (CODE, LOCATION_NAME, ADDRESS, CITY, STATE_COUNTRY, REGION_ID, TELEPHONE, FAX) VALUES ('PNA', 'Noain', 'Airport', 'Pamplona', 'Spain', 3, '948 311596', '948 311596');
INSERT INTO locations (CODE, LOCATION_NAME, ADDRESS, CITY, STATE_COUNTRY, REGION_ID, TELEPHONE, FAX) VALUES ('SIN', 'Singapore Changi Airport', 'Singapore Changi Airport', 'Singapore', 'Singapore', 5, '(65)542-5300', '(65)542-5301');
INSERT INTO locations (CODE, LOCATION_NAME, ADDRESS, CITY, STATE_COUNTRY, REGION_ID, TELEPHONE, FAX) VALUES ('TPS', 'Vincenzo-Florio Airport', 'Vincenzo-Florio Airport', 'Trapani', 'Italy', 3, '0923 842666', '0923 842667');
INSERT INTO locations (CODE, LOCATION_NAME, ADDRESS, CITY, STATE_COUNTRY, REGION_ID, TELEPHONE, FAX) VALUES ('YGK', 'Kingston Airport', '676 Princess St.', 'Kingston', 'Ontario', 1, '613-531-2145', '613-531-2146');
INSERT INTO locations (CODE, LOCATION_NAME, ADDRESS, CITY, STATE_COUNTRY, REGION_ID, TELEPHONE, FAX) VALUES ('YQG', 'Windsor International', 'Windsor Airport', 'Windsor', 'Ontario', 1, '519-250-3455', '519-250-3456');
# --------------------------------------------------------

#
# Table structure for table `region`
#

CREATE TABLE region (
  ID int(11) NOT NULL auto_increment,
  NAME char(50) default NULL,
  PRIMARY KEY  (ID)
) TYPE=MyISAM;

#
# Dumping data for table `region`
#

INSERT INTO region (ID, NAME) VALUES (1, 'North America');
INSERT INTO region (ID, NAME) VALUES (2, 'South/Central America');
INSERT INTO region (ID, NAME) VALUES (3, 'Europe');
INSERT INTO region (ID, NAME) VALUES (4, 'Africa');
INSERT INTO region (ID, NAME) VALUES (5, 'Asia');
INSERT INTO region (ID, NAME) VALUES (6, 'Australia');

    
