import express from "express"
import fetch from "node-fetch"

const app = express()
app.use(express.static("public"))

app.get("/proxy", async (req, res) => {
  const url = req.query.url
  const r = await fetch(url, {
    headers: {
      "User-Agent": "Mirrativ/8.30.0 (iPhone; iOS 17.0)",
      "Accept": "application/json"
    }
  })
  res.set("Access-Control-Allow-Origin", "*")
  res.send(await r.text())
})

app.listen(3000, () => console.log("Server started"))
