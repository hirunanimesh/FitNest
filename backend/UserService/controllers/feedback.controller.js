export const submitFeedback = async (req, res) => {
  try {
    const { gymId, trainerId, platform, rating, comment } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({ error: "Rating and comment are required" });
    }

    // Save to a feedback DB (you can use Supabase, or store it locally if simple)
    // For now let's assume saving to local JSON or memory
    const feedback = { gymId, trainerId, platform, rating, comment, date: new Date() };

    // Example: store in-memory (replace with DB logic)
    console.log("Feedback Received:", feedback);

    res.status(201).json({ message: "Feedback submitted successfully", feedback });
  } catch (err) {
    console.error("Error submitting feedback:", err);
    res.status(500).json({ error: "Server error" });
  }
};
