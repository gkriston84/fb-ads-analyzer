const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const { OpenAI } = require("openai");

admin.initializeApp();

exports.analyzeAds = onRequest({ cors: true }, async (req, res) => {
    // 1. Verify Authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: Missing token' });
    }

    const idToken = authHeader.split('Bearer ')[1];

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const uid = decodedToken.uid;
        console.log(`User ${uid} requesting AI analysis.`);

        // Optional: Check if user is pro tier by reading Firestore
        // const userDoc = await admin.firestore().collection('users').doc(uid).get();
        // if (userDoc.data().tier !== 'pro') { ... }

    } catch (error) {
        console.error('Error verifying token:', error);
        return res.status(403).json({ error: 'Unauthorized: Invalid token' });
    }

    // 2. Get Request Data
    const { systemPrompt, userContent } = req.body;
    if (!userContent) {
        return res.status(400).json({ error: 'Missing content to analyze' });
    }

    // 3. Call OpenAI
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        console.error('OpenAI API Key not configured');
        return res.status(500).json({ error: 'Server configuration error' });
    }

    try {
        const openai = new OpenAI({ apiKey });
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemPrompt || "You are a helpful assistant." },
                { role: "user", content: userContent }
            ],
        });

        const analysis = completion.choices[0].message.content;
        return res.json({ success: true, analysis });

    } catch (error) {
        console.error('OpenAI API Error:', error);
        return res.status(500).json({ error: 'AI Analysis failed', details: error.message });
    }
});
