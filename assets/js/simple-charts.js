/* SimpleCharts - lightweight fallback renderer for small charts used in the Synthetic Fandom article.
   Not a full Chart.js replacement. Draws simple scatter and bar histograms on canvas elements.
*/
(function(global){
  const SimpleCharts = {};

  function clearCanvas(canvas){
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0,0,canvas.width,canvas.height);
  }

  function fitCanvas(canvas){
    // handle high-DPI
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr,0,0,dpr,0,0);
    return ctx;
  }

  SimpleCharts.renderScatter = function(canvas, points, opts){
    const ctx = fitCanvas(canvas);
    const w = canvas.clientWidth, h = canvas.clientHeight;
    clearCanvas(canvas);
    // padding
    const pad = {l:60,r:20,t:20,b:40};
    const plotW = w - pad.l - pad.r, plotH = h - pad.t - pad.b;
    // scales
    const xs = points.map(p=>p.x); const ys = points.map(p=>p.y);
    const xmin = -1.05, xmax = 1.05; // fixed
    const ymin = 0, ymax = Math.max(1, Math.max(...ys));

    // axes
    ctx.strokeStyle='#222'; ctx.lineWidth=1; ctx.beginPath();
    ctx.moveTo(pad.l, pad.t); ctx.lineTo(pad.l, pad.t+plotH); ctx.lineTo(pad.l+plotW, pad.t+plotH); ctx.stroke();

    // labels
    ctx.fillStyle='#333'; ctx.font='14px Arial'; ctx.fillText('Sentiment Intensity', pad.l + plotW/2 - 50, pad.t+plotH+30);
    ctx.save(); ctx.translate(14, pad.t + plotH/2 + 30); ctx.rotate(-Math.PI/2); ctx.fillText('Total Engagement', 0,0); ctx.restore();

    // draw points
    points.forEach(pt=>{
      const cx = pad.l + ((pt.x - xmin)/(xmax-xmin))*plotW;
      const cy = pad.t + plotH - ((pt.y - ymin)/(ymax-ymin))*plotH;
      const radius = (pt.s || 8);
      ctx.beginPath(); ctx.fillStyle = pt.x>0? 'rgba(43,140,255,0.75)': 'rgba(255,99,132,0.75)';
      ctx.arc(cx, cy, radius, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle='rgba(0,0,0,0.06)'; ctx.stroke();
    });

    // x ticks
    ctx.fillStyle='#666'; ctx.font='12px Arial';
    for(let v=-1; v<=1; v+=0.5){
      const x = pad.l + ((v - xmin)/(xmax-xmin))*plotW;
      ctx.fillText(v.toFixed(1), x-10, pad.t+plotH+18);
    }
  };

  SimpleCharts.renderHistOverlay = function(canvas, verified, unverified, opts){
    const ctx = fitCanvas(canvas);
    const w = canvas.clientWidth, h = canvas.clientHeight;
    clearCanvas(canvas);
    const pad = {l:50,r:20,t:30,b:40};
    const plotW = w - pad.l - pad.r, plotH = h - pad.t - pad.b;
    const min = -1, max = 1, bins = opts && opts.bins || 24;
    const binWidth = (max-min)/bins;
    const vcounts = new Array(bins).fill(0);
    const ucounts = new Array(bins).fill(0);
    verified.forEach(v=>{ const i=Math.min(bins-1, Math.floor((v-min)/binWidth)); if(i>=0) vcounts[i]++; });
    unverified.forEach(v=>{ const i=Math.min(bins-1, Math.floor((v-min)/binWidth)); if(i>=0) ucounts[i]++; });
    const ymax = Math.max(...vcounts, ...ucounts,1);

    // axes
    ctx.strokeStyle='#222'; ctx.beginPath(); ctx.moveTo(pad.l,pad.t); ctx.lineTo(pad.l,pad.t+plotH); ctx.lineTo(pad.l+plotW,pad.t+plotH); ctx.stroke();

    // bars (draw verified then unverified with alpha)
    for(let i=0;i<bins;i++){
      const x = pad.l + (i/bins)*plotW;
      const bw = (plotW/bins)*0.9;
      const vh = (vcounts[i]/ymax)*plotH;
      const uh = (ucounts[i]/ymax)*plotH;
      // verified - left
      ctx.fillStyle='rgba(43,140,255,0.85)'; ctx.fillRect(x, pad.t+plotH-vh, bw*0.45, vh);
      // unverified - right
      ctx.fillStyle='rgba(255,159,64,0.8)'; ctx.fillRect(x + bw*0.45, pad.t+plotH-uh, bw*0.45, uh);
    }

    // labels
    ctx.fillStyle='#333'; ctx.font='13px Arial'; ctx.fillText('Sentiment Intensity', pad.l + plotW/2 - 50, pad.t+plotH+30);
    ctx.fillText('Frequency', 8, pad.t+12);
  };

  SimpleCharts.renderDistribution = function(canvas, allScores, opts){
    const ctx = fitCanvas(canvas);
    const w = canvas.clientWidth, h = canvas.clientHeight;
    clearCanvas(canvas);
    const pad = {l:50,r:20,t:30,b:40};
    const plotW = w - pad.l - pad.r, plotH = h - pad.t - pad.b;
    const min = -2, max = 2, bins = opts && opts.bins || 30;
    const binWidth = (max-min)/bins;
    const counts = new Array(bins).fill(0);
    allScores.forEach(v=>{ const i=Math.min(bins-1, Math.floor((v-min)/binWidth)); if(i>=0) counts[i]++; });
    const ymax = Math.max(...counts,1);

    // bars
    for(let i=0;i<bins;i++){
      const x = pad.l + (i/bins)*plotW;
      const bw = (plotW/bins)*0.9;
      const hgt = (counts[i]/ymax)*plotH;
      ctx.fillStyle='rgba(43,140,255,0.7)'; ctx.fillRect(x, pad.t+plotH-hgt, bw, hgt);
    }

    // mean line
    const mean = (allScores.reduce((s,v)=>s+v,0)/allScores.length) || 0;
    const px = pad.l + ((mean - min)/(max-min))*plotW;
    ctx.strokeStyle='rgba(220,38,38,0.9)'; ctx.setLineDash([6,6]); ctx.beginPath(); ctx.moveTo(px, pad.t); ctx.lineTo(px, pad.t+plotH); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle='rgba(220,38,38,0.9)'; ctx.font='12px Arial'; ctx.fillText('Mean: '+mean.toFixed(3), px+6, pad.t+14);

    ctx.fillStyle='#333'; ctx.font='13px Arial'; ctx.fillText('Sentiment Intensity Score', pad.l + plotW/2 - 70, pad.t+plotH+30);
  };

  global.SimpleCharts = SimpleCharts;
})(window);