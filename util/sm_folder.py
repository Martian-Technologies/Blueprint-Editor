import os


def getBlueprintsFolder():  # Looking for %appdata%/Axolot Games/Scrap Mechanic/User/User_*/Blueprints/
    appdata = os.getenv('APPDATA')
    if not appdata:
        raise Exception('APPDATA environment variable not found')
    userFolder = os.path.join(appdata, 'Axolot Games',
                              'Scrap Mechanic', 'User')
    if not os.path.exists(userFolder):
        raise Exception('User folder does not exist')
    if len(os.listdir(userFolder)) == 0:
        raise Exception('User folder contains no users')
    bpFolder = os.path.join(
        userFolder, os.listdir(userFolder)[0], 'Blueprints')
    if not os.path.exists(bpFolder):
        raise Exception('Blueprints folder does not exist')
    return bpFolder


def getBlueprints():  # Looking for all blueprint folders in blueprints folder
    bpFolder = getBlueprintsFolder()
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
    print(getBlueprintsFolder())
    print(getBlueprints())
