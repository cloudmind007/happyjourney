import React, { useState } from "react";
import api from "@/utils/axios";
import { useNavigate } from "react-router-dom";
import { Star } from "lucide-react";

const FeedbackForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    rating: 0,
    comments: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRatingChange = (rating: number) => {
    setFormData((prev) => ({ ...prev, rating }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.post("/api/feedback", formData);
      if (response.status === 200 || response.status === 201) {
        setSuccess("Thank you for your feedback!");
        setTimeout(() => navigate("/"), 2000);
      }
    } catch (err) {
      setError("Failed to submit feedback. Please try again.");
      console.error("Error submitting feedback:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-lg">
        <h2 className="text-2xl font-bold text-red-600 mb-6">FEEDBACK FORM</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How would you rate your experience?
            </label>
            <div className="flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingChange(star)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 ${star <= formData.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="comments" className="block text-sm font-medium text-gray-700">
              Comments (optional)
            </label>
            <textarea
              id="comments"
              name="comments"
              value={formData.comments}
              onChange={handleChange}
              className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
              placeholder="Share your thoughts with us..."
              rows={4}
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-500 text-sm">{success}</p>}
          <button
            type="submit"
            disabled={loading || formData.rating === 0}
            className={`w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors ${loading || formData.rating === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {loading ? "Submitting..." : "Submit Feedback"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FeedbackForm;