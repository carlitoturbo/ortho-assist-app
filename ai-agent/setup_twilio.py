#!/usr/bin/env python3
"""
Script to configure your Twilio phone number webhook URL.
Run this after you have your webhook server running.
"""
import os
from twilio.rest import Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def configure_twilio_webhook():
    """Configure Twilio phone number webhook URL"""
    
    # Get credentials from environment
    account_sid = os.getenv("TWILIO_ACCOUNT_SID")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN")
    phone_number = os.getenv("TWILIO_PHONE_NUMBER")
    webhook_base_url = os.getenv("WEBHOOK_BASE_URL")
    
    if not all([account_sid, auth_token, phone_number, webhook_base_url]):
        print("❌ Missing required environment variables!")
        print("Please set:")
        print("- TWILIO_ACCOUNT_SID")
        print("- TWILIO_AUTH_TOKEN") 
        print("- TWILIO_PHONE_NUMBER")
        print("- WEBHOOK_BASE_URL")
        return False
    
    try:
        # Initialize Twilio client
        client = Client(account_sid, auth_token)
        
        # Get your phone number
        incoming_numbers = client.incoming_phone_numbers.list()
        
        target_number = None
        for number in incoming_numbers:
            if number.phone_number == phone_number:
                target_number = number
                break
        
        if not target_number:
            print(f"❌ Phone number {phone_number} not found in your Twilio account!")
            print("Available numbers:")
            for number in incoming_numbers:
                print(f"  - {number.phone_number}")
            return False
        
        # Configure webhook URL
        webhook_url = f"{webhook_base_url}/twilio-webhook"
        status_webhook_url = f"{webhook_base_url}/twilio-status"
        
        target_number.update(
            voice_url=webhook_url,
            voice_method='POST',
            status_callback=status_webhook_url,
            status_callback_method='POST'
        )
        
        print("✅ Twilio phone number configured successfully!")
        print(f"📞 Phone Number: {phone_number}")
        print(f"🔗 Webhook URL: {webhook_url}")
        print(f"📊 Status Callback: {status_webhook_url}")
        print("\n🎉 You can now receive calls!")
        
        return True
        
    except Exception as e:
        print(f"❌ Error configuring Twilio: {e}")
        return False

def test_twilio_connection():
    """Test Twilio connection"""
    account_sid = os.getenv("TWILIO_ACCOUNT_SID")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN")
    
    if not account_sid or not auth_token:
        print("❌ Missing Twilio credentials!")
        return False
    
    try:
        client = Client(account_sid, auth_token)
        account = client.api.accounts(account_sid).fetch()
        
        print("✅ Twilio connection successful!")
        print(f"📋 Account Name: {account.friendly_name}")
        print(f"🆔 Account SID: {account_sid}")
        
        return True
        
    except Exception as e:
        print(f"❌ Twilio connection failed: {e}")
        return False

if __name__ == "__main__":
    print("🔧 Twilio Configuration Script")
    print("=" * 40)
    
    # Test connection first
    if not test_twilio_connection():
        exit(1)
    
    print("\n" + "=" * 40)
    
    # Configure webhook
    if configure_twilio_webhook():
        print("\n🚀 Setup complete! Your dental receptionist is ready to take calls!")
    else:
        print("\n❌ Setup failed. Please check your configuration.")
