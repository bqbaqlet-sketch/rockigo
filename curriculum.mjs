const tr = (ru, kk, en) => [ru, kk, en];
const fact = (page, term, quiz, explanation, plain=explanation) => ({page,term,quiz,explanation,plain});
const topic = (id,book,title,facts) => ({id,book,title,facts});
const symbol = (name,ru,kk,en) => ({name,description:tr(ru,kk,en)});
const formula = (page,equation,use,symbols,example,application=false) => ({page,equation,use,symbols,example,application});

export const modules = [
  {book:"lat",id:"logging",title:tr("Интерпретация каротажа","Каротажды түсіндіру","Well-log interpretation"),
    goal:tr("Сопоставлять кривые ГИС, выделять коллектор и оценивать его эффективную толщину.",
      "ГИС қисықтарын салыстыру, коллекторды бөлу және тиімді қалыңдығын бағалау.",
      "Compare logs, identify reservoir intervals and estimate net thickness.")},
  {book:"kuz",id:"reefs",title:tr("Рифовые резервуары","Риф резервуарлары","Reef reservoirs"),
    goal:tr("Читать карты фаций, оценивать поровое пространство и распознавать рифовые ловушки.",
      "Фация карталарын оқу, қуыстарды бағалау және риф тұтқыштарын тану.",
      "Read facies maps, evaluate pore space and recognize reef traps.")},
  {book:"bas",id:"hydromechanics",title:tr("Давление и фильтрация","Қысым және сүзілу","Pressure and flow"),
    goal:tr("Оценивать запасы упругого режима и выбирать модель расчёта давления.",
      "Серпімді режим қорын бағалау және қысым есептеу моделін таңдау.",
      "Estimate elastic storage and choose a pressure model.")}
];

