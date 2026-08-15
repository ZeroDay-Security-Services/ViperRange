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

FLAG = os.environ.get("FLAG", "VR{ssti_forges_the_session}")
VAULT_KEY = os.environ.get("VAULT_KEY", "vr-vault-9c1e5f")
PORT = int(os.environ.get("PORT", 8888))

TEMPLATE_SOURCE = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Template Engine — Tornado SSTI Kernel | ViperRange</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background: #08080f;
    color: #e4e4ee;
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
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(244, 114, 182, 0.1);
    border: 1px solid rgba(244, 114, 182, 0.3);
    color: #f472b6;
    font-size: 0.75rem;
    font-weight: bold;
    padding: 0.35rem 0.8rem;
    border-radius: 9999px;
    margin-bottom: 0.8rem;
    letter-spacing: 1px;
  }
  .beacon {
    width: 8px; height: 8px;
    background: #f472b6;
    border-radius: 50%;
    box-shadow: 0 0 8px #f472b6;
  }
  h1 {
    color: #ffffff;
    font-size: 1.8rem;
    margin-bottom: 0.4rem;
    letter-spacing: 1px;
  }
  p.desc {
    color: #8f90a6;
    font-size: 0.85rem;
    max-width: 580px;
    line-height: 1.5;
  }
  .card {
    background: #10101a;
    border: 1px solid #232338;
    border-radius: 12px;
    padding: 2rem;
    width: 100%;
    max-width: 600px;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7);
    margin-bottom: 1.5rem;
  }
  .terminal-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.2rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid #1e1e2e;
    font-size: 0.75rem;
    color: #6b7280;
  }
  label {
    display: block;
    color: #f472b6;
    font-size: 0.8rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
    text-transform: uppercase;
  }
  .input-row {
    display: flex;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }
  input[type="text"] {
    flex: 1;
    background: #090912;
    border: 1px solid #2e2e46;
    color: #f472b6;
    padding: 0.8rem 1rem;
    font-family: 'Courier New', monospace;
    font-size: 0.9rem;
    border-radius: 8px;
    outline: none;
  }
  input[type="text"]:focus {
    border-color: #f472b6;
    box-shadow: 0 0 10px rgba(244, 114, 182, 0.2);
  }
  button {
    background: #f472b6;
    color: #08080f;
    border: none;
    padding: 0.8rem 1.5rem;
    font-family: 'Courier New', monospace;
    font-weight: bold;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
  }
  button:hover {
    background: #ec4899;
    box-shadow: 0 0 15px rgba(244, 114, 182, 0.4);
  }
  .preview-box {
    background: #090912;
    border: 1px solid #232338;
    border-left: 4px solid #f472b6;
    border-radius: 8px;
    padding: 1.2rem;
    font-size: 0.9rem;
    color: #e4e4ee;
    min-height: 50px;
    word-break: break-word;
  }
  .vault-status-panel {
    background: #10101a;
    border: 1px solid #232338;
    border-radius: 12px;
    padding: 1.2rem 2rem;
    width: 100%;
    max-width: 600px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .status-tag {
    font-size: 0.75rem;
    color: #6b7280;
  }
  .status-val {
    font-size: 0.9rem;
    font-weight: bold;
    color: {{! "#00ff88" if vault_status != "sealed" else "#ff4757" }};
  }
</style>
</head>
<body>

<div class="header">
  <div class="badge"><span class="beacon"></span> TORNADO SSTI KERNEL NODE</div>
  <h1>⚙ Template Engine</h1>
  <p class="desc">Dynamic expression compiler evaluating template directives prior to AST compilation.</p>
</div>

<div class="card">
  <div class="terminal-bar">
    <span>COMPILER MODE: TORNADO V6</span>
    <span>STATUS: ONLINE</span>
  </div>

  <form method="GET">
    <label>Render Expression Input:</label>
    <div class="input-row">
      <input type="text" name="mode" placeholder="e.g. {{ 7*7 }} or {{ application.settings }}" value="MODE_INPUT_VALUE">
      <button type="submit">Compile AST</button>
    </div>
  </form>

  <label>Compiled Evaluation Output:</label>
  <div class="preview-box">
    MODE_PLACEHOLDER
  </div>
</div>

<div class="vault-status-panel">
  <span class="status-tag">SECURE VAULT SESSION:</span>
  <span class="status-val">{{ vault_status }}</span>
</div>

</body>
</html>
"""


class SurveyHandler(tornado.web.RequestHandler):
    def get(self):
        calm = "Reads as measured and considered."
        neutral = "Reads as balanced and factual."
        urgent = "Reads as time-sensitive and high priority."

        mode_arg = self.get_argument("mode", "{{ calm }}")

        # Vulnerability: the requested "mode" value is spliced directly into
        # the template *source* before it's compiled.
        rendered_source = TEMPLATE_SOURCE.replace("MODE_PLACEHOLDER", mode_arg).replace(
            "MODE_INPUT_VALUE", mode_arg.replace('"', "&quot;")
        )

        try:
            compiled = tornado.template.Template(rendered_source)
        except Exception as e:
            self.write(f"<pre style='color:red;'>Template Error: {e}</pre>")
            return

        vault_status = "sealed"
        if self.get_secure_cookie("vault") == b"open":
            vault_status = FLAG
        else:
            self.set_secure_cookie("vault", "closed")

        try:
            output = compiled.generate(
                calm=calm,
                neutral=neutral,
                urgent=urgent,
                vault_status=vault_status,
                application=self.application,
            )
            self.write(output)
        except Exception as e:
            self.write(f"<pre style='color:red;'>Runtime Evaluation Error: {e}</pre>")


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
