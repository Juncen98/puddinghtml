<?php
// MM_XSLTransform version: 0.6.2

// TODO: 
// maybe use socket connection instead of fopen url (check for timeout and status codes)
// if dom functions exists but xslt functions do not, prompt to install?
class MM_XSLTransform {
	
	var $xmlname;
	var $xslname;
	var $params;
	
	var $processor;
	
	var $myError;
	var $e;
	
	function MM_XSLTransform() {
		$this->params = array();
		$this->e = array(
@@errorMessageList@@
		'' => ''
		);
	}
	
	function setXML($xml) {
		$this->xmlname = $xml;
	}
	
	function setXSL($xsl) {
		$this->xslname = $xsl;
	}
	
	function addParameter($paramName, $paramValue) {
		$this->params[$paramName] = $paramValue;
	}
	
	
	/**
	 * error handlinmg functions
	 */
	function setError($error) {
		$this->myError = $error;
	}
	
	function hasError() {
		if (strlen(trim($this->myError)) > 0) {
			return true;
		}
		return false;
	}
	
	function getError() {
		return $this->getErrorFromCode('MM_GEN_ERROR') . $this->myError;
	}
	
		function getRawError() {
			return $this->myError;
		}
	
		function getErrorFromCode($errCode, $args = array()) {
			$error = $this->e[$errCode];
			if ( count($args) > 0 ) {
				array_unshift($args, $error);
				$error = call_user_func_array('sprintf', $args);
			}
			return $error;
		}
	/**
	 * check for valid xml / xsl processors
	 */
	function checkProcessor() {
		$extensions = get_loaded_extensions();
		if (substr(PHP_VERSION, 0, 1) == '5') {
			if ( in_array('dom', $extensions) && in_array('xsl', $extensions) && class_exists('DOMDocument') && class_exists('XSLTProcessor') ) {
				$this->processor = 'domxml5';
				return;
			}
		}
		if (substr(PHP_VERSION, 0, 1) == '4' && substr(PHP_VERSION, 2, 1) > '2') {
			if ( in_array('xslt', $extensions) && function_exists('xslt_create')) {
				$this->processor = 'sablotron';
				return;
			}
			if ( in_array('domxml', $extensions) && function_exists('domxml_open_mem') && function_exists('domxml_xslt_stylesheet') ) {
				$this->processor = 'domxml4';
				return;
			}
		}
		if (substr(PHP_VERSION, 0, 1) == '4' && substr(PHP_VERSION, 2, 1) < '3') {
			if ( in_array('xslt', $extensions) && function_exists('xslt_create')) {
				$this->processor = 'sablotron';
				return;
			}
		}
		$this->processor = 'undefined';
		$this->setError($this->getErrorFromCode('MM_NO_PROCESSOR_ERROR'));
		return;
	}
	
	/**
	 * utilities
	 */
	function util_htmlentities($content) {
		return '<pre>' . htmlentities($content) . '</pre>';
	}
	
	function util_errorHandler($errNo, $errStr, $errFile, $errLine) {
		if (!$this->hasError()) {
			$myError = $errStr;
		} else {
			$myError = $this->getRawError();
			$myError .= '<br>' . $errStr;
		}
		$this->setError($myError);
		return;
	}
	
	/**
	 * core functions
	 */
	function checkInput() {
		if (!isset($this->xmlname) || strlen(trim($this->xmlname)) == 0) {
			$this->setError($this->getErrorFromCode('MM_XML_EMPTY_ERROR'));
		}
		if (!isset($this->xslname) || strlen(trim($this->xslname)) == 0) {
			$this->setError($this->getErrorFromCode('MM_XSL_EMPTY_ERROR'));
		}
	}
	
	function isURL(&$src) {
		$url_prefixes = array('http', 'https');
		$pos = strpos($src, '://');
		
		if ( $pos !== false && in_array(strtolower(substr($src, 0, $pos)), $url_prefixes) ) {
			return true;
		}
		return false;
	}
	
