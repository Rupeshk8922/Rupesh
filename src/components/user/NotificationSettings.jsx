
const NotificationSettings = () => {
  // State to manage notification preferences
  const [preferences, setPreferences] = useState({
    emailNotifications: {
      eventReminders: true,
      volunteerEngagementReminders: true,
      eventConfirmation: true,
    },
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  // TODO: Implement useEffect to load user preferences from Firestore
  // useEffect(() => {
  //   const fetchPreferences = async () => {
  //     setLoading(true);
  //     try {
  //       // Fetch preferences from Firestore for the current user
  //       // Example: const userDoc = await firestore.collection('users').doc(currentUser.uid).get();
  //       // if (userDoc.exists) {
  //       //   setPreferences(userDoc.data().notificationPreferences);
  //       // }
  //       setLoading(false);
  //     } catch (err) {
  //       setError('Failed to load preferences.');
  //       setLoading(false);
  //     }
  //   };
  //   fetchPreferences();
  // }, []); // Add current user dependency

  // Function to handle changes in preferences
  const handlePreferenceChange = (type) => {
    setPreferences((prevPreferences) => ({
      emailNotifications: {
        ...prevPreferences.emailNotifications,
        [type]: !prevPreferences.emailNotifications[type],
      },
    }));
  };

  // Function to save preferences to Firestore
  const savePreferences = async () => {
    setLoading(true);
    setSuccess(false);
    setError(null);
    try {
      // TODO: Implement Firestore logic to save preferences
      // Example: await firestore.collection('users').doc(currentUser.uid).update({
      //   notificationPreferences: preferences,
      // });
      console.log('Preferences saved (placeholder):', preferences);
      setSuccess(true);
      setError(null); // Clear previous errors
      setLoading(false);
    } catch (err) {
      setError('Failed to save preferences.');
      setSuccess(false); // Clear previous success
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Notification Settings</h2>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Email Notifications</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label htmlFor="eventReminders" className="text-gray-700">
              Event Reminders
            </label>
            <input
              type="checkbox"
              id="eventReminders"
              className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
              checked={preferences.emailNotifications.eventReminders}
              onChange={() => handlePreferenceChange('eventReminders')}
            />
          </div>

          <div className="flex items-center justify-between">
            <label htmlFor="volunteerEngagementReminders" className="text-gray-700">
              Volunteer Engagement Reminders
            </label>
            <input
              type="checkbox"
              id="volunteerEngagementReminders"
              className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
              checked={preferences.emailNotifications.volunteerEngagementReminders}
              onChange={() => handlePreferenceChange('volunteerEngagementReminders')}
            />
          </div>

          <div className="flex items-center justify-between">
            <label htmlFor="eventConfirmation" className="text-gray-700">
              Event Confirmation Emails (for organizers)
            </label>
            <input
              type="checkbox"
              id="eventConfirmation"
              className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
              checked={preferences.emailNotifications.eventConfirmation}
              onChange={() => handlePreferenceChange('eventConfirmation')}
            />
          </div>
        </div>

        <button
          onClick={savePreferences}
          className={`mt-6 px-4 py-2 rounded text-white font-semibold ${
            loading ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Preferences'}
        </button>

        {success && <p className="mt-4 text-green-600">Preferences saved successfully!</p>}
        {error && <p className="mt-4 text-red-600">{error}</p>}
      </div>
    </div>
  );
};

export default NotificationSettings;