export const books = {
  lat: {author:"М. Г. Латышова", title:["Практическое руководство по интерпретации диаграмм ГИС","Ұңғыма каротажы диаграммаларын түсіндіру","Practical Guide to Well Log Interpretation"], range:"90–108"},
  kuz: {author:"В. Г. Кузнецов", title:["Литология природных резервуаров нефти и газа","Мұнай мен газдың табиғи резервуарларының литологиясы","Lithology of Natural Oil and Gas Reservoirs"], range:"200–222"},
  bas: {author:"К. С. Басниев и др.", title:["Нефтегазовая гидромеханика","Мұнай-газ гидромеханикасы","Oil and Gas Hydromechanics"], range:"474–500"}
};
const fact = (page, term, quiz, explanation) => ({page,term,quiz,explanation});
const track = (id, book, pages, title, facts, order) => ({id,book,pages,title,facts,order});
export const units = [
  track("logs","lat","90–95",["Читаем каротаж","Каротажды оқимыз","Read well logs"],[
    fact(92,["Глинистость","Саздылық","Clay content"],
      ["Что помогает различать метод СП в терригенном разрезе?","Терригендік қимада ӨП әдісі нені ажыратуға көмектеседі?","What can spontaneous potential help distinguish in a terrigenous section?"],
      ["В описанных условиях СП помогает различать породы по относительной глинистости.","Сипатталған жағдайда ӨП тау жыныстарын салыстырмалы саздылығы бойынша ажыратуға көмектеседі.","In the stated conditions, spontaneous potential helps distinguish rocks by relative clay content."]),
    fact(93,["Комплекс методов","Әдістер кешені","Multiple logging methods"],
      ["Как использовать таблицу признаков пород, если отдельная кривая неоднозначна?","Бір қисық анық жауап бермесе, жыныс белгілерінің кестесін қалай қолданамыз?","How should you use the rock indicator table when one curve is ambiguous?"],
      ["В таблице сопоставлены признаки нескольких методов. Сравнение показаний даёт больше оснований для вывода о породе.","Кестеде бірнеше әдістің белгілері берілген. Оларды салыстыру жыныс туралы қорытындыны негіздеуге көмектеседі.","The table compares indicators from several methods. Use the readings together to interpret the rock."]),
    fact(95,["Глинистый материал","Сазды материал","Clay material"],
      ["Что в породе, согласно тексту, способно изменить показания нескольких методов и усложнить выделение коллектора?","Мәтін бойынша жыныстағы не бірнеше әдістің көрсеткішін өзгертіп, коллекторды ажыратуды қиындатады?","What material can change several log responses and make reservoir identification harder?"],
      ["При большом содержании глинистого материала могут резко меняться показания разных методов.","Сазды материал көп болса, әртүрлі әдістердің көрсеткіштері едәуір өзгеруі мүмкін.","High clay content can substantially change the responses of different methods."])
  ],[["Посмотри кривые","Қисықтарды қара","Inspect the curves"],["Сопоставь признаки нескольких методов","Бірнеше әдістің белгілерін салыстыр","Compare indicators across methods"],["Сформулируй вывод о породе","Жыныс туралы қорытынды жаса","Draw a conclusion about the rock"]]),
  track("saturation","lat","96–108",["Насыщение коллектора","Коллектордың қанығуы","Reservoir saturation"],[
    fact(97,["Пористость или глинистость","Кеуектілік немесе саздылық","Porosity or clay content"],
      ["Какие два вида методов автор предлагает для оценки эффективной толщины?","Автор тиімді қалыңдықты бағалау үшін қандай екі әдіс тобын ұсынады?","Which two kinds of methods are proposed for estimating effective thickness?"],
      ["Автор рассматривает методы пористости и методы глинистости как два пути оценки эффективной толщины.","Автор тиімді қалыңдықты бағалаудың екі жолы ретінде кеуектілік пен саздылық әдістерін қарастырады.","The author presents porosity and clay-content methods as two ways to estimate effective thickness."]),
    fact(100,["Нефть с небольшим количеством воды","Аз мөлшерде суы бар мұнай","Oil with a small amount of water"],
      ["Какой результат соответствует Рн = 7 в примере 50 для αСП = 1?","αӨП = 1 болғанда, 50-мысалдағы Рн = 7 мәніне қандай нәтиже сәйкес келеді?","What outcome corresponds to Rn = 7 in Example 50 when αSP = 1?"],
      ["В примере 50 для чистого коллектора при Рн = 7 указана нефть с небольшим количеством воды. Это вывод для данной кривой.","50-мысалда таза коллектор үшін Рн = 7 мәніне аз мөлшерде суы бар мұнай сәйкес келеді. Бұл осы қисыққа қатысты.","For the clean reservoir in Example 50, Rn = 7 corresponds to oil with a small amount of water. This is specific to the stated curve."]),
    fact(108,["Подходящее пороговое значение","Сәйкес шекті мән","An appropriate cut-off"],
      ["Что особенно важно выбрать правильно при определении эффективной толщины карбонатного разреза?","Карбонатты қиманың тиімді қалыңдығын анықтауда нені дұрыс таңдау маңызды?","What must be chosen carefully when estimating effective thickness in a carbonate section?"],
      ["Для изучаемых отложений нужен подходящий порог пористости. Чужой порог может дать серьёзную ошибку в толщине.","Зерттелетін шөгінділерге сәйкес кеуектілік шегі қажет. Сәйкес емес шек қалыңдықты бағалауда үлкен қатеге әкелуі мүмкін.","Choose a porosity cut-off appropriate to the deposits. An unsuitable cut-off can give a large thickness error."])
  ],[["Учти тип коллектора","Коллектор түрін ескер","Identify the reservoir type"],["Выбери подходящую кривую","Сәйкес қисықты таңда","Choose the applicable curve"],["Оцени насыщение по данным","Деректер бойынша қанығуды бағала","Interpret saturation from the data"]]),
  track("reef","kuz","200–204",["Как устроен риф","Рифтің құрылысы","Reef architecture"],[
    fact(200,["Биостром","Биостром","Biostrome"],
      ["Как называется пласт или уплощённая линза из остатков организмов в прижизненном положении?","Тіршілік кезіндегі қалпында сақталған организм қалдықтарынан тұратын қабат не жалпақ линза қалай аталады?","What is a bed or flattened lens made of remains of organisms in growth position called?"],
      ["Биостром может иметь форму пласта или уплощённой линзы.","Биостром қабат немесе жалпақ линза түрінде болуы мүмкін.","A biostrome can take the shape of a bed or flattened lens."]),
    fact(203,["Атолл","Атолл","Atoll"],
      ["У какого типа рифа породы ядра могут образовывать кольцо?","Рифтің қай түрінде ядро жыныстары сақина түзе алады?","In which reef form can core facies form a ring?"],
      ["В атоллах породы ядра могут располагаться кольцом или овалом по краю комплекса.","Атоллда ядро жыныстары кешеннің шетімен сақина не сопақша түзе орналасуы мүмкін.","Atoll core facies can form a ring or oval around the edge of the complex."]),
    fact(204,["Линейная зональность","Сызықтық белдемділік","Linear zonation"],
      ["Как обычно вытянуты фациальные зоны в описанной линейной рифовой системе?","Сипатталған сызықтық риф жүйесінде фациялық белдемдер қалай созылады?","How are facies zones arranged in the described elongated reef system?"],
      ["Зоны вытянуты вдоль простирания рифовой системы, параллельно друг другу.","Белдемдер риф жүйесінің созылымы бойымен бір-біріне параллель орналасады.","Zones extend parallel to the trend of the reef system."])
  ],[["Определи форму на плане","Пландағы пішінді анықта","Identify the plan shape"],["Сопоставь положение фаций","Фациялардың орнын салыстыр","Compare facies locations"],["Опиши строение рифа","Рифтің құрылысын сипатта","Describe the reef architecture"]]),
  track("pores","kuz","204–222",["Поры рифовых пород","Риф жыныстарының кеуектілігі","Pores in reef rocks"],[
    fact(205,["Цементация","Цементтелу","Cementation"],
      ["Какой процесс может уменьшить первичную пористость рифа?","Рифтің бастапқы кеуектілігін қандай үдеріс азайта алады?","Which process can reduce primary reef porosity?"],
      ["Цемент может заполнять часть первоначальных пустот и снижать первичную пористость.","Цемент бастапқы қуыстардың бір бөлігін толтырып, алғашқы кеуектілікті азайта алады.","Cement can fill some original voids and reduce primary porosity."]),
    fact(205,["Выщелачивание","Шаймалау","Dissolution"],
      ["Какой процесс может образовать вторичные каверны?","Қай үдеріс екінші реттік қуыстарды түзеді?","Which process can produce secondary vugs?"],
      ["Активное выщелачивание может создавать вторичные каверновые пустоты.","Белсенді шаймалау екінші реттік қуыстарды түзе алады.","Dissolution can create secondary vugs."]),
    fact(205,["Межкристаллическая пористость","Кристалларалық кеуектілік","Intercrystalline porosity"],
      ["Какой тип вторичной пористости автор связывает с перекристаллизацией и доломитизацией?","Автор қайта кристалдану және доломиттенумен қай екінші реттік кеуектілікті байланыстырады?","Which secondary porosity is associated with recrystallization and dolomitization?"],
      ["Перекристаллизация и доломитизация могут формировать пустоты между кристаллами.","Қайта кристалдану мен доломиттену кристалдардың арасында қуыстар түзе алады.","Recrystallization and dolomitization can produce voids between crystals."])
  ],[["Опиши исходные пустоты","Бастапқы қуыстарды сипатта","Describe the original voids"],["Отметь поздние изменения породы","Жыныстың кейінгі өзгерістерін белгіле","Identify later rock alteration"],["Объясни современную пустотность","Қазіргі қуыстылықты түсіндір","Explain the resulting pore space"]]),
  track("elastic","bas","474–481",["Когда меняется давление","Қысым қашан өзгереді","When pressure changes"],[
    fact(474,["Изменение отбора","Өндіру қарқынының өзгеруі","Change in withdrawal rate"],
      ["Какое действие может запустить неустановившийся процесс в пласте?","Қай әрекет қабаттағы қалыптаспаған үдерісті бастай алады?","Which event can start transient flow in the formation?"],
      ["После пуска, остановки или изменения отбора давление и дебиты перестраиваются во времени.","Ұңғыманы іске қосқаннан, тоқтатқаннан немесе өндіруді өзгерткеннен кейін қысым мен дебит уақыт өте өзгереді.","After a well starts, stops, or changes its rate, pressure and flow rates evolve over time."]),
    fact(475,["Более высокая проницаемость","Жоғарырақ өткізгіштік","Higher permeability"],
      ["Что ускоряет перераспределение давления при прочих равных?","Өзге жағдайлар бірдей болғанда, қысымның қайта таралуын не жылдамдатады?","All else equal, what speeds up pressure redistribution?"],
      ["В описанном режиме с большей проницаемостью неустановившийся процесс протекает быстрее.","Сипатталған режимде өткізгіштік артса, қалыптаспаған үдеріс жылдамырақ өтеді.","In this regime, higher permeability leads to a faster transient process."]),
    fact(481,["Слабосжимаемая жидкость","Аз сығылатын сұйықтық","Slightly compressible fluid"],
      ["Для какой жидкости применимо линейное уравнение пьезопроводности (23.16) в этой главе?","Осы тараудағы сызықтық пьезоөткізгіштік теңдеуі (23.16) қандай сұйықтыққа қолданылады?","What fluid assumption underlies the linear diffusivity equation (23.16) here?"],
      ["Линейная форма предполагает слабую сжимаемость жидкости и малость соответствующего члена.","Сызықтық түр сұйықтықтың аз сығылуын және тиісті мүшенің кішілігін болжайды.","The linear form assumes a slightly compressible fluid and a small corresponding term."])
  ],[["Измени отбор в скважине","Ұңғымадағы өндіруді өзгерт","Change the well rate"],["Заметь отклик рядом с забоем","Түп маңындағы өзгерісті байқа","Observe the near-well response"],["Проследи перераспределение дальше","Қысымның әрі қарай таралуын бақыла","Track redistribution farther away"]]),
  track("flow","bas","481–500",["Прогноз фильтрации","Сүзілу болжамы","Predict flow"],[
    fact(481,["Постоянное давление на галерее","Галереядағы тұрақты қысым","Constant gallery pressure"],
      ["Какое условие задано на галерее в первом точном решении после снижения давления?","Қысым төмендетілгеннен кейінгі бірінші дәл шешімде галереяда қандай шарт қойылған?","What is prescribed at the gallery after the pressure drop in the first exact solution?"],
      ["Давление на галерее мгновенно понижают и далее поддерживают постоянным.","Галереядағы қысым бірден төмендетіліп, кейін тұрақты ұсталады.","The gallery pressure drops instantly and is then held constant."]),
    fact(484,["Набор кривых для разных моментов","Әртүрлі уақытқа арналған қисықтар","Curves at different times"],
      ["Что на рис. 23.1 помогает увидеть неустановившееся распределение давления?","23.1-суретте қысымның уақыт бойынша өзгеруін не көрсетеді?","What shows transient pressure distribution in Figure 23.1?"],
      ["На рисунке приведены профили давления для разных моментов при постоянном забойном давлении.","Суретте тұрақты түптік қысым кезінде әртүрлі уақыттағы қысым профильдері көрсетілген.","The figure shows pressure profiles at different times with constant bottom-hole pressure."]),
    fact(496,["Приближённый метод","Жуық әдіс","Approximate method"],
      ["Как следует трактовать расчёт по формуле (24.7), если книга сравнивает его с точным решением?","Кітап (24.7) нәтижесін дәл шешіммен салыстырса, оны қалай түсінеміз?","How should you treat the result of (24.7), given the book’s comparison with an exact solution?"],
      ["Формула (24.7) даёт приближённый результат. В приведённом сравнении погрешность депрессии составляет 25%.","(24.7) формуласы жуық нәтиже береді. Кітаптағы салыстыруда депрессия қателігі 25% болған.","Equation (24.7) is approximate. In the reported comparison, the drawdown error is 25%."])
  ],[["Задай начальное давление и условия на границе","Бастапқы қысым мен шекаралық шарттарды бер","Set initial pressure and boundary conditions"],["Рассчитай давление в нужные моменты","Қажетті сәттердегі қысымды есепте","Compute pressure at the chosen times"],["Сопоставь профили","Профильдерді салыстыр","Compare the profiles"]])
];

