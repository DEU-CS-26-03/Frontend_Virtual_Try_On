import { useNavigate } from "react-router-dom";

const clothes = [
  { id: 1, image: "/cloth1.jpg" },
  { id: 2, image: "/cloth2.jpg" },
  { id: 3, image: "/cloth3.jpg" },
  { id: 4, image: "/cloth4.jpg" },
];

const ClothingList = () => {
  const navigate = useNavigate();

  const handleClick = (cloth: string) => {
    navigate("/fitting", { state: { cloth } });
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {clothes.map((item) => (
        <div
          key={item.id}
          onClick={() => handleClick(item.image)}
          className="cursor-pointer bg-white rounded-2xl shadow hover:shadow-lg transition"
        >
          <img
            src={item.image}
            alt="cloth"
            className="w-full h-60 object-cover rounded-t-2xl"
          />

          <div className="p-3 text-center font-medium">
            의류 {item.id}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ClothingList;