import { create } from 'zustand';

export type SocketStatus = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';

interface SocketState {
  status: SocketStatus;
  joinedRooms: Set<string>;
  setStatus: (status: SocketStatus) => void;
  addRoom: (room: string) => void;
  removeRoom: (room: string) => void;
  reset: () => void;
}

export const useSocketStore = create<SocketState>((set) => ({
  status: 'idle',
  joinedRooms: new Set<string>(),
  setStatus: (status) => set({ status }),
  addRoom: (room) =>
    set((state) => {
      const next = new Set(state.joinedRooms);
      next.add(room);
      return { joinedRooms: next };
    }),
  removeRoom: (room) =>
    set((state) => {
      const next = new Set(state.joinedRooms);
      next.delete(room);
      return { joinedRooms: next };
    }),
  reset: () => set({ status: 'idle', joinedRooms: new Set<string>() }),
}));
