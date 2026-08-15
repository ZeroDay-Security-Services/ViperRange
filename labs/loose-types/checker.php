<?php
/**
 * ViperRange Lab — Loose Types
 * ZeroDay Security Services
 *
 * Scenario: A feature-flag preview tool lets QA engineers toggle flags via
 * query string for local testing. To keep things "simple," every query
 * parameter is extracted directly into the local variable scope.
 */

$environment  = "production";
$vaultUnlocked = false;
$requestedBy  = "anonymous";

// Vulnerability: extract() imports every key in $_GET as a same-named
// local variable, silently overwriting $vaultUnlocked (and anything else)
// if the attacker simply names their parameter after it.
extract($_GET);

$isDebugging = isset($_GET['debug']);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Loose Types — Feature Flag Vault</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            background: #0a0a0f;
            color: #dcdcdc;
            font-family: 'Courier New', monospace;
            display: flex;
            flex-direction: column;
            align-items: center;
            min-height: 100vh;
            padding: 3rem 1.5rem;
        }
        .header {
            text-align: center;
            margin-bottom: 2rem;
        }
        h1 {
            color: #00ff88;
            font-size: 1.8rem;
            margin-bottom: 0.4rem;
            letter-spacing: 1px;
        }
        .subtitle {
            color: #6b7280;
            font-size: 0.85rem;
        }
        .terminal {
            background: #12121a;
            border: 1px solid #262636;
            border-radius: 10px;
            width: 100%;
            max-width: 820px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        }
        .terminal-header {
            background: #181824;
            padding: 0.75rem 1rem;
            border-bottom: 1px solid #262636;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        .dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            display: inline-block;
        }
        .dot-red { background: #ff5f56; }
        .dot-yellow { background: #ffbd2e; }
        .dot-green { background: #27c93f; }
        .terminal-title {
            color: #8f90a6;
            font-size: 0.8rem;
            margin-left: 0.5rem;
        }
        .terminal-body {
            padding: 1.5rem;
            overflow-x: auto;
            background: #0e0e16;
        }
        pre {
            color: #f8f8f2;
            font-family: 'Courier New', monospace;
            font-size: 0.9rem;
            line-height: 1.6;
        }
        .comment { color: #6272a4; }
        .keyword { color: #ff79c6; font-weight: bold; }
        .variable { color: #50fa7b; }
        .string { color: #f1fa8c; }
        .function { color: #8be9fd; }
        .panel {
            background: #12121a;
            border: 1px solid #262636;
            border-radius: 10px;
            padding: 2.5rem 2rem;
            width: 100%;
            max-width: 600px;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        }
        .status-badge {
            display: inline-block;
            padding: 0.35rem 0.85rem;
            border-radius: 9999px;
            font-size: 0.8rem;
            font-weight: bold;
            margin-bottom: 1.5rem;
        }
        .locked {
            color: #ff4757;
            border: 1px solid rgba(255, 71, 87, 0.3);
            background: rgba(255, 71, 87, 0.1);
        }
        .unlocked {
            color: #00ff88;
            border: 1px solid rgba(0, 255, 136, 0.3);
            background: rgba(0, 255, 136, 0.1);
        }
        .flag-box {
            background: #0a0a0f;
            border: 1px solid #00ff88;
            color: #00ff88;
            padding: 1rem;
            border-radius: 6px;
            font-size: 1.1rem;
            font-weight: bold;
            margin-top: 1.5rem;
            word-break: break-all;
        }
    </style>
</head>
<body>

    <div class="header">
        <h1>🔓 Feature Flag Vault</h1>
        <p class="subtitle">Loose Types — ZeroDay Security Services</p>
    </div>

<?php if (!$isDebugging): ?>
    <div class="terminal">
        <div class="terminal-header">
            <span class="dot dot-red"></span>
            <span class="dot dot-yellow"></span>
            <span class="dot dot-green"></span>
            <span class="terminal-title">checker.php (source view)</span>
        </div>
        <div class="terminal-body">
<pre><span class="keyword">&lt;?php</span>
<span class="comment">/**
 * ViperRange Lab — Loose Types
 * ZeroDay Security Services
 *
 * Scenario: A feature-flag preview tool lets QA engineers toggle flags via
 * query string for local testing. To keep things "simple," every query
 * parameter is extracted directly into the local variable scope.
 */</span>

<span class="variable">$environment</span>  = <span class="string">"production"</span>;
<span class="variable">$vaultUnlocked</span> = <span class="keyword">false</span>;
<span class="variable">$requestedBy</span>  = <span class="string">"anonymous"</span>;

<span class="comment">// Vulnerability: extract() imports every key in $_GET as a same-named
// local variable, silently overwriting $vaultUnlocked (and anything else)
// if the attacker simply names their parameter after it.</span>
<span class="function">extract</span>(<span class="variable">$_GET</span>);

<span class="keyword">if</span> (!<span class="function">isset</span>(<span class="variable">$_GET</span>[<span class="string">'debug'</span>])) {
    <span class="comment">// Default view — renders source code. Add ?debug=1 to enter execution mode.</span>
    <span class="function">include</span>(<span class="string">'source_viewer.php'</span>);
    <span class="keyword">exit</span>;
}

<span class="keyword">if</span> (<span class="variable">$vaultUnlocked</span> === <span class="keyword">true</span> || <span class="variable">$vaultUnlocked</span> === <span class="string">"1"</span>) {
    <span class="function">include</span>(<span class="string">'vault.php'</span>);
} <span class="keyword">else</span> {
    <span class="function">echo</span> <span class="string">"&lt;h1&gt;🔒 Vault Sealed&lt;/h1&gt;"</span>;
}
</pre>
        </div>
    </div>
<?php else: ?>
    <div class="panel">
        <?php if ($vaultUnlocked === true || $vaultUnlocked === "1"): ?>
            <div class="status-badge unlocked">STATUS: UNLOCKED</div>
            <?php include('vault.php'); ?>
        <?php else: ?>
            <div class="status-badge locked">STATUS: SEALED</div>
            <h2 style="color:#ff4757; margin-bottom:0.75rem;">🔒 Vault Sealed</h2>
            <p style="color:#8f90a6; font-size:0.9rem; margin-bottom:1rem;">Environment: <strong style="color:#dcdcdc;"><?php echo htmlspecialchars((string) $environment); ?></strong></p>
            <p style="color:#6b7280; font-size:0.8rem;">Access is restricted to authorized operators.</p>
        <?php endif; ?>
    </div>
<?php endif; ?>

</body>
</html>
