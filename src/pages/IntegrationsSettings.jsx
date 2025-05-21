import { useState } from 'react';

// This component is for displaying and managing integration settings.
const IntegrationsSettings = () => {
  // Define basic data structures for Firestore storage (in comments)
  /*
  const integrationSettings = {
    calendarIntegrations: {
      googleCalendar: {
        enabled: boolean,
        accessToken: string // Placeholder for token
      },
      outlookCalendar: {
        enabled: boolean,
        accessToken: string // Placeholder for token
      }
    },
    communicationIntegrations: {
      slack: {
        enabled: boolean,
        webhookUrl: string // Placeholder for webhook URL
      },
      microsoftTeams: {
        enabled: boolean,
        webhookUrl: string // Placeholder for webhook URL
      }
    },
    donationIntegrations: {
      stripe: {
        enabled: boolean,
        apiKey: string, // Placeholder for Stripe API Key
        webhookSecret: string // Placeholder for webhook secret
      }
    }
  };
  */

  // State to manage the enabled status of communication integrations for UI purposes
  // In a real app, this would be loaded from Firestore
  const [slackEnabled, setSlackEnabled] = useState(false);
  const [teamsEnabled, setTeamsEnabled] = useState(false);

  const handleConnectCalendar = (calendarType) => {
    console.log(`Attempting to connect with ${calendarType} Calendar...`);
    // TODO: Implement actual OAuth flow or API connection logic here
    // This would typically involve redirecting the user or opening a popup
    // After successful connection, update state and save to Firestore
  };

  const handleToggleCommunication = (platform) => {
    console.log(`Toggling ${platform} notifications...`);
    if (platform === 'slack') {
      setSlackEnabled(!slackEnabled);
      // TODO: Implement logic to enable/disable Slack integration (e.g., save to Firestore)
    } else if (platform === 'teams') {
      setTeamsEnabled(!teamsEnabled);
      // TODO: Implement logic to enable/disable Microsoft Teams integration (e.g., save to Firestore)
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Integrations</h1>

      {/* Calendar Integrations Section */}
      <section className="mb-8 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">Calendar Integrations</h2>
        {/* Buttons stack vertically on smaller screens due to flex-col and space-y-4 */}
        <div className="flex flex-col space-y-4">
          <button
            onClick={() => handleConnectCalendar('Google')}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition ease-in-out duration-150"
          >
            Connect with Google Calendar
          </button>
          <button
            onClick={() => handleConnectCalendar('Outlook')}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition ease-in-out duration-150"
          >
            Connect with Outlook Calendar
          </button>
        </div>
      </section>

      {/* Communication Integrations Section */}
      <section className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">Communication Integrations</h2>
        {/* Integration rows use flex to align items, stacking handled by flex-col parent */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
            <span className="text-gray-700">Enable Slack Notifications</span>
            <label className="flex items-center cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={slackEnabled}
                  onChange={() => handleToggleCommunication('slack')}
                />
                <div
                  className={`block w-14 h-8 rounded-full transition-colors duration-300 ease-in-out ${
                    slackEnabled ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                ></div>
                <div
                  className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-300 ease-in-out ${
                    slackEnabled ? 'transform translate-x-6' : ''
                  }`}
                ></div>
              </div>
            </label>
          </div>
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
            <span className="text-gray-700">Enable Microsoft Teams Notifications</span>
            <label className="flex items-center cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={teamsEnabled}
                  onChange={() => handleToggleCommunication('teams')}
                />
                <div
                  className={`block w-14 h-8 rounded-full transition-colors duration-300 ease-in-out ${
                    teamsEnabled ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                ></div>
                <div
                  className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-300 ease-in-out ${
                    teamsEnabled ? 'transform translate-x-6' : ''
                  }`}
                ></div>
              </div>{/* TODO: Add placeholder for Payment Gateway Integration here */}

            </label>
          </div>{/* TODO: Add placeholder for Payment Gateway Integration here */}

        </div>
      </section>

      {/* Donation Integrations Section */}
      <section className="mb-8 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">Donation Integrations</h2>
        {/* Integration rows use flex to align items, stacking handled by flex-col parent */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
            <span className="text-gray-700">Connect with Stripe</span>
            {/* Placeholder button for connecting */}
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition ease-in-out duration-150"
              onClick={() => console.log('Attempting to connect with Stripe...')}
            >
              Connect
            </button>
          </div>
          {/* TODO: Add more payment gateway options like PayPal */}
        </div>
      </section>
    </div>
  );
};

export default IntegrationsSettings;