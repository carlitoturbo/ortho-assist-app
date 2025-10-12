"""
Twilio webhook handler for incoming calls to the dental receptionist agent.
"""
import os
import asyncio
import logging
from typing import Optional
from fastapi import FastAPI, Request, Form, HTTPException
from twilio.twiml.voice_response import VoiceResponse
from twilio.rest import Client
from livekit.agents import JobContext, JobProcess
from livekit.agents.voice import AgentSession
from livekit.plugins.turn_detector.multilingual import MultilingualModel
import livekit.plugins.silero as silero
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Set environment variables directly if not already set
if not os.getenv("TWILIO_ACCOUNT_SID"):
    os.environ["TWILIO_ACCOUNT_SID"] = "AC4f8fe9d9a1df5285f9d9250dd97b2b0e"
if not os.getenv("TWILIO_AUTH_TOKEN"):
    os.environ["TWILIO_AUTH_TOKEN"] = "f54e9d4a1d72c7cce5df1102e45a2bdd"
if not os.getenv("TWILIO_PHONE_NUMBER"):
    os.environ["TWILIO_PHONE_NUMBER"] = "+15076697782"
if not os.getenv("LIVEKIT_URL"):
    os.environ["LIVEKIT_URL"] = "wss://benjo-5u7yljcx.livekit.cloud"
if not os.getenv("LIVEKIT_API_KEY"):
    os.environ["LIVEKIT_API_KEY"] = "APIsLkkf8uNVsbm"
if not os.getenv("LIVEKIT_API_SECRET"):
    os.environ["LIVEKIT_API_SECRET"] = "AGSSOdjCTSxnn3Wc6LsX4oSfyeyIPNcj5DQdFfCikCRB"
if not os.getenv("SUPABASE_URL"):
    os.environ["SUPABASE_URL"] = "https://yvyerqzfxctqhsgyghta.supabase.co"
if not os.getenv("SUPABASE_KEY"):
    os.environ["SUPABASE_KEY"] = "sb_secret_KnLbJ6Y8tJHlheNujvwe2A_o4ogkjPH"
if not os.getenv("WEBHOOK_BASE_URL"):
    os.environ["WEBHOOK_BASE_URL"] = "https://demo.twilio.com/welcome/voice/"

# Import your agent
from agent import Assistant, prewarm, entrypoint

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(title="Dental Receptionist Webhook")

# Twilio client
twilio_client = Client(
    os.getenv("TWILIO_ACCOUNT_SID"),
    os.getenv("TWILIO_AUTH_TOKEN")
)

# Store active sessions
active_sessions = {}

@app.get("/")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "dental-receptionist-webhook"}

@app.post("/twilio-webhook")
async def handle_incoming_call(
    request: Request,
    From: str = Form(...),
    To: str = Form(...),
    CallSid: str = Form(...),
    CallStatus: str = Form(...)
):
    """Handle incoming Twilio calls"""
    logger.info(f"Incoming call from {From} to {To}, CallSid: {CallSid}")
    
    try:
        # Create TwiML response
        response = VoiceResponse()
        
        # Generate unique room name for this call
        room_name = f"dental-call-{CallSid}"
        
        # Start the agent session in the background
        asyncio.create_task(start_agent_session(room_name, From, To, CallSid))
        
        # Connect the call to LiveKit room
        response.say("Connecting you to our dental receptionist...")
        response.connect().room(room_name)
        
        logger.info(f"Connected call {CallSid} to room {room_name}")
        return str(response)
        
    except Exception as e:
        logger.error(f"Error handling call {CallSid}: {e}")
        response = VoiceResponse()
        response.say("Sorry, we're experiencing technical difficulties. Please try again later.")
        response.hangup()
        return str(response)

@app.post("/twilio-status")
async def handle_call_status(
    CallSid: str = Form(...),
    CallStatus: str = Form(...)
):
    """Handle call status updates"""
    logger.info(f"Call {CallSid} status: {CallStatus}")
    
    # Clean up session when call ends
    if CallStatus in ["completed", "failed", "busy", "no-answer"]:
        if CallSid in active_sessions:
            del active_sessions[CallSid]
            logger.info(f"Cleaned up session for call {CallSid}")
    
    return {"status": "ok"}

async def start_agent_session(room_name: str, caller_number: str, called_number: str, call_sid: str):
    """Start the agent session for the call"""
    try:
        logger.info(f"Starting agent session for room {room_name}")
        
        # Create a mock JobContext for the agent
        # In a real implementation, you'd create a proper JobContext
        class MockJobContext(JobContext):
            def __init__(self, room_name: str):
                self.room_name = room_name
                self.proc = MockJobProcess()
            
            @property
            def room(self):
                return MockRoom(room_name)
        
        class MockJobProcess(JobProcess):
            def __init__(self):
                self.userdata = {"vad": silero.VAD.load()}
        
        class MockRoom:
            def __init__(self, name: str):
                self.name = name
        
        # Create context and start agent
        ctx = MockJobContext(room_name)
        
        # Store session info
        active_sessions[call_sid] = {
            "room_name": room_name,
            "caller_number": caller_number,
            "called_number": called_number,
            "context": ctx
        }
        
        # Start the agent entrypoint
        await entrypoint(ctx)
        
    except Exception as e:
        logger.error(f"Error starting agent session for {room_name}: {e}")

@app.get("/active-calls")
async def get_active_calls():
    """Get information about active calls"""
    return {
        "active_calls": len(active_sessions),
        "calls": [
            {
                "call_sid": call_sid,
                "room_name": session["room_name"],
                "caller_number": session["caller_number"],
                "called_number": session["called_number"]
            }
            for call_sid, session in active_sessions.items()
        ]
    }

if __name__ == "__main__":
    import uvicorn
    
    # Get configuration from environment
    host = os.getenv("WEBHOOK_HOST", "0.0.0.0")
    port = int(os.getenv("WEBHOOK_PORT", "8000"))
    
    logger.info(f"Starting webhook server on {host}:{port}")
    logger.info(f"Twilio Account SID: {os.getenv('TWILIO_ACCOUNT_SID')}")
    logger.info(f"Twilio Phone Number: {os.getenv('TWILIO_PHONE_NUMBER')}")
    
    uvicorn.run(app, host=host, port=port)
