<?php
$flag = getenv('FLAG') ?: 'VR{extract_overwrites_everything}';
?>
<h2 style="color:#00ff88; margin-bottom:0.75rem;">🔓 Vault Decrypted</h2>
<p style="color:#8f90a6; font-size:0.9rem; margin-bottom:1.5rem;">Privileged override accepted via variable extraction.</p>
<div class="flag-box">
    <?php echo htmlspecialchars($flag); ?>
</div>
