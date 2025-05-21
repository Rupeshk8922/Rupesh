import React, { useState, useEffect } from "react";
import { db } from "@/firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  where,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const LeadsList = ({ companyId }) => {
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("card");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const leadsPerPage = 10;

  const navigate = useNavigate();

  // Extract unique statuses from leads
  const availableStatuses = React.useMemo(() => {
    if (!leads) return [];
    const statuses = [...new Set(leads.map(lead => lead.status).filter(status => status))];
    statuses.sort(); // Optional: sort statuses alphabetically
    return statuses;
  }, [leads]);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const q = query(
          collection(db, "leads"),
          where("companyId", "==", companyId),
          orderBy(sortField, sortOrder)
        );
        const querySnapshot = await getDocs(q);
        let leadsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setLeads(leadsData);
        setLoading(false);
      } catch (firestoreError) {
        console.error("Firestore sorting failed:", firestoreError);
        try {
          const q = query(
            collection(db, "leads"),
            where("companyId", "==", companyId)
          );
          const querySnapshot = await getDocs(q);
          let leadsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          leadsData.sort((a, b) => {
            const fieldA = a[sortField]?.toString().toLowerCase() || "";
            const fieldB = b[sortField]?.toString().toLowerCase() || "";
            if (fieldA < fieldB) return sortOrder === "asc" ? -1 : 1;
            if (fieldA > fieldB) return sortOrder === "asc" ? 1 : -1;
            return 0;
          });
          setLeads(leadsData);
          setLoading(false);
        } catch (error) {
          console.error("Error fetching leads:", error);
          setLoading(false);
        }
      }
    };

    if (companyId) fetchLeads();
  }, [companyId, sortField, sortOrder]);

  useEffect(() => {
    let result = leads;
    if (search.trim()) {
      const lower = search.toLowerCase(); // Define lower here
      result = result.filter(
        (lead) =>
          lead.name?.toLowerCase().includes(lower) ||
          lead.email?.toLowerCase().includes(lower) ||
          lead.phone?.toLowerCase().includes(lower)
      );
    }
    setFilteredLeads(result);
    // Filter by status
    if (statusFilter) {
        result = result.filter(lead => lead.status === statusFilter);
    }
    setFilteredLeads(result); // Update filtered leads after status filter
    setCurrentPage(1); // Reset page when filters change
  }, [search, leads, statusFilter]); // Add statusFilter to dependencies
  const indexOfLastLead = currentPage * leadsPerPage;
  const indexOfFirstLead = indexOfLastLead - leadsPerPage;
  const currentLeads = filteredLeads.slice(indexOfFirstLead, indexOfLastLead);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this lead?")) return;
    try {
      await deleteDoc(doc(db, "leads", id));
      setLeads((prev) => prev.filter((lead) => lead.id !== id));
    } catch (error) {
      console.error("Error deleting lead:", error);
      alert("Failed to delete lead. Please try again.");
    }
  };

  const handleEdit = (id) => navigate(`/dashboard/crm/leads/edit/${id}`);
  const handleView = (id) => navigate(`/dashboard/crm/leads/view/${id}`);

  const toggleView = () => {
    setView((prev) => (prev === "card" ? "table" : "card"));
  };

  const handlePageChange = (pageNum) => {
    if (pageNum >= 1 && pageNum <= Math.ceil(filteredLeads.length / leadsPerPage)) {
      setCurrentPage(pageNum);
    }
  };


  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <Input
          type="text"
          placeholder="Search leads..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-64"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border px-2 py-1 rounded w-full sm:w-auto"
        >
          <option value="">All Statuses</option>
          {availableStatuses.map(status => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <select
          value={sortField}
          onChange={(e) => setSortField(e.target.value)}
          className="border px-2 py-1 rounded w-full sm:w-auto"
        >
          <option value="createdAt">Date</option>
          <option value="name">Name</option>
          <option value="company">Company</option>
          <option value="interest">Interest</option>
        </select>
        <div className="flex gap-2">
          <Button onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
            Sort: {sortOrder === "asc" ? "↑" : "↓"}
          </Button>
          <Button onClick={toggleView}>
            View: {view === "card" ? "Table" : "Card"}
          </Button>
        </div>
      </div>

      {!loading && filteredLeads.length === 0 && (
        <div className="text-center text-gray-500 py-10">
          No leads found matching your criteria.
        </div>
      )}

      {view === "card" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentLeads.map((lead) => (
            <div key={lead.id} className="border rounded-xl p-4 shadow-sm">
              <h3 className="text-lg font-semibold">{lead.name}</h3>
              <p>{lead.email}</p>
              <p>{lead.phone}</p>
              <div className="mt-3 flex gap-2">
                <Button variant="outline" onClick={() => handleView(lead.id)}>
                  View
                </Button>
                <Button variant="outline" onClick={() => handleEdit(lead.id)}>
                  Edit
                </Button>
                <Button variant="destructive" onClick={() => handleDelete(lead.id)}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Phone</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentLeads.map((lead) => (
                <tr key={lead.id} className="border-t">
                  <td className="px-4 py-2">{lead.name}</td>
                  <td className="px-4 py-2">{lead.email}</td>
                  <td className="px-4 py-2">{lead.phone}</td>
                  <td className="px-4 py-2 flex gap-2">
                    <Button size="sm" onClick={() => handleView(lead.id)}>
                      View
                    </Button>
                    <Button size="sm" onClick={() => handleEdit(lead.id)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(lead.id)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex justify-center items-center gap-2 mt-4">
        <Button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
          Prev
        </Button>
        <span>
          Page {currentPage} of {Math.ceil(filteredLeads.length / leadsPerPage)}
        </span>
        <Button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= Math.ceil(filteredLeads.length / leadsPerPage)}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default LeadsList;
