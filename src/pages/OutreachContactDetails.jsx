import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/authContext';
import { useParams } from 'react-router-dom';

function OutreachContactDetails() {
  const { contactId } = useParams();

  return (
    <div>

      <h2>Outreach Contact Details for: {contactId}</h2>
      <p>Details for this contact will be displayed here.</p>
      {/* TODO: Fetch and display contact details using contactId */}
    </div>
  );
}

export default OutreachContactDetails;