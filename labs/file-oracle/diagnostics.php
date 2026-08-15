<?php
// Gate: this diagnostics module requires a session token matching the
// server's configured gate token.
$requiredToken = getenv('GATE_TOKEN') ?: 'oracle-gate-7f3a91';
$hasAccess = (isset($_COOKIE['diag_token']) && $_COOKIE['diag_token'] === $requiredToken);

if (!$hasAccess && !headers_sent()) {
    @setcookie('diag_token', 'guest-000000', time() + 3600, '/');
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Node Diagnostics — File Oracle</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            background: #0a0a0f; color: #dcdcdc; font-family: 'Courier New', monospace;
            display: flex; flex-direction: column; align-items: center;
            min-height: 100vh; padding: 3rem 1.5rem;
        }
        h1 { color: #00ff88; font-size: 1.8rem; margin-bottom: 0.4rem; }
        .subtitle { color: #6b7280; margin-bottom: 2rem; font-size: 0.9rem; }
        .panel {
            background: #12121a; border: 1px solid #262636; border-radius: 8px;
            padding: 1.8rem; width: 100%; max-width: 560px;
        }
        textarea {
            width: 100%; height: 120px; background: #1a1a26; border: 1px solid #2e2e42;
            color: #dcdcdc; padding: 0.8rem; font-family: monospace; border-radius: 6px;
            resize: vertical; margin-bottom: 1rem;
        }
        button {
            background: #00ff88; color: #0a0a0f; border: none; padding: 0.6rem 1.8rem;
            font-family: monospace; font-weight: bold; cursor: pointer; border-radius: 6px;
        }
        button:hover { background: #00cc70; }
        .output {
            margin-top: 1.5rem; padding: 1rem; background: #0d0d14;
            border-left: 3px solid #00ff88; font-size: 1rem; word-break: break-word;
        }
        .locked {
            color: #ff4757; text-align: center; padding: 3rem 1rem;
        }
        .locked h2 { margin-bottom: 0.8rem; }
    </style>
</head>
<body>
<?php if (!$hasAccess): ?>
    <div class="locked">
        <h2>🔒 Access Restricted</h2>
        <p>This diagnostic module requires elevated session credentials.</p>
    </div>
<?php else: ?>
    <h1>⚙ Node Diagnostics</h1>
    <p class="subtitle">Run a quick text-length check against the collector node.</p>
    <div class="panel">
        <form method="GET" action="/">
            <input type="hidden" name="module" value="diagnostics.php">
            <textarea name="payload" placeholder="Enter diagnostic payload..."></textarea>
            <button type="submit">Run Check</button>
        </form>
<?php
if (isset($_GET['payload'])) {
    $payload = $_GET['payload'];
    // Vulnerability: user-controlled string concatenated directly into a
    // shell command with no escaping. Classic command injection.
    $result = shell_exec("printf '" . $payload . "' | wc -c");
    echo '<div class="output">Payload length: <strong>' . htmlspecialchars(trim((string) $result)) . '</strong></div>';
}
?>
    </div>
<?php endif; ?>
</body>
</html>
