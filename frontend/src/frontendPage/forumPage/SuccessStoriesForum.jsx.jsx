import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaPlus, FaEdit, FaTrash, FaSearch, FaChevronDown, FaChevronUp } from "react-icons/fa";
import axios from "axios";

const API_BASE_URL = "http://localhost:9010/api/posts";

const SuccessStoriesForum = () => {
  const [posts, setPosts] = useState([]);
  const [userPosts, setUserPosts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showUserPosts, setShowUserPosts] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [expandedPosts, setExpandedPosts] = useState({});
  const [allTags, setAllTags] = useState([]);
  const [newPost, setNewPost] = useState({
    name: "",
    title: "",
    tags: "",
    content: "",
    image: null,
    imagePreview: null
  });

  // Configure axios instance
  const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  });

  // Fetch all posts
  const fetchPosts = async () => {
    try {
      const response = await api.get("/");
      setPosts(response.data);
      extractAllTags(response.data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  // Extract unique tags from all posts
  const extractAllTags = (posts) => {
    const tags = new Set();
    posts.forEach(post => {
      post.tags.forEach(tag => tags.add(tag));
    });
    setAllTags(Array.from(tags));
  };

  // Fetch user posts
  const fetchUserPosts = async () => {
    try {
      const response = await api.get("/my-posts");
      setUserPosts(response.data);
    } catch (error) {
      console.error("Error fetching user posts:", error);
    }
  };

  useEffect(() => {
    fetchPosts();
    if (localStorage.getItem("token")) {
      fetchUserPosts();
    }
  }, []);

  // Handle image upload
  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      setNewPost({
        ...newPost,
        image: file,
        imagePreview: URL.createObjectURL(file)
      });
    }
  };

  // Toggle post expansion
  const toggleExpandPost = (postId) => {
    setExpandedPosts(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  // Create or update post
  const handleSubmitPost = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    
    const formData = new FormData();
    formData.append("name", newPost.name);
    formData.append("title", newPost.title);
    formData.append("tags", newPost.tags);
    formData.append("content", newPost.content);
    if (newPost.image) formData.append("image", newPost.image);

    try {
      if (editingPost) {
        await api.put(`/${editingPost._id}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        });
      } else {
        await api.post("/", formData, {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        });
      }

      fetchPosts();
      fetchUserPosts();
      setShowForm(false);
      setNewPost({
        name: "",
        title: "",
        tags: "",
        content: "",
        image: null,
        imagePreview: null
      });
      setEditingPost(null);
    } catch (error) {
      console.error("Error submitting post:", error);
    } finally {
      setIsUploading(false);
    }
  };

  // Edit post
  const handleEditPost = (post) => {
    setEditingPost(post);
    setNewPost({
      name: post.name,
      title: post.title,
      tags: post.tags.join(", "),
      content: post.content,
      image: null,
      imagePreview: post.image
    });
    setShowForm(true);
  };

  // Delete post
  const handleDeletePost = async (postId) => {
    try {
      await api.delete(`/${postId}`);
      fetchPosts();
      fetchUserPosts();
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  // Filter posts by search term (including tags)
  const filteredPosts = (showUserPosts ? userPosts : posts).filter(post => {
    const searchLower = searchTerm.toLowerCase();
    
    const matchesTitle = post.title.toLowerCase().includes(searchLower);
    const matchesContent = post.content.toLowerCase().includes(searchLower);
    const matchesTags = post.tags.some(tag => tag.toLowerCase().includes(searchLower));
    
    return matchesTitle || matchesContent || matchesTags;
  });

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-yellow-400 flex items-center gap-2">
          🏆 Success Stories
        </h2>
        <motion.p
          className="mt-2 text-sm font-bold text-pink-600"
          initial={{ x: -10, opacity: 0 }}
          animate={{ x: 10, opacity: 1 }}
          transition={{ repeat: Infinity, repeatType: "reverse", duration: 5 }}
        >
          Turning Challenges into Opportunities – Stories of Growth and Success!
        </motion.p>
      </div>

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
  View All Stories
</button>

{localStorage.getItem("token") && (
  <button
    onClick={() => {
      setShowUserPosts(true);
      setSearchTerm("");
    }}
    className={`px-6 py-2 rounded-full font-semibold shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 ml-3 ${
      showUserPosts
        ? '!bg-gradient-to-r from-orange-500 !to-orange-600 text-white'
        : '!bg-orange-100 text-orange-700'
    }`}
  >
    My Stories
  </button>
)}

        </div>

        <div className="flex justify-end mb-4">
  <div className="flex items-center  ">
    <input
      type="text"
      placeholder="Search stories or tags..."
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

      <div className="mt-9 ml-20 space-y-6 ">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <div key={post._id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Left side - content */}
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-xl text-green-600">{post.title}</h3>
                    <button
                      onClick={() => toggleExpandPost(post._id)}
                      className="text-white hover:text-white"
                    >
                      {expandedPosts[post._id] ? <FaChevronUp /> : <FaChevronDown />}
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-2 mb-4">
                    {post.tags.map((tag, index) => (
                      <span 
                        key={index} 
                        className="bg-gray-100 px-2 py-1 rounded-full text-xs text-gray-700 cursor-pointer hover:bg-gray-200"
                        onClick={() => setSearchTerm(tag)}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  {expandedPosts[post._id] ? (
                    <div style={{ whiteSpace: "pre-line" }} className="text-gray-700 mb-4">
                      {post.content}
                    </div>
                  ) : (
                    <p className="text-gray-700 mb-4 line-clamp-3">
                      {post.content.split('\n')[0]}
                    </p>
                  )}

                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                    <span className="text-sm text-gray-500">Posted by {post.name}</span>
                    
                    {showUserPosts && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditPost(post)}
                          className="!bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition"
                        >
                          <FaEdit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeletePost(post._id)}
                          className="!bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right side - image (shown when collapsed) */}
                {!expandedPosts[post._id] && post.image && (
                  <div className="w-full md:w-1/3 flex-shrink-0">
                    <img 
                      src={post.image} 
                      alt="Post" 
                      className="w-full h-48 object-cover rounded-lg shadow-md"
                    />
                  </div>
                )}
              </div>

              {/* Full width image (shown when expanded) */}
              {expandedPosts[post._id] && post.image && (
                <div className="mt-5 flex  h-78 w-150 ml-60">
                  <img 
                    src={post.image} 
                    alt="Post" 
                    className="w-full max-w-md h-auto object-cover rounded-lg shadow-md"
                  />
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">
              {searchTerm
                ? "No matching stories or tags found. Try different search terms." 
                : "No stories found. Be the first to share your success story!"}
            </p>
          </div>
        )}
      </div>

      {localStorage.getItem("token") && (
        <motion.button
          onClick={() => {
            setEditingPost(null);
            setNewPost({
              name: "",
              title: "",
              tags: "",
              content: "",
              image: null,
              imagePreview: null
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

      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[100vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-red-600 mb-4">
              {editingPost ? "Edit Your Story" : "Share Your Success Story"}
            </h2>
            
            <form onSubmit={handleSubmitPost}>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-1">Your Name*</label>
                  <input
                    type="text"
                    placeholder="Your Name"
                    className="border p-2 rounded w-full"
                    value={newPost.name}
                    onChange={(e) => setNewPost({ ...newPost, name: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-1">Title*</label>
                  <input
                    type="text"
                    placeholder="Title"
                    className="border p-2 rounded w-full"
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-1">Tags (comma separated)*</label>
                  <input
                    type="text"
                    placeholder="e.g., Farming, Tomato, Organic"
                    className="border p-2 rounded w-full"
                    value={newPost.tags}
                    onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-1">Your Story*</label>
                  <textarea
                    placeholder="Share your success story..."
                    className="border p-2 rounded w-full min-h-[200px]"
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
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
                  {newPost.imagePreview && (
                    <div className="mt-4">
                      <img
                        src={newPost.imagePreview}
                        alt="Preview"
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
                  className="px-4 py-2 !bg-red-600 text-white rounded hover:bg-gray-400 transition"
                  disabled={isUploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 !bg-green-500 text-white rounded !hover:bg-green-600 transition flex items-center justify-center min-w-[120px]"
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <span className="mr-2">Posting</span>
                      <span className="inline-block animate-pulse">...</span>
                    </>
                  ) : editingPost ? (
                    "Update Story"
                  ) : (
                    "Post Story"
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

export default SuccessStoriesForum;