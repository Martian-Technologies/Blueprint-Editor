import json
import os
import uuid
from enum import Enum


class LogicGates(Enum):
    BUFFER = 1  # virtual gate with 0 delay
    NOT = 2  # creates copy of input with inverted inversion ex. XNOR -> XOR
    AND = 3
    NAND = 4
    OR = 5
    NOR = 6
    XOR = 7
    XNOR = 8
    TIMER = 9
    ADD = 10
    SUB = 11
    MUL = 12
    DIV = 13
    MOD = 14
    POW = 15
    ROOT = 16
    ABS = 17
    HYPOT = 18
    LOG = 19
    FACT = 20
    EXP = 21
    BIT = 22
    FLOOR = 23
    ROUND = 24
    CEIL = 25
    MIN = 26
    MAX = 27
    PID = 28
    SIN = 29
    COS = 30
    TAN = 31
    ASIN = 32
    ACOS = 33
    ATAN = 34
    ATAN2 = 35
    PI = 36
    RAND = 37
    SGN = 38
    GREQU = 39
    LSEQU = 40
    GRTR = 41
    LESS = 42
    EQU = 43
    NEQU = 44
    CONT = 45
    SEAT = 46
    AD = 47
    WS = 48
    COUNT = 49
    MEMP = 50
    STIMER = 51
    TICK = 52


class Project(object):
    def __init__(self, filename: str | None = None):
        if filename is not None:
            self.loadfile(filename)
        else:
            self.filename = None
            self.name = None
            self.description = None
            self.uuid = str(uuid.uuid4())
            self.type = None
            self.data = None

    def loaddata(self, data: dict):
        self.name = data['name']
        self.description = data['description']
        self.uuid = data['uuid']
        self.type = data['type']
        if self.filename is None:
            self.filename = f'{self.uuid}.json'
        print(json.dumps(data, indent=4))
        if self.type == 'logic':
            save_blocks = []
            for block in data['data']:
                save_blocks.append(
                    LogicBlock(
                        type=LogicGates(block['type']),
                        x=block['x'],
                        y=block['y'],
                        id=block['id'],
                        inputs=block['inputs'],
                        outputs=block['outputs']
                    )
                )
            self.data = save_blocks
        else:
            raise ValueError(f'Unknown project type {self.type}')

    def loadjson(self, json_data: str):
        data = json.loads(json_data)
        self.loaddata(data)

    def loadfile(self, filename: str):
        self.filename = filename
        with open(filename, 'r') as f:
            self.loadjson(f.read())

    def setInfo(self, name: str | None = None, description: str | None = None, type: str | None = None, data: str | None = None):
        self.name = name
        self.description = description
        self.type = type
        self.data = data

    def pack(self):
        if self.type == 'logic':
            packed_data = []
            for block in self.data:
                packed_data.append({
                    'type': block.type.value,
                    'x': block.x,
                    'y': block.y,
                    'id': block.id,
                    'inputs': block.inputs,
                    'outputs': block.outputs,
                })
        else:
            raise ValueError(f'Unknown project type {self.type}')
        return {
            'name': self.name,
            'description': self.description,
            'uuid': self.uuid,
            'type': self.type,
            'data': packed_data,
        }

    def save(self):
        if self.filename is None:
            self.filename = os.path.join('projects', f'{self.uuid}.json')
        with open(self.filename, 'w') as f:
            json.dump(self.pack(), f, indent=4)

    def __str__(self) -> str:
        return f'{self.name} ({self.uuid})'


class LogicBlock(object):
    def __init__(self, type: LogicGates | str, x: float, y: float, id: int | None = None, inputs: list[int] | None = None, outputs: list[int] | None = None):
        self.type = type
        self.x = x
        self.y = y
        self.id = id
        self.inputs = inputs
        self.outputs = outputs


def get_projects() -> list[Project]:
    projects = []
    for filename in os.listdir('projects'):
        if filename.endswith('.json'):
            projects.append(
                Project(filename=os.path.join('projects', filename)))
    return projects
