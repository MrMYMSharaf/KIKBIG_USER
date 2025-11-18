import React from "react";
import { Link } from "react-router-dom";
import DOMPurify from "dompurify";
import getDisplayImage from "../../../functions/getDisplayImage";

const AdsCard = ({ layout, title, description, image, id, category, childCategory }) => {
  const safeToString = (val) => {
    if (!val) return "";
    if (typeof val === "string") return val;
    if (typeof val === "object") {
      if (val.name) return val.name;
      return JSON.stringify(val);
    }
    return String(val);
  };

  const titleText = safeToString(title).toLowerCase();
  const desc = safeToString(description).toLowerCase();

  // ✅ Get image using helper (ID-aware)
  const finalImage = getDisplayImage({ image, category, childCategory, titleText, desc });

  // ✅ Responsive layout classes
  const cardClass =
    layout === "grid"
      ? "relative flex flex-col bg-white border border-gray-200 rounded-lg shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 h-full"
      : "relative flex flex-col sm:flex-row bg-white border border-gray-200 rounded-lg shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 h-full";

  const imgClass =
    layout === "grid"
      ? "object-cover w-full h-48 rounded-t-lg"
      : "object-cover w-full sm:w-48 h-48 sm:h-full rounded-t-lg sm:rounded-none sm:rounded-l-lg";

  const cleanHTML = DOMPurify.sanitize(description);
  const shortDescription =
    cleanHTML.length > 100 ? cleanHTML.slice(0, 100) + "..." : cleanHTML;

  return (
    <div className={cardClass}>
      {/* 🖼️ Image Section */}
      <div className="relative">
        <a href="#" className="flex-shrink-0">
          <img className={imgClass} src={finalImage} alt="Ad" />
        </a>
        <button className="absolute top-2 right-2 bg-white bg-opacity-50 text-gray-700 rounded-full p-1 hover:text-red-500 hover:bg-gray-100 transition-all">
          <i className="fa-regular fa-heart"></i>
        </button>
      </div>

      {/* 📄 Content Section */}
      <div className="p-5 flex flex-col flex-grow justify-between leading-normal">
        <div>
          <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white min-h-[56px]">
            {title.length > 52 ? title.slice(0, 52) + "..." : title}
          </h5>

          <div
            className="mb-3 font-normal text-gray-700 dark:text-gray-400 line-clamp-3 min-h-[60px]"
            dangerouslySetInnerHTML={{ __html: shortDescription }}
          />
        </div>

        {/* 📎 Button — Always Pinned at Bottom */}
        <div className="mt-auto pt-2">
          <Link
            to={`/AdDetailPage/${id}`}
            className="inline-flex items-center justify-center w-full px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Read more
            <svg
              className="rtl:rotate-180 w-3.5 h-3.5 ms-2"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 14 10"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M1 5h12m0 0L9 1m4 4L9 9"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdsCard;
