import API from "@/lib/API"  

export const getCurrentUser = async () => {
  const response = await API.get("/user/current");
  return response;
}    