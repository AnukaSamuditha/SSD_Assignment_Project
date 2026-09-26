from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

initial_comparison_template = ChatPromptTemplate.from_messages(
    [
        ("system", "You are an ATS (Applicant Tracking System)."
         "You evaluate resumes objectively and consistenly."
         "Compare the following resume and job description."
         """ Your task:
        - Evaluate how well the resume matches the job description.
        - Consider relevance of skills, working experiences, education.
        - Provide a matching score from 0 to 100.
        Instructions:
        - Do not guess or assume missing information.
        - Base the evaluation strictly on the provided content.
        """),
        ("human", """ 
        - RESUME:
         {resume}

        - JOB DESCRIPTION:
         {job_description}
        """)
    ]
)

continuation_template = ChatPromptTemplate.from_messages([
    MessagesPlaceholder("history"),
    ("system", """ 
     Continue the resume evaluation.
     Instructions:
     - Do not restate the job description.
     - Do not repeat previous resume evaluations.
     - Evaluate this resume independently.
     - Use the same scoring standards as earlier evaluations.

     NEW RESUME:
     {resume}
    """)
])
