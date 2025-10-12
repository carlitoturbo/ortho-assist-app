# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/b0a4c070-4369-45f9-8895-0ffca49b6086

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/b0a4c070-4369-45f9-8895-0ffca49b6086) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:
- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

Additionally, whe used the following tools: 
- lovable
- supabase
- n8n
- twillio
- openAI
- livekit

## Overall explanation

The Dental Agent System is a patient-centric automation platform designed to streamline the information intake, appointment scheduling, and treatment documentation process for dental practices. The system integrates **Lovable** as the front-end interface, **Supabase** as the backend database and file storage, and **n8n** for workflow automation. Calls are handled through **Cartesia’s LifeKit agent**, with communication managed via **Twilio**.

Together, these components create a seamless experience — from the first patient call to the final treatment summary.

## System Architecture

**Frontend:** [Lovable](https://lovable.dev)
**Backend:** [Supabase](https://supabase.com)
**Automation Layer:** [n8n](https://n8n.io)
**Telephony & AI Agent:** [LifeKit (Cartesia)](https://cartesia.ai)
**Messaging Service:** [Twilio](https://www.twilio.com)

## Database Structure (Supabase)

The backend database is built on Supabase and includes several key tables and storage buckets:

* **patients** — stores all patient-related data (name, contact information, notes, etc.).
* **appointments** — stores all scheduled appointments, including links to associated patients and treatments.
* **treatments** — keeps a record of past and ongoing treatments, connected to the relevant appointment and patient.
* **recording buckets** — store audio/video recordings from each appointment.

These tables are relationally linked, enabling the application to retrieve and display contextual information across patients, appointments, and treatments.

## Core Workflow

### 1. Incoming Call & Data Retrieval

When a patient calls through **LifeKit**, the agent:

* Retrieves patient data from Supabase.
* Checks whether the patient already exists in the database.
* Determines the next available appointment slots and keeps going back and forth with the patient until they reach an agreement

If the patient is new, a record is created automatically in the `patients` table.

### 2. Scheduling & Database Update

During the call, the agent schedules the appointment and records the conversation.
Once the call ends:

* The recorded data and appointment details are passed through **n8n** and on the way parsed with the help of OpenAI.
* n8n pushes the appointment information to Supabase, where it is stored with the status `pending`.

This pending appointment is now visible in the **Lovable** front-end.


### 3. Appointment Approval Workflow

Within the Lovable app, users (e.g., dental staff) can **approve or decline** pending appointments.
Based on their decision:

* If **approved**, the appointment status updates to `approved`, and a confirmation message is sent to the patient via **Twilio**.
* If **declined**, the appointment status updates to `declined`, and the event is removed from the active appointment overview. The patient receives a cancellation message via **Twilio** 

All communication triggers and state updates are handled through **n8n** automation workflows.


### 4. Appointment Recording & Storage

When the appointment takes place:

* The user can start a recording directly in the Lovable interface.
* The audio/video file is uploaded to Supabase storage buckets and linked to the relevant appointment entry.


### 5. AI-Powered Transcription & Summary

After the recording is complete:

* Supabase triggers a background function that uses **OpenAI** to generate a **transcription** of the recording.
* The transcription is combined with call data and any additional notes from the doctor to create an excutive summary with the help of OpenAI. This is saved in the appointments table as well 

This summary becomes visible in the patient's appointment history for quick review.


## Data Flow Summary

```
LifeKit Call
   ↓
Supabase → check / create patient
   ↓
Appointment scheduling
   ↓
n8n → push to Supabase (status: pending)
   ↓
Lovable app → approval / decline (status is changed accordingly)
   ↓
Twilio → notify patient

Once the appointments occurs: 
Recording → Supabase bucket
   ↓
OpenAI → transcription + summary
   ↓
Lovable → display appointment details + summary
```


## Key Features

* **Automated patient data management** via Supabase integration.
* **Real-time appointment synchronization** between calls, backend, and UI.
* **AI-generated summaries** for efficient review of past consultations.
* **Fully automated communication** through n8n and Twilio.
* **Scalable backend design** supporting additional tables and event triggers.



## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/b0a4c070-4369-45f9-8895-0ffca49b6086) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
