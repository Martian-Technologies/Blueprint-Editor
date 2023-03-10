from flask import Flask, render_template, redirect, make_response
import util.sm_folder
import util.projects

app = Flask(__name__, template_folder='UI', static_folder='UI/static')


@app.route("/")
async def index():
    projects: list[util.projects.Project] = util.projects.get_projects()
    resp = make_response(render_template('index.html', projects=projects))
    resp.headers['Cache-Control'] = 'no-cache'
    return resp

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8080, debug=True)
