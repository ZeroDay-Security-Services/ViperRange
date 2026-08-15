<?php
/**
 * ViperRange Lab — File Oracle
 * ZeroDay Security Services
 *
 * Scenario: An internal diagnostics portal loads report modules by name.
 * The module loader trusts the client-supplied module name completely.
 */

$module = isset($_GET['module']) ? $_GET['module'] : 'diagnostics.php';

// Vulnerability: no path validation, no allow-list, no canonicalization check.
// Any local file reachable by the web server process can be included.
include($module);
