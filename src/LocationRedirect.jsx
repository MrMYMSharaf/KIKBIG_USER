import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCountry } from "./features/redux/countrySlice";

export default function LocationRedirect() {
  const dispatch = useDispatch();
  const storedCountry = useSelector((state) => state.country?.country);
  const [detecting, setDetecting] = useState(false);

  useEffect(() => {
    // Skip if we already have a valid country or currently detecting
    if (detecting || (storedCountry && storedCountry !== "null")) {
      return;
    }

    // Check if we have a recent cached detection (within 1 hour)
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
      return;
    }

    // Run detection
    detectLocation();

    async function detectLocation() {
      setDetecting(true);
      console.log("🔍 Detecting location...");

      try {
        // Try multiple IP geolocation services in parallel
        const results = await Promise.allSettled([
          fetch("https://ipapi.co/json/").then(r => r.json()),
          fetch("https://ipwho.is/").then(r => r.json()),
          fetch("https://ipinfo.io/json").then(r => r.json()),
        ]);

        // Get first successful result
        let detectedCountry = null;
        
        for (const result of results) {
          if (result.status === "fulfilled") {
            const data = result.value;
            
            // Extract country from different API formats
            const country = (
              data.country_name?.toLowerCase().replace(/\s+/g, "-") || // ipapi.co
              data.country?.toLowerCase().replace(/\s+/g, "-") ||       // ipwho.is
              data.country?.toLowerCase()                                // ipinfo.io (ISO code)
            );

            if (country) {
              detectedCountry = country;
              console.log("✓ Detected:", country);
              break;
            }
          }
        }

        if (!detectedCountry) {
          throw new Error("All services failed");
        }

        // Map to supported countries
        const finalCountry = mapCountry(detectedCountry);
        
        console.log("🌍 Final country:", finalCountry);
        
        // Save to Redux and cache
        dispatch(setCountry(finalCountry));
        localStorage.setItem("detectedCountry", finalCountry);
        localStorage.setItem("lastDetectionTime", Date.now().toString());

      } catch (error) {
        console.error("❌ Detection failed:", error);
        // Default to Sri Lanka on error
        dispatch(setCountry("sri-lanka"));
        localStorage.setItem("detectedCountry", "sri-lanka");
        localStorage.setItem("lastDetectionTime", Date.now().toString());
      } finally {
        setDetecting(false);
      }
    }

    function mapCountry(detected) {
      const supported = [
        "sri-lanka", "uae", "saudi-arabia", "qatar", "oman", "kuwait", "bahrain",
        "india", "bangladesh", "pakistan", "nepal", "malaysia", "singapore",
        "afghanistan", "australia", "maldives", "united-kingdom", "thailand",
        "indonesia", "south-africa", "egypt", "turkey", "japan", "usa", "canada",
        "germany", "france", "ireland", "south-korea", "brazil",
      ];

      // Direct match
      if (supported.includes(detected)) {
        return detected;
      }

      // Country mapping (ISO codes and variations)
      const countryMap = {
        // ISO codes
        "lk": "sri-lanka",
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
        // Variations
        "united-arab-emirates": "uae",
        "united-states": "usa",
        "uk": "united-kingdom",
        // Regional fallbacks
        "philippines": "malaysia",
        "vietnam": "thailand",
        "myanmar": "thailand",
        "cambodia": "thailand",
        "laos": "thailand",
        "brunei": "malaysia",
        "bhutan": "india",
        "iran": "uae",
        "iraq": "kuwait",
        "israel": "uae",
        "jordan": "saudi-arabia",
        "lebanon": "uae",
        "syria": "uae",
        "yemen": "oman",
        "palestine": "uae",
        "china": "japan",
        "taiwan": "japan",
        "mongolia": "japan",
        "new-zealand": "australia",
        "fiji": "australia",
        "papua-new-guinea": "australia",
        "italy": "france",
        "spain": "france",
        "portugal": "france",
        "netherlands": "france",
        "belgium": "france",
        "switzerland": "germany",
        "austria": "germany",
        "poland": "germany",
        "norway": "united-kingdom",
        "sweden": "united-kingdom",
        "denmark": "united-kingdom",
        "mexico": "usa",
        "colombia": "brazil",
        "argentina": "brazil",
        "chile": "brazil",
        "peru": "brazil",
      };

      return countryMap[detected] || "sri-lanka";
    }
  }, [detecting, storedCountry, dispatch]);

  return null; // This component doesn't render anything
}