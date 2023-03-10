import os
import sm_folder


def getBlueprints():
    bpFolder = sm_folder.getBlueprintsFolder()
    contents = os.listdir(bpFolder)
    blueprints = []
    for item in contents:
        # continue if item is not a folder
        if not os.path.isdir(os.path.join(bpFolder, item)):
            continue
        # continue if folder does not contain a description.json and a blueprint.json
        if not os.path.exists(os.path.join(bpFolder, item, 'description.json')) or not os.path.exists(os.path.join(bpFolder, item, 'blueprint.json')):
            continue
        blueprints.append(item)
    return blueprints


if __name__ == '__main__':
    print(getBlueprints())
