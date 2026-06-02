import { Star } from "lucide-react";

interface RatingProps {
  rating: number;
  onRate: (score: number) => void;
}

const Rating = ({ rating, onRate }: RatingProps) => {
  return (
      <div className="flex justify-center gap-4 md:gap-6">
        {[1, 2, 3, 4, 5].map((star) => (
            <button
                key={star}
                onClick={() => onRate(star)}
                className="hover:scale-125 transition-transform"
            >
              <Star
                  size={48}
                  className={`transition-all ${rating >= star ? "fill-[#34D399] text-[#34D399]" : "text-gray-600"}`}
              />
            </button>
        ))}
      </div>
  );
};

export default Rating;