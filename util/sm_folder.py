import os

# Looking for %appdata%/Axolot Games/Scrap Mechanic/User/User_*/Blueprints/


def getBlueprintsFolder():
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


if __name__ == '__main__':
    print(getBlueprintsFolder())
