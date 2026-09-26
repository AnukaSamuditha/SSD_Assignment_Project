import asyncio
from app.core.rabbitmq import connect_rabbitmq, close_connection
from app.queue.consumer import consume_resume
from app.matchup_engine.extract import init_agent


async def main():
    await connect_rabbitmq()
    await init_agent()

    try:
        await consume_resume()
    except asyncio.CancelledError:
        pass
    finally:
        await close_connection()


if __name__ == "__main__":
    asyncio.run(main())