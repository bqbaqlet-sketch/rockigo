const text = (ru, kk, en) => [ru, kk, en];

const logging = {
  kind: "logging",
  from: 1220, to: 1260, tick: 10, minor: 2, initial: 1234,
  roof: 1240, contact: 1248, base: 1255,
  layers: [
    {top: 1220, base: 1232, rock: "shale"},
    {top: 1232, base: 1240, rock: "silt"},
    {top: 1240, base: 1255, rock: "sand"},
    {top: 1255, base: 1260, rock: "shale"}
  ],
  tracks: [
    {name: text("ГК", "ГК", "GR"), unit: text("API", "API", "API"), max: 120, color: "#93efd3",
      points: [[1220,105],[1224,110],[1228,101],[1232,98],[1232,78],[1235,71],[1238,76],
        [1240,72],[1240,33],[1243,38],[1247,34],[1251,37],[1255,34],[1255,102],[1260,109]]},
    {name: text("УЭС", "МЭК", "Res."), unit: text("Ом·м", "Ом·м", "Ω·m"), max: 60, color: "#ffc783",
      points: [[1220,5],[1224,4],[1229,6],[1232,5],[1236,10],[1240,8],[1240,46],
        [1242,49],[1246,43],[1248,44],[1248,9],[1251,10],[1255,8],[1255,5],[1260,4]]}
  ]
};

export const fieldModels = {
  logging,
  reef: {kind: "reef", from: 1440, to: 1560, tick: 30, minor: 5, initial: 1500,
    crest: 1470, contact: 1545, flank: 1510},
  pressure: {kind: "pressure", permeability: [50, 200]}
};

