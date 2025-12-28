import API from "@/lib/API"  

export const getCurrentUser = async () => {
  const {data} = await API.get("/user/current");
  return data;
}    