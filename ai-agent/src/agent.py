# src/agent.py

# src/agent.py
import logging
import os
from datetime import datetime, timedelta, time, timezone
from typing import Dict, List, Optional, Tuple, Any, Sequence, Mapping

from dotenv import load_dotenv
from livekit.agents import (
    Agent,
    AgentSession,
    JobContext,
    JobProcess,
    MetricsCollectedEvent,
    RoomInputOptions,
    RunContext,
    WorkerOptions,
    cli,
    metrics,
)
from livekit.agents.llm import function_tool  # tools API
from livekit.plugins import noise_cancellation, silero
from livekit.plugins.turn_detector.multilingual import MultilingualModel

# Supabase
from supabase import create_client, Client

# DeepSeek for executive summary
from openai import OpenAI, api_key

logger = logging.getLogger("agent")
load_dotenv(".env.local")

# ========= Supabase =========
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Optional[Client] = None
if SUPABASE_URL and SUPABASE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    logger.info("✅ Supabase client initialized")
else:
    logger.warning("⚠️ Supabase env not set; DB ops will be skipped.")

def first_row(data: Optional[Sequence[Mapping[str, Any]]]) -> Optional[Mapping[str, Any]]:
    """Return first row or None (pyright-friendly)."""
    return data[0] if data and len(data) > 0 else None

def normalize_phone_number(phone_text: str) -> str:
    """Convert spoken phone numbers to numeric format."""
    if not phone_text:
        return phone_text
    
    # Convert to lowercase for easier processing
    phone = phone_text.lower().strip()
    
    # Remove common words and punctuation
    phone = phone.replace("plus", "+").replace(" ", "").replace("-", "").replace("(", "").replace(")", "")
    
    # Word to number mapping
    word_to_num = {
        "zero": "0", "one": "1", "two": "2", "three": "3", "four": "4", "five": "5",
        "six": "6", "seven": "7", "eight": "8", "nine": "9", "ten": "10",
        "eleven": "11", "twelve": "12", "thirteen": "13", "fourteen": "14", "fifteen": "15",
        "sixteen": "16", "seventeen": "17", "eighteen": "18", "nineteen": "19",
        "twenty": "20", "thirty": "30", "forty": "40", "fifty": "50",
        "sixty": "60", "seventy": "70", "eighty": "80", "ninety": "90",
        "hundred": "00", "thousand": "000", "plus": "+"
    }
    
    # Replace words with numbers
    for word, num in word_to_num.items():
        phone = phone.replace(word, num)
    
    # Handle special cases for common patterns
    # "eleven forty seven" -> "1147"
    # "eighty nine one hundred forty three" -> "89143"
    
    # Split by common separators and process each part
    parts = phone.replace("+", "").split()
    result_parts = []
    
    for part in parts:
        if part.isdigit():
            result_parts.append(part)
        else:
            # Try to extract numbers from mixed text
            numeric_part = ""
            for char in part:
                if char.isdigit():
                    numeric_part += char
            if numeric_part:
                result_parts.append(numeric_part)
    
    # Join all parts
    normalized = "".join(result_parts)
    
    # Add country code if it starts with a number but no +
    if normalized and not normalized.startswith("+") and len(normalized) > 10:
        normalized = "+" + normalized
    
    logger.info(f"Normalized phone: '{phone_text}' -> '{normalized}'")
    return normalized

def normalize_insurance_number_with_llm(insurance_text: str) -> str:
    """Use LLM to normalize insurance number to format: 1 uppercase letter + 6 numbers."""
    if not insurance_text:
        return insurance_text
    
    try:
        client = OpenAI(
            api_key = os.getenv("SUPABASE_KEY"),
        )
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are a data normalization assistant. Convert insurance numbers to the format: 1 uppercase letter followed by exactly 6 numbers (e.g., B123456, C728282). Handle spoken words, mixed formats, and various input styles. Return ONLY the normalized insurance number, nothing else."
                },
                {
                    "role": "user",
                    "content": f"Normalize this insurance number: '{insurance_text}'"
                }
            ],
            max_tokens=20,
            temperature=0
        )
        
        normalized = response.choices[0].message.content.strip()
        
        # Validate the result format
        if len(normalized) == 7 and normalized[0].isalpha() and normalized[1:].isdigit():
            logger.info(f"LLM normalized insurance: '{insurance_text}' -> '{normalized}'")
            return normalized.upper()
        else:
            logger.warning(f"LLM returned invalid format: '{normalized}', falling back to original")
            return insurance_text
            
    except Exception as e:
        logger.error(f"LLM normalization failed: {e}, using original input")
        return insurance_text

