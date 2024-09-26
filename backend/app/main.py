from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from app.api.endpoints import router as ptr_router

app = FastAPI(docs_url="/custom-docs")

# Set CORS policy
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)
print("hello")
# Include the PTR router under the /api path
app.include_router(ptr_router, prefix="/api")
