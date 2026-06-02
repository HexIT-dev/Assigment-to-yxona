import React, { createContext, useContext, useState } from 'react';

export type Lang = 'uz' | 'ru' | 'en';

const translations = {
  uz: {
    // Navbar
    discover: "To'yxonalar",
    myBookings: "Mening Bronlarim",
    messages: "Xabarlar",
    myPanel: "Mening Panelim",
    adminPanel: "Admin Panel",
    signIn: "Kirish",
    register: "Ro'yxatdan o'tish",
    logout: "Chiqish",
    // Auth
    login_title: "Tizimga Kirish.",
    login_subtitle: "Hisobingizga kirish uchun ma'lumotlaringizni kiriting",
    username: "Foydalanuvchi nomi",
    password: "Parol",
    forgot: "Unutdingizmi?",
    login_btn: "Kirish",
    login_loading: "Kirilmoqda...",
    no_account: "Hisobingiz yo'qmi?",
    register_link: "Ro'yxatdan o'tish",
    admin_account: "Admin hisobi bormi?",
    admin_login: "Admin kirish",
    login_success: "Muvaffaqiyatli kirdingiz!",
    login_error: "Login yoki parol noto'g'ri",
    // Register
    reg_title: "Yangi Hisob Yaratish.",
    firstName: "Ism",
    lastName: "Familiya",
    email: "Email",
    phone: "Telefon",
    userRole: "Foydalanuvchi",
    ownerRole: "To'yxona Egasi",
    chooseRole: "Ro'l tanlang",
    agree_terms: "foydalanish shartlariga",
    agree_prefix: "Men",
    agree_suffix: "roziman",
    register_btn: "Ro'yxatdan o'tish",
    register_loading: "Yuborilmoqda...",
    have_account: "Allaqachon hisobingiz bormi?",
    reg_success_user: "Ro'yxatdan muvaffaqiyatli o'tdingiz! Endi kiring.",
    reg_success_owner: "Ro'yxatdan o'tdingiz! Email orqali OTP kodini tasdiqlang.",
    reg_error: "Ro'yxatdan o'tishda xatolik",
    // OTP
    otp_title: "Email Tasdiqlash.",
    otp_subtitle: "Emailingizga 6 xonali kod yuborildi",
    otp_label: "OTP Kod",
    otp_sent: "Yuborildi:",
    verify_btn: "Tasdiqlash",
    verify_loading: "Tekshirilmoqda...",
    resend: "Kodni qayta yuborish",
    back_register: "Ro'yxatga qaytish",
    otp_success: "Email muvaffaqiyatli tasdiqlandi! Endi kiring.",
    otp_error: "OTP kod noto'g'ri. Qaytadan urinib ko'ring.",
    // Landing
    hero_badge: "Hammasini Bron Qiling",
    hero_title: "Eng Go'zal",
    hero_title2: "Kuningiz",
    hero_title3: "Tarixi.",
    hero_sub: "O'zbekistonning eng nufuzli to'yxona va tantanalar saroylarining yagona tizimi. 5 daqiqada to'yingiz uchun salon band iling.",
    explore: "Qo'shimcha Ko'rish",
    book_now: "Bron Qilish",
    events: "Tadbirlar joyida",
    venues: "To'yxona",
    // Landing Extra
    start_booking: "Bronlashni Boshlash",
    gallery: "Galereyani Ko'rish",
    featured_badge: "Top To'yxonalar",
    featured_title: "Eng Yaxshi",
    featured_title2: "To'yxonalar.",
    featured_desc: "Tasdiqlangan va ishonchli to'yxonalar ro'yxati.",
    capacity: "Sig'im",
    price_per_seat: "Narx/kishi",
    advanced_filters: "Filtrlar",
    map_view: "Xarita",
    view_all: "Hammasini Ko'rish",
    concierge: "Qo'llab-quvvatlash",
    secure: "Xavfsiz",
    partners: "Hamkorlar",
    virtual_tour: "Virtual Tur",
    // Common
    loading: "Yuklanmoqda...",
    search: "Qidirish...",
    save: "Saqlash",
    cancel: "Bekor qilish",
    confirm: "Tasdiqlash",
    edit: "Tahrirlash",
    delete: "O'chirish",
    approve: "Tasdiqlash",
    reject: "Rad etish",
    close: "Yopish",
  },
  ru: {
    // Navbar
    discover: "Залы",
    myBookings: "Мои Брони",
    messages: "Сообщения",
    myPanel: "Мой Кабинет",
    adminPanel: "Панель Админа",
    signIn: "Войти",
    register: "Регистрация",
    logout: "Выйти",
    // Auth
    login_title: "Войти в систему.",
    login_subtitle: "Введите ваши данные для входа",
    username: "Имя пользователя",
    password: "Пароль",
    forgot: "Забыли?",
    login_btn: "Войти",
    login_loading: "Вход...",
    no_account: "Нет аккаунта?",
    register_link: "Зарегистрироваться",
    admin_account: "Есть аккаунт администратора?",
    admin_login: "Войти как Admin",
    login_success: "Успешный вход!",
    login_error: "Неверный логин или пароль",
    // Register
    reg_title: "Создать новый аккаунт.",
    firstName: "Имя",
    lastName: "Фамилия",
    email: "Email",
    phone: "Телефон",
    userRole: "Пользователь",
    ownerRole: "Владелец зала",
    chooseRole: "Выберите роль",
    agree_terms: "условиями использования",
    agree_prefix: "Я согласен с",
    agree_suffix: "",
    register_btn: "Зарегистрироваться",
    register_loading: "Отправка...",
    have_account: "Уже есть аккаунт?",
    reg_success_user: "Вы успешно зарегистрировались! Теперь войдите.",
    reg_success_owner: "Вы зарегистрированы! Подтвердите код OTP на email.",
    reg_error: "Ошибка при регистрации",
    // OTP
    otp_title: "Подтверждение Email.",
    otp_subtitle: "6-значный код отправлен на вашу почту",
    otp_label: "OTP Код",
    otp_sent: "Отправлено:",
    verify_btn: "Подтвердить",
    verify_loading: "Проверка...",
    resend: "Отправить код снова",
    back_register: "Назад к регистрации",
    otp_success: "Email успешно подтверждён! Теперь войдите.",
    otp_error: "Неверный OTP код. Попробуйте ещё раз.",
    // Landing
    hero_badge: "Забронируйте Всё",
    hero_title: "Самый Красивый",
    hero_title2: "День",
    hero_title3: "Вашей Жизни.",
    hero_sub: "Единая система лучших банкетных залов Узбекистана. Забронируйте зал для свадьбы за 5 минут.",
    explore: "Смотреть все",
    book_now: "Забронировать",
    events: "Мероприятий",
    venues: "Залов",
    // Landing Extra
    start_booking: "Начать бронирование",
    gallery: "Просмотр галереи",
    featured_badge: "Топ залы",
    featured_title: "Лучшие",
    featured_title2: "Залы.",
    featured_desc: "Список проверенных и надёжных залов.",
    capacity: "Вместимость",
    price_per_seat: "Цена/чел",
    advanced_filters: "Фильтры",
    map_view: "Карта",
    view_all: "Смотреть все",
    concierge: "Поддержка",
    secure: "Безопасный",
    partners: "Партнёры",
    virtual_tour: "Виртуальный тур",
    // Common
    loading: "Загрузка...",
    search: "Поиск...",
    save: "Сохранить",
    cancel: "Отмена",
    confirm: "Подтвердить",
    edit: "Редактировать",
    delete: "Удалить",
    approve: "Одобрить",
    reject: "Отклонить",
    close: "Закрыть",
  },
  en: {
    // Navbar
    discover: "Venues",
    myBookings: "My Bookings",
    messages: "Messages",
    myPanel: "My Dashboard",
    adminPanel: "Admin Panel",
    signIn: "Sign In",
    register: "Register",
    logout: "Logout",
    // Auth
    login_title: "Sign In.",
    login_subtitle: "Enter your credentials to continue",
    username: "Username",
    password: "Password",
    forgot: "Forgot?",
    login_btn: "Sign In",
    login_loading: "Signing in...",
    no_account: "Don't have an account?",
    register_link: "Register",
    admin_account: "Have an admin account?",
    admin_login: "Admin Login",
    login_success: "Successfully logged in!",
    login_error: "Invalid username or password",
    // Register
    reg_title: "Create New Account.",
    firstName: "First Name",
    lastName: "Last Name",
    email: "Email",
    phone: "Phone",
    userRole: "User",
    ownerRole: "Venue Owner",
    chooseRole: "Choose Role",
    agree_terms: "terms of service",
    agree_prefix: "I agree to the",
    agree_suffix: "",
    register_btn: "Register",
    register_loading: "Submitting...",
    have_account: "Already have an account?",
    reg_success_user: "Successfully registered! Now sign in.",
    reg_success_owner: "Registered! Please verify your email OTP.",
    reg_error: "Registration error",
    // OTP
    otp_title: "Email Verification.",
    otp_subtitle: "A 6-digit code was sent to your email",
    otp_label: "OTP Code",
    otp_sent: "Sent to:",
    verify_btn: "Verify",
    verify_loading: "Verifying...",
    resend: "Resend Code",
    back_register: "Back to Register",
    otp_success: "Email verified successfully! Now sign in.",
    otp_error: "Invalid OTP code. Please try again.",
    // Landing
    hero_badge: "Book Everything",
    hero_title: "Your Most",
    hero_title2: "Beautiful",
    hero_title3: "Day.",
    hero_sub: "Uzbekistan's premier wedding venue booking platform. Reserve your dream hall in 5 minutes.",
    explore: "Explore All",
    book_now: "Book Now",
    events: "Events hosted",
    venues: "Venues",
    // Landing Extra
    start_booking: "Start Booking",
    gallery: "View Gallery",
    featured_badge: "Top Venues",
    featured_title: "Premium",
    featured_title2: "Venues.",
    featured_desc: "Verified and trusted venues, curated for you.",
    capacity: "Capacity",
    price_per_seat: "Price/seat",
    advanced_filters: "Filters",
    map_view: "Map View",
    view_all: "View All",
    concierge: "Support",
    secure: "Secure",
    partners: "Partners",
    virtual_tour: "Virtual Tour",
    // Common
    loading: "Loading...",
    search: "Search...",
    save: "Save",
    cancel: "Cancel",
    confirm: "Confirm",
    edit: "Edit",
    delete: "Delete",
    approve: "Approve",
    reject: "Reject",
    close: "Close",
  }
};

type TranslationKey = keyof typeof translations.uz;

interface LanguageContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'uz',
  setLang: () => {},
  t: (key) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Lang>(() => {
    return (localStorage.getItem('lang') as Lang) || 'uz';
  });

  const handleSetLang = (l: Lang) => {
    setLang(l);
    localStorage.setItem('lang', l);
  };

  const t = (key: TranslationKey): string => {
    const val = translations[lang][key];
    return val !== undefined ? val : (translations.uz[key] ?? key);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang: handleSetLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLang = () => useContext(LanguageContext);
export default LanguageContext;
