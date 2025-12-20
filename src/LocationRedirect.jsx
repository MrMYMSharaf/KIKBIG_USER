import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setCountry } from "./features/redux/countrySlice";

export default function LocationRedirect() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const storedCountry = useSelector((state) => state.country?.country);

  useEffect(() => {
    const detectLocation = async () => {
      try {
        const res = await fetch("https://ipwho.is/");
        const data = await res.json();
        let country = data.country?.toLowerCase().replace(/\s+/g, "-");

        const supported = [
          "sri-lanka",// 01 defuld counrty
  "uae",//02 gulf country
  "saudi-arabia",// 03 gulf country
  "qatar",// 04 gulf country
  "oman",// 05 gulf country
  "kuwait",// 06 gulf country
  "bahrain",// 07 gulf country
  "india",// 08 main country
  "bangladesh",// 09 neighbor country
  "pakistan",// 10 neighbor country
  "nepal",// 11 neighbor country
  "malaysia",// 12 southeast asia
  "singapore",// 13 southeast asia
  "afghanistan",// 14 neighbor country
  "australia",// 15 oceania
  "maldives",// 16 neighbor country
  "united-kingdom",// 17 europe
  "thailand",// 18 southeast asia
  "indonesia",// 19 southeast asia
  "south-africa",// 20 africa
  "egypt",// 21 africa
  "turkey",// 22 europe/asia
  "japan",// 23
  "usa",// 24 north america / global reach
  "canada",// 25 north america / global reach
  "Germany",// 26 europe
  "france",// 27 europe
  "ireland",// 28 europe
  "south-korea",// 29
  "brazil",// 30 south america

        ];

        const fallbackMap = {
  "afghanistan": "afghanistan",
  "bangladesh": "bangladesh",
  "bhutan": "india",
  "india": "india",
  "maldives": "maldives",
  "nepal": "nepal",
  "pakistan": "pakistan",
  "sri-lanka": "sri-lanka",
  // Southeast Asia → nearest supported
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
  // Gulf / Middle East → nearest supported
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
  "yemen": "oman",
  "palestine": "uae",
  // East Asia
  "china": "japan",
  "japan": "japan",
  "north-korea": "south-korea",
  "south-korea": "south-korea",
  "taiwan": "japan",
  "mongolia": "japan",
  // Oceania
  "australia": "australia",
  "fiji": "australia",
  "new-zealand": "australia",
  "papua-new-guinea": "australia",
  "samoa": "australia",
  "tonga": "australia",
  "vanuatu": "australia",
  "kiribati": "australia",
"marshall-islands": "australia",
"micronesia": "australia",
"nauru": "australia",
"palau": "australia",
"solomon-islands": "australia",
"timor-leste": "australia",
"tuvalu": "australia",
  // Europe → nearest supported
  "austria": "germany",
  "belgium": "france",
  "croatia": "united-kingdom",
  "czech-republic": "germany",
  "denmark": "united-kingdom",
  "estonia": "united-kingdom",
  "finland": "united-kingdom",
  "france": "france",
  "germany": "germany",
  "greece": "united-kingdom",
  "hungary": "united-kingdom",
  "ireland": "ireland",
  "italy": "france",
  "latvia": "united-kingdom",
  "lithuania": "united-kingdom",
  "luxembourg": "france",
  "malta": "united-kingdom",
  "netherlands": "france",
  "norway": "united-kingdom",
  "poland": "germany",
  "portugal": "france",
  "romania": "united-kingdom",
  "serbia": "united-kingdom",
  "slovakia": "germany",
  "slovenia": "united-kingdom",
  "spain": "france",
  "sweden": "united-kingdom",
  "switzerland": "germany",
  "turkey": "turkey",
  "uk": "united-kingdom",
  "united-kingdom": "united-kingdom",
  "ukraine": "germany",
  "belarus": "germany",
  "russia": "germany",
  "iceland": "united-kingdom",
  "monaco": "france",
  "andorra": "france",
  "liechtenstein": "switzerland",
  "albania": "united-kingdom",
"armenia": "uae",
"azerbaijan": "uae",
"bosnia-and-herzegovina": "united-kingdom",
"bulgaria": "united-kingdom",
"cyprus": "uae",
"georgia": "uae",
"kosovo": "united-kingdom",
"macedonia": "united-kingdom",
"moldova": "united-kingdom",
"montenegro": "united-kingdom",
"sanmarino": "france",
"vaticancity": "france",
  // Africa → nearest supported
  "algeria": "egypt",
  "angola": "south-africa",
  "benin": "south-africa",
  "botswana": "south-africa",
  "burkina-faso": "south-africa",
  "burundi": "south-africa",
  "cameroon": "south-africa",
  "cape-verde": "south-africa",
  "central-african-republic": "south-africa",
  "chad": "south-africa",
  "comoros": "south-africa",
  "congo-brazzaville": "south-africa",
  "congo-kinshasa": "south-africa",
  "djibouti": "south-africa",
  "egypt": "egypt",
  "equatorial-guinea": "south-africa",
  "eritrea": "south-africa",
  "eswatini": "south-africa",
  "ethiopia": "south-africa",
  "gabon": "south-africa",
  "gambia": "south-africa",
  "ghana": "south-africa",
  "guinea": "south-africa",
  "guinea-bissau": "south-africa",
  "kenya": "south-africa",
  "lesotho": "south-africa",
  "liberia": "south-africa",
  "libya": "egypt",
  "madagascar": "south-africa",
  "malawi": "south-africa",
  "mali": "south-africa",
  "mauritania": "south-africa",
  "mauritius": "south-africa",
  "morocco": "egypt",
  "mozambique": "south-africa",
  "namibia": "south-africa",
  "niger": "south-africa",
  "nigeria": "south-africa",
  "rwanda": "south-africa",
  "senegal": "south-africa",
  "seychelles": "south-africa",
  "sierra-leone": "south-africa",
  "somalia": "south-africa",
  "south-africa": "south-africa",
  "south-sudan": "south-africa",
  "sudan": "egypt",
  "tanzania": "south-africa",
  "togo": "south-africa",
  "tunisia": "egypt",
  "uganda": "south-africa",
  "zambia": "south-africa",
  "zimbabwe": "south-africa",
  "morocco": "egypt",
  "western-sahara": "egypt",
  "sao-tome-and-principe": "south-africa",
  // North America
  "usa": "usa",
  "canada": "canada",
  "mexico": "usa",
  "greenland": "canada",
  "belize": "usa",
  "costa-rica": "usa",
  "el-salvador": "usa",
  "guatemala": "usa",
  "honduras": "usa",
  "nicaragua": "usa",
  "panama": "usa",
  "jamaica": "usa",
  "bahamas": "usa",
  "cuba": "usa",
  "dominican-republic": "usa",
  "haiti": "usa",
  "barbados": "usa",
  "trinidad-and-tobago": "usa",
  // South America
  "argentina": "brazil",
  "bolivia": "brazil",
  "brazil": "brazil",
  "chile": "brazil",
  "colombia": "brazil",
  "ecuador": "brazil",
  "guyana": "brazil",
  "paraguay": "brazil",
  "peru": "brazil",
  "suriname": "brazil",
  "uruguay": "brazil",
  "venezuela": "brazil",
  // Central Asia → nearest supported
  "kazakhstan": "pakistan",
  "kyrgyzstan": "pakistan",
  "tajikistan": "pakistan",
  "turkmenistan": "pakistan",
  "uzbekistan": "pakistan",
  //Caribbean & Central America (Additional)
  "antigua-and-barbuda": "usa",
"dominica": "usa",
"grenada": "usa",
"saint-kitts-and-nevis": "usa",
"saint-lucia": "usa",
"saint-vincent-and-the-grenadines": "usa",
        };

        if (supported.includes(country)) {
          // country is already valid
        } else if (fallbackMap[country]) {
          country = fallbackMap[country];
        } else {
          country = "india";
        }

        // Save to Redux
        console.log("Setting country to:", country);
        dispatch(setCountry(country));

        // Redirect if needed
        const pathCountry = location.pathname.split("/")[1];
        if (!location.pathname.includes("/viewallads/") || pathCountry !== country) {
          navigate(`/${country}/viewallads`, { replace: true });
        }
      } catch (error) {
        console.log("Geo location error:", error);
        dispatch(setCountry("india"));
        navigate("/india/viewallads", { replace: true });
      }
    };

    // Run detection if country is null or not in URL
    if (!storedCountry || storedCountry === "null") {
      console.log("No stored country, detecting location...");
      detectLocation();
    } else {
      // If we have a stored country, ensure URL matches
      const pathCountry = location.pathname.split("/")[1];
      if (!location.pathname.includes("/viewallads/") || pathCountry !== storedCountry) {
        navigate(`/${storedCountry}/viewallads/`, { replace: true });
      }
    }
  }, [dispatch, navigate, location.pathname, storedCountry]);
  
  return null;
}