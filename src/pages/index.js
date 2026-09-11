import React, {useState, useEffect} from "react";
import { NextSeo } from "next-seo";
import ImageCarousel from '../components/ImageCarousel';
import Product from "../components/Product"; // adjust path if needed
import { useTranslation } from "react-i18next";
import Dashboard from "./dashboard";


const Home = () => {
  const { i18n } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

      useEffect(() => {
          setMounted(true);
      }, []);



    if (!mounted) return null; // 🔥 prevents hydration error

    const isRTL = i18n.language === "ar"; // true if Arabic

return (
<>
  <NextSeo
    title="Munchix Delicious Food Delivery Service"
    description="Great food, delivered fast. Order from Munchix and enjoy your favorite meals at home."
  />

  <Dashboard />  
    
</>

)
};

export default Home;