const generic = {
  list:["Выбери два вывода, которые подтверждает раздел.","Бөлім растайтын екі қорытындыны таңда.","Choose two findings supported by the section."],
  wrong:["Все признаки можно заменить одним универсальным правилом.","Барлық белгіні бір әмбебап ережемен алмастыруға болады.","One universal rule can replace all evidence."],
  order:["Как лучше выполнить разбор по этому разделу?","Осы бөлім бойынша талдауды қалай жасаған дұрыс?","In what order should you work through this topic?"],
  orderHelp:["Сначала установи исходные условия, затем сопоставь данные и сформулируй вывод.","Алдымен бастапқы шарттарды анықта, кейін деректерді салыстырып қорытынды жаса.","Establish the starting conditions, compare the evidence and then draw a conclusion."],
  read:["Найди в разделе термин, который отвечает на вопрос.","Бөлімнен сұраққа жауап беретін терминді тап.","Use the section to identify the term."]
};
for (const unit of units) {
  const {facts, id} = unit;
  const questions = [];
  facts.forEach((item,i) => {
    const order = [i,(i+1)%3,(i+2)%3];
    const options = order.map(j => facts[j].term);
    if (i % 2 === 0) options.reverse();
    const original = {id:id+"-q"+i, page:item.page, prompt:item.quiz, help:item.explanation, unit:id};
    questions.push({...original,type:"single",options,key:options.indexOf(item.term)});
    questions.push({...original,id:id+"-write"+i,type:"blank", key:item.term});
  });
  questions.push({id:id+"-multi",type:"multi",prompt:generic.list,options:[facts[1].explanation,generic.wrong,facts[0].explanation],key:[0,2],page:facts[0].page,extraPage:facts[1].page,help:facts[0].explanation,unit:id});
  questions.push({id:id+"-order",type:"order",prompt:generic.order,options:[unit.order[2],unit.order[0],unit.order[1]],key:[1,2,0],page:facts[0].page,help:generic.orderHelp,unit:id});
  unit.questions = questions;
}

