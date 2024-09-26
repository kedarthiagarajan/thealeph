from pymongo import MongoClient
from collections import defaultdict
import time
import requests
import tqdm

def adjust_madrid_region(record):
    if record.get('city') == 'Madrid' and record.get('country') == 'ESP':
        record['stateOrRegion'] = None  # or use del record['stateOrRegion'] to completely remove the key
    return record
# MongoDB connection setup
class MongoDBClient:
    def __init__(self, uri="mongodb://localhost:27017/", db_name="aleph_db"):
        self.client = MongoClient(uri)
        self.db = self.client[db_name]
        
        self.collection = self.db['ptr_data']
        self.geolocation_collection = self.db["openintel_rdns_geolocation"]
        self.infrastructure_collection = self.db["infrastructure_mapping"]  # New collection

    def get_by_asn(self, asn: str):
        return self.collection.find_one({"asn": str(asn)})

    def update_city_name(self, old_city_name: str, new_city_name: str):
        # Update all occurrences where the city name is misspelled
        update_result = self.geolocation_collection.update_many(
            {"geo_city": old_city_name},
            {"$set": {"geo_city": new_city_name}}
        )
        print(f"Matched {update_result.matched_count} documents.")
        print(f"Modified {update_result.modified_count} documents.")
    
    def insert_asn_data(self, asn: str, hints: dict, classifications: dict):
        return self.collection.update_one(
            {"asn": asn},
            {"$set": {"hints": hints, "classifications": classifications}},
            upsert=True
        )

    def get_classifications_by_asn(self, asn: str):
        asn_data = self.get_by_asn(asn)
        if asn_data and 'classifications' in asn_data:
            return asn_data['classifications']
        return None

    def get_regex_by_asn(self, asn: str):
        asn_data = self.get_by_asn(asn)
        if asn_data and 'classifications' in asn_data:
            regex_patterns = {key: value['regex'] for key, value in asn_data['classifications'].items() if value['regex']}
            return regex_patterns
        return None

    def get_hints_by_asn(self, asn: str):
        asn_data = self.get_by_asn(asn)
        if asn_data and 'hints' in asn_data:
            return asn_data['hints']
        return None

    def get_infrastructure_mapping(self, asn):
        return list(self.infrastructure_collection.find({"asn": asn}))

    def insert_infrastructure_mapping(self, asn: str, location_mapping: dict):
        for location, data in location_mapping.items():
            city, state, region, country = location
            lat = data.get('lat')
            lng = data.get('lng')
            count = data.get('count')

            if lat == -1 or lng == -1:
                continue
            
            self.infrastructure_collection.update_one(
                {"asn": asn, "city": city, "state": state, "region": region, "country": country},
                {"$set": {"count": count, "latitude": lat, "longitude": lng}},
                upsert=True
            )
        print(f"Infrastructure mapping for ASN {asn} has been updated.")

    def geocode_city(self, city, state, country):
        # Optional: Add a delay to avoid hitting API rate limits (for Nominatim)
        time.sleep(1)
        try:
            query = f"{city}, {country}"
            if state:
                query = f"{city}, {state}, {country}"

            url = f"https://nominatim.openstreetmap.org/search"
            params = {
                'q': query,
                'format': 'json',
                'limit': 1
            }

            headers = {
                'User-Agent': 'MyApp (your_email@example.com)'  # Replace with your app's name and contact info
            }

            response = requests.get(url, params=params, headers=headers)

            print(f"Geocoding query: {query}")
            print(f"Response status: {response.status_code}")
            print(f"Response data: {response.json() if response.status_code == 200 else 'Error'}")

            if response.status_code == 200 and response.json():
                location = response.json()[0]
                return float(location['lat']), float(location['lon'])
            else:
                print(f"Failed to find coordinates for {city}, {state}, {country}")
        except Exception as e:
            print(f"Error fetching geolocation for {city}, {state}, {country}: {e}")

        return None, None

    
    def get_location_mapping_by_asn(self, asn: str):
        collection = self.geolocation_collection
        results = collection.find({'asn': asn}, {'geo_city': 1, 'geo_state': 1, 'geo_region': 1, 'geo_country': 1})
        

        location_count = self.get_infrastructure_mapping(asn) 
        if location_count:
            return location_count
        location_count = defaultdict(lambda: {"count": 0, "lat": None, "lng": None})
        for result in tqdm.tqdm(results, desc="Processing results", unit="result", unit_scale=True):
            city = result.get('geo_city', None)
            state = result.get('geo_state', None)
            region = result.get('geo_region', None)
            country = result.get('geo_country', None)
            
            location_tuple = (city, state, region, country)
            location_count[location_tuple]["count"] += 1

            # If the location doesn't already have coordinates, fetch them
            if not location_count[location_tuple]["lat"] or not location_count[location_tuple]["lng"]:
                lat, lng = self.geocode_city(city, state or region, country) # None if we cant find the coords, but we wont try to recompute.
                if lat is None or lng is None:
                    lat, lng = -1, -1
                location_count[location_tuple]["lat"] = lat
                location_count[location_tuple]["lng"] = lng

            

        
        self.insert_infrastructure_mapping(asn, location_count)

        return location_count

    def close(self):
        self.client.close()


def main():
    mongo_client = MongoDBClient()
    # mongo_client.infrastructure_collection.delete_many({'asn' : 701})
    asn = "3356"
    # old_city_name = "San FRncisco"
    # new_city_name = "San Francisco"
    
    # mongo_client.update_city_name(old_city_name, new_city_name)
    location_mapping = mongo_client.get_location_mapping_by_asn(asn)

    print(location_mapping)

    mongo_client.close()

if __name__ == "__main__":
    main()
