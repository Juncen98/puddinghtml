<?xml version="1.0"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
<xsl:output method="xml" cdata-section-elements="template path name value jumptoline icon timestamp"/>

<!-- ******************************** -->
<!-- beginning of Localizable Strings -->
<!-- ******************************** -->
<xsl:variable name="general_name" select="'General'"/>
<xsl:variable name="timestamp_name" select="'Timestamp'"/>
<xsl:variable name="product_name" select="'Product'"/>
<xsl:variable name="product_version_name" select="'Product Version'"/>
<xsl:variable name="locale_name" select="'Locale'"/>
<xsl:variable name="user_agent_name" select="'User-Agent'"/>
<xsl:variable name="remote_ip_name" select="'Remote IP'"/>
<xsl:variable name="host_name_name" select="'Host Name'"/>
<xsl:variable name="server_file_name" select="'Server File'"/>
<xsl:variable name="template_name" select="'Template'"/>
<xsl:variable name="exceptions_name" select="'Exceptions'"/>
<xsl:variable name="exception_type_name" select="'Type'"/>
<xsl:variable name="exception_detail_name" select="'Detail'"/>
<xsl:variable name="exception_error_code_name" select="'Error Code'"/>
<xsl:variable name="exception_extended_info_name" select="'Extended Information'"/>
<xsl:variable name="template_stack_name" select="'Template Stack'"/>
<xsl:variable name="total_execution_time_name" select="'Total Execution Time'"/>
<xsl:variable name="database_name" select="'Database'"/>
<xsl:variable name="sql_queries_name" select="'SQL Queries'"/>
<xsl:variable name="sql_dsn_name" select="'DSN'"/>
<xsl:variable name="sql_record_count_name" select="'Record Count'"/>
<xsl:variable name="sql_columns_name" select="'Columns'"/>
<xsl:variable name="sql_statement_name" select="'Statement'"/>
<xsl:variable name="object_queries_name" select="'Object Queries'"/>
<xsl:variable name="object_query_statement_name" select="'Statement'"/>
<xsl:variable name="object_query_ids_name" select="'Object IDs'"/>
<xsl:variable name="stored_procs_name" select="'Stored Procedures'"/>
<xsl:variable name="dbserver_name" select="'Database Server'"/>
<xsl:variable name="params_name" select="'Parameters'"/>
<xsl:variable name="sql_type_name" select="'SQL Type'"/>
<xsl:variable name="return_value_name" select="'Return Value'"/>
<xsl:variable name="input_value_name" select="'Input Value'"/>
<xsl:variable name="result_set_number_name" select="'Result Set Number'"/>
<xsl:variable name="max_row_name" select="'Maximum Rows'"/>
<xsl:variable name="null_name" select="'Null'"/>
<xsl:variable name="results_name" select="'Results'"/>
<xsl:variable name="variables_name" select="'Variables'"/>
<xsl:variable name="variables_form_name" select="'Form'"/>
<xsl:variable name="variables_request_name" select="'Request'"/>
<xsl:variable name="variables_server_name" select="'Server'"/>
<xsl:variable name="variables_application_name" select="'Application'"/>
<xsl:variable name="variables_url_name" select="'URL'"/>
<xsl:variable name="variables_cgi_name" select="'CGI'"/>
<xsl:variable name="variables_client_name" select="'Client'"/>
<xsl:variable name="variables_cookie_name" select="'Cookie'"/>
<xsl:variable name="variables_session_name" select="'Session'"/>
<xsl:variable name="trace_path_name" select="'Trace Path'"/>
<xsl:variable name="tracepoint_logged_name" select="'Logged'"/>
<!-- ******************************** -->
<!-- end of Localizable Strings       -->
<!-- ******************************** -->

