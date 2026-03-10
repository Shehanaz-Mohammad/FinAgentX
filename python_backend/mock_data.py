import random

def generate_mock_customers():
    cities = ["Mumbai", "Delhi", "Bangalore", "Chennai", "Hyderabad", "Pune"]
    names = ["Aarav", "Vihaan", "Aditya", "Sai", "Arjun", "Ananya", "Diya", "Saanvi", "Ira", "Myra"]
    last_names = ["Sharma", "Verma", "Gupta", "Malhotra", "Iyer", "Patel", "Singh", "Reddy", "Das", "Nair"]
    
    customers = []
    
    # Specific known users for testing
    # Specific known users for testing
    customers.append({
        "name": "Krish",
        "age": 30,
        "city": "Bangalore",
        "phone": "9999999999",
        "salary": 100000,
        "credit_score": 750,
        "pre_approved_limit": 500000,
        "current_loans": 0
    })
    
    customers.append({
        "name": "Koushik",
        "age": 32,
        "city": "Hyderabad",
        "phone": "8888888888",
        "salary": 120000,
        "credit_score": 780,
        "pre_approved_limit": 800000,
        "current_loans": 0
    })
    
    for i in range(49):
        name = f"{random.choice(names)} {random.choice(last_names)}"
        customers.append({
            "name": name,
            "age": random.randint(22, 55),
            "city": random.choice(cities),
            "phone": f"98{random.randint(10000000, 99999999)}",
            "salary": random.choice([50000, 80000, 120000, 150000, 200000]),
            "credit_score": random.randint(600, 850),
            "pre_approved_limit": random.choice([200000, 500000, 1000000]),
            "current_loans": random.randint(0, 50000)
        })
        
    return customers

MOCK_DB = generate_mock_customers()

def get_customer_by_phone(phone):
    # For demo, match any partial phone or just return the first one if not found
    for c in MOCK_DB:
        if phone in c['phone']:
            return c
    # Fallback to 'Krish' for easy demo if verification fails
    return MOCK_DB[0]

def get_customer_by_name(name):
    for c in MOCK_DB:
        if name.lower() in c['name'].lower():
            return c
    return None

# --- Mock Credit Bureau API ---
CREDIT_BUREAU = {
    "PAN12345": {
        "score": 780,
        "history": "Clean payment history. No defaults.",
        "accounts": 3,
        "utilization": "15%"
    },
    "PAN_DEF": {
        "score": 620,
        "history": "2 Late payments in last 6 months.",
        "accounts": 5,
        "utilization": "80%"
    }
}

# --- Mock Offer Mart Server ---
OFFER_MART = [
    {"min_score": 750, "offer": "Platinum Loan: 10 Lakhs @ 10.5% Interest", "code": "PLAT10"},
    {"min_score": 700, "offer": "Gold Loan: 5 Lakhs @ 12% Interest", "code": "GOLD12"},
    {"min_score": 650, "offer": "Silver Loan: 2 Lakhs @ 15% Interest", "code": "SILVER15"}
]

def get_credit_report(input_id):
    # Match any input to safe default or random
    if "DEF" in input_id:
        return CREDIT_BUREAU["PAN_DEF"]
    return CREDIT_BUREAU["PAN12345"]

def get_offers(score):
    return [o for o in OFFER_MART if score >= o['min_score']]
