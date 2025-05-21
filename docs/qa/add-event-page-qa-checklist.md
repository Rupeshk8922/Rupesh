# Add Event Page QA Checklist

This checklist is for verifying the functionality and appearance of the `AddEventPage` component (`src/pages/dashboard/crm/events/AddEventPage.jsx`).

**Based on Requirements:**

*   **Page:** `src/pages/dashboard/crm/events/AddEventPage.jsx`
*   **UI Library:** ShadCN + Tailwind
*   **Fields:** `eventName`, `description`, `location`, `date`, `assignedOfficer`
*   **Validation:** All fields required, validate date format (basic check)
*   **Firestore Collection:** `events`
*   **Toast Notifications:** Add toast messages for success and error
*   **Role-Based Access:** Accessible by 'admin' and 'outreach\_officer' roles
*   **Route:** `/dashboard/crm/events/add`
*   **Styling:** Tailwind + ShadCN
*   **Functionality:** Add new event to Firestore

---

## Access Control

- [ ] Log in as a user with the 'admin' role and navigate to `/dashboard/crm/events/add`.
    - [ ] Verify the Add Event page is accessible.
- [ ] Log in as a user with the 'outreach\_officer' role and navigate to `/dashboard/crm/events/add`.
    - [ ] Verify the Add Event page is accessible.
- [ ] Log in as a user with a role other than 'admin' or 'outreach\_officer' (e.g., 'user', 'client').
    - [ ] Verify navigating to `/dashboard/crm/events/add` redirects to an access denied page or homepage.
- [ ] Log out and attempt to access `/dashboard/crm/events/add`.
    - [ ] Verify the user is redirected to the login page or access denied page.

## Form Rendering and Styling

- [ ] Navigate to the Add Event page (`/dashboard/crm/events/add`).
    - [ ] Verify the ShadCN `Card` component is rendered correctly as a container.
    - [ ] Verify the page title "Add New Event" is displayed.
    - [ ] Verify all required fields (`eventName`, `description`, `location`, `date`, `assignedOfficer`) are present.
    - [ ] Verify each field has a corresponding `Label`.
    - [ ] Verify the form uses ShadCN `Input`, `Textarea`, and `Select` components.
    - [ ] Verify the submit button uses the ShadCN `Button` component and displays "Add Event".
    - [ ] Verify basic TailwindCSS styling is applied (e.g., spacing, layout within the card).
    - [ ] Verify the "Assigned Officer" dropdown is populated with actual officers.

## Input Field Behavior

- [ ] Interact with the `eventName`, `description`, and `location` `Input`/`Textarea` fields.
    - [ ] Verify typing updates the input value correctly.
- [ ] Interact with the `date` input field.
    - [ ] Verify selecting a date updates the input value.
- [ ] Interact with the `assignedOfficer` `Select` dropdown.
    - [ ] Verify opening the dropdown shows the list of officers.
    - [ ] Verify selecting an officer updates the selected value displayed in the trigger.

## Validation

- [ ] Attempt to submit the form without filling any required fields.
    - [ ] Verify validation error messages are displayed below each empty required field.
    - [ ] Verify a destructive toast notification with a validation error message appears.
    - [ ] Verify the form is NOT submitted to Firestore.
- [ ] Fill in some required fields but leave others empty.
    - [ ] Verify error messages are only shown for the empty required fields.
    - [ ] Verify a destructive toast notification appears.
    - [ ] Verify the form is NOT submitted.
- [ ] Enter invalid data in a field (e.g., potentially non-date format if input type is text, though `type="date"` handles basic format).
    - [ ] Verify relevant validation error messages appear (if basic format check is implemented).
- [ ] Fill in all required fields with valid data.
    - [ ] Verify submitting the form passes validation.
    - [ ] Verify form errors are cleared.

## Firestore Integration

- [ ] Fill in all required fields with valid data and submit the form.
    - [ ] Using Firestore console or tools, verify a new document is created in the `events` collection.
    - [ ] Verify the newly created document contains the correct data from the form fields (`eventName`, `description`, `location`).
    - [ ] Verify the `date` field is stored in the expected format.
    - [ ] Verify the `assignedOfficerUid` field is correctly stored with the UID of the selected officer.
    - [ ] Verify `createdAt`, `createdByUid`, `createdByName`, and `companyId` fields are correctly populated (based on your application's logic).

## Toast Notifications

- [ ] Attempt to submit the form with validation errors.
    - [ ] Verify a destructive toast notification appears with a relevant validation message.
- [ ] Successfully submit the form with valid data.
    - [ ] Verify a default (success) toast notification appears with a confirmation message ("Event Added" or similar).
- [ ] Simulate a Firestore error during submission (if possible, or manually test the catch block).
    - [ ] Verify a destructive toast notification appears with an error message ("Failed to add event..." or similar).

## Loading States

- [ ] Submit the form.
    - [ ] Verify the submit button text changes to a loading indicator ("Adding Event..." or similar).
    - [ ] Verify the submit button is disabled while loading.
    - [ ] Verify input fields are disabled while loading.
    - [ ] Verify the loading state resolves (button re-enables, text reverts) after the Firestore operation completes (success or error).
- [ ] Verify a loading indicator is shown when the page initially loads while fetching auth status and officers.

## Navigation/Redirection

- [ ] Successfully submit the form.
    - [ ] Verify if the page redirects to a different route (e.g., event view page) as intended. If no redirection is intended, verify the form resets or shows a success state.

---

**Auto QA Placeholder:**

*   TODO: Integrate automated testing for form validation and basic rendering.

---

**Documentation Update Task:**

*   TODO: Update project documentation to include details about the AddEventPage component, its functionality, access roles, and the structure of the `events` collection in Firestore.