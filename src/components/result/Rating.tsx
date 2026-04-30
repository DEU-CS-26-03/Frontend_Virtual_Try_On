import { useState } from "react";

const Rating = () => {
  const [rating, setRating] = useState(0);

  return (
    <div className="flex gap-2">
      {[1,2,3,4,5].map((star) => (
        <span
          key={star}
          onClick={() => setRating(star)}
          className={`cursor-pointer text-2xl ${
            rating >= star ? "text-yellow-400" : "text-gray-300"
          }`}
        >
          ★
        </span>
      ))}
    </div>
  );
};

export default Rating;