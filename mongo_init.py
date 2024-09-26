import os
import json
from pymongo import MongoClient

# MongoDB setup
# Replace with your MongoDB URI, e.g., mongodb://localhost:27017/ or MongoDB Atlas URI
mongo_uri = "mongodb://localhost:27017/"
client = MongoClient(mongo_uri)

# Define the database and collection
db = client['aleph_db']
collection = db['ptr_data']

# Path to the directory containing subdirectories
base_dir = '/home/kedar/beyondregex/validation_output'  # Replace with the path to your directory

# Define the subdirectories to process
data_types = {
    'hints': 'hints',
    'classifications_new': 'classifications'
}

# Dictionary to store data before inserting into MongoDB
asn_data = {}

# Process hints and classifications, but skip regex
for data_type, field_name in data_types.items():
    subdir_path = os.path.join(base_dir, data_type)

    # Iterate over each JSON file in the subdirectory
    for filename in os.listdir(subdir_path):
        if filename.endswith('.json'):
            file_path = os.path.join(subdir_path, filename)
            asn = filename.replace('.json', '')  # Get ASN from the filename

            # Read the JSON file
            with open(file_path, 'r') as file:
                data = json.load(file)

            # Add the data under the corresponding ASN and type
            if asn not in asn_data:
                asn_data[asn] = {"asn": asn, "hints": {}, "classifications": {}}

            # Assign the data to the appropriate field (hints or classifications)
            asn_data[asn][field_name] = data

# Insert data into MongoDB
for asn, document in asn_data.items():
    print("yes")
    collection.update_one({"asn": asn}, {"$set": document}, upsert=True)

print("Data has been inserted into MongoDB!")