def normalize_insurance_number(insurance_text: str) -> str:
    """Normalize insurance number to format: 1 uppercase letter + 6 numbers (e.g., B123456)."""
    return normalize_insurance_number_with_llm(insurance_text)

def format_datetime_readable(dt: datetime) -> str:
    """Format datetime into readable format like 'Tuesday 14.10.2025 10:30'."""
    try:
        # Format: DayName DD.MM.YYYY HH:MM
        formatted = dt.strftime("%A %d.%m.%Y %H:%M")
        logger.info(f"Formatted datetime: {dt} -> {formatted}")
        return formatted
    except Exception as e:
        logger.error(f"Error formatting datetime {dt}: {e}")
        return str(dt)

def generate_doctor_summary(patient_data: Dict[str, Any]) -> Optional[str]:
    """Generate executive summary for doctor using DeepSeek."""
    try:
        # Debug logging
        logger.info(f"generate_doctor_summary received data: {patient_data}")
        
        client = OpenAI(
            api_key = os.getenv("SUPABASE_KEY"), 
            #base_url="https://api.deepseek.com"
        )
        
        # Prepare patient data for analysis
        data_text = f"""
        Patient Information:
        - Condition: {patient_data.get('detailed_condition', patient_data.get('pain_description', 'N/A'))}
        - Pain Duration: {patient_data.get('pain_duration', 'N/A')}
        - Pain Severity: {patient_data.get('pain_severity', 'N/A')}
        - Previous Treatments: {patient_data.get('previous_treatments', 'N/A')}
        - Allergies: {patient_data.get('allergies', 'None reported')}
        - Medications: {patient_data.get('medications', 'None reported')}
        """
        logger.info(f"Data text sent to LLM: {data_text}")
        print(data_text)
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system", 
                    "content": "You are a medical assistant analyzing patient intake data. Create a concise and very SHORT executive summary for the doctor highlighting key medical information, urgency indicators, and important considerations for the upcoming appointment. Focus on clinical relevance and any red flags. Only return the executive summary, not the other information."
                },
                {
                    "role": "user", 
                    "content": f"Analyze this patient data and provide a brief executive summary for the doctor:\n\n{data_text}"
                }
            ],
            stream=False
        )
        print(response.choices[0].message.content.strip())
        return response.choices[0].message.content.strip()
    except Exception as e:
        logger.error(f"Error generating doctor summary: {e}")
        return None

# ========== Calendar ==========
WORK_START = time(9, 0)
WORK_END = time(17, 0)
SLOT_MINUTES = 30
TODAY = datetime.now().strftime("%Y-%m-%d")

# Dynamic booked slots loaded from database
BOOKED: Dict[str, List[str]] = {}

# Dynamic patients loaded from database
PATIENTS: Dict[str, Dict[str, Any]] = {}

def load_patients_from_db() -> None:
    """Load all patients from database for quick lookup."""
    global PATIENTS
    PATIENTS = {}
    
    if not supabase:
        logger.warning("Supabase not available; using empty patients cache")
        return
    
    try:
        res = supabase.table("patients").select("*").execute()
        
        if hasattr(res, 'data') and res.data:
            for patient in res.data:
                ensurance_number = patient.get("ensurance_number")
                if ensurance_number:
                    PATIENTS[ensurance_number] = patient
                    logger.info(f"Loaded patient: {patient.get('first_name')} {patient.get('last_name')} (Insurance: {ensurance_number})")
        
        logger.info(f"Loaded {len(PATIENTS)} patients from database")
        
    except Exception as e:
        logger.error(f"Failed to load patients from database: {e}")
        PATIENTS = {}

def load_booked_slots_from_db() -> None:
    """Load booked time slots from appointments table."""
    global BOOKED
    BOOKED = {}
    
    if not supabase:
        logger.warning("Supabase not available; using empty booked slots")
        return
    
    try:
        # Get appointments for the next 14 days
        start_date = datetime.now().date()
        end_date = start_date + timedelta(days=14)
        
        res = supabase.table("appointments").select("appointment_date, appointment_time").gte("appointment_date", start_date.strftime("%Y-%m-%d")).lte("appointment_date", end_date.strftime("%Y-%m-%d")).execute()
        print(res)
        print("\n...........\n..........\n..........\n..........\n..........")
        if hasattr(res, 'data') and res.data:
            for appointment in res.data:
                date_str = appointment.get("appointment_date")
                time_str = appointment.get("appointment_time")
                
                if date_str and time_str:
                    # Convert time to HH:MM format
                    try:
                        if isinstance(time_str, str):
                            # Handle different time formats
                            if ":" in time_str:
                                time_parts = time_str.split(":")
                                formatted_time = f"{time_parts[0].zfill(2)}:{time_parts[1].zfill(2)}"
                            else:
                                formatted_time = time_str
                        else:
                            formatted_time = str(time_str)
                        
                        BOOKED.setdefault(date_str, []).append(formatted_time)
                    except Exception as e:
                        logger.warning(f"Error processing appointment time {time_str}: {e}")
        
        logger.info(f"Loaded booked slots from database: {BOOKED}")
        
    except Exception as e:
        logger.error(f"Failed to load booked slots from database: {e}")
        # Fallback to empty dict
        BOOKED = {}

def _slots_for_day(day: datetime) -> List[str]:
    cur = datetime.combine(day.date(), WORK_START)
    end_dt = datetime.combine(day.date(), WORK_END)
    out: List[str] = []
    while cur < end_dt:
        out.append(cur.strftime("%H:%M"))
        cur += timedelta(minutes=SLOT_MINUTES)
    return out

def _first_n_free_slots(day: datetime, n: int = 3, after: Optional[time] = None) -> List[str]:
    all_slots = _slots_for_day(day)
    booked = set(BOOKED.get(day.strftime("%Y-%m-%d"), []))
    free = [s for s in all_slots if s not in booked]
    if after:
        free = [s for s in free if datetime.strptime(s, "%H:%M").time() >= after]
    return free[:n]

def _is_free(dt: datetime) -> bool:
    day_key = dt.strftime("%Y-%m-%d")
    hhmm = dt.strftime("%H:%M")
    return hhmm not in set(BOOKED.get(day_key, []))

def _book_slot(dt: datetime) -> None:
    """Book a slot and refresh database data."""
    day_key = dt.strftime("%Y-%m-%d")
    hhmm = dt.strftime("%H:%M")
    BOOKED.setdefault(day_key, []).append(hhmm)

    # Refresh booked slots from database to stay in sync
    load_booked_slots_from_db()

def _find_next_free(start_dt_or_day: datetime, after_time: Optional[time] = None, horizon_days: int = 14) -> Optional[Tuple[str, str]]:
    """
    Return (date_str, hh:mm) for the next free slot, checking the same day first,
    then rolling forward up to `horizon_days`.
    """
    day0 = datetime.combine(start_dt_or_day.date(), time(0, 0))
    for offset in range(0, horizon_days + 1):
        day = day0 + timedelta(days=offset)
        after = after_time if offset == 0 else None
        free = _first_n_free_slots(day, n=1, after=after)
        if free:
            return day.strftime("%Y-%m-%d"), free[0]
    return None

# ========= Helpers =========
def _split_iso_to_date_time(iso_str: Optional[str]) -> Tuple[Optional[str], Optional[str]]:
    """Input 'YYYY-MM-DDTHH:MM' or full ISO; returns ('YYYY-MM-DD','HH:MM:SS') or (None,None)."""
    if not iso_str:
        return None, None
    try:
        dt = datetime.fromisoformat(iso_str.replace("Z", "+00:00"))
        return dt.strftime("%Y-%m-%d"), dt.strftime("%H:%M:%S")
    except Exception:
        return None, None

def _parse_name(full_name: Optional[str]) -> Tuple[Optional[str], Optional[str]]:
    """Parse full name into first and last name."""
    if not full_name:
        return None, None
    parts = [p for p in full_name.strip().split() if p]
    if not parts:
        return None, None
    if len(parts) == 1:
        return parts[0], None
    return parts[0], " ".join(parts[1:])


