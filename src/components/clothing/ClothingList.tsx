import { useState } from "react";
import { useNavigate } from "react-router-dom";

const dummyData = [
  {
    garment_id: "gar_001",
    file_url: "https://via.placeholder.com/400x500",
    category: "top",
  },
  {
    garment_id: "gar_002",
    file_url: "https://via.placeholder.com/400x500",
    category: "top",
  },
  {
    garment_id: "gar_003",
    file_url: "https://via.placeholder.com/400x500",
    category: "top",
  },
  {
    garment_id: "gar_004",
    file_url: "https://via.placeholder.com/400x500",
    category: "top",
  },
];

const categories = ["all", "top", "bottom", "outer"];

const ClothingList = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);
  const [category, setCategory] = useState("all");

  const filtered =
    category === "all"
      ? dummyData
      : dummyData.filter((item) => item.category === category);

  return (
    <div>
      {/* 🔥 카테고리 필터 */}
      <div className="flex justify-center gap-4 mb-10">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition
              ${
                category === c
                  ? "bg-black text-white shadow-lg"
                  : "bg-white text-gray-600 border hover:bg-gray-100"
              }`}
          >
            {c.toUpperCase()}
          </button>
        ))}
      </div>

      {/* 🔥 카드 리스트 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {filtered.map((item) => (
          <div
            key={item.garment_id}
            className={`relative rounded-3xl overflow-hidden cursor-pointer group transition
              ${
                selected === item.garment_id
                  ? "ring-4 ring-black scale-105"
                  : "hover:scale-105"
              }`}
            onClick={() => {
              setSelected(item.garment_id);

              // 0.2초 후 이동 (선택 느낌)
              setTimeout(() => {
                navigate("/fitting", {
                  state: { cloth: item },
                });
              }, 200);
            }}
          >
            {/* 이미지 */}
            <img
              src={item.file_url}
              className="w-full h-80 object-cover transition duration-500 group-hover:scale-110"
            />

            {/* 🔥 어두운 오버레이 */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition" />

            {/* 🔥 하단 정보 */}
            <div className="absolute bottom-0 w-full p-4 text-white opacity-0 group-hover:opacity-100 transition">
              <p className="text-sm">{item.category}</p>
              <p className="font-semibold">Modern Fit</p>
            </div>

            {/* 🔥 선택 체크 */}
            {selected === item.garment_id && (
              <div className="absolute top-3 right-3 bg-black text-white text-xs px-2 py-1 rounded-full">
                선택됨
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClothingList;

// import { useEffect, useState } from "react";
// import { getGarments } from "../../api/garmentApi";
// import { useNavigate } from "react-router-dom";

// const ClothingList = () => {
//   const [list, setList] = useState<any[]>([]);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const res = await getGarments({ category: "top" });

//         console.log("의류 데이터:", res);

//         // 🔥 핵심 수정
//         setList(res.items);
//       } catch (e) {
//         console.error(e);
//       }
//     };

//     fetchData();
//   }, []);

//   return (
//     <div className="grid grid-cols-3 gap-4">
//       {list.map((item) => (
//         <img
//           key={item.garment_id}
//           src={item.file_url}
//           className="rounded-xl cursor-pointer hover:scale-105 transition"
//           onClick={() =>
//             navigate("/fitting", {
//               state: { cloth: item }, // 🔥 핵심 수정
//             })
//           }
//         />
//       ))}
//     </div>
//   );
// };

// export default ClothingList;