<!-- ******************************** -->
<!-- beginning of icon names          -->
<!-- ******************************** -->
<xsl:variable name="general_icon" select="'General.gif'"/>
<xsl:variable name="timestamp_icon" select="'Timestamp.gif'"/>
<xsl:variable name="product_icon" select="'Product.gif'"/>
<xsl:variable name="product_version_icon" select="'ProductVersion.gif'"/>
<xsl:variable name="locale_icon" select="'Locale.gif'"/>
<xsl:variable name="user_agent_icon" select="'UserAgent.gif'"/>
<xsl:variable name="remote_ip_icon" select="'RemoteIP.gif'"/>
<xsl:variable name="host_name_icon" select="'HostName.gif'"/>
<xsl:variable name="server_file_icon" select="'ServerFile.gif'"/>
<xsl:variable name="exceptions_icon" select="'Exception.gif'"/>
<xsl:variable name="exception_icon" select="'Exception.gif'"/>
<xsl:variable name="exception_type_icon" select="'Exception.gif'"/>
<xsl:variable name="exception_detail_icon" select="'Exception.gif'"/>
<xsl:variable name="exception_error_code_icon" select="'Exception.gif'"/>
<xsl:variable name="exception_extended_info_icon" select="'Exception.gif'"/>
<xsl:variable name="template_stack_icon" select="'TemplateStack.gif'"/>
<xsl:variable name="template_icon" select="'Template.gif'"/>
<xsl:variable name="total_execution_time_icon" select="'TotalExecutionTime.gif'"/>
<xsl:variable name="database_icon" select="'Database.gif'"/>
<xsl:variable name="sql_queries_icon" select="'DatabaseSub.gif'"/>
<xsl:variable name="sql_query_icon" select="'DatabaseSub2.gif'"/>
<xsl:variable name="sql_dsn_icon" select="'DatabaseSub2.gif'"/>
<xsl:variable name="sql_record_count_icon" select="'DatabaseSub2.gif'"/>
<xsl:variable name="sql_columns_icon" select="'DatabaseSub2.gif'"/>
<xsl:variable name="sql_column_icon" select="'DatabaseSub2.gif'"/>
<xsl:variable name="sql_execution_time_icon" select="'DatabaseSub2.gif'"/>
<xsl:variable name="sql_statement_icon" select="'DatabaseSub2.gif'"/>
<xsl:variable name="object_queries_icon" select="'DatabaseSub.gif'"/>
<xsl:variable name="object_query_icon" select="'DatabaseSub2.gif'"/>
<xsl:variable name="object_query_statement_icon" select="'DatabaseSub2.gif'"/>
<xsl:variable name="object_query_ids_icon" select="'DatabaseSub2.gif'"/>
<xsl:variable name="object_query_id_icon" select="'DatabaseSub2.gif'"/>
<xsl:variable name="stored_procs_icon" select="'DatabaseSub.gif'"/>
<xsl:variable name="stored_proc_icon" select="'DatabaseSub2.gif'"/>
<xsl:variable name="dbserver_icon" select="'DatabaseSub2.gif'"/>
<xsl:variable name="params_icon" select="'DatabaseSub2.gif'"/>
<xsl:variable name="param_icon" select="'DatabaseSub2.gif'"/>
<xsl:variable name="return_value_icon" select="'DatabaseSub2.gif'"/>
<xsl:variable name="sql_type_icon" select="'DatabaseSub2.gif'"/>
<xsl:variable name="input_value_icon" select="'DatabaseSub2.gif'"/>
<xsl:variable name="result_set_number_icon" select="'DatabaseSub2.gif'"/>
<xsl:variable name="max_row_icon" select="'DatabaseSub2.gif'"/>
<xsl:variable name="null_icon" select="'DatabaseSub2.gif'"/>
<xsl:variable name="results_icon" select="'DatabaseSub2.gif'"/>
<xsl:variable name="result_icon" select="'DatabaseSub2.gif'"/>
<xsl:variable name="variables_icon" select="'Variables.gif'"/>
<xsl:variable name="variables_form_icon" select="'VariableParent.gif'"/>
<xsl:variable name="variables_request_icon" select="'VariableParent.gif'"/>
<xsl:variable name="variables_server_icon" select="'VariableParent.gif'"/>
<xsl:variable name="variables_application_icon" select="'VariableParent.gif'"/>
<xsl:variable name="variables_url_icon" select="'VariableParent.gif'"/>
<xsl:variable name="variables_cgi_icon" select="'VariableParent.gif'"/>
<xsl:variable name="variables_client_icon" select="'VariableParent.gif'"/>
<xsl:variable name="variables_cookie_icon" select="'VariableParent.gif'"/>
<xsl:variable name="variables_session_icon" select="'VariableParent.gif'"/>
<xsl:variable name="variable_icon" select="'Variable.gif'"/>
<xsl:variable name="trace_path_icon" select="'TracePath.gif'"/>
<xsl:variable name="trace_point_icon" select="'TracePoint.gif'"/>
<xsl:variable name="trace_point_variable_icon" select="'Variable.gif'"/>
<!-- ******************************** -->
<!-- end of icon names                -->
<!-- ******************************** -->

<!-- ******************************** -->
<!-- beginning of input parameters    -->
<!-- ******************************** -->
<xsl:param name="config_folder" select="''"/>
<xsl:param name="temp_file_name" select="''"/>
<xsl:param name="real_file_name" select="''"/>
<!-- ******************************** -->
<!-- end of input parameters          -->
<!-- ******************************** -->

<xsl:template match="/">
		<xsl:apply-templates select="debug_root"/>
</xsl:template>

<!-- root -->
<xsl:template match="debug_root">
	<serverdebuginfo>
		<context>
			<template>
				<xsl:call-template name="subst_name">
					<xsl:with-param name="this" select="general/uri"/>
				</xsl:call-template>
<!--			<xsl:value-of select="general/uri"/> -->
			</template>
			<path>
				<xsl:call-template name="subst_name">
					<xsl:with-param name="this" select="general/file"/>
				</xsl:call-template>
<!--			<xsl:value-of select="general/file"/> -->
			</path>
			<timestamp>
				<xsl:value-of select="general/timestamp"/>
			</timestamp>
		</context>
		<!-- these could be combined using an | operator, -->
		<!-- but keeping them separate allows us to       -->
		<!-- enforce a particular order in the display    -->
		<xsl:apply-templates select="general"/>
		<xsl:apply-templates select="exceptions"/>
		<xsl:apply-templates select="template_stack"/>
		<xsl:apply-templates select="database"/>
		<xsl:apply-templates select="cfoql_queries"/>
		<xsl:apply-templates select="variables"/>
		<xsl:apply-templates select="trace_path"/>
	</serverdebuginfo>
