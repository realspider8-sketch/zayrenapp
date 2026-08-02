import { useState, useEffect } from 'react';
import axios from 'axios';
import { Star, StarHalf, MessageSquare, Filter } from 'lucide-react';

interface ReviewData {
  summary: {
    average_rating: number;
    total_reviews: number;
    distribution: {
      "5": number;
      "4": number;
      "3": number;
      "2": number;
      "1": number;
    };
  };
  reviews: Array<{
    id: string;
    customer_name: string;
    product_name: string;
    rating: number;
    comment: string;
    date: string;
  }>;
}

const Reviews = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ReviewData | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const token = localStorage.getItem('token') || 'mock_token';
        const response = await axios.get('http://127.0.0.1:8000/api/admin/reviews', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setData(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching reviews:", error);
        
        // Fallback for visual testing
        setData({
          summary: {
            average_rating: 4.8,
            total_reviews: 124,
            distribution: { "5": 98, "4": 20, "3": 4, "2": 2, "1": 0 }
          },
          reviews: [
            { id: "REV-001", customer_name: "Amina Bello", product_name: "Classic White T-Shirt", rating: 5, comment: "Amazing quality! The material feels very premium and it fits perfectly.", date: "2023-10-25" },
            { id: "REV-002", customer_name: "Chukwudi Okafor", product_name: "Wireless Earbuds", rating: 4, comment: "Good sound quality and battery life, but the case feels a bit light.", date: "2023-10-22" }
          ]
        });
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<Star key={i} size={16} fill="var(--warning-color)" className="text-warning" />);
      } else if (i === Math.ceil(rating) && !Number.isInteger(rating)) {
        stars.push(<StarHalf key={i} size={16} fill="var(--warning-color)" className="text-warning" />);
      } else {
        stars.push(<Star key={i} size={16} className="text-muted opacity-30" />);
      }
    }
    return stars;
  };

  if (loading || !data) {
    return <div className="flex justify-center items-center h-full"><div className="text-primary">Loading reviews...</div></div>;
  }

  return (
    <div className="flex-col gap-6 animate-fade-in" style={{ maxWidth: '1000px' }}>
      
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Star className="text-primary" size={24} /> 
          Reviews & Ratings
        </h2>
        <button className="btn btn-outline flex items-center gap-2" style={{ padding: '8px 16px', fontSize: '14px' }}>
          <Filter size={16} /> Filter
        </button>
      </div>

      <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 2fr' }}>
        
        {/* Rating Summary Card */}
        <div className="glass-card flex-col gap-6" style={{ padding: '24px' }}>
          <h3 className="font-bold text-lg">Overall Rating</h3>
          
          <div className="flex items-end gap-4">
            <span className="text-6xl font-bold">{data.summary.average_rating}</span>
            <div className="flex-col pb-2">
              <div className="flex">{renderStars(data.summary.average_rating)}</div>
              <span className="text-sm text-muted mt-1">Based on {data.summary.total_reviews} reviews</span>
            </div>
          </div>

          <div className="flex-col gap-2 mt-4">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = data.summary.distribution[star.toString() as keyof typeof data.summary.distribution] || 0;
              const percentage = (count / data.summary.total_reviews) * 100;
              
              return (
                <div key={star} className="flex items-center gap-3">
                  <span className="text-sm font-semibold w-3">{star}</span>
                  <Star size={14} className="text-muted" />
                  <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-warning transition-all duration-1000" 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reviews List */}
        <div className="glass-card flex-col gap-4">
          <div className="p-4 border-b border-white/5 flex justify-between items-center">
            <h3 className="font-bold">Recent Reviews</h3>
            <span className="text-sm text-primary cursor-pointer hover:underline">View All</span>
          </div>

          <div className="flex-col gap-0">
            {data.reviews.length === 0 ? (
              <div className="p-8 text-center text-muted">No reviews yet.</div>
            ) : (
              data.reviews.map((review) => (
                <div key={review.id} className="flex-col gap-3 p-5 border-b border-white/5 hover:bg-white/5 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                        {review.customer_name.charAt(0)}
                      </div>
                      <div className="flex-col">
                        <span className="font-semibold">{review.customer_name}</span>
                        <span className="text-xs text-muted">Purchased: {review.product_name}</span>
                      </div>
                    </div>
                    <span className="text-xs text-muted">{review.date}</span>
                  </div>
                  
                  <div className="flex gap-1">
                    {renderStars(review.rating)}
                  </div>
                  
                  <p className="text-sm text-white/80 leading-relaxed mt-1">
                    "{review.comment}"
                  </p>
                  
                  <div className="flex items-center gap-4 mt-2">
                    <button className="text-xs text-primary flex items-center gap-1 hover:underline">
                      <MessageSquare size={12} /> Reply
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Reviews;
