 /* ══════════ 팀 배정 알고리즘 ══════════ */
  function makeTeams(names){
    const members=names.map(n=>ALL_MEMBERS.find(m=>m.name===n)||{name:n,dept:'기타'});
    const n=members.length;
    const teamSize=Math.round(n/Math.max(1,Math.round(n/4)));
    const numTeams=Math.ceil(n/teamSize);

    function shuffle(arr){
      const a=[...arr];
      for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
      return a;
    }

    let best=null, bestScore=Infinity;
    for(let t=0;t<300;t++){
      const shuffled=shuffle(members);
      const teams=Array.from({length:numTeams},()=>[]);
      shuffled.forEach((m,i)=>teams[i%numTeams].push(m));
      let score=0;
      teams.forEach(team=>{
        const depts=team.map(m=>m.dept);
        depts.forEach((d,i)=>depts.slice(i+1).forEach(d2=>{ if(d===d2) score++; }));
      });
      if(score<bestScore){ bestScore=score; best=teams.map(t=>[...t]); }
      if(bestScore===0) break;
    }
    return best;
  }

  /* ══════════ 룰렛 실행 ══════════ */
  window.spinRoulette = async function(){
    if(!isAdmin) return;
    const names=[...checkedMembers];
    if(names.length<2) return;

    const btn=document.getElementById('btn-spin');
    btn.disabled=true; btn.textContent='🎲 뽑는 중...';

    const stage=document.getElementById('roulette-stage');
    stage.innerHTML='<div class="roulette-spinning" id="spin-display">?</div>';
    const display=document.getElementById('spin-display');

    let tick=0;
    const interval=setInterval(()=>{ display.textContent=names[tick++%names.length]; },100);
    await new Promise(r=>setTimeout(r,2200));
    clearInterval(interval);

    const teams=makeTeams(names);
    const TEAM_COLORS=['#0e7490','#7c5cfc','#e85d3a','#389e0d','#c41d7f','#d4380d','#1872c8'];
    const result={
      teams: teams.map((team,i)=>({
        label:`Team ${i+1}`,
        color: TEAM_COLORS[i%TEAM_COLORS.length],
        members:team.map(m=>({name:m.name,dept:m.dept}))
      })),
      timestamp:Date.now()
    };
    await set(rouletteRef(), result);
    btn.disabled=false; btn.textContent='🎲 다시 뽑기!';
  };

  /* ══════════ 룰렛 결과 렌더 ══════════ */
  function renderRouletteResult(data){
    const stage=document.getElementById('roulette-stage');
    const grid=document.getElementById('results-grid');
    if(!data?.teams){
      stage.innerHTML='<div class="roulette-idle">관리자가 팀을 뽑으면 결과가 여기 나타나요 🎲</div>';
      grid.innerHTML=''; return;
    }
    stage.innerHTML=`<div style="font-size:1.1rem;font-weight:700;color:var(--wed)">🎉 총 ${data.teams.length}팀 구성 완료!</div>`;
    grid.innerHTML='';
    data.teams.forEach((team,i)=>{
      const card=document.createElement('div');
      card.className='result-team';
      card.style.cssText=`animation-delay:${i*.08}s;border-top:3px solid ${team.color}`;
      card.innerHTML=`
        <div class="result-team-label" style="color:${team.color}">${team.label} (${team.members.length}명)</div>
        ${team.members.map(m=>`<div class="result-member"><span>${m.name}</span><span class="dept-tag">${m.dept}</span></div>`).join('')}`;
      grid.appendChild(card);
    });
  }

  /* ══════════ 결과 초기화 ══════════ */
  window.clearRouletteResult = async function(){
    if(!isAdmin){ openAdminLogin(); return; }
    await remove(rouletteRef());
  };

  /* ══════════ 여성 팝업 ══════════ */
  function showWomenPopup(){
    const listEl=document.getElementById('women-list');
    WOMEN_LIST.forEach(name=>{
      const chip=document.createElement('span');
      chip.className='women-chip'; chip.textContent=name;
      listEl.appendChild(chip);
    });
    document.getElementById('women-popup').classList.add('open');
  }
  window.closeWomenPopup = function(){
    document.getElementById('women-popup').classList.remove('open');
  };

  /* ══════════ 시작 ══════════ */
  route();
</script>
</body>
</html>
