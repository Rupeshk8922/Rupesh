// src/services/userService.js

import { collection, query, where, getDocs, getFirestore } from "firebase/firestore";

const db = getFirestore();

// Define roles allowed to be assigned leads
const ASSIGNABLE_ROLES = ["admin", "Manager", "CSR", "telecaller", "Outreach Officer"];

/**
 * Fetches users from the specified company who are eligible to be assigned leads.
 * @param {string} companyId - The company ID to filter users.
 * @returns {Promise<Array<Object>>} - An array of users with id, displayName, role.
 */
export async function fetchUsersForAssignment(companyId) {
  try {
    if (!companyId) {
      console.error("Company ID is required to fetch users for assignment.");
      return [];
    }

    const usersRef = collection(db, "users");
    const q = query(
      usersRef,
      where("companyId", "==", companyId),
      where("role", "in", ASSIGNABLE_ROLES)
    );

    const querySnapshot = await getDocs(q);

    const users = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        displayName: data.displayName || data.email,
        role: data.role,
        email: data.email,
        photoURL: data.photoURL || null,
      };
    });

    return users;
  } catch (error) {
    console.error("Error fetching users for assignment:", error);
    throw new Error("Failed to fetch assignable users.");
  }
}

/**
 * Fetches users with role 'officer'.
 * Optionally filters by companyId.
 * @param {string} [companyId] - (Optional) Company ID to filter officers by organization.
 * @returns {Promise<Array<Object>>} - An array of officer user objects.
 */
export async function getOfficers(companyId = null) {
  try {
    const usersRef = collection(db, 'users');

    const constraints = [where("role", "==", "officer")];
    if (companyId) {
      constraints.push(where("companyId", "==", companyId));
    }

    const q = query(usersRef, ...constraints);
    const querySnapshot = await getDocs(q);

    const officers = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        uid: doc.id,
        displayName: data.displayName || data.email,
        email: data.email,
        photoURL: data.photoURL || null,
      };
    });

    console.log("Fetched officers:", officers);
    return officers;
  } catch (error) {
    console.error("Error fetching officers:", error);
    throw new Error("Failed to fetch officers.");
  }
}
