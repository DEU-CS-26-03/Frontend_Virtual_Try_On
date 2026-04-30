// src/pages/Home.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/layout/Header";
import FavoriteButton from "../components/favorite/FavoriteButton";
import { createImagePresign, uploadByToken } from "../api/uploadApi";
import { createGarment, getGarments, type GarmentItem } from "../api/garmentApi";

const categories = ["all", "top", "bottom", "outer"];

const Home = () => {
  const navigate = useNavigate();

  const [category, setCategory] = useState("all");
  const [garments, setGarments] = useState<GarmentItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadCategory, setUploadCategory] = useState("top");
  const [brandName, setBrandName] = useState("");
  const [uploading, setUploading] = useState(false);

  const loadGarments = async (selectedCategory = "all") => {
    try {
      setLoading(true);
      const data = await getGarments(selectedCategory);
      setGarments(data);
    } catch (error) {
      console.error("의류 목록 조회 실패:", error);
      alert("의류 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGarments(category);
  }, [category]);

  const filteredGarments = useMemo(() => {
    if (category === "all") return garments;
    return garments.filter((item) => item.category === category);
  }, [category, garments]);

  const handleRegisterGarment = async () => {
    if (!uploadFile) {
      alert("업로드할 의류 이미지를 선택해주세요.");
      return;
    }

    try {
      setUploading(true);

      const presign = await createImagePresign();
      const uploaded = await uploadByToken(presign.uploadToken, uploadFile);

      await createGarment({
        fileUrl: uploaded.fileUrl,
        category: uploadCategory,
        brandName: brandName.trim(),
      });

      alert("의류 등록이 완료되었습니다.");
      setUploadFile(null);
      setBrandName("");
      setUploadCategory("top");
      await loadGarments(category);
    } catch (error) {
      console.error("의류 등록 실패:", error);
      alert("의류 등록에 실패했습니다.");
    } finally {
      setUploading(false);
    }
  };

  const handleSelectGarment = (item: GarmentItem) => {
    navigate("/fitting", {
      state: {
        cloth: item.fileUrl,
        garmentId: item.id,
      },
    });
  };

  return (
      <div className="min-h-screen bg-[#F5F5F3]">
        <Header />

        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="mb-14">
            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-[#111111]">
              Virtual Try-On
            </h1>
            <p className="mt-3 text-gray-500 font-medium">
              의류를 선택하거나 직접 등록해서 피팅을 시작하세요.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 mb-14">
            <h2 className="text-xl font-black mb-6">로컬 의상 등록</h2>

            <div className="grid md:grid-cols-4 gap-4">
              <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
                  className="block w-full rounded-xl border border-gray-200 px-4 py-3 bg-white"
              />

              <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  className="rounded-xl border border-gray-200 px-4 py-3 bg-white"
              >
                <option value="top">TOP</option>
                <option value="bottom">BOTTOM</option>
                <option value="outer">OUTER</option>
              </select>

              <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="브랜드명 (선택)"
                  className="rounded-xl border border-gray-200 px-4 py-3"
              />

              <button
                  onClick={handleRegisterGarment}
                  disabled={uploading}
                  className="rounded-xl bg-[#111111] text-white font-bold px-6 py-3 hover:bg-gray-800 disabled:bg-gray-300"
              >
                {uploading ? "등록 중..." : "의류 등록"}
              </button>
            </div>

            {uploadFile && (
                <p className="mt-4 text-sm text-gray-500">
                  선택 파일: {uploadFile.name}
                </p>
            )}
          </div>

          <div className="flex justify-center gap-3 mb-12 flex-wrap">
            {categories.map((c) => (
                <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className={`px-6 py-3 rounded-full text-sm font-black transition-all ${
                        category === c
                            ? "bg-black text-white shadow-xl scale-105"
                            : "bg-white text-gray-400 border border-gray-100 hover:bg-gray-50"
                    }`}
                >
                  {c.toUpperCase()}
                </button>
            ))}
          </div>

          {loading ? (
              <div className="py-20 text-center text-gray-400 font-bold">
                상품 목록을 불러오는 중입니다.
              </div>
          ) : filteredGarments.length === 0 ? (
              <div className="py-20 text-center text-gray-400 font-bold border-2 border-dashed border-gray-200 rounded-3xl bg-white">
                등록된 의류가 없습니다.
              </div>
          ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {filteredGarments.map((item) => (
                    <div
                        key={item.id}
                        onClick={() => handleSelectGarment(item)}
                        className="relative rounded-[2rem] overflow-hidden cursor-pointer group transition-all duration-500 bg-white border border-gray-100 hover:shadow-2xl"
                    >
                      <FavoriteButton garmentId={item.id} />
                      <img
                          src={item.fileUrl}
                          alt={item.brandName || "garment"}
                          className="w-full h-[420px] object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="p-4">
                        <p className="text-[11px] font-black tracking-widest text-gray-400 uppercase">
                          {item.category}
                        </p>
                        <h3 className="text-base font-bold text-[#111111] mt-1">
                          {item.brandName || "등록 의상"}
                        </h3>
                      </div>
                    </div>
                ))}
              </div>
          )}
        </div>
      </div>
  );
};

export default Home;