</xsl:template>

<!-- general -->
<xsl:template match="general">
	<debugnode>
		<name>
			<xsl:value-of select="$general_name"/>
		</name>
		<!-- icon -->
		<xsl:call-template name="icon">
			<xsl:with-param name="icon_variable" select="$general_icon"/>
		</xsl:call-template>
		<xsl:apply-templates select="timestamp"/>
		<xsl:apply-templates select="product"/>
		<xsl:apply-templates select="product_version"/>
		<xsl:apply-templates select="locale"/>
		<xsl:apply-templates select="user_agent"/>
		<xsl:apply-templates select="host_name"/>
		<xsl:apply-templates select="remote_ip"/>
		<xsl:apply-templates select="file"/>
		<xsl:apply-templates select="uri"/>
		<xsl:apply-templates select="total_execution_time"/>
	</debugnode>
</xsl:template>

<xsl:template match="general/timestamp">
	<debugnode>
		<name>
			<xsl:value-of select="$timestamp_name"/>
		</name>
		<!-- icon -->
		<xsl:call-template name="icon">
			<xsl:with-param name="icon_variable" select="$timestamp_icon"/>
		</xsl:call-template>
		<value>
			<xsl:value-of select="."/>
		</value>
	</debugnode>
</xsl:template>

<xsl:template match="general/product">
	<debugnode>
		<name>
			<xsl:value-of select="$product_name"/>
		</name>
		<!-- icon -->
		<xsl:call-template name="icon">
			<xsl:with-param name="icon_variable" select="$product_icon"/>
		</xsl:call-template>
		<value>
			<xsl:value-of select="."/>
		</value>
	</debugnode>
</xsl:template>

<xsl:template match="general/product_version">
	<debugnode>
		<name>
			<xsl:value-of select="$product_version_name"/>
		</name>
		<!-- icon -->
		<xsl:call-template name="icon">
			<xsl:with-param name="icon_variable" select="$product_version_icon"/>
		</xsl:call-template>
		<value>
			<xsl:value-of select="."/>
		</value>
	</debugnode>
</xsl:template>

<xsl:template match="general/locale">
	<debugnode>
		<name>
			<xsl:value-of select="$locale_name"/>
		</name>
		<!-- icon -->
		<xsl:call-template name="icon">
			<xsl:with-param name="icon_variable" select="$locale_icon"/>
		</xsl:call-template>
		<value>
			<xsl:value-of select="."/>
		</value>
	</debugnode>
</xsl:template>

<xsl:template match="general/user_agent">
	<debugnode>
		<name>
			<xsl:value-of select="$user_agent_name"/>
		</name>
		<!-- icon -->
		<xsl:call-template name="icon">
			<xsl:with-param name="icon_variable" select="$user_agent_icon"/>
		</xsl:call-template>
		<value>
			<xsl:value-of select="."/>
		</value>
	</debugnode>
</xsl:template>

<xsl:template match="general/remote_ip">
	<debugnode>
		<name>
			<xsl:value-of select="$remote_ip_name"/>
		</name>
		<!-- icon -->
		<xsl:call-template name="icon">
			<xsl:with-param name="icon_variable" select="$remote_ip_icon"/>
		</xsl:call-template>
		<value>
			<xsl:value-of select="."/>
		</value>
	</debugnode>
</xsl:template>

<xsl:template match="general/host_name">
	<debugnode>
		<name>
			<xsl:value-of select="$host_name_name"/>
		</name>
		<!-- icon -->
		<xsl:call-template name="icon">
			<xsl:with-param name="icon_variable" select="$host_name_icon"/>
		</xsl:call-template>
		<value>
			<xsl:value-of select="."/>
		</value>
	</debugnode>
</xsl:template>

<xsl:template match="general/file">
	<debugnode>
		<name>
			<xsl:value-of select="$server_file_name"/>
		</name>
		<!-- icon -->
		<xsl:call-template name="icon">
			<xsl:with-param name="icon_variable" select="$server_file_icon"/>
		</xsl:call-template>
		<value>
			<xsl:call-template name="subst_name">
				<xsl:with-param name="this" select="."/>
			</xsl:call-template>
<!--			<xsl:value-of select="."/> -->
		</value>
	</debugnode>
</xsl:template>

<xsl:template match="general/uri">
	<debugnode>
		<name>
			<xsl:value-of select="$template_name"/>
		</name>
		<!-- icon -->
		<xsl:call-template name="icon">
			<xsl:with-param name="icon_variable" select="$template_icon"/>
		</xsl:call-template>
		<value>
			<xsl:call-template name="subst_name">
				<xsl:with-param name="this" select="."/>
			</xsl:call-template>
<!--		<xsl:value-of select="."/> -->
		</value>
	</debugnode>
</xsl:template>

