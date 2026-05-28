const Footer = () => {
    return (
        <footer className="w-full bg-[#111111] text-gray-400 py-12 mt-auto border-t border-gray-800">
            <div className="max-w-[1600px] mx-auto px-10 flex flex-col md:flex-row justify-between items-center gap-6">

                {/* 좌측: 로고 및 프로젝트 정보 */}
                <div className="flex flex-col items-center md:items-start gap-4">
                    <div className="flex items-center gap-3 mb-1">
                        {/* public 폴더에 넣은 main_Banner.png를 불러옵니다. 어두운 배경에서 돋보이도록 흰색 배경과 라운드를 살짝 주었습니다. */}
                        <img
                            src="/main_Banner.png"
                            alt="VIRTUAL TRY-ON 로고"
                            className="w-10 h-10 object-contain bg-white rounded-xl p-1 shadow-md"
                        />
                        <h2 className="text-white text-xl font-[1000] tracking-widest uppercase">
                            VIRTUAL TRY-ON
                        </h2>
                    </div>
                    <div className="space-y-1 text-center md:text-left">
                        <p className="text-sm font-bold text-gray-300">클릭 한 번으로 완성되는 AI 가상 드레스룸 플랫폼</p>
                        <p className="text-xs font-medium text-gray-500">동의대학교 컴퓨터공학과 캡스톤디자인 수업 7조 졸업작품 프로젝트</p>
                    </div>
                </div>

                {/* 우측: 팀원 정보 및 카피라이트 */}
                <div className="flex flex-col items-center md:items-end gap-2 text-xs">
                    <div className="flex gap-4 font-bold text-gray-300 mb-1">
                        <p><span className="text-[#2563EB] mr-1">팀장</span>김두형</p>
                        <p><span className="text-[#2563EB] mr-1">팀원</span>김정현</p>
                        <p><span className="text-[#2563EB] mr-1">팀원</span>정연준</p>
                    </div>
                    <p>지도교수: 장시웅 교수님</p>
                    <p className="text-gray-500 mt-2">
                        Copyright © 2026 DEU CS Capstone Team 3. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;