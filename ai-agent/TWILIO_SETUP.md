# Dental Receptionist - Twilio Integration

This setup allows your dental receptionist agent to receive real phone calls through Twilio.

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
pip install -e .
```

### 2. Configure Environment Variables
Copy `env_example.txt` to `.env` and fill in your credentials:

```bash
cp env_example.txt .env
```

Edit `.env` with your actual values:
- `TWILIO_AUTH_TOKEN`: Your Twilio auth token
- `LIVEKIT_URL`: Your LiveKit server URL
- `LIVEKIT_API_KEY`: Your LiveKit API key
- `LIVEKIT_API_SECRET`: Your LiveKit API secret
- `WEBHOOK_BASE_URL`: Your public webhook URL (e.g., https://your-domain.com)

### 3. Start the Webhook Server
```bash
python main.py
```

The server will start on `http://localhost:8000`

### 4. Configure Twilio Phone Number
Run the setup script:
```bash
python setup_twilio.py
```

This will configure your Twilio phone number to forward calls to your webhook.

## 📞 Testing

### Local Testing with ngrok
1. Install ngrok: `npm install -g ngrok`
2. Expose your local server: `ngrok http 8000`
3. Update `WEBHOOK_BASE_URL` in `.env` with the ngrok URL
4. Run `python setup_twilio.py` again
5. Call your Twilio phone number!

### Production Deployment
Deploy to any cloud provider (Railway, Heroku, DigitalOcean, etc.) and update your `WEBHOOK_BASE_URL`.

## 🔧 Configuration

### Required Environment Variables
- `TWILIO_ACCOUNT_SID`: Your Twilio Account SID
- `TWILIO_AUTH_TOKEN`: Your Twilio Auth Token  
- `TWILIO_PHONE_NUMBER`: Your purchased phone number
- `LIVEKIT_URL`: LiveKit server URL
- `LIVEKIT_API_KEY`: LiveKit API key
- `LIVEKIT_API_SECRET`: LiveKit API secret
- `WEBHOOK_BASE_URL`: Public URL where your webhook is hosted

### Optional Environment Variables
- `WEBHOOK_HOST`: Host to bind to (default: 0.0.0.0)
- `WEBHOOK_PORT`: Port to bind to (default: 8000)

## 📱 How It Works

1. **Incoming Call**: Someone calls your Twilio phone number
2. **Webhook**: Twilio sends webhook to `/twilio-webhook`
3. **LiveKit Room**: Creates a LiveKit room for the call
4. **Agent Session**: Starts your dental receptionist agent
5. **Call Connection**: Connects the phone call to the agent

## 🛠️ Endpoints

- `GET /`: Health check
- `POST /twilio-webhook`: Handles incoming calls
- `POST /twilio-status`: Handles call status updates
- `GET /active-calls`: Shows currently active calls

## 🐛 Troubleshooting

### Common Issues

1. **"Missing required environment variables"**
   - Check your `.env` file has all required variables
   - Make sure `.env` is in the project root

2. **"Phone number not found"**
   - Verify you've purchased a phone number in Twilio console
   - Check the phone number format (+4915203225863)

3. **"Webhook URL not accessible"**
   - Make sure your webhook server is running
   - For local testing, use ngrok
   - Check firewall settings

4. **"Agent not responding"**
   - Check LiveKit server is running
   - Verify LiveKit credentials
   - Check agent logs for errors

### Logs
The webhook server logs all incoming calls and errors. Check the console output for debugging information.

## 💰 Costs

- **Phone Number**: ~$1-2/month
- **Incoming Calls**: ~$0.01-0.02/minute
- **Server Hosting**: $5-20/month (depending on provider)

## 🎯 Next Steps

1. Test with a phone call
2. Monitor logs for any issues
3. Deploy to production server
4. Set up monitoring and alerts
5. Configure additional phone numbers if needed