<xsl:template match="general/total_execution_time">
	<debugnode>
		<name>
			<xsl:value-of select="$total_execution_time_name"/>
		</name>
		<!-- icon -->
		<xsl:call-template name="icon">
			<xsl:with-param name="icon_variable" select="$total_execution_time_icon"/>
		</xsl:call-template>
		<value>
			<xsl:value-of select="."/>
		</value>
	</debugnode>
</xsl:template>

<!-- exceptions -->
<xsl:template match="exceptions">
	<debugnode>
		<!-- exceptions name -->
		<name>
			<xsl:value-of select="$exceptions_name"/>
		</name>
		<!-- icon -->
		<xsl:call-template name="icon">
			<xsl:with-param name="icon_variable" select="$exceptions_icon"/>
		</xsl:call-template>
		<xsl:apply-templates select="exception"/>
	</debugnode>
</xsl:template>

<!-- exception -->
<xsl:template match="exception">
	<debugnode>
		<xsl:apply-templates select="message"/>
		<!-- icon -->
		<xsl:call-template name="icon">
			<xsl:with-param name="icon_variable" select="$exception_icon"/>
		</xsl:call-template>
		<xsl:apply-templates select="jump_to_line"/>
		<xsl:apply-templates select="type"/>
		<xsl:apply-templates select="detail"/>
		<xsl:apply-templates select="error_code"/>
		<xsl:apply-templates select="extended_info"/>
	</debugnode>
</xsl:template>

<!-- exception summary -->
<xsl:template match="exception/message">
	<xsl:if test=". != ''">
		<name>
			<xsl:value-of select="."/>
		</name>
	</xsl:if>
</xsl:template>

<!-- exception type -->
<xsl:template match="exception/type">
	<xsl:if test=". != ''">
		<debugnode>
			<name>
				<xsl:value-of select="$exception_type_name"/>
			</name>
			<xsl:call-template name="icon">
				<xsl:with-param name="icon_variable" select="$exception_type_icon"/>
			</xsl:call-template>
			<value>
				<xsl:value-of select="."/>
			</value>
		</debugnode>
	</xsl:if>
</xsl:template>

<!-- exception detail -->
<xsl:template match="exception/detail">
	<xsl:if test=". != ''">
		<debugnode>
			<name>
				<xsl:value-of select="$exception_detail_name"/>
			</name>
			<xsl:call-template name="icon">
				<xsl:with-param name="icon_variable" select="$exception_detail_icon"/>
			</xsl:call-template>
			<value>
				<xsl:value-of select="."/>
			</value>
		</debugnode>
	</xsl:if>
</xsl:template>

<!-- exception error code -->
<xsl:template match="exception/error_code">
	<xsl:if test=". != ''">
		<debugnode>
			<name>
				<xsl:value-of select="$exception_error_code_name"/>
			</name>
			<xsl:call-template name="icon">
				<xsl:with-param name="icon_variable" select="$exception_error_code_icon"/>
			</xsl:call-template>
			<value>
				<xsl:value-of select="."/>
			</value>
		</debugnode>
	</xsl:if>
</xsl:template>

<!-- exception extended info -->
<xsl:template match="exception/extended_info">
	<xsl:if test=". != ''">
		<debugnode>
			<name>
				<xsl:value-of select="$exception_extended_info_name"/>
			</name>
			<xsl:call-template name="icon">
				<xsl:with-param name="icon_variable" select="$exception_extended_info_icon"/>
			</xsl:call-template>
			<value>
				<xsl:value-of select="."/>
			</value>
		</debugnode>
	</xsl:if>
</xsl:template>

<!-- template stack -->
<xsl:template match="template_stack">
	<debugnode>
		<name>
			<xsl:value-of select="$template_stack_name"/>
		</name>
		<xsl:call-template name="icon">
			<xsl:with-param name="icon_variable" select="$template_stack_icon"/>
		</xsl:call-template>
		<xsl:apply-templates select="template"/>
		<xsl:apply-templates select="../general/total_execution_time"/>
	</debugnode>
</xsl:template>

<!-- template -->
<xsl:template match="template">
	<debugnode>
		<name>
			<xsl:value-of select="execution_time"/>
		</name>
		<xsl:call-template name="icon">
			<xsl:with-param name="icon_variable" select="$template_icon"/>
		</xsl:call-template>
		<value>
			<xsl:call-template name="subst_name">
<!--				<xsl:with-param name="this" select="jump_to_line/uri"/> -->
				<xsl:with-param name="this" select="jump_to_line/file"/>
			</xsl:call-template>
<!--		<xsl:value-of select="jump_to_line/uri"/> -->
		</value>
		<xsl:apply-templates select="jump_to_line"/>
		<xsl:apply-templates select="template"/>
	</debugnode>
</xsl:template>

<!-- total execution_time -->
<xsl:template match="general/total_execution_time">
	<debugnode>
		<name>
			<xsl:value-of select="."/>
		</name>
		<xsl:call-template name="icon">
			<xsl:with-param name="icon_variable" select="$total_execution_time_icon"/>
		</xsl:call-template>
		<value>
			<xsl:value-of select="$total_execution_time_name"/>
		</value>
	</debugnode>
</xsl:template>

