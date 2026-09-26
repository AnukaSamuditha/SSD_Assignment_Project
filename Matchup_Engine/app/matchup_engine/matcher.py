from app.matchup_engine.schemas import MatchResult
from app.matchup_engine.groq_instance import llm
from langchain_community.chat_message_histories import UpstashRedisChatMessageHistory
from langchain_core.runnables import RunnableLambda, RunnableWithMessageHistory, RunnableParallel
from langchain.messages import HumanMessage, AIMessage, SystemMessage
from langchain_core.chat_history import BaseChatMessageHistory
from app.core.config import UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
from app.matchup_engine.prompts import initial_comparison_template, continuation_template
import logging
from inscriptis import get_text
from app.matchup_engine.utils import download_file, check_chat_availability
from app.matchup_engine.extract import extract_content
from app.queue.producer import publish_resume_result


async def match_resume(resume, job_description, post_id):
    try:
        if resume is None or job_description is None:
            logging.error("Missing required fields")
            return

        structured_llm = llm.with_structured_output(MatchResult)

        chatID = post_id

        chat_history = UpstashRedisChatMessageHistory(
            session_id=str(chatID),
            url=UPSTASH_REDIS_REST_URL,
            token=UPSTASH_REDIS_REST_TOKEN
        )

        chain = (
            {
                "resume": RunnableLambda(lambda x: x["resume"]),
                "job_description": RunnableLambda(lambda x: x["job_description"])
            }
            | initial_comparison_template
            | structured_llm
        )

        result = await chain.ainvoke({
            "resume": resume,
            "job_description": job_description
        })

        prompt_messages = initial_comparison_template.format_messages(
            resume=resume,
            job_description=job_description
        )
        system_message_prompt = prompt_messages[0].content
        human_message_text = f"Resume:\n{resume}\n Job Description:\n{job_description}"

        chat_history.add_message(SystemMessage(system_message_prompt))
        chat_history.add_message(HumanMessage(human_message_text))
        chat_history.add_message(AIMessage(str(result)))

        return {
            "chat_id": chatID,
            "result": result
        }
    except Exception as e:
        logging.exception(f"Error matching the resume with job description : {e}")
        raise


async def continue_matching(chatID, resume):
    try:
        if chatID is None:
            logging.error("Missing required fields")
            return

        structured_llm = llm.with_structured_output(MatchResult)

        def get_session_history(session_id: str) -> BaseChatMessageHistory:
            return UpstashRedisChatMessageHistory(
                session_id=session_id,
                url=UPSTASH_REDIS_REST_URL,
                token=UPSTASH_REDIS_REST_TOKEN
            )

        chain = continuation_template | structured_llm

        chain_with_history = RunnableWithMessageHistory(
            chain,
            get_session_history=get_session_history,
            input_messages_key="resume",
            history_messages_key="history"
        )

        result = await chain_with_history.ainvoke({
            "resume": resume
        }, config={"session_id": str(chatID)})

        return {
            "chatID": chatID,
            "result": result
        }

    except Exception as e:
        logging.exception(f"Error matching the resume : {e}")
        raise


async def rate_resume(data: dict):
    if data is None:
        logging.error("Missing required data!")

    resume_pdf = await download_file(data["resumeURL"])
    description_text = get_text(data["description"])

    async def resume_extract_fn(_):
        return {"resume_content": await extract_content(resume_pdf,filename=data["file_name"])}

    async def description_extract_fn(_):
        return {"description_content": await extract_content(description_text)}

    resume_extract_step = RunnableLambda(resume_extract_fn)
    description_extract_step = RunnableLambda(description_extract_fn)

    post_id = data["postID"]
    session_available = await check_chat_availability(post_id)

    if session_available == False:
        async def rate_resume_fn(inputs):
            return await match_resume(
                resume=inputs["resume_content"],
                job_description=inputs["description_content"],
                post_id=post_id)
    else:
        async def rate_resume_fn(inputs):
            return await continue_matching(
                chatID=post_id, resume=inputs["resume_content"])

    rate_resume_step = RunnableLambda(rate_resume_fn)

    extract_chain = RunnableParallel(
        resume_content=resume_extract_step,
        description_content=description_extract_step
    )

    chain = (extract_chain | rate_resume_step)

    res = await chain.ainvoke({})

    if res is None:
        logging.error("Resume matching failed : Response is none")
        return

    await publish_resume_result(resume_data=res["result"].model_dump(),application_id=data["applicationID"])
    
