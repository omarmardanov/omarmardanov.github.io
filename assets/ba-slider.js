document.querySelectorAll(".ba-slider").forEach(function (fig) {
  var frame = fig.querySelector(".ba-frame");
  var range = fig.querySelector(".ba-range");
  var before = fig.querySelector(".ba-stat-before");
  var after = fig.querySelector(".ba-stat-after");
  var demoRunning = true;

  function setPos(v) {
    v = Math.max(0, Math.min(100, v));
    range.value = v;
    frame.style.setProperty("--pos", v + "%");
    if (before && after) {
      before.classList.toggle("is-active", v > 50);
      after.classList.toggle("is-active", v <= 50);
    }
  }

  function stopDemo() {
    demoRunning = false;
  }

  frame.addEventListener("pointermove", function (e) {
    stopDemo();
    var rect = frame.getBoundingClientRect();
    setPos(((e.clientX - rect.left) / rect.width) * 100);
  });
  range.addEventListener("input", function () {
    stopDemo();
    setPos(Number(range.value));
  });
  range.addEventListener("pointerdown", stopDemo);

  // Intro demo: sweep start -> end -> back to the middle, then hand off to the user.
  var keyframes = [50, 0, 100, 50];
  var segDuration = 550;
  var segIndex = 0;
  var segStart = null;

  function ease(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  function step(ts) {
    if (!demoRunning) return;
    if (segStart === null) segStart = ts;
    var t = Math.min(1, (ts - segStart) / segDuration);
    var from = keyframes[segIndex];
    var to = keyframes[segIndex + 1];
    setPos(from + (to - from) * ease(t));
    if (t >= 1) {
      segIndex++;
      segStart = ts;
      if (segIndex >= keyframes.length - 1) {
        demoRunning = false;
        return;
      }
    }
    requestAnimationFrame(step);
  }

  setPos(50);
  requestAnimationFrame(step);
});
