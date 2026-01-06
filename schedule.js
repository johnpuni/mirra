const scheduleBox = document.getElementById("schedule");
const tabs = document.getElementById("month-tabs");

fetch("schedule/index.json")
  .then(r=>r.json())
  .then(files => Promise.all(files.map(f => 
      fetch("schedule/"+f).then(r=>r.json())
  )))
  .then(allData => {

    let events = allData.flat();

    // 🔁 URL重複を削除
    const map = new Map();
    events.forEach(e => map.set(e.url, e));
    events = [...map.values()];

    const months = [...new Set(events.map(e=>e.start.slice(0,6)))];

    months.forEach((m,i)=>{
      const t=document.createElement("div");
      t.className="tab"+(i==0?" active":"");
      t.textContent=m;
      t.onclick=()=>showMonth(m);
      tabs.appendChild(t);
    });

    showMonth(months[0]);

    function showMonth(month){
      document.querySelectorAll(".tab").forEach(t=>{
        t.classList.toggle("active", t.textContent==month);
      });

      scheduleBox.innerHTML="";

      const now = new Date();

      events.filter(e=>e.start.startsWith(month))
        .sort((a,b)=>new Date(a.start)-new Date(b.start))
        .forEach(e=>{
          const s=new Date(e.start);
          const en=new Date(e.end);

          const card=document.createElement("div");
          card.className="card";

          if(now>=s && now<=en) card.classList.add("active");
          if(now>en) card.classList.add("ended");

          const img=document.createElement("img");
          img.src=e.image;
          img.onclick=()=>location.href=`mirr://webview/window/open?url=${e.url}`;

          const info=document.createElement("div");
          info.className="info";

          let status="";
          if(now<s){
            const d=Math.ceil((s-now)/86400000);
            status=`開始まで ${d}日`;
          }else if(now<=en){
            const d=Math.ceil((en-now)/86400000);
            status=`残り ${d}日`;
          }else{
            status="終了";
          }

          info.innerHTML=`
          ${s.toLocaleDateString()} ～ ${en.toLocaleDateString()}<br>
          ${status}
          `;

          card.append(img,info);
          scheduleBox.appendChild(card);
        });
    }
  });
