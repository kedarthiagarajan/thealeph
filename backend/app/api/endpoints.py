from fastapi import APIRouter, HTTPException
from app.api.models import PTRQuery, PTRResponse, LocationInfo, InfrastructureMappingResponse, BatchPTRQuery, BatchPTRResponse
from app.services.thealeph.mongo import MongoDBClient
from app.services.thealeph.extraction import find_mappings_for_record


router = APIRouter()

# API to get classifications by ASN
@router.get("/asn/{asn}/classifications", response_model=dict)
async def get_classifications_by_asn(asn: str):
    mongo_client = MongoDBClient()
    classifications = mongo_client.get_classifications_by_asn(asn)
    mongo_client.close()

    if classifications:
        return classifications
    else:
        raise HTTPException(status_code=404, detail="Classifications not found for the given ASN")


# API to get all regex patterns by ASN
@router.get("/asn/{asn}/regex", response_model=dict)
async def get_regex_by_asn(asn: str):
    mongo_client = MongoDBClient()
    regex_patterns = mongo_client.get_regex_by_asn(asn)
    mongo_client.close()

    if regex_patterns:
        return regex_patterns
    else:
        raise HTTPException(status_code=404, detail="Regex patterns not found for the given ASN")


# API to get hints by ASN
@router.get("/asn/{asn}/hints", response_model=dict)
async def get_hints_by_asn(asn: str):
    mongo_client = MongoDBClient()
    hints = mongo_client.get_hints_by_asn(asn)
    mongo_client.close()

    if hints:
        return hints
    else:
        raise HTTPException(status_code=404, detail="Hints not found for the given ASN")

@router.get("/asn/{asn}/infrastructure_mapping", response_model=InfrastructureMappingResponse)
async def get_infrastructure_mapping_by_asn(asn: str):
    mongo_client = MongoDBClient()
    mapping = mongo_client.get_location_mapping_by_asn(asn)
    if mapping:
        # Convert the raw mapping data into the LocationInfo model
        locations = [
            LocationInfo(
                city=location.get('city'),
                state=location.get('state'),
                region=location.get('region'),
                country=location.get('country'),
                count=location.get('count'),
                latitude=location.get('latitude'),
                longitude=location.get('longitude')
            )
            for location in mapping
        ]
        
        mongo_client.close()
        print(locations)
        # Return the structured Pydantic model response
        return InfrastructureMappingResponse(locations=locations)
    
    mongo_client.close()
    # If no mapping is found, return a 404 error
    raise HTTPException(status_code=404, detail="Infrastructure Mapping not found for the given ASN")


def process_ptr_query(ptr: PTRQuery, mongo_client: MongoDBClient) -> PTRResponse:
    # Query MongoDB for the provided ASN
    asn_data = mongo_client.get_by_asn(int(ptr.asn))
    
    if asn_data:
        # Get patterns from classifications in MongoDB data
        patterns = [v['regex'] for v in asn_data['classifications'].values() if v['usable'] and 'regex' in v]
        # Get hints from MongoDB data
        hints = asn_data.get('hints', {})
        # Use the find_mappings_for_record function to extract data
        extracted_data = find_mappings_for_record(ptr.ptr_record, patterns, hints)
        regex = list(extracted_data.keys())[0]
        hint = extracted_data[regex]['hint']
        location_info = extracted_data[regex]['details']
        
        if location_info is None:
            location_info = {'city': None, 'state': None, 'region': None, 'country': None, 'latitude': 0, 'longitude': 0}
        
        # Create and return the PTRResponse
        return PTRResponse(
            ptr_record=ptr.ptr_record,
            asn=ptr.asn,
            location_info=LocationInfo(
                city=location_info.get('city'),
                state=location_info.get('state'),
                region=location_info.get('region'),
                country=location_info.get('country'),
                count=0,
                latitude=location_info.get('latitude'),
                longitude=location_info.get('longitude')
            ),
            regular_expression=regex,  # Return extracted data from patterns
            geo_hint=hint  # Example mapping for geo hints
        )
    
    # If no data is found, return a default response
    return PTRResponse(
        ptr_record=ptr.ptr_record,
        asn=ptr.asn,
        location_info=LocationInfo(
            city=None,
            state=None,
            region=None,
            country=None,
            count=0,
            latitude=0,
            longitude=0
        ),
        regular_expression="",
        geo_hint=""
    )


# API route to handle the PTR query
@router.post("/query", response_model=PTRResponse)
async def query_ptr(ptr: PTRQuery):
    # Initialize MongoDB client
    mongo_client = MongoDBClient()

    # Use the helper function to process the query
    response = process_ptr_query(ptr, mongo_client)

    # Close MongoDB connection
    mongo_client.close()

    # Return the response
    return response

@router.post("/batch_query", response_model=BatchPTRResponse)
async def batch_query_ptr(batch_ptr: BatchPTRQuery):
    # Initialize MongoDB client
    mongo_client = MongoDBClient()
    
    # Process each PTR query in the batch using the helper function
    responses = [process_ptr_query(ptr, mongo_client) for ptr in batch_ptr.queries]

    # Close MongoDB connection
    mongo_client.close()
    
    # Return the list of responses in the batch
    return BatchPTRResponse(responses=responses)




