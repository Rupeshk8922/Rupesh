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

// Replace these with your actual UI components or imports from your design system
const Input = (props) => <input {...props} className={`border rounded px-3 py-2 ${props.className || ""}`} />;
const Button = ({ children, variant, size, disabled, ...rest }) => {
  let base =
    "rounded px-3 py-1 transition disabled:opacity-50 disabled:cursor-not-allowed ";
  if (variant === "outline") base += "border border-gray-500 text-gray-700 hover:bg-gray-100 ";
  else if (variant === "destructive") base += "bg-red-600 text-white hover:bg-red-700 ";
  else base += "bg-blue-600 text-white hover:bg-blue-700 ";

  if (size === "sm") base += "text-sm ";

  return (
    <button disabled={disabled} {...rest} className={base}>
      {children}
    </button>
  );
};

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
    const statuses = [...new Set(leads.map((lead) => lead.status).filter(Boolean))];
    statuses.sort();
    return statuses;
  }, [leads]);

  useEffect(() => {
    const fetchLeads = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, "leads"),
          where("companyId", "==", companyId),
          orderBy(sortField, sortOrder)
        );
        const querySnapshot = await getDocs(q);
        const leadsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setLeads(leadsData);
      } catch (firestoreError) {
        console.error("Firestore sorting failed:", firestoreError);
        // fallback fetch without orderBy, then manual sort
        try {
          const q = query(collection(db, "leads"), where("companyId", "==", companyId));
          const querySnapshot = await getDocs(q);
          let leadsData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          leadsData.sort((a, b) => {
            const fieldA = (a[sortField]?.toString() || "").toLowerCase();
            const fieldB = (b[sortField]?.toString() || "").toLowerCase();
            if (fieldA < fieldB) return sortOrder === "asc" ? -1 : 1;
            if (fieldA > fieldB) return sortOrder === "asc" ? 1 : -1;
            return 0;
          });
          setLeads(leadsData);
        } catch (error) {
          console.error("Error fetching leads:", error);
          setLeads([]);
        }
      } finally {
        setLoading(false);
      }
    };

    if (companyId) fetchLeads();
  }, [companyId, sortField, sortOrder]);

  // Filter + search + status combined, then reset page on changes
  useEffect(() => {
    let result = leads;

    if (search.trim()) {
      const lower = search.toLowerCase();
      result = result.filter(
        (lead) =>
          lead.name?.toLowerCase().includes(lower) ||
          lead.email?.toLowerCase().includes(lower) ||
          lead.phone?.toLowerCase().includes(lower)
      );
    }

    if (statusFilter) {
      result = result.filter((lead) => lead.status === statusFilter);
    }

    setFilteredLeads(result);
    setCurrentPage(1);
  }, [search, leads, statusFilter]);

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
    const maxPage = Math.ceil(filteredLeads.length / leadsPerPage);
    if (pageNum >= 1 && pageNum <= maxPage) {
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
          {availableStatuses.map((status) => (
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
          <Button onClick={toggleView}>View: {view === "card" ? "Table" : "Card"}</Button>
        </div>
      </div>

      {!loading && filteredLeads.length === 0 && (
        <div className="text-center text-gray-500 py-10">No leads found matching your criteria.</div>
      )}

      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading leads...</div>
      ) : view === "card" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentLeads.map((lead) => (
            <div key={lead.id} className="border rounded-xl p-4 shadow-sm">
              <h3 className="text-lg font-semibold">{lead.name || "No Name"}</h3>
              <p>{lead.email || "No Email"}</p>
              <p>{lead.phone || "No Phone"}</p>
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
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Email</th>
                <th className="p-2 border">Phone</th>
                <th className="p-2 border">Status</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50">
                  <td className="p-2 border">{lead.name || "-"}</td>
                  <td className="p-2 border">{lead.email || "-"}</td>
                  <td className="p-2 border">{lead.phone || "-"}</td>
                  <td className="p-2 border">{lead.status || "-"}</td>
                  <td className="p-2 border space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleView(lead.id)}>
                      View
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleEdit(lead.id)}>
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(lead.id)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredLeads.length > leadsPerPage && (
        <div className="flex justify-center items-center gap-3 pt-4">
          <Button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            variant="outline"
            size="sm"
          >
            Prev
          </Button>
          <span>
            Page {currentPage} of {Math.ceil(filteredLeads.length / leadsPerPage)}
          </span>
          <Button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === Math.ceil(filteredLeads.length / leadsPerPage)}
            variant="outline"
            size="sm"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default LeadsList;
