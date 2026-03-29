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
<<<<<<< HEAD

export default ClothingItem;
=======
export default ClothingItem;
>>>>>>> aad0bc7938f5938a8d61fc67743f5a02564e4a49