	function getRemoteFile(&$src) {
		$fileContent = '';
		
		$pos = strpos($src, '://');
		$protocol = strtolower(substr($src, 0, $pos));
		
		// avoid protocol upper case
		$mySrc = $protocol . substr($src, $pos);
		
		$magic_quotes_runtime_orig = get_magic_quotes_runtime();
		set_magic_quotes_runtime(0);
		if ($myFile = @fopen($mySrc, 'rb')) {
			while ($data = fread($myFile, 2048)) {
				$fileContent .= $data;
			}
			fclose($myFile);
		} else {
			$this->setError($this->getErrorFromCode('MM_OPEN_REMOTE_ERROR', array($src)));
			if ($protocol == 'https') {
				$this->setError($this->getErrorFromCode('MM_HTTPS_OPEN_ERROR', array($src)));
				if ( (substr(PHP_VERSION, 0, 1) < 5) && (substr(PHP_VERSION, 2, 1) < 3) ) {
					$this->setError($this->getErrorFromCode('MM_HTTPS_NOT_SUPPORTED_ERROR', array($src)));
				}
			}
		}
		set_magic_quotes_runtime($magic_quotes_runtime_orig);
		return $fileContent;
	}
	
	function getLocalFile(&$src) {
		$fileContent = '';
		
		$mySrc = realpath($src);
		
		if (!file_exists($mySrc)) {
			$this->setError($this->getErrorFromCode('MM_OPEN_FILE_ERROR', array($src)));
			return $fileContent;
		}
		
		clearstatcache();
		if (!is_readable($mySrc)) {
			$this->setError($this->getErrorFromCode('MM_FILE_NOT_READABLE_ERROR', array($src)));
			return $fileContent;
		}
		
		$magic_quotes_runtime_orig = get_magic_quotes_runtime();
		set_magic_quotes_runtime(0);
		if ($myFile = fopen($mySrc, 'rb')) {
			while ($data = fread($myFile, 4096)) {
				$fileContent .= $data;
			}
			fclose($myFile);
		}
		set_magic_quotes_runtime($magic_quotes_runtime_orig);
		return $fileContent;
	}
	
	/**
	 * wrapper
	 */
	function checkValid(&$src, &$content, $type) {
		switch ($this->processor) {
			case 'domxml5':
				return $this->checkValid_domxml5($src, $content, $type);
				break;
			case 'domxml4':
				return $this->checkValid_domxml4($src, $content, $type);
				break;
			case 'sablotron':
				return $this->checkValid_sablotron($src, $content, $type);
				break;
		}
	}
	
		function checkValid_sablotron(&$src, &$content, $type) {
			$myError = '';
			$magic_quotes_runtime_orig = get_magic_quotes_runtime();
			set_magic_quotes_runtime(0);
			$proc = xslt_create();
			$procArguments = array('/_xml' => $content, '/_xsl' => '<?xml version="1.0" encoding="UTF-8"?'.'><xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"/>');
			@xslt_process($proc, 'arg:/_xml', 'arg:/_xsl', NULL, $procArguments);
			$myError = xslt_error($proc);
			xslt_free($proc);
			if ( strlen(trim($myError)) > 0 ) {
				if ($type == "xml") {
					$myError = $this->getErrorFromCode('MM_INVALID_XML_ERROR', array($src)) . $myError;
				} else {
					$myError = $this->getErrorFromCode('MM_INVALID_XSL_ERROR', array($src)) . $myError;
				}
				$myError .= $this->getErrorFromCode('MM_CHECK_VALID_SAB_ERROR');
				$myError .= $this->util_htmlentities($content);
				$this->setError($myError, array($src));
			}
			set_magic_quotes_runtime($magic_quotes_runtime_orig);
			return;
		}
		
