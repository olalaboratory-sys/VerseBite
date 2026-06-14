// Subtle haptic feedback (no-ops on web / unsupported devices).
import * as Haptics from 'expo-haptics';

export const hapticTap = () => { Haptics.selectionAsync().catch(() => {}); };
export const hapticLight = () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}); };
export const hapticSuccess = () => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {}); };
