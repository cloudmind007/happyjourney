import { FC } from "react";

const LoaderModal: FC = () => {
  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-90">
      <div className="bg-white rounded-lg p-6 flex flex-col items-center">
        <div className="loader mb-4">
          <div className="w-10 h-10 border-4 border-t-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-gray-700">Wait for a moment</p>
      </div>
    </div>
  );
};

export default LoaderModal;
