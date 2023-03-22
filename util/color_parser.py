import colorama as clr

default_color = {
    "gray": ["EEEEEE", "7F7F7F", "4A4A4A", "222222"],
    "yellow": ["F5F071", "E2DB13", "817C00", "323000"],
    "lime green": ["CBF66F", "A0EA00", "577D0", "375000"],
    "green": ["68FF88", "19E753", "0E8031", "064023"],
    "cyan": ["7EEDED", "2CE6E6", "118787", "0A4444"],
    "blue": ["4C6FE3", "0A3EE2", "0F2E91", "0A1D5A"],
    "violet": ["AE79F0", "7514ED", "500AA6", "35086C"],
    "magenta": ["EE7BF0", "CF11D2", "720A74", "520653"],
    "red": ["F06767", "D02525", "7C0000", "560202"],
    "orange": ["EEAF5C", "DF7F00", "673B00", "472800"]
}
color_aliases = {
    "gray": ["grey"],
    "lime green": [
        "limegreen",
        "lime",
        "yellowgreen",
        "yellow-green",
        "yellow green",
        "greenyellow",
        "green-yellow",
        "green yellow"
    ],
    "cyan": ["aqua"],
    "violet": ["purple"]
}
extra_colors = {
    "white": "EEEEEE",
    "black": "222222",
    "pink": "EE7BF0",
    "pureblack": "000000",
    "pure black": "000000",
    "purewhite": "FFFFFF",
    "pure white": "FFFFFF",
    "puregray": "888888",
    "pure gray": "888888",
    "puregrey": "888888",
    "pure grey": "888888",
    "purered": "FF0000",
    "pure red": "FF0000",
    "puregreen": "00FF00",
    "pure green": "00FF00",
    "pureblue": "0000FF",
    "pure blue": "0000FF",
    "pureyellow": "FFFF00",
    "pure yellow": "FFFF00",
    "purecyan": "00FFFF",
    "pure cyan": "00FFFF",
    "puremagenta": "FF00FF",
    "pure magenta": "FF00FF",
    "pureorange": "FFA500",
    "pure orange": "FFA500"
}

all_colors = {}
for color in default_color:
    for variation in ([color]+color_aliases[color] if color in color_aliases else [color]):
        all_colors[variation] = default_color[color][1]
        all_colors["light "+variation] = default_color[color][0]
        all_colors["pale "+variation] = default_color[color][0]
        all_colors["normal "+variation] = default_color[color][1]
        all_colors["mid "+variation] = default_color[color][1]
        all_colors["dim "+variation] = default_color[color][2]
        all_colors["dark "+variation] = default_color[color][3]
        all_colors[variation+" 1"] = default_color[color][0]
        all_colors[variation+" 2"] = default_color[color][1]
        all_colors[variation+" 3"] = default_color[color][2]
        all_colors[variation+" 4"] = default_color[color][3]
for color in extra_colors:
    all_colors[color] = extra_colors[color]


def rgb_to_hex(r, g, b):
    return '%02x%02x%02x' % (r, g, b)


clr.init()


def parse(color):
    if color[0] == '#':
        return color[1:]
    if type(color) == tuple:
        return rgb_to_hex(*color).upper()
    if color.lower() in all_colors:
        return all_colors[color.lower()]
    for char in color:
        if char not in '0123456789abcdefABCDEF':
            print(clr.Fore.RED + 'Invalid color: ' +
                  color + clr.Style.RESET_ALL)
            return '000000'
    return color
