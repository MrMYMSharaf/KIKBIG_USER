// src/functions/getDisplayImage.js

const getDisplayImage = ({ image, category = {}, childCategory = "", titleText = "", desc = "" }) => {
  const groomImage =
    "https://kikbigcom.s3.ap-south-1.amazonaws.com/matrimony/Gemini_Generated_Image_5tfavm5tfavm5tfa.png";
  const brideImage =
    "https://kikbigcom.s3.ap-south-1.amazonaws.com/matrimony/Gemini_Generated_Image_pxm3z0pxm3z0pxm3.png";
  const defaultMatrimonyImage =
    "https://kikbigcom.s3.ap-south-1.amazonaws.com/matrimony/default.png";
  const defaultGenericImage = "/bgimage/default.png";

  if (image) return image;

  let childName = "";

  // ✅ If category has children, find matching subcategory name
  if (category?.children?.length && childCategory) {
    const matchedChild = category.children.find(
      (child) => child._id?.toString() === childCategory?.toString()
    );
    if (matchedChild) {
      childName = matchedChild.name?.toLowerCase() || "";
    }
  }

  const catName = category?.name?.toLowerCase() || "";

  // 🧑 Groom detection
  if (
    childName.includes("groom") ||
    titleText.includes("groom") ||
    desc.includes("groom")
  ) {
    return groomImage;
  }

  // 👰 Bride detection
  if (
    childName.includes("bride") ||
    titleText.includes("bride") ||
    desc.includes("bride")
  ) {
    return brideImage;
  }

  // 💍 Matrimony general fallback
  if (
    catName.includes("matrimony") ||
    titleText.includes("matrimony") ||
    desc.includes("matrimony")
  ) {
    return defaultMatrimonyImage;
  }

  // 🖼️ Default generic
  return defaultGenericImage;
};

export default getDisplayImage;
