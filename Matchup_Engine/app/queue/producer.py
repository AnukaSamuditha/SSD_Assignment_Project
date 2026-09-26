from app.core.rabbitmq import get_channel
from pydantic import BaseModel
import json
from app.core.config import PRODUCER_QUEUE
from aio_pika import Message, DeliveryMode
import logging

class ResumeUpdate(BaseModel):
    resume_data : dict
    application_id : str


async def publish_resume_result(resume_data : dict, application_id : str):
    channel = get_channel()

    if channel is None:
        logging.error("No channel is available")
        return

    queue = await channel.declare_queue(PRODUCER_QUEUE,durable=True)

    data : ResumeUpdate = ResumeUpdate(
        resume_data=resume_data,
        application_id=application_id
    )

    message_body = json.dumps(data.model_dump()).encode("utf-8")

    message = Message(
        body=message_body,
        content_type="application/json",
        delivery_mode=DeliveryMode.PERSISTENT
    )

    await channel.default_exchange.publish(
        message,
        routing_key=queue.name
    )