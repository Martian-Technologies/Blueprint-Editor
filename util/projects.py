import json
import os


class Project(object):
    def __init__(self, filename: str | None = None):
        if filename is not None:
            self.load(filename)
        else:
            self.filename = None
            self.name = None
            self.description = None

    def load(self, filename: str):
        self.filename = filename
        with open(filename, 'r') as f:
            data = json.load(f)
        self.name = data['name']
        self.description = data['description']


def get_projects() -> list[Project]:
    projects = []
    for filename in os.listdir('projects'):
        if filename.endswith('.json'):
            projects.append(
                Project(filename=os.path.join('projects', filename)))
    return projects
