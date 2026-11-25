export const books = {
  lat: {author:"М. Г. Латышова", title:["Практическое руководство по интерпретации диаграмм ГИС","Ұңғыма каротажы диаграммаларын түсіндіру","Practical Guide to Well Log Interpretation"], range:"90–108"},
  kuz: {author:"В. Г. Кузнецов", title:["Литология природных резервуаров нефти и газа","Мұнай мен газдың табиғи резервуарларының литологиясы","Lithology of Natural Oil and Gas Reservoirs"], range:"200–222"},
  bas: {author:"К. С. Басниев и др.", title:["Нефтегазовая гидромеханика","Мұнай-газ гидромеханикасы","Oil and Gas Hydromechanics"], range:"474–500"}
};
const fact = (page, term, quiz, explanation, plain, scene) => ({page,term,quiz,explanation,plain,scene});
const track = (id, book, pages, title, facts, order) => ({id,book,pages,title,facts,order});
export const units = [
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
    fact(108,["Подходящее пороговое значение","Сәйкес шекті мән","An appropriate cut-off"],
      ["Что особенно важно выбрать правильно при определении эффективной толщины карбонатного разреза?","Карбонатты қиманың тиімді қалыңдығын анықтауда нені дұрыс таңдау маңызды?","What must be chosen carefully when estimating effective thickness in a carbonate section?"],
      ["Для изучаемых отложений нужен подходящий порог пористости. Чужой порог может дать серьёзную ошибку в толщине.","Зерттелетін шөгінділерге сәйкес кеуектілік шегі қажет. Сәйкес емес шек қалыңдықты бағалауда үлкен қатеге әкелуі мүмкін.","Choose a porosity cut-off appropriate to the deposits. An unsuitable cut-off can give a large thickness error."],
      ["Порог помогает решить, какие прослои включить в полезную толщину. Если взять неподходящий порог из другого разреза, можно включить лишние прослои или пропустить нужные.","Шекті мән қай қабатшаларды тиімді қалыңдыққа қосу керегін анықтайды. Басқа қимадан сәйкес емес шек алсақ, артық қабатшаларды қосуымыз немесе керектілерін өткізіп алуымыз мүмкін.","The cut-off helps decide which beds count towards effective thickness. Borrowing an unsuitable cut-off can include extra beds or miss useful ones."])
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
    fact(481,["Слабосжимаемая жидкость","Аз сығылатын сұйықтық","Slightly compressible fluid"],
      ["Для какой жидкости применимо линейное уравнение пьезопроводности (23.16) в этой главе?","Осы тараудағы сызықтық пьезоөткізгіштік теңдеуі (23.16) қандай сұйықтыққа қолданылады?","What fluid assumption underlies the linear diffusivity equation (23.16) here?"],
      ["Линейная форма предполагает слабую сжимаемость жидкости и малость соответствующего члена.","Сызықтық түр сұйықтықтың аз сығылуын және тиісті мүшенің кішілігін болжайды.","The linear form assumes a slightly compressible fluid and a small corresponding term."],
      ["В этой модели объём жидкости меняется мало, даже когда меняется давление. При таком допущении и малом вкладе отброшенного члена расчёт можно упростить.","Бұл модельде қысым өзгергенде де сұйықтық көлемі аз өзгереді. Осы болжам орындалып, ескерілмеген мүшенің әсері аз болса, есепті жеңілдетуге болады.","In this model, changing the pressure changes the fluid volume only a little. With that assumption and a small contribution from the omitted term, the calculation can be simplified."])
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
    fact(496,["Приближённый метод","Жуық әдіс","Approximate method"],
      ["Как следует трактовать расчёт по формуле (24.7), если книга сравнивает его с точным решением?","Кітап (24.7) нәтижесін дәл шешіммен салыстырса, оны қалай түсінеміз?","How should you treat the result of (24.7), given the book’s comparison with an exact solution?"],
      ["Формула (24.7) даёт приближённый результат. В приведённом сравнении погрешность депрессии составляет 25%.","(24.7) формуласы жуық нәтиже береді. Кітаптағы салыстыруда депрессия қателігі 25% болған.","Equation (24.7) is approximate. In the reported comparison, the drawdown error is 25%."],
      ["Формула даёт оценку снижения давления. В примере из книги эта оценка отличается от точного расчёта на 25%. При других условиях погрешность нужно оценивать отдельно.","Формула қысымның төмендеуін жуықтап бағалайды. Кітаптағы мысалда бұл баға дәл есептен 25% ауытқыған. Басқа жағдайда қателікті бөлек бағалау керек.","The formula estimates the pressure drop. In the book’s example, the estimate differs from the exact calculation by 25%. Check the error separately under other conditions."])
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
