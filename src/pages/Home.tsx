import ClothingList from "../components/clothing/ClothingList";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 p-10">

      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          Virtual Fitting
        </h1>
        <p className="text-gray-500 mt-3 text-lg">
          당신에게 어울리는 스타일을 찾아보세요
        </p>
      </div>

      <ClothingList />
    </div>
  );
};

export default Home;