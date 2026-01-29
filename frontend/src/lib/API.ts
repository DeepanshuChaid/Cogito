import axios from "axios";

const API = axios.create({
  baseURL: "https://a6249cb5-adb3-47a5-a2a4-b8dabe1ea15e-00-10plam13vyxgi.sisko.repl.co:3000/api",
  withCredentials: true, 
});

export default API;