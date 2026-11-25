function mapPolygon(context,points,fill,stroke) {
  context.beginPath();
  points.forEach(([x,y],index)=>index?context.lineTo(x,y):context.moveTo(x,y));
  context.closePath();
  context.fillStyle=fill;
  context.fill();
  if(stroke){
    context.strokeStyle=stroke;
    context.stroke();
  }
}

function mapLines(context,lines,color,width) {
  context.beginPath();
  for(const line of lines)line.forEach(([x,y],index)=>index?context.lineTo(x,y):context.moveTo(x,y));
  context.lineWidth=width;
  context.strokeStyle=color;
  context.stroke();
}

function mapDerrick(context,colors) {
  mapPolygon(context,[[-31,19],[-18,13],[24,13],[33,19],[25,24],[-23,24]],colors.landEdge);
  context.lineWidth=2.5;
  mapPolygon(context,[[-23,18],[-8,-33],[8,-33],[23,18]],colors.metal,colors.machine);
  mapLines(context,[
    [[-18,2],[18,2]], [[-14,-13],[14,-13]], [[-10,-26],[10,-26]],
    [[-23,18],[18,2],[-14,-13],[10,-26],[-8,-33]],
    [[23,18],[-18,2],[14,-13],[-10,-26],[8,-33]]
  ],colors.machine,1.6);
  mapPolygon(context,[[-10,-34],[10,-34],[6,-44],[-6,-44]],colors.machine);
  mapLines(context,[[[-29,19],[29,19]],[[0,-44],[0,-50]]],colors.machine,3);
}

function mapPumpjack(context,colors) {
  mapPolygon(context,[[-39,21],[-29,14],[31,14],[41,21],[30,27],[-26,27]],colors.landEdge);
  context.lineWidth=2.5;
  mapPolygon(context,[[-23,18],[-9,-13],[-6,-13],[8,18]],colors.metal,colors.machine);
  mapLines(context,[[[-28,19],[35,19]], [[-16,4],[-1,4]], [[-26,5],[-32,-8]],
    [[29,-18],[29,12],[34,12]]],colors.machine,2.5);
  mapPolygon(context,[[-34,-10],[24,-28],[27,-22],[-31,-4]],colors.machine);
  mapPolygon(context,[[22,-28],[30,-29],[36,-15],[32,-9],[26,-11]],colors.machine);
  context.fillStyle=colors.rock;
  context.beginPath();
  context.arc(-9,-16,4,0,Math.PI*2);
  context.fill();
}

function mapOutcrop(context,colors) {
  context.lineWidth=1.8;
  mapPolygon(context,[[-39,12],[-24,-11],[-8,-12],[1,-26],[15,-24],[24,-8],[34,-7],[41,13],[20,21],[-26,21]],
    colors.rock,colors.strata);
  mapPolygon(context,[[1,-26],[15,-24],[24,-8],[34,-7],[41,13],[20,21],[15,7],[14,-9]],colors.strata);
  mapLines(context,[[[-32,3],[-15,0],[-7,3],[15,1]],
    [[-38,12],[-19,8],[-3,12],[18,10]],[[17,4],[33,1]],[[20,13],[38,8]]],colors.mapInk,1.5);
}

function mapCrystals(context,colors) {
  mapPolygon(context,[[-33,15],[-21,7],[20,7],[34,17],[18,24],[-19,23]],colors.rock);
  context.lineWidth=1.4;
  mapPolygon(context,[[-23,15],[-29,-11],[-21,-23],[-10,-16],[-6,14]],colors.crystalLight,colors.crystal);
  mapPolygon(context,[[3,17],[12,-12],[24,-22],[30,-10],[22,17]],colors.crystalLight,colors.crystal);
  mapPolygon(context,[[-9,17],[-11,-25],[0,-42],[11,-26],[10,18]],colors.crystalLight,colors.crystal);
  mapPolygon(context,[[0,-42],[11,-26],[10,18],[-1,16],[-1,-23]],colors.crystal);
  mapLines(context,[[[-24,-11],[-19,8]],[[23,-12],[17,10]],[[-7,-18],[-6,9]]],colors.crystal,1.7);
}

