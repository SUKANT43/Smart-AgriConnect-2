import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaPlus, FaReply, FaEdit, FaTrash, FaSearch, FaChevronDown, FaChevronUp } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:9010/api";

const DiscussionForum = () => {
  const navigate = useNavigate();
  const [discussions, setDiscussions] = useState([]);
  const [filteredDiscussions, setFilteredDiscussions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingDiscussion, setEditingDiscussion] = useState(null);
  const [expandedPosts, setExpandedPosts] = useState({});
  const [showReplies, setShowReplies] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [showUserPosts, setShowUserPosts] = useState(false);
  
  const [newDiscussion, setNewDiscussion] = useState({
    title: "",
    tags: "",
    content: "",
    image: null,
    imagePreview: null,
    currentImageUrl: ""
  });

  const [newReply, setNewReply] = useState({ content: "" });

  // Fetch discussions based on showUserPosts state
  useEffect(() => {
    const fetchDiscussions = async () => {
      try {
        const endpoint = showUserPosts 
          ? `${API_BASE_URL}/discussions/my-discussions`
          : `${API_BASE_URL}/discussions`;
        
        const { data } = await axios.get(endpoint, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setDiscussions(data.data || data);
        setFilteredDiscussions(data.data || data);
      } catch (error) {
        console.error("Error fetching discussions:", error);
      }
    };

    fetchDiscussions();
  }, [showUserPosts, editingDiscussion]);

  // Filter discussions based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredDiscussions(discussions);
    } else {
      const filtered = discussions.filter(discussion => 
        discussion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        discussion.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (discussion.tags && discussion.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))) ||
        (discussion.name && discussion.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredDiscussions(filtered);
    }
  }, [searchTerm, discussions]);

  // Toggle post expansion
  const toggleExpandPost = (postId) => {
    setExpandedPosts(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  // Toggle replies visibility
  const toggleShowReplies = (postId) => {
    setShowReplies(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  // Handle image upload
  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      setNewDiscussion({
        ...newDiscussion,
        image: file,
        imagePreview: URL.createObjectURL(file)
      });
    }
  };

  // Handle discussion submission
  const handlePostDiscussion = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    
    const formData = new FormData();
    formData.append("title", newDiscussion.title);
    formData.append("tags", newDiscussion.tags);
    formData.append("content", newDiscussion.content);
    if (newDiscussion.image) formData.append("image", newDiscussion.image);

    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      };

      const { data } = editingDiscussion 
        ? await axios.put(`${API_BASE_URL}/discussions/${editingDiscussion}`, formData, config)
        : await axios.post(`${API_BASE_URL}/discussions`, formData, config);

      if (editingDiscussion) {
        setDiscussions(discussions.map(d => d._id === editingDiscussion ? data.data : d));
        setEditingDiscussion(null);
      } else {
        setDiscussions([data.data, ...discussions]);
      }

      setShowForm(false);
      setNewDiscussion({
        title: "",
        tags: "",
        content: "",
        image: null,
        imagePreview: null,
        currentImageUrl: ""
      });
    } catch (error) {
      console.error("Error posting discussion:", error);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle reply submission
  const handlePostReply = async (discussionId) => {
    if (!newReply.content) return;
    
    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/discussions/${discussionId}/replies`,
        { content: newReply.content },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      setDiscussions(discussions.map(discussion => 
        discussion._id === discussionId ? data.data : discussion
      ));

      setReplyingTo(null);
      setNewReply({ content: "" });
    } catch (error) {
      console.error("Error posting reply:", error);
    }
  };

  // Handle discussion deletion
  const handleDeleteDiscussion = async (id) => {
    if (window.confirm("Are you sure you want to delete this discussion?")) {
      try {
        // Use the correct endpoint for user's discussions if in "My Discussions" view
        const endpoint = showUserPosts 
          ? `${API_BASE_URL}/discussions/my/${id}`
          : `${API_BASE_URL}/discussions/${id}`;
        
        await axios.delete(endpoint, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        // Update state to remove the deleted discussion
        setDiscussions(prev => prev.filter(d => d._id !== id));
        
        // Also update filtered discussions if needed
        setFilteredDiscussions(prev => prev.filter(d => d._id !== id));
        
        // Reset editing if deleting the currently edited discussion
        if (editingDiscussion === id) {
          setEditingDiscussion(null);
          setShowForm(false);
        }
      } catch (error) {
        console.error("Error deleting discussion:", error);
        alert("Failed to delete discussion. Please try again.");
      }
    }
  };

  // Handle discussion edit
  const handleEditDiscussion = (discussion) => {
    setEditingDiscussion(discussion._id);
    setNewDiscussion({
      title: discussion.title,
      tags: discussion.tags ? discussion.tags.join(",") : "",
      content: discussion.content,
      image: null,
      imagePreview: discussion.image?.url || null,
      currentImageUrl: discussion.image?.url || ""
    });
    setShowForm(true);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-green-500 flex items-center gap-2">
          📝 {showUserPosts ? 'My Discussions' : 'Discussion Forum'}
        </h2>
        <motion.p
          className="mt-2 text-sm font-bold text-pink-600"
          initial={{ x: -10, opacity: 0 }}
          animate={{ x: 10, opacity: 1 }}
          transition={{ repeat: Infinity, repeatType: "reverse", duration: 5 }}
        >
          {showUserPosts 
            ? 'Your personal contributions to our farming community!' 
            : 'A Community for Farmers, By Farmers – Share & Learn Together!'}
        </motion.p>
      </div>

      {/* Search and Filter Section */}
      <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setShowUserPosts(false);
              setSearchTerm("");
            }}
            className={`px-6 py-2 rounded-full font-semibold shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 ${
              !showUserPosts
                ? '!bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                : '!bg-blue-100 text-blue-700'
            }`}
          >
            View All Discussions
          </button>

          {localStorage.getItem("token") && (
            <button
              onClick={() => {
                setShowUserPosts(true);
                setSearchTerm("");
              }}
              className={`px-6 py-2 rounded-full font-semibold shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 ml-3 ${
                showUserPosts
                  ? '!bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                  : '!bg-orange-100 text-orange-700'
              }`}
            >
              My Discussions
            </button>
          )}
        </div>

        <div className="flex justify-end mb-4">
          <div className="flex items-center">
            <input
              type="text"
              placeholder="Search discussions or tags..."
              className="w-80 bg-white/30 backdrop-blur-lg text-gray-800 placeholder-gray-600 border border-gray-300 rounded-full py-3 px-5 focus:outline-none focus:ring-2 focus:ring-gray-500 shadow-lg transition-all duration-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
      className="ml-2 !bg-gray-700 text-white px-4 py-2 rounded-lg"
      
    >
      Search
    </button>
          </div>
        </div>
      </div>

      {/* Discussions List */}
      <div className="mt-11 ml-20 space-y-9">
        {filteredDiscussions.length > 0 ? (
          filteredDiscussions.map((discussion) => (
            <div key={discussion._id} className="bg-white p-10 rounded-lg shadow-md border border-gray-200">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Left side - content */}
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-xl text-orange-600">{discussion.title}</h3>
                    <button
                      onClick={() => toggleExpandPost(discussion._id)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      {expandedPosts[discussion._id] ? <FaChevronUp /> : <FaChevronDown />}
                    </button>
                  </div>
                  
                  {discussion.tags && discussion.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2 mb-4">
                      {discussion.tags.map((tag, index) => (
                        <span 
                          key={index} 
                          className="bg-gray-100 px-2 py-1 rounded-full text-xs text-gray-700 cursor-pointer hover:bg-gray-200"
                          onClick={() => setSearchTerm(tag)}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div style={expandedPosts[discussion._id] ? { whiteSpace: "pre-line" } : null} 
     className={`text-gray-700 mb-4 ${!expandedPosts[discussion._id] ? "line-clamp-1" : ""}`}>
  {expandedPosts[discussion._id] ? discussion.content : discussion.content.split('\n')[0]}
</div>

                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                    <span className="text-sm text-gray-500">
                      {!showUserPosts && `Posted by ${discussion.name || "Anonymous"} • `}
                      {new Date(discussion.createdAt).toLocaleDateString()}
                    </span>
                    
                    {showUserPosts ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditDiscussion(discussion)}
                          className="!bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition"
                        >
                          <FaEdit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteDiscussion(discussion._id)}
                          className="!bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setReplyingTo(replyingTo === discussion._id ? null : discussion._id)}
                        className="flex items-center gap-1 !bg-yellow-300 text-white px-3 py-1 rounded hover:bg-yellow-500 transition-colors"
                      >
                        <FaReply size={14} /> <span>Reply</span>
                      </button>
                    )}
                  </div>

                  {/* Reply Form (only in all discussions view) */}
                  {!showUserPosts && replyingTo === discussion._id && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-md">
                      <textarea
                        placeholder="Write your reply..."
                        className="border p-2 rounded w-full"
                        rows="3"
                        value={newReply.content}
                        onChange={(e) => setNewReply({ content: e.target.value })}
                      ></textarea>
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          onClick={() => setReplyingTo(null)}
                          className="px-3 py-1 !bg-red-500 text-white rounded hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handlePostReply(discussion._id)}
                          className="px-3 py-1 !bg-green-500 text-white rounded hover:bg-green-600"
                        >
                          Post Reply
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right side - image (shown when collapsed) */}
                {!expandedPosts[discussion._id] && discussion.image?.url && (
                  <div className="w-full md:w-1/3 flex-shrink-0">
                    <img 
                      src={discussion.image.url} 
                      alt="Discussion" 
                      className="w-full h-48 object-cover rounded-lg shadow-md"
                    />
                  </div>
                )}
              </div>

              {/* Full width image (shown when expanded) */}
              {expandedPosts[discussion._id] && discussion.image?.url && (
                <div className="mt-5 flex justify-center">
                  <img 
                    src={discussion.image.url} 
                    alt="Discussion" 
                    className="w-full max-w-md h-auto object-cover rounded-lg shadow-md"
                  />
                </div>
              )}

              {/* Replies Section (only in all discussions view) */}
              {!showUserPosts && expandedPosts[discussion._id] && discussion.replies && discussion.replies.length > 0 && (
                <div className="mt-4">
                  <button
                    onClick={() => toggleShowReplies(discussion._id)}
                    className="text-blue-600 font-medium cursor-pointer hover:underline"
                  >
                    {showReplies[discussion._id] 
                      ? 'Hide Replies' 
                      : `View ${discussion.replies.length} ${discussion.replies.length === 1 ? 'Reply' : 'Replies'}`}
                  </button>
                  {showReplies[discussion._id] && (
                    <div className="mt-3 pl-4 border-l-2 border-gray-200 space-y-3">
                      {discussion.replies.map((reply) => (
                        <div key={reply._id} className="bg-gray-50 p-3 rounded-md">
                          <div className="flex justify-between items-start">
                            <strong className="text-green-600">{reply.name}</strong>
                            <span className="text-xs text-gray-500">
                              {new Date(reply.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p style={{ whiteSpace: "pre-line" }} className="mt-1 text-gray-700">
                            {reply.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">
              {searchTerm
                ? "No matching discussions found. Try different search terms." 
                : showUserPosts
                  ? "You haven't started any discussions yet. Share your thoughts with the community!"
                  : "No discussions found. Start a new one!"}
            </p>
          </div>
        )}
      </div>

      {/* Add Discussion Floating Button */}
      {!showUserPosts && (
        <motion.button
          onClick={() => {
            setEditingDiscussion(null);
            setNewDiscussion({
              title: "",
              tags: "",
              content: "",
              image: null,
              imagePreview: null,
              currentImageUrl: ""
            });
            setShowForm(true);
          }}
          className="fixed bottom-10 right-10 bg-green-500 text-white text-3xl rounded-full p-4 shadow-lg w-14 h-14 flex items-center justify-center hover:bg-green-600 transition"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >  
          <FaPlus size={20} />
        </motion.button>
      )}

      {/* Discussion Form Modal */}
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[100vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-orange-600 mb-4">
              {editingDiscussion ? "Edit Discussion" : "Start a Discussion"}
            </h2>
            
            <form onSubmit={handlePostDiscussion}>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-1">Title*</label>
                  <input
                    type="text"
                    placeholder="Discussion title"
                    className="border p-2 rounded w-full"
                    value={newDiscussion.title}
                    onChange={(e) => setNewDiscussion({ ...newDiscussion, title: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-1">Tags (comma separated)*</label>
                  <input
                    type="text"
                    placeholder="e.g., Farming, Tomato, Organic"
                    className="border p-2 rounded w-full"
                    value={newDiscussion.tags}
                    onChange={(e) => setNewDiscussion({ ...newDiscussion, tags: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-1">Content*</label>
                  <textarea
                    placeholder="Share your discussion..."
                    className="border p-2 rounded w-full min-h-[200px]"
                    value={newDiscussion.content}
                    onChange={(e) => setNewDiscussion({ ...newDiscussion, content: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-1">Upload Image (Optional)</label>
                  <input
                    type="file"
                    className="border p-2 rounded w-full"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  {newDiscussion.imagePreview ? (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 mb-1">New Image Preview:</p>
                      <img
                        src={newDiscussion.imagePreview}
                        alt="Preview"
                        className="w-40 h-40 object-cover rounded-lg shadow-md"
                      />
                    </div>
                  ) : newDiscussion.currentImageUrl && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 mb-1">Current Image:</p>
                      <img
                        src={newDiscussion.currentImageUrl}
                        alt="Current"
                        className="w-40 h-40 object-cover rounded-lg shadow-md"
                      />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 !bg-red-500 text-white rounded hover:bg-gray-600 transition"
                  disabled={isUploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 !bg-green-500 text-white rounded hover:bg-green-600 transition flex items-center justify-center min-w-[120px]"
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <span className="mr-2">Posting</span>
                      <span className="inline-block animate-pulse">...</span>
                    </>
                  ) : editingDiscussion ? (
                    "Update Discussion"
                  ) : (
                    "Post Discussion"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscussionForum;