# Add Event Page Documentation

## Purpose
The Add Event page allows authorized users (admin and outreach officers) to create new event records in the system by filling out a form. The page validates inputs and saves event details to Firestore.

## Usage
- Accessible at route: `/dashboard/crm/events/add`
- Restricted to users with roles: `admin`, `outreach_officer`
- Users fill out the form and submit to create an event.

## Form Input Fields

| Field Name          | Label               | Input Type  | Validation Rules                       | Description                    |
|---------------------|---------------------|-------------|-------------------------------------|-------------------------------|
| `eventName`         | Event Name          | Text        | Required, max length 100             | The name/title of the event.  |
| `eventDate`         | Event Date          | Date Picker | Required                            | The date when the event occurs.|
| `assignedOfficer`   | Assigned Officer    | Dropdown    | Required                            | Select an officer responsible for the event.|
| `description`       | Description         | TextArea    | Optional, max length 500             | Additional details about the event. |
| ...                 | ...                 | ...         | ...                                 | ...                           |

*(Fill the table with all fields from the form)*

## UX Behavior
- Success toast notification appears on successful event creation.
- Error toast notification appears if submission fails.
- After submission, user is redirected to the events list page.

## Firestore `events` Collection Schema

| Field Name          | Data Type  | Required | Description                          |
|---------------------|------------|----------|------------------------------------|
| `eventName`         | String     | Yes      | The title of the event.             |
| `eventDate`         | Timestamp  | Yes      | The scheduled date of the event.   |
| `assignedOfficer`   | Reference  | Yes      | Firestore reference to the officer's user document. |
| `description`       | String     | No       | Optional additional event details.  |
| `createdAt`         | Timestamp  | Yes      | Timestamp when the event was created.|
| ...                 | ...        | ...      | ...                                |

*(Add all relevant Firestore fields here)*

---

## 4. Review and Finalize
- Review your documentation for clarity, completeness, and accuracy.
- Add links to related documents or code files if helpful.
- Save and commit the documentation file in your repository.

---

If you want, I can help you generate a complete initial draft of this documentation based on your current AddEventPage.jsx code and Firestore schema. Would you like me to do that?
