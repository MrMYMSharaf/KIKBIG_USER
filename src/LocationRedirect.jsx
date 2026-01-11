import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setCountry } from "./features/redux/countrySlice";

export default function LocationRedirect() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const storedCountry = useSelector((state) => state.country?.country);
  const [isDetecting, setIsDetecting] = useState(false);

  useEffect(() => {
    const detectLocationFromIP = async () => {
      if (isDetecting) return;
      setIsDetecting(true);

      try {
        console.log("🔍 Detecting location from IP (client-side)...");

        let country = null;
        let detectedIP = null;

        // Fetch from multiple client-side services in parallel
        const detectionPromises = [
          fetch("https://ipapi.co/json/")
            .then(res => res.json())
            .then(data => ({
              service: "ipapi.co",
              country: data.country_name?.toLowerCase().replace(/\s+/g, "-"),
              ip: data.ip,
              city: data.city,
              region: data.region,
            }))
            .catch(() => null),

          fetch("https://ipwho.is/")
            .then(res => res.json())
            .then(data => ({
              service: "ipwho.is",
              country: data.country?.toLowerCase().replace(/\s+/g, "-"),
              ip: data.ip,
              city: data.city,
              region: data.region,
            }))
            .catch(() => null),

          fetch("https://ipinfo.io/json")
            .then(res => res.json())
            .then(data => ({
              service: "ipinfo.io",
              country: data.country?.toLowerCase(),
              ip: data.ip,
              city: data.city,
              region: data.region,
            }))
            .catch(() => null),
        ];

        const results = await Promise.allSettled(detectionPromises);

        // Take the first successful detection
        for (const result of results) {
          if (result.status === "fulfilled" && result.value?.country) {
            const data = result.value;
            console.log(`✓ ${data.service} detected:`, data);
            country = data.country;
            detectedIP = data.ip;
            break;
          }
        }

        if (!country) {
          throw new Error("All IP detection services failed");
        }

        localStorage.setItem("detectedIP", detectedIP);
        handleCountryDetection(country);
      } catch (error) {
        console.error("❌ Location detection failed:", error);
        handleCountryDetection("sri-lanka");
      } finally {
        setIsDetecting(false);
      }
    };

    const handleCountryDetection = (detectedCountry) => {
      const supported = [
        "sri-lanka", "uae", "saudi-arabia", "qatar", "oman", "kuwait", "bahrain",
        "india", "bangladesh", "pakistan", "nepal", "malaysia", "singapore",
        "afghanistan", "australia", "maldives", "united-kingdom", "thailand",
        "indonesia", "south-africa", "egypt", "turkey", "japan", "usa", "canada",
        "germany", "france", "ireland", "south-korea", "brazil",
      ];

      const fallbackMap = {
        // ISO codes
        lk: "sri-lanka", ae: "uae", sa: "saudi-arabia", qa: "qatar", om: "oman",
        kw: "kuwait", bh: "bahrain", in: "india", bd: "bangladesh", pk: "pakistan",
        np: "nepal", my: "malaysia", sg: "singapore", af: "afghanistan",
        au: "australia", mv: "maldives", gb: "united-kingdom", th: "thailand",
        id: "indonesia", za: "south-africa", eg: "egypt", tr: "turkey", jp: "japan",
        us: "usa", ca: "canada", de: "germany", fr: "france", ie: "ireland",
        kr: "south-korea", br: "brazil",
        // Full names
        "sri-lanka": "sri-lanka", "united-arab-emirates": "uae", "saudi-arabia": "saudi-arabia",
        "qatar": "qatar", "oman": "oman", "kuwait": "kuwait", "bahrain": "bahrain",
        "india": "india", "bangladesh": "bangladesh", "pakistan": "pakistan",
        "nepal": "nepal", "malaysia": "malaysia", "singapore": "singapore",
        "afghanistan": "afghanistan", "australia": "australia", "maldives": "maldives",
        "united-kingdom": "united-kingdom", "thailand": "thailand", "indonesia": "indonesia",
        "south-africa": "south-africa", "egypt": "egypt", "turkey": "turkey", "japan": "japan",
        "usa": "usa", "canada": "canada", "germany": "germany", "france": "france",
        "ireland": "ireland", "south-korea": "south-korea", "brazil": "brazil",
      };

      let finalCountry = detectedCountry;

      if (!supported.includes(detectedCountry) && fallbackMap[detectedCountry]) {
        finalCountry = fallbackMap[detectedCountry];
        console.log(`→ Mapping ${detectedCountry} to ${finalCountry}`);
      } else if (!supported.includes(detectedCountry)) {
        finalCountry = "sri-lanka";
        console.log("⚠ Country not found, using default: sri-lanka");
      } else {
        console.log("✓ Country directly supported:", detectedCountry);
      }

      // Save to Redux & localStorage
      dispatch(setCountry(finalCountry));
      localStorage.setItem("detectedCountry", finalCountry);
      localStorage.setItem("lastDetectionTime", Date.now().toString());

      // Redirect if needed
      const pathCountry = location.pathname.split("/")[1];
      if (!location.pathname.includes("/viewallads/") || pathCountry !== finalCountry) {
        console.log(`→ Redirecting from ${pathCountry} to ${finalCountry}`);
        navigate(`/${finalCountry}/viewallads`, { replace: true });
      }
    };

    const shouldDetect = () => {
      if (isDetecting) return false;

      const lastDetectionTime = localStorage.getItem("lastDetectionTime");
      const cachedCountry = localStorage.getItem("detectedCountry");
      const oneHour = 60 * 60 * 1000;

      if (lastDetectionTime && cachedCountry && Date.now() - parseInt(lastDetectionTime) < oneHour) {
        console.log("✓ Using cached country:", cachedCountry);
        dispatch(setCountry(cachedCountry));

        const pathCountry = location.pathname.split("/")[1];
        if (!location.pathname.includes("/viewallads/") || pathCountry !== cachedCountry) {
          navigate(`/${cachedCountry}/viewallads/`, { replace: true });
        }
        return false;
      }

      return true;
    };

    if (shouldDetect()) {
      console.log("🚀 Starting IP-based location detection...");
      detectLocationFromIP();
    } else if (storedCountry && storedCountry !== "null") {
      const pathCountry = location.pathname.split("/")[1];
      if (!location.pathname.includes("/viewallads/") || pathCountry !== storedCountry) {
        console.log("→ Syncing URL with stored country:", storedCountry);
        navigate(`/${storedCountry}/viewallads/`, { replace: true });
      }
    }
  }, [dispatch, navigate, location.pathname, storedCountry, isDetecting]);

  return null;
}
