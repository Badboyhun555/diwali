# दीपावली विश स्टूडियो (Cloudflare Pages)
Structure: index.html, styles.css, app.js, assets/og.png, _headers, _redirects

## ⚠️ Bot token frontend में (अस्थायी)
`app.js` की CONFIG में BOT_TOKEN/CHAT_ID है। यह **सबको दिखता है** (View Source)। कोई भी इससे आपके बॉट से spam भेज सकता है। अगर गलत इस्तेमाल हो: BotFather → `/revoke` से तुरंत नया टोकन लें। Private repo भी इसे नहीं बचाता क्योंकि साइट पर यह public सर्व होता है। जल्दी से functions/api/submit-lead.js में शिफ्ट करना सुरक्षित रास्ता है।

## Telegram bot
1. Telegram में @BotFather → `/newbot` → नाम व username → टोकन कॉपी।
2. अपने नए बॉट को खोलकर Start दबाएँ, कोई मैसेज भेजें।
3. `https://api.telegram.org/bot<TOKEN>/getUpdates` खोलें → `"chat":{"id":123456}` ही CHAT_ID है।
4. app.js में दोनों मान भरें।

## Banners
app.js में CONFIG.BANNERS में 6 सीधी https इमेज लिंक डालें (लिंक सीधे .jpg/.png खुलना चाहिए)। हर नई विश पर एक बैनर रैंडम चुनकर लिंक में `b=` नंबर के रूप में रहता है। लिंक preview के लिए index.html में `og:image` को अपने किसी बैनर की पूरी https लिंक से बदलें।

## Wish लिंक
KV/डेटाबेस नहीं है। लिंक ऐसा बनता है: `/?w=<नाम base64url>&b=<बैनर नंबर>`। नाम लिंक में ही रहता है (फ़ोन नंबर कभी नहीं)। लिंक कोई भी बदल सकता है, इसलिए नाम 2–40 अक्षर के नियम से जाँचा जाता है और सिर्फ textContent से दिखता है (XSS सुरक्षित)। Expiry और server-side rate limit अब नहीं हैं।

## Android से डिप्लॉय
GitHub ऐप/ब्राउज़र में नई repo बनाएँ → "Add file → Upload files" से सारे फोल्डर/फाइल डालें → Commit। Cloudflare → Workers & Pages → Create → Pages → Connect to Git → repo चुनें → Framework: None, build command खाली, output directory `/` → Deploy। 

## WhatsApp & preview
सिर्फ `wa.me` लिंक है (कोई WhatsApp API नहीं)। टेक्स्ट पहले से भरा आता है, इमेज attach नहीं होती। लिंक preview के लिए `assets/og.png` (static) लगी है। Preview हर लिंक पर एक जैसा रहेगा (static साइट में per-link preview संभव नहीं) और WhatsApp उसे cache करता है। इमेज को अपने डिज़ाइन से बदल सकते हैं।

## टेस्ट सूची
1. खाली/छोटा नाम, गलत नंबर (12345, 5xxxxxxxxx), बिना consent → हर बार error दिखे, कुछ न जाए।
2. सही डेटा → greeting खुले, URL में केवल `?wish=ID` हो, Telegram में नाम/नंबर/IST/लिंक आए।
3. लिंक नई incognito विंडो में खोलें → भेजने वाले का greeting, कोई फॉर्म/Telegram संदेश नहीं।
4. `?wish=abc` और बना हुआ गलत 16-अक्षर ID → "यह विश नहीं मिली" + नई बनाने का बटन।
5. WhatsApp बटन → चैट चयन में टेक्स्ट+लिंक; Copy बटन; sound बटन।
6. गलत टोकन रखें → विश बने पर Telegram संदेश न आए।
7. 360px चौड़ाई और desktop; OS में reduced-motion चालू करके जाँचें।
नोट: मैंने इसे deploy या Telegram पर टेस्ट नहीं किया है।
