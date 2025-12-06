import express from "express"
import prisma from "./prisma.js"

const app = express()
const PORT = process.env.PORT || 5000

app.get("/", (req, res) => {
  res.send("hellow world author service")
})

app.listen(PORT, async () => {
  console.log("Author Server is running on port " + PORT)
  const data = await prisma.user.findMany()
  console.log(data)
})