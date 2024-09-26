from geopy.geocoders import Nominatim
import regex as re

geolocator = Nominatim(user_agent="kedar")



def find_mappings_for_record(record, patterns, hints):
    extractions = {}
    
    if not isinstance(record, str):
        print(f"Record is not a valid string: {record}")
        return extractions
    
    for pattern in patterns:
        try:
            regexp = re.compile(pattern)
        except Exception as e:
            print(f"Could not compile pattern: {pattern}")
            continue

        coords = None
        for match in regexp.findall(record):
            hint = match
            
            # Process the match to find the hint
            if not hint:
                continue
            
            if isinstance(hint, str):
                hint = hint.lower() if hint.lower() in hints else hint
            else:
                try:
                    found = False
                    for group in hint:
                        if group in hints:
                            hint = group
                            found = True
                            break
                    if not found:
                        hint = ''.join(hint)
                except Exception as e:
                    print(f"Error processing hint: {e}")
                    continue

            if hint in hints:
                coords = map_to_coordinates(hints[hint])
            else:
                print(f"Could not map hint: {hint}")
            
            if coords:
                extractions[pattern] = {
                    "hint": hint,
                    "details": hints.get(hint),
                    "coordinates": coords
                }
                break  # Stop once we successfully match with one pattern
            elif hint:
                extractions[pattern] = {
                    "hint": hint,
                    "details": None,
                    "coordinates": None
                }
                break  
        else:
            # No match found for this pattern
            pass

    return extractions

def find_matches(hint, asn_hints, top_n=5):
    # Check if the hint can be translated to an integer, if so, skip it
    try:
        # Attempt to convert the hint to an integer
        int_hint = int(hint)
        # If successful, skip further processing for this hint
        print(f"Hint '{hint}' is an integer, skipping.")
        return []
    except ValueError:
        # If ValueError is raised, it means the hint is not an integer
        # Continue processing
        pass

    if hint in asn_hints:
        # print("Got hint from LLM")
        return map_to_coordinates(asn_hints[hint])
    # print("No matches found in LLM generated hints, checking for exact location matches.")
    # Convert the hint to lowercase for case-insensitive comparison
    hint = hint.lower()
    # Find all geocodes where the 'value' matches the hint
    matches = [geocode for geocode in geocodes_data if hint == geocode['value'].lower()]
    # Sort the matches based on the length of the 'value' to prioritize exact matches
    sorted_matches = sorted(matches, key=lambda x: len(x['value']))
    # Return the top N matches
    return sorted_matches[:top_n]



location_cache = {}

def map_to_coordinates(location_json):
    """
    Given a JSON with city, possible state, region, and country, map that to coordinates using geopy library.
    This function will use a cache to store and retrieve previously requested locations to reduce the number of geocode API calls.

    Args:
        location_json (dict): A dictionary with keys 'city', 'state', 'region', 'country'.

    Returns:
        tuple: A tuple containing the latitude and longitude of the given location, or (None, None) if not found.
    """

    # Construct the address string with either state or region, whichever is present
    state_or_region = location_json.get('state') or location_json.get('region', '')
    address = f"{location_json.get('city', '')}, {state_or_region}, {location_json.get('country', '')}"

    # Remove any trailing commas and extra spaces
    address = address.strip().strip(',')

    # Check if the address is already in the cache
    if address in location_cache:
        # print(f"Cache hit for address: {address}")
        return location_cache[address]

    # If not in cache, locate the address and extract coordinates
    try:
        location = geolocator.geocode(address)
        if location:
            # Store the result in the cache before returning
            location_cache[address] = (location.latitude, location.longitude)
            return location_cache[address]
        else:
            print(f"Could not locate the address: {address}")
            location_cache[address] = (None, None)
            return location_cache[address]
    except Exception as e:
        print(f"An error occurred during geocoding: {e}")
        location_cache[address] = (None, None)
        return location_cache[address]



    