export const newTopics = [
  topic("conditions","lat",tr("Условия измерения в скважине","Ұңғымадағы өлшеу жағдайы","Borehole measurement conditions"),[
    fact(90,tr("Избыточное давление","Артық қысым","Overbalance"),
      tr("Как называется разность между давлением в стволе и пластовым давлением при положительном знаке?",
        "Оң таңбалы ұңғыма және қабат қысымдарының айырмасы қалай аталады?",
        "What is the positive difference between borehole and formation pressure called?"),
      tr("Когда давление в стволе выше пластового, перепад может способствовать проникновению фильтрата в проницаемый пласт.",
        "Ұңғымадағы қысым қабаттан жоғары болғанда айырма сүзіндінің өткізгіш қабатқа кіруіне ықпал етуі мүмкін.",
        "When borehole pressure exceeds formation pressure, the difference can drive filtrate into permeable rock.")),
    fact(90,tr("Фильтрат бурового раствора","Бұрғылау ерітіндісінің сүзіндісі","Mud filtrate"),
      tr("Какая часть бурового раствора может проникнуть в поры пласта?", "Ерітіндінің қай бөлігі қабат қуыстарына ене алады?", "What part of drilling mud can enter formation pores?"),
      tr("Жидкая фаза раствора, прошедшая через фильтрационную корку, называется фильтратом.",
        "Сүзу қабыршағынан өткен ерітіндінің сұйық фазасы сүзінді деп аталады.",
        "The liquid phase that passes through the filter cake is the filtrate.")),
    fact(91,tr("Минерализация","Минералдану","Salinity"),
      tr("Какое свойство воды связано с концентрацией растворённых солей?", "Еріген тұз концентрациясына судың қай қасиеті байланысты?", "Which water property reflects dissolved salt concentration?"),
      tr("Минерализация фильтрата и пластовой воды влияет на контраст, от которого зависит интерпретация ряда электрических методов.",
        "Сүзінді мен қабат суының минералдануы электрлік әдістерді түсіндіруге қажет айырмаға әсер етеді.",
        "Filtrate and formation-water salinity affect the contrast used to interpret some electrical logs."))
  ]),
  topic("thickness","lat",tr("Контакты и эффективная толщина","Жапсарлар және тиімді қалыңдық","Contacts and net thickness"),[
    fact(101,tr("Водонефтяной контакт","Су-мұнай жапсары","Oil–water contact"),
      tr("Как называется граница нефтяной и водной частей залежи?", "Кеннің мұнайлы және сулы бөліктерінің шекарасы қалай аталады?", "What is the boundary between the oil and water portions called?"),
      tr("При наличии переходной зоны нижнюю границу предельного нефтенасыщения и зеркало воды определяют отдельно.",
        "Өтпелі аймақ болса, шекті мұнайға қанығудың төменгі шекарасы және су айнасы бөлек анықталады.",
        "With a transition zone, the base of maximum oil saturation and the water level are identified separately.")),
    fact(104,tr("Эффективная толщина","Тиімді қалыңдық","Net thickness"),
      tr("Как называется сумма мощностей интервалов, удовлетворяющих выбранным критериям коллектора?", "Коллектор талаптарына сай аралықтардың қосынды қалыңдығы қалай аталады?", "What is the summed thickness of intervals meeting the reservoir criteria called?"),
      tr("Эффективная толщина зависит от того, какие прослои включены. Глину и плотные непроницаемые интервалы не прибавляют.",
        "Тиімді қалыңдыққа таңдалған аралықтар ғана кіреді. Саз бен тығыз өткізбейтін аралықтар қосылмайды.",
        "Net thickness depends on the intervals included. Clay and tight impermeable beds are excluded.")),
    fact(108,tr("Критическая пористость","Шекті кеуектілік","Porosity cut-off"),
      tr("Какой порог пористости отделяет коллектор от неколлектора в рассматриваемой классификации?", "Коллекторды басқа жыныстан бөлетін кеуектілік шегі қалай аталады?", "What porosity threshold separates reservoir from non-reservoir in this classification?"),
      tr("Порог подбирают для изучаемых отложений. Перенос неподходящего значения меняет оценку эффективной толщины.",
        "Шек зерттелетін шөгінділерге бейімделеді. Сәйкес емес шек тиімді қалыңдық бағасын өзгертеді.",
        "A cut-off is calibrated for the formation. Applying the wrong value changes the net-thickness estimate."))
  ]),
  topic("reef-structure","kuz",tr("Распределение рифовых коллекторов","Риф коллекторларының таралуы","Distribution of reef reservoirs"),[
    fact(207,tr("Рифовый гребень","Риф жотасы","Reef crest"),
      tr("К какой части плосковершинного рифа часто приурочена периферическая зона улучшенных коллекторов?",
        "Төбесі жалпақ рифтегі жақсы коллекторлардың шеткі аймағы көбіне қай бөлікке сәйкес келеді?",
        "Which part of a flat-topped reef often hosts the peripheral zone of improved reservoir quality?"),
      tr("В крупных плосковершинных и атолловидных рифах лучшие коллекторы могут быть смещены к гребню и верхней части внешнего склона.",
        "Ірі жалпақ төбелі және атолл пішінді рифтерде жақсы коллекторлар жотаға және сыртқы беткейдің жоғары бөлігіне ығысуы мүмкін.",
        "In large flat-topped and atoll-like reefs, better reservoirs may occur at the crest and upper outer slope.")),
    fact(210,tr("Карта пористости","Кеуектілік картасы","Porosity map"),
      tr("На какой карте изолинии показывают значения коэффициента пористости?", "Қай картада изосызықтар кеуектілік коэффициентін көрсетеді?", "Which map uses contours to show porosity values?"),
      tr("Карта пористости показывает свойство породы, а карта фаций — зоны пород и обстановок. Их сопоставляют с разрезом.",
        "Кеуектілік картасы жыныс қасиетін, фация картасы жыныс пен орта аймақтарын көрсетеді. Екеуі қимамен салыстырылады.",
        "A porosity map shows a rock property. A facies map shows zones of rock and depositional environments. Compare both with sections.")),
    fact(216,tr("Кольцевая зона","Сақина тәрізді аймақ","Ring-shaped zone"),
      tr("Какая форма зоны оптимальных коллекторов описана для плосковершинных и атолловидных рифов?", "Жалпақ төбелі және атолл пішінді рифтерде жақсы коллектор аймағы қандай?", "What shape is described for the best reservoir zone in flat-topped and atoll-like reefs?"),
      tr("Оптимальные свойства могут следовать вдоль периферического гребня кольцом. Одна центральная скважина может пропустить эту зону.",
        "Жақсы қасиеттер шеткі жота бойымен сақина құруы мүмкін. Бір орталық ұңғыма оны байқамай қалуы мүмкін.",
        "The best properties may follow the crest in a ring. A single central well can miss that zone."))
  ]),
  topic("traps","kuz",tr("Ловушки и разведка рифов","Риф тұтқыштары мен барлау","Reef traps and exploration"),[
    fact(217,tr("Покрышка","Жапқыш","Seal"),
      tr("Как называется малопроницаемая толща, ограничивающая выход флюида над коллектором?", "Коллектор үстінде флюид ағуын шектейтін аз өткізгіш қабат қалай аталады?", "What is the low-permeability layer that limits upward fluid escape called?"),
      tr("Покрышка ограничивает миграцию. Помимо верхнего экрана, в рифовой ловушке может работать боковое экранирование.",
        "Жапқыш миграцияны шектейді. Риф тұтқышында жоғарғы экранмен бірге бүйірлік экран да болуы мүмкін.",
        "A seal limits migration. Reef traps can also have lateral seals.")),
    fact(219,tr("Структурная ловушка","Құрылымдық тұтқыш","Structural trap"),
      tr("Какой тип ловушки формируется преимущественно за счёт положительной тектонической структуры над рифовым резервуаром?",
        "Риф резервуары үстіндегі оң тектоникалық құрылым басым болса тұтқыш қай түрге жатады?",
        "What trap type is controlled primarily by a positive tectonic structure over the reef reservoir?"),
      tr("При наложении положительной структуры свод ловушки может сместиться относительно исходной вершины рифа.",
        "Оң құрылым қабаттасқанда тұтқыш төбесі рифтің бастапқы шыңынан ығысуы мүмкін.",
        "A superimposed positive structure can shift the trap crest away from the original reef crest.")),
    fact(222,tr("Массивная залежь","Массивті кен","Massive accumulation"),
      tr("Как называется описанная залежь, ограниченная сверху выпуклой ловушкой, а снизу уровнем контакта?", "Үсті дөңес тұтқышпен, асты жапсар деңгейімен шектелген кен қалай аталады?", "What type of accumulation is bounded by a bowed trap above and a fluid contact below?"),
      tr("В рассматриваемой массивной залежи мощность убывает от свода к крыльям. Сетка разведки должна учитывать распределение объёма.",
        "Бұл массивті кенде қалыңдық төбеден қанатқа қарай кемиді. Барлау торы көлем таралуын ескеруі керек.",
        "In this massive accumulation, thickness decreases from crest to flanks. Well placement should account for the volume distribution."))
  ]),
  topic("diffusion","bas",tr("Уравнение пьезопроводности","Пьезоөткізгіштік теңдеуі","Pressure diffusion equation"),[
    fact(480,tr("Коэффициент пьезопроводности","Пьезоөткізгіштік коэффициенті","Pressure diffusivity"),
      tr("Как называется κ = k/(μ·β*) в уравнении перераспределения давления?", "Қысым теңдеуіндегі κ = k/(μ·β*) қалай аталады?", "What is κ = k/(μ·β*) in the pressure equation called?"),
      tr("Коэффициент κ показывает, как быстро выравниваются неоднородности давления в модели.",
        "κ коэффициенті модельдегі қысым айырмаларының қаншалықты тез теңесетінін көрсетеді.",
        "The coefficient κ measures how quickly pressure variations smooth out in the model.")),
    fact(479,tr("Баланс массы","Масса балансы","Mass balance"),
      tr("Какой закон связывает изменение массы жидкости в объёме пласта с притоком и оттоком?", "Қабат көлеміндегі сұйықтық массасының өзгерісін кіріс және шығыспен қай заң байланыстырады?", "What law links change in fluid mass in a reservoir volume to inflow and outflow?"),
      tr("Сохранение массы вместе с законом Дарси и зависимостями плотности и пористости от давления приводит к уравнению фильтрации.",
        "Массаның сақталуы Дарси заңымен және тығыздық пен кеуектіліктің қысымға тәуелділігімен сүзілу теңдеуін береді.",
        "Conservation of mass, Darcy's law and pressure-dependent density and porosity yield the flow equation.")),
    fact(481,tr("Слабая сжимаемость","Аз сығылғыштық","Slight compressibility"),
      tr("Какое приближение позволяет отбросить квадратичные по перепаду давления члены в выводе?", "Шығаруда қысым айырмасының квадрат мүшелерін алып тастауға не мүмкіндік береді?", "What approximation permits omitting terms quadratic in pressure change?"),
      tr("При малых относительных изменениях параметров удерживают линейные члены. При больших изменениях нужна другая модель.",
        "Параметрлердің салыстырмалы өзгерісі аз болса сызықтық мүшелер қалады. Үлкен өзгеріс үшін басқа модель қажет.",
        "For small relative changes, linear terms are retained. Large changes require a different model."))
  ]),
  topic("approx","bas",tr("Приближённые расчёты давления","Қысымды жуық есептеу","Approximate pressure calculations"),[
    fact(495,tr("Возмущённая зона","Бұзылған аймақ","Disturbed zone"),
      tr("Как называется область, внутри которой метод ПССС учитывает перераспределение давления?", "Стационарлық күйлерді алмастыру әдісінде қысым өзгеретін аймақ қалай аталады?", "What is the region where the successive-steady-states method accounts for pressure change?"),
      tr("Метод ПССС условно отделяет область с изменившимся давлением от области начального давления.",
        "Әдіс қысымы өзгерген аймақты бастапқы қысымды аймақтан шартты түрде бөледі.",
        "The method separates a pressure-affected region from a region held at initial pressure.")),
    fact(496,tr("Корень квадратный из времени","Уақыттың квадрат түбірі","Square root of time"),
      tr("Как зависит длина возмущённой зоны от времени при постоянном отборе из галереи по формуле (24.6)?",
        "Галереядан тұрақты өндіру кезінде (24.6) бойынша бұзылған аймақ ұзындығы уақытқа қалай тәуелді?",
        "How does disturbed length vary with time for a constant-rate gallery in equation (24.6)?"),
      tr("Длина пропорциональна √t: при прочих равных увеличение времени вчетверо удваивает расчётную длину.",
        "Ұзындық √t-ға пропорционал: басқа шарттар бірдей болса, уақыт төрт еселенгенде ұзындық екі еселенеді.",
        "Length is proportional to √t: four times the elapsed time doubles the computed length.")),
    fact(496,tr("Погрешность приближения","Жуықтау қателігі","Approximation error"),
      tr("Как называют расхождение депрессии, рассчитанной приближённым и точным решениями?", "Жуық және дәл шешімдердегі депрессия айырмасы қалай аталады?", "What is the discrepancy between the approximate and exact drawdown called?"),
      tr("На стр. 496 приведено 25% для конкретного сравнения. Эту величину не следует переносить на другие режимы.",
        "496-бетте бір нақты салыстыру үшін 25% берілген. Бұл мәнді басқа режимдерге көшіруге болмайды.",
        "Page 496 reports 25% for a particular comparison. That figure does not apply to every regime."))
  ])
];

