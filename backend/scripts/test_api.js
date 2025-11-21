import axios from 'axios';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import { User } from '../models/user.model.js';
import { Room } from '../models/room.model.js';
import { Participant } from '../models/participant.model.js';
import { CodeHistory } from '../models/codeHistory.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const PORT = process.env.PORT || 5000;
const API_URL = `http://localhost:${PORT}/api/v1`;
const MONGO_URI = process.env.MONGODB_URI;

const testUser1 = {
    name: "Test Owner",
    email: "owner@test.com",
    password: "password123"
};

const testUser2 = {
    name: "Test Viewer",
    email: "viewer@test.com",
    password: "password123"
};

let ownerToken = "";
let viewerToken = "";
let roomId = "";

const log = (msg, type = 'info') => {
    const color = type === 'error' ? '\x1b[31m' : type === 'success' ? '\x1b[32m' : '\x1b[37m';
    console.log(`${color}[${type.toUpperCase()}] ${msg}\x1b[0m`);
};

const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        log("Connected to MongoDB", 'success');
    } catch (error) {
        log("MongoDB Connection Failed: " + error.message, 'error');
        process.exit(1);
    }
};

const registerAndVerify = async (user) => {
    try {
        // 1. Register
        try {
            await axios.post(`${API_URL}/users/register`, user);
            log(`Registered ${user.email}`, 'success');
        } catch (error) {
            if (error.response?.status === 409) {
                log(`${user.email} already exists, proceeding...`, 'info');
            } else {
                throw error;
            }
        }

        // 2. Manually Verify in DB
        await User.findOneAndUpdate({ email: user.email }, { isVerified: true });
        log(`Verified ${user.email} in DB`, 'success');

    } catch (error) {
        log(`Registration/Verification failed for ${user.email}: ${error.message}`, 'error');
        throw error;
    }
};

const login = async (user) => {
    try {
        const res = await axios.post(`${API_URL}/users/login`, { email: user.email, password: user.password });
        const cookies = res.headers['set-cookie'];
        let token = "";
        if (cookies) {
            token = cookies.find(c => c.startsWith('Token='));
        }
        log(`Logged in ${user.email}`, 'success');
        return token; // Return the cookie string
    } catch (error) {
        log(`Login failed for ${user.email}: ${error.message}`, 'error');
        throw error;
    }
};

const runTests = async () => {
    await connectDB();

    try {
        // --- Setup Users ---
        await registerAndVerify(testUser1);
        await registerAndVerify(testUser2);

        ownerToken = await login(testUser1);
        viewerToken = await login(testUser2);

        // --- Test 1: Create Room (Owner) ---
        try {
            const res = await axios.post(`${API_URL}/room/createRoom`, {
                name: "Test Room",
                maxParticipants: 5
            }, {
                headers: { Cookie: ownerToken }
            });
            roomId = res.data.room.roomId;
            log(`Room Created: ${roomId}`, 'success');
        } catch (error) {
            log(`Create Room Failed: ${error.message}`, 'error');
            throw error;
        }

        // --- Test 2: Join Room (Viewer) ---
        try {
            await axios.post(`${API_URL}/room/join`, { roomId }, {
                headers: { Cookie: viewerToken }
            });
            log(`Viewer joined room ${roomId}`, 'success');
        } catch (error) {
            log(`Join Room Failed: ${error.message}`, 'error');
        }

        // --- Test 3: Save Code (Owner) - Should Pass ---
        try {
            await axios.post(`${API_URL}/code/save-code`, {
                roomId,
                code: "console.log('Hello World');"
            }, {
                headers: { Cookie: ownerToken }
            });
            log(`Owner saved code successfully`, 'success');
        } catch (error) {
            log(`Owner save code failed: ${error.response?.data?.message || error.message}`, 'error');
        }

        // --- Test 4: Save Code (Viewer) - Should Fail ---
        try {
            await axios.post(`${API_URL}/code/save-code`, {
                roomId,
                code: "console.log('Hacked');"
            }, {
                headers: { Cookie: viewerToken }
            });
            log(`Viewer saved code (UNEXPECTED)`, 'error');
        } catch (error) {
            if (error.response?.status === 403) {
                log(`Viewer save code blocked as expected (403)`, 'success');
            } else {
                log(`Viewer save code failed with unexpected status: ${error.response?.status}`, 'error');
            }
        }

        // --- Test 5: Get History (Owner) - Should Pass ---
        try {
            const res = await axios.get(`${API_URL}/code/code-history/${roomId}`, {
                headers: { Cookie: ownerToken }
            });
            if (res.data.codeVersions.length > 0) {
                log(`Owner retrieved history (${res.data.codeVersions.length} versions)`, 'success');
            } else {
                log(`Owner retrieved history but it was empty`, 'info');
            }
        } catch (error) {
            log(`Owner get history failed: ${error.message}`, 'error');
        }

        // --- Test 6: Get History (Viewer) - Should Fail ---
        try {
            await axios.get(`${API_URL}/code/code-history/${roomId}`, {
                headers: { Cookie: viewerToken }
            });
            log(`Viewer retrieved history (UNEXPECTED)`, 'error');
        } catch (error) {
            if (error.response?.status === 403) {
                log(`Viewer get history blocked as expected (403)`, 'success');
            } else {
                log(`Viewer get history failed with unexpected status: ${error.response?.status}`, 'error');
            }
        }

    } catch (error) {
        log(`Test Suite Failed: ${error.message}`, 'error');
    } finally {
        // --- Cleanup ---
        log("Cleaning up...", 'info');
        if (roomId) {
            const room = await Room.findOne({ roomId });
            if (room) {
                await Participant.deleteMany({ room: room._id });
                await CodeHistory.deleteMany({ room: room._id });
                await Room.deleteOne({ _id: room._id });
                log("Room and related data deleted", 'success');
            }
        }
        await User.deleteOne({ email: testUser1.email });
        await User.deleteOne({ email: testUser2.email });
        log("Test users deleted", 'success');

        await mongoose.disconnect();
    }
};

runTests();
