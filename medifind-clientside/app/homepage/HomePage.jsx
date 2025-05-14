"use client";
import { useState } from "react";

// Import components
import HeroSection from "./components/HeroSection";
import SearchForm from "./components/SearchForm";
import PartnersSection from "./components/PartnersSection";
import FeaturedFacilities from "./components/FeaturedFacilities";
import ServicesSection from "./components/ServicesSection";
import HowItWorksSection from "./components/HowItWorksSection";
import TestimonialsSection from "./components/TestimonialsSection";
import AppPromoSection from "./components/AppPromoSection";
import HealthTipsSection from "./components/HealthTipsSection";
import ContactSection from "./components/ContactSection";
import Footer from "./components/Footer";
import Nav from "../nav/page";

const HomePage = () => {
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  
  return (
    <div className="w-full mx-auto mt-0 bg-mainWhite overflow-x-hidden">
      <div className="lg:w-[85%] md:w-[90%] w-[95%] mx-auto">
        <Nav />
        <HeroSection setIsSearchVisible={setIsSearchVisible} />
        {isSearchVisible && <SearchForm />}
        <PartnersSection />
        <FeaturedFacilities />
        <ServicesSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <AppPromoSection />
        <HealthTipsSection />
        <ContactSection />
        <Footer />
      </div>
    </div>
  );
};

export default HomePage;