<!-- database -->
<xsl:template match="database">
	<debugnode>
		<name>
			<xsl:value-of select="$database_name"/>
		</name>
		<xsl:call-template name="icon">
			<xsl:with-param name="icon_variable" select="$database_icon"/>
		</xsl:call-template>
		<xsl:apply-templates select="sql_queries"/>
		<xsl:apply-templates select="object_queries"/>
		<xsl:apply-templates select="stored_procs"/>
	</debugnode>
</xsl:template>

<!-- sql queries -->
<xsl:template match="sql_queries">
	<debugnode>
		<name>
			<xsl:value-of select="$sql_queries_name"/>
		</name>
		<xsl:call-template name="icon">
			<xsl:with-param name="icon_variable" select="$sql_queries_icon"/>
		</xsl:call-template>
		<xsl:apply-templates select="sql_query"/>
	</debugnode>
</xsl:template>

<!-- sql query -->
<xsl:template match="sql_query">
	<debugnode>
		<name>
			<xsl:value-of select="execution_time"/>
		</name>
		<xsl:call-template name="icon">
			<xsl:with-param name="icon_variable" select="$sql_query_icon"/>
		</xsl:call-template>
		<value>
			<xsl:value-of select="name"/>
		</value>
		<xsl:apply-templates select="jump_to_line"/>
		<xsl:apply-templates select="dsn"/>
		<xsl:apply-templates select="record_count"/>
		<xsl:apply-templates select="column_list"/>
		<xsl:apply-templates select="statement"/>
	</debugnode>
</xsl:template>

<!-- sql dsn -->
<xsl:template match="dsn">
	<xsl:if test=". != ''">
		<debugnode>
			<name>
				<xsl:value-of select="$sql_dsn_name"/>
			</name>
			<xsl:call-template name="icon">
				<xsl:with-param name="icon_variable" select="$sql_dsn_icon"/>
			</xsl:call-template>
			<value>
				<xsl:value-of select="."/>
			</value>
		</debugnode>
	</xsl:if>
</xsl:template>

<!-- sql query record count -->
<xsl:template match="record_count">
	<xsl:if test=". != ''">
		<debugnode>
			<name>
				<xsl:value-of select="$sql_record_count_name"/>
			</name>
			<xsl:call-template name="icon">
				<xsl:with-param name="icon_variable" select="$sql_record_count_icon"/>
			</xsl:call-template>
			<value>
				<xsl:value-of select="."/>
			</value>
		</debugnode>
	</xsl:if>
</xsl:template>

<!-- sql query columns -->
<xsl:template match="column_list">
	<debugnode>
		<name>
			<xsl:value-of select="$sql_columns_name"/>
		</name>
		<xsl:call-template name="icon">
			<xsl:with-param name="icon_variable" select="$sql_columns_icon"/>
		</xsl:call-template>
		<xsl:apply-templates select="column"/>
	</debugnode>
</xsl:template>

<!-- sql query column -->
<xsl:template match="column_list/column">
	<debugnode>
		<name/>
		<xsl:call-template name="icon">
			<xsl:with-param name="icon_variable" select="$sql_column_icon"/>
		</xsl:call-template>
		<value>
			<xsl:value-of select="."/>
		</value>
	</debugnode>
</xsl:template>

<!-- sql query statement -->
<xsl:template match="sql_query/statement">
	<debugnode>
		<name>
			<xsl:value-of select="$sql_statement_name"/>
		</name>
		<xsl:call-template name="icon">
			<xsl:with-param name="icon_variable" select="$sql_statement_icon"/>
		</xsl:call-template>
		<value>
			<xsl:value-of select="."/>
		</value>
	</debugnode>
</xsl:template>

<!-- object queries -->
<xsl:template match="object_queries">
	<debugnode>
		<name>
			<xsl:value-of select="$object_queries_name"/>
		</name>
		<xsl:call-template name="icon">
			<xsl:with-param name="icon_variable" select="$object_queries_icon"/>
		</xsl:call-template>
		<xsl:apply-templates select="object_query"/>
	</debugnode>
</xsl:template>

<!-- object query -->
<xsl:template match="object_query">
	<debugnode>
		<name>
			<xsl:value-of select="execution_time"/>
		</name>
		<xsl:call-template name="icon">
			<xsl:with-param name="icon_variable" select="$object_query_icon"/>
		</xsl:call-template>
		<xsl:apply-templates select="jump_to_line"/>
		<value>
			<xsl:value-of select="type"/>
		</value>
		<xsl:apply-templates select="statement"/>
		<xsl:apply-templates select="ids"/>
	</debugnode>
</xsl:template>

<!-- cfoql query statement -->
<xsl:template match="object_query/statement">
	<debugnode>
		<name>
			<xsl:value-of select="$object_query_statement_name"/>
		</name>
		<xsl:call-template name="icon">
			<xsl:with-param name="icon_variable" select="$object_query_statement_icon"/>
		</xsl:call-template>
		<value>
			<xsl:value-of select="."/>
		</value>
	</debugnode>
</xsl:template>

