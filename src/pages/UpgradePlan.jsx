import { useState } from 'react';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

const UpgradePlan = () => {
  const [openSnackbar, setOpenSnackbar] = useState(false);

  return (
    <div className="upgrade-plan-page p-4 max-w-md mx-auto">
      <div className="upgrade-container space-y-6">
        <h2 className="text-2xl font-semibold">Upgrade Your Plan</h2>
        <p className="text-base leading-relaxed">
          Unlock additional features, priority support, and more by upgrading your plan.
          With a higher plan, you’ll be able to access exclusive tools and services.
        </p>

        <div className="plan-benefits">
          <ul className="list-disc list-inside space-y-2 text-base">
            <li>Priority customer support</li>
            <li>Access to premium features</li>
            <li>Increased limits on usage</li>
            <li>Customizable solutions for your needs</li>
          </ul>
        </div>

        <p className="text-base">
          Call us directly at{' '}
          <a href="tel:+918010877754" className="text-blue-600 underline" aria-label="Call us at 8010877754">
            8010877754
          </a>{' '}
          to discuss upgrade options.
        </p>

        <div className="cta-container">
          <a href="tel:+918010877754" aria-label="Click to call for upgrade options">
            <Button variant="contained" color="primary" fullWidth>
              Call for Upgrade
            </Button>
          </a>
        </div>
      </div>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={4000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setOpenSnackbar(false)}>
          Failed to initiate call. Please try again.
        </Alert>
      </Snackbar>
    </div>
  );
};

export default UpgradePlan;
