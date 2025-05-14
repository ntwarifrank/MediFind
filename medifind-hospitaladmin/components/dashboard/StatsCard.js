import React from 'react';

const StatsCard = ({ title, value, icon, trend, trendValue }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 flex items-center justify-between transition-all hover:shadow-md duration-300">
      <div>
        <h3 className="text-mainGray text-xs md:text-sm font-medium mb-1">{title}</h3>
        <p className="text-DarkBlue text-xl md:text-2xl font-bold">{value}</p>
        {trend && (
          <p className={`text-xs flex items-center mt-1 md:mt-2 ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
            <span>
              {trend === 'up' ? (
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M12 13a1 1 0 110 2H7a1 1 0 01-1-1v-5a1 1 0 112 0v2.586l4.293-4.293a1 1 0 011.414 0L16 9.586l4.293-4.293a1 1 0 111.414 1.414l-5 5a1 1 0 01-1.414 0L12 8.414l-2.293 2.293A1 1 0 019 11V8a1 1 0 110-2h5z" clipRule="evenodd" />
                </svg>
              )}
            </span>
            {trendValue} from last week
          </p>
        )}
      </div>
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-mainBlue to-deepBlue flex items-center justify-center text-white">
        {icon}
      </div>
    </div>
  );
};

export default StatsCard;