		function checkValid_domxml4(&$src, &$content, $type) {
			$errors = array();
			$magic_quotes_runtime_orig = get_magic_quotes_runtime();
			set_magic_quotes_runtime(0);
			// PHP > 43
			$old_error_reporting = error_reporting(E_ALL);
			$old_error_handler = set_error_handler(array(&$this, 'util_errorHandler'));
			if ($xml = @domxml_open_mem($content, DOMXML_LOAD_PARSING, $errors)) {
				if (method_exists($xml, 'free')) {
					$xml->free();
				}
			}
			restore_error_handler();
			error_reporting($old_error_reporting);
			set_magic_quotes_runtime($magic_quotes_runtime_orig);
			if (!$xml || count($errors) > 0 || $this->hasError()) {
				if ($type == "xml") {
					$myError = $this->getErrorFromCode('MM_INVALID_XML_ERROR', array($src));
				} else {
					$myError = $this->getErrorFromCode('MM_INVALID_XSL_ERROR', array($src));
				}
				if (count($errors) == 0) {
					$myError .= $this->getRawError();
				}
				foreach ($errors as $error) {
					$tag = '';
					if (isset($error['nodename'])) {
						$tag = $this->getErrorFromCode('MM_CHECK_VALID_D4_TAG_ERROR', array($error['nodename']));
					}
					$myError .= trim($error['errormessage']) . '. ' . $this->getErrorFromCode('MM_CHECK_VALID_D4_ERROR', array($tag, $error['line'], $error['col'], $src));
				}
				$this->setError($myError . $this->util_htmlentities($content));
			}
			return;
		}
	
		function checkValid_domxml5(&$src, &$content, $type) {
			$myError = '';
			$magic_quotes_runtime_orig = get_magic_quotes_runtime();
			set_magic_quotes_runtime(0);
			$old_error_reporting = error_reporting(E_ALL);
			$old_error_handler = set_error_handler(array(&$this, 'util_errorHandler'));
			$xml = DOMDocument::loadXML($content);
			restore_error_handler();
			error_reporting($old_error_reporting);
			set_magic_quotes_runtime($magic_quotes_runtime_orig);
			if ($this->hasError()) {
				if ($type == "xml") {
					$myError = $this->getErrorFromCode('MM_INVALID_XML_ERROR', array($src));
				} else {
					$myError = $this->getErrorFromCode('MM_INVALID_XSL_ERROR', array($src));
				}
				$myError .= $this->getRawError();
				$this->setError($myError . $this->getErrorFromCode('MM_CHECK_VALID_D5_ERROR', array($src)) . $this->util_htmlentities($content));
			}
			return;
		}
	
	/**
	 * wrapper
	 */
	function transformDocument(&$xml, &$xsl, &$params) {
		switch ($this->processor) {
			case 'domxml5':
				return $this->transformDocument_domxml5($xml, $xsl, $params);
				break;
			case 'domxml4':
				return $this->transformDocument_domxml4($xml, $xsl, $params);
				break;
			case 'sablotron':
				return $this->transformDocument_sablotron($xml, $xsl, $params);
				break;
		}
	}
	
		function transformDocument_sablotron(&$xml, &$xsl, &$params) {
			$myError = '';
			$magic_quotes_runtime_orig = get_magic_quotes_runtime();
			set_magic_quotes_runtime(0);
			$proc = xslt_create();
			$procArguments = array('/_xml' => $xml, '/_xsl' => $xsl);
			$output = @xslt_process($proc, 'arg:/_xml', 'arg:/_xsl', NULL, $procArguments, $params);
			$myError = xslt_error($proc);
			xslt_free($proc);
			set_magic_quotes_runtime($magic_quotes_runtime_orig);
			if ( strlen(trim($myError)) > 0 ) {
				$myError = $this->getErrorFromCode('MM_TRANSFORMATION_ERROR') . $myError;
				$myError .= $this->getErrorFromCode('MM_TRANSFORM_SAB_ERROR', array($this->xslname));
				$myError .= $this->util_htmlentities($xsl);
				$this->setError($myError);
				return;
			}
			return $output;
		}
		
