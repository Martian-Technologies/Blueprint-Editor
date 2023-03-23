
#  _____       _____  _____  _____  _____    _____  __     _____  _____  _____  _____  _____  _____  _____    _____  ____   _____  _____  _____  _____
# |     | ___ |_   _||   __||     ||  |  |  | __  ||  |   |  |  ||   __||  _  || __  ||     ||   | ||_   _|  |   __||    \ |     ||_   _||     || __  |
# | | | ||___|  | |  |   __||   --||     |  | __ -||  |__ |  |  ||   __||   __||    -||-   -|| | | |  | |    |   __||  |  ||-   -|  | |  |  |  ||    -|
# |_|_|_|       |_|  |_____||_____||__|__|  |_____||_____||_____||_____||__|   |__|__||_____||_|___|  |_|    |_____||____/ |_____|  |_|  |_____||__|__|

from flask import Flask, render_template, redirect, make_response, jsonify, request
from util import sm_folder, project_util, logic_block_options
import requests
import os


app = Flask(__name__, template_folder='UI', static_folder='UI/static')

projects_dirty = True
projects: list[project_util.Project] = []


def get_projects() -> list[project_util.Project]:
    global projects_dirty
    global projects
    if projects_dirty:
        projects_dirty = True
        projects = []
        for file in os.listdir('projects'):
            if file.endswith('.json'):
                projects.append(project_util.Project(
                    os.path.join('projects', file)))
    return projects


@app.route("/")
async def index():
    projects = get_projects()
    resp = make_response(render_template('index.html', projects=projects))
    resp.headers['Cache-Control'] = 'no-cache'
    return resp


@app.route("/logic/block_options")
async def get_logic_block_options():
    resp = make_response(jsonify(logic_block_options.get_blocks()))
    resp.headers['Cache-Control'] = 'no-cache'
    return resp


@app.route("/editor/<uuid>")
async def editor(uuid: str):
    projects = get_projects()
    for project in projects:
        if project.uuid == uuid:
            if project.type == 'logic':
                return render_template('logic_editor.html', project=project)
            else:
                return 'Unknown project type', 500
    return redirect('/')


@app.route("/editor/<uuid>/get")
async def get_project(uuid: str):
    projects = get_projects()
    for project in projects:
        if project.uuid == uuid:
            proj = project
            break
    else:
        return 'Project not found', 404
    return jsonify(proj.pack())


@app.route("/editor/<uuid>/save", methods=['POST'])
async def save_project(uuid: str):
    projects = get_projects()
    for project in projects:
        if project.uuid == uuid:
            proj = project
            break
    else:
        return 'Project not found', 404
    proj.loaddata(request.get_json())
    proj.save()
    return 'Saved', 200

if __name__ == '__main__':

    if not os.path.exists('UI/static/scripts/'):
        os.mkdir('UI/static/scripts/')
    if not os.path.exists('UI/static/scripts/vanilla-tilt.js'):
        r = requests.get(
            'https://raw.githubusercontent.com/micku7zu/vanilla-tilt.js/master/dist/vanilla-tilt.js', headers={'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.75 Safari/537.36'})
        with open('UI/static/scripts/vanilla-tilt.js', 'w', encoding='utf8') as f:
            f.write(r.text)
    app.run(host='127.0.0.1', port=8080, debug=True)
