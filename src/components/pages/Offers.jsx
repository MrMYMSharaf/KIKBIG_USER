import React, { useState, useEffect, useRef } from "react";
import OfferSlider from "../shared/card/OfferSlider";
import AdsCard from "../shared/card/AdsCard";
import { FaTh, FaBars } from "react-icons/fa";
import { useGetAllAdvertisementsOffersQuery } from "../../features/postadsSlice";
import { useNavigate } from "react-router-dom";
import AdvertisementSkeleton from "../component/SkeletonLoading/advertisementSkeleton.jsx";

const Offers = () => {
  const [layout, setLayout] = useState("grid");
  const [page, setPage] = useState(1);
  const [allAds, setAllAds] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const { data, isLoading, isError } = useGetAllAdvertisementsOffersQuery({ page, limit: 12 });
  const navigate = useNavigate();
  const observerTarget = useRef(null);

  const sidebarAds = [
    "/ads/160_600.png",
    "/ads/250_250.png",
    "/ads/300_600.png",
    "/ads/336_280.png",
  ];

  const toggleLayout = (newLayout) => setLayout(newLayout);

  useEffect(() => {
    if (isError) navigate("/");
  }, [isError, navigate]);

  // Append new data when it loads
  useEffect(() => {
    if (data?.data) {
      setAllAds((prev) => {
        const newAds = data.data.filter(
          (ad) => !prev.some((existingAd) => existingAd._id === ad._id)
        );
        return [...prev, ...newAds];
      });

      if (data.pagination) {
        setHasMore(page < data.pagination.totalPages);
      }
    }
  }, [data, page]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) observer.observe(observerTarget.current);

    return () => {
      if (observerTarget.current) observer.unobserve(observerTarget.current);
    };
  }, [hasMore, isLoading]);

  // Sponsored ads auto-loop
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 1) % sidebarAds.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Inject demo ad placeholders every 4 ads
  const withDemoAds = (ads) => {
    const updated = [];
    ads.forEach((ad, index) => {
      updated.push(ad);
      if ((index + 1) % 4 === 0) {
        updated.push({ _id: `demo-ad-${index}`, isDemoAd: true });
      }
    });
    return updated;
  };

  const adsWithDemos = withDemoAds(allAds);

  if (isError) return <div>Failed to load offers.</div>;
  if (!allAds.length && isLoading) return <AdvertisementSkeleton layout={layout} count={12} />;

  return (
    <div className="flex flex-col md:flex-row w-full h-full overflow-hidden">
      {/* Main Offers Section */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {/* Offer Slider */}
          <div className="mb-4">
            <OfferSlider />
          </div>

          {/* Top Banner Ad */}
          <div className="w-full flex justify-center mb-4">
            <img
              src="/ads/728_90.png"
              alt="Top Banner Ad"
              className="rounded-lg border border-gray-200"
            />
          </div>

          {/* Layout Controls */}
          <div className="flex justify-between mb-4">
            <h1 className="text-2xl font-bold">View All Offers</h1>
            <div className="flex flex-row">
              <FaTh
                onClick={() => toggleLayout("grid")}
                className={`cursor-pointer mx-2 ${layout === "grid" ? "text-blue-500" : ""}`}
              />
              <FaBars
                onClick={() => toggleLayout("list")}
                className={`cursor-pointer mx-2 ${layout === "list" ? "text-blue-500" : ""}`}
              />
            </div>
          </div>

          {/* Ads grid */}
          <div
            className={`grid ${
              layout === "grid"
                ? "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                : "grid-cols-1 gap-2"
            }`}
          >
            {adsWithDemos.map((ad) =>
              ad.isDemoAd ? (
                <div
                  key={ad._id}
                  className="flex justify-center items-center border border-gray-200 rounded-lg bg-gray-50 p-2"
                >
                  <img
                    src={`/ads/${
                      ["250_250", "300_250", "336_280"][Math.floor(Math.random() * 3)]
                    }.png`}
                    alt="Demo Ad"
                    className="rounded-md"
                  />
                </div>
              ) : (
                <AdsCard
                  key={ad._id}
                  layout={layout}
                  title={ad.title}
                  image={ad.images?.[0] || ad.image || ""}
                  description={ad.description}
                  id={ad._id}
                  category={ad.category}
                  childCategory={ad.childCategory}
                />
              )
            )}
          </div>

          {/* Infinite Scroll Loader */}
          {isLoading && page > 1 && (
            <div className="py-4">
              <AdvertisementSkeleton layout={layout} count={4} />
            </div>
          )}

          {hasMore && <div ref={observerTarget} className="h-10" />}

          {!hasMore && allAds.length > 0 && (
            <div className="text-center py-4 text-gray-500">
              No more offers to load
            </div>
          )}
        </div>
      </div>

      {/* Sidebar Ads — Auto Loop */}
      <div className="hidden lg:flex w-[25%] md:w-[15%] bg-white flex-col justify-start items-center sticky top-0 h-screen p-4">
        <h2 className="text-lg font-semibold mb-4">Sponsored</h2>
        <div className="relative w-full flex justify-center items-center bg-gray-100 border border-gray-200 rounded-lg h-[600px] overflow-hidden">
          {sidebarAds.map((src, index) => (
            <img
              key={src}
              src={src}
              alt="Sponsored Ad"
              className={`absolute rounded-lg transition-opacity duration-700 ease-in-out ${
                index === currentAdIndex ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Offers;