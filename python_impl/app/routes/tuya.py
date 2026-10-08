from fastapi import APIRouter

from ..services import tuyaController as device

router: APIRouter = APIRouter(prefix="/tuya", tags=["tuya"])


@router.get("/status")
def get_device_status():
    return device.get_status()


@router.post("/turnon")
def turn_on_device():
    device.turn_on()


@router.post("/turnoff")
def turn_off_device():
    device.turn_off()


@router.post("/brightness/{value}")
def set_brightness(value: int):
    device.set_brightness(value)


@router.post("/colortemp/{value}")
def set_colortemp(value: int):
    device.set_colortemp(value)


@router.post("/toggle")
def toggle_device():
    device.toggle()

@router.post("/sunrise/{minutes}")
def sunrise(minutes: int):
    device.sunrise(minutes)    