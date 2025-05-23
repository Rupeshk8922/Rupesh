import { useState } from 'react';

// Component to display/manage integration settings
const IntegrationsSettings = () => {
  /*
  Firestore structure example (for reference):
  const integrationSettings = {
    calendarIntegrations: {
      googleCalendar: { enabled: boolean, accessToken: string },
      outlookCalendar: { enabled: boolean, accessToken: string }
    },
    communicationIntegrations: {
      slack: { enabled: boolean, webhookUrl: string },
      microsoftTeams: { enabled: boolean, webhookUrl: string }
    },
    donationIntegrations: {
      stripe: { enabled: boolean, apiKey: string, webhookSecret: string }
    }
  };
  */

  // UI state (in real app, load/save from Firestore)
  const [slackEnabled, setSlackEnabled] = useState(false);
  const [teamsEnabled, setTeamsEnabled] = useState(false);

  const handleConnectCalendar = (calendarType) => {
    console.log(`Attempting to connect with ${calendarType} Calendar...`);
    // TODO: Implement OAuth or API connection here
  };

  const handleToggleCommunication = (platform) => {
    if (platform === 'slack') {
      setSlackEnabled(!slackEnabled);
      // TODO: Save slackEnabled to Firestore
    } else if (platform === 'teams') {
      setTeamsEnabled(!teamsEnabled);
      // TODO: Save teamsEnabled to Firestore
    }
    console.log(`Toggled ${platform} integration.`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Integrations</h1>

      {/* Calendar Integrations */}
      <section className="mb-8 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">Calendar Integrations</h2>
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

      {/* Communication Integrations */}
      <section className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">Communication Integrations</h2>
        <div className="flex flex-col space-y-4">
          {/** Slack toggle **/}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
            <span className="text-gray-700">Enable Slack Notifications</span>
            <label className="flex items-center cursor-pointer relative">
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
              />
              <div
                className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full shadow-md transition-transform duration-300 ease-in-out ${
                  slackEnabled ? 'translate-x-6' : ''
                }`}
                style={{ willChange: 'transform' }}
              />
            </label>
          </div>

          {/** Microsoft Teams toggle **/}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
            <span className="text-gray-700">Enable Microsoft Teams Notifications</span>
            <label className="flex items-center cursor-pointer relative">
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
              />
              <div
                className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full shadow-md transition-transform duration-300 ease-in-out ${
                  teamsEnabled ? 'translate-x-6' : ''
                }`}
                style={{ willChange: 'transform' }}
              />
            </label>
          </div>
        </div>
      </section>

      {/* Donation Integrations */}
      <section className="mt-8 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">Donation Integrations</h2>
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
            <span className="text-gray-700">Connect with Stripe</span>
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition ease-in-out duration-150"
              onClick={() => console.log('Attempting to connect with Stripe...')}
            >
              Connect
            </button>
          </div>
          {/* TODO: Add more payment gateways like PayPal */}
        </div>
      </section>
    </div>
  );
};

export default IntegrationsSettings;
