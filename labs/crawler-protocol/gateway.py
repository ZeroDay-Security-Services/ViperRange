# ViperRange Lab — Crawler Protocol
# ZeroDay Security Services
#
# Scenario: An archive gateway publishes a crawler exclusion policy.
# One of the disallowed paths was never actually protected by
# authentication — it was just asked, politely, not to be crawled.

from flask import Flask, send_from_directory, Response
from os import getenv

app = Flask(__name__)
FLAG = getenv("FLAG", "VR{fallback_flag_not_for_production}")
PORT = int(getenv("PORT", 5000))


@app.route("/")
def landing():
    return send_from_directory(".", "landing.html")


@app.route("/robots.txt")
def robots():
    return send_from_directory(".", "robots.txt")


@app.route("/archive/internal/manifest")
def manifest():
    return Response(FLAG, mimetype="text/plain")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=PORT)
