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

        // Try multiple services in parallel for faster detection
        const detectionPromises = [
          // Service 1: ipapi.co
          fetch("https://ipapi.co/json/")
            .then(res => res.json())
            .then(data => ({
              service: "ipapi.co",
              country: data.country_name?.toLowerCase().replace(/\s+/g, "-"),
              ip: data.ip,
              city: data.city,
              region: data.region
            }))
            .catch(() => null),

          // Service 2: ipwho.is  
          fetch("https://ipwho.is/")
            .then(res => res.json())
            .then(data => ({
              service: "ipwho.is",
              country: data.country?.toLowerCase().replace(/\s+/g, "-"),
              ip: data.ip,
              city: data.city,
              region: data.region
            }))
            .catch(() => null),

          // Service 3: ipinfo.io
          fetch("https://ipinfo.io/json")
            .then(res => res.json())
            .then(data => ({
              service: "ipinfo.io",
              country: data.country?.toLowerCase(),
              ip: data.ip,
              city: data.city,
              region: data.region
            }))
            .catch(() => null),
        ];

        // Wait for all services (race them)
        const results = await Promise.allSettled(detectionPromises);
        
        // Get the first successful result
        for (const result of results) {
          if (result.status === "fulfilled" && result.value?.country) {
            const data = result.value;
            console.log(`✓ ${data.service} detected:`, {
              country: data.country,
              ip: data.ip,
              city: data.city,
              region: data.region
            });
            
            country = data.country;
            detectedIP = data.ip;
            break;
          }
        }

        if (!country) {
          throw new Error("All IP detection services failed");
        }

        // Store detected IP to compare later
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
        "sri-lanka",
        "uae",
        "saudi-arabia",
        "qatar",
        "oman",
        "kuwait",
        "bahrain",
        "india",
        "bangladesh",
        "pakistan",
        "nepal",
        "malaysia",
        "singapore",
        "afghanistan",
        "australia",
        "maldives",
        "united-kingdom",
        "thailand",
        "indonesia",
        "south-africa",
        "egypt",
        "turkey",
        "japan",
        "usa",
        "canada",
        "germany",
        "france",
        "ireland",
        "south-korea",
        "brazil",
      ];

      const fallbackMap = {
        "lk": "sri-lanka", // ISO code
        "ae": "uae",
        "sa": "saudi-arabia",
        "qa": "qatar",
        "om": "oman",
        "kw": "kuwait",
        "bh": "bahrain",
        "in": "india",
        "bd": "bangladesh",
        "pk": "pakistan",
        "np": "nepal",
        "my": "malaysia",
        "sg": "singapore",
        "af": "afghanistan",
        "au": "australia",
        "mv": "maldives",
        "gb": "united-kingdom",
        "th": "thailand",
        "id": "indonesia",
        "za": "south-africa",
        "eg": "egypt",
        "tr": "turkey",
        "jp": "japan",
        "us": "usa",
        "ca": "canada",
        "de": "germany",
        "fr": "france",
        "ie": "ireland",
        "kr": "south-korea",
        "br": "brazil",
        // Full names
        "afghanistan": "afghanistan",
        "bangladesh": "bangladesh",
        "bhutan": "india",
        "india": "india",
        "maldives": "maldives",
        "nepal": "nepal",
        "pakistan": "pakistan",
        "sri-lanka": "sri-lanka",
        "brunei": "malaysia",
        "cambodia": "thailand",
        "indonesia": "indonesia",
        "laos": "thailand",
        "malaysia": "malaysia",
        "myanmar": "thailand",
        "philippines": "malaysia",
        "singapore": "singapore",
        "thailand": "thailand",
        "vietnam": "thailand",
        "bahrain": "bahrain",
        "iran": "uae",
        "iraq": "kuwait",
        "israel": "uae",
        "jordan": "saudi-arabia",
        "kuwait": "kuwait",
        "lebanon": "uae",
        "oman": "oman",
        "qatar": "qatar",
        "saudi-arabia": "saudi-arabia",
        "syria": "uae",
        "uae": "uae",
        "united-arab-emirates": "uae",
        "yemen": "oman",
        "palestine": "uae",
        "china": "japan",
        "japan": "japan",
        "north-korea": "south-korea",
        "south-korea": "south-korea",
        "taiwan": "japan",
        "mongolia": "japan",
        "australia": "australia",
        "fiji": "australia",
        "new-zealand": "australia",
        "papua-new-guinea": "australia",
        "austria": "germany",
        "belgium": "france",
        "france": "france",
        "germany": "germany",
        "ireland": "ireland",
        "italy": "france",
        "netherlands": "france",
        "norway": "united-kingdom",
        "poland": "germany",
        "portugal": "france",
        "spain": "france",
        "sweden": "united-kingdom",
        "switzerland": "germany",
        "turkey": "turkey",
        "uk": "united-kingdom",
        "united-kingdom": "united-kingdom",
        "ukraine": "germany",
        "algeria": "egypt",
        "egypt": "egypt",
        "morocco": "egypt",
        "south-africa": "south-africa",
        "usa": "usa",
        "united-states": "usa",
        "canada": "canada",
        "mexico": "usa",
        "argentina": "brazil",
        "brazil": "brazil",
        "chile": "brazil",
        "colombia": "brazil",
      };

      let finalCountry = detectedCountry;

      if (supported.includes(detectedCountry)) {
        console.log("✓ Country directly supported:", detectedCountry);
      } else if (fallbackMap[detectedCountry]) {
        finalCountry = fallbackMap[detectedCountry];
        console.log(`→ Mapping ${detectedCountry} to ${finalCountry}`);
      } else {
        finalCountry = "sri-lanka";
        console.log("⚠ Country not found, using default: sri-lanka");
      }

      // Save to Redux
      console.log("🌍 Final country set to:", finalCountry);
      dispatch(setCountry(finalCountry));
      
      // Save to localStorage with timestamp
      localStorage.setItem("detectedCountry", finalCountry);
      localStorage.setItem("lastDetectionTime", Date.now().toString());

      // Redirect if needed
      const pathCountry = location.pathname.split("/")[1];
      if (!location.pathname.includes("/viewallads/") || pathCountry !== finalCountry) {
        console.log(`→ Redirecting from ${pathCountry} to ${finalCountry}`);
        navigate(`/${finalCountry}/viewallads`, { replace: true });
      }
    };

    // Check if we should run detection
    const shouldDetect = () => {
      if (isDetecting) return false;

      // Check cache (valid for 1 hour only)
      const lastDetectionTime = localStorage.getItem("lastDetectionTime");
      const cachedCountry = localStorage.getItem("detectedCountry");
      const oneHour = 60 * 60 * 1000;

      if (
        lastDetectionTime &&
        cachedCountry &&
        Date.now() - parseInt(lastDetectionTime) < oneHour
      ) {
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