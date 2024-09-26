from pydantic import BaseModel

from typing import List, Optional

# Define the model for infrastructure mapping
class LocationInfo(BaseModel):
    city: Optional[str]
    state: Optional[str]
    region: Optional[str]
    country: Optional[str]
    count: int
    latitude: Optional[float]
    longitude: Optional[float]

class InfrastructureMappingResponse(BaseModel):
    locations: List[LocationInfo]
    
# Input model for PTR queries
class PTRQuery(BaseModel):
    ptr_record: str
    asn: int

# Output model for PTR query response
class PTRResponse(BaseModel):
    ptr_record: str
    asn: int
    location_info: LocationInfo
    regular_expression: str
    geo_hint: str

class BatchPTRQuery(BaseModel):
    queries: List[PTRQuery]

class BatchPTRResponse(BaseModel):
    responses: List[PTRResponse]