<!-- cfoql query IDs -->
<xsl:template match="object_query/ids">
	<debugnode>
		<name>
			<xsl:value-of select="$object_query_ids_name"/>
		</name>
		<xsl:call-template name="icon">
			<xsl:with-param name="icon_variable" select="$object_query_ids_icon"/>
		</xsl:call-template>
		<xsl:apply-templates select="id"/>
	</debugnode>
</xsl:template>

<!-- object query id -->
<xsl:template match="object_query/ids/id">
	<debugnode>
		<name>
			<xsl:value-of select="."/>
		</name>
		<xsl:call-template name="icon">
			<xsl:with-param name="icon_variable" select="$object_query_id_icon"/>
		</xsl:call-template>
	</debugnode>
</xsl:template>

<!-- stored procs -->
<xsl:template match="stored_procs">
	<debugnode>
		<name>
			<xsl:value-of select="$stored_procs_name"/>
		</name>
		<xsl:call-template name="icon">
			<xsl:with-param name="icon_variable" select="$stored_procs_icon"/>
		</xsl:call-template>
		<xsl:apply-templates select="proc"/>
	</debugnode>
</xsl:template>

<!-- stored proc -->
<xsl:template match="stored_procs/proc">
	<debugnode>
		<name>
			<xsl:value-of select="execution_time"/>
		</name>
		<xsl:call-template name="icon">
			<xsl:with-param name="icon_variable" select="$stored_proc_icon"/>
		</xsl:call-template>
		<value>
			<xsl:value-of select="name"/>
		</value>
		<xsl:apply-templates select="jump_to_line"/>
		<xsl:apply-templates select="dsn"/>
		<xsl:apply-templates select="dbserver"/>
		<xsl:apply-templates select="proc_params"/>
		<xsl:apply-templates select="proc_results"/>
	</debugnode>
</xsl:template>

<xsl:template match="proc/dbserver">
	<debugnode>
		<name>
			<xsl:value-of select="$dbserver_name"/>
		</name>
		<xsl:call-template name="icon">
			<xsl:with-param name="icon_variable" select="$dbserver_icon"/>
		</xsl:call-template>
		<value>
			<xsl:value-of select="."/>
		</value>
	</debugnode>
</xsl:template>

<xsl:template match="proc_params">
	<debugnode>
		<name>
			<xsl:value-of select="$params_name"/>
		</name>
		<xsl:call-template name="icon">
			<xsl:with-param name="icon_variable" select="$params_icon"/>
		</xsl:call-template>
		<xsl:apply-templates select="param"/>
	</debugnode>
</xsl:template>

<xsl:template match="proc_params/param">
	<debugnode>
		<name>
			<xsl:value-of select="db_var_name"/>
		</name>
		<xsl:call-template name="icon">
			<xsl:with-param name="icon_variable" select="$param_icon"/>
		</xsl:call-template>
		<value>
			<xsl:value-of select="type"/>
		</value>
		<xsl:apply-templates select="sql_type"/>
		<xsl:apply-templates select="return_variable"/>
		<xsl:apply-templates select="value"/>
		<xsl:apply-templates select="result_set"/>
		<xsl:apply-templates select="max_row"/>
		<xsl:apply-templates select="null"/>
	</debugnode>
</xsl:template>

<xsl:template match="proc_params/param/sql_type">
	<debugnode>
		<name>
			<xsl:value-of select="$sql_type_name"/>
		</name>
		<xsl:call-template name="icon">
			<xsl:with-param name="icon_variable" select="$sql_type_icon"/>
		</xsl:call-template>
		<value>
			<xsl:value-of select="."/>
		</value>
	</debugnode>
</xsl:template>

<xsl:template match="proc_params/param/return_variable">
	<debugnode>
		<name>
			<xsl:value-of select="$return_value_name"/>
		</name>
		<xsl:call-template name="icon">
			<xsl:with-param name="icon_variable" select="$return_value_icon"/>
		</xsl:call-template>
		<value>
			<xsl:value-of select="."/>
		</value>
	</debugnode>
</xsl:template>

<xsl:template match="proc_params/param/value">
	<debugnode>
		<name>
			<xsl:value-of select="$input_value_name"/>
		</name>
		<xsl:call-template name="icon">
			<xsl:with-param name="icon_variable" select="$input_value_icon"/>
		</xsl:call-template>
		<value>
			<xsl:value-of select="."/>
		</value>
	</debugnode>
</xsl:template>

<xsl:template match="proc_params/param/result_set">
	<debugnode>
		<name>
			<xsl:value-of select="$result_set_number_name"/>
		</name>
		<xsl:call-template name="icon">
			<xsl:with-param name="icon_variable" select="$result_set_number_icon"/>
		</xsl:call-template>
		<value>
			<xsl:value-of select="."/>
		</value>
	</debugnode>
</xsl:template>

<xsl:template match="max_row">
	<debugnode>
		<name>
			<xsl:value-of select="$max_row_name"/>
		</name>
		<xsl:call-template name="icon">
			<xsl:with-param name="icon_variable" select="$max_row_icon"/>
		</xsl:call-template>
		<value>
			<xsl:value-of select="."/>
		</value>
	</debugnode>
