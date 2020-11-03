export const CHANGELOG = [
  {
    version: 'v1.1.7',
    text: `Новый дизайн не за горами. Но пока что у нас немного монстр Франкенштейна.
    • Успели заменить шапку приложения и левую панель. В остальных местах возможны небольшие дизайнерские аномалии, которые пропадут после полного переезда на новый дизайн.
    • Добавили прелоадер видео на плашке-превью.
    • Сортировка каналов и юзеров теперь по "релевантности".
    • Починили баг, когда при выходе из "сна" не грузилось приложение.
    • Теперь скрываем плашку "вас не слышно", если пользователь вышел из канала или включил микрофон через главное окно.
    • Улучшили UX важных настроек, при которых необходимо перезапускать приложение.
    • И, как обычно, много мелких фиксов и улучшений 🦋`,
  },
  {
    version: 'v1.1.6',
    text: `Большое обновление, в котором много чего поменялось «под капотом».
    • Сломали старую версию, теперь обязательно нужно обновиться всем пользователям.
    • Добавили функционал создания нового воркспейса.
    • Включить/выключить микрофон теперь можно глобальным хоткеем Ctrl/Cmd+Shift+M
    • Пофиксили чёрный экран вместо шаринга - как в гриде, так и в окошке превью.
    • Улучшили запоминание и смену медиаустройств, в т.ч. пофиксили баг с bluetooth-наушниками.
    • Вынесли 50% кодовой базы в сабмодули, для общих классов/компонент в приложении и вебе.
    • Пофиксили визуальные баги с выбранным каналом в левом меню.
    • Убрали некоторый тестовый функционал из предыдущего обновления. Кнопка «меня плохо слышно» переехала в окно текущего канала, под список пользователей.
    • И, как обычно, много мелких фиксов и улучшений 🥐`,
  },
  {
    version: 'v1.1.5',
    text: `Большой патч, который приближает нас к «взрослому» релизу!
    • Расширенные настройки! Теперь можно выбрать, отключать ли микрофон после каждого звонка, и можно ли ресайзить главное окно.
    • Добавили регистрацию в Хейке (воркспейс пока нельзя создать, ждите следующей версии).
    • Добавили приглашение в воркспейс - по ссылке и по пригласительным письмам на почту.
    • Добавили приглашение сторонних людей в звонок... Да, оно свершилось:
    • ОБЩЕНИЕ В КАНАЛЕ ЧЕРЕЗ БРАУЗЕР! Правда пока только в Chrome ✨
    • Отсутствие аватарки (или её медленная загрузка) теперь маскируется цветным кружочком.
    •🔺Начали исследование связи с плохим интернетом. Если во время звонка вас начинают плохо слышать ("ты что-то прерываешься") - нажмите на новую кнопочку "slow connection", которая появляется в шапке приложения во время разговора.
    • Исправлен баг с пустым окном под пуш-уведомлениям, блокирующим нажатия поверх него
    • Оффлайн-пользователи теперь не показываются в левом списке (если вы не начнёте вводить что-то в поиске)
    • Маленький оверлей теперь можно закрыть до конца звонка. Грид при этом всё ещё можно открыть по соответствующей новой кнопке в шапке приложения.
    • И, как обычно, много мелких фиксов и улучшений 🔱`,
  },
  {
    version: 'v1.1.4',
    text: `• Патч с исправлениями и улучшениями стабильности связи и не-выкидывания из приложения.
    • И, как обычно, много мелких фиксов и улучшений 🐙`,
  },
  {
    version: 'v1.1.3',
    text: `• Секретный патч, про который никто не должен знать. К счастью, поломанное быстро починили в версии 1.1.4. 🔎`,
  },
  {
    version: 'v1.1.2',
    text: `• Самое важное: появился вход через логин-пароль! Пароль всегда можно восстановить, придёт письмо с магической ссылкой, мы уже отправляли такое письмо случайно, вы его точно видели.
    • Для администраторов воркспейса добавили возможность менеджерить воркспейс — пока что это удалять пользователей. Не шутите с администраторами.
    • Сменили хостинг аватарок с Leonardo на S3.
    • Сделали аудит приложения с точки зрения безопасности.
    • Сотворили магию с диплинками и автоматической авторизацией в приложении по ссылкам в вебе — it just works!
    • Поправили иконку на винде — она наконец-то выглядит не пережатой сотней архиваторов.
    • Выход из фуллскрина просмотра шеринга по двойному нажатию (актуально для тех, кто сидит с режимом «из трея»).
    • До редактирования профиля теперь 3 клика вместо 4!
    • Клик по иконке Хейки в трее на маке открывает приложение на текущем экране, а не перелистывает на основной экран.
    • Очередная попытка поправить слетающий онлайн статус у пользователей.
    • И, как обычно, много мелких фиксов и улучшений 🥕`,
  },
  {
    version: 'v1.1.1',
    text: `• Появилось редактирование профиля 1.0! Можно менять аватарку и имя.
    • Появилось редактирование и создание каналов.
    • Появилась функция Mute for All — можно отключить микрофон у человека в канале (если он например jтошёл и забыл его выключить сам).
    • Техническая фича: валидация форм.
    • Багфикс: решена проблема с бесконечным нахождением в режиме "Away" (теперь по-настоящему)
    • Пофикшены два бага, связанные с рисованием.
    • И, как обычно, много мелких фиксов и улучшений 😎`,
  },
  {
    version: 'v1.1.0',
    text: `• Появились приватные звонки 🎀 Можно зайти в профиль к пользователю и позвать его на «приватный звонок», который будет виден только вам и тем, кого вы в него пригласите. По завершению разговора этот «временный» канал удалится.
    • Появилось рисование 📝 Галка активации рисования доступна при начале шаринга экрана: теперь вы можете раскрыть шаринг на весь экран, и тогда можно будет двигать курсором, кликать, рисовать линии и прямоугольники (зажав Ctrl), в общем, рисование.
    • В маленькой плашке звонка теперь видно людей, которые присоединяются в канал.
    • Добавили UI-звуков в приложение (подключение/отключение от канала, мьют микрофона, etc.), звуки временные, если у вас будут предложения по наборам звуков, скажите на что заменить.
    • Визуально ускорили переход шаринга между превью окошком и окно-плиткой со всеми участниками.
    • Пофикшен баг с проблемами после выхода из режима сна — избавились от ошибки 500 и статус Away теперь не ставится каждый раз.
    • Анимация подключения и отключения от канала теперь выполняется без задержки, так мы ускоряем UX отклик приложения анимациями, никому не говорите.
    • Внедрены анимированные иконки формата apng, так мы еще немного снизили нагрузку на CPU.
    • В настройках появилась кнопка «Check for updates» — она наверху этой страницы, сама по себе Heyka проверяет обновления раз в 10 минут и при перезапуске, теперь вот можно быстро проверить.
    • На маке вернули иконку приложения в док (если режим запуска приложения стоит не «из трея»).
    • И, как обычно, много мелких фиксов и улучшений ✨`,
  },
  {
    version: 'v1.0.4',
    text: `• У нас появились ченджлоги, в которых мы пишем о том, что нового сделали или сломали.
        • Самое главное в релизе — улучшена производительность, уменьшено потребление процессора в 7-10 раз.
        • При выходе из настроек возвращает туда, откуда пришли.
        • В сетке видео с камеры отображается как в зеркале (чтобы привычнее и от вампиров).
        • При закрытии приложения сохраняется некоторая информация, чтобы меньше надо было подгружать при новом входе и чтобы даже без интернета отображалась какая-то информация в том числе, вдруг вы забыли как правильно пишется «Мураховский» и негде посмотреть.
        • По многочисленным просьбам: микрофон теперь всегда автоматически мьютится после выхода из канала.
        • Порадуйтесь за нас, мы переехали с Electron 7 на Electron 9, ура!
        • Анимация подключения и отключения от канала теперь показана без задержки.
        • Убрали баг с плашкой, залитой чёрным цветом цветом (залили полезными кнопочками и текстом).
        • Добавили в настройках кнопку «перезагрузить сейчас» после смены режима запуска Heyka из окна или трея.
        • Пофиксили баг с нажатием на превью видео/шаринга, когда ещё не открылся грид (раньше просто открывалось окно с гридом, сейчас открывается развёрнутый шаринг человека, по чьему шарингу ты кликнул), если вы не поняли о чем тут, ну и ладно, значит баг не существовал вовсе.
        • Сделали фикс работы приложения с двух устройств одновременно, и очень кстати, так как Кирилл подготовил iOS бета-версию heyka под новую архитектуру.
        • Очень. Много. Рефакторинга.
        • И мелкие правки которые нет смысла описывать.
        (✿◡‿◡)`,
  },
];
