from flask import Flask, render_template, redirect, make_response
from util import sm_folder, project_util

# download https://raw.githubusercontent.com/micku7zu/vanilla-tilt.js/master/dist/vanilla-tilt.js into UI/static/scripts/vanilla-tilt.js

import requests
import os

if not os.path.exists('UI/static/scripts/'):
    os.mkdir('UI/static/scripts/')
if not os.path.exists('UI/static/scripts/vanilla-tilt.js'):
    r = requests.get(
        'https://raw.githubusercontent.com/micku7zu/vanilla-tilt.js/master/dist/vanilla-tilt.js')
    with open('UI/static/scripts/vanilla-tilt.js', 'w', encoding='utf8') as f:
        f.write(r.text)

app = Flask(__name__, template_folder='UI', static_folder='UI/static')


@app.route("/")
async def index():
    projects: list[project_util.Project] = project_util.get_projects()
    resp = make_response(render_template('index.html', projects=projects))
    resp.headers['Cache-Control'] = 'no-cache'
    return resp


@app.route("/editor/<uuid>")
async def editor(uuid: str):
    projects: list[project_util.Project] = project_util.get_projects()
    for project in projects:
        if project.uuid == uuid:
            return render_template('editor.html', project=project)
    return redirect('/')

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8080, debug=True)
