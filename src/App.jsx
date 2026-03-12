import { useState } from "react";
import "./App.css";

function App() {

  const [personImage, setPersonImage] = useState(null);
  const [clothImage, setClothImage] = useState(null);
  const [resultImage, setResultImage] = useState(null);

  const handlePersonChange = (e) => {
    const file = e.target.files[0];
    setPersonImage(file);
  };

  const handleClothChange = (e) => {
    const file = e.target.files[0];
    setClothImage(file);
  };

  const handleTryOn = async () => {

    if (!personImage || !clothImage) {
      alert("사람 이미지와 옷 이미지를 업로드하세요");
      return;
    }

    const formData = new FormData();
    formData.append("person", personImage);
    formData.append("cloth", clothImage);

    try {
      const response = await fetch("http://localhost:8080/api/fitting/tryon", {
        method: "POST",
        body: formData
      });

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      setResultImage(imageUrl);

    } catch (error) {
      console.error(error);
      alert("가상 피팅 실패");
    }
  };

  return (
    <div className="container">

      <h1>Virtual Fitting</h1>

      <div className="upload-section">

        <div>
          <h3>사람 이미지</h3>
          <input type="file" onChange={handlePersonChange} />

          {personImage && (
            <img
              src={URL.createObjectURL(personImage)}
              alt="person"
              width="250"
            />
          )}
        </div>

        <div>
          <h3>옷 이미지</h3>
          <input type="file" onChange={handleClothChange} />

          {clothImage && (
            <img
              src={URL.createObjectURL(clothImage)}
              alt="cloth"
              width="250"
            />
          )}
        </div>

      </div>

      <button onClick={handleTryOn} className="tryon-btn">
        가상 피팅 실행
      </button>

      {resultImage && (
        <div className="result">
          <h2>피팅 결과</h2>
          <img src={resultImage} alt="result" width="400" />
        </div>
      )}

    </div>
  );
}

export default App;