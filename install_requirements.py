import pip
import os


def install(package):
    pip.main(['install', package])


def install_requirements():
    requirements = os.path.join(os.path.dirname(
        os.path.realpath(__file__)), 'requirements.txt')
    with open(requirements) as f:
        for line in f:
            install(line)


if __name__ == '__main__':
    install_requirements()
