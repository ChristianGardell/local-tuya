import tinytuya
import time

from ..config.config import DEVICE_ID, DEVICE_IP, LOCAL_KEY, VERSION

d = tinytuya.BulbDevice(
    dev_id=DEVICE_ID, address=DEVICE_IP, local_key=LOCAL_KEY, version=VERSION
)


def turn_on():
    d.turn_on()


def turn_off():
    d.turn_off()


# 10 to 1000, scale 1
def set_brightness(value: int) -> None:
    d.set_brightness(value)


# 0 to 1000, scale 1
def set_colortemp(value: int) -> None:
    d.set_colourtemp(value)


def get_status():
    data = d.status()
    print(data)
    return data


def toggle() -> None:
    data = get_status()
    if data["dps"]["20"]:
        turn_off()
    else:
        turn_on()


# steps are set to 100 by default
def sunrise(minutes: int = 30) -> None:
    print(f'this is the minute: {minutes}')
    steps = 100
    delay: float = (minutes * 60) / steps
    set_colortemp(0)
    set_brightness(0)
    turn_on()
    for n in range(1, steps + 1):
        print(f'Loop: {n}, sum: {10 * n}')
        set_colortemp(10 * n)
        set_brightness(10 * n)
        time.sleep(delay)
        
