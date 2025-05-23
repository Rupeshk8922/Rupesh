import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/authContext'; // Adjust import path
import { db, auth } from '@/firebase/config'; // Adjust import path
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Spinner } from '@/components/ui/spinner';

// Define validation schema using Zod
const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  phone: z.string().optional(), // Optional field
  // Add fields for assigned events or officers if needed, with appropriate validation
});

const allowedRoles = ['admin', 'officer'];

const CreateVolunteerPage = () => {
  const navigate = useNavigate();
  const { user, userRole, authLoading, companyId } = useAuth();
  const { toast } = useToast();

  const [submissionLoading, setSubmissionLoading] = useState(false);

  // Initialize form with react-hook-form and zodResolver
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
    },
  });

  // Check access on component mount and when auth state changes
  useEffect(() => {
    if (!authLoading) {
      if (!user || !allowedRoles.includes(userRole)) {
        // Use Navigate component for declarative routing based on state/auth
        // The component will render null if allowed, and <Navigate /> if not
      }
    }
  }, [user, userRole, authLoading]); // Depend on user, userRole, authLoading

  // Handle form submission
  const onSubmit = async (values) => {
    setSubmissionLoading(true);
    try {
      // 1. Create user in Firebase Authentication
      // Note: Creating users on the client side like this is generally discouraged
      // for security reasons. A better approach would be to use a Cloud Function
      // triggered by an admin to create users. For demonstration purposes,
      // we'll include it here.
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, 'temporary-password'); // Consider generating/sending a temporary password securely

      // 2. Create volunteer document in Firestore
      const volunteerData = {
        uid: userCredential.user.uid, // Link to Auth user
        name: values.name,
        email: values.email,
        phone: values.phone,
        companyId: companyId, // Associate with the current user's company
        role: 'volunteer', // Assign default volunteer role
        createdAt: serverTimestamp(),
        createdBy: user.uid, // Record who created the volunteer
        // Add other relevant volunteer fields here
      };

      await addDoc(collection(db, 'volunteers'), volunteerData); // Use 'volunteers' collection

      toast({
        title: 'Volunteer Created',
        description: `${values.name} has been added as a volunteer.`,
        variant: 'default',
      });

      // Optionally navigate to the volunteers list page
      navigate('/dashboard/crm/volunteers');

    } catch (error) {
      console.error('Error creating volunteer:', error);
      let errorMessage = 'Failed to create volunteer. Please try again.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'The email address is already in use by another account.';
      } else if (error.message) {
         errorMessage = `Error: ${error.message}`;
      }

      toast({
        title: 'Creation Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setSubmissionLoading(false);
    }
  };

  // Render loading or access denied states
  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
        <p className="ml-2">Checking access...</p>
      </div>
    );
  }

  if (!user || !allowedRoles.includes(userRole)) {
    return <Navigate to="/access-denied" />;
  }


  return (
    <div className="p-4 md:p-6">
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>Create New Volunteer</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Volunteer's full name" {...field} disabled={submissionLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="volunteer@example.com" {...field} disabled={submissionLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone (Optional)</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="e.g., +1 123 456 7890" {...field} disabled={submissionLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Add fields here for assigning to events or officers */}
              {/* Example (requires fetching event/officer data and implementing Select/MultiSelect): */}
              {/*
              <FormField
                control={form.control}
                name="assignedEvents"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assign to Events</FormLabel>
                    <FormControl>
                      <MultiSelect options={eventOptions} {...field} disabled={submissionLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="assignedOfficer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assigned Officer</FormLabel>
                    <FormControl>
                      <OfficerSelect options={officerOptions} {...field} disabled={submissionLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              */}


              <Button type="submit" className="w-full" disabled={submissionLoading}>
                {submissionLoading ? <><Spinner size="sm" className="mr-2" /> Creating...</> : 'Create Volunteer'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateVolunteerPage;