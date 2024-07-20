async function sha(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}

function cleanText(text) {
  let cleanedText = text.replace(/<[^>]*>?/gm, "");
  cleanedText = cleanedText.replace(/\s+/g, " ").trim();
  return cleanedText;
}

  async function typeWriter(text, elementId) {
    document.getElementById("aitext").style.display = "none";
    let index = 0;
    const element = document.getElementById(elementId);
    const writeLetter = () => {
      if (index < text.length) {
        element.textContent += text.charAt(index);
        index++;
        setTimeout(writeLetter, 100); // 调整时间来控制打字速度
      }
    };
    writeLetter();
  }



async function ai_gen() {
  const postTitle = document.title;
  const postContentRaw = document.getElementsByClassName("blog-content")[0].innerText;
  const postContent = cleanText(postContentRaw);

  const postData = {
    title: postTitle,
    content: postContent,
  };

  const postContentJson = JSON.stringify(postData);
  const postContentSign = await sha(postContentJson);

  const outputContainer = document.getElementById("ai-output");

  const checkUploadedUrl = `https://summary.vandee.art/is_uploaded?id=${encodeURIComponent(location.href)}&sign=${postContentSign}`;
  const getSummaryUrl = `https://summary.vandee.art/get_summary?id=${encodeURIComponent(location.href)}&sign=${postContentSign}`;

  try {
    const [uploadedResponse, summaryResponse] = await Promise.all([
      fetch(checkUploadedUrl),
      fetch(getSummaryUrl),
    ]);

    if (!uploadedResponse.ok) {
      throw new Error(`Check uploaded error: status ${uploadedResponse.status}`);
    }

    const uploaded = await uploadedResponse.text();

    if (uploaded === "yes") {
      const summaryText = await summaryResponse.text();
      typeWriter(summaryText, "ai-output");
    } else {
      const uploadBlogUrl = new URL("https://summary.vandee.art/upload_blog");
      uploadBlogUrl.search = new URLSearchParams({ id: encodeURIComponent(location.href) });

      const uploadResponse = await fetch(uploadBlogUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: postContentJson,
      });

      if (!uploadResponse.ok) {
        throw new Error(`Upload blog error: status ${uploadResponse.status}`);
      }

      const summaryText = await summaryResponse.text();
      typeWriter(summaryText, "ai-output");
    }
  } catch (error) {
    console.error("Error:", error);
    outputContainer.textContent = "Error: " + error.message;
  }
}

document.addEventListener("DOMContentLoaded", ai_gen);
