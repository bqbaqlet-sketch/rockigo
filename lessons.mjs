import { courseOrder, dayPlan, newTopics } from "./curriculum.mjs";
import { cases, finalCases } from "./science-questions.mjs";

export const books = {
  lat: {author:"М. Г. Латышова", title:["Практическое руководство по интерпретации диаграмм ГИС","Ұңғыма каротажы диаграммаларын түсіндіру","Practical Guide to Well Log Interpretation"], range:"90–108",url:"https://urss.ru/cgi-bin/db.pl?blang=ru&id=96638&lang=Ru&page=Book"},
  kuz: {author:"В. Г. Кузнецов", title:["Литология природных резервуаров нефти и газа","Мұнай мен газдың табиғи резервуарларының литологиясы","Lithology of Natural Oil and Gas Reservoirs"], range:"200–222",url:"https://enb.gubkin.ru/en/content/19182"},
  bas: {author:"К. С. Басниев и соавторы", title:["Нефтегазовая гидромеханика","Мұнай-газ гидромеханикасы","Oil and Gas Hydromechanics"], range:"474–500",url:"https://www.mce.su/rus/books/cat35574/book38814/"}
};
const fact = (page, term, quiz, explanation, plain, scene) => ({page,term,quiz,explanation,plain,scene});
const track = (id, book, pages, title, facts, order) => ({id,book,pages,title,facts,order});
const existingTopics = [
  track("logs","lat","90–95",["Читаем каротаж","Каротажды оқимыз","Read well logs"],[
    fact(92,["Глинистость","Саздылық","Clay content"],
      ["Что помогает различать метод СП в терригенном разрезе?","Терригендік қимада ӨП әдісі нені ажыратуға көмектеседі?","What can spontaneous potential help distinguish in a terrigenous section?"],
      ["В описанных условиях СП помогает различать породы по относительной глинистости.","Сипатталған жағдайда ӨП тау жыныстарын салыстырмалы саздылығы бойынша ажыратуға көмектеседі.","In the stated conditions, spontaneous potential helps distinguish rocks by relative clay content."],
      ["Кривая СП на диаграмме помогает сравнить слои в скважине. В условиях этого примера по ней можно понять, какой слой более глинистый.","Диаграммадағы ӨП қисығы ұңғымадағы қабаттарды салыстыруға көмектеседі. Осы мысалда қисыққа қарап, қай қабатта саз көбірек екенін анықтауға болады.","The SP line on the log helps compare layers in the well. In this example, it gives a clue about which layer contains more clay."]),
    fact(93,["Комплекс методов","Әдістер кешені","Multiple logging methods"],
      ["Как использовать таблицу признаков пород, если отдельная кривая неоднозначна?","Бір қисық анық жауап бермесе, жыныс белгілерінің кестесін қалай қолданамыз?","How should you use the rock indicator table when one curve is ambiguous?"],
      ["В таблице сопоставлены признаки нескольких методов. Сравнение показаний даёт больше оснований для вывода о породе.","Кестеде бірнеше әдістің белгілері берілген. Оларды салыстыру жыныс туралы қорытындыны негіздеуге көмектеседі.","The table compares indicators from several methods. Use the readings together to interpret the rock."],
      ["Если по одной кривой непонятно, какая перед нами порода, посмотри на показания других методов на той же глубине. Затем сравни их с признаками в таблице.","Бір қисықтан жыныс түрі анық болмаса, сол тереңдіктегі басқа әдістердің көрсеткіштерін қара. Содан кейін оларды кестедегі белгілермен салыстыр.","If one curve leaves the rock type unclear, check what the other methods show at the same depth. Then compare the readings with the clues in the table."],"logs"),
    fact(95,["Глинистый материал","Сазды материал","Clay material"],
      ["Что в породе, согласно тексту, способно изменить показания нескольких методов и усложнить выделение коллектора?","Мәтін бойынша жыныстағы не бірнеше әдістің көрсеткішін өзгертіп, коллекторды ажыратуды қиындатады?","What material can change several log responses and make reservoir identification harder?"],
      ["При большом содержании глинистого материала могут резко меняться показания разных методов.","Сазды материал көп болса, әртүрлі әдістердің көрсеткіштері едәуір өзгеруі мүмкін.","High clay content can substantially change the responses of different methods."],
      ["Большое количество глины в породе может изменить сразу несколько кривых на диаграмме. Учитывай глину, когда ищешь слой, способный вмещать и пропускать жидкость.","Жыныста саз көп болса, диаграммадағы бірнеше қисық қатар өзгеруі мүмкін. Сұйықтықты сақтап, өткізе алатын қабатты іздегенде осыны ескер.","Lots of clay can change several curves on the log at once. Keep this in mind when looking for a layer that can hold and transmit fluid."])
  ],[["Посмотри кривые","Қисықтарды қара","Inspect the curves"],["Сопоставь признаки нескольких методов","Бірнеше әдістің белгілерін салыстыр","Compare indicators across methods"],["Сформулируй вывод о породе","Жыныс туралы қорытынды жаса","Draw a conclusion about the rock"]]),
  track("saturation","lat","96–108",["Насыщение коллектора","Коллектордың қанығуы","Reservoir saturation"],[
    fact(97,["Пористость или глинистость","Кеуектілік немесе саздылық","Porosity or clay content"],
      ["Какие два вида методов автор предлагает для оценки эффективной толщины?","Автор тиімді қалыңдықты бағалау үшін қандай екі әдіс тобын ұсынады?","Which two kinds of methods are proposed for estimating effective thickness?"],
      ["Автор рассматривает методы пористости и методы глинистости как два пути оценки эффективной толщины.","Автор тиімді қалыңдықты бағалаудың екі жолы ретінде кеуектілік пен саздылық әдістерін қарастырады.","The author presents porosity and clay-content methods as two ways to estimate effective thickness."],
      ["Нужно понять, какая часть слоя входит в полезную толщину коллектора. Автор предлагает два подхода: смотреть на количество пустот в породе или на содержание глины.","Қабаттың қай бөлігі коллектордың тиімді қалыңдығына кіретінін анықтау керек. Автор екі жол ұсынады: жыныстағы қуыстардың үлесіне немесе саз мөлшеріне қарау.","To estimate how much of the layer counts as useful reservoir, the author offers two approaches: look at the amount of pore space or look at the amount of clay."]),
    fact(100,["Нефть с небольшим количеством воды","Аз мөлшерде суы бар мұнай","Oil with a small amount of water"],
      ["Какой результат соответствует Рн = 7 в примере 50 для αСП = 1?","αӨП = 1 болғанда, 50-мысалдағы Рн = 7 мәніне қандай нәтиже сәйкес келеді?","What outcome corresponds to Rn = 7 in Example 50 when αSP = 1?"],
      ["В примере 50 для чистого коллектора при Рн = 7 указана нефть с небольшим количеством воды. Это вывод для данной кривой.","50-мысалда таза коллектор үшін Рн = 7 мәніне аз мөлшерде суы бар мұнай сәйкес келеді. Бұл осы қисыққа қатысты.","For the clean reservoir in Example 50, Rn = 7 corresponds to oil with a small amount of water. This is specific to the stated curve."],
      ["В примере 50 находим Рн = 7 на кривой именно для чистого коллектора. В этой точке книга указывает нефть и немного воды. Для другой кривой вывод нужно проверить заново.","50-мысалда таза коллекторға арналған қисықтан Рн = 7 мәнін табамыз. Осы нүктеде кітап мұнай мен аздаған суды көрсетеді. Қисық басқа болса, қорытындыны қайта тексеру керек.","In Example 50, find Rn = 7 on the curve for the clean reservoir. At that point, the book shows oil with a little water. Check the interpretation again if you use a different curve."]),
    {...fact(98,["Безводная нефть","Сусыз мұнай","Water-free oil"],
      ["Какой характер притока указан в примере 46 для сопротивления пласта 20 Ом·м?","46-мысалда қабат кедергісі 20 Ом·м болса, қандай ағын көрсетілген?","What type of inflow does Example 46 associate with a formation resistivity of 20 Ω·m?"],
      ["По данной палетке при сопротивлении 20 Ом·м и пористости 25% прогнозируют приток безводной нефти.","Берілген палеткада 20 Ом·м кедергі мен 25% кеуектілік сусыз мұнай ағынына сәйкес келеді.","On this chart, 20 Ω·m and 25% porosity indicate water-free oil inflow."],
      ["Палетка в примере показывает, что из пласта должна поступать нефть без воды. Часть воды может оставаться в порах.","Мысалдағы палетка қабаттан сусыз мұнай келетінін көрсетеді. Судың бір бөлігі қуыстарда қалуы мүмкін.","On this example chart, the predicted oil inflow is water-free. Some water can still remain in the pores."]),id:"water-free"}
  ],[["Учти тип коллектора","Коллектор түрін ескер","Identify the reservoir type"],["Выбери подходящую кривую","Сәйкес қисықты таңда","Choose the applicable curve"],["Оцени насыщение по данным","Деректер бойынша қанығуды бағала","Interpret saturation from the data"]]),
  track("reef","kuz","200–204",["Как устроен риф","Рифтің құрылысы","Reef architecture"],[
    fact(200,["Биостром","Биостром","Biostrome"],
      ["Как называется пласт или уплощённая линза из остатков организмов в прижизненном положении?","Тіршілік кезіндегі қалпында сақталған организм қалдықтарынан тұратын қабат не жалпақ линза қалай аталады?","What is a bed or flattened lens made of remains of organisms in growth position called?"],
      ["Биостром может иметь форму пласта или уплощённой линзы.","Биостром қабат немесе жалпақ линза түрінде болуы мүмкін.","A biostrome can take the shape of a bed or flattened lens."],
      ["Представь широкое и тонкое тело из остатков организмов. Оно может выглядеть как слой или как линза, которая становится тоньше к краям.","Организм қалдықтарынан құралған жалпақ, жұқа денені елестет. Ол қабат сияқты немесе шеттеріне қарай жұқаратын линза тәрізді болуы мүмкін.","Picture a broad, thin body made of organism remains. It can look like a layer or like a lens that tapers towards the edges."],"lens"),
    fact(203,["Атолл","Атолл","Atoll"],
      ["У какого типа рифа породы ядра могут образовывать кольцо?","Рифтің қай түрінде ядро жыныстары сақина түзе алады?","In which reef form can core facies form a ring?"],
      ["В атоллах породы ядра могут располагаться кольцом или овалом по краю комплекса.","Атоллда ядро жыныстары кешеннің шетімен сақина не сопақша түзе орналасуы мүмкін.","Atoll core facies can form a ring or oval around the edge of the complex."],
      ["Если смотреть на атолл сверху, основная часть рифа может выглядеть как кольцо или овал. Середина лежит внутри этого кольца.","Атоллға жоғарыдан қарасаң, рифтің негізгі бөлігі сақина немесе сопақша болып көрінуі мүмкін. Ортасы сол сақинаның ішінде қалады.","From above, the main reef zone of an atoll can look like a ring or an oval. The centre lies inside that ring."],"atoll"),
    fact(204,["Линейная зональность","Сызықтық белдемділік","Linear zonation"],
      ["Как обычно вытянуты фациальные зоны в описанной линейной рифовой системе?","Сипатталған сызықтық риф жүйесінде фациялық белдемдер қалай созылады?","How are facies zones arranged in the described elongated reef system?"],
      ["Зоны вытянуты вдоль простирания рифовой системы, параллельно друг другу.","Белдемдер риф жүйесінің созылымы бойымен бір-біріне параллель орналасады.","Zones extend parallel to the trend of the reef system."],
      ["На плане зоны похожи на длинные полосы рядом друг с другом. Каждая полоса тянется вдоль рифа.","Планда белдемдер қатар жатқан ұзын жолақтарға ұқсайды. Әр жолақ рифтің бойымен созылады.","On a plan, the zones look like long strips next to one another. Each strip runs along the reef."],"zones")
  ],[["Определи форму на плане","Пландағы пішінді анықта","Identify the plan shape"],["Сопоставь положение фаций","Фациялардың орнын салыстыр","Compare facies locations"],["Опиши строение рифа","Рифтің құрылысын сипатта","Describe the reef architecture"]]),
  track("pores","kuz","204–222",["Поры рифовых пород","Риф жыныстарының кеуектілігі","Pores in reef rocks"],[
    fact(205,["Цементация","Цементтелу","Cementation"],
      ["Какой процесс может уменьшить первичную пористость рифа?","Рифтің бастапқы кеуектілігін қандай үдеріс азайта алады?","Which process can reduce primary reef porosity?"],
      ["Цемент может заполнять часть первоначальных пустот и снижать первичную пористость.","Цемент бастапқы қуыстардың бір бөлігін толтырып, алғашқы кеуектілікті азайта алады.","Cement can fill some original voids and reduce primary porosity."],
      ["Между зёрнами породы есть промежутки. Если часть промежутка заполнится минералом-цементом, свободного места для жидкости станет меньше.","Жыныс түйірлерінің арасында бос орындар бар. Бос орынның бір бөлігін минералдық цемент толтырса, сұйықтыққа орын азаяды.","Rock grains can have gaps between them. If mineral cement fills part of a gap, there is less space left for fluid."],"cement"),
    fact(205,["Выщелачивание","Шаймалау","Dissolution"],
      ["Какой процесс может образовать вторичные каверны?","Қай үдеріс екінші реттік қуыстарды түзеді?","Which process can produce secondary vugs?"],
      ["Активное выщелачивание может создавать вторичные каверновые пустоты.","Белсенді шаймалау екінші реттік қуыстарды түзе алады.","Dissolution can create secondary vugs."],
      ["Часть уже образовавшейся породы растворяется и уходит с водой. На её месте могут остаться новые полости.","Бұрын қалыптасқан жыныстың бір бөлігі еріп, сумен шайылады. Оның орнында жаңа қуыстар қалуы мүмкін.","Part of the existing rock dissolves and is carried away by water. New cavities can remain where that material used to be."]),
    fact(205,["Межкристаллическая пористость","Кристалларалық кеуектілік","Intercrystalline porosity"],
      ["Какой тип вторичной пористости автор связывает с перекристаллизацией и доломитизацией?","Автор қайта кристалдану және доломиттенумен қай екінші реттік кеуектілікті байланыстырады?","Which secondary porosity is associated with recrystallization and dolomitization?"],
      ["Перекристаллизация и доломитизация могут формировать пустоты между кристаллами.","Қайта кристалдану мен доломиттену кристалдардың арасында қуыстар түзе алады.","Recrystallization and dolomitization can produce voids between crystals."],
      ["Когда структура породы меняется и образуются новые кристаллы, между ними иногда остаются маленькие промежутки. Эти промежутки и называют межкристаллическими порами.","Жыныстың құрылымы өзгеріп, жаңа кристалдар түзілгенде, олардың арасында кейде ұсақ бос орындар қалады. Бұлар кристалларалық кеуектер деп аталады.","As the rock changes and new crystals form, small gaps can appear between them. These gaps are called intercrystalline pores."])
  ],[["Опиши исходные пустоты","Бастапқы қуыстарды сипатта","Describe the original voids"],["Отметь поздние изменения породы","Жыныстың кейінгі өзгерістерін белгіле","Identify later rock alteration"],["Объясни современную пустотность","Қазіргі қуыстылықты түсіндір","Explain the resulting pore space"]]),
  track("elastic","bas","474–481",["Когда меняется давление","Қысым қашан өзгереді","When pressure changes"],[
    fact(474,["Изменение отбора","Өндіру қарқынының өзгеруі","Change in withdrawal rate"],
      ["Какое действие может запустить неустановившийся процесс в пласте?","Қай әрекет қабаттағы қалыптаспаған үдерісті бастай алады?","Which event can start transient flow in the formation?"],
      ["После пуска, остановки или изменения отбора давление и дебиты перестраиваются во времени.","Ұңғыманы іске қосқаннан, тоқтатқаннан немесе өндіруді өзгерткеннен кейін қысым мен дебит уақыт өте өзгереді.","After a well starts, stops, or changes its rate, pressure and flow rates evolve over time."],
      ["Если запустить или остановить скважину либо изменить скорость добычи, пласт будет реагировать ещё какое-то время. Давление и объём жидкости, проходящий за единицу времени, будут меняться.","Ұңғыманы іске қосқанда, тоқтатқанда немесе өндіру қарқынын өзгерткенде қабат біраз уақыт жауап береді. Қысым да, уақыт бірлігінде өтетін сұйықтық көлемі де өзгереді.","If a well starts, stops, or changes its production rate, the formation keeps responding for some time. Both the pressure and the volume of fluid flowing per unit of time change."]),
    fact(475,["Более высокая проницаемость","Жоғарырақ өткізгіштік","Higher permeability"],
      ["Что ускоряет перераспределение давления при прочих равных?","Өзге жағдайлар бірдей болғанда, қысымның қайта таралуын не жылдамдатады?","All else equal, what speeds up pressure redistribution?"],
      ["В описанном режиме с большей проницаемостью неустановившийся процесс протекает быстрее.","Сипатталған режимде өткізгіштік артса, қалыптаспаған үдеріс жылдамырақ өтеді.","In this regime, higher permeability leads to a faster transient process."],
      ["Чем легче жидкости проходить через породу, тем быстрее в этой модели распространяется изменение давления при прочих равных.","Басқа жағдайлар бірдей болса, сұйықтық жыныс арқылы неғұрлым оңай өтсе, осы модельде қысым өзгерісі соғұрлым жылдам таралады.","All else being equal, the more easily fluid can move through the rock, the faster a pressure change spreads in this model."]),
    {...fact(476,["Упругий запас","Серпімді қор","Elastic storage"],
      ["Как называется объём жидкости, который выделяется за счёт упругости пласта и жидкости при снижении давления?","Қысым түскенде қабат пен сұйықтық серпімділігінен бөлінетін сұйықтық көлемі қалай аталады?","What is the volume of fluid released by formation and fluid elasticity during a pressure drop called?"],
      ["Упругий запас связывает объём выделившейся жидкости со снижением давления при заданных объёме породы и упругоёмкости.","Серпімді қор бөлінген сұйықтық көлемін берілген жыныс көлемі мен серпімді сыйымдылықтағы қысым төмендеуімен байланыстырады.","Elastic storage relates released fluid volume to the pressure drop for a given rock volume and storage coefficient."],
      ["При снижении давления жидкость немного расширяется, а поры могут сжиматься. Вместе эти эффекты вытесняют часть жидкости.","Қысым төмендесе, сұйықтық сәл кеңеюі, ал қуыстар тарылуы мүмкін. Бұл әсерлер сұйықтықтың бір бөлігін ығыстырады.","As pressure falls, fluid expands a little and pores can contract. Together, these effects drive some fluid out."]),id:"elastic-storage"}
  ],[["Измени отбор в скважине","Ұңғымадағы өндіруді өзгерт","Change the well rate"],["Заметь отклик рядом с забоем","Түп маңындағы өзгерісті байқа","Observe the near-well response"],["Проследи перераспределение дальше","Қысымның әрі қарай таралуын бақыла","Track redistribution farther away"]]),
  track("flow","bas","481–500",["Прогноз фильтрации","Сүзілу болжамы","Predict flow"],[
    fact(481,["Постоянное давление на галерее","Галереядағы тұрақты қысым","Constant gallery pressure"],
      ["Какое условие задано на галерее в первом точном решении после снижения давления?","Қысым төмендетілгеннен кейінгі бірінші дәл шешімде галереяда қандай шарт қойылған?","What is prescribed at the gallery after the pressure drop in the first exact solution?"],
      ["Давление на галерее мгновенно понижают и далее поддерживают постоянным.","Галереядағы қысым бірден төмендетіліп, кейін тұрақты ұсталады.","The gallery pressure drops instantly and is then held constant."],
      ["Представь, что в начале опыта на границе оттока одним шагом выставили более низкое давление. Дальше на этой границе оно остаётся таким же, а давление внутри пласта успевает измениться.","Тәжірибе басында сұйықтық шығатын шекарада қысым бірден төмендетілді деп елестет. Сол шекарада қысым тұрақты қалады, ал қабат ішінде уақыт өте өзгереді.","Imagine lowering the pressure at the outflow boundary in a single step. Pressure stays fixed there while it continues changing inside the formation."]),
    fact(484,["Набор кривых для разных моментов","Әртүрлі уақытқа арналған қисықтар","Curves at different times"],
      ["Что на рис. 23.1 помогает увидеть неустановившееся распределение давления?","23.1-суретте қысымның уақыт бойынша өзгеруін не көрсетеді?","What shows transient pressure distribution in Figure 23.1?"],
      ["На рисунке приведены профили давления для разных моментов при постоянном забойном давлении.","Суретте тұрақты түптік қысым кезінде әртүрлі уақыттағы қысым профильдері көрсетілген.","The figure shows pressure profiles at different times with constant bottom-hole pressure."],
      ["Каждая кривая — снимок давления по разным точкам пласта в один момент. Чтобы увидеть изменение со временем, сравни две кривые в одной и той же точке.","Әр қисық бір мезетте қабаттың әр нүктесіндегі қысымды көрсетеді. Қысымның уақыт бойынша қалай өзгергенін көру үшін бір нүктедегі екі қисықты салыстыр.","Each curve is a snapshot of pressure at different points in the formation. Compare two curves at the same point to see how its pressure changes over time."]),
    {...fact(488,["Радиальный приток","Радиал ағын","Radial flow"],
      ["Как называется приток в модели, где давление одинаково на каждой окружности вокруг скважины?","Ұңғыма айналасындағы әр шеңберде қысым бірдей болатын ағын қалай аталады?","What is the flow geometry called when pressure is uniform on each circle around the well?"],
      ["Для радиального притока в этой модели давление зависит от расстояния от оси скважины и времени.","Бұл радиал ағын моделінде қысым ұңғыма осінен қашықтық пен уақытқа тәуелді.","In this radial model, pressure depends on distance from the well axis and on time."],
      ["Если условия во все стороны одинаковы, точки на одном расстоянии от скважины имеют одинаковое давление в один момент.","Барлық бағытта шарттар бірдей болса, ұңғымадан бірдей қашықтағы нүктелерде бір мезетте қысым бірдей.","In symmetric conditions, points the same distance from the well have the same pressure at a given time."]),id:"radial-flow"}
  ],[["Задай начальное давление и условия на границе","Бастапқы қысым мен шекаралық шарттарды бер","Set initial pressure and boundary conditions"],["Рассчитай давление в нужные моменты","Қажетті сәттердегі қысымды есепте","Compute pressure at the chosen times"],["Сопоставь профили","Профильдерді салыстыр","Compare the profiles"]])
];