export const fieldExercises = [
  {
    id: "roof", model: "logging", unit: "logs", page: 92,
    title: text("Найди кровлю пласта", "Қабаттың төбесін тап", "Find the formation top"),
    summary: text("Считай отметку с общей шкалы глубины.", "Ортақ тереңдік шкаласынан белгіні оқы.", "Read the mark on the shared depth scale."),
    question: text("На какой глубине начинается выделенный песчаник?", "Белгіленген құмтас қай тереңдіктен басталады?", "At what depth does the highlighted sandstone begin?"),
    setup: text("Кровля — верхняя граница пласта. Совмести курсор с подсвеченной границей и запиши глубину от устья.", "Қабаттың төбесі — оның жоғарғы шекарасы. Меңзерді белгіленген шекарамен беттестіріп, ұңғыма сағасынан есептелген тереңдікті жаз.", "The formation top is its upper boundary. Align the cursor with the highlighted boundary and enter the depth below the wellhead."),
    answer: logging.roof,
    hint: text("Ищи верхнюю границу песчаника. Глубина увеличивается вниз.", "Құмтастың жоғарғы шекарасын ізде. Тереңдік төмен қарай өседі.", "Look for the upper sandstone boundary. Depth increases downward."),
    alternatives: {[logging.base]: text("Ты нашёл подошву песчаника. Кровля — его верхняя граница.", "Құмтастың табанын таптың. Төбесі — оның жоғарғы шекарасы.", "You found the base of the sandstone. The top is its upper boundary.")},
    explanation: text("Кровля находится на 1 240 м. Здесь обе кривые меняются на одной глубине. В этом учебном разрезе совпадение поддерживает границу пород. Для определения породы на реальной скважине сравнивают признаки нескольких методов.",
      "Қабаттың төбесі 1 240 м-де. Екі қисық та бір тереңдікте өзгереді. Осы оқу қимасында олардың сәйкестігі жыныстар шекарасын көрсетеді. Нақты ұңғымада жынысты анықтау үшін бірнеше әдістің белгілерін салыстырады.",
      "The sandstone top is at 1,240 m. Both curves change at the same depth. Their agreement supports the lithological boundary in this example. In a real well, compare evidence from several methods before identifying the rock.")
  },
  {
    id: "contact", model: "logging", unit: "thickness", page: 101,
    title: text("Найди водонефтяной контакт", "Су-мұнай жапсарын тап", "Find the oil–water contact"),
    summary: text("Сопоставь сопротивление и гамма-каротаж.", "Кедергі мен гамма-каротажды салыстыр.", "Compare resistivity and gamma ray."),
    question: text("На какой глубине проходит водонефтяной контакт?", "Су-мұнай жапсары қай тереңдікте?", "At what depth is the oil–water contact?"),
    setup: text("Условие задачи — один песчаник, чёткий контакт, переходной зоны нет. Найди нижнюю границу высокоомного интервала внутри песчаника.", "Шарт бойынша бұл — бір құмтас қабаты, жапсар анық, өтпелі белдем жоқ. Құмтас ішіндегі жоғары кедергілі аралықтың төменгі шекарасын тап.", "Assume a single sandstone bed with a sharp contact and no transition zone. Find the base of the high-resistivity interval within the sandstone."),
    answer: logging.contact,
    hint: text("Внутри песчаника найди резкое снижение сопротивления. Гамма-кривая на этой глубине остаётся на уровне песчаника.", "Құмтас ішінде кедергінің күрт төмендеген жерін тап. Бұл тереңдікте гамма қисығы құмтасқа тән деңгейде қалады.", "Look for a sharp drop in resistivity within the sandstone. The gamma-ray reading stays characteristic of the sandstone there."),
    alternatives: {
      [logging.roof]: text("Это кровля песчаника. Контакт лежит глубже, внутри того же пласта.", "Бұл — құмтастың төбесі. Жапсар осы қабаттың ішінде, тереңірек жатыр.", "That is the sandstone top. The contact lies deeper within the same bed."),
      [logging.base]: text("Это подошва песчаника. Ищи выше, где сопротивление падает, а гамма-кривая остаётся на уровне песчаника.", "Бұл — құмтастың табаны. Одан жоғары кедергінің төмендеп, гамма қисығы құмтас деңгейінде қалған жерін ізде.", "That is the sandstone base. Look higher, where resistivity drops and the gamma-ray reading stays characteristic of sandstone.")
    },
    explanation: text("На 1 248 м сопротивление падает с 44 до 9 Ом·м, а ГК остаётся на уровне песчаника. При заданном чётком контакте подошву высокоомной части принимаем за водонефтяной контакт. При переходной зоне требуется отдельная интерпретация.",
      "1 248 м-де кедергі 44-тен 9 Ом·м-ге түседі, ал ГК құмтас деңгейінде қалады. Берілген шартта жоғары кедергілі бөліктің табанын су-мұнай жапсары деп қабылдаймыз. Өтпелі белдем болса, бөлек түсіндіру қажет.",
      "At 1,248 m resistivity drops from 44 to 9 Ω·m while gamma ray remains characteristic of the sandstone. With a sharp contact as assumed here, take the base of the high-resistivity interval as the oil–water contact. A transition zone requires a different interpretation.")
  },
  {
    id: "reef", model: "reef", unit: "traps", page: 222,
    title: text("Измерь высоту рифовой залежи", "Риф кенішінің биіктігін өлше", "Measure the reef column"),
    summary: text("Сравни глубину свода и контакта в 3D-разрезе.", "3D қимада күмбез бен жапсар тереңдігін салыстыр.", "Compare crest and contact depths on the 3D section."),
    question: text("Какова вертикальная высота залежи в своде?", "Кеніштің күмбездегі тік биіктігі қанша?", "What is the vertical column height at the crest?"),
    setup: text("Используй глубины свода и контакта, отсчитанные от одной отметки. Введи разность в метрах.", "Бір деңгейден есептелген күмбез бен жапсар тереңдіктерін қолдан. Айырманы метрмен жаз.", "Use crest and contact depths measured from the same reference level. Enter the difference in metres."),
    answer: 75,
    hint: text("Вычти глубину свода из глубины контакта. Обе глубины отсчитываются вниз.", "Жапсар тереңдігінен күмбез тереңдігін ал. Екеуі де төмен қарай есептеледі.", "Subtract crest depth from contact depth. Both depths increase downward."),
    explanation: text("1 545 − 1 470 = 75 м. Это вертикальная высота залежи в своде. На крыле кровля глубже, поэтому при том же горизонтальном контакте столб флюида ниже.",
      "1 545 − 1 470 = 75 м. Бұл — кеніштің күмбездегі тік биіктігі. Қанатта қабат төбесі тереңірек, сондықтан жапсар деңгейі бірдей болғанда сұйық бағаны аласа болады.",
      "1,545 − 1,470 = 75 m. That is the vertical column height at the crest. The top is deeper on the flank, so the same horizontal contact gives a shorter fluid column there.")
  },
  {
    id: "pressure", model: "pressure", unit: "diffusion", page: 480,
    title: text("Сравни отклик пластов", "Қабаттардың жауабын салыстыр", "Compare pressure response"),
    summary: text("Определи, как проницаемость меняет пьезопроводность.", "Өткізгіштік пьезоөткізгіштікке қалай әсер ететінін анықта.", "Work out how permeability changes pressure diffusivity."),
    question: text("Во сколько раз пьезопроводность пласта B больше, чем у пласта A?", "B қабатының пьезоөткізгіштігі A қабатынан неше есе артық?", "How many times larger is pressure diffusivity in bed B than in bed A?"),
    setup: text("Сравниваем два пласта при одинаковой вязкости жидкости и упругоёмкости. Отличается только проницаемость k.", "Сұйық тұтқырлығы мен серпімді сыйымдылығы бірдей екі қабатты салыстырамыз. Тек k өткізгіштігі өзгеше.", "Compare two beds with the same fluid viscosity and elastic storage. Only permeability k differs."),
    answer: 4, ratio: true,
    hint: text("При одинаковых μ и β* коэффициент κ пропорционален k. Раздели проницаемость B на проницаемость A.", "μ мен β* бірдей болса, κ шамасы k-ға пропорционал. B өткізгіштігін A өткізгіштігіне бөл.", "With equal μ and β*, κ is proportional to k. Divide permeability in B by permeability in A."),
    explanation: text("κ = k / (μ·β*), поэтому κB / κA = 200 / 50 = 4. За одинаковое время изменение давления заметно дальше от скважины в пласте B. Цвет показывает постепенное ослабление сигнала с расстоянием.",
      "κ = k / (μ·β*), сондықтан κB / κA = 200 / 50 = 4. Бірдей уақытта B қабатында қысым өзгерісі ұңғымадан алысырақ сезіледі. Түс сигналдың қашықтықпен біртіндеп әлсірейтінін көрсетеді.",
      "κ = k / (μ·β*), so κB / κA = 200 / 50 = 4. After the same time, a pressure change is detectable farther from the well in bed B. The colour shows the signal gradually fading with distance.")
  }
];
