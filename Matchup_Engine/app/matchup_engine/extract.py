from llama_cloud_services import LlamaExtract, SourceText
from pydantic import BaseModel, Field

from dotenv import load_dotenv

load_dotenv()

extractor = LlamaExtract()

agent = None


class ExtractContent(BaseModel):
    location: str | None = Field(description="City, country or region")
    skills: list[str] = Field(
        description="Technical skills and technologies including frameworks and programming languages")
    working_experience: list[str] | None = Field(
        description="Work experience with role, duration, responsibilities")
    education: list[str] = Field(
        description="Education details including degree, institution, and specialization")
    certifications: list[str] | None = Field(
        description="Professional certifications or licenses")
    projects: list[str] | None = Field(
        description="Notable academic or professional projects")
    languages: list[str] | None = Field(description="Spoken languages")


async def init_agent():
    global agent

    if agent is not None:
        return

    agents = extractor.list_agents()

    for a in agents:
        if a.name == "resume-extractor":
            agent = a
            break

    if agent is None:
        agent = extractor.create_agent(
            name="resume-extractor", data_schema=ExtractContent
        )


async def extract_content(content: bytes | str, filename: str = "document.pdf"):

    if agent is None:
        raise RuntimeError("Agent is not initialized to extract content!")

    result = None

    if isinstance(content, bytes):
        result = agent.extract(SourceText(file=content, filename=filename))
    elif isinstance(content, str):
        result = agent.extract(SourceText(text_content=content))
    else:
        print("content type : ",type(content))
        raise ValueError("Unsupported content type")

    return result.data