const topics = new Map([...existingTopics,...newTopics].map(unit=>[unit.id,unit]));
export const units = courseOrder.map(id=>({...topics.get(id),...dayPlan[id]}));
for (const unit of units) {
  const {facts, id} = unit;
  const questions = [];
  facts.forEach((item,i) => {
    const order = [i,(i+1)%3,(i+2)%3];
    const options = order.map(j => facts[j].term);
    if (i % 2 === 0) options.reverse();
    const original = {id:id+"-q"+(item.id??i), page:item.page, prompt:item.quiz, help:item.explanation, unit:id};
    questions.push({...original,type:"single",options,key:options.indexOf(item.term)});
    questions.push({...original,id:id+"-write"+(item.id??i),type:"blank", key:item.term});
  });
  unit.questions = [...questions,...cases[id].map((item,index)=>({...item,id:id+"-case"+index,unit:id}))];
}

const assessment=finalCases.map(({drill,...task},index)=>({...task,id:"final-case"+index}));
export const levels = [
  ...units.map((unit,index)=>({id:unit.id,title:unit.title,threshold:index*4,
    quiz:unit.questions.filter(q=>q.type!=="blank").map(q=>q.id),
    practice:unit.questions.filter(q=>q.type==="blank"||q.drill).map(q=>q.id)})),
  {id:"final",title:["Смена геолога","Геолог ауысымы","Geologist’s shift"],threshold:units.length*4,
    quiz:assessment.map(q=>q.id),
    practice:["thickness-case0","traps-case0","diffusion-case0"]}
];
for(const unit of units)unit.questions.push(...assessment.filter(task=>task.unit===unit.id));
export const xpReward = levels.map(()=>4);
export const videos = Array(7).fill(null);
