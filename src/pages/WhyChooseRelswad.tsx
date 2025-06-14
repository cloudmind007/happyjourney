import React from "react";
import { 
  Train, 
  Utensils, 
  Wallet, 
  ShieldCheck,
  Users,
  MapPin,
  ShoppingCart,
  ChefHat,
  Clock,
  ThumbsUp,
  Award,
  Leaf,
  HeartPulse
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const WhyChooseRelswad: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Why Choose Relswad Section */}
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-red-600 mb-4 whitespace-nowrap">
          WHY CHOOSE RELSWAD
        </h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          The ultimate solution for delicious, hygienic food delivered right to your train seat.
          Trusted by millions of travelers across India.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
        {[
          {
            icon: <Train className="w-10 h-10" />,
            title: "PAN-INDIA RAILWAY COVERAGE",
            description: "Serving 500+ stations across all major railway routes in India",
            color: "bg-blue-100 text-blue-600"
          },
          {
            icon: <Utensils className="w-10 h-10" />,
            title: "PREMIUM RESTAURANT PARTNERS",
            description: "Curated selection of 1000+ FSSAI certified restaurants",
            color: "bg-green-100 text-green-600"
          },
          {
            icon: <Wallet className="w-10 h-10" />,
            title: "FLEXIBLE PAYMENT OPTIONS",
            description: "Pay online or cash on delivery with zero cancellation fees",
            color: "bg-purple-100 text-purple-600"
          },
          {
            icon: <ShieldCheck className="w-10 h-10" />,
            title: "100% FOOD SAFETY",
            description: "Hygienic packaging and temperature-controlled delivery",
            color: "bg-amber-100 text-amber-600"
          },
          {
            icon: <Clock className="w-10 h-10" />,
            title: "REAL-TIME ORDER TRACKING",
            description: "Live updates from kitchen to your train seat",
            color: "bg-red-100 text-red-600"
          },
          {
            icon: <Leaf className="w-10 h-10" />,
            title: "ORGANIC & DIET OPTIONS",
            description: "Special menus for vegan, gluten-free and diabetic travelers",
            color: "bg-emerald-100 text-emerald-600"
          },
          {
            icon: <Award className="w-10 h-10" />,
            title: "AWARD WINNING SERVICE",
            description: "Best Railway Food Service 2023 by Travel & Hospitality Awards",
            color: "bg-indigo-100 text-indigo-600"
          },
          {
            icon: <HeartPulse className="w-10 h-10" />,
            title: "HEALTHY MEAL OPTIONS",
            description: "Nutritionist-approved meals for long journeys",
            color: "bg-pink-100 text-pink-600"
          }
        ].map((item, index) => (
          <div key={index} className="flex flex-col items-center text-center p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className={`${item.color} p-4 rounded-full mb-4`}>
              {item.icon}
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">{item.title}</h3>
            <p className="text-gray-600">{item.description}</p>
          </div>
        ))}
      </div>

      {/* How to Order Section */}
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-red-600 mb-4 whitespace-nowrap">
          HOW TO ORDER
        </h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Get delicious food delivered to your train seat in just 3 simple steps
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        {[
          {
            icon: <MapPin className="w-10 h-10" />,
            title: "SELECT STATION & RESTAURANT",
            description: "Choose your delivery station from our extensive network and select from premium restaurant partners",
            color: "bg-blue-100 text-blue-600",
            step: "1"
          },
          {
            icon: <ShoppingCart className="w-10 h-10" />,
            title: "CUSTOMIZE YOUR ORDER",
            description: "Browse menus, select dishes, add special instructions and confirm your order",
            color: "bg-green-100 text-green-600",
            step: "2"
          },
          {
            icon: <ChefHat className="w-10 h-10" />,
            title: "ENJOY HOT MEALS ON BOARD",
            description: "Receive timely delivery of fresh, hygienically packed food right at your seat",
            color: "bg-purple-100 text-purple-600",
            step: "3"
          }
        ].map((item, index) => (
          <div key={index} className="relative flex flex-col items-center text-center p-8 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-red-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">
              {item.step}
            </div>
            <div className={`${item.color} p-4 rounded-full mb-4`}>
              {item.icon}
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">{item.title}</h3>
            <p className="text-gray-600">{item.description}</p>
          </div>
        ))}
      </div>

      {/* Bulk Order Section */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 mb-12">
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-red-600 mb-4">GROUP & BULK ORDERS</h2>
          <p className="text-lg text-gray-700 mb-6">
            Planning a family trip or traveling with colleagues? Relswad specializes in bulk food orders for groups of all sizes. 
            Enjoy special discounts and customized menus for parties of 10+ people.
          </p>
          <ul className="space-y-3 mb-8">
            <li className="flex items-start">
              <ThumbsUp className="w-5 h-5 text-green-500 mt-0.5 mr-2" />
              <span>Special group discounts (10% off for 10+ orders)</span>
            </li>
            <li className="flex items-start">
              <Users className="w-5 h-5 text-blue-500 mt-0.5 mr-2" />
              <span>Dedicated order manager for large groups</span>
            </li>
            <li className="flex items-start">
              <ChefHat className="w-5 h-5 text-amber-500 mt-0.5 mr-2" />
              <span>Customized menus for special occasions</span>
            </li>
          </ul>
          <button
            onClick={() => navigate("/bulk-order")}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-8 rounded-full transition-colors flex items-center gap-2"
          >
            Order Now
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        <div className="w-full md:w-1/3">
          <img 
            src="https://images.unsplash.com/photo-1606787366850-de6330128bfc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80" 
            alt="Group dining" 
            className="rounded-xl shadow-lg w-full h-auto object-cover"
          />
        </div>
      </div>

      {/* Testimonial Section */}
      <div className="bg-white rounded-2xl shadow-md p-8 text-center">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">TRUSTED BY 1 MILLION+ TRAVELERS</h3>
        <div className="flex flex-col md:flex-row justify-center gap-8">
          {[
            {
              quote: "The best food delivery service for train journeys I've ever used!",
              author: "Rajesh K., Frequent Traveler"
            },
            {
              quote: "My kids look forward to train trips just for the Relswad meals!",
              author: "Priya M., Family Traveler"
            },
            {
              quote: "Perfect solution for our corporate group travels.",
              author: "Corporate Travel Manager"
            }
          ].map((item, index) => (
            <div key={index} className="max-w-md mx-auto md:mx-0">
              <div className="text-yellow-400 mb-4 flex justify-center">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 italic mb-2">"{item.quote}"</p>
              <p className="text-gray-600 font-medium">{item.author}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WhyChooseRelswad;