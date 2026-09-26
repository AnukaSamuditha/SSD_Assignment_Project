import httpx
from io import BytesIO
from app.core.config import UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN


async def download_file(url: str) -> bytes:
    async with httpx.AsyncClient(timeout=60) as client:
        res = await client.get(url)
        res.raise_for_status()

        return res.content


async def check_chat_availability(key: str) -> bool:

    async with httpx.AsyncClient() as client:
        res = await client.get(
            f"{UPSTASH_REDIS_REST_URL}/EXISTS/{key}",
            headers={
                "Authorization": f"Bearer {UPSTASH_REDIS_REST_TOKEN}"
            }
        )
    data = res.json()
    return data["result"] == 1
