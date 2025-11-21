from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
import os
from dotenv import load_dotenv

load_dotenv()

security = HTTPBearer()

SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET", "")

async def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    """
    Verify JWT token from Supabase
    """
    if not SUPABASE_JWT_SECRET:
        # If no secret is set, skip verification (for development)
        return None
    
    try:
        token = credentials.credentials
        payload = jwt.decode(
            token,
            SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated"
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
