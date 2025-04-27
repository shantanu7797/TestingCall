import dotenv from "dotenv";
dotenv.config();

export const environment = process.env.NODE_ENV || "development";
export const port = process.env.PORT || "5000";
export const serverUrl = process.env.SERVER_URL?.trim() || "https://testingcall.onrender.com";

export const db = {
  name: process.env.DB_NAME || "zenChat",
  url: "mongodb+srv://shantanukumar294212:2NZEUvAOAtHiT6hq@cluster00.l9hjn.mongodb.net",
  minPoolSize: parseInt(process.env.DB_MIN_POOL_SIZE || "5"),
  maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE || "10"),
};

// spliting the corlUrl and return url string array
export const corsUrl = process.env.CORS_URL?.split(",") || "https://zenchats.netlify.app";
console.log(corsUrl);

export const cookieValidity = process.env.COOKIE_VALIDITY_SEC || "172800";

export const tokenInfo = {
  jwtSecretKey: process.env.JWT_SECRET_KEY || "ad9acf5d38a4449da367f5767f756f5769dba841a4f339681f0a74bc7b014f9876cba55f48563fd",
  accessTokenValidity: parseInt(process.env.ACCESS_TOKEN_VALIDITY_SEC || "182800"),
  refreshTokenValidity: parseInt(process.env.REFRESH_TOKEN_VALIDITY_SEC || "604800"),
  issuer: process.env.TOKEN_ISSUER || "",
  audience: process.env.TOKEN_AUDIENCE || "",
};
