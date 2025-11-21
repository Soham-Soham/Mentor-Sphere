import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    room: null,
    participants: [],
}

const roomSlice = createSlice({
    name: "room",
    initialState,
    reducers: {
        setRoom: (state, action) => {
            state.room = action.payload.room;
            // If participantRoles is provided (from getRoomDetails), use it.
            // Otherwise fall back to room.participants (from createRoom/joinRoom)
            // Note: backend getRoomDetails returns {room, participantRoles}
            // backend createRoom/joinRoom returns {room} (where room.participants is array of ids or objects)

            state.participants = action.payload.participants || [];
        },
        clearRoom: (state) => {
            state.room = null;
            state.participants = [];
        },
        addParticipant: (state, action) => {
            state.participants.push(action.payload);
        },
        removeParticipant: (state, action) => {
            state.participants = state.participants.filter(
                (p) => {
                    // Handle both cases where p is the Participant document (has .user._id) or just a user object/ID
                    const participantId = p._id || p.user?._id;
                    // The action.payload might be the user ID to remove
                    return participantId !== action.payload && p.user?._id !== action.payload;
                }
            );
        },
        updateParticipantRole: (state, action) => {
            const { userId, role } = action.payload;
            const participant = state.participants.find(p => p.user._id === userId);
            if (participant) {
                participant.role = role;
            }
        }
    }
})

export const { setRoom, clearRoom, addParticipant, removeParticipant,updateParticipantRole } = roomSlice.actions;
export default roomSlice.reducer;

