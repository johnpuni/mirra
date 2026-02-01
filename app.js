let liveId = null

async function loadLive() {
  const userId = document.getElementById('userId').value

  const history = await fetch(`https://www.mirrativ.com/api/live/live_history?page=1&user_id=${userId}`).then(r=>r.json())
  liveId = history.lives[0].live_id

  const stream = await fetch(`https://www.mirrativ.com/api/live/get_streaming_url?live_id=${liveId}`).then(r=>r.json())
  const url = stream.streaming_url_hls

  playStream(url)
  loadComments()
  loadGifts()
}

function playStream(url){
  const video = document.getElementById('player')
  if(Hls.isSupported()){
    const hls = new Hls()
    hls.loadSource(url)
    hls.attachMedia(video)
  } else {
    video.src = url
  }
}

function toggle(id){
  const el = document.getElementById(id)
  el.style.display = el.style.display === 'none' ? 'block' : 'none'
}

async function loadComments(){
  setInterval(async ()=>{
    const res = await fetch(`https://www.mirrativ.com/api/live/live_comments?live_id=${liveId}`).then(r=>r.json())
    const box = document.getElementById('comments')
    box.innerHTML = res.comments.map(c=>`
      <div class="comment">
        <img src="${c.user.icon_url}" width="32">
        <b>${c.user.name}</b> [Lv.${c.user.cheer_level}]<br>
        ${c.comment}
      </div>
    `).join('')
  }, 2000)
}

async function loadGifts(){
  const res = await fetch(`https://www.mirrativ.com/gift/ranking?live_id=${liveId}`).then(r=>r.json())
  const box = document.getElementById('gifts')
  box.innerHTML = res.ranking.map(g=>`
    <div>
      ${g.user.name} 🎁 ${g.total_amount}
    </div>
  `).join('')
}
