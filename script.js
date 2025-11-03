alert("hello")

    let strokes = [];
    let time = 0;
    let revealTime = 0;
    const canvasWidth = 600;
    const canvasHeight = 700;
    let fishX = 600;
    let fishY = 300;

    function setup() {
      const c = createCanvas(canvasWidth, canvasHeight);
      c.parent('sketch');
      cursor('pointer'); // 鼠标变成手型

      const rectWidth = 240;
      const rectHeight = 340;
      const startX = (canvasWidth - rectWidth) / 2;
      const startY = (canvasHeight - rectHeight) / 2;

      const cols = 10;
      const rows = 10;
      const horizontalSpacing = rectWidth / (cols - 1);
      const verticalSpacing = rectHeight / (rows - 1);

      const fixedCoralWidth = 34;
      const fixedCoralHeight = 48;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const baseX = startX + col * horizontalSpacing;
          const baseY = startY + row * verticalSpacing;

          strokes.push({
            baseX: baseX,
            baseY: baseY,
            x: baseX + (Math.random() - 0.5) * horizontalSpacing * 0.4,
            y: baseY + (Math.random() - 0.5) * verticalSpacing * 0.3,
            height: fixedCoralHeight * (1.4 + Math.random() * 0.7),
            width: fixedCoralWidth * (0.7 + Math.random() * 0.4),
            row: row,
            col: col,
            rows: rows,
            cols: cols,
            swaySpeed: 0.2 + Math.random() * 0.6,
            swayAmount: 2 + Math.random() * 5,
            phaseOffset: Math.random() * Math.PI * 2,
            curveOffset: (Math.random() - 0.5) * 12,
            colorVar: Math.random(),
            growthSpeed: 0.3 + Math.random() * 0.4,
            growthPhase: Math.random() * Math.PI * 2
          });
        }
      }
    }

    function drawCoral(s, revealY) {
      const progress = s.row / (s.rows - 1);

      const sway = Math.sin(time * s.swaySpeed + s.phaseOffset) * s.swayAmount * (1 - progress);
      const animatedX = s.x + sway;

      const growthPulse = Math.sin(time * s.growthSpeed + s.growthPhase);
      const heightScale = 0.85 + (growthPulse * 0.15 * (1 - progress));
      const animatedHeight = s.height * heightScale;

      let r, g, b, alpha;

      const colorVar = s.colorVar;
      const horizontalVar = s.col / s.cols;

      if (progress < 0.25) {
        r = Math.floor(30 + progress * 100);
        g = Math.floor(40 + progress * 150);
        b = Math.floor(100 + progress * 100);
      } else if (progress < 0.45) {
        const midProgress = (progress - 0.25) / 0.2;
        if (colorVar < 0.3 && horizontalVar > 0.3 && horizontalVar < 0.7) {
          r = Math.floor(180 + midProgress * 40);
          g = Math.floor(120 + midProgress * 60);
          b = Math.floor(140 + midProgress * 40);
        } else {
          r = Math.floor(60 + midProgress * 80);
          g = Math.floor(100 + midProgress * 100);
          b = Math.floor(160 + midProgress * 60);
        }
      } else if (progress < 0.65) {
        const midProgress = (progress - 0.45) / 0.2;
        if (colorVar < 0.25) {
          r = 220; g = 140; b = 140;
        } else if (colorVar < 0.45) {
          r = Math.floor(140 + midProgress * 40);
          g = Math.floor(120 + midProgress * 80);
          b = Math.floor(180 + midProgress * 40);
        } else if (colorVar < 0.6) {
          r = 20; g = 30; b = 80;
        } else {
          r = Math.floor(80 + midProgress * 80);
          g = Math.floor(140 + midProgress * 80);
          b = Math.floor(200 + midProgress * 40);
        }
      } else {
        const bottomProgress = (progress - 0.65) / 0.35;
        r = Math.floor(100 + bottomProgress * 100);
        g = Math.floor(180 + bottomProgress * 60);
        b = Math.floor(220 + bottomProgress * 30);
      }

      r = Math.max(0, Math.min(255, r));
      g = Math.max(0, Math.min(255, g));
      b = Math.max(0, Math.min(255, b));
      alpha = 0.92;

      const halfHeight = animatedHeight / 2;
      const animatedCurve = s.curveOffset + sway * 0.5;

      const coralTop = s.y - halfHeight;
      if (coralTop > revealY) return;

      const topY = s.y - halfHeight;
      const bottomY = s.y + halfHeight;

      const segments = 20;
      strokeWeight(s.width);
      noFill();

      for (let i = 0; i < segments; i++) {
        const t = i / segments;
        const nextT = (i + 1) / segments;

        const gradientFactor = t;
        const brightnessFactor = 0.85 + gradientFactor * 0.35;
        const blueTint = (1 - gradientFactor) * 30;

        let segmentR = r * brightnessFactor;
        let segmentG = g * brightnessFactor;
        let segmentB = b * brightnessFactor + blueTint;

        segmentR = Math.max(0, Math.min(255, segmentR));
        segmentG = Math.max(0, Math.min(255, segmentG));
        segmentB = Math.max(0, Math.min(255, segmentB));

        stroke(segmentR, segmentG, segmentB, alpha * 255);

        const y1 = lerp(topY, bottomY, t);
        const y2 = lerp(topY, bottomY, nextT);

        if (y1 > revealY) continue;

        const clippedY2 = Math.min(y2, revealY);

        const curveT = t * 2 - 1;
        const nextCurveT = nextT * 2 - 1;
        const x1 = animatedX + animatedCurve * 0.5 + animatedCurve * 0.5 * (1 - curveT * curveT);
        const x2 = animatedX + animatedCurve * 0.5 + animatedCurve * 0.5 * (1 - nextCurveT * nextCurveT);

        line(x1, y1, x2, clippedY2);
      }
    }

    function draw() {
      background(255);
      strokeCap(ROUND);

      // 露出动画（从上往下 reveal）
      const revealProgress = Math.min(1, revealTime / 2.0);
      const revealY = revealProgress * canvasHeight;

      // 背景珊瑚（rows 0-4）
      for (const s of strokes) {
        if (s.row <= 4) drawCoral(s, revealY);
      }

      // 鱼的运动
      const targetX = 300;
      if (fishX > targetX) fishX -= 0.7;

      const fishBob = Math.sin(time * 3) * 15;
      const currentFishY = fishY + fishBob;

      // 画鱼
      fill(237, 134, 93);
      noStroke();
      triangle(fishX, currentFishY, fishX + 30, currentFishY - 15, fishX + 30, currentFishY + 15);
      fill(237, 134, 93);
      triangle(fishX + 30, currentFishY, fishX + 45, currentFishY - 10, fishX + 45, currentFishY + 10);
      fill(247, 153, 112);
      triangle(fishX, currentFishY, fishX + 15, currentFishY - 8, fishX + 15, currentFishY + 8);

      // 前景珊瑚（rows 5-9）遮挡鱼
      for (const s of strokes) {
        if (s.row > 4) drawCoral(s, revealY);
      }

      // 底部白色信息区（你原本的两个 rect 合并为一个）
      fill(255);
      noStroke();
      rect(0, 500, 600, 200);

      // 时间推进
      time += 0.015;
      if (revealTime < 2.0) revealTime += 0.016;
    }

    // 点击画布跳转到Google
    function mousePressed() {
      window.open('https://www.google.com/', '_blank');
    }