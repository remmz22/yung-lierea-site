"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Lang = "tr" | "en";

const dict = {
  tr: {
    nav: {
      about: "Hakkında",
      discography: "Diskografi",
      stats: "İstatistikler",
      contact: "İletişim",
      listen: "Spotify'da Dinle",
    },
    hero: {
      chip: "Bursa, Türkiye • 17",
      tagline: "Trap × Alternative R&B",
      sub: "Atmosferik ses manzaraları, ağır bas hatları ve melankolik melodiler. Türk underground sahnesinin kendinden oluşan sesi.",
      ctaPrimary: "Diskografiyi Keşfet",
      ctaSecondary: "Spotify'da Dinle",
      scroll: "Kaydır",
      nowPlaying: "Şu an çalıyor",
    },
    about: {
      tag: "Hakkında",
      title: "Kendinden oluşan bir ses",
      p1: "Yung Lierea, Bursa merkezli 17 yaşında Türk bir sanatçı. 2020 lockdown günlerinde yatak odasında prodüksiyon yapmaya başladı ve o günden beri trap ile alternative R&B arasındaki sınırı zorluyor.",
      p2: "Atmosferik ses manzaraları, ağır bas hatları ve melankolik melodiler üzerine kurulan müziği; modern Türk underground sahnesinin yükselen sınırlarını iten, taze ve kendinden oluşan bir ses olarak tanımlanıyor.",
      stats: {
        monthly: "Aylık Dinleyici",
        followers: "Spotify Takipçi",
        streams: "Toplam Stream",
        releases: "Yayınlanan İş",
      },
      skillsTitle: "Yetkinlikler",
      skills: {
        production: "Prodüksiyon",
        vocals: "Vokal",
        mixing: "Mix & Mastering",
        songwriting: "Söz Yazımı",
        soundDesign: "Sound Design",
      },
      badgeTrap: "Trap",
      badgeRnb: "Alt. R&B",
      badgeUnderground: "Underground",
    },
    discography: {
      tag: "Diskografi",
      title: "Release'ler",
      subtitle: "Tüm single'lar ve projeler — Spotify'da dinlenebilir.",
      filters: {
        all: "Tümü",
        SINGLE: "Singles",
        EP: "EPs",
        ALBUM: "Albümler",
      },
      listen: "Dinle",
      lyrics: "Sözler & Künye",
      showMore: "Daha Fazla Göster",
      noMore: "Hepsi bu — şimdilik.",
      empty: "Bu kategoride release yok.",
      bpm: "BPM",
      plays: "dinlenme",
      latest: "YENİ",
    },
    modal: {
      lyricsTitle: "Sözler",
      creditsTitle: "Künye",
      lyricsEmpty: "Sözler henüz eklenmedi. Yakında.",
      meta: { type: "Tür", date: "Tarih", duration: "Süre", genres: "Etiketler" },
      types: { SINGLE: "Single", EP: "EP", ALBUM: "Albüm" },
      openSpotify: "Spotify'da aç",
      close: "Kapat",
    },
    stats: {
      tag: "İstatistikler",
      title: "Rakamlarla Lierea",
      subtitle: "Dinlenme verileri Spotify'dan; grafikler canlı animasyonludur.",
      topTracks: "En Çok Dinlenenler",
      countries: "Ülkelere Göre Dinlenme",
      growth: "Aylık Dinleyici Büyümesi",
      live: "şu an dinleyici",
      monthlyLabel: "Aylık Dinleyici",
      followersLabel: "takipçi",
      dailyEst: "günlük dinleyici (tahmini)",
      spotifyLive: "Spotify canlı veri",
      updatedNow: "az önce güncellendi",
      updatedAgo: "{m} dk önce güncellendi",
      months: ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"],
      other: "Diğer",
    },
    contact: {
      tag: "İletişim",
      title: "İletişime geç",
      subtitle: "Booking, iş birliği, soru — hepsi buradan.",
      bookingTitle: "Booking & İş Birliği",
      location: "Bursa, Türkiye",
      availability: "2026 Q4 booking açık",
      types: {
        booking: "Booking / Teklif",
        collab: "İş Birliği",
        question: "Soru",
        press: "Basın",
        other: "Diğer",
      },
      bookingFields: {
        eventDate: "Etkinlik Tarihi",
        city: "Şehir",
        budget: "Bütçe",
        budgets: ["Belirtmek istemiyorum", "₺5.000'a kadar", "₺5.000 - ₺15.000", "₺15.000 - ₺50.000", "₺50.000+"],
      },
      form: {
        name: "İsim",
        namePh: "Adınız",
        email: "E-posta",
        emailPh: "ornek@mail.com",
        subject: "Konu",
        subjectPh: "Kısa konu başlığı…",
        message: "Mesaj",
        messagePh: "Merhaba Lierea…",
        submit: "Gönder",
        sending: "Gönderiliyor…",
        success: "Mesajın ulaştı. Dönüş yapacak!",
        error: "Bir şeyler ters gitti. Tekrar dene.",
      },
      faqTitle: "Sık Sorulanlar",
      faq: [
        {
          q: "Booking için nasıl teklif veririm?",
          a: "Formdan 'Booking / Teklif' seçeneğini seç, etkinlik tarihi, şehir ve bütçe aralığını bırak — 48 saat içinde dönüş yapılır.",
        },
        {
          q: "Hangi etkinliklerde sahne alıyorsun?",
          a: "Kulüp geceleri, festivaller, doğum günleri ve özel etkinlikler. Bursa ve tüm Türkiye — yurt dışı teklifler de değerlendirilir.",
        },
        {
          q: "Beat / prodüksiyon satıyor mu?",
          a: "Evet. Özel prodüksiyon ve beat iş birlikleri için 'İş Birliği' seçeneğini kullan; referanslarını da gönder.",
        },
        {
          q: "Sosyal medyadan da ulaşabilir miyim?",
          a: "Instagram (@lierea.wav) ve TikTok (@real.lierea) DM'leri her zaman açık. En hızlı yanıt yine formdan geliyor.",
        },
      ],
      newsletterTitle: "Yeni release'lerden haberdar ol",
      newsletterPh: "E-posta adresin",
      newsletterBtn: "Abone Ol",
      newsletterOk: "Abone oldun!",
      mapTitle: "Bursa, TR",
    },
    footer: {
      tagline: "Trap × Alternative R&B — Bursa'dan dünyaya.",
      quickLinks: "Hızlı Erişim",
      follow: "Takip Et",
      contact: "İletişim",
      rights: "Tüm hakları saklıdır.",
      madeIn: "Bursa'da yapıldı",
    },
    cookie: {
      text: "Bu site deneyimi geliştirmek için çerez kullanır. Analitik çerezlerine izin veriyor musun?",
      accept: "Kabul Et",
      reject: "Sadece Zorunlu",
    },
    loader: { text: "YÜKLENİYOR" },
    common: { language: "Dil", backTop: "Başa dön" },
  },
  en: {
    nav: {
      about: "About",
      discography: "Discography",
      stats: "Stats",
      contact: "Contact",
      listen: "Listen on Spotify",
    },
    hero: {
      chip: "Bursa, Türkiye • 17",
      tagline: "Trap × Alternative R&B",
      sub: "Atmospheric soundscapes, heavy basslines and moody melodies. A self-made voice of the Turkish underground.",
      ctaPrimary: "Explore Discography",
      ctaSecondary: "Listen on Spotify",
      scroll: "Scroll",
      nowPlaying: "Now playing",
    },
    about: {
      tag: "About",
      title: "A self-made voice",
      p1: "Yung Lierea is a 17-year-old Turkish artist based in Bursa. He started producing in his bedroom during the 2020 lockdowns and has been pushing the boundary between trap and alternative R&B ever since.",
      p2: "His music — built on atmospheric soundscapes, heavy basslines and moody melodies — is described as a fresh, self-made voice pushing the emerging boundaries of modern Turkish underground music.",
      stats: {
        monthly: "Monthly Listeners",
        followers: "Spotify Followers",
        streams: "Total Streams",
        releases: "Releases",
      },
      skillsTitle: "Skills",
      skills: {
        production: "Production",
        vocals: "Vocals",
        mixing: "Mix & Mastering",
        songwriting: "Songwriting",
        soundDesign: "Sound Design",
      },
      badgeTrap: "Trap",
      badgeRnb: "Alt. R&B",
      badgeUnderground: "Underground",
    },
    discography: {
      tag: "Discography",
      title: "Releases",
      subtitle: "All singles and projects — streaming on Spotify.",
      filters: { all: "All", SINGLE: "Singles", EP: "EPs", ALBUM: "Albums" },
      listen: "Listen",
      lyrics: "Lyrics & Credits",
      showMore: "Show More",
      noMore: "That's all — for now.",
      empty: "No releases in this category.",
      bpm: "BPM",
      plays: "plays",
      latest: "NEW",
    },
    modal: {
      lyricsTitle: "Lyrics",
      creditsTitle: "Credits",
      lyricsEmpty: "Lyrics not added yet. Coming soon.",
      meta: { type: "Type", date: "Date", duration: "Length", genres: "Genres" },
      types: { SINGLE: "Single", EP: "EP", ALBUM: "Album" },
      openSpotify: "Open in Spotify",
      close: "Close",
    },
    stats: {
      tag: "Stats",
      title: "Lierea in Numbers",
      subtitle: "Streaming data from Spotify; charts are animated live.",
      topTracks: "Top Tracks",
      countries: "Listeners by Country",
      growth: "Monthly Listener Growth",
      live: "listening now",
      monthlyLabel: "Monthly Listeners",
      followersLabel: "followers",
      dailyEst: "daily listeners (est.)",
      spotifyLive: "Spotify live data",
      updatedNow: "updated just now",
      updatedAgo: "updated {m} min ago",
      months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      other: "Other",
    },
    contact: {
      tag: "Contact",
      title: "Get in touch",
      subtitle: "Booking, collaboration, questions — all from here.",
      bookingTitle: "Booking & Collabs",
      location: "Bursa, Türkiye",
      availability: "Q4 2026 booking open",
      types: {
        booking: "Booking / Offer",
        collab: "Collaboration",
        question: "Question",
        press: "Press",
        other: "Other",
      },
      bookingFields: {
        eventDate: "Event Date",
        city: "City",
        budget: "Budget",
        budgets: ["Prefer not to say", "Up to $500", "$500 - $1,500", "$1,500 - $5,000", "$5,000+"],
      },
      form: {
        name: "Name",
        namePh: "Your name",
        email: "Email",
        emailPh: "you@example.com",
        subject: "Subject",
        subjectPh: "Short subject…",
        message: "Message",
        messagePh: "Hey Lierea…",
        submit: "Send",
        sending: "Sending…",
        success: "Message received. He'll get back to you!",
        error: "Something went wrong. Try again.",
      },
      faqTitle: "FAQ",
      faq: [
        {
          q: "How do I submit a booking offer?",
          a: "Pick 'Booking / Offer' in the form, leave the event date, city and budget range — you'll get a reply within 48 hours.",
        },
        {
          q: "What kind of events do you play?",
          a: "Club nights, festivals, birthdays and private events. Based in Bursa, playing all of Türkiye — international offers considered.",
        },
        {
          q: "Are beats / production for sale?",
          a: "Yes. Use the 'Collaboration' option for custom production and beat inquiries; send your references too.",
        },
        {
          q: "Can I reach out on social media?",
          a: "Instagram (@lierea.wav) and TikTok (@real.lierea) DMs are always open. Fastest response is still the form.",
        },
      ],
      newsletterTitle: "Stay updated on new releases",
      newsletterPh: "Your email",
      newsletterBtn: "Subscribe",
      newsletterOk: "Subscribed!",
      mapTitle: "Bursa, TR",
    },
    footer: {
      tagline: "Trap × Alternative R&B — from Bursa to the world.",
      quickLinks: "Quick Links",
      follow: "Follow",
      contact: "Contact",
      rights: "All rights reserved.",
      madeIn: "Made in Bursa",
    },
    cookie: {
      text: "This site uses cookies to improve the experience. Do you allow analytics cookies?",
      accept: "Accept",
      reject: "Essential Only",
    },
    loader: { text: "LOADING" },
    common: { language: "Language", backTop: "Back to top" },
  },
} as const;

export type Dict = (typeof dict)["tr"];

const LangContext = createContext<{
  lang: Lang;
  t: Dict;
  toggle: () => void;
}>({ lang: "tr", t: dict.tr, toggle: () => {} });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("tr");

  useEffect(() => {
    const saved = window.localStorage.getItem("lierea-lang");
    if (saved === "en" || saved === "tr") setLang(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    window.localStorage.setItem("lierea-lang", lang);
  }, [lang]);

  const toggle = useCallback(
    () => setLang((l) => (l === "tr" ? "en" : "tr")),
    []
  );

  return (
    <LangContext.Provider value={{ lang, t: dict[lang] as Dict, toggle }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
