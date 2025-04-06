import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';

const ResolvedFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);

  const navigate = useNavigate();

  // Fetch resolved feedbacks
  useEffect(() => {
    axios.get("http://localhost:9010/api/feedback/all")
      .then((response) => {
        setFeedbacks(response.data.filter(fb => fb.resolved));
      })
      .catch((error) => {
        console.error("Error fetching feedbacks:", error);
      });
  }, []);

  // Mark feedback as unresolved
  const markAsUnresolved = (id) => {
    axios.put(`http://localhost:9010/api/feedback/unresolve/${id}`)
      .then(() => {
        setFeedbacks(prevFeedbacks => prevFeedbacks.filter(fb => fb._id !== id));
      })
      .catch((error) => {
        console.error("Error unresolving feedback:", error);
      });
  };

  // Delete feedback
  const deleteFeedback = (id) => {
    axios.delete(`http://localhost:9010/api/feedback/delete/${id}`)
      .then(() => {
        setFeedbacks(prevFeedbacks => prevFeedbacks.filter(fb => fb._id !== id));
      })
      .catch((error) => {
        console.error("Error deleting feedback:", error);
      });
  };

  return (
    <div className="min-h-screen p-8">

<button
      onClick={() => navigate("/feedback")}
      className="bg-pink-500 text-white font-semibold px-6 py-3 rounded-full shadow-lg transition-transform transform hover:scale-105 hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
    >
      Unresolved Feedback
     </button>
    <h1 className="text-3xl font-extrabold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-900 drop-shadow-md animate-fadeIn">
     Manage Resolved Feedback
</h1>
      <h2 className="text-3xl font-bold text-center text-white"></h2>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {feedbacks.length > 0 ? feedbacks.map((fb) => (
          <div key={fb._id} className="bg-white p-4 shadow-lg rounded-lg">
            <p><strong>Name:</strong> {fb.name}</p>
            <p><strong>Email:</strong> {fb.email}</p>
            <p><strong>Category:</strong> {fb.category}</p>
            <p><strong>Description:</strong> {fb.description}</p>
            <p><strong>Rating:</strong> {fb.rating}⭐</p>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => markAsUnresolved(fb._id)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                Unresolve
              </button>
              <button
                onClick={() => deleteFeedback(fb._id)}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-900 transition"
              >
                Delete
              </button>
            </div>
          </div>
        )) : <p className="text-center text-gray-600">No resolved feedbacks.</p>}
      </div>
    </div>
  );
};

export default ResolvedFeedback;
