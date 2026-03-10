import os
from crewai import Agent, Task, Crew, Process
from crewai.tools import tool
# Configure Groq via LiteLLM
llm = "groq/llama-3.3-70b-versatile"

from mock_data import get_customer_by_name, get_customer_by_phone

# --- Custom Tools ---

@tool("Check CRM")
def check_crm_tool(name_or_phone: str):
    """Checks if the user exists in the CRM and checks KYC status."""
    user = get_customer_by_name(name_or_phone)
    if user:
        return f"User Found: {user['name']}, City: {user['city']}, KYC Verified. Credit Score: {user['credit_score']}"
    return "User not found in CRM."

@tool("Verify Document")
def verify_document_tool(filename: str):
    """Verifies a simulated uploaded document (e.g., salary slip). Returns stats."""
    if "salary" in filename.lower() or "slip" in filename.lower():
        return "VERIFIED: Document appears to be a valid Salary Slip. Extracted Income: 120,000/month."
    elif "aadhar" in filename.lower() or "id" in filename.lower():
        return "VERIFIED: Document appears to be a valid Identity Proof (Aadhar)."
    return "UNVERIFIED: Document type unclear. Please upload a Salary Slip or Aadhar."

@tool("Fetch Credit Report")
def fetch_credit_tool(pan_or_name: str):
    """Fetches credit score and history from Mock Credit Bureau."""
    from mock_data import get_credit_report
    report = get_credit_report(pan_or_name)
    return f"Credit Score: {report['score']}. History: {report['history']}."

@tool("Fetch Mock Offers")
def fetch_offers_tool(score: int):
    """Fetches pre-approved offers from Offer Mart based on credit score."""
    from mock_data import get_offers
    offers = get_offers(int(score))
    if offers:
        return f"Found {len(offers)} Pre-Approved Offers: " + ", ".join([o['offer'] for o in offers])
    return "No pre-approved offers found for this score."

@tool("Underwrite Loan")
def underwrite_tool(name: str, loan_amount: int, tenure_years: int):
    """
    Validates loan eligibility based on strict rules:
    - If Amount <= Pre-Approved Limit: Approve.
    - If Amount <= 2x Limit: Request Salary Slip.
    - If Amount > 2x Limit OR Score < 700: Reject.
    """
    user = get_customer_by_name(name)
    if not user:
        return "User not found for underwriting."
        
    limit = user['pre_approved_limit']
    score = user['credit_score']
    salary = user['salary']
    
    # Check external mock API
    # (Simulating that we use the new tools internally or distinct step)
    
    if score < 700:
        return f"REJECT: Credit Score {score} is below 700."
    
    # Determine Rate based on Score
    approved_rate = 14.0 # Default
    if score >= 800:
        approved_rate = 10.5
    elif score >= 750:
        approved_rate = 11.5
    elif score >= 700:
        approved_rate = 13.0

    if loan_amount <= limit:
        return f"APPROVE: Amount {loan_amount} is within limit. Approved Rate: {approved_rate}%"
        
    elif loan_amount <= 2 * limit:
        r = 0.14 / 12
        n = tenure_years * 12
        emi = loan_amount * r * ((1 + r)**n) / (((1 + r)**n) - 1)
        
        if emi <= 0.5 * salary:
            return f"CONDITIONAL_APPROVAL: Request Salary Slip. EMI {int(emi)} is affordable (Salary {salary})."
        else:
            return f"REJECT: EMI {int(emi)} exceeds 50% of salary {salary}."
    else:
        return f"REJECT: Amount {loan_amount} exceeds 2x limit of {limit}."

def run_loan_crew(task_type, inputs):
    # 1. Define Agents with Tools
    sales_agent = Agent(
        role='Loan Sales Specialist',
        goal='Analyze requirements and explain terms.',
        backstory='Expert financial advisor.',
        verbose=True,
        llm=llm
    )

    verifier = Agent(
        role='KYC Verifier',
        goal='Check CRM for user existence and Verify Documents.',
        backstory='Strict compliance officer.',
        tools=[check_crm_tool, verify_document_tool],
        verbose=True,
        llm=llm
    )

    underwriter = Agent(
        role='Senior Underwriter',
        goal='Approve or Reject based on strict policy using Credit Bureau and Offer Mart.',
        backstory='Risk manager who follows the credit policy handbook.',
        tools=[underwrite_tool, fetch_credit_tool, fetch_offers_tool],
        verbose=True,
        llm=llm
    )

    # 2. Define Tasks
    tasks = []
    
    if task_type == 'sales':
        # Simple calculation task
        tasks.append(Task(
            description=f"Calculate EMI for {inputs.get('amount')} loan for {inputs.get('tenure')} years at 14%.",
            agent=sales_agent,
            expected_output="EMI calculation summary."
        ))
        
    elif task_type == 'verification':
        user_text = inputs.get('employment_type', '') 
        user_name = inputs.get('name', '')
        # Check if we have a file upload in inputs
        filename = inputs.get('filename', '')
        
        # Use explicit name if available, otherwise rely on extraction from text
        target = user_name if user_name else user_text
        
        desc = f"Check if user '{target}' exists in the CRM."
        if filename:
            desc += f" ALSO, Verify the uploaded document: {filename}."
        if filename:
            desc += f" ALSO, Verify the uploaded document: {filename}."

        tasks.append(Task(
            description=desc,
            agent=verifier,
            expected_output="KYC Status (Found/Not Found) + Document Verification Result."
        ))

    elif task_type == 'underwriting':
        context = inputs.get('context', '')
        
        tasks.append(Task(
            description=f"Run underwriting for 'Krish'. 1. Fetch Credit Score (Mock Bureau). 2. Fetch Pre-Approved Offers (Offer Mart). 3. Make Final Decision based on context: {context}. Use Defaults: Amount=500000, Tenure=5 if unclear.",
            agent=underwriter,
            expected_output="Final Decision (APPROVE/REJECT/CONDITIONAL) with Credit Score and Offer details."
        ))
        
    # 3. Create Crew
    crew = Crew(
        agents=[sales_agent, verifier, underwriter],
        tasks=tasks,
        verbose=True,
        process=Process.sequential,
        # max_rpm=10
    )

    result = crew.kickoff()
    return result
