import React, { useRef } from "react";
import { 
  Train, 
  Utensils, 
  Wallet, 
  ShieldCheck,
  MapPin,
  ShoppingCart,
  ChefHat,
  ThumbsUp,
  Users,
  PlayCircle,
  Check,
  Star
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const WhyChooseRelswad: React.FC = () => {
  const navigate = useNavigate();
  const howItWorksRef = useRef<HTMLDivElement>(null);

  const scrollToHowItWorks = () => {
    howItWorksRef.current?.scrollIntoView({ 
      behavior: "smooth",
      block: "start"
    });
  };

  return (
    <div className="container mx-auto px-4 py-12 sm:py-16">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block mb-3 px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-50 rounded-full">
            WHY CHOOSE US
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            Train Food Delivery, Redefined
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Savor restaurant-quality meals delivered to your train seat
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => navigate("/bulk-order")}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-lg"
            >
              Bulk Order Now
            </button>
            <button
              onClick={scrollToHowItWorks}
              className="flex items-center gap-2 px-6 py-2.5 border border-gray-300 hover:border-gray-400 text-gray-700 font-medium rounded-lg transition-colors bg-white shadow-sm hover:shadow-md"
            >
              <PlayCircle className="w-4 h-4" />
              How It Works
            </button>
          </div>
        </div>
      </section>

      {/* Benefits Cards */}
      <section className="mb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: <Train className="w-10 h-10 text-blue-500" />,
              title: "Nationwide Coverage",
              description: "Serving 500+ stations across India",
              highlights: ["All railway zones", "24/7 availability"],
              color: "bg-blue-50"
            },
            {
              icon: <Utensils className="w-10 h-10 text-green-500" />,
              title: "Premium Restaurants",
              description: "1000+ FSSAI-certified partners",
              highlights: ["Top-rated eateries", "Dietary options"],
              color: "bg-green-50"
            },
            {
              icon: <Wallet className="w-10 h-10 text-purple-500" />,
              title: "Flexible Payments",
              description: "Secure and easy payment options",
              highlights: ["UPI & Cards", "Instant refunds"],
              color: "bg-purple-50"
            },
            {
              icon: <ShieldCheck className="w-10 h-10 text-amber-500" />,
              title: "Safety First",
              description: "Hygienic and secure delivery",
              highlights: ["Tamper-proof packing", "Contactless delivery"],
              color: "bg-amber-50"
            }
          ].map((item, index) => (
            <div 
              key={index} 
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100"
            >
              <div className={`${item.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                {item.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{item.description}</p>
              <ul className="space-y-1">
                {item.highlights.map((highlight, i) => (
                  <li key={i} className="flex items-center text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-500 mr-2" />
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section ref={howItWorksRef} className="mb-16">
  <div className="text-center mb-12">
    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Simple Ordering Process</h2>
    <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
      Get fresh meals in 3 easy steps
    </p>
  </div>

  <div className="relative">
    <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -translate-y-1/2"></div>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      {[
        {
          icon: <MapPin className="w-8 h-8 text-blue-500" />,
          title: "Select Station",
          description: "Choose your delivery station and restaurant",
          highlights: ["Search by station", "View menus"],
          step: "1"
        },
        {
          icon: <ShoppingCart className="w-8 h-8 text-green-500" />,
          title: "Customize Order",
          description: "Personalize your meal with ease",
          highlights: ["Special instructions", "Dietary options"],
          step: "2"
        },
        {
          icon: <ChefHat className="w-8 h-8 text-amber-500" />,
          title: "Enjoy On Board",
          description: "Fresh food delivered to your seat",
          highlights: ["Real-time tracking", "Contactless delivery"],
          step: "3"
        }
      ].map((item, index) => (
        <div 
          key={index} 
          className="relative bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100 z-10"
        >
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold text-sm shadow-md">
            {item.step}
          </div>
          <div className="text-center">
            <div className="mx-auto w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center mb-4">
              {item.icon}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
            <p className="text-sm text-gray-600 mb-4">{item.description}</p>
            <ul className="space-y-1">
              {item.highlights.map((detail, i) => (
                <li key={i} className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  {detail}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>
      {/* Bulk Order Section */}
      <section className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl overflow-hidden mb-16">
        <div className="flex flex-col sm:flex-row">
          <div className="sm:w-1/2 p-8 sm:p-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Group Travel Solutions</h2>
            <p className="text-base sm:text-lg text-gray-600 mb-6">
              Plan meals for your group with our bulk ordering service, tailored for travelers.
            </p>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center">
                <ThumbsUp className="w-5 h-5 text-green-500 mr-2" />
                <span className="text-sm text-gray-600">10% discount on 10+ meals</span>
              </li>
              <li className="flex items-center">
                <Users className="w-5 h-5 text-blue-500 mr-2" />
                <span className="text-sm text-gray-600">Dedicated coordinator</span>
              </li>
              <li className="flex items-center">
                <ChefHat className="w-5 h-5 text-amber-500 mr-2" />
                <span className="text-sm text-gray-600">Custom menus for groups</span>
              </li>
            </ul>
            <button
              onClick={() => navigate("/bulk-order")}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-lg flex items-center gap-2"
            >
              Get Group Discount
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          <div className="sm:w-1/2">
            <img 
              src="https://images.unsplash.com/photo-1606787366850-de6330128bfc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80" 
              alt="Group dining" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mb-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Trusted by Travelers</h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Over 1M happy customers enjoy our meals
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            {
              quote: "Transformed our train trips with delicious meals!",
              author: "Rajesh K.",
              role: "Frequent Traveler",
              rating: 5
            },
            {
              quote: "Perfect for business travel, always on time.",
              author: "Priya M.",
              role: "Corporate Traveler",
              rating: 5
            },
            {
              quote: "Flawless bulk orders for our tour group.",
              author: "Amit S.",
              role: "Travel Agency",
              rating: 5
            }
          ].map((testimonial, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100">
              <div className="flex mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <blockquote className="text-sm text-gray-600 mb-3 italic">
                "{testimonial.quote}"
              </blockquote>
              <div className="font-medium text-gray-900">{testimonial.author}</div>
              <div className="text-xs text-gray-500">{testimonial.role}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default WhyChooseRelswad;