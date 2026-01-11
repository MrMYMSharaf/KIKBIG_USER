import { store } from "../store/store";
import { postadvertisementApi } from "../features/postadsSlice";

/**
 * Convert File object to base64 string
 */
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    if (file.base64) {
      resolve(file.base64);
      return;
    }
    if (file instanceof File) {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    } else {
      reject(new Error("Invalid file format"));
    }
  });
};

export const uploadAdData = async (adData) => {
  try {
    console.log("📤 uploadAdData called with:", adData);

    // ✅ Basic validations
    if (!adData.title) throw new Error("title is required but missing");
    if (!adData.description) throw new Error("description is required but missing");
    if (adData.price === undefined || adData.price === null) throw new Error("price is required but missing");
    if (!adData.category) throw new Error("category is required but missing");
    if (!adData.typeofads) throw new Error("typeofads is required but missing");
    if (!adData.accountType) throw new Error("accountType is required but missing");

    // 🔥 NEW: Validate page when posting as page
    if (adData.accountType === 'page' && !adData.page) {
      throw new Error("page is required when accountType is 'page'");
    }

    // ✅ Convert images to base64
    let base64Images = [];
    if (adData.images && adData.images.length > 0) {
      console.log(`📸 Converting ${adData.images.length} images to base64...`);
      const results = await Promise.all(
        adData.images.map(async (image, index) => {
          try {
            const base64 = await fileToBase64(image);
            console.log(`✅ Converted image ${index + 1}`);
            return base64;
          } catch (error) {
            console.error(`❌ Failed to convert image ${index + 1}:`, error);
            return null;
          }
        })
      );
      base64Images = results.filter((img) => img !== null);
      console.log(`✅ Successfully converted ${base64Images.length}/${adData.images.length} images`);
    }

    // ✅ Build payload
    const payload = {
      title: adData.title,
      description: adData.description,
      price: Number(adData.price),
      category: adData.category,
      images: base64Images,
      accountType: adData.accountType, // 🔥 'user' or 'page'
      typeofads: adData.typeofads, // 🔥 'Advertisement', 'Needs', or 'Offers'
    };

    console.log("🔥 typeofads value being sent:", payload.typeofads);
    console.log("🔥 accountType value being sent:", payload.accountType);

    // 🔥 NEW: If posting as page, include page ID
    if (adData.accountType === 'page' && adData.page) {
      payload.page = adData.page; // This is the page ObjectId
      console.log("📄 Posting as page with ID:", payload.page);
    }

    // ✅ Include contact info if available
    if (adData.contact && Object.values(adData.contact).some(Boolean)) {
      payload.contact = {};
      if (adData.contact.phone) payload.contact.phone = adData.contact.phone;
      if (adData.contact.whatsapp) payload.contact.whatsapp = adData.contact.whatsapp;
      if (adData.contact.email) payload.contact.email = adData.contact.email;
      if (adData.contact.telegram) payload.contact.telegram = adData.contact.telegram;
    }

    // ✅ Optional fields
    if (adData.adType) payload.adType = adData.adType;
    if (adData.childCategory) payload.childCategory = adData.childCategory;
    if (adData.language) payload.language = adData.language;
    if (adData.status) payload.status = adData.status;

    // ✅ Include specialQuestions if available
    if (adData.specialQuestions && Object.keys(adData.specialQuestions).length > 0) {
      payload.specialQuestions = adData.specialQuestions;
    }

    // ✅ Include location info
    if (
      adData.country || adData.region || adData.state || adData.province ||
      adData.district || adData.county || adData.subDistrict || adData.localAdministrativeUnit ||
      adData.municipality || adData.town || adData.village
    ) {
      payload.location = {};
      if (adData.country) payload.location.country = adData.country;
      if (adData.region) payload.location.region = adData.region;
      if (adData.state) payload.location.state = adData.state;
      if (adData.province) payload.location.province = adData.province;
      if (adData.district) payload.location.district = adData.district;
      if (adData.county) payload.location.county = adData.county;
      if (adData.subDistrict) payload.location.sub_district = adData.subDistrict;
      if (adData.localAdministrativeUnit) payload.location.local_admin = adData.localAdministrativeUnit;
      if (adData.municipality) payload.location.municipality = adData.municipality;
      if (adData.town) payload.location.town = adData.town;
      if (adData.village) payload.location.village = adData.village;
    }

    console.log("📋 Final payload:", {
      ...payload,
      images: `[${payload.images?.length || 0} base64 images]`,
      accountType: payload.accountType,
      page: payload.page || 'N/A',
      typeofads: payload.typeofads,
    });

    // ✅ Dispatch RTK Query endpoint
    const result = await store.dispatch(
      postadvertisementApi.endpoints.startadvertisement.initiate(payload)
    ).unwrap();

    console.log("✅ Upload successful:", result);
    
    // 🔥 Extract and store the uploaded ad ID
    const uploadedAdId = result?.data?._id || result?._id;
    
    if (uploadedAdId) {
      console.log("📌 Storing uploaded ad ID:", uploadedAdId);
      
      // Import setUploadedAdId
      const { setUploadedAdId } = await import("../features/redux/adPostSlice");
      store.dispatch(setUploadedAdId(uploadedAdId));
    } else {
      console.warn("⚠️ No ad ID found in response:", result);
    }
    
    // 🔥 Log the final saved data
    if (result?.data) {
      console.log("✅ Advertisement saved with:", {
        id: result.data._id,
        accountType: result.data.accountType,
        pageId: result.data.pageId,
        typeofads: result.data.typeofads,
      });
    }
    
    return result;

  } catch (error) {
    console.error("❌ Upload error:", error);
    if (error.data) console.error("❌ Server error response:", error.data);
    if (error.status) console.error("❌ HTTP status:", error.status);
    throw error;
  }
};