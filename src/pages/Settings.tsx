import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "sonner";

const Settings = () => {
  const handleSave = () => {
    toast.success("Settings saved successfully!");
  };

  return (
    <div className="h-full overflow-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your clinic preferences and notifications.</p>
      </div>

      <Accordion type="multiple" className="space-y-4">
        <AccordionItem value="clinic-info" className="border rounded-lg">
          <Card className="border-0">
            <AccordionTrigger className="px-6 hover:no-underline [&>div]:flex-1 [&>div]:text-right">
              <CardHeader className="p-0">
                <CardTitle>Clinic Information</CardTitle>
                <CardDescription>Update your clinic details and contact information.</CardDescription>
              </CardHeader>
            </AccordionTrigger>
            <AccordionContent>
              <CardContent className="space-y-4 pt-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="clinicName">Clinic Name</Label>
                    <Input id="clinicName" defaultValue="DentalCare Clinic" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" defaultValue="(555) 123-4567" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" defaultValue="clinic@dentalcare.com" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" defaultValue="123 Dental Street, Medical District" />
                </div>
              </CardContent>
            </AccordionContent>
          </Card>
        </AccordionItem>

        <AccordionItem value="working-hours" className="border rounded-lg">
          <Card className="border-0">
            <AccordionTrigger className="px-6 hover:no-underline [&>div]:flex-1 [&>div]:text-right">
              <CardHeader className="p-0">
                <CardTitle>Working Hours</CardTitle>
                <CardDescription>Set your clinic's operating hours.</CardDescription>
              </CardHeader>
            </AccordionTrigger>
            <AccordionContent>
              <CardContent className="space-y-4 pt-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="openTime">Opening Time</Label>
                    <Input id="openTime" type="time" defaultValue="09:00" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="closeTime">Closing Time</Label>
                    <Input id="closeTime" type="time" defaultValue="17:00" />
                  </div>
                </div>
              </CardContent>
            </AccordionContent>
          </Card>
        </AccordionItem>

        <AccordionItem value="notifications" className="border rounded-lg">
          <Card className="border-0">
            <AccordionTrigger className="px-6 hover:no-underline [&>div]:flex-1 [&>div]:text-right">
              <CardHeader className="p-0">
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Configure how you receive appointment reminders.</CardDescription>
              </CardHeader>
            </AccordionTrigger>
            <AccordionContent>
              <CardContent className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive appointment reminders via email</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send SMS reminders to patients</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Daily Summary</Label>
                    <p className="text-sm text-muted-foreground">Get a daily summary of appointments</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </AccordionContent>
          </Card>
        </AccordionItem>

        <AccordionItem value="appointment-settings" className="border rounded-lg">
          <Card className="border-0">
            <AccordionTrigger className="px-6 hover:no-underline [&>div]:flex-1 [&>div]:text-right">
              <CardHeader className="p-0">
                <CardTitle>Appointment Settings</CardTitle>
                <CardDescription>Configure default appointment durations.</CardDescription>
              </CardHeader>
            </AccordionTrigger>
            <AccordionContent>
              <CardContent className="space-y-4 pt-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="defaultDuration">Default Duration (minutes)</Label>
                    <Input id="defaultDuration" type="number" defaultValue="30" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bufferTime">Buffer Time (minutes)</Label>
                    <Input id="bufferTime" type="number" defaultValue="15" />
                  </div>
                </div>
              </CardContent>
            </AccordionContent>
          </Card>
        </AccordionItem>
      </Accordion>

      <div className="flex justify-end mt-6">
        <Button onClick={handleSave} size="lg">
          Save Settings
        </Button>
      </div>
    </div>
  );
};

export default Settings;
