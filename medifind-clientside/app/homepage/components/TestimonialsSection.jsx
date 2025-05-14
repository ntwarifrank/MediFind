const TestimonialsSection = () => {
  // Sample testimonials
  const testimonials = [
    {
      name: "Jean Mutesi",
      location: "Kigali",
      text: "MediFind helped me find a specialist doctor when my child needed urgent care. The platform is easy to use and saved us valuable time.",
      rating: 5
    },
    {
      name: "Patrick Nduwumwe",
      location: "Musanze",
      text: "I was visiting Rwanda and needed to find a pharmacy quickly. MediFind directed me to the nearest one with the medication I needed.",
      rating: 4
    },
    {
      name: "Claire Uwimana",
      location: "Huye",
      text: "The hospital search feature is excellent. I could filter by specialty and found a great cardiologist close to my home.",
      rating: 5
    }
  ];

  return (
    <div className="w-full mb-16 bg-whiteGray rounded-lg py-8 px-4 md:px-8" aria-labelledby="testimonials-heading">
      <h2 id="testimonials-heading" className="text-2xl font-bold bg-gradient-to-tr from-mainBlue to-deepBlue bg-clip-text text-transparent mb-6">
        What Our Users Say
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((testimonial, index) => (
          <div 
            key={index} 
            className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-all"
            aria-label={`Testimonial from ${testimonial.name}`}
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-mainBlue flex items-center justify-center text-white font-bold text-xl">
                {testimonial.name.charAt(0)}
              </div>
              <div className="ml-3">
                <h3 className="font-bold text-DarkBlue">{testimonial.name}</h3>
                <p className="text-sm text-gray-600">{testimonial.location}</p>
              </div>
            </div>
            <div className="mb-3" aria-label={`${testimonial.rating} out of 5 stars`}>
              {Array(5).fill(0).map((_, i) => (
                <span key={i} className={i < testimonial.rating ? "text-yellow-500" : "text-gray-300"} aria-hidden="true">
                  ★
                </span>
              ))}
            </div>
            <p className="text-gray-600 italic">"{testimonial.text}"</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestimonialsSection;