</xsl:template>

<xsl:template match="proc_params/param/null">
	<debugnode>
		<name>
			<xsl:value-of select="$null_name"/>
		</name>
		<xsl:call-template name="icon">
			<xsl:with-param name="icon_variable" select="$null_icon"/>
		</xsl:call-template>
		<value>
			<xsl:value-of select="."/>
		</value>
	</debugnode>
</xsl:template>

<xsl:template match="proc_results">
	<debugnode>
		<name>
			<xsl:value-of select="$results_name"/>
		</name>
		<xsl:call-template name="icon">
			<xsl:with-param name="icon_variable" select="$results_icon"/>
		</xsl:call-template>
		<xsl:apply-templates select="result"/>
	</debugnode>
</xsl:template>

<xsl:template match="proc_results/result">
	<debugnode>
		<name>
			<xsl:value-of select="name"/>
		</name>
		<xsl:call-template name="icon">
			<xsl:with-param name="icon_variable" select="$result_icon"/>
		</xsl:call-template>
		<xsl:apply-templates select="result_set"/>
		<xsl:apply-templates select="max_row"/>
	</debugnode>
</xsl:template>

<xsl:template match="proc_results/result/result_set">
	<debugnode>
		<name>
			<xsl:value-of select="$result_set_number_name"/>
		</name>
		<xsl:call-template name="icon">
			<xsl:with-param name="icon_variable" select="$result_set_number_icon"/>
		</xsl:call-template>
		<value>
			<xsl:value-of select="."/>
		</value>
	</debugnode>
</xsl:template>

<!-- variables -->
<xsl:template match="variables">
	<debugnode>
		<name>
			<xsl:value-of select="$variables_name"/>
		</name>
		<xsl:call-template name="icon">
			<xsl:with-param name="icon_variable" select="$variables_icon"/>
		</xsl:call-template>
		<xsl:apply-templates select="application"/>
		<xsl:apply-templates select="cgi"/>
		<xsl:apply-templates select="client"/>
		<xsl:apply-templates select="cookie"/>
		<xsl:apply-templates select="form"/>
		<xsl:apply-templates select="request"/>
		<xsl:apply-templates select="server"/>
		<xsl:apply-templates select="session"/>
		<xsl:apply-templates select="url"/>
	</debugnode>
</xsl:template>

<!-- application variables -->
<xsl:template match="variables/application">
	<debugnode>
		<name>
			<xsl:value-of select="$variables_application_name"/>
		</name>
		<xsl:call-template name="icon">
			<xsl:with-param name="icon_variable" select="$variables_application_icon"/>
		</xsl:call-template>
		<xsl:apply-templates select="variable"/>
	</debugnode>
</xsl:template>

<!-- cgi variables -->
<xsl:template match="variables/cgi">
	<debugnode>
		<name>
			<xsl:value-of select="$variables_cgi_name"/>
		</name>
		<xsl:call-template name="icon">
			<xsl:with-param name="icon_variable" select="$variables_cgi_icon"/>
		</xsl:call-template>
		<xsl:apply-templates select="variable"/>
	</debugnode>
</xsl:template>

<!-- client variables -->
<xsl:template match="variables/client">
	<debugnode>
		<name>
			<xsl:value-of select="$variables_client_name"/>
		</name>
		<xsl:call-template name="icon">
			<xsl:with-param name="icon_variable" select="$variables_client_icon"/>
		</xsl:call-template>
		<xsl:apply-templates select="variable"/>
	</debugnode>
</xsl:template>

<!-- cookie variables -->
<xsl:template match="variables/cookie">
	<debugnode>
		<name>
			<xsl:value-of select="$variables_cookie_name"/>
		</name>
		<xsl:call-template name="icon">
			<xsl:with-param name="icon_variable" select="$variables_cookie_icon"/>
		</xsl:call-template>
		<xsl:apply-templates select="variable"/>
	</debugnode>
</xsl:template>

<!-- form variables -->
<xsl:template match="variables/form">
	<debugnode>
		<name>
			<xsl:value-of select="$variables_form_name"/>
		</name>
		<xsl:call-template name="icon">
			<xsl:with-param name="icon_variable" select="$variables_form_icon"/>
		</xsl:call-template>
		<xsl:apply-templates select="variable"/>
	</debugnode>
</xsl:template>

<!-- request variables -->
<xsl:template match="variables/request">
	<debugnode>
		<name>
			<xsl:value-of select="$variables_request_name"/>
		</name>
		<xsl:call-template name="icon">
			<xsl:with-param name="icon_variable" select="$variables_request_icon"/>
		</xsl:call-template>
		<xsl:apply-templates select="variable"/>
	</debugnode>
</xsl:template>

<!-- server variables -->
<xsl:template match="variables/server">
	<debugnode>
		<name>
			<xsl:value-of select="$variables_server_name"/>
		</name>
		<xsl:call-template name="icon">
			<xsl:with-param name="icon_variable" select="$variables_server_icon"/>
		</xsl:call-template>
		<xsl:apply-templates select="variable"/>
	</debugnode>
</xsl:template>

