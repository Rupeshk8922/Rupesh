// src/services/userService.js
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";

const db = getFirestore();

export async function fetchUsersForAssignment(companyId) {
  try {
    if (!companyId) {
      console.error("Company ID is required to fetch users for assignment.");
      return [];
    }

    // Query users based on companyId and roles allowed to be assigned leads
    const usersRef = collection(db, "users");
    const q = query(
      usersRef,
      where("companyId", "==", companyId),
      // Add roles that can be assigned leads here, e.g.:
      // where("role", "in", ["admin", "Manager", "Outreach Officer", "CSR", "telecaller"])
      // For now, fetching all users in the company for simplicity.
    );
    const querySnapshot = await getDocs(q);

    const users = [];
    querySnapshot.forEach((doc) => {
      const userData = doc.data();
      // Include necessary fields for the assignment dropdown
      users.push({
        id: doc.id,
        displayName: userData.displayName || userData.email, // Use display name or email
        role: userData.role, // Include role if needed for display in dropdown
        // Add other relevant fields like photoURL if needed
      });
    });

    return users;
  } catch (error) {
    console.error("Error fetching users for assignment:", error);
    throw error;
  }
}