		function transformDocument_domxml4(&$xml, &$xsl, &$params) {
			$magic_quotes_runtime_orig = get_magic_quotes_runtime();
			set_magic_quotes_runtime(0);
			$xmlDom = domxml_open_mem($xml);
			$xslDom = domxml_open_mem($xsl);
			$old_error_reporting = error_reporting(E_ALL);
			$old_error_handler = set_error_handler(array(&$this, 'util_errorHandler'));
			$xslDoc = domxml_xslt_stylesheet_doc($xslDom);
			$result = $xslDoc->process($xmlDom, $params);
			restore_error_handler();
			error_reporting($old_error_reporting);
			if ($this->hasError()) {
				$myError = $this->getErrorFromCode('MM_TRANSFORMATION_ERROR');
				$myError .= $this->getRawError();
				$myError .= $this->getErrorFromCode('MM_TRANSFORM_D4_ERROR', array($this->xslname));
				$myError .= $this->util_htmlentities($xsl);
				$this->setError($myError);
				set_magic_quotes_runtime($magic_quotes_runtime_orig);
				return;
			}
			$output = $result->dump_mem();
			if (method_exists($xmlDom, 'free')) {
				$xmlDom->free();
				$xslDom->free();
				$result->free();
			}
			set_magic_quotes_runtime($magic_quotes_runtime_orig);
			return $output;
		}
	
		function transformDocument_domxml5(&$xml, &$xsl, &$params) {
			$magic_quotes_runtime_orig = get_magic_quotes_runtime();
			set_magic_quotes_runtime(0);
			$xmlDom = new DOMDocument;
			$xslDom = new DOMDocument;
			$xmlDom->loadXML($xml);
			$xslDom->loadXML($xsl);
			$proc = new XSLTProcessor;
			foreach ($params as $key => $value) {
				$proc->setParameter('', $key, $value);
			}
			$old_error_reporting = error_reporting(E_ALL);
			$old_error_handler = set_error_handler(array(&$this, 'util_errorHandler'));
			$proc->importStyleSheet($xslDom);
			$result = $proc->transformToDoc($xmlDom);
			restore_error_handler();
			error_reporting($old_error_reporting);
			if ($this->hasError()) {
				$myError = $this->getErrorFromCode('MM_TRANSFORMATION_ERROR');
				$myError .= $this->getRawError();
				$myError .= $this->getErrorFromCode('MM_TRANSFORM_D5_ERROR', array($this->xslname));
				$myError .= $this->util_htmlentities($xsl);
				$this->setError($myError);
				set_magic_quotes_runtime($magic_quotes_runtime_orig);
				return;
			}
			$output = $result->saveXML();
			set_magic_quotes_runtime($magic_quotes_runtime_orig);
			return $output;
		}
	
	function Transform() {
		
		$this->checkProcessor();
		if ($this->hasError()) {
			return $this->getError();
		}
		
		$this->checkInput();
		if ($this->hasError()) {
			return $this->getError();
		}
		
		if ($this->isURL($this->xmlname)) {
			$xml = $this->getRemoteFile($this->xmlname);
		} else {
			$xml = $this->getLocalFile($this->xmlname);
		}
		if ($this->hasError()) {
			return $this->getError();
		}
		
		$xsl = $this->getLocalFile($this->xslname);
		if ($this->hasError()) {
			return $this->getError();
		}
		
		$this->checkValid($this->xmlname, $xml, 'xml');
		if ($this->hasError()) {
			return $this->getError();
		}
		$this->checkValid($this->xslname, $xsl, 'xsl');
		if ($this->hasError()) {
			return $this->getError();
		}
		
		$output = $this->transformDocument($xml, $xsl, $this->params);
		if ($this->hasError()) {
			return $this->getError();
		}
		
		return $output;
	}
}

?>