# ========= Assistant =========
class Assistant(Agent):
    """
    Dental receptionist:
    - Greets with Nelly’s line
    - Collects: full name, ensurance_number, pain/treatment, optional phone/mail/birth_date
    - Proposes next free times & holds a slot
    - Finds/creates patient (patients), then inserts appointment (appointments)
    - Persists IMMEDIATELY upon successful hold (no LLM dependency)
    - ask at most 2 questions at a time
    """

    # per-call memory
    patient_full_name: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    ensurance_number: Optional[str] = None
    pain_description: Optional[str] = None  # stored as 'treatment'
    phone: Optional[str] = None
    mail: Optional[str] = None
    birth_date: Optional[str] = None  # 'YYYY-MM-DD'
    booked_dt: Optional[str] = None   # ISO 'YYYY-MM-DDTHH:MM'
    _persisted: bool = False          # guard so we don't double-insert
    
    # Additional patient details for notes
    is_first_visit: Optional[bool] = None
    is_private_insurance: Optional[bool] = None
    detailed_condition: Optional[str] = None
    pain_duration: Optional[str] = None
    pain_severity: Optional[str] = None
    previous_treatments: Optional[str] = None
    allergies: Optional[str] = None
    medications: Optional[str] = None
    
    # Patient lookup status
    existing_patient_found: bool = False

    def __init__(self) -> None:
        super().__init__(
            instructions=(
                "You are a friendly, efficient dental receptionist speaking on the phone. Your job is to really pinpoint the patient's condition and pain. ask follow up questions to get more information. "
                "IMPORTANT: Ask at most 1 question at a time. "
                "FIRST: Ask if they have private insurance. If they say NO or don't have private insurance, "
                "tell them 'Sorry, we only accept private insurance patients. Fuck off and have a nice day' and hang up immediately. "
                "If they have private insurance, continue with: "
                "FIRST: Ask for their insurance number and check if they are an existing patient. "
                "If they are an existing patient, skip asking for name and contact details. "
                "For existing patients, ask only about their current condition and pain. "
                "If they are a new patient, collect their full name, phone number (make sure to save it in a valid format), and detailed information about their condition. "
                "For new patients only, ask: Is this your first visit?"
                "How long have you had this pain?"

                "Rate your pain from 1-10?" 
                "Any previous treatments?" 
                "Any allergies or medications?"
                "When the caller asks about a time, check tools for availability; if busy, suggest the next free time. "
                "Offer 2–3 nearby alternatives when helpful. "
                "IMPORTANT: Only save the appointment to the database when you have collected ALL required information: "
                "Use 'complete_appointment' function when all information is ready. "
                f"Today is {TODAY}. Confirm date/time and remind them to bring their insurance card at the end. Additionally, inform them, that they will receive a confirmation SMS with the details of the appointment."
            )
        )

    # ---------- DATA COLLECTION ----------
    @function_tool
    async def check_existing_patient(self, context: RunContext, ensurance_number: str):
        """Check if patient exists by insurance number and populate data if found."""
        normalized_insurance = normalize_insurance_number(ensurance_number)
        print(normalize_insurance_number)
        if normalized_insurance in PATIENTS:
            patient = PATIENTS[normalized_insurance]
            
            # Populate all patient data
            Assistant.patient_full_name = f"{patient.get('first_name', '')} {patient.get('last_name', '')}".strip()
            Assistant.first_name = patient.get('first_name')
            Assistant.last_name = patient.get('last_name')
            Assistant.ensurance_number = normalized_insurance
            Assistant.phone = patient.get('phone')
            Assistant.mail = patient.get('mail')
            Assistant.birth_date = patient.get('birth_date')
            Assistant.is_first_visit = False  # Existing patient is not first visit
            Assistant.existing_patient_found = True
            
            logger.info(f"Found existing patient: {Assistant.patient_full_name} (Insurance: {normalized_insurance})")
            return {
                "found": True, 
                "name": Assistant.patient_full_name,
                "phone": Assistant.phone,
                "email": Assistant.mail,
                "message": f"Welcome back {Assistant.patient_full_name}! I have your information on file. What brings you in today?"
            }
        else:
            Assistant.ensurance_number = normalized_insurance
            Assistant.existing_patient_found = False
            logger.info(f"New patient with insurance number: {normalized_insurance}")
            return {
                "found": False, 
                "message": "I don't have your information on file. Let me collect your details."
            }

    @function_tool
    async def set_patient_name(self, context: RunContext, full_name: str):
        """Set the caller's full name (splits into first/last for DB)."""
        Assistant.patient_full_name = full_name
        fn, ln = _parse_name(full_name)
        Assistant.first_name, Assistant.last_name = fn, ln
        logger.info(f"Set name: full='{full_name}' -> first='{fn}', last='{ln}'")
        return {"ok": True, "first_name": fn, "last_name": ln}

    @function_tool
    async def set_insurance_number(self, context: RunContext, ensurance_number: str):
        """Store ensurance/insurance member number as free text."""
        Assistant.ensurance_number = normalize_insurance_number(ensurance_number)
        logger.info(f"Set ensurance_number: {ensurance_number} -> {Assistant.ensurance_number}")
        return {"ok": True, "ensurance_number": Assistant.ensurance_number}

    @function_tool
    async def set_pain_description(self, context: RunContext, description: str):
        """Short description of pain / treatment reason."""
        Assistant.pain_description = description
        logger.info(f"Set pain: {description}")
        return {"ok": True, "pain": description}

    @function_tool
    async def set_contact(self, context: RunContext, phone: Optional[str] = None, mail: Optional[str] = None, birth_date: Optional[str] = None):
        """Optional contact data to help match the patient. birth_date format 'YYYY-MM-DD'."""
        if phone: 
            Assistant.phone = normalize_phone_number(phone)
        if mail: 
            Assistant.mail = mail
        if birth_date: 
            Assistant.birth_date = birth_date
        logger.info(f"Set contact: phone={Assistant.phone}, mail={Assistant.mail}, dob={Assistant.birth_date}")
        return {"ok": True, "phone": Assistant.phone, "mail": Assistant.mail, "birth_date": Assistant.birth_date}

    @function_tool
    async def set_insurance_type(self, context: RunContext, is_private: bool):
        """Set whether patient has private insurance. If False, reject them."""
        Assistant.is_private_insurance = is_private
        logger.info(f"Set insurance type: private={is_private}")
        if not is_private:
            logger.warning("Patient rejected - no private insurance")
        return {"ok": True, "is_private": is_private, "rejected": not is_private}

    @function_tool
    async def set_visit_details(self, context: RunContext, is_first_visit: Optional[bool] = None, detailed_condition: Optional[str] = None, pain_duration: Optional[str] = None, pain_severity: Optional[str] = None):
        """Set detailed visit and condition information."""
        # Only set is_first_visit if not already set (for existing patients)
        if Assistant.is_first_visit is None:
            Assistant.is_first_visit = is_first_visit
        Assistant.detailed_condition = detailed_condition
        Assistant.pain_duration = pain_duration
        Assistant.pain_severity = pain_severity
        logger.info(f"Set visit details: first_visit={Assistant.is_first_visit}, condition={detailed_condition}, duration={pain_duration}, severity={pain_severity}")
        return {"ok": True, "is_first_visit": Assistant.is_first_visit, "detailed_condition": detailed_condition, "pain_duration": pain_duration, "pain_severity": pain_severity}

    @function_tool
    async def set_medical_history(self, context: RunContext, previous_treatments: Optional[str] = None, allergies: Optional[str] = None, medications: Optional[str] = None):
        """Set medical history information."""
        Assistant.previous_treatments = previous_treatments
        Assistant.allergies = allergies
        Assistant.medications = medications
        logger.info(f"Set medical history: treatments={previous_treatments}, allergies={allergies}, medications={medications}")
        return {"ok": True, "previous_treatments": previous_treatments, "allergies": allergies, "medications": medications}

    @function_tool
    async def reject_patient(self, context: RunContext, reason: str = "no_private_insurance"):
        """Reject patient and end the call. Use this when they don't have private insurance."""
        logger.warning(f"Patient rejected: {reason}")
        return {"rejected": True, "reason": reason, "message": "Sorry, we only accept private insurance patients. Fuck off and have a nice day."}

    # ---------- SCHEDULING ----------
    @function_tool
    async def propose_slots(self, context: RunContext, day_iso: str, earliest_time: Optional[str] = None, count: int = 3):
        """
        Return free slots for the given day. If none, suggest the next free day/time.
        """
        try:
            day = datetime.fromisoformat(day_iso)
        except Exception:
            return {"date": None, "slots": [], "error": "invalid_date"}

        after_t = None
        if earliest_time:
            try:
                # Handle both HH:MM and HH:MM:SS formats
                if earliest_time.count(":") == 1:
                    after_t = datetime.strptime(earliest_time, "%H:%M").time()
                elif earliest_time.count(":") == 2:
                    after_t = datetime.strptime(earliest_time, "%H:%M:%S").time()
                else:
                    logger.warning(f"Invalid time format: {earliest_time}")
            except ValueError as e:
                logger.warning(f"Error parsing time '{earliest_time}': {e}")
                after_t = None
        slots = _first_n_free_slots(day, n=count, after=after_t)

        suggestion = None
        if slots:
            # Format the datetime for better readability
            slot_dt = datetime.fromisoformat(f"{day_iso}T{slots[0]}")
            formatted_time = format_datetime_readable(slot_dt)
            suggestion = {"date": day_iso, "time": slots[0], "formatted": formatted_time}
        else:
            nf = _find_next_free(day)
            if nf:
                # Format the datetime for better readability
                suggestion_dt = datetime.fromisoformat(f"{nf[0]}T{nf[1]}")
                formatted_time = format_datetime_readable(suggestion_dt)
                suggestion = {"date": nf[0], "time": nf[1], "formatted": formatted_time}
        return {"date": day_iso, "slots": slots, "suggestion": suggestion}

    def _validate_required_fields(self) -> Dict[str, Any]:
        """Validate that all required fields for appointment are available."""
        missing_fields = []
        
        # Required fields for appointment
        if not Assistant.patient_full_name and not (Assistant.first_name and Assistant.last_name):
            missing_fields.append("patient_name")
        
        if not Assistant.ensurance_number:
            missing_fields.append("insurance_number")
            
        if not Assistant.pain_description and not Assistant.detailed_condition:
            missing_fields.append("condition_description")
            
        if Assistant.is_private_insurance is None:
            missing_fields.append("insurance_type")
            
        if not Assistant.phone:
            missing_fields.append("phone_number")
        
        return {
            "valid": len(missing_fields) == 0,
            "missing_fields": missing_fields,
            "message": f"Missing required fields: {', '.join(missing_fields)}" if missing_fields else "All required fields available"
        }

    # ---- persistence helper ----
    def _ensure_patient(self) -> Optional[int]:
        if not supabase:
            logger.warning("Supabase not configured; cannot ensure patient")
            return None

        # If we already found an existing patient, return their ID
        if Assistant.existing_patient_found and Assistant.ensurance_number in PATIENTS:
            patient = PATIENTS[Assistant.ensurance_number]
            pid = patient.get("id")
            if pid:
                logger.info(f"Using existing patient ID: {pid}")
                return int(pid)

        # Try to find existing patient by insurance number in cache
        if Assistant.ensurance_number and Assistant.ensurance_number in PATIENTS:
            patient = PATIENTS[Assistant.ensurance_number]
            pid = patient.get("id")
            if pid:
                logger.info(f"Found existing patient by insurance in cache: {pid}")
                return int(pid)

        # Create new patient
        payload = {
            "first_name": Assistant.first_name,
            "last_name": Assistant.last_name,
            "ensurance_number": Assistant.ensurance_number,
            "phone": normalize_phone_number(Assistant.phone) if Assistant.phone else Assistant.phone,
            "mail": Assistant.mail,
            "birth_date": Assistant.birth_date,
            "edited_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        }

        logger.info(f"Creating new patient with payload: {payload}")
        
        try:
            res = supabase.table("patients").insert(payload).execute()
            row = first_row(res.data)
            pid = int(row["id"]) if row and "id" in row else None
            
            if pid:
                # Add to cache for future lookups
                PATIENTS[Assistant.ensurance_number] = {
                    "id": pid,
                    "first_name": Assistant.first_name,
                    "last_name": Assistant.last_name,
                    "ensurance_number": Assistant.ensurance_number,
                    "phone": Assistant.phone,
                    "mail": Assistant.mail,
                    "birth_date": Assistant.birth_date
                }
                logger.info(f"Created new patient id={pid} and added to cache")
            
            return pid
        except Exception as e:
            logger.exception(f"patients insert failed: {e}")
        return None

    def _persist_appointment(self, status: str = "scheduled", duration_minutes: int = 30, notes_extra: Optional[str] = None) -> Dict[str, Any]:
        """
        Ensures a patient exists, then inserts into appointments. Sets _persisted flag on success.
        Returns a dict with details for logging/LLM.
        """
        out: Dict[str, Any] = {
            "stored": False,
            "patient_id": None,
            "appointment_row": None,
            "error": None,
        }

        if not supabase:
            out["error"] = "no_supabase_client"
            logger.warning("Skipping DB persist (no supabase client)")
            return out

        appt_date, appt_time = _split_iso_to_date_time(Assistant.booked_dt)
        if not (appt_date and appt_time):
            out["error"] = "missing_appointment_datetime"
            logger.warning("No appointment datetime set; cannot persist")
            return out

        patient_id = self._ensure_patient()
        out["patient_id"] = patient_id

        try:
            # Prepare patient data for DeepSeek analysis
            patient_data = {
                'full_name': Assistant.patient_full_name,
                'first_name': Assistant.first_name,
                'last_name': Assistant.last_name,
                'ensurance_number': Assistant.ensurance_number,
                'is_private_insurance': Assistant.is_private_insurance,
                'is_first_visit': Assistant.is_first_visit,
                'detailed_condition': Assistant.detailed_condition,
                'pain_description': Assistant.pain_description,
                'pain_duration': Assistant.pain_duration,
                'pain_severity': Assistant.pain_severity,
                'previous_treatments': Assistant.previous_treatments,
                'allergies': Assistant.allergies,
                'medications': Assistant.medications,
                'phone': Assistant.phone,
                'mail': Assistant.mail,
                'birth_date': Assistant.birth_date
            }
            
            # Debug logging for patient data
            logger.info(f"Patient data for DeepSeek: {patient_data}")
            logger.info(f"Assistant class values - detailed_condition: '{Assistant.detailed_condition}', pain_description: '{Assistant.pain_description}', pain_duration: '{Assistant.pain_duration}'")
            
            # Generate executive summary using DeepSeek
            logger.info("Generating executive summary for doctor...")
            doctor_summary = generate_doctor_summary(patient_data)
            
            # Build comprehensive notes with all collected information
            # notes_parts = [
            #     f"Name: {Assistant.patient_full_name or 'N/A'}",
            #     f"Insurance: {Assistant.ensurance_number or 'N/A'}",
            #     f"Private Insurance: {'Yes' if Assistant.is_private_insurance else 'No' if Assistant.is_private_insurance is not None else 'N/A'}",
            #     f"First Visit: {'Yes' if Assistant.is_first_visit else 'No' if Assistant.is_first_visit is not None else 'N/A'}",
            #     f"Condition: {Assistant.detailed_condition or Assistant.pain_description or 'N/A'}",
            #     f"Pain Duration: {Assistant.pain_duration or 'N/A'}",
            #     f"Pain Severity: {Assistant.pain_severity or 'N/A'}",
            #     f"Previous Treatments: {Assistant.previous_treatments or 'N/A'}",
            #     f"Allergies: {Assistant.allergies or 'None reported'}",
            #     f"Medications: {Assistant.medications or 'None reported'}",
            #     f"Contact: Phone={Assistant.phone or 'N/A'}, Email={Assistant.mail or 'N/A'}, DOB={Assistant.birth_date or 'N/A'}"
            # ]
            notes = f"{doctor_summary}"
            
            # Add executive summary if generated successfully
            # if doctor_summary:
            #     notes += f" | DOCTOR SUMMARY: {doctor_summary}"
            #     logger.info("✅ Executive summary generated and added to notes")
            # else:
            #     logger.warning("⚠️ Failed to generate executive summary")
            
            if notes_extra:
                notes += f" | Additional Notes: {notes_extra}"

            row = {
                "patient_id": patient_id,
                "appointment_date": appt_date,            # date
                "appointment_time": appt_time,            # time (HH:MM:SS)
                "treatment": Assistant.pain_description or "Checkup",
                "status": "pending",
                "confirmation_sent": False,
                "duration_minutes": int(duration_minutes) if duration_minutes else 30,
                "notes": notes.strip(),
            }
            res = supabase.table("appointments").insert(row).execute()
            out["stored"] = True
            out["appointment_row"] = res.data or []
            Assistant._persisted = True
            logger.info(f"✅ Appointment stored for patient_id={patient_id} on {appt_date} {appt_time}")
        except Exception as e:
            logger.exception("appointments insert failed")
            out["error"] = str(e)

        return out

    @function_tool
    async def check_and_hold(self, context: RunContext, start_iso: str, status: str = "scheduled", duration_minutes: int = 30):
        """
        Try to hold the requested start time; if free, persist immediately.
        If busy, suggest next free time and DO NOT persist.
        """
        try:
            dt = datetime.fromisoformat(start_iso)
        except Exception:
            return {"ok": False, "reason": "invalid"}

        if _is_free(dt):
            _book_slot(dt)
            Assistant.booked_dt = start_iso
            logger.info(f"Held slot {start_iso}")
            
            # Validate required fields before persisting
            validation = self._validate_required_fields()
            if not validation["valid"]:
                logger.warning(f"Cannot persist appointment: {validation['message']}")
                return {
                    "ok": True, 
                    "held": start_iso, 
                    "formatted": format_datetime_readable(dt),
                    "persist": False,
                    "validation": validation,
                    "message": f"Slot held but appointment not saved yet. Still need: {', '.join(validation['missing_fields'])}"
                }
            
            # Format the datetime for better readability
            formatted_time = format_datetime_readable(dt)
            # Persist immediately (deterministic)
            persist_result = self._persist_appointment(status=status, duration_minutes=duration_minutes)
            return {"ok": True, "held": start_iso, "formatted": formatted_time, "persist": persist_result}

        nf = _find_next_free(dt)
        suggestion = None
        if nf:
            # Format the datetime for better readability
            suggestion_dt = datetime.fromisoformat(f"{nf[0]}T{nf[1]}")
            formatted_time = format_datetime_readable(suggestion_dt)
            suggestion = {"date": nf[0], "time": nf[1], "formatted": formatted_time}
        logger.info(f"Requested slot busy; suggesting {suggestion}")
        return {"ok": False, "reason": "conflict", "suggestion": suggestion}

    @function_tool
    async def complete_appointment(self, context: RunContext):
        """Complete the appointment by persisting to database if all required fields are available."""
        if not Assistant.booked_dt:
            return {"ok": False, "message": "No appointment slot held"}
        
        validation = self._validate_required_fields()
        if not validation["valid"]:
            return {
                "ok": False, 
                "message": f"Cannot complete appointment: {validation['message']}",
                "missing_fields": validation["missing_fields"]
            }
        
        # Persist the appointment
        persist_result = self._persist_appointment()
        return {
            "ok": True, 
            "message": "Appointment completed and saved to database",
            "persist": persist_result
        }

    # ---------- FINALIZE (SAFETY NET) ----------
    @function_tool
    async def finalize_summary(
        self,
        context: RunContext,
        status: str = "scheduled",
        duration_minutes: int = 30,
        notes_extra: Optional[str] = None,
    ):
        """
        Return summary AND, if not already persisted, persist now.
        """
        summary: Dict[str, Any] = {
            "full_name": Assistant.patient_full_name,
            "first_name": Assistant.first_name,
            "last_name": Assistant.last_name,
            "ensurance_number": Assistant.ensurance_number,
            "phone": Assistant.phone,
            "mail": Assistant.mail,
            "birth_date": Assistant.birth_date,
            "treatment": Assistant.pain_description,
            "appointment": Assistant.booked_dt,
            "already_persisted": Assistant._persisted,
            "stored": False,
            "persist": None,
        }

        if not Assistant._persisted:
            summary["persist"] = self._persist_appointment(status=status, duration_minutes=duration_minutes, notes_extra=notes_extra)
            summary["stored"] = bool(summary["persist"] and summary["persist"].get("stored"))
        else:
            summary["stored"] = True

        return summary

# ========= Worker =========
def prewarm(proc: JobProcess):
    proc.userdata["vad"] = silero.VAD.load()

async def entrypoint(ctx: JobContext):
    ctx.log_context_fields = {"room": ctx.room.name}
    
    # Load data from database before starting
    logger.info("Loading patients from database...")
    load_patients_from_db()
    
    logger.info("Loading booked slots from database...")
    load_booked_slots_from_db()

    session = AgentSession(
        stt="assemblyai/universal-streaming:en",
        llm="openai/gpt-4.1-mini",
        tts="cartesia/sonic-2:9626c31c-bec5-4cca-baa8-f8ba9e84c8bc",
        turn_detection=MultilingualModel(),
        vad=ctx.proc.userdata["vad"],
        preemptive_generation=True,
    )

    usage_collector = metrics.UsageCollector()
    @session.on("metrics_collected")
    def _on_metrics_collected(ev: MetricsCollectedEvent):
        metrics.log_metrics(ev.metrics)
        usage_collector.collect(ev.metrics)

    async def log_usage():
        logger.info(f"Usage: {usage_collector.get_summary()}")

    ctx.add_shutdown_callback(log_usage)

    await session.start(
        agent=Assistant(),
        room=ctx.room,
        room_input_options=RoomInputOptions(noise_cancellation=noise_cancellation.BVC()),
    )

    await ctx.connect()
    # Immediate, concise greeting for phone UX
    await session.say("Hello this is Nelly Furtado from AllMed, how can I help you today")

if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint, prewarm_fnc=prewarm))


#+4915203225863

# carlo nummer: C748391
# benjo : B123456
# juan: J654321 
