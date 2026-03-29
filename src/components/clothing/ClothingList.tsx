import { useState } from "react";
import { useNavigate } from "react-router-dom";

const dummyData = [
  { garment_id: "gar_001", file_url: "https://via.placeholder.com/400x500?text=Top+1", category: "top" },
  { garment_id: "gar_002", file_url: "https://via.placeholder.com/400x500?text=Top+2", category: "top" },
  { garment_id: "gar_003", file_url: "https://via.placeholder.com/400x500?text=Bottom+1", category: "bottom" },
  { garment_id: "gar_004", file_url: "https://via.placeholder.com/400x500?text=Outer+1", category: "outer" },
];

const categories = ["all", "top", "bottom", "outer"];

const ClothingList = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);
  const [category, setCategory] = useState("all");

  const filtered = category === "all" ? dummyData : dummyData.filter((item) => item.category === category);

  return (
    <div>
      <div className="flex justify-center gap-4 mb-10">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition ${
              category === c ? "bg-black text-white shadow-lg" : "bg-white text-gray-600 border hover:bg-gray-100"
            }`}
          >
            {c.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {filtered.map((item) => (
          <div
            key={item.garment_id}
            className={`relative rounded-3xl overflow-hidden cursor-pointer group transition ${
              selected === item.garment_id ? "ring-4 ring-black scale-105" : "hover:scale-105"
            }`}
            onClick={() => {
              setSelected(item.garment_id);
              setTimeout(() => {
                navigate("/fitting", {
                  state: { cloth: item.file_url, garmentId: item.garment_id },
                });
              }, 200);
            }}
          >
            <img src={item.file_url} className="w-full h-80 object-cover" alt="clothes" />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
              <span className="text-white font-bold">선택하기</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClothingList;


// 결과 UI 확인 위해 기존 코드 주석처리
// import { useState } from "react";
// import { useNavigate } from "react-router-dom";

// const dummyData = [
//   { garment_id: "gar_001", file_url: "https://via.placeholder.com/400x500", category: "top" },
//   { garment_id: "gar_002", file_url: "https://via.placeholder.com/400x500", category: "top" },
//   { garment_id: "gar_003", file_url: "https://via.placeholder.com/400x500", category: "top" },
//   { garment_id: "gar_004", file_url: "https://via.placeholder.com/400x500", category: "top" },
// ];

// const categories = ["all", "top", "bottom", "outer"];

// const ClothingList = () => {
//   const navigate = useNavigate();
//   const [selected, setSelected] = useState<string | null>(null);
//   const [category, setCategory] = useState("all");

//   const filtered = category === "all" ? dummyData : dummyData.filter((item) => item.category === category);

//   return (
//     <div>
//       <div className="flex justify-center gap-4 mb-10">
//         {categories.map((c) => (
//           <button
//             key={c}
//             onClick={() => setCategory(c)}
//             className={`px-5 py-2 rounded-full text-sm font-medium transition ${
//               category === c ? "bg-black text-white shadow-lg" : "bg-white text-gray-600 border hover:bg-gray-100"
//             }`}
//           >
//             {c.toUpperCase()}
//           </button>
//         ))}
//       </div>

//       <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
//         {filtered.map((item) => (
//           <div
//             key={item.garment_id}
//             className={`relative rounded-3xl overflow-hidden cursor-pointer group transition ${
//               selected === item.garment_id ? "ring-4 ring-black scale-105" : "hover:scale-105"
//             }`}
//             onClick={() => {
//               setSelected(item.garment_id);
//               setTimeout(() => {
//                 navigate("/fitting", {
//                   state: { 
//                     cloth: item.file_url,      // 이미지 주소만 전달
//                     garmentId: item.garment_id // ID 전달
//                   },
//                 });
//               }, 200);
//             }}
//           >
//             <img src={item.file_url} className="w-full h-80 object-cover transition duration-500 group-hover:scale-110" />
//             <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition" />
//             <div className="absolute bottom-0 w-full p-4 text-white opacity-0 group-hover:opacity-100 transition">
//               <p className="text-sm">{item.category}</p>
//               <p className="font-semibold">Modern Fit</p>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default ClothingList;