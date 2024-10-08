import image1 from "../images/s1.png";
import image2 from "../images/s2.png";
import image3 from "../images/s3.png";

export const slides = [
  {
    img: image1,
    text: "Cari bengkel terdekat? Ada FiXolution!!",
    subtext:
      "Anda buru - buru dan ingin mencari servis bengkel tercepat? Jangan khawatir! Kami sediakan rekomendasi bengkel terdekat dan terpercaya disekitar Anda ",
  },
  {
    img: image2,
    text: "Service Berkualitas",
    subtext:
      "Kami memastikan kendaraan Anda mendapatkan perawatan terbaik. Dengan teknisi yang berpengalaman dan peralatan yang canggih, kami menjamin kualitas layanan yang unggul.",
  },
  {
    img: image3,
    text: "Bengkel Terpercaya",
    subtext:
      "Bekerjasama dengan bengkel yang memiliki reputasi baik. Kami memastikan bahwa setiap bengkel dalam jaringan kami telah melalui proses verifikasi ketat untuk memastikan kualitas dan kepercayaan.",
  },
];
export const navData = [
  {
    title: "Home",
    link: "home",
  },
  {
    title: "About",
    link: "about",
  },
  {
    title: "Products",
    link: "product",
  },
  {
    title: "Profile",
    link: "profile",
  },
  {
    title: "Services",
    link: "services",
  },
];

export const navDataAdmin = [
  {
    href: "/dashboard",
    icon: "LayoutDashboard",
    label: "Dasboard",
  },
  {
    href: "/manajemenBengkel",
    icon: "Warehouse",
    label: "Manage Bengkel",
  },
  {
    href: "/manajemenSukuCadang",
    icon: "PackageSearch",
    label: "Suku Cadang",
  },
  // {
  //   href: "/booking",
  //   icon: "ScrollText",
  //   label: "Manage Booking",
  // },
  // {
  //   href: "/serviceToGo",
  //   icon: "Bike",
  //   label: "Service to Go",
  // },
  // {
  //   href: '/transaksiBengkel',
  //   icon: 'ShoppingBasket',
  //   label: 'Transaksi Bengkel'
  // },
];

export const navDataBengkel = [
  // {
  //   href: "/editBengkel",
  //   icon: "Warehouse",
  //   label: "Bengkel",
  // },
  {
    href: "/layananBengkel",
    icon: "PackageSearch",
    label: "Layanan Bengkel",
  },
  {
    href: "/booking",
    icon: "ScrollText",
    label: "Manage Booking",
  },
  {
    href: "/serviceToGo",
    icon: "Bike",
    label: "Service to Go",
  },
];
