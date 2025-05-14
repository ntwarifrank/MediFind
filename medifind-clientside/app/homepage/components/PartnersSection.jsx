import Image from "next/image";
import unicef from "../../../public/unicef.png";
import RSSB from "../../../public/rssb.png";
import Rbc from "../../../public/rbc.png";
import AfricanUnion from "../../../public/africanunion.png";
import Who from "../../../public/who.png";
import MinisteryOfRwanda from "../../../public/ministeryofrwanda.png";
import BK from "../../../public/bankofkigali.png";

const PartnersSection = () => {
  const partners = [
    { image: Rbc, name: "RBC" },
    { image: MinisteryOfRwanda, name: "Ministry of Health Rwanda" },
    { image: RSSB, name: "RSSB" },
    { image: AfricanUnion, name: "African Union" },
    { image: Who, name: "WHO" },
    { image: unicef, name: "UNICEF" },
    { image: BK, name: "Bank of Kigali" }
  ];

  return (
    <div className="w-full bg-whiteGray mb-10 rounded-md py-6" aria-labelledby="partners-heading">
      <h2 id="partners-heading" className="h-auto bg-gradient-to-tr from-mainBlue to-deepBlue text-transparent bg-clip-text py-3 font-bold px-5 text-xl">
        Our Partners
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4 py-5 px-3">
        {partners.map((partner, index) => (
          <div key={index} className="h-16 flex items-center justify-center"> 
            <Image 
              src={partner.image} 
              className="w-full h-full object-contain" 
              alt={partner.name} 
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PartnersSection;
