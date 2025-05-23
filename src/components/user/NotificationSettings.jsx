import { useState } from 'react';

const NotificationSettings = () => {
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

  // TODO: Add currentUser context or prop here
  // const { currentUser } = useAuth();

  // Uncomment and update this useEffect to fetch preferences from Firestore
  /*
  useEffect(() => {
    const fetchPreferences = async () => {
      if (!currentUser) return;
      setLoading(true);
      try {
        const userDoc = await firestore.collection('users').doc(currentUser.uid).get();
        if (userDoc.exists) {
          setPreferences(userDoc.data().notificationPreferences || preferences);
        }
        setLoading(false);
      } catch {
        setError('Failed to load preferences.');
        setLoading(false);
      }
    };
    fetchPreferences();
  }, [currentUser]);
  */

  const handlePreferenceChange = (type) => {
    setPreferences((prevPreferences) => ({
      emailNotifications: {
        ...prevPreferences.emailNotifications,
        [type]: !prevPreferences.emailNotifications[type],
      },
    }));
  };

  const savePreferences = async () => {
    setLoading(true);
    setSuccess(false);
    setError(null);
    try {
      // Replace with Firestore update when ready:
      // await firestore.collection('users').doc(currentUser.uid).update({ notificationPreferences: preferences });
      console.log('Preferences saved (placeholder):', preferences);
      setSuccess(true);
      setError(null);
      setLoading(false);
    } catch {
      setError('Failed to save preferences.');
      setSuccess(false);
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Notification Settings</h2>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Email Notifications</h3>

        <div className="space-y-4">
          {Object.entries(preferences.emailNotifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <label htmlFor={key} className="text-gray-700 capitalize">
                {key
                  .replace(/([A-Z])/g, ' $1')
                  .replace(/^./, (str) => str.toUpperCase())}
              </label>
              <input
                type="checkbox"
                id={key}
                className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                checked={value}
                onChange={() => handlePreferenceChange(key)}
              />
            </div>
          ))}
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
