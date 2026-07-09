import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useGlobalVideoCall } from '@/features/video-call/context/GlobalVideoCallProvider';
import { syncGameState, setGameState } from '../store/pictureItSlice';

export const usePictureItSync = () => {
  const dispatch = useDispatch();
  const { videoChatConnection, isSignalRConnected, sessionId, currentUserId } = useGlobalVideoCall();
  const pictureItState = useSelector((state) => state.pictureIt);

  useEffect(() => {
    if (!videoChatConnection || !isSignalRConnected) return;

    const handleSync = (sessId, senderId, statePayload) => {
      if (Number(sessId) !== Number(sessionId)) return;
      if (senderId === currentUserId) return; // Ignore own echoes

      try {
        const payload = JSON.parse(statePayload);
        dispatch(syncGameState(payload));
      } catch (err) {
        console.error('Failed to parse Picture IT state payload', err);
      }
    };

    const handleAction = (sessId, senderId, actionType, payload) => {
      if (Number(sessId) !== Number(sessionId)) return;
      if (senderId === currentUserId) return;

      try {
        const data = payload ? JSON.parse(payload) : null;
        if (actionType === 'START_GAME') {
          // You could dispatch actions based on the actionType
          dispatch(setGameState('Setup'));
        }
      } catch (err) {
        console.error('Failed to parse Picture IT action payload', err);
      }
    };

    videoChatConnection.on('OnSyncGameState', handleSync);
    videoChatConnection.on('OnGameAction', handleAction);

    return () => {
      videoChatConnection.off('OnSyncGameState', handleSync);
      videoChatConnection.off('OnGameAction', handleAction);
    };
  }, [videoChatConnection, isSignalRConnected, sessionId, currentUserId, dispatch]);

  const broadcastState = useCallback(() => {
    if (videoChatConnection && isSignalRConnected && pictureItState.isHost) {
      const payload = JSON.stringify(pictureItState);
      videoChatConnection.invoke('SyncGameState', Number(sessionId), payload)
        .catch(err => console.error('Error syncing game state', err));
    }
  }, [videoChatConnection, isSignalRConnected, sessionId, pictureItState]);

  const broadcastAction = useCallback((actionType, data = null) => {
    if (videoChatConnection && isSignalRConnected) {
      const payload = data ? JSON.stringify(data) : "";
      videoChatConnection.invoke('BroadcastGameAction', Number(sessionId), actionType, payload)
        .catch(err => console.error('Error broadcasting game action', err));
    }
  }, [videoChatConnection, isSignalRConnected, sessionId]);

  return { broadcastState, broadcastAction };
};

export default usePictureItSync;
