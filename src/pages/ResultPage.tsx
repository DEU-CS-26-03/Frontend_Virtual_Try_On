import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  createTryonJob,
  getTryonJobStatus,
} from "../api/tryonApi";
import { getResultById } from "../api/resultsApi";

const Result = () => {
  const location = useLocation();

  const { garmentId, userImageId, preview } =
    location.state || {};

  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    if (!garmentId || !userImageId) return;

    let interval: ReturnType<typeof setInterval>;

    const start = async () => {
      // 🔥 1. 작업 생성
      const job = await createTryonJob(userImageId, garmentId);

      // 🔥 2. 상태 polling
      interval = setInterval(async () => {
        const status = await getTryonJobStatus(job.tryon_id);

        if (status.status === "completed") {
          clearInterval(interval);

          // 🔥 3. result 조회
          const resultData = await getResultById(status.result_id);

          setResult(
            `http://localhost:8000${resultData.result_url}`
          );
        }
      }, 2000);
    };

    start();

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-10">
      <h1 className="text-2xl font-bold text-center mb-8">
        피팅 결과
      </h1>

      <div className="grid md:grid-cols-2 gap-10">

        {/* Before */}
        <div className="bg-white p-6 rounded-2xl shadow">
          <p className="mb-3 font-medium">Before</p>
          <img
            src={preview}
            className="w-full h-96 object-cover rounded-xl"
          />
        </div>

        {/* After */}
        <div className="bg-white p-6 rounded-2xl shadow">
          <p className="mb-3 font-medium">After</p>

          {result ? (
            <img
              src={result}
              className="w-full h-96 object-cover rounded-xl"
            />
          ) : (
            <div className="h-96 flex items-center justify-center text-gray-400">
              🔄 AI 처리중...
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Result;