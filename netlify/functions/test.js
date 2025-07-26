// netlify/functions/test.js
export const handler = async () => {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Test successful!" })
  };
};