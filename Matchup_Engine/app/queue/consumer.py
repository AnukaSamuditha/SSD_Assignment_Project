from app.core.rabbitmq import get_channel
from aio_pika import IncomingMessage
from app.core.config import QUEUE_NAME
from app.matchup_engine.matcher import rate_resume
import asyncio
import json

semaphore = asyncio.Semaphore(5)


async def send_resume(resume: IncomingMessage):
    async with resume.process():
        async with semaphore:
            data = json.loads(resume.body)
            await rate_resume(data)
                


async def consume_resume():
    channel = get_channel()

    queue = await channel.declare_queue(QUEUE_NAME, durable=True)

    await queue.consume(send_resume)

    await asyncio.Future()
