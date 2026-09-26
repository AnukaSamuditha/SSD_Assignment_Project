from langchain_groq import ChatGroq


llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    temperature=0.5,
    max_tokens=1000,
    timeout=None,
    max_retries=2,
)
