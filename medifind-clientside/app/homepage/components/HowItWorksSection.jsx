const HowItWorksSection = () => {
  const steps = [
    {
      number: 1,
      title: "Select Your Location",
      description: "Choose your district or enter your location to find healthcare services near you."
    },
    {
      number: 2,
      title: "Filter Your Needs",
      description: "Specify the type of healthcare facility or medical specialty you're looking for."
    },
    {
      number: 3,
      title: "Get Connected",
      description: "View facility details, contact information, and book appointments with your chosen provider."
    }
  ];

  return (
    <div className="w-full mb-16" aria-labelledby="how-it-works-heading">
      <h2 id="how-it-works-heading" className="text-2xl font-bold bg-gradient-to-tr from-mainBlue to-deepBlue bg-clip-text text-transparent mb-6">
        How MediFind Works
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((step) => (
          <div key={step.number} className="bg-whiteGray rounded-lg p-6 relative">
            <div 
              className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-gradient-to-tr from-mainBlue to-deepBlue flex items-center justify-center text-white font-bold text-xl"
              aria-hidden="true"
            >
              {step.number}
            </div>
            <div className="mt-4">
              <h3 className="font-bold text-lg text-DarkBlue mb-3">{step.title}</h3>
              <p className="text-gray-600">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HowItWorksSection;
