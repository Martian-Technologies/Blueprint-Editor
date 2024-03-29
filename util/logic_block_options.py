from enum import Enum
import json


def get_blocks():
    with open('util/logic_blocks.json', 'r', encoding='utf8') as f:
        blocks = json.load(f)
    return blocks


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
    SENDROUTER = 53
    RECEIVEROUTER = 54
