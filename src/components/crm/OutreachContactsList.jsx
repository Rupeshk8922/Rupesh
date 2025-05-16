// src/pages/OutreachContactsList.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/authContext';
import useOutreachContacts from '../hooks/useOutreachContacts';
import useCompanyUsers from '../hooks/useCompanyUsers';

const OutreachContactsList = () => {
  const { companyId } = useAuth();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState('');

  const { contacts, loading, error, hasMore, fetchMore, loadingMore } = useOutreachContacts(companyId);
  const { users, usersLoading, usersError } = useCompanyUsers(companyId);

  const handleFilterChange = (e) => setFilterTag(e.target.value);
  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const handleDelete = async (contactId) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) return;
    try {
      await deleteDoc(doc(db, 'companies', companyId, 'outreachContacts', contactId));
    } catch (err) {
      console.error('Error deleting contact:', err);
    }
  };

  const searchedContacts = searchTerm
    ? contacts?.filter(contact =>
        [contact.name, contact.email, contact.company, contact.title]
          .some(field => field?.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : contacts;

  const filteredContacts = filterTag
    ? searchedContacts?.filter(contact =>
        contact.tags?.some(tag => tag.toLowerCase().includes(filterTag.toLowerCase()))
      )
    : searchedContacts;

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Outreach Contacts</h2>

      <div className="mb-4 space-y-4 sm:flex sm:space-y-0 sm:space-x-4">
        <div className="flex-1">
          <label htmlFor="filterTag" className="block text-sm font-medium text-gray-700">
            Filter by Tag:
          </label>
          <input
            type="text"
            id="filterTag"
            value={filterTag}
            onChange={handleFilterChange}
            placeholder="Enter tag to filter"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>

        <div className="flex-1">
          <label htmlFor="searchTerm" className="block text-sm font-medium text-gray-700">
            Search:
          </label>
          <input
            type="text"
            id="searchTerm"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search by name, email, company, or title"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
      </div>

      {(loading || usersLoading) && <p>Loading contacts and users...</p>}
      {(error || usersError) && (
        <p className="text-red-500">Error loading data: {error?.message || usersError?.message}</p>
      )}

      {!loading && !error && (!filteredContacts || filteredContacts.length === 0) && (
        <p className="mb-4">No contacts found. Add your first contact!</p>
      )}

      {!loading && !error && filteredContacts && filteredContacts.length > 0 && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border text-left">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">Name</th>
                  <th className="p-2 border">Email</th>
                  <th className="p-2 border">Phone</th>
                  <th className="p-2 border">Tags</th>
                  <th className="p-2 border">Assigned To</th>
                  <th className="p-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredContacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-gray-50">
                    <td className="p-2 border">{contact.name}</td>
                    <td className="p-2 border">{contact.email || '-'}</td>
                    <td className="p-2 border">{contact.phone || '-'}</td>
                    <td className="p-2 border">{contact.tags?.join(', ') || '-'}</td>
                    <td className="p-2 border">
                      {usersLoading
                        ? 'Loading...'
                        : usersError
                        ? 'Error loading users'
                        : contact.assignedTo
                        ? users.find((user) => user.uid === contact.assignedTo)?.name || 'Unassigned'
                        : '-'}
                    </td>
                    <td className="p-2 border space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => navigate('/outreach/contacts/' + contact.id)}
                        className="text-blue-600 hover:underline"
                      >
                        View
                      </button>
                      <button
                        onClick={() => navigate('/outreach/contacts/' + contact.id + '/edit')}
                        className="text-green-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(contact.id)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {hasMore && (
            <div className="mt-4 text-center">
              <button
                onClick={fetchMore}
                disabled={loadingMore}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loadingMore ? 'Loading More...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}

      <div className="mt-6">
        <button
          onClick={() => navigate('/outreach/contacts/new')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Add Contact
        </button>
      </div>
    </div>
  );
};

export default OutreachContactsList;
