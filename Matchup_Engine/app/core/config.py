import os
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
REDIS_URL = os.getenv("REDIS_URL")
UPSTASH_REDIS_REST_URL = os.getenv("UPSTASH_REDIS_REST_URL")
UPSTASH_REDIS_REST_TOKEN = os.getenv("UPSTASH_REDIS_REST_TOKEN")
CLOUDAMQP_URL = os.getenv("CLOUDAMQP_URL")
QUEUE_NAME = os.getenv("QUEUE_NAME")
PRODUCER_QUEUE = os.getenv("PRODUCER_QUEUE")
DATABASE_URL = os.getenv("DATABASE_URL")