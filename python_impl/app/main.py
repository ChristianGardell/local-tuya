from fastapi import FastAPI

from .routes.tuya import router as tuya_router

app = FastAPI()
app.include_router(tuya_router)
