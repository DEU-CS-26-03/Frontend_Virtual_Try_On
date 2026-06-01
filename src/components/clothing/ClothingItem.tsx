import { useNavigate } from "react-router-dom";

const ClothingItem = ({ image }: { image: string }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/fitting", { state: { cloth: image } });
  };

  return (
    <img
      src={image}
      onClick={handleClick}
      className="cursor-pointer rounded-xl"
    />
  );
};

export default ClothingItem;