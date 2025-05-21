import { useState, useEffect, Fragment } from "react";
import { doc, updateDoc, getDocs, collection, query } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../../contexts/authContext.jsx";
function AssignLeadModal({ isOpen, onClose, leadId }) {
 const [assignedTo, setAssignedTo] = useState("");
 const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true); // Removed duplicate import
  const [error, setError] = useState(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const { user } = useAuth(); // Corrected hook usage
    useEffect(() => {
    const fetchUsers = async () => {
      if (!user || !user.companyId) {
        setError("Company information not available.");
        setLoadingUsers(false);
        return;
      }
      setLoadingUsers(true);
      setError(null);
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef); // Fetch all users for now, can add companyId filter later
        const querySnapshot = await getDocs(q);
        const usersList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        // Filter users by companyId if user object is available and has companyId
        const filteredUsers = user.companyId
          ? usersList.filter((u) => u.companyId === user.companyId)
          : usersList;
        setUsers(filteredUsers);
      } catch (err) {
        setError("Failed to load users: " + err.message);
        console.error(err);
      } finally {
        setLoadingUsers(false);
      }
    };

    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen, user]); // Depend on isOpen and user to refetch when modal opens or user changes

  useEffect(() => {
    // Reset assignedTo when leadId changes or modal opens
    if (isOpen) {
      setAssignedTo("");
      setError(null); // Clear previous errors
    }
  }, [isOpen, leadId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsAssigning(true);
    setError(null);

    if (!leadId) {
      setError("No lead selected.");
      setIsAssigning(false);
      return;
    }

    try {
      const leadRef = doc(db, "leads", leadId);
      await updateDoc(leadRef, {
        assignedTo: assignedTo === "" ? null : assignedTo, // Assign null if "Unassigned" is selected
      });
      onClose(); // Close modal on success
    } catch (err) {
      setError("Failed to assign lead: " + err.message);
      console.error(err);
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  Assign Lead
                </Dialog.Title>
                <div className="mt-2">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label
                        htmlFor="assignedTo"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Assign To:
                      </label>
                      {loadingUsers ? (
                        <p>Loading users...</p>
                      ) : error ? (
                        <p className="text-red-500 text-sm">{error}</p>
                      ) : (
                        <select
                          id="assignedTo"
                          value={assignedTo}
                          onChange={(e) => setAssignedTo(e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        >
                          <option value="">Unassigned</option>
                          {users.map((userOption) => (
                            <option key={userOption.id} value={userOption.uid}>
                              {userOption.email} ({userOption.role})
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    {error && (
                      <p className="text-red-500 text-sm">{error}</p>
                    )}

                    <div className="mt-4 flex justify-end">
                      <button
                        type="button"
                        className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2 mr-2"
                        onClick={onClose}
                        disabled={isAssigning}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className={`inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${isAssigning ? 'opacity-50 cursor-not-allowed' : ''}`}
 disabled={isAssigning}
                      >
                        {isAssigning ? "Assigning..." : "Assign"}
                      </button>
                    </div>
                  </form>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

export default AssignLeadModal;