// ==================== CONFIG ====================
// ✅ MUST MATCH YOUR REAL DEPLOYMENT

const INPUT_BUCKET = "iam-input-dev";
const REGION = "ap-south-1";
const API_LIST_URL = "https://1gg8mw3db3.execute-api.ap-south-1.amazonaws.com/Prod/images";

// =================================================

const fileInput = document.getElementById("file");
const form = document.getElementById("upload-form");
const listBtn = document.getElementById("list-btn");
const results = document.getElementById("results");
const statusText = document.getElementById("upload-status");
const formatSelect = document.getElementById("format");
const qualitySelect = document.getElementById("quality");

// ✅ UPLOAD HANDLER
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const file = fileInput.files[0];
  if (!file) {
    alert("Please select a file.");
    return;
  }

  const key = `uploads/${Date.now()}_${file.name}`;

  // ✅ REGION-SPECIFIC S3 ENDPOINT (CRITICAL FIX)
  const uploadUrl = `https://${INPUT_BUCKET}.s3.${REGION}.amazonaws.com/${key}`;

  statusText.textContent = "Uploading image...";

  try {
    const res = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type
      },
      body: file
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("S3 Error Response:", text);
      throw new Error(`Upload failed: ${res.status}`);
    }

    statusText.textContent = "✅ Upload successful. Image is being optimized...";
    fileInput.value = "";
  } catch (err) {
    console.error("UPLOAD FAILED:", err);
    statusText.textContent = "❌ Upload failed. Check console for details.";
  }
});

// ✅ LIST OPTIMIZED IMAGES
listBtn.addEventListener("click", async () => {
  results.innerHTML = "Loading optimized images...";

  try {
    const res = await fetch(API_LIST_URL);
    const data = await res.json();

    results.innerHTML = "";

    Object.keys(data).forEach((size) => {
      const heading = document.createElement("h3");
      heading.textContent = size;
      results.appendChild(heading);

      data[size].forEach((item) => {
        const link = document.createElement("a");
        link.href = item.url;
        link.target = "_blank";
        link.textContent = `${item.key} (${Math.round(item.size / 1024)} KB)`;

        results.appendChild(link);
        results.appendChild(document.createElement("br"));
      });
    });

  } catch (err) {
    console.error("FETCH FAILED:", err);
    results.innerHTML = "❌ Failed to load optimized images.";
  }
});