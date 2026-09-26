import asyncio
from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.core.rabbitmq import connect_rabbitmq, close_connection
from app.queue.consumer import consume_resume
from app.matchup_engine.extract import init_agent


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_rabbitmq()
    await init_agent()
    task = asyncio.create_task(consume_resume())
    try:
        yield
    finally:
        task.cancel()
        await task
    await close_connection()

app = FastAPI(lifespan=lifespan)


@app.get("/")
async def check_api():
    return {"message": "API is running..."}
