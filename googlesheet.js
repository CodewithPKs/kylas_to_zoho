const express = require("express");
const { google } = require("googleapis");
const app = express();
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const authenticateGoogleSheets = () => {
  const auth = new google.auth.GoogleAuth({
    keyFile: "Credentials.json",
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
};

exports.logErrorToGoogleSheet = async (data, sheetname) => {
  const sheets = authenticateGoogleSheets();
  await sheets.spreadsheets.values.append({
    spreadsheetId: "1bYO9ysHe2_WKfxzb0Dq11WUMax7AUwXNstRznyN2mIw",
    range: `${sheetname}!A1:Z`,
    valueInputOption: "USER_ENTERED",
    resource: { values: [data] },
  });
};
// exports.getAlphabetByIndex = async (index) => {
//   const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
//   if (index > 0 && index <= alphabet.length) {
//     return alphabet[index - 1];
//   } else {
//     return "Invalid index";
//   }
// };
// exports.logErrorToGoogleSheet = async (data, sheetname, lengthOfSheet) => {
//   const sheets = authenticateGoogleSheets();
//   const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
//   const columnIndex = lengthOfSheet + 1;
//   const columnLetter = alphabet[columnIndex - 1];
//   const range = `${sheetname}!A${lengthOfSheet + 1}:${columnLetter}${
//     lengthOfSheet + 1
//   }`;
//   await sheets.spreadsheets.values.append({
//     spreadsheetId: "1bYO9ysHe2_WKfxzb0Dq11WUMax7AUwXNstRznyN2mIw",
//     range,
//     valueInputOption: "USER_ENTERED",
//     resource: { values: [data] },
//   });
// };
