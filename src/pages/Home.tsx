import ClothingList from "../components/clothing/ClothingList";

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-6 text center">의류 선택</h1>
      <ClothingList />
    </div>
  );
};

export default Home;