units[1].questions.push({id:"saturation-calc",type:"numeric",prompt:["В задаче 100 толща имеет мощность 18 м. В учебном сценарии из неё 5 м отнесли к глине. Какова оставшаяся толщина в метрах?","100-есепте қабат қалыңдығы 18 м. Оқу мысалында оның 5 метрі сазға жатады. Қалған қалыңдық неше метр?","Problem 100 gives an 18 m interval. In this exercise, 5 m is classified as clay. How many metres are left?"], key:13, page:104, unit:"saturation",help:["Учебный расчёт: 18 − 5 = 13 м. Пять метров заданы в упражнении.","Оқу есебі: 18 − 5 = 13 м. Бес метр жаттығуда берілген.","Teaching calculation: 18 − 5 = 13 m. The 5 m is an exercise assumption."]});
units[3].questions.push({id:"pores-calc",type:"numeric",prompt:["В примере рифа Рейнбоу «А» 90 м нефтенасыщены и 60 м газонасыщены. Сколько метров составляет их сумма?","Рейнбоу «А» рифінде 90 м мұнаймен, 60 м газбен қаныққан. Олардың қосындысы неше метр?","Rainbow A has 90 m oil-saturated and 60 m gas-saturated. What is their total in metres?"], key:150, page:205, unit:"pores",help:["Из данных примера складываем две мощности: 90 + 60 = 150 м.","Мысалдағы қалыңдықтарды қосамыз: 90 + 60 = 150 м.","Add the two thicknesses from the example: 90 + 60 = 150 m."]});
units[5].questions.push({id:"flow-calc",type:"numeric",prompt:["Какую погрешность депрессии в процентах даёт сравнение приближённого и точного решений на стр. 496?","496-беттегі жуық және дәл шешімдерді салыстыруда депрессия қателігі неше пайыз?","What percentage drawdown error is reported in the comparison on page 496?"],key:25,page:496,unit:"flow",help:["В этом конкретном сравнении авторы приводят 25%.","Осы нақты салыстыруда 25% берілген.","The comparison reports 25% for this particular case."]});

export const levels = [
  ...units.map((unit,index)=>({id:unit.id,title:unit.title,threshold:index ? 2**(index+1):0,
    quiz:unit.questions.filter(q=>q.type!=="blank").map(q=>q.id),
    practice:unit.questions.filter(q=>q.type==="blank").map(q=>q.id)})),
  {id:"final",title:["Смена геолога","Геолог ауысымы","Geologist’s shift"],threshold:128,
    quiz:units.flatMap(unit=>unit.questions.filter(q=>q.type==="multi"||q.type==="numeric").map(q=>q.id)),
    practice:["flow-order","pores-calc","saturation-calc"]}
];
export const xpReward = [4,4,8,16,32,64,32];
export const videos = Array(7).fill(null);
