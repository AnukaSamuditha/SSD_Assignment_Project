import httpx
from io import BytesIO
from urllib.parse import urlparse
from app.core.config import UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN

# SECURITY FIX (SSRF, CWE-918): download_file() previously fetched any URL
# with no restriction at all. Resume URLs only ever come from our own
# Cloudinary uploads (see Matchup_API/utils/uploadFile.go), so if the
# RabbitMQ trust boundary is ever crossed - leaked credentials, a compromised
# producer - an attacker-controlled URL here could reach internal services
# or cloud metadata endpoints. Only Cloudinary's delivery host is trusted.
ALLOWED_DOWNLOAD_HOSTS = {"res.cloudinary.com"}


async def download_file(url: str) -> bytes:
    parsed = urlparse(url)

    if parsed.scheme != "https" or parsed.hostname not in ALLOWED_DOWNLOAD_HOSTS:
        raise ValueError(f"refusing to download from untrusted source: {url}")

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
