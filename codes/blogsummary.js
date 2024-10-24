async function sha(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
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
  if (!element) {
    console.error(`Element with id "${elementId}" not found`);
    return;
  }
  const writeLetter = () => {
    if (index < text.length) {
      element.textContent += text.charAt(index);
      index++;
      requestAnimationFrame(writeLetter);
    }
  };
  writeLetter();
}

async function ai_gen() {
  const outputContainer = document.getElementById("ai-output");
  if (!outputContainer) {
    throw new Error('Element with id "ai-output" not found');
  }

  const postTitle = document.title;
  const postContentRaw = document.getElementById("content").innerText;
  const postContent = cleanText(postContentRaw);

  const postData = {
    title: postTitle,
    content: postContent,
  };

  const postContentJson = JSON.stringify(postData);
  const postContentSign = await sha(postContentJson);

  const metaTags = document.getElementsByTagName("meta");

  let ogUrl = null;
  for (let i = 0; i < metaTags.length; i++) {
    if (metaTags[i].getAttribute("property") === "og:url") {
      ogUrl = metaTags[i].getAttribute("content");
      break;
    }
  }

  if (ogUrl) {
    const checkUploadedUrl = `https://summary.vandee.art/is_uploaded?id=${encodeURIComponent(
      ogUrl
    )}&sign=${postContentSign}`;
    const getSummaryUrl = `https://summary.vandee.art/get_summary?id=${encodeURIComponent(
      ogUrl
    )}&sign=${postContentSign}`;
    const uploadBlogUrl = new URL("https://summary.vandee.art/upload_blog");
    uploadBlogUrl.search = new URLSearchParams({
      id: encodeURIComponent(location.href),
    });

    try {
      const uploadedResponse = await fetch(checkUploadedUrl);
      if (!uploadedResponse.ok) {
        throw new Error(`Check uploaded error: status ${uploadedResponse.status}`);
      }
      const uploaded = await uploadedResponse.text();

      if (uploaded === "yes") {
        const summaryResponse = await fetch(getSummaryUrl);
        const summaryText = await summaryResponse.text();
        typeWriter(summaryText, "ai-output");
      } else {
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
        const summaryResponse = await fetch(getSummaryUrl);
        const summaryText = await summaryResponse.text();
        typeWriter(summaryText, "ai-output");
      }
    } catch (error) {
      console.error("Error:", error);
      outputContainer.textContent = "Error: " + error.message;
    }
  } else {
    console.log("No og:url found on the page.");
  }
}

document.addEventListener("DOMContentLoaded", ai_gen);