export const courseOrder = ["conditions","logs","saturation","thickness","reef","pores","reef-structure","traps","elastic","diffusion","flow","approx"];
const day = (chapter,pages,minutes,outcome,formulas=[]) => ({chapter,pages,minutes,outcome,formulas});
export const dayPlan = {
  conditions:day("V · §17–18","90–92",22,tr("Связать условия бурения с показаниями приборов.","Бұрғылау жағдайын аспап көрсеткішімен байланыстыру.","Relate drilling conditions to instrument readings."),[
    formula(90,"Δp = pств − pпл",tr("Положительный перепад способствует проникновению фильтрата при прочих равных.",
      "Оң қысым айырмасы басқа шарттар бірдей болса сүзіндінің енуіне ықпал етеді.","A positive pressure difference can drive filtrate invasion, all else equal."),
      [symbol("Δp","перепад давления, МПа","қысым айырмасы, МПа","pressure difference, MPa"),
       symbol("pств","давление в стволе, МПа","ұңғыма қысымы, МПа","borehole pressure, MPa"),
       symbol("pпл","пластовое давление, МПа","қабат қысымы, МПа","formation pressure, MPa")],
      tr("Пример: 24 − 21 = 3 МПа.","Мысал: 24 − 21 = 3 МПа.","Example: 24 − 21 = 3 MPa."))
  ]),
  logs:day("V · §19","92–95",28,tr("Сопоставить СП, гамма-каротаж и сопротивление на одной глубине.","Бір тереңдіктегі ӨП, гамма-каротаж және кедергіні салыстыру.","Compare SP, gamma ray and resistivity at a common depth."),[
    formula(93,"Δz = z₂ − z₁",tr("Используйте общую шкалу глубины, прежде чем сравнивать признаки на диаграммах.","Қисықтарды салыстырмас бұрын ортақ тереңдік шкаласын қолданыңыз.","Use a shared depth scale before comparing log responses."),
      [symbol("z₁, z₂","глубины двух отметок, м","екі белгі тереңдігі, м","depths of the two marks, m"),symbol("Δz","разность глубин, м","тереңдік айырмасы, м","depth difference, m")],
      tr("Пример: между 1010 и 1016 м разность 6 м по шкале глубины.","Мысал: 1010 және 1016 м арасында 6 м.","Example: 1010 and 1016 m are 6 m apart on the depth scale."),true)
  ]),
  saturation:day("V · §20","96–101",28,tr("Применить палетку с учётом свойств и условий пласта.","Қабат қасиеттері мен жағдайын ескере отырып палетканы қолдану.","Apply a chart with its reservoir-specific assumptions."),[
    formula(98,"Sв = Vводы / Vпор",tr("Это определение водонасыщенности. На палетке книги может быть относительная водонасыщенность с другой нормировкой.",
      "Бұл суға қанығудың анықтамасы. Кітап палеткасында басқа нормалау болуы мүмкін.","This defines water saturation. The book’s chart can use a differently normalized relative saturation."),
      [symbol("Sв","доля пор, занятая водой","су алған қуыс үлесі","fraction of pore volume filled with water"),symbol("Vводы","объём воды, м³","су көлемі, м³","volume of water, m³"),symbol("Vпор","общий объём пор, м³","қуыстардың жалпы көлемі, м³","total pore volume, m³")],
      tr("Пример: 3/10 = 0,30, или 30%.","Мысал: 3/10 = 0,30, яғни 30%.","Example: 3/10 = 0.30, or 30%."),true)
  ]),
  thickness:day("V · §20","101–108",25,tr("Отобрать интервалы и вычислить эффективную толщину.","Аралықтарды таңдап тиімді қалыңдықты есептеу.","Select intervals and calculate net thickness."),[
    formula(104,"hэфф = Σ hᵢ",tr("Складывают толщины только тех интервалов, которые отвечают критерию.","Тек критерийге сай аралықтардың қалыңдығы қосылады.","Sum the thicknesses of only the intervals meeting the criterion."),
      [symbol("hэфф","эффективная толщина, м","тиімді қалыңдық, м","net thickness, m"),symbol("hᵢ","толщина принятого интервала, м","алынған аралық қалыңдығы, м","accepted interval thickness, m")],
      tr("Пример: два принятых интервала по 5 и 8 м дают 13 м.","Мысал: 5 және 8 м аралықтар 13 м береді.","Example: accepted intervals of 5 and 8 m give 13 m."),true)
  ]),
  reef:day("10 · §10.1","200–204",22,tr("Отличить форму рифа на плане и разрезе.","Риф пішінін жоспар мен қимада салыстыру.","Distinguish reef shapes in plan and section."),[
    formula(203,"A ≈ π·a·b",tr("Оценка площади контура, если план рифа можно приблизить эллипсом. Это не расчёт запасов.",
      "Риф жоспары эллипске жуық болса оның ауданын бағалайды. Бұл қор есебі емес.","Estimates the plan area if the outline can be approximated by an ellipse. It does not estimate reserves."),
      [symbol("A","площадь контура, км²","контур ауданы, км²","outline area, km²"),symbol("a, b","полуоси эллипса, км","эллипстің жарты осьтері, км","ellipse semi-axes, km")],
      tr("Пример: при a = 2 км и b = 1 км площадь около 6,28 км².","Мысал: a = 2 км, b = 1 км болса ≈6,28 км².","Example: a = 2 km and b = 1 km give about 6.28 km²."),true)
  ]),
  pores:day("10 · §10.2","202–205",24,tr("Различить пористость, проницаемость и влияние цементации.","Кеуектілік, өткізгіштік және цементтелу әсерін ажырату.","Distinguish porosity, permeability and the effects of cementation."),[
    formula(205,"φ = Vпор / Vобразца",tr("Пористость измеряет долю пустот. Она сама по себе не задаёт связность этих пустот.",
      "Кеуектілік қуыс үлесін ғана көрсетеді. Ол қуыстар байланысын сипаттамайды.","Porosity measures the fraction of void space. It does not describe how pores connect."),
      [symbol("φ","пористость, доля единицы","кеуектілік, бірлік үлесі","porosity as a fraction"),symbol("Vпор","объём пор, см³","қуыс көлемі, см³","pore volume, cm³"),symbol("Vобразца","полный объём образца, см³","үлгінің толық көлемі, см³","bulk sample volume, cm³")],
      tr("Пример: 16 см³ пор в 100 см³ породы дают 16%.","Мысал: 100 см³ жыныстағы 16 см³ қуыс 16% береді.","Example: 16 cm³ of pores in 100 cm³ of rock gives 16%."),true)
  ]),
  "reef-structure":day("10 · §10.3","205–216",30,tr("Сопоставить положение фаций с распределением свойств резервуара.","Фация орналасуын резервуар қасиеттерінің таралуымен салыстыру.","Relate facies position to reservoir property distribution.")),
  traps:day("10 · §10.4","216–222",27,tr("Определить роль покрышки и геометрии в рифовой ловушке.","Жапқыш пен геометрияның риф тұтқышындағы рөлін анықтау.","Explain the roles of seals and geometry in a reef trap."),[
    formula(222,"H = zконт − zсвода",tr("Вертикальная высота от свода до контакта при отсчёте глубины вниз.",
      "Тереңдік төменге өссе, төбеден жапсарға дейінгі тік биіктік.","Vertical height from crest to contact when depth increases downwards."),
      [symbol("H","высота залежи, м","кен биіктігі, м","accumulation height, m"),symbol("zконт","глубина контакта, м","жапсар тереңдігі, м","contact depth, m"),symbol("zсвода","глубина свода, м","төбе тереңдігі, м","crest depth, m")],
      tr("Пример: 1550 − 1480 = 70 м.","Мысал: 1550 − 1480 = 70 м.","Example: 1550 − 1480 = 70 m."),true)
  ]),
  elastic:day("XXIII · §1–2","474–477",25,tr("Рассчитать упругий запас при падении давления.","Қысым төмендегенде серпімді қорды есептеу.","Calculate elastic storage released by a pressure drop."),[
    formula(476,"ΔVз = β*·V₀·Δp",tr("Формула (23.4): оценивает выделяемый объём при положительной величине снижения давления.",
      "(23.4) формуласы қысым төмендегенде бөлінетін көлемді бағалайды.","Equation (23.4) estimates fluid released for a positive pressure-drop magnitude."),
      [symbol("ΔVз","упругий запас, м³","серпімді қор, м³","elastic storage released, m³"),symbol("β*","упругоёмкость пласта, МПа⁻¹","қабаттың серпімді сыйымдылығы, МПа⁻¹","formation elastic storage coefficient, MPa⁻¹"),
       symbol("V₀","исходный объём породы, м³","жыныстың бастапқы көлемі, м³","initial bulk rock volume, m³"),symbol("Δp","снижение давления, МПа","қысым төмендеуі, МПа","pressure drop, MPa")],
      tr("Пример: 0,002 · 1000 · 3 = 6 м³.","Мысал: 0,002 · 1000 · 3 = 6 м³.","Example: 0.002 × 1000 × 3 = 6 m³."))
  ]),
  diffusion:day("XXIII · §3–4","477–481",30,tr("Объяснить уравнение пьезопроводности и размерность его коэффициента.",
    "Пьезоөткізгіштік теңдеуі мен коэффициентінің өлшемін түсіндіру.","Explain the pressure diffusion equation and the coefficient's units."),[
    formula(480,"κ = k / (μ·β*)",tr("Формула (23.18): при прочих равных κ увеличивается с проницаемостью и уменьшается с вязкостью или упругоёмкостью.",
      "(23.18): басқа шарттар бірдей болса κ өткізгіштікпен артады, тұтқырлықпен не серпімді сыйымдылықпен азаяды.",
      "Equation (23.18): holding other terms fixed, κ increases with permeability and decreases with viscosity or elastic storage."),
      [symbol("κ","пьезопроводность, м²/с","пьезоөткізгіштік, м²/с","pressure diffusivity, m²/s"),symbol("k","проницаемость, м²","өткізгіштік, м²","permeability, m²"),
       symbol("μ","динамическая вязкость, Па·с","динамикалық тұтқырлық, Па·с","dynamic viscosity, Pa·s"),symbol("β*","упругоёмкость, Па⁻¹","серпімді сыйымдылық, Па⁻¹","elastic storage coefficient, Pa⁻¹")],
      tr("При удвоении μ и неизменных k и β* значение κ уменьшается вдвое.","μ екі еселеніп, k мен β* өзгермесе κ екі есе кемиді.","Doubling μ while holding k and β* fixed halves κ."))
  ]),
  flow:day("XXIII · §5","481–494",30,tr("Сравнить линейный поток к галерее с радиальным притоком к скважине.",
    "Галереяға сызықтық және ұңғымаға радиал ағынды салыстыру.","Compare linear flow to a gallery with radial flow to a well."),[
    formula(482,"u = x / (2√(κt))",tr("Безразмерная переменная для задачи о линейном притоке к галерее.",
      "Галереяға сызықтық ағын есебінің өлшемсіз айнымалысы.","Dimensionless variable used in the linear gallery-flow problem."),
      [symbol("u","безразмерная координата","өлшемсіз координата","dimensionless coordinate"),symbol("x","расстояние от галереи, м","галереядан қашықтық, м","distance from the gallery, m"),
       symbol("κ","пьезопроводность, м²/с","пьезоөткізгіштік, м²/с","pressure diffusivity, m²/s"),symbol("t","время с начала отбора, с","өндіру басталғаннан бергі уақыт, с","time since withdrawal began, s")],
      tr("Пример: x = 20 м, κ = 1 м²/с, t = 100 с дают u = 1.","Мысал: x = 20 м, κ = 1 м²/с, t = 100 с кезінде u = 1.","Example: x = 20 m, κ = 1 m²/s, t = 100 s give u = 1."))
  ]),
  approx:day("XXIV · §1","494–500",28,tr("Применить метод ПССС и объяснить границы приближения.","Стационарлық күйлерді алмастыру әдісін қолданып шекарасын түсіндіру.","Apply successive steady states and explain the approximation limits."),[
    formula(496,"l(t) = √(2κt)",tr("Формула (24.6) для галереи с постоянным отбором. Граница возмущения в этом методе условная.",
      "(24.6) тұрақты өндіру галереясына арналған. Әдістегі бұзылу шекарасы шартты.","Equation (24.6) describes a constant-rate gallery. The disturbance boundary is an approximation."),
      [symbol("l(t)","длина возмущённой зоны, м","бұзылған аймақ ұзындығы, м","disturbed length, m"),symbol("κ","пьезопроводность, м²/с","пьезоөткізгіштік, м²/с","pressure diffusivity, m²/s"),symbol("t","время, с","уақыт, с","time, s")],
      tr("Пример: κ = 2 м²/с и t = 100 с дают l = 20 м.","Мысал: κ = 2 м²/с және t = 100 с кезінде l = 20 м.","Example: κ = 2 m²/s and t = 100 s give l = 20 m."))
  ])
};
