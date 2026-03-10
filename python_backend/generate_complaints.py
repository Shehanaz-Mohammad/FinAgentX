import csv
import random
from faker import Faker

fake = Faker()

def generate_noise(text):
    """Randomly capitalizes letters to simulate noise."""
    return "".join(choice if random.random() > 0.1 else choice.upper() for choice in text)

def generate_complaints(num_complaints=500):
    with open('complaints.csv', 'w', newline='', encoding='utf-8') as csvfile:
        fieldnames = ['s.no', 'label', 'subject', 'body']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

        writer.writeheader()

        for i in range(1, num_complaints + 1):
            # Generate realistic complaint content
            subject_raw = fake.sentence(nb_words=6, variable_nb_words=True)
            body_raw = fake.paragraph(nb_sentences=5)
            
            # Add noise (capitalization)
            subject = generate_noise(subject_raw)
            body = generate_noise(body_raw)
            
            # Add HTML links and email addresses as noise
            if random.random() < 0.7:
                body += f" <a href='{fake.url()}'>Link</a>"
            if random.random() < 0.5:
                body += f" Contact me at {fake.email()}"
            
            writer.writerow({
                's.no': i,
                'label': 'complaint',
                'subject': subject,
                'body': body
            })

if __name__ == "__main__":
    generate_complaints()
    print("Generated 500 complaint emails in complaints.csv")
