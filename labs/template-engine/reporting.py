# ViperRange Lab — Template Engine
# ZeroDay Security Services
#
# Scenario: An internal survey widget lets visitors preview how their
# response will be rendered before submitting. To support "rich preview
# text," the raw query parameter is spliced directly into the template
# source before compilation — a textbook server-side template injection.

import os
import tornado.ioloop
import tornado.template
import tornado.web

FLAG = os.environ.get("FLAG", "VR{fallback_flag_not_for_production}")
VAULT_KEY = os.environ.get("VAULT_KEY", "vr-vault-9c1e5f")
PORT = int(os.environ.get("PORT", 8888))

TEMPLATE_SOURCE = """
<!DOCTYPE html>
<html>
<head><title>ViperRange Survey Preview</title>
<style>
body { background:#0a0a10; color:#e4e4ee; font-family:monospace;
       text-align:center; padding:3rem 1.5rem; }
h1 { color:#f472b6; font-size:1.9rem; }
.panel { background:#14141e; border:1px solid #262636; border-radius:8px;
         padding:1.6rem; max-width:520px; margin:2rem auto; text-align:left; }
select, button { font-family:monospace; padding:0.5rem; border-radius:6px;
                 background:#1c1c2a; color:#e4e4ee; border:1px solid #2c2c3e; }
.result { margin-top:1.2rem; padding:1rem; background:#0d0d14;
          border-left:3px solid #f472b6; }
</style>
</head>
<body>
<h1>📋 Survey Response Preview</h1>
<div class="panel">
  <form method="GET">
    <label>Preview rendering mode:</label><br>
    <select name="mode">
      <option value="{{! calm }}">calm</option>
      <option value="{{! neutral }}">neutral</option>
      <option value="{{! urgent }}">urgent</option>
    </select>
    <button type="submit">Preview</button>
  </form>
  <div class="result">MODE_PLACEHOLDER</div>
</div>
<p style="color:#5a5a70;font-size:0.85rem;">
Vault status: {{ vault_status }}
</p>
</body>
</html>
"""


class SurveyHandler(tornado.web.RequestHandler):
    def get(self):
        calm = "Reads as measured and considered."
        neutral = "Reads as balanced and factual."
        urgent = "Reads as time-sensitive and high priority."

        # Vulnerability: the requested "mode" value is spliced directly into
        # the template *source* before it's compiled, rather than being
        # passed in as a safely-escaped template variable.
        rendered_source = TEMPLATE_SOURCE.replace(
            "MODE_PLACEHOLDER", self.get_argument("mode", "")
        )

        compiled = tornado.template.Template(rendered_source)

        vault_status = "sealed"
        if self.get_secure_cookie("vault") == b"open":
            vault_status = FLAG
        else:
            self.set_secure_cookie("vault", "closed")

        self.write(
            compiled.generate(
                calm=calm,
                neutral=neutral,
                urgent=urgent,
                vault_status=vault_status,
                application=self.application,
            )
        )


def make_app():
    return tornado.web.Application(
        [(r"/", SurveyHandler)],
        cookie_secret=VAULT_KEY,
        debug=False,
    )


if __name__ == "__main__":
    app = make_app()
    app.listen(PORT)
    print(f"Template Engine lab listening on port {PORT}")
    tornado.ioloop.IOLoop.current().start()
