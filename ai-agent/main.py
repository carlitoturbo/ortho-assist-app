#!/usr/bin/env python3
"""
Main entry point for the dental receptionist webhook server.
Run this to start the webhook server that handles Twilio calls.
"""
import os
import sys
import logging
from pathlib import Path

# Add src directory to Python path
src_dir = Path(__file__).parent / "src"
sys.path.insert(0, str(src_dir))

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def main():
    """Main entry point"""
    logger.info("Starting Dental Receptionist Webhook Server")
    
    # Set environment variables directly
    os.environ["TWILIO_ACCOUNT_SID"] = "AC4f8fe9d9a1df5285f9d9250dd97b2b0e"
    os.environ["TWILIO_AUTH_TOKEN"] = "f54e9d4a1d72c7cce5df1102e45a2bdd"
    os.environ["TWILIO_PHONE_NUMBER"] = "+15076697782"
    os.environ["LIVEKIT_URL"] = "wss://benjo-5u7yljcx.livekit.cloud"
    os.environ["LIVEKIT_API_KEY"] = "APIsLkkf8uNVsbm"
    os.environ["LIVEKIT_API_SECRET"] = "AGSSOdjCTSxnn3Wc6LsX4oSfyeyIPNcj5DQdFfCikCRB"
    os.environ["SUPABASE_URL"] = "https://yvyerqzfxctqhsgyghta.supabase.co"
    os.environ["SUPABASE_KEY"] = "sb_secret_KnLbJ6Y8tJHlheNujvwe2A_o4ogkjPH"
    os.environ["WEBHOOK_BASE_URL"] = "https://demo.twilio.com/welcome/voice/"
    
    # Check required environment variables
    required_vars = [
        "TWILIO_ACCOUNT_SID",
        "TWILIO_AUTH_TOKEN", 
        "TWILIO_PHONE_NUMBER",
        "LIVEKIT_URL",
        "LIVEKIT_API_KEY",
        "LIVEKIT_API_SECRET"
    ]
    
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    if missing_vars:
        logger.error(f"Missing required environment variables: {missing_vars}")
        logger.error("Please set these in your .env file")
        sys.exit(1)
    
    # Import and run the webhook handler
    try:
        from webhook_handler import app
        import uvicorn
        
        host = os.getenv("WEBHOOK_HOST", "0.0.0.0")
        port = int(os.getenv("WEBHOOK_PORT", "8000"))
        
        logger.info(f"Starting webhook server on {host}:{port}")
        logger.info(f"Twilio Account SID: {os.getenv('TWILIO_ACCOUNT_SID')}")
        logger.info(f"Twilio Phone Number: {os.getenv('TWILIO_PHONE_NUMBER')}")
        logger.info(f"LiveKit URL: {os.getenv('LIVEKIT_URL')}")
        
        uvicorn.run(app, host=host, port=port, log_level="info")
        
    except ImportError as e:
        logger.error(f"Failed to import webhook handler: {e}")
        logger.error("Make sure all dependencies are installed: pip install -e .")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Error starting webhook server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