function mapContour(context,x,y,rx,ry) {
  context.beginPath();
  context.moveTo(x+rx,y);
  context.bezierCurveTo(x+rx*.96,y-ry*.83,x+rx*.36,y-ry*.62,x+rx*.03,y-ry);
  context.bezierCurveTo(x-rx*.42,y-ry*1.37,x-rx,y-ry*.57,x-rx,y-ry*.08);
  context.bezierCurveTo(x-rx,y+ry*.59,x-rx*.52,y+ry*.94,x-rx*.04,y+ry*.83);
  context.bezierCurveTo(x+rx*.57,y+ry*.76,x+rx*.95,y+ry*.56,x+rx,y);
  context.closePath();
}

function drawTestMapLandmarks(context,width,height,points,style) {
  const color=name=>style.getPropertyValue(name).trim();
  const colors={
    mapInk:color("--map-ink"), land:color("--map-land"), landEdge:color("--map-land-edge"),
    machine:color("--map-machine"), metal:color("--map-metal"),
    rock:color("--map-rock"), strata:color("--map-strata"),
    crystal:color("--map-crystal"), crystalLight:color("--map-crystal-light")
  };
  context.save();
  context.lineJoin="round";
  context.strokeStyle=color("--test-map-contour");
  context.fillStyle=colors.land;
  context.lineWidth=1.25;
  for(const [x,y,rx,ry] of [[.91,.11,.32,.19],[-.03,.33,.32,.23],[.96,.75,.29,.24],[.04,.94,.28,.13]]){
    for(let i=0;i<7;i++){
      const scale=1-i*.105;
      mapContour(context,x*width,y*height,rx*width*scale,ry*height*scale);
      if(i===0)context.fill();
      context.stroke();
    }
  }
  context.beginPath();
  context.moveTo(width*1.04,height*.33);
  context.bezierCurveTo(width*.88,height*.39,width*.91,height*.48,width*.99,height*.55);
  context.bezierCurveTo(width*1.07,height*.63,width*.83,height*.73,width*.88,height*.84);
  context.bezierCurveTo(width*.92,height*.91,width*.81,height*.96,width*.8,height*1.02);
  context.strokeStyle=color("--map-water-edge");
  context.lineWidth=Math.max(15,Math.min(width*.038,52));
  context.stroke();
  context.strokeStyle=color("--map-water");
  context.lineWidth-=5;
  context.stroke();

  const [first,second,third,fourth,fifth,sixth,last]=Array.from({length:7},(_,index)=>
    points[Math.round(index*(points.length-1)/6)][1]);
  const wide=width>720;
  const landmarks=wide?[
    [mapDerrick,.17,first-20,1.16],[mapDerrick,.24,first+14,.84],
    [mapPumpjack,.84,second+6,1.18],[mapOutcrop,.20,third+18,1.20],
    [mapCrystals,.85,fourth+55,1.12],[mapOutcrop,.12,fifth+23,.84],
    [mapDerrick,.87,sixth+31,1.17],[mapCrystals,.29,last+33,.86]
  ]:[
    [mapDerrick,.30,first-27,.66],[mapOutcrop,.10,second+38,.62],
    [mapCrystals,.22,third+47,.50],[mapPumpjack,.29,fourth+47,.65],
    [mapDerrick,.32,fifth+44,.59],[mapOutcrop,.11,sixth+38,.58],
    [mapCrystals,.68,last+51,.62]
  ];
  for(const [draw,x,y,size] of landmarks){
    context.save();
    context.translate(x*width,y);
    context.scale(size,size);
    draw(context,colors);
    context.restore();
  }
  context.restore();
}
