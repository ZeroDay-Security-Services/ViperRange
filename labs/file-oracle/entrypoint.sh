#!/bin/bash
set -e

# Materialize the flag into a file at container start so the intended
# command-injection path (shell_exec in diagnostics.php) can retrieve it.
# The flag is never written into any source file or Docker layer.
echo "${FLAG}" > /var/www/html/collector_output.log
chown www-data:www-data /var/www/html/collector_output.log
chmod 640 /var/www/html/collector_output.log

exec "$@"
