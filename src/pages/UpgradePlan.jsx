import React, { useState } from 'react';
import { Button, Snackbar, Alert } from '@mui/material';
import '../styles/UpgradePlan.css';
import { useAuth } from '../contexts/authContext'; // Assuming useAuth is needed here
 
const UpgradePlan = () => {
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
 
  const handleCloseSnackbar = () => setOpenSnackbar(false);
 
  return (
    // Mobile Responsiveness: The .upgrade-plan-page class might have padding or max-width rules.
    // Ensure these are responsive. Using Tailwind's p-4 or similar and max-w-md mx-auto could help center
    // content on larger screens while allowing full width on small screens.
    <div className="upgrade-plan-page">
      <div className="upgrade-container">
        <h2>Upgrade Your Plan</h2>
        <p>
          Unlock additional features, priority support, and more by upgrading your plan.
          With a higher plan, you’ll be able to access exclusive tools and services.
        </p>

        <div className="plan-benefits">
          {/* Mobile Responsiveness: Ensure the list items stack clearly on small screens. */}
          {/* The .plan-benefits class likely controls the list styling. Add responsive spacing if needed. */}
          <ul>
            <li>Priority customer support</li>
            <li>Access to premium features</li>
            <li>Increased limits on usage</li>
            {/* Ensure list items have sufficient bottom margin on mobile. Tailwind: mb-2 */}
            {/* Text within list items should be readable. Tailwind: text-base */}
            <li>Customizable solutions for your needs</li>
          </ul>
        </div>

        <p>
          Call us directly at{' '}
          <a href="tel:+918010877754" aria-label="Call us at 8010877754">
            8010877754
          </a>{' '}
          to discuss upgrade options.
        </p>

        {/* Mobile Responsiveness: Snackbar is a Material UI component, generally responsive. */}
        {/* Ensure its positioning and size are appropriate for different screen sizes. sx={{ width: '100%' }} is good for full width. */}
        {/* Basic Error Handling */}
        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
        >
          <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>

        {/* Mobile Responsiveness: .cta-container likely wraps the button. */}
        {/* Ensure the button is centered or takes appropriate width on mobile. Tailwind: text-center or w-full */}
        <div className="cta-container">
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              try {
                window.location.href = "tel:+918010877754";
                // For a better mobile experience, consider using a dedicated
                // call intent if developing a native app or PWA.
                // This current approach works for web but might not be ideal in all PWA contexts.
              } catch (error) {
                console.error("Error initiating call:", error);
                setSnackbarMessage("Could not initiate call. Please try again or dial manually.");
                setOpenSnackbar(true);
              }
            }}
            aria-label="Click to call for upgrade options"
          >
            {/* Mobile Responsiveness: Ensure button text is readable and the button has enough touch area. */}
            {/* Material UI buttons are generally fine, but check padding on smaller screens. */}
            {/* Consider making the button full width on very small screens. Tailwind: w-full */}
            Call for Upgrade
          </Button>
        </div>
      </div>
    </div>
  );
}

export default UpgradePlan;