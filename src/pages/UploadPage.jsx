import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Loading from "../components/Loading";
import "../App.css";

function UploadPage() {
  const navigate = useNavigate();
  const [cloth, setCloth] = useState(null);
  const [person, setPerson] = useState(null);
  const [result, setResult] = useState(null);

  const handleClothUpload = (e) => {
    const file = e.target.files[0];
    setCloth(file);
  };

  const handlePersonUpload = (e) => {
    const file = e.target.files[0];
    setPerson(file);
  };

  // const handleTryOn = async () => {

  //   if (!cloth || !person) {
  //     alert("이미지를 모두 업로드하세요");
  //     return;
  //   }

  //   const formData = new FormData();
  //   formData.append("cloth", cloth);
  //   formData.append("person", person);

  //   try {

  //     const response = await fetch(
  //       "http://localhost:8080/api/fitting/tryon",
  //       {
  //         method: "POST",
  //         body: formData
  //       }
  //     );

  //     const blob = await response.blob();
  //     setResult(URL.createObjectURL(blob));

  //   } catch (error) {

  //     console.error(error);
  //     alert("AI 피팅 실패");

  //   }
  // };
  
  const handleTryOn = async () => {

    if (!cloth || !person) {
      alert("이미지를 모두 업로드하세요");
      return;
    }

    const result = URL.createObjectURL(person);

    navigate("/result", {
      state: { person, cloth, result }
    });
  };

  return (

    <div className="container">

      <h1 className="title">✨ 가상 피팅 서비스</h1>
      <p className="subtitle">AI 기반 가상 피팅으로 옷을 입어보세요</p>

      <div className="steps">

        <div className="step">1 옷 사진 업로드</div>
        <div className="arrow">→</div>
        <div className="step">2 내 사진 업로드</div>
        <div className="arrow">→</div>
        <div className="step">3 AI 피팅</div>
        <div className="arrow">→</div>
        <div className="step">4 결과 확인</div>

      </div>

      <div className="upload-section">

        <div className="card">

          <h3>1. 옷 사진 업로드</h3>
          <p>입어보고 싶은 상의 사진을 업로드하세요</p>

          <label className="upload-box">

            <input type="file" onChange={handleClothUpload} />

            {cloth ? (
              <img src={URL.createObjectURL(cloth)} alt="cloth"/>
            ) : (
              <div className="upload-text">
                클릭하거나 이미지를 드래그하세요
                <br/>
                PNG, JPG 지원
              </div>
            )}

          </label>

        </div>

        <div className="card">

          <h3>2. 내 사진 업로드</h3>
          <p>상반신이 보이는 정면 사진을 업로드하세요</p>

          <label className="upload-box">

            <input type="file" onChange={handlePersonUpload} />

            {person ? (
              <img src={URL.createObjectURL(person)} alt="person"/>
            ) : (
              <div className="upload-text">
                클릭하거나 이미지를 드래그하세요
                <br/>
                PNG, JPG 지원
              </div>
            )}

          </label>

        </div>

      </div>

      <button className="tryon-btn" onClick={handleTryOn}>
        AI 피팅 실행
      </button>

    </div>
  );
}

export default UploadPage;