import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "sonner";
import { useState } from "react";

const Settings = () => {
  const [openSections, setOpenSections] = useState({
    clinicInfo: false,
    workingHours: false,
    notifications: false,
    appointmentSettings: false,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSave = () => {
    toast.success("Settings saved successfully!");
  };

  return (
    <div className="h-full overflow-auto space-y-6 pb-24">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your clinic preferences and notifications.</p>
      </div>

      <div className="space-y-4">
        <Collapsible open={openSections.clinicInfo} onOpenChange={() => toggleSection('clinicInfo')}>
          <Card>
            <CardContent className="p-0">
              <div className="flex items-center gap-4 p-4">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    {openSections.clinicInfo ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CardHeader className="p-0 flex-1">
                  <CardTitle>Clinic Information</CardTitle>
                  <CardDescription>Update your clinic details and contact information.</CardDescription>
                </CardHeader>
              </div>
              <CollapsibleContent>
                <div className="border-t border-border p-6 space-y-4">
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
                </div>
              </CollapsibleContent>
            </CardContent>
          </Card>
        </Collapsible>

        <Collapsible open={openSections.workingHours} onOpenChange={() => toggleSection('workingHours')}>
          <Card>
            <CardContent className="p-0">
              <div className="flex items-center gap-4 p-4">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    {openSections.workingHours ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CardHeader className="p-0 flex-1">
                  <CardTitle>Working Hours</CardTitle>
                  <CardDescription>Set your clinic's operating hours.</CardDescription>
                </CardHeader>
              </div>
              <CollapsibleContent>
                <div className="border-t border-border p-6 space-y-4">
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
                </div>
              </CollapsibleContent>
            </CardContent>
          </Card>
        </Collapsible>

        <Collapsible open={openSections.notifications} onOpenChange={() => toggleSection('notifications')}>
          <Card>
            <CardContent className="p-0">
              <div className="flex items-center gap-4 p-4">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    {openSections.notifications ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CardHeader className="p-0 flex-1">
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>Configure how you receive appointment reminders.</CardDescription>
                </CardHeader>
              </div>
              <CollapsibleContent>
                <div className="border-t border-border p-6 space-y-4">
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
                </div>
              </CollapsibleContent>
            </CardContent>
          </Card>
        </Collapsible>

        <Collapsible open={openSections.appointmentSettings} onOpenChange={() => toggleSection('appointmentSettings')}>
          <Card>
            <CardContent className="p-0">
              <div className="flex items-center gap-4 p-4">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    {openSections.appointmentSettings ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CardHeader className="p-0 flex-1">
                  <CardTitle>Appointment Settings</CardTitle>
                  <CardDescription>Configure default appointment durations.</CardDescription>
                </CardHeader>
              </div>
              <CollapsibleContent>
                <div className="border-t border-border p-6 space-y-4">
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
                </div>
              </CollapsibleContent>
            </CardContent>
          </Card>
        </Collapsible>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-t border-border p-4">
        <div className="max-w-7xl mx-auto flex justify-end">
          <Button onClick={handleSave} size="lg">
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
