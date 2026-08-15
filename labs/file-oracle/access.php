<?php
/**
 * Internal note — this file is not linked from anywhere in the UI.
 * It should never be requested directly. If it is, something upstream
 * has gone wrong with our access controls.
 */
$gateToken = getenv('GATE_TOKEN') ?: 'oracle-gate-7f3a91';
http_response_code(403);
echo "This module is not intended for direct access.";