<!-- url variables -->
<xsl:template match="variables/url">
	<debugnode>
		<name>
			<xsl:value-of select="$variables_url_name"/>
		</name>
		<xsl:call-template name="icon">
			<xsl:with-param name="icon_variable" select="$variables_url_icon"/>
		</xsl:call-template>
		<xsl:apply-templates select="variable"/>
	</debugnode>
</xsl:template>

<!-- session variables -->
<xsl:template match="variables/session">
	<debugnode>
		<name>
			<xsl:value-of select="$variables_session_name"/>
		</name>
		<xsl:call-template name="icon">
			<xsl:with-param name="icon_variable" select="$variables_session_icon"/>
		</xsl:call-template>
		<xsl:apply-templates select="variable"/>
	</debugnode>
</xsl:template>

<!-- variable -->
<xsl:template match="variable">
	<debugnode>
		<name>
			<xsl:value-of select="name"/>
		</name>
		<xsl:call-template name="icon">
			<xsl:with-param name="icon_variable" select="$variable_icon"/>
		</xsl:call-template>
		<value>
			<xsl:value-of select="value"/>
		</value>
	</debugnode>
</xsl:template>

<!-- trace path -->
<xsl:template match="trace_path">
	<debugnode>
		<name>
			<xsl:value-of select="$trace_path_name"/>
		</name>
		<xsl:call-template name="icon">
			<xsl:with-param name="icon_variable" select="$trace_path_icon"/>
		</xsl:call-template>
		<xsl:apply-templates select="trace_point"/>
	</debugnode>
</xsl:template>

<!-- trace point -->
<xsl:template match="trace_point">
	<debugnode>
		<name>
			<xsl:if test="timestamp != ''">
				<xsl:value-of select="timestamp"/>
			</xsl:if>
			<xsl:if test="category != ''">
				<xsl:if test="timestamp != ''">
					<xsl:text> </xsl:text>
				</xsl:if>
				<xsl:value-of select="category"/>
			</xsl:if>
			<xsl:if test="type != ''">
				<xsl:if test="timestamp != '' or category != ''">
					<xsl:text> </xsl:text>
				</xsl:if>
				<xsl:value-of select="type"/>
			</xsl:if>
			<xsl:if test="logged != ''">
				<xsl:if test="timestamp != '' or category != '' or type != ''">
					<xsl:text> </xsl:text>
				</xsl:if>
				<xsl:value-of select="$tracepoint_logged_name"/>
			</xsl:if>
		</name>
		<xsl:call-template name="icon">
			<xsl:with-param name="icon_variable" select="$trace_point_icon"/>
		</xsl:call-template>
		<xsl:apply-templates select="jump_to_line"/>
		<xsl:if test="text != ''">
			<value>
				<xsl:value-of select="text"/>
			</value>
		</xsl:if>
		<xsl:apply-templates select="variable"/>
	</debugnode>
</xsl:template>

<!-- jump-to-line -->
<xsl:template match="jump_to_line">
	<jumptoline>
		<xsl:if test="line_number != ''">
			<xsl:attribute name="linenumber">
				<xsl:value-of select="line_number"/>
			</xsl:attribute>
		</xsl:if>
		<xsl:if test="start_position != ''">
			<xsl:attribute name="startposition">
				<xsl:value-of select="start_position"/>
			</xsl:attribute>
		</xsl:if>
		<xsl:if test="end_position != ''">
			<xsl:attribute name="endposition">
				<xsl:value-of select="end_position"/>
			</xsl:attribute>
		</xsl:if>
		<xsl:if test="uri != ''">
			<template>
				<xsl:call-template name="subst_name">
					<xsl:with-param name="this" select="uri"/>
				</xsl:call-template>
<!--			<xsl:value-of select="uri"/> -->
			</template>
		</xsl:if>
		<xsl:if test="file != ''">
			<path>
				<xsl:call-template name="subst_name">
					<xsl:with-param name="this" select="file"/>
				</xsl:call-template>
<!--			<xsl:value-of select="file"/> -->
			</path>
		</xsl:if>
	</jumptoline>
</xsl:template>

<!-- icon -->
<xsl:template name="icon">
	<xsl:param name="icon_variable"/>
	<xsl:if test="$icon_variable != ''">
		<icon>
			<xsl:value-of select="$config_folder"/><xsl:value-of select="$icon_variable"/>
		</icon>
	</xsl:if>
</xsl:template>

<!-- substitue real file name for temp file name -->
<xsl:template name="subst_name">
	<xsl:param name="this" select="." />
	<xsl:choose>
		<xsl:when test="$temp_file_name != ''">
			<xsl:choose>
				<xsl:when test="contains($this, $temp_file_name)">
					<xsl:value-of select="substring-before($this, $temp_file_name)"/>
					<xsl:value-of select="$real_file_name"/>
				</xsl:when>
				<xsl:otherwise>
					<xsl:value-of select="$this"/>
				</xsl:otherwise>
			</xsl:choose>
		</xsl:when>
		<xsl:otherwise>
			<xsl:value-of select="$this"/>
		</xsl:otherwise>
	</xsl:choose>
</xsl:template>


</xsl:stylesheet>
