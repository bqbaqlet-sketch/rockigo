function bookModel(fact) {
  const captions = {
    logs: [
      "Две цветные метки расположены на одной глубине, напротив выделенного слоя. Так совмещают показания разных методов перед сравнением.",
      "Екі түсті белгі бір тереңдікте, ерекшеленген қабаттың тұсында тұр. Салыстыру алдында әртүрлі әдістердің көрсеткіштері осылай сәйкестендіріледі.",
      "The two coloured markers line up at the same depth, beside the highlighted layer. Align readings from different methods by depth before comparing them."
    ],
    lens: [
      "Светлая линза широкая, но тонкая. Поверни модель, чтобы увидеть, как она сужается к краям.",
      "Ашық түсті линза кең, бірақ жұқа. Шеттеріне қарай қалай жұқаратынын көру үшін үлгіні бұр.",
      "The light-coloured lens is wide and thin. Turn the model to see it taper at the edges."
    ],
    atoll: [
      "Светлая часть — кольцо рифа вокруг центральной области. Поверни модель, чтобы увидеть овал с разных сторон.",
      "Ашық түсті бөлік — орталық аумақты қоршаған риф сақинасы. Сопақ пішінді әр қырынан көру үшін үлгіні бұр.",
      "The light-coloured reef rings the central area. Turn the model to see the oval from different sides."
    ],
    zones: [
      "Три цветные полосы показывают, как соседние зоны тянутся вдоль одной рифовой системы.",
      "Үш түсті жолақ көршілес белдемдердің бір риф жүйесі бойымен қалай созылатынын көрсетеді.",
      "Three coloured strips show neighbouring zones extending along the same reef system."
    ],
    cement: [
      "На одной площадке между зёрнами виден зазор. На другой оранжевый минерал заполняет часть такого же зазора.",
      "Бір алаңшада түйірлер арасындағы қуыс көрінеді. Екіншісінде қызғылт сары минерал сондай қуыстың бір бөлігін толтырып тұр.",
      "One platform shows the gap between grains. On the other, orange mineral cement fills part of the same gap."
    ]
  };
  const title = txt("strong", fact.term);
  const caption = txt("figcaption");
  caption.append(title, txt("p", captions[fact.scene], "book-model-caption"));
  const figure = txt("figure", "", "book-model");
  figure.append(caption, txt("p", t("exampleLabel"), "muted"));
  const canvas = txt("canvas");
  const context = canvas.getContext("2d");
  if (!context) return figure;

  canvas.width = 720;
  canvas.height = 400;
  canvas.setAttribute("role", "img");
  canvas.setAttribute("aria-label", title.textContent);

  const faces = bookModelGeometry(fact.scene);
  let yaw = 0.48;
  let tilt = fact.scene === "atoll" ? 0.9 : 0.62;
  let drag;
  const draw = () => paintBookModel(canvas, context, faces, yaw, tilt);
  const rotate = (horizontal, vertical = 0) => {
    yaw += horizontal;
    tilt = Math.max(0.22, Math.min(1.42, tilt + vertical));
    draw();
  };

  canvas.addEventListener("pointerdown", event => {
    if (!event.isPrimary || event.button !== 0) return;
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY };
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener("pointermove", event => {
    if (drag?.id !== event.pointerId) return;
    rotate((event.clientX - drag.x) * 0.012, (event.clientY - drag.y) * 0.008);
    drag.x = event.clientX;
    drag.y = event.clientY;
  });
  canvas.addEventListener("lostpointercapture", () => { drag = undefined; });

  figure.append(canvas, div("book-model-controls",
    btn(t("turnLeft"), () => rotate(-Math.PI / 8), "soft"),
    btn(t("turnRight"), () => rotate(Math.PI / 8), "soft"),
    txt("span", t("rotateExample"), "muted")
  ));
  draw();
  return figure;
}

function bookModelGeometry(scene) {
  const faces = [];
  const teal = "#47c2b1";
  const sand = "#f0c783";
  const blue = "#3d7b98";

  function face(vertices, hex) {
    const normal = vertices[1].map((coordinate, axis) => coordinate - vertices[0][axis]);
    const edge = vertices[2].map((coordinate, axis) => coordinate - vertices[0][axis]);
    const [a, b, c] = normal;
    const [x, y, z] = edge;
    const nx = b * z - c * y;
    const ny = c * x - a * z;
    const nz = a * y - b * x;
    const length = Math.hypot(nx, ny, nz);
    if (length < 1e-10) return;
    const light = 0.77 + (0.18 * Math.abs(ny) + 0.08 * Math.abs(nx) + 0.04 * Math.abs(nz)) / length;
    const [r, g, bChannel] = hex.slice(1).match(/../g).map(part => Math.round(parseInt(part, 16) * light));
    faces.push({ vertices, color: "rgb(" + [r, g, bChannel].join(",") + ")" });
  }

  function box(x, y, z, width, height, depth, color) {
    const offsets = [[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]];
    const points = offsets.map(([dx,dy,dz]) => [x + dx * width/2, y + dy * height/2, z + dz * depth/2]);
    for (const indices of [[0,1,2,3],[4,5,6,7],[0,4,7,3],[1,5,6,2],[3,2,6,7],[0,1,5,4]]) {
      face(indices.map(index => points[index]), color);
    }
  }

  function surface(around, across, point, color) {
    const grid = Array.from({length: across + 1}, (_, j) =>
      Array.from({length: around + 1}, (_, i) => point(i / around * 2 * Math.PI, j / across)));
    for (let j = 0; j < across; j++) for (let i = 0; i < around; i++) {
      face([grid[j][i], grid[j][i+1], grid[j+1][i+1], grid[j+1][i]], color);
    }
  }

  function rounded(x,y,z, width,height,depth, color, sides = 16) {
    surface(sides, 8, (angle, step) => {
      const latitude = -Math.PI / 2 + step * Math.PI;
      const radius = Math.cos(latitude);
      return [x + width * radius * Math.cos(angle), y + height * Math.sin(latitude), z + depth * radius * Math.sin(angle)];
    }, color);
  }

  switch (scene) {
    case "logs":
      box(-.45, -.92, 0, 3.25, .56, 1.7, blue);
      box(-.45, -.28, 0, 3.25, .65, 1.7, sand);
      box(-.45, .43, 0, 3.25, .67, 1.7, "#687b94");
      box(-.45, .85, 0, 3.25, .14, 1.7, teal);
      for (const [x, color] of [[.30, "#57efd0"], [.78, "#ff9d5b"]]) {
        box(x, -.12, .98, .055, 2, .07, "#a8c5da");
        box(x, -.30, 1, .23, .15, .13, color);
      }
      break;
    case "lens":
      box(0, -.60, 0, 4.2, .46, 2.58, blue);
      rounded(0, -.20, 0, 1.88, .27, 1.13, sand, 30);
      break;
    case "atoll":
      box(0, -.48, 0, 4.24, .38, 3.28, blue);
      surface(36, 10, (angle, step) => {
        const ring = step * 2 * Math.PI;
        return [(1.47 + .34 * Math.cos(ring)) * Math.cos(angle),
          -.09 + .28 * Math.sin(ring), (1.12 + .29 * Math.cos(ring)) * Math.sin(angle)];
      }, sand);
      break;
    case "zones":
      box(0, -.56, 0, 4.25, .32, 2.65, blue);
      for (const [z, color, height] of [[-.74, teal, .25],[0, sand, .42],[.74, "#f39e80", .29]]) {
        box(0, -.40 + height / 2, z, 3.92, height, .65, color);
      }
      break;
    case "cement":
      for (const x of [-1.18, 1.18]) {
        box(x, -.55, 0, 2.12, .26, 1.76, blue);
        for (const dx of [-.46, .46]) for (const z of [-.42, .42]) {
          rounded(x + dx, -.04, z, .39, .38, .32, teal, 12);
        }
      }
      rounded(1.18, -.21, .41, .27, .24, .30, "#fd9a53");
      break;
  }
  return faces;
}

function paintBookModel(canvas, context, faces, yaw, tilt) {
  const {width, height} = canvas;
  const zoom = height * .30;
  const cosYaw = Math.cos(yaw);
  const sinYaw = Math.sin(yaw);
  const cosTilt = Math.cos(tilt);
  const sinTilt = Math.sin(tilt);
  const polygons = faces.map(({vertices, color}) => {
    const points = vertices.map(([x, y, z]) => {
      const forward = x * sinYaw + z * cosYaw;
      return [width * .5 + (x * cosYaw - z * sinYaw) * zoom,
        height * .48 + (forward * sinTilt - y * cosTilt) * zoom,
        forward * cosTilt + y * sinTilt];
    });
    const depth = points.reduce((sum, point) => sum + point[2], 0) / points.length;
    return {points, color, depth};
  });

  context.clearRect(0, 0, width, height);
  for (const {points, color} of polygons.sort((a,b) => a.depth - b.depth)) {
    context.beginPath();
    context.moveTo(points[0][0], points[0][1]);
    for (const [x,y] of points.slice(1)) context.lineTo(x,y);
    context.closePath();
    context.fillStyle = context.strokeStyle = color;
    context.lineWidth = 0.8;
    context.fill();
    context.stroke();
  }
}
