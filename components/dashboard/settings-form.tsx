"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "next-themes";

const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  bio: z.string().max(160).optional(),
  jobTitle: z.string().optional(),
  department: z.string().optional(),
});

const notificationsFormSchema = z.object({
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  weeklyDigest: z.boolean(),
  marketingEmails: z.boolean(),
});

const securityFormSchema = z.object({
  twoFactorAuth: z.boolean(),
  sessionTimeout: z.string(),
});

const appearanceFormSchema = z.object({
  theme: z.string(),
  compactMode: z.boolean(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type NotificationsFormValues = z.infer<typeof notificationsFormSchema>;
type SecurityFormValues = z.infer<typeof securityFormSchema>;
type AppearanceFormValues = z.infer<typeof appearanceFormSchema>;

// Profile Tab Component
function ProfileTab({ isLoading, onProfileSubmit, profilePic, setProfilePic }: {
  isLoading: { profile: boolean };
  onProfileSubmit: (data: ProfileFormValues) => void;
  profilePic: string | null;
  setProfilePic: (pic: string | null) => void;
}) {
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "John Doe",
      email: "john.doe@example.com",
      bio: "Senior Sales Manager with 10+ years of experience in enterprise software sales.",
      jobTitle: "Senior Sales Manager",
      department: "Sales",
    },
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setProfilePic(result);
        localStorage.setItem("profilePic", result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setProfilePic(null);
    localStorage.removeItem("profilePic");
  };

  return (
    <TabsContent value="profile">
      <Card className="bg-white border border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Profile</CardTitle>
          <CardDescription className="text-gray-600">
            Manage your profile information and preferences.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-x-6 sm:space-y-0">
            <Avatar className="h-28 w-28 sm:h-24 sm:w-24 border border-blue-200">
              {profilePic ? (
                <AvatarImage src={profilePic} alt="Profile" className="object-cover" />
              ) : (
                <AvatarImage src="/placeholder.svg?height=96&width=96" alt="John Doe" />
              )}
              <AvatarFallback className="bg-gray-200 text-blue-900">JD</AvatarFallback>
            </Avatar>
            <div className="flex flex-col space-y-2">
              <h3 className="text-lg font-medium text-blue-900">Profile Picture</h3>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="imageUpload"
                />
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="bg-gray-200 text-blue-900 border-blue-200 hover:bg-blue-800 hover:text-white w-full sm:w-auto"
                >
                  <label htmlFor="imageUpload">Upload new image</label>
                </Button>
                {profilePic && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-gray-200 text-red-500 border-blue-200 hover:bg-red-600 hover:text-white w-full sm:w-auto"
                    onClick={handleRemoveImage}
                  >
                    Remove
                  </Button>
                )}
              </div>
              <p className="text-sm text-gray-600">JPG, GIF or PNG. Max size of 800K</p>
            </div>
          </div>

          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={profileForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-blue-900">Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your name" {...field} className="border-blue-200" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-blue-900">Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Your email" {...field} className="border-blue-200" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={profileForm.control}
                  name="jobTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-blue-900">Job Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Your job title" {...field} className="border-blue-200" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-blue-900">Department</FormLabel>
                      <FormControl>
                        <Input placeholder="Your department" {...field} className="border-blue-200" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={profileForm.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-blue-900">Bio</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us a little bit about yourself"
                        className="resize-none border-blue-200"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-gray-600">
                      Brief description for your profile. URLs are hyperlinked.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <CardFooter className="px-0">
                <Button
                  type="submit"
                  disabled={isLoading.profile}
                  className="bg-blue-600 text-white hover:bg-blue-800"
                >
                  {isLoading.profile ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" /> Save changes
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </TabsContent>
  );
}

// Notifications Tab Component
function NotificationsTab({ isLoading, onNotificationsSubmit }: {
  isLoading: { notifications: boolean };
  onNotificationsSubmit: (data: NotificationsFormValues) => void;
}) {
  const notificationsForm = useForm<NotificationsFormValues>({
    resolver: zodResolver(notificationsFormSchema),
    defaultValues: {
      emailNotifications: true,
      pushNotifications: true,
      weeklyDigest: true,
      marketingEmails: false,
    },
  });

  return (
    <TabsContent value="notifications">
      <Card className="bg-white border border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Notifications</CardTitle>
          <CardDescription className="text-gray-600">
            Manage how you receive notifications.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...notificationsForm}>
            <form
              onSubmit={notificationsForm.handleSubmit(onNotificationsSubmit)}
              className="space-y-4"
            >
              <FormField
                control={notificationsForm.control}
                name="emailNotifications"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-blue-200 p-4 bg-white">
                    <div className="space-y-0.5">
                      <FormLabel className="text-blue-900 text-base">
                        Email Notifications
                      </FormLabel>
                      <FormDescription className="text-gray-600">
                        Receive notifications via email.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="bg-gray-200 data-[state=checked]:bg-blue-600"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={notificationsForm.control}
                name="pushNotifications"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-blue-200 p-4 bg-white">
                    <div className="space-y-0.5">
                      <FormLabel className="text-blue-900 text-base">
                        Push Notifications
                      </FormLabel>
                      <FormDescription className="text-gray-600">
                        Receive push notifications in the app.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="bg-gray-200 data-[state=checked]:bg-blue-600"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={notificationsForm.control}
                name="weeklyDigest"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-blue-200 p-4 bg-white">
                    <div className="space-y-0.5">
                      <FormLabel className="text-blue-900 text-base">
                        Weekly Digest
                      </FormLabel>
                      <FormDescription className="text-gray-600">
                        Receive a weekly summary of your activity.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="bg-gray-200 data-[state=checked]:bg-blue-600"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={notificationsForm.control}
                name="marketingEmails"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-blue-200 p-4 bg-white">
                    <div className="space-y-0.5">
                      <FormLabel className="text-blue-900 text-base">
                        Marketing Emails
                      </FormLabel>
                      <FormDescription className="text-gray-600">
                        Receive emails about new products, features, and more.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="bg-gray-200 data-[state=checked]:bg-blue-600"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <CardFooter className="px-0">
                <Button
                  type="submit"
                  disabled={isLoading.notifications}
                  className="bg-blue-600 text-white hover:bg-blue-800"
                >
                  {isLoading.notifications ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" /> Save changes
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </TabsContent>
  );
}

// Security Tab Component
function SecurityTab({ isLoading, onSecuritySubmit }: {
  isLoading: { security: boolean };
  onSecuritySubmit: (data: SecurityFormValues) => void;
}) {
  const securityForm = useForm<SecurityFormValues>({
    resolver: zodResolver(securityFormSchema),
    defaultValues: {
      twoFactorAuth: true,
      sessionTimeout: "30",
    },
  });

  return (
    <TabsContent value="security">
      <Card className="bg-white border border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Security</CardTitle>
          <CardDescription className="text-gray-600">
            Manage your security settings and preferences.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-blue-900">Password</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Button
                  variant="outline"
                  className="bg-gray-200 text-blue-900 border-blue-200 hover:bg-blue-800 hover:text-white"
                >
                  Change password
                </Button>
              </div>
              <div>
                <p className="text-sm text-gray-600">Last changed: 3 months ago</p>
              </div>
            </div>
          </div>

          <Form {...securityForm}>
            <form
              onSubmit={securityForm.handleSubmit(onSecuritySubmit)}
              className="space-y-4"
            >
              <FormField
                control={securityForm.control}
                name="twoFactorAuth"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-blue-200 p-4 bg-white">
                    <div className="space-y-0.5">
                      <FormLabel className="text-blue-900 text-base">
                        Two-Factor Authentication
                      </FormLabel>
                      <FormDescription className="text-gray-600">
                        Add an extra layer of security to your account.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="bg-gray-200 data-[state=checked]:bg-blue-600"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={securityForm.control}
                name="sessionTimeout"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-blue-900">
                      Session Timeout (minutes)
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="border-blue-200 focus:border-blue-600">
                          <SelectValue placeholder="Select a timeout period" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white border-blue-200">
                        <SelectItem value="15" className="text-blue-900">
                          15 minutes
                        </SelectItem>
                        <SelectItem value="30" className="text-blue-900">
                          30 minutes
                        </SelectItem>
                        <SelectItem value="60" className="text-blue-900">
                          1 hour
                        </SelectItem>
                        <SelectItem value="120" className="text-blue-900">
                          2 hours
                        </SelectItem>
                        <SelectItem value="240" className="text-blue-900">
                          4 hours
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-gray-600">
                      Your session will expire after this period of inactivity.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <CardFooter className="px-0">
                <Button
                  type="submit"
                  disabled={isLoading.security}
                  className="bg-blue-600 text-white hover:bg-blue-800"
                >
                  {isLoading.security ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" /> Save changes
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </TabsContent>
  );
}

// Appearance Tab Component
function AppearanceTab({ isLoading, onAppearanceSubmit }: {
  isLoading: { appearance: boolean };
  onAppearanceSubmit: (data: AppearanceFormValues) => void;
}) {
  const appearanceForm = useForm<AppearanceFormValues>({
    resolver: zodResolver(appearanceFormSchema),
    defaultValues: {
      theme: "system",
      compactMode: false,
    },
  });

  return (
    <TabsContent value="appearance">
      <Card className="bg-white border border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Appearance</CardTitle>
          <CardDescription className="text-gray-600">
            Customize the appearance of the application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...appearanceForm}>
            <form
              onSubmit={appearanceForm.handleSubmit(onAppearanceSubmit)}
              className="space-y-4"
            >
              <FormField
                control={appearanceForm.control}
                name="theme"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-blue-900">Theme</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="border-blue-200 focus:border-blue-600">
                          <SelectValue placeholder="Select a theme" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white border-blue-200">
                        <SelectItem value="light" className="text-blue-900">
                          Light
                        </SelectItem>
                        <SelectItem value="dark" className="text-blue-900">
                          Dark
                        </SelectItem>
                        <SelectItem value="system" className="text-blue-900">
                          System
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-gray-600">
                      Select the theme for the dashboard.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={appearanceForm.control}
                name="compactMode"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-blue-200 p-4 bg-white">
                    <div className="space-y-0.5">
                      <FormLabel className="text-blue-900 text-base">
                        Compact Mode
                      </FormLabel>
                      <FormDescription className="text-gray-600">
                        Display more content on the screen with a compact layout.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="bg-gray-200 data-[state=checked]:bg-blue-600"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <CardFooter className="px-0">
                <Button
                  type="submit"
                  disabled={isLoading.appearance}
                  className="bg-blue-600 text-white hover:bg-blue-800"
                >
                  {isLoading.appearance ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" /> Save changes
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </TabsContent>
  );
}

// Main SettingsForm Component
export function SettingsForm() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState<{
    profile: boolean;
    notifications: boolean;
    security: boolean;
    appearance: boolean;
  }>({
    profile: false,
    notifications: false,
    security: false,
    appearance: false,
  });
  const [profilePic, setProfilePic] = useState<string | null>(
    localStorage.getItem("profilePic") || null
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && theme) {
      appearanceForm.setValue("theme", theme);
    }
  }, [mounted, theme]);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "John Doe",
      email: "john.doe@example.com",
      bio: "Senior Sales Manager with 10+ years of experience in enterprise software sales.",
      jobTitle: "Senior Sales Manager",
      department: "Sales",
    },
  });

  const notificationsForm = useForm<NotificationsFormValues>({
    resolver: zodResolver(notificationsFormSchema),
    defaultValues: {
      emailNotifications: true,
      pushNotifications: true,
      weeklyDigest: true,
      marketingEmails: false,
    },
  });

  const securityForm = useForm<SecurityFormValues>({
    resolver: zodResolver(securityFormSchema),
    defaultValues: {
      twoFactorAuth: true,
      sessionTimeout: "30",
    },
  });

  const appearanceForm = useForm<AppearanceFormValues>({
    resolver: zodResolver(appearanceFormSchema),
    defaultValues: {
      theme: "system",
      compactMode: false,
    },
  });

  async function onProfileSubmit(data: ProfileFormValues) {
    setIsLoading((prev) => ({ ...prev, profile: true }));
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading((prev) => ({ ...prev, profile: false }));
    }
  }

  async function onNotificationsSubmit(data: NotificationsFormValues) {
    setIsLoading((prev) => ({ ...prev, notifications: true }));
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast({
        title: "Notification preferences updated",
        description: "Your notification preferences have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading((prev) => ({ ...prev, notifications: false }));
    }
  }

  async function onSecuritySubmit(data: SecurityFormValues) {
    setIsLoading((prev) => ({ ...prev, security: true }));
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast({
        title: "Security settings updated",
        description: "Your security settings have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading((prev) => ({ ...prev, security: false }));
    }
  }

  async function onAppearanceSubmit(data: AppearanceFormValues) {
    setIsLoading((prev) => ({ ...prev, appearance: true }));
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      if (data.theme) {
        setTheme(data.theme);
      }
      toast({
        title: "Appearance settings updated",
        description: "Your appearance settings have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading((prev) => ({ ...prev, appearance: false }));
    }
  }

  if (!mounted) {
    return null;
  }

  return (
    <Tabs
      defaultValue="profile"
      className="space-y-4"
      onValueChange={(value) => {
        // Stop event propagation to prevent sidebar state changes
      }}
    >
      <TabsList className="grid w-full grid-cols-4 md:w-auto">
        <TabsTrigger type="button" value="profile" className="text-blue-900">
          Profile
        </TabsTrigger>
        <TabsTrigger type="button" value="notifications" className="text-blue-900">
          Notifications
        </TabsTrigger>
        <TabsTrigger type="button" value="security" className="text-blue-900">
          Security
        </TabsTrigger>
        <TabsTrigger type="button" value="appearance" className="text-blue-900">
          Appearance
        </TabsTrigger>
      </TabsList>
      <ProfileTab
        isLoading={isLoading}
        onProfileSubmit={onProfileSubmit}
        profilePic={profilePic}
        setProfilePic={setProfilePic}
      />
      <NotificationsTab
        isLoading={isLoading}
        onNotificationsSubmit={onNotificationsSubmit}
      />
      <SecurityTab isLoading={isLoading} onSecuritySubmit={onSecuritySubmit} />
      <AppearanceTab isLoading={isLoading} onAppearanceSubmit={onAppearanceSubmit} />
    </Tabs>
  );
}