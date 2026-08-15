FROM php:8.2-apache
WORKDIR /var/www/html
COPY checker.php /var/www/html/index.php
COPY vault.php /var/www/html/vault.php
ENV FLAG="VR{extract_overwrites_everything}"
EXPOSE 80
