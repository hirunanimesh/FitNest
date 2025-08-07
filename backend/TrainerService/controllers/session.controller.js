import { addsession,deletesession, getallsessions, getsessionbysessionid, updatesession} from "../services/session.service.js";


export const addSession = async (req, res) => {
    try {
        const session = await addsession(req.body);
        if (session) {
            res.status(200).json({ message: "Trainer session created successfully", session });
        }
    } catch (error) {
        console.error("Error creating session:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

export const getAllSession = async (req, res) => {
    try {
        const sessions = await getallsessions()
        if (sessions) {
            res.status(200).json({ message: "Trainer session retrieved successfully", sessions });
        } else {
            res.status(404).json({ message: "No session  found" });
        }
    } catch (error) {
        console.error("Error retrieving trainer session:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

export const getSessionBySessionId = async (req, res) => {
    const { sessionId } = req.params;
    try {
        const session = await getsessionbysessionid(sessionId)
        if (session) {
            res.status(200).json({ message: "Trainer Session retrieved successfully", session });
        } else {
            res.status(404).json({ message: "Trainer Session not found" });
        }
    } catch (error) {
        console.error("Error retrieving Trainer Session:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

export const updatedSession = async (req, res) => {
    const { sessionId } = req.params;
    try {
        const updatedSession = await updatesession(sessionId, req.body);
        if (updatedSession) {
            res.status(200).json({ message: "Trainer Session updated successfully", updatedSession });
        } else {
            res.status(404).json({ message: "Trainer Session not found" });
        }
    } catch (error) {
        console.error("Error updating session plan:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

export const deleteSession = async (req, res) => {
    const { sessionId } = req.params;
    try {
        const deletesession = await deletesession(sessionId);
        if(deletesession){
            res.status(200).json({ message: "Trainer Session deleted successfully" });
        }else{
            res.status(404).json({ message: "Trainer Session not found" });
        }

    } catch (error) {
        console.error("Error deleting session:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

