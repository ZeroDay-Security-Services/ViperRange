FROM php:8.2-apache

WORKDIR /var/www/html

COPY portal.php /var/www/html/index.php
COPY diagnostics.php /var/www/html/diagnostics.php
COPY access.php /var/www/html/access.php
COPY robots.txt /var/www/html/robots.txt
COPY entrypoint.sh /entrypoint.sh

RUN echo "ServerName viperrange-lab" >> /etc/apache2/conf-available/servername.conf \
    && a2enconf servername \
    && chmod +x /entrypoint.sh \
    && echo "SetEnv FLAG \${FLAG}" >> /etc/apache2/conf-available/servername.conf \
    && echo "SetEnv GATE_TOKEN \${GATE_TOKEN}" >> /etc/apache2/conf-available/servername.conf

# FLAG is injected at deploy time by the ViperRange orchestrator.
# A default value is provided only so the container is functional
# if launched outside the platform for local testing.
ENV FLAG="VR{oracle_lfi_chain_to_rce}"
ENV GATE_TOKEN="oracle-gate-7f3a91"

EXPOSE 80
ENTRYPOINT ["/entrypoint.sh"]
CMD ["apache2-foreground"]
