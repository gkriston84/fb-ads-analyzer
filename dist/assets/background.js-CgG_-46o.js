console.log("[FB Ads Analyzer] Background script loaded");
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "analyzeAI") {
    handleAIAnalysis(request, sendResponse);
    return true;
  }
});
async function handleAIAnalysis(request, sendResponse) {
  try {
    console.log("[Background] Starting AI Analysis...");
    const { apiKey, systemPrompt, userContent } = request.payload;
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent }
        ]
      })
    });
    const data = await response.json();
    if (data.error) {
      throw new Error(data.error.message);
    }
    const analysis = data.choices[0].message.content;
    console.log("[Background] AI Analysis successful");
    sendResponse({ success: true, analysis });
  } catch (error) {
    console.error("[Background] AI Analysis failed:", error);
    sendResponse({ success: false, error: error.message });
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFja2dyb3VuZC5qcy1DZ0dfLTQ2by5qcyIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2JhY2tncm91bmQuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQmFja2dyb3VuZCBTZXJ2aWNlIFdvcmtlclxyXG5jb25zb2xlLmxvZygnW0ZCIEFkcyBBbmFseXplcl0gQmFja2dyb3VuZCBzY3JpcHQgbG9hZGVkJyk7XHJcblxyXG5jaHJvbWUucnVudGltZS5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIoKHJlcXVlc3QsIHNlbmRlciwgc2VuZFJlc3BvbnNlKSA9PiB7XHJcbiAgICBpZiAocmVxdWVzdC5hY3Rpb24gPT09ICdhbmFseXplQUknKSB7XHJcbiAgICAgICAgaGFuZGxlQUlBbmFseXNpcyhyZXF1ZXN0LCBzZW5kUmVzcG9uc2UpO1xyXG4gICAgICAgIHJldHVybiB0cnVlOyAvLyBLZWVwIG1lc3NhZ2UgY2hhbm5lbCBvcGVuIGZvciBhc3luYyByZXNwb25zZVxyXG4gICAgfVxyXG59KTtcclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUFJQW5hbHlzaXMocmVxdWVzdCwgc2VuZFJlc3BvbnNlKSB7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdbQmFja2dyb3VuZF0gU3RhcnRpbmcgQUkgQW5hbHlzaXMuLi4nKTtcclxuICAgICAgICBjb25zdCB7IGFwaUtleSwgc3lzdGVtUHJvbXB0LCB1c2VyQ29udGVudCB9ID0gcmVxdWVzdC5wYXlsb2FkO1xyXG5cclxuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKCdodHRwczovL2FwaS5vcGVuYWkuY29tL3YxL2NoYXQvY29tcGxldGlvbnMnLCB7XHJcbiAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICAgICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxyXG4gICAgICAgICAgICAgICAgJ0F1dGhvcml6YXRpb24nOiBgQmVhcmVyICR7YXBpS2V5fWBcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xyXG4gICAgICAgICAgICAgICAgbW9kZWw6IFwiZ3B0LTRvXCIsXHJcbiAgICAgICAgICAgICAgICBtZXNzYWdlczogW1xyXG4gICAgICAgICAgICAgICAgICAgIHsgcm9sZTogXCJzeXN0ZW1cIiwgY29udGVudDogc3lzdGVtUHJvbXB0IH0sXHJcbiAgICAgICAgICAgICAgICAgICAgeyByb2xlOiBcInVzZXJcIiwgY29udGVudDogdXNlckNvbnRlbnQgfVxyXG4gICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xyXG5cclxuICAgICAgICBpZiAoZGF0YS5lcnJvcikge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZGF0YS5lcnJvci5tZXNzYWdlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGFuYWx5c2lzID0gZGF0YS5jaG9pY2VzWzBdLm1lc3NhZ2UuY29udGVudDtcclxuICAgICAgICBjb25zb2xlLmxvZygnW0JhY2tncm91bmRdIEFJIEFuYWx5c2lzIHN1Y2Nlc3NmdWwnKTtcclxuICAgICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiB0cnVlLCBhbmFseXNpczogYW5hbHlzaXMgfSk7XHJcblxyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKCdbQmFja2dyb3VuZF0gQUkgQW5hbHlzaXMgZmFpbGVkOicsIGVycm9yKTtcclxuICAgICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfSk7XHJcbiAgICB9XHJcbn1cclxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLFFBQVEsSUFBSSw0Q0FBNEM7QUFFeEQsT0FBTyxRQUFRLFVBQVUsWUFBWSxDQUFDLFNBQVMsUUFBUSxpQkFBaUI7QUFDcEUsTUFBSSxRQUFRLFdBQVcsYUFBYTtBQUNoQyxxQkFBaUIsU0FBUyxZQUFZO0FBQ3RDLFdBQU87QUFBQSxFQUNYO0FBQ0osQ0FBQztBQUVELGVBQWUsaUJBQWlCLFNBQVMsY0FBYztBQUNuRCxNQUFJO0FBQ0EsWUFBUSxJQUFJLHNDQUFzQztBQUNsRCxVQUFNLEVBQUUsUUFBUSxjQUFjLFlBQVcsSUFBSyxRQUFRO0FBRXRELFVBQU0sV0FBVyxNQUFNLE1BQU0sOENBQThDO0FBQUEsTUFDdkUsUUFBUTtBQUFBLE1BQ1IsU0FBUztBQUFBLFFBQ0wsZ0JBQWdCO0FBQUEsUUFDaEIsaUJBQWlCLFVBQVUsTUFBTTtBQUFBLE1BQ2pEO0FBQUEsTUFDWSxNQUFNLEtBQUssVUFBVTtBQUFBLFFBQ2pCLE9BQU87QUFBQSxRQUNQLFVBQVU7QUFBQSxVQUNOLEVBQUUsTUFBTSxVQUFVLFNBQVMsYUFBWTtBQUFBLFVBQ3ZDLEVBQUUsTUFBTSxRQUFRLFNBQVMsWUFBVztBQUFBLFFBQ3hEO0FBQUEsTUFDQSxDQUFhO0FBQUEsSUFDYixDQUFTO0FBRUQsVUFBTSxPQUFPLE1BQU0sU0FBUztBQUU1QixRQUFJLEtBQUssT0FBTztBQUNaLFlBQU0sSUFBSSxNQUFNLEtBQUssTUFBTSxPQUFPO0FBQUEsSUFDdEM7QUFFQSxVQUFNLFdBQVcsS0FBSyxRQUFRLENBQUMsRUFBRSxRQUFRO0FBQ3pDLFlBQVEsSUFBSSxxQ0FBcUM7QUFDakQsaUJBQWEsRUFBRSxTQUFTLE1BQU0sU0FBa0IsQ0FBRTtBQUFBLEVBRXRELFNBQVMsT0FBTztBQUNaLFlBQVEsTUFBTSxvQ0FBb0MsS0FBSztBQUN2RCxpQkFBYSxFQUFFLFNBQVMsT0FBTyxPQUFPLE1BQU0sUUFBTyxDQUFFO0FBQUEsRUFDekQ7QUFDSjsifQ==
