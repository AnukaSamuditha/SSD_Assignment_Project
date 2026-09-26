from aio_pika import connect_robust, RobustConnection, RobustChannel
import logging
from app.core.config import CLOUDAMQP_URL

connection: RobustConnection | None = None
channel: RobustChannel | None = None


async def connect_rabbitmq():
    global connection, channel

    connection = await connect_robust(CLOUDAMQP_URL)
    channel = await connection.channel()

    logging.info("Connected to RabbitMQ...")


async def close_connection():
    global connection

    if connection:
        await connection.close()
        logging.info("RabbitMQ connection closed...")


def get_channel() -> RobustChannel:

    global channel

    if channel is None:
        raise RuntimeError("RabbitMQ channel is not initialized!")

    return channel
