export const CHANGELOG = [
  {
    version: 'v1.2.7',
    date: '27.07.2021',
    text: 'Новые сервера!',
    list: [
      'Убрали лишние и недоработанные фичи.',
      'Добавили удаление аккаунта.',
      'Пофиксили исчезновение пользователей из списка во время звонка.',
      'Уменьшили потребление ресурсов во время шаринга экрана.',
      'Починили шаринг экрана на устройствах со странным аппаратным ускорением.',
      'При просмотре чужого шаринга теперь можно увеличивать чужой экран — Ctrl+колесо или pinch-ем на тачпаде.',
      'Переехали на новые серверы — AWS',
      'И, как и всегда, много мелких фиксов и улучшений 🖐',
    ],
  },
  {
    version: 'v1.2.6',
    date: '02.07.2021',
    text: 'Дизайн-аудит',
    list: [
      'Провели дизайн-аудит приложения.',
      'Пофиксили выход из сна и бесконечный реконнект.',
      'Новый инпут загрузки аватарки.',
      'Разобрались с зомби-процессом приложения на винде, из-за которого отжиралось 100% памяти компа.',
      'Добавили сбор аналитики.',
      'Фиксы для M1-макбуков.',
      'Фикс отображения вебкамер на iOS устройствах в вебе',
      'Поправлены шрифты в приложении',
      'И, как обычно, много мелких фиксов и улучшений 🦔',
    ],
  },
  {
    version: 'v1.2.4',
    date: '17.06.2021',
    text: 'Светлая тема умерла, да здравствует тёмная тема',
    list: [
      'Проработали тёмную тему, сделав её единственной в приложении. Светаля тема осталась только на технических страницах в вебе.',
      'Отключили режим "из трея", за невостребованностью и неопределённостью его уникальной судьбы.',
      'Обновлённые окна звонка в вебе (для смартфонов).',
      'Новая иконка у приложения!',
      'Починили рисование (больше не перестаёт работать)',
      'Доделали поднятие руки (не перестаёт работать, а ещё пуш приходит только тем, у кого размьючен микрофон)',
      'Теперь во время звонка можно включать-выключать микрофон по пробелу.',
      'Умный поиск лица: если у вас ключена вебка, и вы выйдете из кадра больше чем на пять секунд, то Хейка услужливо отключит камеру.',
      'Пофиксили бесконечное количество багов по разным механикам в приложении и в вебе.',
      'И на этот раз ОЧЕНЬ много мелких фиксов и улучшений ⛵',
    ],
  },
  {
    version: 'v1.2.3',
    date: '21.05.2021',
    text: 'Сюда ещё кто-нибудь заходит?',
    list: [
      'Наконец-то: полностью рабочие механизмы приглашений, регистрации (в том числе через соцсети), веб-логина, присоединения к воркспейсу.',
      'Обновлённый лендинг и прочие веб-страницы.',
      'Можно отправить пользователю, который в офлайне, приглашение присоединиться к звонку через Slack — если воркспейс подключён к Slack и у собеседника подключён Slack.',
      'Названия каналов теперь только с маленькой буквы.',
      'В macOS оявился онбординг с запросом доступа к микрофону, камере и демонстрации экрана.',
      'И на этот раз ОЧЕНЬ много мелких фиксов и улучшений 🥝',
    ],
  },
  {
    version: 'v1.2.2',
    text: 'Привет 1% пользователей, что читают ченджлоги!',
    list: [
      'Провели ещё один небольшой дизайн-аудит приложения. Всё стало чуточку красивее.',
      'Развили функцию «Поднять руку». Теперь для неё есть отдельная кнопка внизу справа в окне звонка. Руку можно поднимать и опускать. После поднятия руки остальные участники получат пуш, сообщение в чат, а также это отобразится ещё в нескольких местах интерфейса.',
      'Добавили возможность приглашать группы пользователей на звонок.',
      'При открытом окне звонка совсем прячется мини-плашка. Можно свернуть окно звонка, и тогда вообще не будет ничего отвлекать на экране.',
      'Если какой-то текст (имя, канал, название устройства, etc.) не видно целиком, можно навести курсор, чтобы прочитать его',
      'Немного доработали уведомления внутри приложения (как внутри, так и снаружи).',
      'В приложение внедрена «умная» система логирования событий и ошибок. Если в Хейке что-то сломалось — попробуйте несколько раз подряд нажать на Esc, откроется страница с кнопкой «Сообщить об ошибке». Если нажмёте на неё, нам будет проще фиксить баги.',
      'Почистили тёмную тему, теперь в ней не должно быть ошибок вёрстки.',
      'Написали библиотеку с wireframe-плейсхолдерами списков, так что со временем загрузки списков будут становиться только красивее.',
      'Новая веб-страница для загрузки приложений Хейки.',
      'Пофиксили баг, который мешал компьютеру уйти в сон.',
      'Улучшили API под капотом.',
      'И, как обычно, много мелких фиксов и улучшений 🌽',
    ],
  },
  {
    version: 'v1.2.1',
    text: 'Соскучились?',
    list: [
      'Обновили админку для управления воркспейсами: новый дизайн и новые функции, например, можно назначить другого пользователя админом или создать группу.',
      'Новый лендинг на heyka.app.',
      'Обновили дизайн: увеличили шрифты и пространство между элементами, вынесли иконку настроек на видное место, пожертвовав кнопкой отключения наушников.',
      'Если менять сеть Wi-Fi, соединение восстановится.',
      'Обновили систему автоапдейта, чтобы сделать её надёжнее и чуть-чуть понятнее для пользователя.',
      'Иногда видео в мини-плашке могло пропадать — исправили это.',
      'Собрали ошибки из Hawk, исправили самые назойливые.',
      'Шаринг экрана теперь тратит меньше ресурсов компьютера.',
      'Переработали работу с микрофоном, теперь Bluetooth-наушники в связке с macOS работают стабильнее.',
      'Исправили проблемы с рисованием.',
      'В пустом канале теперь красивая и манящая кнопка Connect.',
      'У гостей новые цветные аватарки с инициалами.',
      'Во встроенном чате исправили прокрутку.',
      'Улучшили переподключение сокетов во время звонка.',
    ],
  },
  {
    version: 'v1.2.0',
    text: 'Добавили чат во время звонка! Открыть можно в большом окне звонка, новая кнопка внизу справа',
    list: [
      'При отправке ссылки в этом чате все участники получат пуш с ней, на который сразу можно нажать',
      'Новые стили ченджлогов — жаль, что никто их всё равно не читает и не увидит',
      'Улучшили общую производительность во время звонка',
      'Пофиксили фризы и баги видео.',
      'Пофиксили баги, связанные с шарингом, когда у пользователя несколько экранов с разными разрешениями.',
      'Пофиксили баг с сохранением выбранных устройств.',
      'И, как обычно, много мелких фиксов и улучшений 🦆',
    ],
  },
  {
    version: 'v1.1.12',
    text: 'Большое обновление, в котором много чего поменялось «под капотом».',
    list: [
      'Добавили отдельный интерфейс приглашения в канал: чтобы вызвать кого-то на разговор, выбирайте сразу нескольких людей из списка. В этом же разделе теперь прячется управление временной ссылкой для приглашения гостей через браузер.',
      'Разрешили подключать Slack: теперь сразу оттуда можно приглашать сотрудников присоединиться к Heyka, а ещё им в личные сообщения придёт оповещение о том, что их вызвали на разговор.',
      'Добавили приватные каналы: при создании нового канала нужно выбрать соответствующий флажок. Их будут видеть только те пользователи, которых пригласил создатель канала.',
      'Обновили страницу редактирования профиля, теперь она стала ещё красивее.',
      'Запустили новый дизайн для служебных веб-страниц.',
      'Добавили в настройках галочку, которая может отключить использование горячих клавиш.',
      'Поправили ошибки, связанные с использованием Bluetooth-наушников.',
      'В мини-плашке теперь будет всегда отображаться шаринг экрана или веб-камера человека, который говорит в эту секунду.',
      'Исправили какое-то количество багов и ошибок, оставили ещё несколько, чтобы не было слишком скучно.',
    ],
  },
  {
    version: 'v1.1.11',
    list: [
      'Приложение перешло на свежие версии Electron и Chromium! Большие изменения под капотом, улучшение безопасности и производительности, плюс открылась возможность некоторых фич в следующих обновлениях',
      'Множественные оптимизации приложения и избавление от микрофризов',
      'Поменяли звуковые эффекты',
      'Улучшенное взаимодействие (скрытие/показ) оверлеев и окна звонка',
      'В гриде появился статус реконнекта пользователя',
      'На Mac OS теперь шритф SanFrancisco',
      'Пофиксили автообновление на Big Sur',
      'И, как обычно, много мелких фиксов и улучшений 🍙',
    ],
  },
  {
    version: 'v1.1.9',
    list: [
      'Множественные улучшения звонков, аудио- видеосвязи',
      'Новое окно авторизации',
      'Исправлен визуальный баг с полоской "плохо слышно" поверх юзеров в канале',
      'В приложении появился каркас-прелоадер',
      'Исправлены визуальные недоработки режима "в трее"',
      'Исправлен баг с "поднятыми руками" в гриде',
      'Поиск в сайдбаре закреплён наверху',
      'Пуш уведомления можно смахивать двумя пальцами на тачпаде',
      'И, как обычно, много мелких фиксов и улучшений 🙆‍♂️',
    ],
  },
  {
    version: 'v1.1.8',
    list: [
      'Улучшили качество связи: пропало большинство прерываний! Если прерывания всё ещё случаются, не забывайте нажимать на "плохо слышно"',
      'Можно разрешить/запретить рисование во время шеринга экрана',
      'Можно ресайзить плашку, когда кто-то шарит экран или камеру',
      'Пофиксили несколько багов касаемо плашки',
      'Можно искать по каналам и пользователям по нажатию ctrl/cmd + F',
      'В гриде теперь видно, у кого плохой интернет',
      'Если знакомый в другом ворксейсе, всё равно видно если он онлайн и можно кинуть ему приглашение в разговор',
      'Обновили внешний вид настроек',
      'Экспериментальна фича "поднять руку". Ищите в трёх точках в гриде у своей ячейки',
      'Теперь в настройках можно выбирать между дев-сервером и обычным',
      'Новый внешний вид пуш уведомлений',
      'Новая плашка во время шаринга экрана',
      'Новый внещний вид грида',
      'И, как обычно, много мелких фиксов и улучшений 🌿',
    ],
  },
  {
    version: 'v1.1.7',
    text: 'Новый дизайн не за горами. Но пока что у нас немного монстр Франкенштейна.',
    list: [
      'Успели заменить шапку приложения, левую панель и контролы звонка. В остальных местах возможны небольшие дизайнерские аномалии, которые пропадут после полного переезда на новый дизайн.',
      'Размер и положение окна сохраняется при выходе из приложения.',
      'Добавили прелоадер видео на плашке-превью.',
      'Сортировка каналов и юзеров теперь по "релевантности".',
      'Починили баг, когда при выходе из "сна" не грузилось приложение.',
      'Теперь скрываем плашку "вас не слышно", если пользователь вышел из канала или включил микрофон через главное окно.',
      'Улучшили UX важных настроек, при которых необходимо перезапускать приложение.',
      'И, как обычно, много мелких фиксов и улучшений 🦋',
    ],
  },
  {
    version: 'v1.1.6',
    text: 'Большое обновление, в котором много чего поменялось «под капотом».',
    list: [
      'Сломали старую версию, теперь обязательно нужно обновиться всем пользователям.',
      'Добавили функционал создания нового воркспейса.',
      'Включить/выключить микрофон теперь можно глобальным хоткеем Ctrl/Cmd+Shift+M',
      'Пофиксили чёрный экран вместо шаринга - как в гриде, так и в окошке превью.',
      'Улучшили запоминание и смену медиаустройств, в т.ч. пофиксили баг с bluetooth-наушниками.',
      'Вынесли 50% кодовой базы в сабмодули, для общих классов/компонент в приложении и вебе.',
      'Пофиксили визуальные баги с выбранным каналом в левом меню.',
      'Убрали некоторый тестовый функционал из предыдущего обновления. Кнопка «меня плохо слышно» переехала в окно текущего канала, под список пользователей.',
      'И, как обычно, много мелких фиксов и улучшений 🥐,',
    ],
  },
  {
    version: 'v1.1.5',
    text: 'Большой патч, который приближает нас к «взрослому» релизу!',
    list: [
      'Расширенные настройки! Теперь можно выбрать, отключать ли микрофон после каждого звонка, и можно ли ресайзить главное окно.',
      'Добавили регистрацию в Хейке (воркспейс пока нельзя создать, ждите следующей версии).',
      'Добавили приглашение в воркспейс - по ссылке и по пригласительным письмам на почту.',
      'Добавили приглашение сторонних людей в звонок... Да, оно свершилось:',
      'ОБЩЕНИЕ В КАНАЛЕ ЧЕРЕЗ БРАУЗЕР! Правда пока только в Chrome ✨',
      'Отсутствие аватарки (или её медленная загрузка) теперь маскируется цветным кружочком.',
      '•🔺Начали исследование связи с плохим интернетом. Если во время звонка вас начинают плохо слышать ("ты что-то прерываешься") - нажмите на новую кнопочку "slow connection", которая появляется в шапке приложения во время разговора.',
      'Исправлен баг с пустым окном под пуш-уведомлениям, блокирующим нажатия поверх него',
      'Оффлайн-пользователи теперь не показываются в левом списке (если вы не начнёте вводить что-то в поиске)',
      'Маленький оверлей теперь можно закрыть до конца звонка. Грид при этом всё ещё можно открыть по соответствующей новой кнопке в шапке приложения.',
      'И, как обычно, много мелких фиксов и улучшений 🔱',
    ],
  },
  {
    version: 'v1.1.4',
    list: [
      'Патч с исправлениями и улучшениями стабильности связи и не-выкидывания из приложения.',
      'И, как обычно, много мелких фиксов и улучшений 🐙',
    ],
  },
  {
    version: 'v1.1.3',
    list: [
      'Секретный патч, про который никто не должен знать. К счастью, поломанное быстро починили в версии 1.1.4. 🔎',
    ],
  },
  {
    version: 'v1.1.2',
    list: [
      'Самое важное: появился вход через логин-пароль! Пароль всегда можно восстановить, придёт письмо с магической ссылкой, мы уже отправляли такое письмо случайно, вы его точно видели.',
      'Для администраторов воркспейса добавили возможность менеджерить воркспейс — пока что это удалять пользователей. Не шутите с администраторами.',
      'Сменили хостинг аватарок с Leonardo на S3.',
      'Сделали аудит приложения с точки зрения безопасности.',
      'Сотворили магию с диплинками и автоматической авторизацией в приложении по ссылкам в вебе — it just works!',
      'Поправили иконку на винде — она наконец-то выглядит не пережатой сотней архиваторов.',
      'Выход из фуллскрина просмотра шеринга по двойному нажатию (актуально для тех, кто сидит с режимом «из трея»).',
      'До редактирования профиля теперь 3 клика вместо 4!',
      'Клик по иконке Хейки в трее на маке открывает приложение на текущем экране, а не перелистывает на основной экран.',
      'Очередная попытка поправить слетающий онлайн статус у пользователей.',
      'И, как обычно, много мелких фиксов и улучшений 🥕,',
    ],
  },
  {
    version: 'v1.1.1',
    list: [
      'Появилось редактирование профиля 1.0! Можно менять аватарку и имя.',
      'Появилось редактирование и создание каналов.',
      'Появилась функция Mute for All — можно отключить микрофон у человека в канале (если он например jтошёл и забыл его выключить сам).',
      'Техническая фича: валидация форм.',
      'Багфикс: решена проблема с бесконечным нахождением в режиме "Away" (теперь по-настоящему)',
      'Пофикшены два бага, связанные с рисованием.',
      'И, как обычно, много мелких фиксов и улучшений 😎',
    ],
  },
  {
    version: 'v1.1.0',
    list: [
      'Появились приватные звонки 🎀 Можно зайти в профиль к пользователю и позвать его на «приватный звонок», который будет виден только вам и тем, кого вы в него пригласите. По завершению разговора этот «временный» канал удалится.',
      'Появилось рисование 📝 Галка активации рисования доступна при начале шаринга экрана: теперь вы можете раскрыть шаринг на весь экран, и тогда можно будет двигать курсором, кликать, рисовать линии и прямоугольники (зажав Ctrl), в общем, рисование.',
      'В маленькой плашке звонка теперь видно людей, которые присоединяются в канал.',
      'Добавили UI-звуков в приложение (подключение/отключение от канала, мьют микрофона, etc.), звуки временные, если у вас будут предложения по наборам звуков, скажите на что заменить.',
      'Визуально ускорили переход шаринга между превью окошком и окно-плиткой со всеми участниками.',
      'Пофикшен баг с проблемами после выхода из режима сна — избавились от ошибки 500 и статус Away теперь не ставится каждый раз.',
      'Анимация подключения и отключения от канала теперь выполняется без задержки, так мы ускоряем UX отклик приложения анимациями, никому не говорите.',
      'Внедрены анимированные иконки формата apng, так мы еще немного снизили нагрузку на CPU.',
      'В настройках появилась кнопка «Check for updates» — она наверху этой страницы, сама по себе Heyka проверяет обновления раз в 10 минут и при перезапуске, теперь вот можно быстро проверить.',
      'На маке вернули иконку приложения в док (если режим запуска приложения стоит не «из трея»).',
      'И, как обычно, много мелких фиксов и улучшений ✨',
    ],
  },
  {
    version: 'v1.0.4',
    text: 'У нас появились ченджлоги, в которых мы пишем о том, что нового сделали или сломали.',
    list: [
      'Самое главное в релизе — улучшена производительность, уменьшено потребление процессора в 7-10 раз.',
      'При выходе из настроек возвращает туда, откуда пришли.',
      'В сетке видео с камеры отображается как в зеркале (чтобы привычнее и от вампиров).',
      'При закрытии приложения сохраняется некоторая информация, чтобы меньше надо было подгружать при новом входе и чтобы даже без интернета отображалась какая-то информация в том числе, вдруг вы забыли как правильно пишется «Мураховский» и негде посмотреть.',
      'По многочисленным просьбам: микрофон теперь всегда автоматически мьютится после выхода из канала.',
      'Порадуйтесь за нас, мы переехали с Electron 7 на Electron 9, ура!',
      'Анимация подключения и отключения от канала теперь показана без задержки.',
      'Убрали баг с плашкой, залитой чёрным цветом цветом (залили полезными кнопочками и текстом).',
      'Добавили в настройках кнопку «перезагрузить сейчас» после смены режима запуска Heyka из окна или трея.',
      'Пофиксили баг с нажатием на превью видео/шаринга, когда ещё не открылся грид (раньше просто открывалось окно с гридом, сейчас открывается развёрнутый шаринг человека, по чьему шарингу ты кликнул), если вы не поняли о чем тут, ну и ладно, значит баг не существовал вовсе.',
      'Сделали фикс работы приложения с двух устройств одновременно, и очень кстати, так как Кирилл подготовил iOS бета-версию heyka под новую архитектуру.',
      'Очень. Много. Рефакторинга.',
      'И мелкие правки которые нет смысла описывать. (✿◡‿◡)',
    ],
  },
];
