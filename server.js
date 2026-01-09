import express from "express"
import fetch from "node-fetch"

const app = express()
app.use(express.static("public"))

app.get("/proxy", async (req, res) => {
  const url = req.query.url
  if(!url) return res.status(400).send("URLが必要です")

  try {
    const r = await fetch(url, {
      headers: {
        "User-Agent": "Mirrativ/8.30.0 (iPhone; iOS 17.0)",
        "Accept": "application/json"
      }
    })
    const text = await r.text()
    res.set("Access-Control-Allow-Origin", "*")
    res.send(text)
  } catch(e) {
    console.error(e)
    res.status(500).send("Fetch失敗")
  }
})

app.listen(process.env.PORT || 3000, ()=>console.log("Proxy server started"))
