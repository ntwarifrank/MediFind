import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileMedical, faChevronRight } from "@fortawesome/free-solid-svg-icons";

const HealthTipsSection = () => {
  // Sample health tips
  const healthTips = [
    {
      title: "Understanding Malaria Prevention in Rwanda",
      excerpt: "Learn about effective preventive measures against malaria, including use of treated bed nets and prophylactic medications.",
      date: "May 2, 2025",
      readTime: "5 min read",
      category: "Prevention"
    },
    {
      title: "Nutrition Tips for Children's Health",
      excerpt: "Discover nutritional guidance for maintaining your child's health with locally available foods in Rwanda.",
      date: "April 28, 2025",
      readTime: "4 min read",
      category: "Wellness"
    },
    {
      title: "Understanding Health Insurance Options",
      excerpt: "A guide to the different health insurance plans available in Rwanda and how to choose the right one for your family.",
      date: "April 25, 2025",
      readTime: "6 min read",
      category: "Healthcare"
    }
  ];

  return (
    <div className="w-full mb-16" aria-labelledby="health-tips-heading">
      <h2 id="health-tips-heading" className="text-2xl font-bold bg-gradient-to-tr from-mainBlue to-deepBlue bg-clip-text text-transparent mb-6">
        Healthcare Tips & Resources
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {healthTips.map((tip, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all">
            <div className="h-40 bg-whiteGray flex items-center justify-center">
              <FontAwesomeIcon icon={faFileMedical} className="text-mainBlue text-4xl" aria-hidden="true" />
            </div>
            <div className="p-5">
              <div className="flex justify-between text-xs text-gray-500 mb-2">
                <span>{tip.date}</span>
                <span>{tip.readTime}</span>
              </div>
              <h3 className="font-bold text-lg text-DarkBlue mb-2">{tip.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{tip.excerpt}</p>
              <div className="flex justify-between items-center">
                <span className="bg-whiteGray text-mainBlue text-xs px-3 py-1 rounded-full">
                  {tip.category}
                </span>
                <Link href="/health-tips">
                  <button className="text-mainBlue text-sm hover:underline inline-flex items-center" aria-label={`Read more about ${tip.title}`}>
                    Read more <FontAwesomeIcon icon={faChevronRight} className="ml-1 text-xs" aria-hidden="true" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 text-center">
        <Link href="/health-tips">
          <button className="bg-white border-2 border-mainBlue text-mainBlue px-6 py-2 rounded-lg hover:bg-whiteGray transition-all inline-flex items-center">
            View All Resources <FontAwesomeIcon icon={faChevronRight} className="ml-2" aria-hidden="true" />
          </button>
        </Link>
      </div>
    </div>
  );
};

export default HealthTipsSection;
