import {
  FOREST_MARKERS,
  HAMLET_MARKERS,
  HILL_MARKERS,
  MOUNTAIN_MARKERS,
  ROAD_LINKS,
  WORLD_HEIGHT,
  WORLD_WIDTH,
  roadCurve,
} from './mapLayout';

function mulberry32(seed: number) {
  return function random() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function blobPath(
  context: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  seed: number,
  points = 18,
) {
  const random = mulberry32(seed);
  const vertices: Array<{ x: number; y: number }> = [];
  for (let index = 0; index < points; index += 1) {
    const angle = (Math.PI * 2 * index) / points;
    const radius = 0.76 + random() * 0.34;
    vertices.push({
      x: cx + Math.cos(angle) * rx * radius,
      y: cy + Math.sin(angle) * ry * radius,
    });
  }

  context.beginPath();
  const first = vertices[0];
  const last = vertices[vertices.length - 1];
  context.moveTo((first.x + last.x) / 2, (first.y + last.y) / 2);
  vertices.forEach((point, index) => {
    const next = vertices[(index + 1) % vertices.length];
    context.quadraticCurveTo(point.x, point.y, (point.x + next.x) / 2, (point.y + next.y) / 2);
  });
  context.closePath();
}

function fillSoftBlob(
  context: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  inner: string,
  outer: string,
  seed: number,
) {
  const gradient = context.createRadialGradient(cx, cy, 0, cx, cy, Math.max(rx, ry));
  gradient.addColorStop(0, inner);
  gradient.addColorStop(0.62, inner);
  gradient.addColorStop(1, outer);
  blobPath(context, cx, cy, rx, ry, seed);
  context.fillStyle = gradient;
  context.fill();
}

export function createTerrainCanvas(width = WORLD_WIDTH * 2, height = WORLD_HEIGHT * 2): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d') as CanvasRenderingContext2D;
  if (!context) return canvas;

  const X = (percent: number) => (percent / 100) * width;
  const Y = (percent: number) => (percent / 100) * height;
  const U = width / WORLD_WIDTH;
  const random = mulberry32(4107);

  const base = context.createLinearGradient(0, 0, width, height);
  base.addColorStop(0, '#d9c68d');
  base.addColorStop(0.28, '#c4b577');
  base.addColorStop(0.52, '#b5aa6d');
  base.addColorStop(0.78, '#c9b77b');
  base.addColorStop(1, '#d5c28b');
  context.fillStyle = base;
  context.fillRect(0, 0, width, height);

  fillSoftBlob(context, X(23), Y(37), X(25), Y(21), 'rgba(78, 111, 61, 0.42)', 'rgba(78, 111, 61, 0)', 11);
  fillSoftBlob(context, X(53), Y(34), X(24), Y(18), 'rgba(117, 103, 73, 0.38)', 'rgba(117, 103, 73, 0)', 12);
  fillSoftBlob(context, X(78), Y(43), X(22), Y(24), 'rgba(91, 112, 91, 0.26)', 'rgba(91, 112, 91, 0)', 13);
  fillSoftBlob(context, X(49), Y(73), X(35), Y(19), 'rgba(177, 143, 74, 0.22)', 'rgba(177, 143, 74, 0)', 14);
  fillSoftBlob(context, X(47), Y(16), X(26), Y(15), 'rgba(205, 176, 94, 0.28)', 'rgba(205, 176, 94, 0)', 15);

  context.save();
  context.globalAlpha = 0.12;
  for (let index = 0; index < 9500; index += 1) {
    const x = random() * width;
    const y = random() * height;
    const size = 0.45 + random() * 1.4;
    context.fillStyle = random() > 0.5 ? '#5d4727' : '#f0dda5';
    context.fillRect(x, y, size, size);
  }
  context.restore();

  context.save();
  context.beginPath();
  context.moveTo(X(37), Y(4));
  context.lineTo(X(59), Y(7));
  context.lineTo(X(61), Y(18));
  context.lineTo(X(39), Y(18));
  context.closePath();
  context.clip();
  context.fillStyle = 'rgba(178, 143, 63, 0.22)';
  context.fillRect(X(35), Y(2), X(30), Y(20));
  context.strokeStyle = 'rgba(104, 76, 34, 0.24)';
  context.lineWidth = 1.4 * U;
  for (let offset = -8; offset < 26; offset += 3) {
    context.beginPath();
    context.moveTo(X(35 + offset), Y(2));
    context.lineTo(X(47 + offset), Y(20));
    context.stroke();
  }
  context.restore();

  const sea = context.createLinearGradient(0, Y(78), 0, height);
  sea.addColorStop(0, 'rgba(117, 151, 139, 0.5)');
  sea.addColorStop(0.35, 'rgba(83, 124, 119, 0.72)');
  sea.addColorStop(1, 'rgba(48, 86, 91, 0.9)');
  context.beginPath();
  context.moveTo(X(-4), Y(92));
  context.bezierCurveTo(X(18), Y(84), X(39), Y(97), X(62), Y(89));
  context.bezierCurveTo(X(77), Y(84), X(91), Y(89), X(104), Y(80));
  context.lineTo(X(105), Y(105));
  context.lineTo(X(-5), Y(105));
  context.closePath();
  context.fillStyle = sea;
  context.fill();

  context.save();
  context.strokeStyle = 'rgba(239, 226, 177, 0.28)';
  context.lineWidth = 2.2 * U;
  context.beginPath();
  context.moveTo(X(-4), Y(91.2));
  context.bezierCurveTo(X(18), Y(83.4), X(39), Y(96), X(62), Y(88.2));
  context.bezierCurveTo(X(77), Y(83.5), X(91), Y(88.2), X(104), Y(79.5));
  context.stroke();
  context.strokeStyle = 'rgba(238, 233, 198, 0.27)';
  context.lineWidth = 1.2 * U;
  for (const wave of [
    [16, 94, 6], [35, 96, 6], [70, 92, 6], [86, 94, 6], [52, 94, 5], [76, 96, 5],
  ]) {
    context.beginPath();
    context.moveTo(X(wave[0]), Y(wave[1]));
    context.quadraticCurveTo(X(wave[0] + wave[2] / 2), Y(wave[1] - 1.7), X(wave[0] + wave[2]), Y(wave[1]));
    context.stroke();
  }
  context.restore();

  context.save();
  context.lineCap = 'round';
  context.lineJoin = 'round';
  context.strokeStyle = 'rgba(59, 99, 100, 0.38)';
  context.lineWidth = 13 * U;
  context.beginPath();
  context.moveTo(X(-4), Y(70));
  context.bezierCurveTo(X(20), Y(58), X(22), Y(39), X(45), Y(39));
  context.bezierCurveTo(X(68), Y(39), X(69), Y(23), X(104), Y(12));
  context.stroke();
  context.strokeStyle = 'rgba(128, 165, 151, 0.46)';
  context.lineWidth = 6 * U;
  context.stroke();
  context.strokeStyle = 'rgba(231, 226, 184, 0.18)';
  context.lineWidth = 1.4 * U;
  context.stroke();
  context.restore();

  context.save();
  context.strokeStyle = 'rgba(91, 70, 38, 0.2)';
  context.lineWidth = 1.2 * U;
  for (const contour of [
    [[35, 53], [45, 48], [59, 49], [70, 54]],
    [[40, 59], [51, 55], [62, 56], [74, 61]],
    [[8, 49], [17, 45], [28, 46], [36, 51]],
    [[58, 18], [67, 15], [78, 16], [87, 20]],
    [[65, 66], [74, 62], [84, 63], [92, 68]],
  ]) {
    context.beginPath();
    context.moveTo(X(contour[0][0]), Y(contour[0][1]));
    context.bezierCurveTo(
      X(contour[1][0]), Y(contour[1][1]),
      X(contour[2][0]), Y(contour[2][1]),
      X(contour[3][0]), Y(contour[3][1]),
    );
    context.stroke();
  }
  context.restore();

  function drawTree(xPercent: number, yPercent: number, sizePercent: number, seed: number) {
    const treeRandom = mulberry32(seed);
    const x = X(xPercent);
    const y = Y(yPercent);
    const s = X(sizePercent);
    const hue = treeRandom() * 16 - 8;
    context.save();
    context.translate(x, y);
    context.fillStyle = 'rgba(52, 39, 20, 0.18)';
    context.beginPath();
    context.ellipse(s * 0.12, s * 0.34, s * 0.42, s * 0.16, 0, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = `rgb(${54 + hue}, ${91 + hue}, ${43 + hue * 0.3})`;
    context.strokeStyle = 'rgba(36, 55, 29, 0.5)';
    context.lineWidth = 0.8 * U;
    context.beginPath();
    context.moveTo(0, -s * 0.55);
    context.lineTo(-s * 0.43, s * 0.18);
    context.lineTo(s * 0.43, s * 0.18);
    context.closePath();
    context.fill();
    context.stroke();
    context.fillStyle = 'rgba(74, 48, 24, 0.72)';
    context.fillRect(-s * 0.06, s * 0.12, s * 0.12, s * 0.34);
    context.restore();
  }

  FOREST_MARKERS.forEach((marker, index) => drawTree(marker.x, marker.y, marker.s, 100 + index));

  const forestRandom = mulberry32(807);
  for (let index = 0; index < 34; index += 1) {
    const x = 11 + forestRandom() * 22;
    const y = 26 + forestRandom() * 18;
    drawTree(x, y, 1.1 + forestRandom() * 1.25, 900 + index);
  }

  function drawMountain(xPercent: number, yPercent: number, sizePercent: number) {
    const x = X(xPercent);
    const y = Y(yPercent);
    const s = X(sizePercent);
    context.save();
    context.translate(x, y);
    context.fillStyle = 'rgba(52, 39, 24, 0.2)';
    context.beginPath();
    context.ellipse(0, s * 0.39, s * 0.68, s * 0.18, 0, 0, Math.PI * 2);
    context.fill();

    context.beginPath();
    context.moveTo(-s * 0.62, s * 0.38);
    context.lineTo(-s * 0.25, -s * 0.02);
    context.lineTo(0, -s * 0.54);
    context.lineTo(s * 0.25, -s * 0.02);
    context.lineTo(s * 0.62, s * 0.38);
    context.closePath();
    const rock = context.createLinearGradient(-s * 0.5, -s * 0.5, s * 0.55, s * 0.4);
    rock.addColorStop(0, '#95866b');
    rock.addColorStop(0.46, '#6f6250');
    rock.addColorStop(1, '#3f372e');
    context.fillStyle = rock;
    context.fill();
    context.strokeStyle = 'rgba(48, 38, 28, 0.6)';
    context.lineWidth = 1.2 * U;
    context.stroke();

    context.beginPath();
    context.moveTo(0, -s * 0.54);
    context.lineTo(-s * 0.1, -s * 0.18);
    context.lineTo(s * 0.03, -s * 0.25);
    context.lineTo(s * 0.12, -s * 0.1);
    context.closePath();
    context.fillStyle = 'rgba(230, 219, 184, 0.56)';
    context.fill();
    context.restore();
  }

  MOUNTAIN_MARKERS.forEach((marker) => drawMountain(marker.x, marker.y, marker.s));

  function drawHill(xPercent: number, yPercent: number, sizePercent: number) {
    const x = X(xPercent);
    const y = Y(yPercent);
    const s = X(sizePercent);
    context.save();
    context.translate(x, y);
    context.fillStyle = 'rgba(136, 116, 67, 0.2)';
    context.beginPath();
    context.moveTo(-s, s * 0.28);
    context.quadraticCurveTo(0, -s * 0.58, s, s * 0.28);
    context.closePath();
    context.fill();
    context.strokeStyle = 'rgba(91, 70, 38, 0.27)';
    context.lineWidth = 1 * U;
    context.beginPath();
    context.moveTo(-s * 0.48, s * 0.08);
    context.quadraticCurveTo(0, -s * 0.25, s * 0.48, s * 0.08);
    context.stroke();
    context.restore();
  }

  HILL_MARKERS.forEach((marker) => drawHill(marker.x, marker.y, marker.s));

  context.save();
  context.lineCap = 'round';
  ROAD_LINKS.forEach(([from, to], index) => {
    const curve = roadCurve(from, to, index);
    context.beginPath();
    context.moveTo(X(curve.a.x), Y(curve.a.y));
    context.quadraticCurveTo(X(curve.control.x), Y(curve.control.y), X(curve.b.x), Y(curve.b.y));
    context.setLineDash([]);
    context.strokeStyle = 'rgba(58, 39, 21, 0.22)';
    context.lineWidth = 4.4 * U;
    context.stroke();
    context.setLineDash([9 * U, 8 * U]);
    context.strokeStyle = 'rgba(70, 45, 22, 0.66)';
    context.lineWidth = 2.2 * U;
    context.stroke();
  });
  context.restore();

  function drawHamlet(xPercent: number, yPercent: number, sizePercent: number) {
    const x = X(xPercent);
    const y = Y(yPercent);
    const s = X(sizePercent);
    context.save();
    context.translate(x, y);
    context.fillStyle = 'rgba(50, 33, 17, 0.2)';
    context.beginPath();
    context.ellipse(0, s * 0.58, s * 0.95, s * 0.23, 0, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = 'rgba(181, 132, 72, 0.72)';
    context.strokeStyle = 'rgba(70, 43, 20, 0.55)';
    context.lineWidth = 1 * U;
    context.fillRect(-s * 0.72, 0, s * 1.44, s * 0.62);
    context.strokeRect(-s * 0.72, 0, s * 1.44, s * 0.62);
    context.beginPath();
    context.moveTo(-s, 0);
    context.lineTo(0, -s * 0.74);
    context.lineTo(s, 0);
    context.closePath();
    context.fillStyle = 'rgba(98, 52, 27, 0.78)';
    context.fill();
    context.stroke();
    context.restore();
  }

  HAMLET_MARKERS.forEach((marker) => drawHamlet(marker.x, marker.y, marker.s));

  context.save();
  for (let index = 0; index < 11; index += 1) {
    const x = random() * width;
    const y = random() * height * 0.86;
    const radius = (55 + random() * 130) * U;
    const stain = context.createRadialGradient(x, y, 0, x, y, radius);
    stain.addColorStop(0, 'rgba(83, 51, 23, 0.045)');
    stain.addColorStop(1, 'rgba(83, 51, 23, 0)');
    context.fillStyle = stain;
    context.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }
  context.restore();

  const vignette = context.createRadialGradient(
    width / 2,
    height / 2,
    Math.min(width, height) * 0.28,
    width / 2,
    height / 2,
    Math.max(width, height) * 0.72,
  );
  vignette.addColorStop(0, 'rgba(54, 34, 16, 0)');
  vignette.addColorStop(1, 'rgba(54, 34, 16, 0.18)');
  context.fillStyle = vignette;
  context.fillRect(0, 0, width, height);

  return canvas;
}
