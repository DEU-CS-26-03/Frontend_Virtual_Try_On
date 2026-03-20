import { useLocation, useNavigate } from "react-router-dom";

function ResultPage() {

  const location = useLocation();
  const { person, result } = location.state || {};

  if (!result) return <div>결과 없음</div>;

  return (
    <div style={{ textAlign: "center", padding: "40px" }}>

      <h1>피팅 결과</h1>

      <div style={{ display: "flex", justifyContent: "center", gap: "40px" }}>

        <div>
          <h3>Before</h3>
          {/* <img src={URL.createObjectURL(person)} width="300" /> */}
          <img src={person ? URL.createObjectURL(person) : ""} />
        </div>

        <div>
          <h3>After</h3>
          <img src={result} width="300" />
        </div>

      </div>

    </div>
  );
}

export default ResultPage;