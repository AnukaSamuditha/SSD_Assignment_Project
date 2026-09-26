from pydantic import BaseModel, Field

class MatchResult(BaseModel):
    
    match_score : int = Field(
        description="Overall match score from 0 to 100"
    )
    matched_skills : list[str] = Field(
        description="Skills present in both resume and job description"
    )
    missing_skills : list[str] = Field(
        description="Important skills missing from the resume"
    )
    experience_evaluation : str = Field(
        description="Evaluation of experience alignment"
    )
    education_evaluation : str = Field(
        description="Evaluation of education alignment"
    )