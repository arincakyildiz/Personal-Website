(function () {
  var loaderEl = document.getElementById("loader");
  var bhContainer = document.getElementById("blackhole");
  var centerHover = document.getElementById("centerHover");
  var welcomeSlide = document.getElementById("welcomeSlide");
  if (!loaderEl || !bhContainer) return;

  var triggered = false;

  /* Generate Welcome image — tüm mobil cihazlarda tam görünsün */
  (function () {
    var vw = window.innerWidth;
    var isSmall = vw < 600;
    var w, h, fontSize;
    if (isSmall) {
      w = Math.max(280, vw);
      h = Math.floor(w / 2);
      fontSize = Math.floor((w - 50) / 5.5);
      fontSize = Math.min(52, Math.max(36, fontSize));
    } else {
      w = 800; h = 400; fontSize = 120;
    }
    var c = document.createElement("canvas");
    c.width = w; c.height = h;
    var ctx = c.getContext("2d");
    ctx.font = "bold " + fontSize + "px Arial, Helvetica, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#e0e0e0";
    ctx.fillText("Welcome", w / 2, h / 2);
    if (welcomeSlide) welcomeSlide.setAttribute("data-src", c.toDataURL("image/png"));
  })();

  /* ============================================================
     BLACK HOLE
     ============================================================ */
  var cw = bhContainer.offsetWidth || window.innerWidth;
  var ch = bhContainer.offsetHeight || window.innerHeight;
  var maxorbit = 255, centerx = cw/2, centery = ch/2;
  var bhStart = Date.now(), bhTime = 0;
  var stars = [], bhCollapse = false, bhExpanse = false, bhRunning = true;

  var bhCanvas = document.createElement("canvas");
  bhCanvas.width = cw; bhCanvas.height = ch;
  bhContainer.appendChild(bhCanvas);
  var bhCtx = bhCanvas.getContext("2d");
  bhCtx.globalCompositeOperation = "multiply";

  (function setDPI(c, dpi) {
    if (!c.style.width) c.style.width = c.width + "px";
    if (!c.style.height) c.style.height = c.height + "px";
    var s = dpi / 96;
    c.width = Math.ceil(c.width * s); c.height = Math.ceil(c.height * s);
    c.getContext("2d").scale(s, s);
  })(bhCanvas, 192);

  function rotate(cx, cy, x, y, a) {
    var c = Math.cos(a), s = Math.sin(a);
    return [c*(x-cx)+s*(y-cy)+cx, c*(y-cy)-s*(x-cx)+cy];
  }

  function Star() {
    this.orbital = (Math.random()*(maxorbit/2)+1 + Math.random()*(maxorbit/2)+maxorbit)/2;
    this.x = centerx; this.y = centery + this.orbital; this.yOrigin = this.y;
    this.speed = (Math.floor(Math.random()*2.5)+1.5)*Math.PI/180;
    this.startRotation = (Math.floor(Math.random()*360)+1)*Math.PI/180;
    this.rotation = 0; this.id = stars.length;
    this.collapseBonus = Math.max(0, this.orbital - maxorbit*0.7);
    this.color = "rgba(255,255,255,"+(1-this.orbital/255)+")";
    this.hoverPos = centery + maxorbit/2 + this.collapseBonus;
    this.expansePos = centery + (this.id%100)*-10 + Math.floor(Math.random()*20)+1;
    this.prevR = this.startRotation; this.prevX = this.x; this.prevY = this.y;
    stars.push(this);
  }
  Star.prototype.draw = function() {
    if (!bhExpanse) {
      this.rotation = this.startRotation + bhTime*this.speed;
      if (!bhCollapse) {
        if (this.y > this.yOrigin) this.y -= 2.5;
        if (this.y < this.yOrigin-4) this.y += (this.yOrigin-this.y)/10;
      } else {
        if (this.y > this.hoverPos) this.y -= (this.hoverPos-this.y)/-5;
        if (this.y < this.hoverPos-4) this.y += 2.5;
      }
    } else {
      this.rotation = this.startRotation + bhTime*(this.speed/2);
      if (this.y > this.expansePos) this.y -= Math.floor(this.expansePos-this.y)/-40;
    }
    bhCtx.save(); bhCtx.fillStyle = this.color; bhCtx.strokeStyle = this.color;
    bhCtx.beginPath();
    var o = rotate(centerx,centery,this.prevX,this.prevY,-this.prevR);
    bhCtx.moveTo(o[0],o[1]);
    bhCtx.translate(centerx,centery); bhCtx.rotate(this.rotation); bhCtx.translate(-centerx,-centery);
    bhCtx.lineTo(this.x,this.y); bhCtx.stroke(); bhCtx.restore();
    this.prevR=this.rotation; this.prevX=this.x; this.prevY=this.y;
  };

  bhCtx.fillStyle = "rgba(25,25,25,1)"; bhCtx.fillRect(0,0,cw,ch);
  for (var i=0; i<2500; i++) new Star();

  function bhLoop() {
    if (!bhRunning) return;
    bhTime = (Date.now()-bhStart)/50;
    bhCtx.fillStyle = "rgba(25,25,25,0.2)"; bhCtx.fillRect(0,0,cw,ch);
    for (var j=0; j<stars.length; j++) stars[j].draw();
    requestAnimationFrame(bhLoop);
  }
  bhLoop();

  /* ============================================================
     PARTICLE SLIDER — loaded locally
     ============================================================ */
  function initPS() {
    if (typeof ParticleSlider === "undefined") return;
    var isMobile = navigator.userAgent && navigator.userAgent.toLowerCase().indexOf("mobile") >= 0;
    var isSmall = window.innerWidth < 1000;
    var w = Math.max(window.innerWidth || 0, 0);
    var h = Math.max(window.innerHeight || 0, 0);
    // Prevent createImageData width/height zero crash on some mobile/resize states.
    if (w < 320 || h < 320) return;
    // On mobile/small screens black hole effect is enough; skip unstable particle slider.
    if (isMobile || isSmall) return;
    try {
      window._ps = new ParticleSlider({
        ptlGap: 0,
        ptlSize: 1,
        width: w,
        height: h,
        showArrowControls: false,
        mouseForce: 8000,
        restless: true
      });
    } catch (e) {
      window._ps = null;
    }
  }

  function cleanupPS() {
    if (!window._ps) return;
    try {
      window._ps.mouseForce = 0;
      window._ps.restless = false;
      window._ps.nextFrame = function() {};
      window._ps.drawParticles = function() {};
      if (window._ps.$container && window._ps.$container.parentNode) {
        window._ps.$container.parentNode.removeChild(window._ps.$container);
      }
    } catch (e) {}
    window._ps = null;
  }

  var psScript = document.createElement("script");
  psScript.src = "ps.js";
  psScript.onload = initPS;
  document.body.appendChild(psScript);

  /* ============================================================
     MOUSE — circle hover for black hole
     ============================================================ */
  var circleR = 128;
  function inCircle(mx, my) {
    var dx = mx - window.innerWidth/2, dy = my - window.innerHeight/2;
    return dx*dx + dy*dy <= circleR*circleR;
  }

  document.addEventListener("mousemove", function(e) {
    if (bhExpanse || !loaderEl.parentNode) return;
    var inside = inCircle(e.clientX, e.clientY);
    bhCollapse = inside;
    if (centerHover) centerHover.classList.toggle("hovered", inside);
    /* Forward mouse to ParticleSlider so Welcome particles react */
    if (window._ps) {
      var ps = window._ps;
      var container = ps.$container;
      if (container) {
        var rect = container.getBoundingClientRect();
        ps.mx = e.clientX - rect.left;
        ps.my = e.clientY - rect.top;
      }
    }
  });

  loaderEl.addEventListener("mouseleave", function() {
    if (window._ps) { window._ps.mx = -1; window._ps.my = -1; }
  });

  /* ============================================================
     CLICK / ENTER — explode + transition
     ============================================================ */
  function explodePS() {
    if (!window._ps || !window._ps.particles) return;
    var cx = window.innerWidth/2, cy = window.innerHeight/2;
    window._ps.mouseForce = 0;
    window._ps.restless = false;
    var p = window._ps.pxlBuffer.first;
    while (p !== null) {
      var dx = p.x - cx, dy = p.y - cy;
      var angle = Math.atan2(dy, dx) + (Math.random()-0.5)*0.3;
      var dist = 1500 + Math.random()*2000;
      p.gravityX = cx + Math.cos(angle)*dist;
      p.gravityY = cy + Math.sin(angle)*dist;
      p = p.next;
    }
  }

  function triggerEnter() {
    if (triggered) return;
    triggered = true;
    bhCollapse = false; bhExpanse = true;
    if (centerHover) centerHover.classList.add("open");
    explodePS();
    setTimeout(function() {
      cleanupPS();
      loaderEl.classList.add("loader-hidden");
      window.scrollTo(0, 0);
      setTimeout(function() { loaderEl.remove(); bhRunning = false; }, 600);
    }, 2000);
  }

  document.addEventListener("click", function(e) {
    if (!loaderEl.parentNode) return;
    if (inCircle(e.clientX, e.clientY)) triggerEnter();
  });
  document.addEventListener("keydown", function(e) {
    if (e.key === "Enter" && loaderEl.parentNode) triggerEnter();
  });

  var loaderSkipBtn = document.getElementById("loaderSkip");
  if (loaderSkipBtn) loaderSkipBtn.addEventListener("click", function() {
    triggerEnter();
  });

  setTimeout(triggerEnter, 3000);
})();
