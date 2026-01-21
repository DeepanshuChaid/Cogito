import axios from "axios";

const BlogAPI = axios.create({
  baseURL: process.env.BLOG_API_URL,
  withCredentials: true, 
});

export default BlogAPI;