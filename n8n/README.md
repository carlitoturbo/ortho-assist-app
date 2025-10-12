We have created an n8n workflow to notify users when their appointment is accepted or declined.

https://carlitooo.app.n8n.cloud/workflow/3ory5U8MGQ04cFDK

Whenever the Appointments table in Supabase is updated, Supabase triggers a POST webhook call to
https://carlitooo.app.n8n.cloud/webhook/status.

The workflow checks whether the confirmation_sent flag is false and, if so, sends the appropriate message depending on whether the appointment was accepted or declined.